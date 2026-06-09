import { OpenAI } from 'openai';
import dotenv from 'dotenv';
import { 
  getLead, 
  updateLead, 
  consultarDisponibilidade, 
  reservarDataTemporaria, 
  atualizarLeadScore, 
  aplicarEtiquetaCrm, 
  chamarHumano 
} from './crm.js';

dotenv.config();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
const LLM_MODEL = process.env.LLM_MODEL || 'qwen/qwen-2.5-7b-instruct';

let openaiClient = null;
if (OPENROUTER_API_KEY && OPENROUTER_API_KEY.startsWith('sk-')) {
  openaiClient = new OpenAI({
    apiKey: OPENROUTER_API_KEY,
    baseURL: 'https://openrouter.ai/api/v1',
    defaultHeaders: {
      'HTTP-Referer': 'https://recanto-eventos.vercel.app',
      'X-Title': 'Recanto Eventos Chatbot'
    }
  });
  console.log(`🤖 OpenAI/OpenRouter inicializado com o modelo: ${LLM_MODEL}`);
} else {
  console.log('⚠️ OPENROUTER_API_KEY ausente ou inválida. O chatbot rodará em Modo Simulação Local (Smart Fallback).');
}

const SYSTEM_PROMPT = `Você é a Naiara, Sócia & Comercial do Recanto do Açaí (Recanto Eventos) no Rio de Janeiro. 
Seu tom é carioca, acolhedor, profissional e focado em vendas (energia solar do Rio).
Sempre termine com uma pergunta direta ou de escolha dupla que guie o cliente nas próximas etapas do funil de vendas.

Você tem acesso a ferramentas comerciais para verificar disponibilidade e fazer reservas. Sempre use as ferramentas antes de responder sobre datas ou reservas.
Se o número de convidados for maior que 150 ou o cliente pedir suporte/atendente humano de forma clara, use a ferramenta chamar_humano imediatamente.

Regras de Precificação do Buffet (Açaí + Sorvete Gourmet e confeitos liberados):
1. Valor Base (Horas):
   - Express (3 Horas): R$ 1.290,00
   - Premium (4 Horas): R$ 1.390,00
2. Custo Adicional (Convidados):
   - Até 50 pessoas: +R$ 0,00
   - 50 a 80 pessoas: +R$ 250,00
   - 80 a 120 pessoas: +R$ 450,00
   - 120 a 150 pessoas: +R$ 650,00
   - Mais de 150 pessoas: Sob consulta (chame um humano).

Ao calcular o preço total, some o Valor Base com o Custo Adicional da faixa de convidados. Exemplo: 3 horas para 80 pessoas = R$ 1.290 (base) + R$ 250 (adicional) = R$ 1.540,00 total.`;

