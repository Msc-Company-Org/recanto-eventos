import { useState, useEffect, useRef } from 'react';

const STORE_WHATSAPP_NUMBER = '5521981749450'; // WhatsApp comercial RJ

const BASE_PRICES = {
  '3': 1290.00,
  '4': 1390.00
};

const GUEST_EXTRA_COSTS = {
  '50': 0.00,
  '80': 250.00,
  '120': 450.00,
  '150': 650.00,
  '200': null // Sob consulta
};

export default function App() {
  // Navigation & Menu States
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  // Simulator States
  const [simDuration, setSimDuration] = useState('3'); // '3' ou '4'
  const [simGuests, setSimGuests] = useState('50');
  const [simTotal, setSimTotal] = useState(1290.00);

  // Choice Selection & Checkout Wizard States
  const [showChoiceModal, setShowChoiceModal] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState('form'); // 'form', 'summary', 'payment', 'success'
  const [paymentMethod, setPaymentMethod] = useState('pix'); // 'pix', 'card'
  const [paymentOption, setPaymentOption] = useState('sinal'); // 'sinal' (50%), 'integral' (100%)
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [checkoutData, setCheckoutData] = useState({
    email: '',
    cpf: '',
    cardName: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvc: ''
  });

  // FAQ Active Item State
  const [activeFaq, setActiveFaq] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    date: '',
    package: 'Express (3 Horas - R$ 1.290)',
    guests: 'Até 50',
    local: '',
    notes: ''
  });

  // Chatbot & CRM Simulator State
  const [chatOpen, setChatOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' or 'crm' for mobile
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'naiara',
      text: 'Oi! Beleza? ☀️ Sou a Naiara, assistente virtual do Recanto Eventos. Qual é o seu nome pra gente começar a planejar a sua festa com o melhor buffet de açaí e sorvete do Rio? 🍨',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [crmState, setCrmState] = useState({
    id: 'lead_rj_' + Math.random().toString(36).substring(2, 7),
    nome: '',
    telefone: '',
    data: '',
    convidados: '',
    pacote: '',
    local: '',
    disponibilidadeChecada: false,
    intencaoPix: false,
    status: '[Lead Novo]',
    score: 0,
    temperatura: 'Frio ❄️',
    logs: ['[System] CRM Inicializado para Novo Lead RJ']
  });

  // Sync main booking form data to Chatbot CRM State
  useEffect(() => {
    if (formData.name || formData.phone || formData.date || formData.local) {
      setCrmState(prev => {
        const updated = {
          ...prev,
          nome: formData.name || prev.nome,
          telefone: formData.phone || prev.telefone,
          data: formData.date ? formData.date.split('-').reverse().join('/') : prev.data,
          convidados: formData.guests === 'Até 50' ? '50' : formData.guests === '50 a 80' ? '80' : formData.guests === '80 a 120' ? '120' : formData.guests === '120 a 150' ? '150' : '200',
          pacote: formData.package ? formData.package.split('(')[0].trim() : prev.pacote,
          local: formData.local || prev.local
        };

        // Recalculate score
        let score = 0;
        if (updated.nome) score += 10;
        if (updated.telefone) score += 10;
        if (updated.data) score += 20;
        if (updated.convidados) score += 15;
        if (updated.pacote) score += 15;
        if (updated.local) score += 10;
        if (updated.disponibilidadeChecada) score += 10;
        if (updated.intencaoPix) score += 10;

        updated.score = score;
        updated.temperatura = score < 40 ? 'Frio ❄️' : score <= 75 ? 'Morno 🔥' : 'Quente 🌋';

        const newStatus = score >= 90
          ? (prev.intencaoPix ? '[Aguardando Sinal]' : '[Lead Quente]')
          : score >= 40
            ? '[Orçamento em Andamento]'
            : '[Lead Novo]';
        updated.status = newStatus;

        // Add logs for new details detected
        const newLogs = [...prev.logs];
        if (updated.nome && !prev.nome) newLogs.push(`[System] Nome capturado do formulário: ${updated.nome}`);
        if (updated.telefone && !prev.telefone) newLogs.push(`[System] Telefone capturado: ${updated.telefone}`);
        if (updated.data && !prev.data) {
          newLogs.push(`[System] Data capturada: ${updated.data}`);
          updated.disponibilidadeChecada = true;
          score += 10;
          updated.score = score;
          newLogs.push(`[Tool Call] consultar_disponibilidade(data="${updated.data}") -> Livre`);
        }
        updated.logs = newLogs;

        return updated;
      });
    }
  }, [formData]);

  const chatEndRef = useRef(null);
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const calculateScore = (data) => {
    let score = 0;
    if (data.nome) score += 10;
    if (data.telefone) score += 10;
    if (data.data) score += 20;
    if (data.convidados) score += 15;
    if (data.pacote) score += 15;
    if (data.local) score += 10;
    if (data.disponibilidadeChecada) score += 10;
    if (data.intencaoPix) score += 10;
    return score;
  };

  const getTemperature = (score) => {
    if (score < 40) return 'Frio ❄️';
    if (score <= 75) return 'Morno 🔥';
    return 'Quente 🌋';
  };

  const pushGTMEvent = (eventName, eventData) => {
    try {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: eventName,
        ...eventData
      });
      console.log(`[GTM Event] Pushed ${eventName}:`, eventData);

      // Direct Meta Pixel (fbq) standard tracking
      if (typeof window.fbq === 'function') {
        if (eventName === 'purchase_completed') {
          window.fbq('track', 'Purchase', {
            value: eventData.value || 0,
            currency: 'BRL',
            content_type: 'product',
            content_name: eventData.package_name
          });
        } else if (eventName === 'quote_form_submitted') {
          window.fbq('track', 'Lead', {
            content_category: 'Buffet Quote',
            content_name: eventData.event_package
          });
        } else if (eventName === 'simulator_applied') {
          window.fbq('track', 'ViewContent', {
            content_name: 'Buffet Simulator'
          });
        } else if (eventName === 'choice_modal_option_clicked' && eventData.option === 'checkout_online') {
          window.fbq('track', 'InitiateCheckout');
        }
      }

      // Direct TikTok Pixel (ttq) standard tracking
      if (typeof window.ttq === 'object' && typeof window.ttq.track === 'function') {
        if (eventName === 'purchase_completed') {
          window.ttq.track('CompletePayment', {
            value: eventData.value || 0,
            currency: 'BRL',
            content_name: eventData.package_name
          });
        } else if (eventName === 'quote_form_submitted') {
          window.ttq.track('SubmitForm', {
            content_name: 'Buffet Quote'
          });
        } else if (eventName === 'choice_modal_option_clicked' && eventData.option === 'checkout_online') {
          window.ttq.track('InitiateCheckout');
        } else if (eventName === 'social_icon_clicked' && eventData.platform === 'whatsapp') {
          window.ttq.track('Contact');
        }
      }

      // Direct Google Ads (gtag) standard tracking
      if (typeof window.gtag === 'function') {
        if (eventName === 'purchase_completed') {
          window.gtag('event', 'purchase', {
            transaction_id: eventData.transaction_id,
            value: eventData.value || 0,
            currency: 'BRL',
            items: [{ item_name: eventData.package_name }]
          });
        } else if (eventName === 'quote_form_submitted') {
          window.gtag('event', 'generate_lead', {
            value: eventData.estimated_value || 0,
            currency: 'BRL'
          });
        }
      }
    } catch (e) {
      console.error('[Tracking Error] Failed to push event:', e);
    }
  };

  const handleSendMessage = (textToSend = null) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    // 1. Add user message with absolute unique ID to prevent React warnings
    const userMsgId = 'user_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const userMsg = {
      id: userMsgId,
      sender: 'user',
      text: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputText('');

    // Trigger typing indicator
    setIsTyping(true);

    // Tenta conectar ao servidor de API em localhost:3000
    fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ leadId: crmState.id, message: text })
    })
    .then(async res => {
      if (!res.ok) throw new Error('Servidor indisponível');
      const data = await res.json();
      
      // Converte quebras de mensagens específicas do Evolution API/WhatsApp
      const cleanReply = data.reply.replace(/\[MSG_BREAK\]/g, '\n\n');

      setMessages(m => [...m, {
        id: 'naiara_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        sender: 'naiara',
        text: cleanReply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      
      // Atualiza o estado do CRM com os dados reais calculados na IA
      setCrmState(data.lead);
      setIsTyping(false);

      // Envia os eventos de GTM atualizados da IA do servidor
      pushGTMEvent('lead_score_updated', {
        lead_id: data.lead.id,
        score: data.lead.score,
        temperature: data.lead.temperatura,
        status: data.lead.status
      });

      if (data.lead.status === '[Transbordo Humano]') {
        pushGTMEvent('human_handoff_triggered', {
          lead_id: data.lead.id,
          reason: 'Ativado pelo Servidor de IA',
          score: data.lead.score
        });
      }
    })
    .catch(() => {
      console.log('⚠️ Backend offline ou erro de conexão. Ativando simulador local client-side...');
      
      // FALLBACK: Roda a simulação local offline antiga
      setTimeout(() => {
        setCrmState(prevCrm => {
          const normalized = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          let updatedCrm = { ...prevCrm };
          let toolCalls = [];

          const requestsHuman = normalized.includes("humano") || normalized.includes("atendente") || normalized.includes("suporte") || normalized.includes("pessoa") || normalized.includes("ligar");

          // Nome
          let nameMatch = text.match(/(?:meu nome e|me chamo|sou o|sou a)\s+([A-Za-zÀ-ÖØ-öø-ÿ]+)/i);
          if (nameMatch && nameMatch[1]) {
            updatedCrm.nome = nameMatch[1];
          } else if (normalized.startsWith("oi ") || normalized.startsWith("ola ")) {
            const words = text.split(" ");
            if (words.length === 2 && words[1][0] === words[1][0].toUpperCase()) {
              updatedCrm.nome = words[1];
            }
          }

          // Telefone
          let phoneMatch = text.match(/(\(?\d{2}\)?\s?\d{4,5}-?\d{4})/);
          if (phoneMatch) {
            updatedCrm.telefone = phoneMatch[0];
          }

          // Convidados
          let guestsMatch = text.match(/(\d+)\s*(?:pessoas|convidados|gente)/i);
          if (guestsMatch) {
            updatedCrm.convidados = guestsMatch[1];
          }

          // Data
          let dateMatch = text.match(/(\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)/);
          if (dateMatch) {
            updatedCrm.data = dateMatch[0];
          } else if (normalized.includes("outubro")) {
            updatedCrm.data = "24/10/2026";
          } else if (normalized.includes("novembro")) {
            updatedCrm.data = "15/11/2026";
          }

          // Pacote
          if (normalized.includes("3h") || normalized.includes("3 horas") || normalized.includes("express")) {
            updatedCrm.pacote = "Express (3 Horas)";
          } else if (normalized.includes("4h") || normalized.includes("4 horas") || normalized.includes("premium")) {
            updatedCrm.pacote = "Premium (4 Horas)";
          }

          // Local
          const bairros = ["copacabana", "barra", "recreio", "ipanema", "leblon", "tijuca", "niteroi", "flamengo", "botafogo", "centro"];
          for (const b of bairros) {
            if (normalized.includes(b)) {
              updatedCrm.local = b.charAt(0).toUpperCase() + b.slice(1);
              break;
            }
          }

          if (updatedCrm.data && !prevCrm.disponibilidadeChecada) {
            updatedCrm.disponibilidadeChecada = true;
            toolCalls.push(`consultar_disponibilidade(data="${updatedCrm.data}", horario="18:00") -> Livre`);
          }

          let score = calculateScore(updatedCrm);
          updatedCrm.score = score;
          updatedCrm.temperatura = getTemperature(score);

          let replyText = "";
          let gtmEventToPush = null;

          if (updatedCrm.convidados && parseInt(updatedCrm.convidados) > 150) {
            updatedCrm.status = '[Transbordo Humano]';
            toolCalls.push(`chamar_humano(lead_id="${updatedCrm.id}", motivo="Grande porte: ${updatedCrm.convidados} convidados")`);
            updatedCrm.logs = [...prevCrm.logs, ...toolCalls.map(tc => `[Tool Call] ${tc}`), `[System] Lead etiquetado como [Transbordo Humano]`];

            replyText = `Pô, que bacana! Um evento lindo para ${updatedCrm.convidados} convidados! 🥳 Como é uma festa de grande porte, nós precisamos fazer um estudo de logística personalizado para garantir o açaí geladinho e sem filas. Estou acionando o nosso time comercial agora mesmo. Um atendente humano vai assumir este atendimento para te passar um desconto especial! Só um minutinho! 💜`;

            gtmEventToPush = {
              name: 'human_handoff_triggered',
              data: { lead_id: updatedCrm.id, reason: 'Grande porte: ' + updatedCrm.convidados + ' convidados', score: score }
            };
          } else if (requestsHuman) {
            updatedCrm.status = '[Transbordo Humano]';
            toolCalls.push(`chamar_humano(lead_id="${updatedCrm.id}", motivo="Solicitado pelo cliente")`);
            updatedCrm.logs = [...prevCrm.logs, ...toolCalls.map(tc => `[Tool Call] ${tc}`), `[System] Lead etiquetado como [Transbordo Humano]`];

            replyText = `Com certeza! Sem problemas. Estou acionando um dos nossos consultores de eventos aqui do Recanto. Em instantes um humano vai te chamar por aqui ou no WhatsApp, beleza? Tamo junto! 💜`;

            gtmEventToPush = {
              name: 'human_handoff_triggered',
              data: { lead_id: updatedCrm.id, reason: 'Solicitado pelo cliente', score: score }
            };
          } else {
            if (score >= 90) {
              if (normalized.includes("pix") || normalized.includes("pagar") || normalized.includes("fechar") || normalized.includes("reserva")) {
                updatedCrm.status = '[Aguardando Sinal]';
                updatedCrm.intencaoPix = true;
                toolCalls.push(`reservar_data_temporaria(nome="${updatedCrm.nome}", data="${updatedCrm.data}", pacote="${updatedCrm.pacote}")`);

                gtmEventToPush = {
                  name: 'lead_reservation_sinal_waiting',
                  data: { lead_id: updatedCrm.id, score: score, name: updatedCrm.nome, package: updatedCrm.pacote }
                };
              } else {
                updatedCrm.status = '[Lead Quente]';
              }
            } else if (score >= 40) {
              updatedCrm.status = '[Orçamento em Andamento]';
            } else {
              updatedCrm.status = '[Lead Novo]';
            }

            toolCalls.push(`atualizar_lead_score(score=${score})`);
            toolCalls.push(`aplicar_etiqueta_crm(etiqueta="${updatedCrm.status}")`);
            updatedCrm.logs = [...prevCrm.logs, ...toolCalls.map(tc => `[Tool Call] ${tc}`)];

            if (!updatedCrm.nome) {
              replyText = `E aí, beleza? ☀️ Aqui é a Naiara, especialista de vendas do Recanto Eventos! Fico feliz demais com o contato. Pra gente começar a planejar o buffet de açaí e sorvete mais brabo do Rio pro seu evento, me conta: qual é o seu nome? 🍨`;
            } else if (!updatedCrm.data) {
              replyText = `Prazer falar com você, ${updatedCrm.nome}! 💜 Me conta, qual é a data do seu evento? Assim eu já dou uma olhada na nossa agenda de finais de semana pra ver se tá liberado.`;
            } else if (!updatedCrm.convidados) {
              replyText = `Maravilha, ${updatedCrm.nome}! Já verifiquei a data de ${updatedCrm.data}. E para quantas pessoas você está planejando essa festa? (Lembrando que nossos pacotes base atendem até 50 pessoas, mas cobrimos qualquer tamanho!)`;
            } else if (!updatedCrm.pacote) {
              replyText = `Show! Anotado: ${updatedCrm.convidados} convidados. Para esse tamanho de festa, você prefere o **Pacote Express (3 horas de buffet)** ou o **Premium (4 horas de buffet)**?`;
            } else if (!updatedCrm.local) {
              replyText = `Excelente escolha! E onde vai ser realizado o evento? Se tiver o bairro ou CEP aqui do Rio de Janeiro, eu já calculo a taxa de entrega e te dou o valor fechadinho! 🛵`;
            } else if (!updatedCrm.telefone) {
              replyText = `Perfeito! Já tenho quase todas as informações. Me passa seu WhatsApp/telefone para eu registrar no cadastro e te mandar o espelho do orçamento formatado? 📞`;
            } else if (updatedCrm.status === '[Lead Quente]') {
              let baseVal = updatedCrm.pacote.includes("3") ? 1290 : 1390;
              let extraVal = 0;
              let convNum = parseInt(updatedCrm.convidados);
              if (convNum > 50 && convNum <= 80) extraVal = 250;
              else if (convNum > 80 && convNum <= 120) extraVal = 450;
              else if (convNum > 120 && convNum <= 150) extraVal = 650;

              const totalVal = baseVal + extraVal;
              const formattedTotal = totalVal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

              replyText = `Maneiro demais, ${updatedCrm.nome}! Seu orçamento está pronto: o **${updatedCrm.pacote}** para **${updatedCrm.convidados} pessoas** em **${updatedCrm.local}** fica no total de **${formattedTotal}**. \n\nComo a data de ${updatedCrm.data} é concorrida, quer que eu faça a reserva temporária dela de 24h sem custo pra você garantir? Para confirmar, a gente faz o Pix de 50% de sinal. O que acha? 💜`;
            } else if (updatedCrm.status === '[Aguardando Sinal]' || updatedCrm.intencaoPix) {
              replyText = `Perfeito, ${updatedCrm.nome}! Já executei a ferramenta \`reservar_data_temporaria\` e sua data de ${updatedCrm.data} está pré-reservada por 24 horas! 🥳 \n\nPara confirmar com segurança, nosso time comercial te envia os dados oficiais de pagamento por aqui — sem passar dados sensíveis automaticamente. Alguma outra dúvida? 🍨💜`;
            } else {
              replyText = `Opa, ${updatedCrm.nome}! Já temos todos os dados do seu evento de açaí mapeados aqui no CRM. Seu lead está super quente! Se tiver mais alguma dúvida sobre coberturas, logística ou equipe, é só mandar! Se quiser fechar, podemos gerar o Pix de sinal. 🍨`;
            }
          }

          setTimeout(() => {
            setMessages(m => [...m, {
              id: 'naiara_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
              sender: 'naiara',
              text: replyText,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
            setIsTyping(false);

            pushGTMEvent('lead_score_updated', {
              lead_id: updatedCrm.id,
              score: score,
              temperature: updatedCrm.temperatura,
              status: updatedCrm.status
            });

            if (gtmEventToPush) {
              pushGTMEvent(gtmEventToPush.name, gtmEventToPush.data);
            }
          }, 0);

          return updatedCrm;
        });
      }, 1200);
    });
  };

  const handleResetSimulation = () => {
    setMessages([
      {
        id: 'naiara_init_' + Date.now(),
        sender: 'naiara',
        text: 'Oi! Beleza? ☀️ Sou a Naiara, assistente virtual do Recanto Eventos. Qual é o seu nome pra gente começar a planejar a sua festa com o melhor buffet de açaí e sorvete do Rio? 🍨',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setCrmState({
      id: 'lead_rj_' + Math.random().toString(36).substring(2, 7),
      nome: '',
      telefone: '',
      data: '',
      convidados: '',
      pacote: '',
      local: '',
      disponibilidadeChecada: false,
      intencaoPix: false,
      status: '[Lead Novo]',
      score: 0,
      temperatura: 'Frio ❄️',
      logs: ['[System] CRM Inicializado - Simulação Resetada']
    });

    pushGTMEvent('crm_simulation_reset', { reset_time: new Date().toISOString() });
  };

  const handleCRMFieldChange = (field, value) => {
    setCrmState(prev => {
      let updated = { ...prev, [field]: value };
      
      // Auto check date availability
      if (field === 'data' && value && !prev.disponibilidadeChecada) {
        updated.disponibilidadeChecada = true;
      }

      // Recalculate lead score
      let score = 0;
      if (updated.nome) score += 10;
      if (updated.telefone) score += 10;
      if (updated.data) score += 20;
      if (updated.convidados) score += 15;
      if (updated.pacote) score += 15;
      if (updated.local) score += 10;
      if (updated.disponibilidadeChecada) score += 10;
      if (updated.intencaoPix) score += 10;

      updated.score = score;
      updated.temperatura = score < 40 ? 'Frio ❄️' : score <= 75 ? 'Morno 🔥' : 'Quente 🌋';

      const newStatus = score >= 90
        ? (prev.intencaoPix ? '[Aguardando Sinal]' : '[Lead Quente]')
        : score >= 40
          ? '[Orçamento em Andamento]'
          : '[Lead Novo]';
      updated.status = newStatus;

      // Append CRM Logs
      const newLogs = [...prev.logs];
      newLogs.push(`[System] Campo CRM '${field}' alterado manualmente para: ${value}`);
      if (field === 'data' && value && !prev.disponibilidadeChecada) {
        newLogs.push(`[Tool Call] consultar_disponibilidade(data="${value}") -> Livre`);
      }
      newLogs.push(`[Tool Call] atualizar_lead_score(score=${score})`);
      newLogs.push(`[Tool Call] aplicar_etiqueta_crm(etiqueta="${updated.status}")`);
      updated.logs = newLogs;

      // Show interactive feedback toast
      if (score > prev.score) {
        showToast(`Score subiu para ${score}/100! (+${score - prev.score} pts)`, 'success');
      }

      // Google Tag Manager Event Pushes
      pushGTMEvent('lead_score_updated', {
        lead_id: updated.id,
        score: score,
        temperature: updated.temperatura,
        status: updated.status,
        source: 'manual_crm_edit'
      });

      // Automated Human Handoff triggers from CRM input
      if (field === 'convidados' && parseInt(value) > 150 && prev.status !== '[Transbordo Humano]') {
        updated.status = '[Transbordo Humano]';
        newLogs.push(`[Tool Call] chamar_humano(lead_id="${updated.id}", motivo="Grande porte: ${value} convidados")`);
        newLogs.push(`[System] Lead etiquetado como [Transbordo Humano]`);
        
        setTimeout(() => {
          setMessages(m => [...m, {
            id: 'naiara_handoff_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
            sender: 'naiara',
            text: `Detectei no nosso CRM que o seu evento é para mais de 150 pessoas (${value} convidados). Como exige estrutura maior, estou acionando o transbordo humano para a nossa gerência comercial assumir o contato e te enviar um desconto especial! Só um minutinho! 💜`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }]);
          setIsTyping(false);
        }, 800);

        pushGTMEvent('human_handoff_triggered', { lead_id: updated.id, reason: 'Grande porte: ' + value + ' convidados', score: score });
      }

      return updated;
    });

    // Synchronize CRM edits back to the main website booking form
    setFormData(prev => {
      let updatedForm = { ...prev };
      if (field === 'nome') updatedForm.name = value;
      else if (field === 'telefone') updatedForm.phone = value;
      else if (field === 'data') {
        const parts = value.split('/');
        if (parts.length === 3) {
          updatedForm.date = `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
      } else if (field === 'convidados') {
        const qty = parseInt(value);
        if (qty <= 50) updatedForm.guests = 'Até 50';
        else if (qty <= 80) updatedForm.guests = '50 a 80';
        else if (qty <= 120) updatedForm.guests = '80 a 120';
        else if (qty <= 150) updatedForm.guests = '120 a 150';
        else updatedForm.guests = 'Mais de 150';
      } else if (field === 'pacote') {
        updatedForm.package = value.includes('3') ? 'Express (3 Horas - R$ 1.290)' : 'Premium (4 Horas - R$ 1.390)';
      } else if (field === 'local') {
        updatedForm.local = value;
      }
      return updatedForm;
    });
  };

  // Toast State
  const [toasts, setToasts] = useState([]);

  // Refs for scrolling
  const quoteFormRef = useRef(null);
  const packagesRef = useRef(null);

  // Calculate price dynamically in simulator
  useEffect(() => {
    const base = BASE_PRICES[simDuration];
    const extra = GUEST_EXTRA_COSTS[simGuests];
    if (extra === null) {
      setSimTotal('Sob Consulta');
    } else {
      setSimTotal(base + extra);
    }
  }, [simDuration, simGuests]);

  // Set minimum date to today
  const [minDate, setMinDate] = useState('');
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setMinDate(today);
  }, []);

  // Handle active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['hero', 'packages', 'whats-included', 'faq', 'quote-section'];
      const scrollPosition = window.scrollY + 200;

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Format currency helper
  const formatCurrency = (val) => {
    if (typeof val === 'string') return val;
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  // Toast trigger
  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Apply simulator values directly to booking form
  const handleApplySimulator = (e) => {
    e.preventDefault();
    
    // Determine package based on duration
    const pkg = simDuration === '3' 
      ? 'Express (3 Horas - R$ 1.290)' 
      : 'Premium (4 Horas - R$ 1.390)';

    // Map simulator guest code to form guest text
    let guestsText = 'Até 50';
    if (simGuests === '80') guestsText = '50 a 80';
    else if (simGuests === '120') guestsText = '80 a 120';
    else if (simGuests === '150') guestsText = '120 a 150';
    else if (simGuests === '200') guestsText = 'Mais de 150';

    setFormData((prev) => ({
      ...prev,
      package: pkg,
      guests: guestsText
    }));

    showToast('Simulação aplicada! Escolha como prosseguir.', 'success');
    
    // Open choice modal to checkout/WhatsApp
    setShowChoiceModal(true);

    if (!invoiceNumber) {
      setInvoiceNumber('REC-' + Date.now().toString().slice(-6) + '-' + Math.floor(Math.random()*90+10));
    }

    // Push GTM Event
    pushGTMEvent('simulator_applied', {
      duration_hours: simDuration,
      guests: simGuests,
      estimated_total: simTotal
    });
  };

  // Select package from packages section
  const handleSelectPackage = (packageName) => {
    setFormData((prev) => ({
      ...prev,
      package: packageName,
      guests: 'Até 50' // default
    }));

    const nameClean = packageName.split('(')[0].trim();
    showToast(`Pacote ${nameClean} selecionado!`, 'success');
    quoteFormRef.current?.scrollIntoView({ behavior: 'smooth' });

    // Push GTM Event
    pushGTMEvent('package_selected', {
      package_name: packageName
    });
  };

  const handleWhatsAppRedirect = () => {
    const { name, phone, date, package: pkg, guests, local, notes } = formData;
    const [year, month, day] = date.split('-');
    const formattedDate = `${day}/${month}/${year}`;

    const base = pkg.includes('3 Horas') ? BASE_PRICES['3'] : BASE_PRICES['4'];
    const extraMap = { 'Até 50': 0, '50 a 80': 250, '80 a 120': 450, '120 a 150': 650, 'Mais de 150': null };
    const extra = extraMap[guests];
    const priceEstimationText = extra === null ? 'Sob Consulta' : formatCurrency(base + extra);

    let msg = `🎉 *SOLICITAÇÃO DE ORÇAMENTO - RECANTO EVENTOS* 🎉\n\n`;
    msg += `👤 *Nome:* ${name.trim()}\n`;
    msg += `📞 *WhatsApp:* ${phone.trim()}\n\n`;
    msg += `📅 *DETALHES DO EVENTO:*\n`;
    msg += `🗓️ *Data:* ${formattedDate}\n`;
    msg += `📍 *Local:* ${local.trim()}\n`;
    msg += `👥 *Qtd. Convidados:* ${guests} pessoas\n`;
    msg += `📦 *Pacote Solicitado:* ${pkg}\n`;
    msg += `💵 *Estimativa:* ${priceEstimationText}\n\n`;

    if (notes.trim()) {
      msg += `✏️ *Observações:* _"${notes.trim()}"_\n\n`;
    }

    msg += `Olá! Vi o site de eventos e gostaria de receber o orçamento formalizado para o meu evento nas configurações acima. Aguardo contato! 💜🍨`;

    const encoded = encodeURIComponent(msg);
    const url = `https://api.whatsapp.com/send?phone=${STORE_WHATSAPP_NUMBER}&text=${encoded}`;

    showToast('Processando... Redirecionando para o WhatsApp!', 'success');
    setShowChoiceModal(false);

    // Push GTM Event for conversion
    pushGTMEvent('quote_form_submitted', {
      lead_name: name.trim(),
      lead_phone: phone.trim(),
      event_date: formattedDate,
      event_location: local.trim(),
      event_guests: guests,
      selected_package: pkg,
      price_estimate: priceEstimationText,
      close_method: 'whatsapp'
    });

    setTimeout(() => {
      window.open(url, '_blank');
    }, 600);
  };

  // Handle Quote Form submits
  const handleSubmitQuote = (e) => {
    e.preventDefault();

    const { name, phone, date, local } = formData;

    if (!name.trim() || !phone.trim() || !date || !local.trim()) {
      showToast('Por favor, preencha todos os campos obrigatórios.', 'error');
      return;
    }

    // Show selection modal
    setShowChoiceModal(true);

    if (!invoiceNumber) {
      setInvoiceNumber('REC-' + Date.now().toString().slice(-6) + '-' + Math.floor(Math.random()*90+10));
    }
  };

  const handleCheckoutDataChange = (e) => {
    const { id, value } = e.target;
    setCheckoutData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleProcessPayment = (e) => {
    e.preventDefault();
    if (isProcessingPayment) return;

    if (paymentMethod === 'card') {
      const { cardName, cardNumber, cardExpiry, cardCvc } = checkoutData;
      if (!cardName.trim() || !cardNumber.trim() || !cardExpiry.trim() || !cardCvc.trim()) {
        showToast('Preencha os dados do cartão de crédito.', 'error');
        return;
      }
    } else {
      if (!checkoutData.email.trim() || !checkoutData.cpf.trim()) {
        showToast('Preencha e-mail e CPF para faturamento do Pix.', 'error');
        setCheckoutStep('form');
        return;
      }
    }

    setIsProcessingPayment(true);
    showToast('Processando pagamento...', 'success');

    setTimeout(() => {
      setIsProcessingPayment(false);
      setCheckoutStep('success');

      setCrmState(prev => {
        const updated = {
          ...prev,
          status: '[Reserva Confirmada]',
          score: 100,
          temperatura: 'Quente 🌋',
          intencaoPix: true
        };
        const newLogs = [...prev.logs];
        newLogs.push(`[System] Pagamento processado via ${paymentMethod === 'card' ? 'Cartão (Stripe Simulado)' : 'Pix com sinal'}`);
        newLogs.push(`[System] Reserva Confirmada! Fatura: ${invoiceNumber}`);
        newLogs.push(`[Tool Call] disparar_webhook_reserva_confirmada(invoice="${invoiceNumber}", total="${simTotal}") -> OK`);
        updated.logs = newLogs;

        // Push GTM Event
        pushGTMEvent('purchase_completed', {
          transaction_id: invoiceNumber,
          value: paymentOption === 'sinal' ? (typeof simTotal === 'number' ? simTotal / 2 : 645) : (typeof simTotal === 'number' ? simTotal : 1290),
          currency: 'BRL',
          payment_method: paymentMethod,
          payment_option: paymentOption,
          items: [
            {
              item_name: formData.package,
              item_category: 'Buffet Açaí',
              price: typeof simTotal === 'number' ? simTotal : 1290,
              quantity: 1
            }
          ]
        });

        return updated;
      });

      showToast('Reserva confirmada com sucesso! Contrato enviado.', 'success');
    }, 2000);
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    // Map element ids (e.g. event-name -> name)
    const key = id.replace('event-', '');
    setFormData((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen selection:bg-brand-pink selection:text-white">
      {/* Toast Notification list */}
      <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center gap-3 bg-white border-l-5 px-6 py-4 rounded-lg shadow-lg pointer-events-auto transition-all duration-350 border-y border-r border-brand-purple/10 max-w-sm ${
              toast.type === 'success' ? 'border-l-brand-green' : 'border-l-brand-pink'
            }`}
          >
            <span>{toast.type === 'success' ? '✅' : '❌'}</span>
            <span className="text-sm font-bold text-brand-text">{toast.message}</span>
          </div>
        ))}
      </div>

      {/* HEADER / NAVIGATION */}
      <header className="fixed top-0 left-0 w-full z-40 bg-white/85 backdrop-blur-md border-b border-brand-purple/10 shadow-sm">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <a href="#" className="flex items-center gap-3 hover:scale-102 transition-transform duration-200">
            <img src="/logo.png" alt="Recanto do Açaí Logo" className="h-12 w-12 object-contain rounded-full shadow-md border-2 border-brand-purple/10" />
            <div className="flex flex-col">
              <span className="font-heading font-black text-2xl tracking-tight text-brand-purple leading-none mb-1">
                Recanto <span className="text-brand-pink">do Açaí</span>
              </span>
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-brand-muted">
                Buffet & Eventos Gourmet
              </span>
            </div>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {['hero', 'packages', 'whats-included', 'faq'].map((sec) => {
              const labels = {
                hero: 'Início',
                packages: 'Combos Gourmet',
                'whats-included': 'Experiência',
                faq: 'Dúvidas'
              };
              return (
                <a
                  key={sec}
                  href={`#${sec}`}
                  className={`font-heading font-semibold text-sm transition-colors duration-200 relative py-2 ${
                    activeSection === sec ? 'text-brand-purple' : 'text-brand-muted hover:text-brand-purple'
                  }`}
                >
                  {labels[sec]}
                  {activeSection === sec && (
                    <span className="absolute bottom-0 left-0 w-full h-[2.5px] bg-brand-pink rounded-full" />
                  )}
                </a>
              );
            })}
          </nav>

          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                pushGTMEvent('header_cta_clicked');
                quoteFormRef.current?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hidden sm:inline-flex btn bg-gradient-to-r from-brand-pink to-brand-purple-light text-white font-bold py-2.5 px-6 rounded-full text-xs shadow-md shadow-brand-pink/20 hover:scale-102 hover:shadow-lg hover:shadow-brand-pink/30 active:scale-98 transition-all duration-300"
            >
              Simular Preços ➔
            </button>
            
            {/* Mobile Hamburguer Menu */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex flex-col justify-between w-6 h-4.5 cursor-pointer z-50"
              aria-label="Abrir Menu"
            >
              <span className={`h-0.5 w-full bg-brand-purple rounded transition-all duration-300 ${mobileMenuOpen ? 'transform rotate-45 translate-y-2' : ''}`} />
              <span className={`h-0.5 w-full bg-brand-purple rounded transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : ''}`} />
              <span className={`h-0.5 w-full bg-brand-purple rounded transition-all duration-300 ${mobileMenuOpen ? 'transform -rotate-45 -translate-y-2' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Nav Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 pt-20 bg-white/98 z-30 flex flex-col items-center justify-center md:hidden transition-all duration-300">
          <div className="flex flex-col items-center gap-6 w-full max-w-xs px-6">
            {['hero', 'packages', 'whats-included', 'faq'].map((sec) => {
              const labels = {
                hero: 'Início',
                packages: 'Combos Gourmet',
                'whats-included': 'Experiência',
                faq: 'Dúvidas'
              };
              return (
                <a
                  key={sec}
                  href={`#${sec}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="font-heading font-bold text-2xl text-brand-text hover:text-brand-pink"
                >
                  {labels[sec]}
                </a>
              );
            })}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                quoteFormRef.current?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full btn bg-gradient-to-r from-brand-pink to-brand-purple-light text-white font-bold py-4 rounded-full shadow-lg"
            >
              Solicitar Orçamento
            </button>
          </div>
        </div>
      )}

      {/* HERO SECTION */}
      <section id="hero" className="pt-40 pb-16 md:py-48 flex items-center relative overflow-hidden">
        {/* Floating background decorative banana and acai emojis */}
        <div className="absolute top-24 left-10 text-4xl opacity-15 select-none animate-float-custom pointer-events-none">🍌</div>
        <div className="absolute bottom-20 left-1/3 text-4xl opacity-10 select-none animate-float-custom pointer-events-none [animation-delay:2s]">🍨</div>
        <div className="absolute top-1/3 right-12 text-3xl opacity-15 select-none animate-float-custom pointer-events-none [animation-delay:4s]">🍌</div>
        
        <div className="container mx-auto px-6 grid md:grid-layout grid-cols-1 md:grid-cols-12 items-center gap-12">
          <div className="md:col-span-7 z-10 text-center md:text-left flex flex-col items-center md:items-start">
            <span className="inline-block bg-white border border-brand-purple/15 px-4 py-2 rounded-full text-[10px] font-extrabold text-brand-purple shadow-sm tracking-widest mb-8 uppercase">
              ☀️ BUFFET DE AÇAÍ E SORVETE NO RIO DE JANEIRO
            </span>
            
            <h1 className="font-heading font-black text-4xl sm:text-5xl lg:text-6xl text-brand-purple-dark leading-tight tracking-tight mb-8">
              O Melhor Buffet de Açaí
              <span className="block mt-4 bg-gradient-to-r from-brand-purple via-brand-pink to-brand-yellow bg-clip-text text-transparent">
                e Sorvete Gourmet no RJ
              </span>
            </h1>
            
            <p className="text-sm sm:text-base text-brand-muted font-semibold max-w-xl leading-relaxed mb-10">
              Leve uma atração interativa e sofisticada para o seu evento com mesa decorada rústica, frutas frescas fatiadas na hora e mais de 20 toppings premium liberados.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-5 mb-10 w-full justify-center md:justify-start items-center">
              <button
                onClick={() => {
                  pushGTMEvent('hero_cta_clicked', { button: 'simular_valor_buffet' });
                  quoteFormRef.current?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full sm:w-auto btn bg-gradient-to-r from-brand-pink to-brand-purple-light text-white font-black py-4 px-8 rounded-full text-xs tracking-wider uppercase shadow-lg shadow-brand-pink/20 hover:scale-102 hover:shadow-xl active:scale-98 transition-all duration-300 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Simular Valor do Buffet ➔</span>
              </button>
              <button
                onClick={() => {
                  pushGTMEvent('hero_cta_clicked', { button: 'conhecer_pacotes_gourmet' });
                  packagesRef.current?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full sm:w-auto btn bg-white text-brand-purple border-2 border-brand-purple/20 hover:bg-brand-purple hover:text-white hover:border-brand-purple py-4 px-8 rounded-full text-xs tracking-wider uppercase font-bold shadow-sm hover:scale-102 active:scale-98 transition-all duration-300 cursor-pointer"
              >
                Conhecer Pacotes Gourmet
              </button>
            </div>
            <div className="flex items-center gap-4 border-t border-brand-purple/10 pt-6 max-w-md">
              <div className="text-lg">⭐⭐⭐⭐⭐</div>
              <span className="text-xs text-brand-muted font-bold leading-normal">
                Mais de <strong>150 eventos</strong> realizados com satisfação máxima dos clientes!
              </span>
            </div>
          </div>

          <div className="md:col-span-5 flex justify-center relative">
            <div className="relative w-full max-w-[420px] aspect-square rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-purple-light/20 to-brand-pink/20 rounded-full blur-3xl -z-10" />
              <video
                src="/video_principal.mp4"
                poster="/imagem_principal.jpg"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover rounded-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* SIMULATOR SECTION - CUSTOM DESIGN */}
      <section className="pb-20">
        <div className="container mx-auto px-6">
          <div className="bg-white border-2 border-brand-purple/10 rounded-3xl shadow-xl overflow-hidden relative max-w-4xl mx-auto">
            {/* Top decorative gradient line */}
            <div className="h-2 w-full bg-gradient-to-r from-brand-purple via-brand-pink to-brand-yellow" />
            
            <div className="p-8 sm:p-12">
              <div className="text-center md:text-left mb-10">
                <h2 className="font-heading font-black text-2xl sm:text-3xl text-brand-purple-dark mb-2">
                  Monte seu Buffet de Açaí Personalizado
                </h2>
                <p className="text-brand-muted text-sm font-semibold">
                  Selecione a duração ideal e o número de convidados para calcular o valor do seu evento na hora!
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 mb-8">
                {/* Duration select */}
                <div className="flex flex-col gap-3">
                  <span className="text-xs font-black uppercase tracking-wider text-brand-muted">
                    Duração da Festa (Horas)
                  </span>
                  <div className="flex bg-cream-bg border border-brand-purple/15 p-1 rounded-2xl gap-2">
                    <button
                      onClick={() => setSimDuration('3')}
                      className={`flex-1 flex items-center justify-center h-12 font-heading font-bold text-sm rounded-xl transition-all duration-200 ${
                        simDuration === '3' ? 'bg-brand-purple text-white shadow-md' : 'text-brand-muted hover:text-brand-purple'
                      }`}
                    >
                      3 Horas (R$ 1.290)
                    </button>
                    <button
                      onClick={() => setSimDuration('4')}
                      className={`flex-1 flex items-center justify-center h-12 font-heading font-bold text-sm rounded-xl transition-all duration-200 ${
                        simDuration === '4' ? 'bg-brand-purple text-white shadow-md' : 'text-brand-muted hover:text-brand-purple'
                      }`}
                    >
                      4 Horas (R$ 1.390)
                    </button>
                  </div>
                </div>

                {/* Guests dropdown */}
                <div className="flex flex-col gap-3">
                  <span className="text-xs font-black uppercase tracking-wider text-brand-muted">
                    Estimativa de Convidados
                  </span>
                  <select
                    id="sim-guests"
                    value={simGuests}
                    onChange={(e) => setSimGuests(e.target.value)}
                    className="w-full bg-cream-bg border border-brand-purple/15 rounded-2xl h-14 px-6 text-sm font-bold text-brand-text focus:border-brand-purple-light cursor-pointer outline-none"
                  >
                    <option value="50">Até 50 Convidados (Sem acréscimo)</option>
                    <option value="80">Até 80 Convidados (+ R$ 250)</option>
                    <option value="120">Até 120 Convidados (+ R$ 450)</option>
                    <option value="150">Até 150 Convidados (+ R$ 650)</option>
                    <option value="200">Mais de 200 Convidados (Sob Consulta)</option>
                  </select>
                </div>
              </div>

              {/* Estimate Output Area */}
              <div className="bg-cream-bg border border-brand-purple/15 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-center gap-6">
                <div className="flex flex-col text-center sm:text-left">
                  <span className="text-xs font-black uppercase tracking-wider text-brand-muted mb-1">
                    Valor Estimado do Serviço
                  </span>
                  <span className="font-heading font-black text-3xl sm:text-4xl text-brand-purple-dark">
                    {formatCurrency(simTotal)}
                  </span>
                </div>
                <button
                  onClick={handleApplySimulator}
                  className="btn bg-brand-yellow hover:bg-[#ffd14b] text-brand-purple-dark font-black py-4 px-8 rounded-full text-sm shadow-md shadow-brand-yellow/15 hover:scale-102 active:scale-98 transition-all duration-300"
                >
                  Garantir Minha Data 🗓️
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LEADS & CONTACT FORM SECTION (Google Ads Target) */}
      <section id="quote-section" ref={quoteFormRef} className="py-24 bg-gradient-to-br from-brand-purple-dark/5 to-brand-pink/5 border-t border-brand-purple/10">
        <div className="container mx-auto px-6">
          <div className="bg-white border border-brand-purple/15 rounded-3xl shadow-2xl overflow-hidden grid md:grid-cols-12 max-w-5xl mx-auto">
            {/* Left side details banner */}
            <div className="md:col-span-5 bg-gradient-to-br from-brand-purple-dark to-brand-purple p-8 sm:p-12 text-white flex flex-col justify-center">
              <h2 className="font-heading font-black text-3xl leading-tight mb-4">
                Sua Única Tarefa é Curtir a Festa! ☀️
              </h2>
              <p className="text-sm text-white/80 leading-relaxed mb-10">
                Nossa equipe cuida de tudo: montagem de nossa mesa decorada temática, serviço livre de açaí e sorvetes com mais de 20 acompanhamentos e confeitos, além de limpeza final impecável. Preencha em 30 segundos e garanta seu orçamento no WhatsApp!
              </p>
              
              <div className="flex flex-col gap-6">
                <div className="flex gap-4 items-start">
                  <span className="text-xl bg-white/8 w-11 h-11 flex items-center justify-center rounded-full shrink-0">📍</span>
                  <div>
                    <h4 className="font-heading font-bold text-sm">Área de Atendimento</h4>
                    <p className="text-xs text-white/60 mt-1">Salões, empresas, sítios e residências</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <span className="text-xl bg-white/8 w-11 h-11 flex items-center justify-center rounded-full shrink-0">📞</span>
                  <div>
                    <h4 className="font-heading font-bold text-sm">Atendimento Comercial</h4>
                    <p className="text-xs text-white/60 mt-1">(21) 98174-9450 (Seg a Sáb 9h às 18h)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side contact form */}
            <div className="md:col-span-7 p-8 sm:p-12">
              <h3 className="font-heading font-black text-2xl text-brand-purple-dark mb-1">
                Solicite sua Proposta Personalizada
              </h3>
              <p className="text-xs text-brand-pink font-bold mb-8">
                ⚡ Retornamos em até 10 minutos no WhatsApp com seu orçamento completo!
              </p>
              <form onSubmit={handleSubmitQuote} className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <label htmlFor="event-name" className="text-[10px] font-black uppercase tracking-wider text-brand-muted">
                    Seu Nome *
                  </label>
                  <input
                    type="text"
                    id="event-name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Ex: Maria Oliveira"
                    className="w-full bg-cream-bg border border-brand-purple/15 rounded-xl h-12 px-4 text-sm font-semibold outline-none focus:border-brand-purple"
                    required
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="event-phone" className="text-[10px] font-black uppercase tracking-wider text-brand-muted">
                      WhatsApp *
                    </label>
                    <input
                      type="tel"
                      id="event-phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="(21) 98765-4321"
                      className="w-full bg-cream-bg border border-brand-purple/15 rounded-xl h-12 px-4 text-sm font-semibold outline-none focus:border-brand-purple"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="event-date" className="text-[10px] font-black uppercase tracking-wider text-brand-muted">
                      Data do Evento *
                    </label>
                    <input
                      type="date"
                      id="event-date"
                      value={formData.date}
                      onChange={handleInputChange}
                      min={minDate}
                      className="w-full bg-cream-bg border border-brand-purple/15 rounded-xl h-12 px-4 text-sm font-semibold outline-none focus:border-brand-purple"
                      required
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="event-package" className="text-[10px] font-black uppercase tracking-wider text-brand-muted">
                      Pacote Desejado *
                    </label>
                    <select
                      id="event-package"
                      value={formData.package}
                      onChange={handleInputChange}
                      className="w-full bg-cream-bg border border-brand-purple/15 rounded-xl h-12 px-4 text-sm font-semibold outline-none focus:border-brand-purple cursor-pointer"
                      required
                    >
                      <option value="Express (3 Horas - R$ 1.290)">3 Horas de Festa - R$ 1.290</option>
                      <option value="Premium (4 Horas - R$ 1.390)">4 Horas de Festa - R$ 1.390</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="event-guests" className="text-[10px] font-black uppercase tracking-wider text-brand-muted">
                      Convidados Estimados *
                    </label>
                    <select
                      id="event-guests"
                      value={formData.guests}
                      onChange={handleInputChange}
                      className="w-full bg-cream-bg border border-brand-purple/15 rounded-xl h-12 px-4 text-sm font-semibold outline-none focus:border-brand-purple cursor-pointer"
                      required
                    >
                      <option value="Até 50">Até 50 convidados</option>
                      <option value="50 a 80">50 a 80 convidados</option>
                      <option value="80 a 120">80 a 120 convidados</option>
                      <option value="120 a 150">120 a 150 convidados</option>
                      <option value="Mais de 150">Mais de 150 convidados</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="event-local" className="text-[10px] font-black uppercase tracking-wider text-brand-muted">
                    Local do Evento / Cidade *
                  </label>
                  <input
                    type="text"
                    id="event-local"
                    value={formData.local}
                    onChange={handleInputChange}
                    placeholder="Ex: Salão de Festas, Copacabana - Rio de Janeiro"
                    className="w-full bg-cream-bg border border-brand-purple/15 rounded-xl h-12 px-4 text-sm font-semibold outline-none focus:border-brand-purple"
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="event-notes" className="text-[10px] font-black uppercase tracking-wider text-brand-muted">
                    Observações Especiais
                  </label>
                  <textarea
                    id="event-notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows="2"
                    placeholder="Ex: Desejo sorvete de chocolate Belga extra, etc."
                    className="w-full bg-cream-bg border border-brand-purple/15 rounded-xl p-4 text-sm font-semibold outline-none focus:border-brand-purple"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full btn bg-brand-yellow hover:bg-[#ffd14b] text-brand-purple-dark font-black py-4 rounded-full text-sm shadow-md shadow-brand-yellow/15 flex items-center justify-center gap-2 mt-4 hover:scale-102 active:scale-98 transition-all duration-300"
                >
                  <span>Enviar Orçamento no meu WhatsApp ➔</span>
                  <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* PACKAGES SECTION */}
      <section id="packages" ref={packagesRef} className="py-24 bg-brand-purple-dark/5 border-y border-brand-purple/10">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-16">
            <span className="text-brand-pink font-heading font-black text-xs uppercase tracking-wider">
              NOSSOS COMBOS GOURMET
            </span>            <h2 className="font-heading font-black text-3xl sm:text-4xl text-brand-purple-dark mt-2 mb-4">
              Pacotes de Buffet de Açaí e Sorvete Liberado
            </h2>
            <p className="text-brand-muted text-sm font-semibold leading-relaxed">
              Tenha em seu evento uma verdadeira atração interativa. Nossa equipe chega 1 hora antes para montar a mesa decorada rústica. Servimos açaí artesanal super cremoso e sorvetes gourmet à vontade. Seus convidados escolhem livremente entre mais de 20 caldas e acompanhamentos premium, com atendimento ágil, reposição constante e limpeza total inclusa.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Express Package */}
            <div className="bg-white border border-brand-purple/15 rounded-3xl p-8 sm:p-12 relative flex flex-col justify-between shadow-md hover:scale-102 hover:shadow-xl transition-all duration-300">
              <span className="absolute top-6 right-6 bg-brand-purple-light text-white font-extrabold text-[10px] tracking-wider uppercase px-4 py-1.5 rounded-full">
                Mais Popular
              </span>
              <div>
                <h3 className="font-heading font-black text-2xl text-brand-purple mb-1">
                  Combo Carioca Express
                </h3>
                <p className="text-xs text-brand-muted font-bold mb-6">
                  Perfeito para aniversários íntimos e lanches de tarde no RJ
                </p>
                <div className="flex items-baseline mb-8 border-b border-brand-purple/10 pb-6">
                  <span className="font-heading font-extrabold text-lg text-brand-purple mr-1">R$</span>
                  <span className="font-heading font-black text-5xl text-brand-purple-dark tracking-tight">1.290</span>
                  <span className="text-xs font-bold text-brand-muted ml-2">/ total</span>
                </div>
                <ul className="flex flex-col gap-4 mb-8">
                  {['⏱️ 3 Horas completas de buffet livre', '🍨 Açaí artesanal ultra cremoso (reposição livre)', '🍦 3 sabores de sorvetes clássicos (Gourmet)', '🍌 Frutas Frescas (Banana Prata 🍌 e Morango) e 15+ toppings', '🧑‍🍳 1 Operador uniformizado e dedicado', '🥤 Copos reforçados, colheres e guardanapos', '✨ Logística completa: montagem, desmontagem e limpeza'].map((f, i) => (
                    <li key={i} className="text-sm font-semibold text-brand-text flex items-center gap-3">
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              <button
                onClick={() => handleSelectPackage('Express (3 Horas - R$ 1.290)')}
                className="w-full btn bg-brand-purple hover:bg-brand-purple-light text-white font-black py-4 rounded-full text-sm shadow-md transition-all duration-300"
              >
                Quero o Combo de 3h ➔
              </button>
            </div>

            {/* Premium Package */}
            <div className="bg-white border-2 border-brand-pink rounded-3xl p-8 sm:p-12 relative flex flex-col justify-between shadow-md shadow-brand-pink/5 hover:scale-102 hover:shadow-xl hover:shadow-brand-pink/10 transition-all duration-300">
              <span className="absolute top-6 right-6 bg-gradient-to-r from-brand-yellow to-amber-500 text-brand-purple-dark font-extrabold text-[10px] tracking-wider uppercase px-4 py-1.5 rounded-full">
                Melhor Custo-Benefício
              </span>
              <div>
                <h3 className="font-heading font-black text-2xl text-brand-pink mb-1">
                  Combo Redentor Premium
                </h3>
                <p className="text-xs text-brand-muted font-bold mb-6">
                  Casamentos, 15 anos e grandes eventos no Rio
                </p>
                <div className="flex items-baseline mb-8 border-b border-brand-purple/10 pb-6">
                  <span className="font-heading font-extrabold text-lg text-brand-pink mr-1">R$</span>
                  <span className="font-heading font-black text-5xl text-brand-purple-dark tracking-tight">1.390</span>
                  <span className="text-xs font-bold text-brand-muted ml-2">/ total</span>
                </div>
                <ul className="flex flex-col gap-4 mb-8">
                  {['⏱️ 4 Horas completas de buffet livre na pista', '🍨 Açaí artesanal selecionado de textura firme', '🍦 5 sabores de sorvetes premium à sua escolha', '🍌 Toppings Premium (Nutella® Original, Banana Prata 🍌, Morangos e confeitos)', '🧑‍🍳 2 Operadores experientes (atendimento em até 20s)', '🥤 Copos premium, colheres e guardanapos de folha dupla', '🌸 Decoração temática rústico-chique combinando com seu evento', '✨ Logística de montagem, reposição ágil e limpeza 100% inclusa'].map((f, i) => (
                    <li key={i} className="text-sm font-semibold text-brand-text flex items-center gap-3">
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              <button
                onClick={() => handleSelectPackage('Premium (4 Horas - R$ 1.390)')}
                className="w-full btn bg-brand-pink hover:bg-brand-pink-light text-white font-black py-4 rounded-full text-sm shadow-md shadow-brand-pink/20 transition-all duration-300"
              >
                Quero o Combo Premium de 4h ➔
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* WHAT'S INCLUDED SECTION */}
      <section id="whats-included" className="py-24">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-16">
            <span className="text-brand-pink font-heading font-black text-xs uppercase tracking-wider">
              EXPERIÊNCIA RECANTO
            </span>
            <h2 className="font-heading font-black text-3xl sm:text-4xl text-brand-purple-dark mt-2 mb-4">
              Tudo o que Cuidamos para o Seu Evento Brilhar
            </h2>
            <p className="text-brand-muted text-sm font-semibold leading-relaxed">
              Nossa equipe se encarrega de toda a logística e serviço para você focar em curtir cada segundo da festa.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: '🎪', title: 'Estação Gourmet', desc: 'Levamos mesa decorada no estilo rústico-chique, taças térmicas profissionais e descartáveis de alta qualidade.' },
              { icon: '🍓', title: 'Ingredientes Selecionados', desc: 'Frutas frescas fatiadas no mesmo dia (morango e banana), caldas especiais e mais de 15 toppings premium.' },
              { icon: '🧑‍🍳', title: 'Serviço com Sorriso', desc: 'Operadores uniformizados e treinados para montar os copos com rapidez, simpatia e total higiene.' },
              { icon: '🧹', title: 'Limpeza Impecável', desc: 'Chegamos 1 hora antes para a montagem e, após a festa, deixamos todo o espaço limpo e organizado.' }
            ].map((item, index) => (
              <div key={index} className="card-premium text-left flex flex-col justify-between">
                <div>
                  <div className="text-4xl mb-6">{item.icon}</div>
                  <h3 className="font-heading font-black text-lg text-brand-purple mb-3">
                    {item.title}
                  </h3>
                  <p className="text-xs text-brand-muted font-semibold leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* GALLERY SECTION */}
      <section className="py-24 border-t border-brand-purple/10">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-16">
            <span className="text-brand-pink font-heading font-black text-xs uppercase tracking-wider">
              GALERIA REAL
            </span>
            <h2 className="font-heading font-black text-3xl sm:text-4xl text-brand-purple-dark mt-2 mb-4">
              Açaí e Sorvete de Verdade no Seu Evento
            </h2>
            <p className="text-brand-muted text-sm font-semibold leading-relaxed">
              Confira fotos e vídeos reais do nosso buffet em ação no Rio de Janeiro. Transparência e sabor de verdade!
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Video 1: Operação Servindo */}
            <div className="bg-white border border-brand-purple/15 rounded-3xl p-3 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="relative aspect-video sm:aspect-square md:aspect-video rounded-2xl overflow-hidden bg-black">
                <video
                  src="/luana_servindo.mp4"
                  controls
                  preload="metadata"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="mt-3 px-2">
                <h4 className="font-heading font-bold text-sm text-brand-purple">Operação em Ação</h4>
                <p className="text-[10px] text-brand-muted font-semibold mt-0.5">Veja nossa equipe servindo copos fartos e cremosos.</p>
              </div>
            </div>

            {/* Video 2: Sorvete Qualidade */}
            <div className="bg-white border border-brand-purple/15 rounded-3xl p-3 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="relative aspect-video sm:aspect-square md:aspect-video rounded-2xl overflow-hidden bg-black">
                <video
                  src="/sorvete_qualidade.mp4"
                  controls
                  preload="metadata"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="mt-3 px-2">
                <h4 className="font-heading font-bold text-sm text-brand-purple">Sorvetes Especiais</h4>
                <p className="text-[10px] text-brand-muted font-semibold mt-0.5">Textura aveludada e cremosidade garantida na festa.</p>
              </div>
            </div>

            {/* Photo 1: Acai de perto */}
            <div className="bg-white border border-brand-purple/15 rounded-3xl p-3 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="relative aspect-video sm:aspect-square md:aspect-video rounded-2xl overflow-hidden bg-cream-bg">
                <img
                  src="/acai_de_perto.jpg"
                  alt="Açaí cremoso de perto"
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>
              <div className="mt-3 px-2">
                <h4 className="font-heading font-bold text-sm text-brand-purple">Açaí Premium</h4>
                <p className="text-[10px] text-brand-muted font-semibold mt-0.5">Textura firme que não derrete rápido na pista de dança.</p>
              </div>
            </div>

            {/* Photo 2: Sorvete de perto */}
            <div className="bg-white border border-brand-purple/15 rounded-3xl p-3 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="relative aspect-video sm:aspect-square md:aspect-video rounded-2xl overflow-hidden bg-cream-bg">
                <img
                  src="/sorvete_de_perto.jpg"
                  alt="Sorvetes variados"
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>
              <div className="mt-3 px-2">
                <h4 className="font-heading font-bold text-sm text-brand-purple">Combinações Infinitas</h4>
                <p className="text-[10px] text-brand-muted font-semibold mt-0.5">Mais sabor e frescor com frutas e caldas à sua escolha.</p>
              </div>
            </div>

            {/* Video 3: Festa Kids */}
            <div className="bg-white border border-brand-purple/15 rounded-3xl p-3 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="relative aspect-video sm:aspect-square md:aspect-video rounded-2xl overflow-hidden bg-black">
                <video
                  src="/festa_kids.mp4"
                  controls
                  preload="metadata"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="mt-3 px-2">
                <h4 className="font-heading font-bold text-sm text-brand-purple">Festa Infantil</h4>
                <p className="text-[10px] text-brand-muted font-semibold mt-0.5">Sucesso absoluto com a criançada no Festeja Kids.</p>
              </div>
            </div>

            {/* Photo 3: Fila de Atendimento */}
            <div className="bg-white border border-brand-purple/15 rounded-3xl p-3 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="relative aspect-video sm:aspect-square md:aspect-video rounded-2xl overflow-hidden bg-cream-bg">
                <img
                  src="/fila_atendimento.jpg"
                  alt="Fila de atendimento rápida"
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>
              <div className="mt-3 px-2">
                <h4 className="font-heading font-bold text-sm text-brand-purple">Operação Sem Fila</h4>
                <p className="text-[10px] text-brand-muted font-semibold mt-0.5">Serviço dinâmico para garantir fluidez e diversão.</p>
              </div>
            </div>

            {/* Photo 4: Mesa Decorada Real */}
            <div className="bg-white border border-brand-purple/15 rounded-3xl p-3 shadow-sm hover:shadow-md transition-all duration-300 col-span-1 sm:col-span-2 lg:col-span-2">
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-cream-bg">
                <img
                  src="/imagem_principal.jpg"
                  alt="Mesa decorada do Recanto"
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>
              <div className="mt-3 px-2">
                <h4 className="font-heading font-bold text-sm text-brand-purple">Estrutura Gourmet Completa</h4>
                <p className="text-[10px] text-brand-muted font-semibold mt-0.5">Visual rústico e sofisticado que se integra perfeitamente à decoração da sua festa.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TEAM SECTION */}
      <section className="py-24 bg-white border-t border-brand-purple/10">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-16">
            <span className="text-brand-pink font-heading font-black text-xs uppercase tracking-wider">
              NOSSA EQUIPE
            </span>
            <h2 className="font-heading font-black text-3xl sm:text-4xl text-brand-purple-dark mt-2 mb-4">
              Quem Faz a Magia Acontecer ✨
            </h2>
            <p className="text-brand-muted text-sm font-semibold leading-relaxed">
              Conheça as pessoas dedicadas a fazer do seu evento um momento doce, inesquecível e livre de preocupações.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Card 1: Moisés */}
            <div className="card-premium text-center">
              <img
                src="/equipe_completa.jpg"
                alt="Moisés - Dono do Recanto"
                className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-white shadow-md mb-4"
              />
              <h3 className="font-heading font-bold text-lg text-brand-purple">Moisés</h3>
              <span className="inline-block bg-brand-purple/10 text-brand-purple font-extrabold text-[9px] uppercase tracking-wider px-3 py-1 rounded-full mt-1 mb-3">Fundador & Dono</span>
              <p className="text-xs text-brand-muted font-semibold leading-relaxed">Responsável direto por toda a logística operacional, transporte e pela excelência do açaí e sorvete gourmet servidos no seu grande dia.</p>
            </div>

            {/* Card 2: Naiara */}
            <div className="card-premium text-center">
              <img
                src="/naiara_equipe.webp"
                alt="Naiara - Sócia e Comercial"
                className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-white shadow-md mb-4"
              />
              <h3 className="font-heading font-bold text-lg text-brand-purple">Naiara</h3>
              <span className="inline-block bg-brand-pink/10 text-brand-pink font-extrabold text-[9px] uppercase tracking-wider px-3 py-1 rounded-full mt-1 mb-3">Sócia & Comercial</span>
              <p className="text-xs text-brand-muted font-semibold leading-relaxed">Sua parceira desde o primeiro contato. Cuida do atendimento no WhatsApp, elabora os orçamentos e planeja cada detalhe para o buffet ser perfeito.</p>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section className="py-24 bg-brand-blue/10 border-y border-brand-purple/10">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-16">
            <span className="text-brand-purple font-heading font-black text-xs uppercase tracking-wider">
              QUEM JÁ ADOÇOU A FESTA
            </span>
            <h2 className="font-heading font-black text-3xl sm:text-4xl text-brand-purple-dark mt-2 mb-4">
              O que os Cariocas dizem sobre o Recanto
            </h2>
            <p className="text-brand-muted text-sm font-semibold">
              Histórias reais de noivos, pais e diretores de empresas que contrataram nossa equipe.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { text: '"Contratei o buffet de 3 horas para o aniversário de 8 anos da minha filha. As crianças e os adultos piraram! O açaí estava super cremoso e os acompanhamentos eram fresquinhos. O atendente foi super atencioso. Recomendo muito!"', author: 'Mariana Costa', role: 'Aniversário Infantil' },
              { text: '"Colocamos o carrinho de açaí e sorvete na pista de dança do nosso casamento (pacote de 4 horas). Foi a melhor decisão que tomamos! Deu uma energia enorme nos convidados e a mesa ficou linda, super combinou com a decoração rústica do local."', author: 'Juliana & Thiago', role: 'Casamento no Campo' },
              { text: '"Excelente serviço para o nosso evento corporativo de fim de ano. Foram muito pontuais, a estrutura é bonita e organizada, e o atendimento foi rápido mesmo com mais de 100 colaboradores. Aprovado!"', author: 'Ricardo Santos', role: 'Diretor de RH - Tech Solutions' }
            ].map((t, i) => (
              <div key={i} className="bg-white border border-brand-purple/15 p-8 rounded-2xl shadow-sm flex flex-col justify-between">
                <p className="text-sm italic font-medium leading-relaxed text-brand-text mb-6">
                  {t.text}
                </p>
                <div className="border-t border-brand-purple/10 pt-4 flex flex-col">
                  <span className="font-heading font-bold text-sm text-brand-purple">{t.author}</span>
                  <span className="text-[10px] font-bold text-brand-muted uppercase tracking-wider">{t.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="py-24">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-16">
            <span className="text-brand-pink font-heading font-black text-xs uppercase tracking-wider">
              DÚVIDAS FREQUENTES
            </span>
            <h2 className="font-heading font-black text-3xl sm:text-4xl text-brand-purple-dark mt-2 mb-4">
              Dúvidas Frequentes sobre Buffet de Açaí
            </h2>
            <p className="text-brand-muted text-sm font-semibold">
              Tudo o que você precisa saber sobre a contratação do nosso buffet de açaí.
            </p>
          </div>

          <div className="max-w-2xl mx-auto flex flex-col gap-4">
            {[
              { q: 'Vocês atendem em quais regiões?', a: 'Atendemos toda a cidade do Rio de Janeiro, Niterói e Baixada Fluminense. Dependendo da distância do local do evento, pode ser cobrada uma taxa de deslocamento sob consulta.' },
              { q: 'O que acontece se o evento tiver mais convidados que o pacote?', a: 'Nossos pacotes base cobrem até 50 pessoas. Caso o número seja maior, oferecemos faixas adicionais bem acessíveis diretamente no nosso simulador de orçamentos.' },
              { q: 'O que vocês precisam no local da festa?', a: 'Precisamos apenas de um espaço plano de aproximadamente 2m x 2m para posicionar a mesa e uma tomada elétrica convencional por perto para ligar nossos equipamentos.' },
              { q: 'Como funciona a forma de pagamento?', a: 'Para fechar a reserva da data, solicitamos 50% de sinal em Pix ou transferência. Os outros 50% são pagos no início da montagem, diretamente no dia do evento.' }
            ].map((faq, index) => (
              <div key={index} className="bg-white border border-brand-purple/15 rounded-2xl overflow-hidden shadow-sm">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-8 py-6 text-left font-heading font-bold text-base text-brand-purple flex justify-between items-center hover:bg-brand-purple/2 transition-colors duration-200"
                >
                  <span>{faq.q}</span>
                  <span className={`text-xl text-brand-pink font-normal transition-transform duration-250 ${activeFaq === index ? 'transform rotate-45' : ''}`}>
                    ➕
                  </span>
                </button>
                <div
                  className={`px-8 overflow-hidden transition-all duration-300 ${
                    activeFaq === index ? 'max-h-40 pb-6' : 'max-h-0'
                  }`}
                >
                  <p className="text-xs text-brand-muted font-medium leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form section moved above */}

      {/* FOOTER */}
      <footer className="bg-brand-purple-dark py-16 text-white border-t border-brand-purple/10">
        <div className="container mx-auto px-6 grid md:grid-cols-3 gap-12 mb-12">
          <div className="flex flex-col gap-4">
            <a href="#" className="flex items-center gap-3 hover:scale-102 transition-transform duration-200">
              <img src="/logo.png" alt="Logo" className="h-12 w-12 object-contain rounded-full shadow-md border-2 border-white/10" />
              <div className="flex flex-col">
                <span className="font-heading font-black text-2xl tracking-tight text-white leading-none mb-1">
                  Recanto <span className="text-brand-pink">do Açaí</span>
                </span>
                <span className="text-[9px] font-extrabold uppercase tracking-widest text-white/50">
                  Buffet & Eventos Gourmet
                </span>
              </div>
            </a>
            <p className="text-xs text-white/70 leading-relaxed max-w-xs">
              Leve sabor, alegria e interatividade para a sua festa. Serviço completo de buffet móvel com qualidade garantida.
            </p>
            <div className="flex gap-3">
              {['instagram', 'whatsapp'].map((s, idx) => (
                <a
                  key={idx}
                  href={s === 'instagram' ? 'https://instagram.com/recantodoacai.rj' : `https://api.whatsapp.com/send?phone=${STORE_WHATSAPP_NUMBER}&text=Ol%C3%A1!%20Estou%20no%20site%20do%20Recanto%20Eventos%20e%20gostaria%20de%20solicitar%20um%20or%C3%A7amento.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => pushGTMEvent('social_icon_clicked', { platform: s })}
                  className="w-11 h-11 rounded-full bg-white/8 border border-white/15 flex items-center justify-center hover:bg-brand-pink hover:border-brand-pink transition-all duration-200 cursor-pointer"
                  aria-label={s}
                >
                  <span className="text-sm">{s === 'instagram' ? '📸' : '💬'}</span>
                </a>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <h4 className="font-heading font-bold text-lg text-white relative pb-3 after:absolute after:bottom-0 after:left-0 after:w-10 after:h-0.75 after:bg-brand-yellow">
              Navegação
            </h4>
            <ul className="flex flex-col gap-3">
              {['hero', 'packages', 'whats-included', 'faq'].map((sec) => {
                const labels = {
                  hero: 'Início',
                  packages: 'Combos Gourmet',
                  'whats-included': 'Experiência',
                  faq: 'Dúvidas Frequentes'
                };
                return (
                  <li key={sec}>
                    <a href={`#${sec}`} className="text-xs text-white/70 hover:text-brand-yellow hover:pl-1 transition-all duration-200">
                      {labels[sec]}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="flex flex-col gap-6">
            <h4 className="font-heading font-bold text-lg text-white relative pb-3 after:absolute after:bottom-0 after:left-0 after:w-10 after:h-0.75 after:bg-brand-yellow">
              Contato
            </h4>
            <div className="flex flex-col gap-3 text-xs text-white/70">
              <p><strong>E-mail:</strong><br />eventos@recantodoacai.com.br</p>
              <p><strong>WhatsApp:</strong><br />(21) 98174-9450</p>
              <p className="text-brand-yellow font-bold">📍 Central: Rua de Copacabana, 456 - Copacabana, Rio de Janeiro</p>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 pt-8 text-center text-xs text-white/50">
          <p>&copy; 2026 Recanto do Açaí Eventos. Todos os direitos reservados. Feito com amor 💜</p>
        </div>
      </footer>

      {/* CHATBOT & CRM FLOATING WIDGET */}
      <div className="fixed bottom-6 right-6 z-45">
        {!chatOpen ? (
          <button
            onClick={() => {
              pushGTMEvent('chatbot_opened', { source: 'floating_button' });
              setChatOpen(true);
            }}
            className="flex items-center gap-3 bg-brand-purple hover:bg-brand-purple-light text-white font-extrabold px-5 py-4 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 relative group animate-float-custom cursor-pointer border-2 border-white/30"
          >
            <div className="relative">
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-brand-green rounded-full border-2 border-white animate-pulse" />
              <img src="/naiara_equipe.webp" className="w-8 h-8 rounded-full border border-white/20 bg-white object-cover" alt="Naiara" />
            </div>
            <span className="text-xs tracking-wider pr-1 font-heading">Conversar com Naiara (IA)</span>
          </button>
        ) : (
          <div className="w-[94vw] md:w-[820px] h-[550px] bg-white border border-brand-purple/20 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row transition-all duration-300 max-w-[94vw] md:max-w-none transform scale-100 origin-bottom-right">
            {/* Left Column: Chat Container */}
            <div className="flex-1 flex flex-col h-full bg-cream-bg border-r border-brand-purple/10">
              {/* Header */}
              <div className="bg-brand-purple text-white p-4 flex items-center justify-between shadow-md">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-brand-green rounded-full border border-brand-purple" />
                    <img src="/naiara_equipe.webp" className="w-10 h-10 rounded-full border border-white/20 bg-white object-cover" alt="Naiara" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-black font-heading leading-tight">Naiara (IA) 🍨</span>
                    <span className="text-[9px] text-white/70 font-semibold tracking-wide">Especialista de Vendas (Carioca)</span>
                  </div>
                </div>

                {/* Mobile Tab Toggle */}
                <div className="md:hidden flex bg-white/10 rounded-lg p-0.5 gap-1 text-[10px] font-bold">
                  <button
                    onClick={() => setActiveTab('chat')}
                    className={`px-3 py-1 rounded-md transition-all duration-200 ${activeTab === 'chat' ? 'bg-white text-brand-purple shadow-sm' : 'text-white'}`}
                  >
                    Chat
                  </button>
                  <button
                    onClick={() => setActiveTab('crm')}
                    className={`px-3 py-1 rounded-md transition-all duration-200 ${activeTab === 'crm' ? 'bg-white text-brand-purple shadow-sm' : 'text-white'}`}
                  >
                    CRM
                  </button>
                </div>

                <button
                  onClick={() => {
                    pushGTMEvent('chatbot_closed');
                    setChatOpen(false);
                  }}
                  className="text-white/80 hover:text-white p-1 hover:bg-white/10 rounded-full transition-all cursor-pointer"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Messages List */}
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex flex-col max-w-[85%] ${
                      m.sender === 'user' ? 'self-end items-end' : 'self-start items-start'
                    }`}
                  >
                    <div
                      className={`p-3 rounded-2xl text-[12px] font-semibold leading-relaxed shadow-sm ${
                        m.sender === 'user'
                          ? 'bg-brand-purple text-white rounded-tr-none'
                          : 'bg-white text-brand-text border border-brand-purple/10 rounded-tl-none'
                      }`}
                    >
                      {m.text.split('\n').map((line, idx) => (
                        <p key={idx} className={idx > 0 ? 'mt-1' : ''}>{line}</p>
                      ))}
                    </div>
                    <span className="text-[9px] text-brand-muted mt-1 px-1 font-bold">{m.time}</span>
                  </div>
                ))}

                {isTyping && (
                  <div className="self-start flex flex-col items-start max-w-[85%]">
                    <div className="bg-white text-brand-text border border-brand-purple/10 p-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-brand-purple/40 rounded-full animate-bounce" />
                      <span className="w-2 h-2 bg-brand-purple/60 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <span className="w-2 h-2 bg-brand-purple/80 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Quick Replies Panel */}
              <div className="px-4 py-2 bg-white/40 border-t border-brand-purple/5 flex gap-2 overflow-x-auto whitespace-nowrap py-2.5">
                {[
                  { label: '👋 Oi, quero preços', text: 'Oi, quero saber os preços e pacotes.' },
                  { label: '🗓️ Consultar Copacabana dia 15/11', text: 'Preciso de buffet para 100 convidados em Copacabana dia 15/11.' },
                  { label: '👥 Evento para 180 pessoas', text: 'Quero fazer um evento corporativo para 180 pessoas.' },
                  { label: '📞 Chamar humano', text: 'Quero falar com um atendente humano.' },
                  { label: '💳 Confirmar Pix de sinal', text: 'Quero fazer o Pix de 50% de sinal para fechar.' }
                ].map((qr, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      pushGTMEvent('quick_reply_clicked', { label: qr.label, text: qr.text });
                      handleSendMessage(qr.text);
                    }}
                    className="text-[10px] font-extrabold text-brand-purple bg-white border border-brand-purple/15 rounded-full px-3 py-1.5 hover:bg-brand-purple hover:text-white transition-all duration-200 cursor-pointer"
                  >
                    {qr.label}
                  </button>
                ))}
              </div>

              {/* Input Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  pushGTMEvent('chatbot_message_sent', { text_length: inputText.length });
                  handleSendMessage();
                }}
                className="p-3 bg-white border-t border-brand-purple/10 flex gap-2"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Digite sua mensagem (ex: nome, local, data...)"
                  className="flex-1 bg-cream-bg border border-brand-purple/15 rounded-xl px-4 py-2 text-xs font-semibold outline-none focus:border-brand-purple"
                />
                <button
                  type="submit"
                  className="bg-brand-purple hover:bg-brand-purple-light text-white p-2 rounded-xl transition-all duration-200 flex items-center justify-center w-10 h-10 shadow-sm cursor-pointer"
                >
                  <svg className="w-4.5 h-4.5 transform rotate-90" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
                </button>
              </form>
            </div>

            {/* Right Column: CRM Panel */}
            <div
              className={`w-full md:w-[300px] bg-white flex flex-col h-full border-t md:border-t-0 md:border-l border-brand-purple/10 ${
                activeTab === 'crm' ? 'block' : 'hidden md:flex'
              }`}
            >
              {/* CRM Title */}
              <div className="bg-brand-text text-white p-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2">
                  <span>📊</span>
                  <span className="text-xs font-black uppercase tracking-wider font-heading">CRM & Lead Tracking</span>
                </div>
                <button
                  onClick={handleResetSimulation}
                  className="text-[10px] font-black uppercase text-brand-yellow hover:underline cursor-pointer"
                  title="Reiniciar Simulação"
                >
                  Resetar
                </button>
              </div>

              {/* CRM Body */}
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
                {/* Score Circular gauge */}
                <div className="bg-cream-bg rounded-2xl p-4 border border-brand-purple/10 flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-black uppercase tracking-wider text-brand-muted">Lead Score</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-brand-purple-dark">{crmState.score}</span>
                      <span className="text-xs text-brand-muted font-bold">/100</span>
                    </div>
                    <span className="text-[10px] font-extrabold text-brand-muted">
                      Status: <span className="text-brand-purple font-black">{crmState.status}</span>
                    </span>
                  </div>

                  {/* SVG Circle Gauge */}
                  <div className="relative w-14 h-14 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="28" cy="28" r="22" className="stroke-white fill-none" strokeWidth="4.5" />
                      <circle
                        cx="28"
                        cy="28"
                        r="22"
                        className="stroke-brand-purple fill-none transition-all duration-500"
                        strokeWidth="4.5"
                        strokeDasharray="138"
                        strokeDashoffset={138 - (138 * crmState.score) / 100}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <span className="text-[9px] font-black text-brand-purple">{crmState.score}%</span>
                    </div>
                  </div>
                </div>

                {/* Lead Temperature */}
                <div className="flex items-center justify-between px-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-brand-muted font-heading">Temperatura:</span>
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      crmState.score < 40
                        ? 'bg-blue-100 text-blue-800'
                        : crmState.score <= 75
                        ? 'bg-orange-100 text-orange-800 animate-pulse'
                        : 'bg-red-100 text-red-800 font-bold border border-red-200 shadow-sm animate-pulse'
                    }`}
                  >
                    {crmState.temperatura}
                  </span>
                </div>

                {/* Collected Fields Checklist (Interactive Console) */}
                <div className="flex flex-col gap-3">
                  <span className="text-[10px] font-black uppercase tracking-wider text-brand-muted px-1 font-heading">Campos do Lead (Editável)</span>
                  <div className="grid grid-cols-1 gap-2 text-[10px] font-bold">
                    
                    {/* Nome Input */}
                    <div className="flex flex-col gap-0.5">
                      <label className="text-[8px] uppercase tracking-wide text-brand-muted pl-1">Nome Completo</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={crmState.nome}
                          onChange={(e) => handleCRMFieldChange('nome', e.target.value)}
                          placeholder="Não informado"
                          className="w-full bg-cream-bg border border-brand-purple/10 rounded-xl px-3 py-1.5 text-xs font-semibold focus:border-brand-purple outline-none"
                        />
                        <span className="absolute right-3 top-2 text-xs">{crmState.nome ? '✅' : '❌'}</span>
                      </div>
                    </div>

                    {/* WhatsApp Input */}
                    <div className="flex flex-col gap-0.5">
                      <label className="text-[8px] uppercase tracking-wide text-brand-muted pl-1">WhatsApp</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={crmState.telefone}
                          onChange={(e) => handleCRMFieldChange('telefone', e.target.value)}
                          placeholder="Não informado"
                          className="w-full bg-cream-bg border border-brand-purple/10 rounded-xl px-3 py-1.5 text-xs font-semibold focus:border-brand-purple outline-none"
                        />
                        <span className="absolute right-3 top-2 text-xs">{crmState.telefone ? '✅' : '❌'}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {/* Data Input */}
                      <div className="flex flex-col gap-0.5">
                        <label className="text-[8px] uppercase tracking-wide text-brand-muted pl-1">Data Evento</label>
                        <div className="relative">
                          <input
                            type="text"
                            value={crmState.data}
                            onChange={(e) => handleCRMFieldChange('data', e.target.value)}
                            placeholder="DD/MM/AAAA"
                            className="w-full bg-cream-bg border border-brand-purple/10 rounded-xl px-3 py-1.5 text-xs font-semibold focus:border-brand-purple outline-none"
                          />
                          <span className="absolute right-2 top-2 text-[10px]">{crmState.data ? '✅' : '❌'}</span>
                        </div>
                      </div>

                      {/* Local Bairro */}
                      <div className="flex flex-col gap-0.5">
                        <label className="text-[8px] uppercase tracking-wide text-brand-muted pl-1">Bairro / RJ</label>
                        <div className="relative">
                          <input
                            type="text"
                            value={crmState.local}
                            onChange={(e) => handleCRMFieldChange('local', e.target.value)}
                            placeholder="Local do evento"
                            className="w-full bg-cream-bg border border-brand-purple/10 rounded-xl px-3 py-1.5 text-xs font-semibold focus:border-brand-purple outline-none"
                          />
                          <span className="absolute right-2 top-2 text-[10px]">{crmState.local ? '✅' : '❌'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {/* Convidados Dropdown */}
                      <div className="flex flex-col gap-0.5">
                        <label className="text-[8px] uppercase tracking-wide text-brand-muted pl-1">Convidados</label>
                        <select
                          value={crmState.convidados}
                          onChange={(e) => handleCRMFieldChange('convidados', e.target.value)}
                          className="w-full bg-cream-bg border border-brand-purple/10 rounded-xl px-3 py-1.5 text-xs font-semibold focus:border-brand-purple outline-none cursor-pointer"
                        >
                          <option value="">Selecione...</option>
                          <option value="50">Até 50</option>
                          <option value="80">Até 80</option>
                          <option value="120">Até 120</option>
                          <option value="150">Até 150</option>
                          <option value="200">Mais de 150</option>
                        </select>
                      </div>

                      {/* Pacote Dropdown */}
                      <div className="flex flex-col gap-0.5">
                        <label className="text-[8px] uppercase tracking-wide text-brand-muted pl-1">Pacote</label>
                        <select
                          value={crmState.pacote}
                          onChange={(e) => handleCRMFieldChange('pacote', e.target.value)}
                          className="w-full bg-cream-bg border border-brand-purple/10 rounded-xl px-3 py-1.5 text-xs font-semibold focus:border-brand-purple outline-none cursor-pointer"
                        >
                          <option value="">Selecione...</option>
                          <option value="Express (3 Horas)">Express (3h)</option>
                          <option value="Premium (4 Horas)">Premium (4h)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tool Call Terminal Console Logs */}
                <div className="flex flex-col gap-2 flex-1 min-h-[120px]">
                  <span className="text-[10px] font-black uppercase tracking-wider text-brand-muted px-1 flex justify-between items-center font-heading">
                    <span>Ações Executadas (Logs da IA)</span>
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" />
                  </span>
                  <div className="bg-gray-950 font-mono text-[9px] text-green-400 p-3 rounded-2xl overflow-y-auto flex-1 h-36 scrollbar-thin shadow-inner border border-white/5">
                    {crmState.logs.map((log, index) => (
                      <div key={index} className="mb-1.5 break-all leading-normal">
                        <span className="text-gray-500">[{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span>{' '}
                        <span className={log.startsWith('[Tool Call]') ? 'text-brand-yellow font-semibold' : log.startsWith('[System]') ? 'text-blue-400' : 'text-green-300'}>
                          {log}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CHOICE SELECTION MODAL */}
      {showChoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-md transition-all duration-300">
          <div className="bg-white border-2 border-brand-purple/10 rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden max-h-[90vh] overflow-y-auto">
            {/* Top color bar */}
            <div className="h-2 w-full bg-gradient-to-r from-brand-purple via-brand-pink to-brand-yellow" />
            
            <div className="p-8 sm:p-10 relative">
              {/* Close Button */}
              <button
                onClick={() => setShowChoiceModal(false)}
                className="absolute top-6 right-6 text-brand-muted hover:text-brand-purple transition-all p-1 hover:bg-cream-bg rounded-full cursor-pointer"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="text-center mb-8">
                <span className="text-brand-pink font-heading font-black text-xs uppercase tracking-wider">
                  QUASE LÁ!
                </span>
                <h3 className="font-heading font-black text-2xl sm:text-3xl text-brand-purple-dark mt-1">
                  Como prefere prosseguir?
                </h3>
                <p className="text-brand-muted text-xs font-semibold mt-1.5">
                  Escolha a forma mais conveniente para finalizar o fechamento do seu buffet.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-5">
                {/* Option 1: Checkout Online */}
                <div className="border-2 border-brand-pink bg-brand-pink/2 rounded-2xl p-5 flex flex-col justify-between hover:scale-102 transition-all duration-200 shadow-sm relative overflow-hidden">
                  <span className="absolute -top-1.5 -right-5 bg-brand-pink text-white font-extrabold text-[8px] uppercase tracking-wider px-6 py-2 rotate-45">
                    Rápido
                  </span>
                  <div>
                    <div className="text-3xl mb-3">💳</div>
                    <h4 className="font-heading font-bold text-sm text-brand-purple-dark">Fechar Online</h4>
                    <p className="text-[10px] text-brand-muted font-medium mt-2 leading-relaxed">
                      Pague online via Pix (com desconto) ou em até 12x no cartão de crédito via Stripe. Seguro e imediato!
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      pushGTMEvent('choice_modal_option_clicked', { option: 'checkout_online', duration: simDuration, guests: simGuests, total: simTotal });
                      setShowChoiceModal(false);
                      setCheckoutOpen(true);
                      setCheckoutStep('form');
                    }}
                    className="w-full btn bg-brand-pink hover:bg-brand-pink-light text-white font-bold py-2.5 rounded-xl text-xs mt-5 shadow-sm transition-all"
                  >
                    Fechar Online Agora
                  </button>
                </div>

                {/* Option 2: WhatsApp */}
                <div className="border border-brand-purple/15 hover:border-brand-green bg-white rounded-2xl p-5 flex flex-col justify-between hover:scale-102 transition-all duration-200 shadow-sm">
                  <div>
                    <div className="text-3xl mb-3">💬</div>
                    <h4 className="font-heading font-bold text-sm text-brand-purple-dark">WhatsApp</h4>
                    <p className="text-[10px] text-brand-muted font-medium mt-2 leading-relaxed">
                      Fale com a nossa equipe de consultores no WhatsApp. Tire dúvidas e finalize a contratação de forma humana.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      pushGTMEvent('choice_modal_option_clicked', { option: 'whatsapp_redirect', duration: simDuration, guests: simGuests, total: simTotal });
                      handleWhatsAppRedirect();
                    }}
                    className="w-full btn bg-brand-green hover:bg-[#20834c] text-white font-bold py-2.5 rounded-xl text-xs mt-5 shadow-sm transition-all"
                  >
                    Chamar no WhatsApp
                  </button>
                </div>

                {/* Option 3: Naiara Chat */}
                <div className="border border-brand-purple/15 hover:border-brand-purple bg-white rounded-2xl p-5 flex flex-col justify-between hover:scale-102 transition-all duration-200 shadow-sm">
                  <div>
                    <div className="text-3xl mb-3">🤖</div>
                    <h4 className="font-heading font-bold text-sm text-brand-purple-dark">Negociar via Chat</h4>
                    <p className="text-[10px] text-brand-muted font-medium mt-2 leading-relaxed">
                      Negocie e simule novos cenários com a Naiara, nossa inteligência artificial de vendas comercial.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      pushGTMEvent('choice_modal_option_clicked', { option: 'chat_with_ia', duration: simDuration, guests: simGuests, total: simTotal });
                      setShowChoiceModal(false);
                      setChatOpen(true);
                    }}
                    className="w-full btn bg-brand-purple hover:bg-brand-purple-light text-white font-bold py-2.5 rounded-xl text-xs mt-5 shadow-sm transition-all"
                  >
                    Conversar com IA
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CHECKOUT WIZARD MODAL */}
      {checkoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-all duration-300">
          <div className="bg-white border-2 border-brand-purple/10 rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden max-h-[92vh] overflow-y-auto">
            {/* Top decorative gradient line */}
            <div className="h-2 w-full bg-gradient-to-r from-brand-purple via-brand-pink to-brand-yellow" />
            
            {/* Modal Header */}
            <div className="bg-brand-purple text-white px-8 py-5 flex items-center justify-between shadow-md">
              <div className="flex items-center gap-3">
                <span className="text-xl">🔒</span>
                <div>
                  <h3 className="font-heading font-black text-lg leading-none">Checkout Seguro Stripe</h3>
                  <span className="text-[9px] text-white/70 font-semibold uppercase tracking-wider">Fatura: {invoiceNumber}</span>
                </div>
              </div>
              <button
                onClick={() => setCheckoutOpen(false)}
                className="text-white/80 hover:text-white p-1.5 hover:bg-white/10 rounded-full transition-all cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Checkout Wizard Content */}
            <div className="p-8">
              {/* Wizard Steps indicator */}
              <div className="flex justify-between items-center max-w-md mx-auto mb-8 border-b border-brand-purple/5 pb-5">
                {[
                  { key: 'form', label: '1. Dados' },
                  { key: 'summary', label: '2. Resumo' },
                  { key: 'payment', label: '3. Pagamento' },
                  { key: 'success', label: '4. Sucesso' }
                ].map((s, index) => {
                  const isActive = checkoutStep === s.key;
                  const isCompleted = ['form', 'summary', 'payment', 'success'].indexOf(checkoutStep) > ['form', 'summary', 'payment', 'success'].indexOf(s.key);
                  return (
                    <div key={s.key} className="flex items-center gap-2">
                      <span className={`text-xs font-bold ${isActive ? 'text-brand-pink' : isCompleted ? 'text-brand-green' : 'text-brand-muted'}`}>
                        {s.label}
                      </span>
                      {index < 3 && <span className="text-brand-muted text-xs">➔</span>}
                    </div>
                  );
                })}
              </div>

              {/* Step 1: Client details for contract */}
              {checkoutStep === 'form' && (
                <div className="max-w-xl mx-auto flex flex-col gap-5">
                  <h4 className="font-heading font-bold text-lg text-brand-purple-dark">Informações do Contratante</h4>
                  <p className="text-[11px] text-brand-muted -mt-3">Necessitamos dos dados fiscais para gerar o contrato eletrônico de buffet.</p>
                  
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] font-black uppercase text-brand-muted pl-1">Nome do Contratante</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full bg-cream-bg border border-brand-purple/15 rounded-xl h-11 px-4 text-xs font-semibold outline-none focus:border-brand-purple"
                        placeholder="Ex: Maria Santos"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] font-black uppercase text-brand-muted pl-1">WhatsApp de Contato</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full bg-cream-bg border border-brand-purple/15 rounded-xl h-11 px-4 text-xs font-semibold outline-none focus:border-brand-purple"
                        placeholder="(21) 98765-4321"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] font-black uppercase text-brand-muted pl-1">E-mail para Faturamento</label>
                      <input
                        type="email"
                        id="email"
                        value={checkoutData.email}
                        onChange={handleCheckoutDataChange}
                        className="w-full bg-cream-bg border border-brand-purple/15 rounded-xl h-11 px-4 text-xs font-semibold outline-none focus:border-brand-purple"
                        placeholder="maria@gmail.com"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] font-black uppercase text-brand-muted pl-1">CPF / CNPJ</label>
                      <input
                        type="text"
                        id="cpf"
                        value={checkoutData.cpf}
                        onChange={handleCheckoutDataChange}
                        className="w-full bg-cream-bg border border-brand-purple/15 rounded-xl h-11 px-4 text-xs font-semibold outline-none focus:border-brand-purple"
                        placeholder="000.000.000-00"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-4">
                    <button
                      onClick={() => setCheckoutOpen(false)}
                      className="btn bg-white text-brand-purple border border-brand-purple/20 px-6 py-3 rounded-full text-xs font-bold"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => {
                        if (!formData.name.trim() || !formData.phone.trim() || !checkoutData.email.trim() || !checkoutData.cpf.trim()) {
                          showToast('Por favor, preencha todos os campos contratantes.', 'error');
                          return;
                        }
                        setCheckoutStep('summary');
                      }}
                      className="btn bg-brand-pink text-white px-8 py-3 rounded-full text-xs font-bold hover:scale-102 transition-all"
                    >
                      Ver Resumo do Pedido ➔
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Invoice & Contract summary */}
              {checkoutStep === 'summary' && (
                <div className="max-w-2xl mx-auto flex flex-col gap-5">
                  <h4 className="font-heading font-bold text-lg text-brand-purple-dark">Confirmar Espelho de Reserva</h4>
                  
                  {/* Premium Invoice details */}
                  <div className="bg-cream-bg border border-brand-purple/10 rounded-2xl p-6 flex flex-col gap-4">
                    <div className="flex justify-between items-center border-b border-brand-purple/10 pb-3">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black uppercase text-brand-muted">CONTRATANTE</span>
                        <span className="text-xs font-bold text-brand-purple-dark">{formData.name}</span>
                      </div>
                      <div className="flex flex-col text-right">
                        <span className="text-[9px] font-black uppercase text-brand-muted">DATA DO EVENTO</span>
                        <span className="text-xs font-bold text-brand-purple-dark">
                          {formData.date.split('-').reverse().join('/')}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 border-b border-brand-purple/10 pb-3 text-xs">
                      <div className="flex justify-between">
                        <span className="font-semibold text-brand-text">Pacote Selecionado:</span>
                        <span className="font-bold text-brand-purple">{formData.package.split('(')[0]}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold text-brand-text">Convidados Mapeados:</span>
                        <span className="font-bold text-brand-purple">{formData.guests}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold text-brand-text">Local do Serviço:</span>
                        <span className="font-bold text-brand-purple">{formData.local}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 text-xs">
                      <div className="flex justify-between font-bold text-brand-purple-dark text-sm mt-1">
                        <span>Valor Total Estimado:</span>
                        <span>{formatCurrency(simTotal)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment option checklist */}
                  <div className="flex flex-col gap-2">
                    <span className="text-[9px] font-black uppercase tracking-wider text-brand-muted pl-1">Escolha a Opção de Faturamento</span>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div
                        onClick={() => setPaymentOption('sinal')}
                        className={`border rounded-2xl p-4 cursor-pointer transition-all flex flex-col justify-between ${paymentOption === 'sinal' ? 'border-brand-pink bg-brand-pink/2' : 'border-brand-purple/15 bg-white'}`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-brand-purple-dark">Pagar Sinal (50%)</span>
                          <span className={`w-4 h-4 rounded-full border flex items-center justify-center text-[8px] ${paymentOption === 'sinal' ? 'border-brand-pink bg-brand-pink text-white font-bold' : 'border-brand-muted'}`}>
                            {paymentOption === 'sinal' ? '✓' : ''}
                          </span>
                        </div>
                        <span className="text-lg font-black text-brand-purple-dark mt-3">
                          {formatCurrency(typeof simTotal === 'number' ? simTotal / 2 : 645)}
                        </span>
                        <p className="text-[9px] text-brand-muted mt-1 leading-normal">O restante (50%) é pago no início da montagem diretamente no dia do evento.</p>
                      </div>

                      <div
                        onClick={() => setPaymentOption('integral')}
                        className={`border rounded-2xl p-4 cursor-pointer transition-all flex flex-col justify-between ${paymentOption === 'integral' ? 'border-brand-pink bg-brand-pink/2' : 'border-brand-purple/15 bg-white'}`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-brand-purple-dark">Pagar Integral (100%)</span>
                          <span className={`w-4 h-4 rounded-full border flex items-center justify-center text-[8px] ${paymentOption === 'integral' ? 'border-brand-pink bg-brand-pink text-white font-bold' : 'border-brand-muted'}`}>
                            {paymentOption === 'integral' ? '✓' : ''}
                          </span>
                        </div>
                        <span className="text-lg font-black text-brand-purple-dark mt-3">
                          {formatCurrency(typeof simTotal === 'number' ? simTotal : 1290)}
                        </span>
                        <p className="text-[9px] text-brand-muted mt-1 leading-normal">Garante 100% de desconto em taxas de faturamento e quitação imediata do contrato.</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between gap-3 mt-4">
                    <button
                      onClick={() => setCheckoutStep('form')}
                      className="btn bg-white text-brand-purple border border-brand-purple/20 px-6 py-3 rounded-full text-xs font-bold"
                    >
                      Voltar
                    </button>
                    <button
                      onClick={() => setCheckoutStep('payment')}
                      className="btn bg-brand-pink text-white px-8 py-3 rounded-full text-xs font-bold hover:scale-102 transition-all"
                    >
                      Ir para Pagamento ➔
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Payment details Stripe/Pix */}
              {checkoutStep === 'payment' && (
                <div className="max-w-xl mx-auto flex flex-col gap-5">
                  <h4 className="font-heading font-bold text-lg text-brand-purple-dark">Processar Pagamento Seguro</h4>
                  <p className="text-[11px] text-brand-muted -mt-3">Demonstração do fluxo de pagamento. Os dados oficiais de cobrança são enviados pelo nosso time comercial após a confirmação da reserva.</p>
                  
                  {/* Payment Tabs Selection */}
                  <div className="flex bg-cream-bg p-1 rounded-2xl border border-brand-purple/10">
                    <button
                      onClick={() => setPaymentMethod('pix')}
                      className={`flex-1 flex items-center justify-center h-11 text-xs font-bold rounded-xl transition-all ${paymentMethod === 'pix' ? 'bg-brand-purple text-white shadow-sm' : 'text-brand-muted hover:text-brand-purple'}`}
                    >
                      ⚡ Pagar com Pix
                    </button>
                    <button
                      onClick={() => setPaymentMethod('card')}
                      className={`flex-1 flex items-center justify-center h-11 text-xs font-bold rounded-xl transition-all ${paymentMethod === 'card' ? 'bg-brand-purple text-white shadow-sm' : 'text-brand-muted hover:text-brand-purple'}`}
                    >
                      💳 Cartão de Crédito (Stripe)
                    </button>
                  </div>

                  {/* Payment Details Container */}
                  <div className="min-h-[220px]">
                    {/* Pix Container */}
                    {paymentMethod === 'pix' && (
                      <div className="flex flex-col items-center justify-center gap-4 py-3">
                        <div className="bg-brand-purple/5 p-4 rounded-3xl border border-brand-purple/10 flex items-center justify-center w-36 h-36 relative bg-white shadow-inner">
                          {/* Simulated QR Code SVG */}
                          <svg className="w-full h-full text-brand-purple-dark" viewBox="0 0 100 100" fill="currentColor">
                            <path d="M10 10h30v30H10zm5 5v20h20V15zm45-5h30v30H60zm5 5v20h20V15zM10 60h30v30H10zm5 5v20h20V15zm53-5v10h10V60zm12 10v10h10V70zm-22 10v10h10V80zm10 0v10h10V80zm12-10v10h10V70zm0 20v10h10V90z" />
                          </svg>
                          <div className="absolute inset-0 bg-white/85 flex items-center justify-center opacity-0 hover:opacity-100 transition-all rounded-3xl">
                            <span className="text-[10px] font-black text-brand-purple text-center px-4">Escaneie o QR Code no app do seu Banco</span>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-center gap-1.5 w-full">
                          <span className="text-[10px] font-bold text-brand-muted">Chave Pix oficial (CNPJ) enviada após a confirmação:</span>
                          <div className="flex bg-cream-bg border border-brand-purple/15 rounded-xl px-4 py-2 text-xs font-bold text-brand-purple-dark justify-between w-full max-w-sm">
                            <span>Enviada pelo time após reserva</span>
                            <button
                              onClick={() => {
                                showToast("Nosso time envia a chave Pix oficial após a reserva.", "success");
                              }}
                              className="text-brand-pink hover:underline text-[10px] font-black cursor-pointer"
                            >
                              SAIBA MAIS
                            </button>
                          </div>
                        </div>

                        <div className="text-center">
                          <span className="text-[10px] text-brand-muted font-semibold">Valor do Sinal: </span>
                          <strong className="text-sm font-black text-brand-purple-dark">
                            {formatCurrency(paymentOption === 'sinal' ? (typeof simTotal === 'number' ? simTotal / 2 : 645) : (typeof simTotal === 'number' ? simTotal : 1290))}
                          </strong>
                        </div>
                      </div>
                    )}

                    {/* Credit Card Container */}
                    {paymentMethod === 'card' && (
                      <div className="flex flex-col gap-4 py-3">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[8px] font-black uppercase text-brand-muted pl-1">Nome no Cartão</label>
                          <input
                            type="text"
                            id="cardName"
                            value={checkoutData.cardName}
                            onChange={handleCheckoutDataChange}
                            placeholder="Ex: Maria S Oliveira"
                            className="w-full bg-cream-bg border border-brand-purple/15 rounded-xl h-11 px-4 text-xs font-semibold outline-none focus:border-brand-purple"
                            required
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[8px] font-black uppercase text-brand-muted pl-1">Número do Cartão</label>
                          <div className="relative">
                            <input
                              type="text"
                              id="cardNumber"
                              value={checkoutData.cardNumber}
                              onChange={handleCheckoutDataChange}
                              placeholder="4532 •••• •••• 8824"
                              className="w-full bg-cream-bg border border-brand-purple/15 rounded-xl h-11 px-4 text-xs font-semibold outline-none focus:border-brand-purple"
                              required
                            />
                            <span className="absolute right-4 top-3 text-xs">💳</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[8px] font-black uppercase text-brand-muted pl-1">Validade (MM/AA)</label>
                            <input
                              type="text"
                              id="cardExpiry"
                              value={checkoutData.cardExpiry}
                              onChange={handleCheckoutDataChange}
                              placeholder="12/29"
                              className="w-full bg-cream-bg border border-brand-purple/15 rounded-xl h-11 px-4 text-xs font-semibold outline-none focus:border-brand-purple"
                              required
                            />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[8px] font-black uppercase text-brand-muted pl-1">Código CVC</label>
                            <input
                              type="text"
                              id="cardCvc"
                              value={checkoutData.cardCvc}
                              onChange={handleCheckoutDataChange}
                              placeholder="123"
                              className="w-full bg-cream-bg border border-brand-purple/15 rounded-xl h-11 px-4 text-xs font-semibold outline-none focus:border-brand-purple"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex justify-between gap-3 mt-4 border-t border-brand-purple/5 pt-5">
                    <button
                      onClick={() => setCheckoutStep('summary')}
                      className="btn bg-white text-brand-purple border border-brand-purple/20 px-6 py-3 rounded-full text-xs font-bold"
                    >
                      Voltar
                    </button>
                    <button
                      onClick={handleProcessPayment}
                      disabled={isProcessingPayment}
                      className="btn bg-brand-pink text-white px-8 py-3 rounded-full text-xs font-bold hover:scale-102 transition-all flex items-center justify-center gap-2"
                    >
                      {isProcessingPayment ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Processando...</span>
                        </>
                      ) : (
                        <>
                          <span>Pagar {formatCurrency(paymentOption === 'sinal' ? (typeof simTotal === 'number' ? simTotal / 2 : 645) : (typeof simTotal === 'number' ? simTotal : 1290))} ➔</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Success confirmation screen */}
              {checkoutStep === 'success' && (
                <div className="max-w-md mx-auto flex flex-col items-center justify-center text-center py-6 gap-6">
                  {/* Bouncing Checkmark Icon */}
                  <div className="w-20 h-20 bg-brand-green/10 border-2 border-brand-green rounded-full flex items-center justify-center text-4xl animate-bounce">
                    ✅
                  </div>

                  <div className="flex flex-col gap-2">
                    <h4 className="font-heading font-black text-2xl text-brand-purple-dark">Reserva Confirmada!</h4>
                    <p className="text-xs text-brand-muted font-semibold leading-relaxed">
                      Sua data de <strong>{formData.date.split('-').reverse().join('/')}</strong> está oficialmente garantida na agenda do Recanto do Açaí.
                    </p>
                  </div>

                  <div className="bg-cream-bg rounded-2xl p-4 border border-brand-purple/10 text-left w-full text-xs flex flex-col gap-2">
                    <div><strong>Fatura:</strong> {invoiceNumber}</div>
                    <div><strong>Cliente:</strong> {formData.name}</div>
                    <div><strong>Pacote:</strong> {formData.package.split('(')[0]}</div>
                    <div><strong>Status do Pagamento:</strong> <span className="text-brand-green font-bold">Pago via Stripe/Pix</span></div>
                    <div className="border-t border-brand-purple/10 pt-2 text-[10px] text-brand-muted leading-relaxed">
                      O contrato e o recibo de sinal foram enviados para o e-mail <strong>{checkoutData.email}</strong> e a confirmação para o WhatsApp registrado.
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setCheckoutOpen(false);
                      setCheckoutStep('form');
                    }}
                    className="btn bg-brand-purple hover:bg-brand-purple-light text-white font-bold px-8 py-3.5 rounded-full text-xs shadow-md"
                  >
                    Fechar e Voltar ao Site
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