// Define tools schema for Qwen 2.5 Tool Calling
const TOOLS_DEFINITIONS = [
  {
    type: 'function',
    function: {
      name: 'consultar_disponibilidade',
      description: 'Consulta o calendário para verificar se a data do evento está livre.',
      parameters: {
        type: 'object',
        properties: {
          data: { type: 'string', description: 'Data do evento no formato DD/MM/AAAA ou AAAA-MM-DD.' },
          horario: { type: 'string', description: 'Horário sugerido (ex: 18:00).' }
        },
        required: ['data']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'reservar_data_temporaria',
      description: 'Cria uma reserva temporária válida por 24 horas no CRM.',
      parameters: {
        type: 'object',
        properties: {
          nome: { type: 'string', description: 'Nome do cliente.' },
          telefone: { type: 'string', description: 'Telefone ou WhatsApp do cliente.' },
          data: { type: 'string', description: 'Data do evento (DD/MM/AAAA ou AAAA-MM-DD).' },
          pacote: { type: 'string', description: 'Combo selecionado (Express 3h ou Premium 4h).' }
        },
        required: ['nome', 'data', 'pacote']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'atualizar_lead_score',
      description: 'Atualiza a pontuação de qualificação (score) do lead no CRM.',
      parameters: {
        type: 'object',
        properties: {
          score: { type: 'integer', description: 'Pontuação de 0 a 100 baseada nos dados fornecidos.' }
        },
        required: ['score']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'aplicar_etiqueta_crm',
      description: 'Aplica um status ou etiqueta específica ao lead no CRM.',
      parameters: {
        type: 'object',
        properties: {
          etiqueta: { type: 'string', description: 'Ex: [Lead Novo], [Orçamento em Andamento], [Lead Quente], [Aguardando Sinal], [Transbordo Humano]' }
        },
        required: ['etiqueta']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'chamar_humano',
      description: 'Transfere o atendimento para um consultor comercial humano.',
      parameters: {
        type: 'object',
        properties: {
          motivo: { type: 'string', description: 'Razão da transferência (ex: grande porte, pedido expresso do cliente).' }
        },
        required: ['motivo']
      }
    }
  }
];

export async function chatWithAgent(leadId, userMessage) {
  const lead = getLead(leadId);

  // Initialize conversation history in lead if not present
  if (!lead.conversation || lead.conversation.length === 0) {
    lead.conversation = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'assistant', content: 'Oi! Beleza? ☀️ Sou a Naiara, assistente virtual do Recanto Eventos. Qual é o seu nome pra gente começar a planejar a sua festa com o melhor buffet de açaí e sorvete do Rio? 🍨' }
    ];
  }

  // Push user message
  lead.conversation.push({ role: 'user', content: userMessage });

  // Update CRM logs
  updateLead(leadId, { logs: [`[User] ${userMessage}`] });

  let replyText = '';
  let updatedLead;

  // ──── CASE A: LLM RUNTIME ACTIVE ───────────────────────────
  if (openaiClient) {
    try {
      let runCount = 0;
      let keepRunning = true;

      while (keepRunning && runCount < 3) {
        runCount++;
        const response = await openaiClient.chat.completions.create({
          model: LLM_MODEL,
          messages: lead.conversation,
          tools: TOOLS_DEFINITIONS,
          tool_choice: 'auto',
          temperature: 0.7
        });

        const choice = response.choices[0];
        const message = choice.message;

        if (message.tool_calls && message.tool_calls.length > 0) {
          // Push assistant's tool call message
          lead.conversation.push(message);

          for (const tc of message.tool_calls) {
            const toolName = tc.function.name;
            const args = JSON.parse(tc.function.arguments);
            let toolOutput = {};

            console.log(`[LLM Tool Call] Executando ${toolName} com args:`, args);

            if (toolName === 'consultar_disponibilidade') {
              toolOutput = consultarDisponibilidade(leadId, args.data, args.horario);
            } else if (toolName === 'reservar_data_temporaria') {
              toolOutput = reservarDataTemporaria(leadId, args.nome, args.telefone || 'cliente_whatsapp', args.data, args.pacote);
            } else if (toolName === 'atualizar_lead_score') {
              toolOutput = atualizarLeadScore(leadId, args.score);
            } else if (toolName === 'aplicar_etiqueta_crm') {
              toolOutput = aplicarEtiquetaCrm(leadId, args.etiqueta);
            } else if (toolName === 'chamar_humano') {
              toolOutput = chamarHumano(leadId, args.motivo);
            }

            // Push tool output message
            lead.conversation.push({
              role: 'tool',
              tool_call_id: tc.id,
              name: toolName,
              content: JSON.stringify(toolOutput)
            });
          }
        } else {
          replyText = message.content;
          lead.conversation.push({ role: 'assistant', content: replyText });
          keepRunning = false;
        }
      }

      // Sync lead status
      updatedLead = updateLead(leadId, {});
    } catch (err) {
      console.error('[Agent Error] LLM Call failed:', err);
      // Fallback to local simulation on API error
      replyText = localMockSimulation(leadId, userMessage, lead);
      updatedLead = getLead(leadId);
    }
  } 
  // ──── CASE B: SMART FALLBACK MOCK (SIMULATION) ─────────────
  else {
    replyText = localMockSimulation(leadId, userMessage, lead);
    updatedLead = getLead(leadId);
  }

  // Save conversation history to CRM DB
  updateLead(leadId, { conversation: lead.conversation });

  return {
    reply: replyText,
    lead: updatedLead
  };
}

// ── SMART LOCAL SIMULATION (FALLBACK MODEL) ──────────────────

function localMockSimulation(leadId, message, lead) {
  const normalized = message.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  let l = lead;
  let replyText;

  // 1. Identify keywords and trigger tools locally
  // A. Name Extraction
  let nameMatch = message.match(/(?:meu nome e|me chamo|sou o|sou a)\s+([A-Za-zÀ-ÖØ-öø-ÿ\s]+)/i);
  if (nameMatch && nameMatch[1]) {
    const parsedName = nameMatch[1].trim().split(' ')[0];
    l = updateLead(leadId, { nome: parsedName });
  } else if (!l.nome && normalized.length < 15 && !normalized.includes("oi") && !normalized.includes("ola")) {
    const words = message.trim().split(" ");
    if (words.length === 1 && words[0][0] === words[0][0].toUpperCase()) {
      l = updateLead(leadId, { nome: words[0] });
    }
  }

  // B. Date Extraction
  let dateMatch = message.match(/(\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)/);
  if (dateMatch) {
    const dataStr = dateMatch[0];
    consultarDisponibilidade(leadId, dataStr);
    l = updateLead(leadId, { data: dataStr });
  }

  // C. Guests Extraction
  let guestsMatch = message.match(/(\d+)\s*(?:pessoas|convidados|gente)/i);
  if (guestsMatch) {
    const num = parseInt(guestsMatch[1]);
    l = updateLead(leadId, { convidados: num.toString() });
  }

  // D. Package Extraction
  if (normalized.includes("3h") || normalized.includes("3 horas") || normalized.includes("express")) {
    l = updateLead(leadId, { pacote: 'Express (3 Horas)' });
  } else if (normalized.includes("4h") || normalized.includes("4 horas") || normalized.includes("premium")) {
    l = updateLead(leadId, { pacote: 'Premium (4 Horas)' });
  }

  // E. Local Extraction
  const bairros = ["copacabana", "barra", "recreio", "ipanema", "leblon", "tijuca", "niteroi", "flamengo", "botafogo", "centro"];
  for (const b of bairros) {
    if (normalized.includes(b)) {
      l = updateLead(leadId, { local: b.charAt(0).toUpperCase() + b.slice(1) });
      break;
    }
  }

  // Sync conversation state back
  l.conversation = lead.conversation;

  // 2. Generate Conversation Response
  const requestsHuman = normalized.includes("humano") || normalized.includes("atendente") || normalized.includes("suporte") || normalized.includes("pessoa") || normalized.includes("ligar");
  const isLargeParty = l.convidados && parseInt(l.convidados) > 150;

  if (isLargeParty) {
    chamarHumano(leadId, `Festa grande: ${l.convidados} convidados`);
    l.status = '[Transbordo Humano]';
    replyText = `Pô, que bacana! Um evento lindo para ${l.convidados} convidados! 🥳[MSG_BREAK]Como é uma festa de grande porte, nós precisamos fazer um estudo de logística personalizado para garantir o açaí geladinho e sem filas.[MSG_BREAK]Estou acionando o nosso time comercial agora mesmo. Um atendente humano vai assumir o atendimento para te passar um desconto especial! Só um minutinho! 💜`;
  } else if (requestsHuman) {
    chamarHumano(leadId, `Solicitado diretamente pelo cliente`);
    l.status = '[Transbordo Humano]';
    replyText = `Com certeza! Sem problemas. Estou acionando um dos nossos consultores de eventos aqui do Recanto. Em instantes um humano vai te chamar por aqui, beleza? Tamo junto! 💜`;
  } else if (!l.nome) {
    replyText = `E aí, beleza? ☀️ Aqui é a Naiara, especialista de vendas do Recanto Eventos! Fico feliz demais com o contato.[MSG_BREAK]Pra gente começar a planejar o buffet de açaí e sorvete mais brabo do Rio pro seu evento, me conta: qual é o seu nome? 🍨`;
  } else if (!l.data) {
    replyText = `Prazer falar com você, ${l.nome}! 💜[MSG_BREAK]Me conta, qual é a data do seu evento? Assim eu já dou uma olhada na nossa agenda de finais de semana pra ver se tá liberado.`;
  } else if (!l.convidados) {
    replyText = `Maravilha, ${l.nome}! A data está livre aqui na agenda. E para quantas pessoas você está planejando essa festa? (Lembrando que nossos pacotes base atendem até 50 pessoas, mas cobrimos qualquer tamanho!)`;
  } else if (!l.pacote) {
    replyText = `Show! Anotado: ${l.convidados} convidados.[MSG_BREAK]Para esse tamanho de festa, você prefere o **Combo Carioca Express (3 horas de buffet)** ou o **Combo Redentor Premium (4 horas de buffet com adicionais extras)**?`;
  } else if (!l.local) {
    replyText = `Excelente escolha! E onde vai ser realizado o evento? Se tiver o bairro ou CEP aqui do Rio de Janeiro, eu já calculo o frete e te dou o valor fechadinho! 🛵`;
  } else if (!l.telefone) {
    replyText = `Perfeito! Já tenho quase todas as informações. Me passa seu WhatsApp/telefone para eu registrar no cadastro e te mandar o espelho do orçamento formatado? 📞`;
  } else if (l.status !== '[Aguardando Sinal]' && !l.intencaoPix) {
    let baseVal = l.pacote.includes("3") ? 1290 : 1390;
    let extraVal = 0;
    let convNum = parseInt(l.convidados);
    if (convNum > 50 && convNum <= 80) extraVal = 250;
    else if (convNum > 80 && convNum <= 120) extraVal = 450;
    else if (convNum > 120 && convNum <= 150) extraVal = 650;

    const totalVal = baseVal + extraVal;
    const formattedTotal = totalVal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    replyText = `Maneiro demais, ${l.nome}! Seu orçamento está pronto: o **${l.pacote}** para **${l.convidados} pessoas** em **${l.local}** fica no total de **${formattedTotal}**.[MSG_BREAK]Como a data de ${l.data} é super concorrida, quer que eu faça a reserva temporária dela de 24h sem custo pra você garantir? Para confirmar, a gente faz o Pix de 50% de sinal. O que acha? 💜`;
    
    if (normalized.includes("sim") || normalized.includes("quero") || normalized.includes("reserva") || normalized.includes("fechar") || normalized.includes("pix")) {
      reservarDataTemporaria(leadId, l.nome, l.telefone || 'cliente_whatsapp', l.data, l.pacote);
      const halfPrice = (totalVal / 2).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      replyText = `Perfeito, ${l.nome}! Já fiz a reserva temporária da sua data de ${l.data} por 24 horas! 🥳[MSG_BREAK]Para confirmar, nosso Pix CNPJ é: \`12.345.678/0001-90\` (Recanto Eventos Ltda).[MSG_BREAK]O valor do sinal de 50% fica em **${halfPrice}**.[MSG_BREAK]Assim que enviar, é só mandar o comprovante por aqui. Posso te ajudar em algo mais? 🍨💜`;
    }
  } else {
    replyText = `Opa, ${l.nome}! Já temos todos os dados do seu evento mapeados aqui no CRM. Seu lead está super quente! [MSG_BREAK]Nossa chave Pix CNPJ para o sinal de 50% é: \`12.345.678/0001-90\`. Se tiver mais alguma dúvida sobre acompanhamentos ou montagem, só me chamar! 🍨`;
  }

  // Push messages to history
  l.conversation.push({ role: 'assistant', content: replyText });
  return replyText;
}
