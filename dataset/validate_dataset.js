const fs = require('fs');
const path = require('path');

const DEFAULT_FILE = path.join(__dirname, 'naiara_dataset_v2.jsonl');
const fallbackFile = path.join(__dirname, 'naiara_dataset.jsonl');
const FILE_PATH = path.resolve(process.argv[2] || (fs.existsSync(DEFAULT_FILE) ? DEFAULT_FILE : fallbackFile));

if (!fs.existsSync(FILE_PATH)) {
  console.error(`❌ File not found at: ${FILE_PATH}`);
  process.exit(1);
}

console.log(`🔍 Validando dataset: ${FILE_PATH}...`);

const secretPatterns = [
  { name: 'OpenAI/OpenRouter style key', rx: /sk-[A-Za-z0-9_-]{20,}/ },
  { name: 'Hugging Face token', rx: /hf_[A-Za-z0-9]{20,}/ },
  { name: 'GitHub token', rx: /(ghp|github_pat)_[A-Za-z0-9_]{20,}/ },
  { name: 'Private key', rx: /-----BEGIN (?:RSA |OPENSSH |EC |)?PRIVATE KEY-----/ },
];

const forbiddenBusinessClaims = [
  { name: 'fake PIX CNPJ placeholder', rx: /12\.345\.678\/0001-90/ },
  { name: 'unsupported Stripe claim', rx: /\bStripe\b/i },
  { name: 'hard promise of out-of-area service', rx: /atendemos\s+(?:todo\s+)?(?:o\s+)?Brasil/i },
];

const allowedRoles = new Set(['system', 'user', 'assistant', 'tool']);
const allowedTools = new Set([
  'consultar_disponibilidade',
  'reservar_data_temporaria',
  'atualizar_lead_score',
  'aplicar_etiqueta_crm',
  'chamar_humano',
]);

function parseToolArgs(args) {
  if (typeof args === 'string') return JSON.parse(args);
  if (args && typeof args === 'object' && !Array.isArray(args)) return args;
  throw new Error('function.arguments deve ser JSON string ou objeto');
}

function validateLine(data, lineNumber) {
  if (!data.messages || !Array.isArray(data.messages)) {
    throw new Error(`Linha ${lineNumber} não possui a propriedade "messages" como array.`);
  }
  if (data.messages.length < 2) {
    throw new Error(`Linha ${lineNumber} tem menos de 2 mensagens.`);
  }
  if (data.messages[0].role !== 'system') {
    throw new Error(`Linha ${lineNumber} precisa começar com role system.`);
  }

  const pendingToolCalls = new Map();
  let assistantCount = 0;
  let userCount = 0;

  data.messages.forEach((msg, msgIdx) => {
    if (!msg.role || !allowedRoles.has(msg.role)) {
      throw new Error(`Mensagem ${msgIdx} na linha ${lineNumber} possui role inválido: "${msg.role}".`);
    }
    if (msg.role !== 'tool' && typeof msg.content !== 'string') {
      throw new Error(`Mensagem ${msgIdx} na linha ${lineNumber} precisa ter content string.`);
    }
    if (msg.role === 'assistant') assistantCount++;
    if (msg.role === 'user') userCount++;

    if (typeof msg.content === 'string') {
      for (const pat of secretPatterns) {
        if (pat.rx.test(msg.content)) throw new Error(`Mensagem ${msgIdx} contém segredo/token: ${pat.name}.`);
      }
      for (const pat of forbiddenBusinessClaims) {
        if (pat.rx.test(msg.content)) throw new Error(`Mensagem ${msgIdx} contém claim proibida: ${pat.name}.`);
      }
    }

    if (msg.tool_calls) {
      if (msg.role !== 'assistant') {
        throw new Error(`tool_calls só podem aparecer em mensagens assistant (linha ${lineNumber}, msg ${msgIdx}).`);
      }
      if (!Array.isArray(msg.tool_calls)) {
        throw new Error(`Mensagem ${msgIdx} na linha ${lineNumber} tem tool_calls malformado.`);
      }
      msg.tool_calls.forEach((tc, tcIdx) => {
        if (!tc.id || tc.type !== 'function' || !tc.function || !tc.function.name) {
          throw new Error(`Tool call ${tcIdx} na linha ${lineNumber} está incompleta.`);
        }
        if (!allowedTools.has(tc.function.name)) {
          throw new Error(`Tool call ${tcIdx} na linha ${lineNumber} usa ferramenta não permitida: ${tc.function.name}.`);
        }
        parseToolArgs(tc.function.arguments);
        pendingToolCalls.set(tc.id, tc.function.name);
      });
    }

    if (msg.role === 'tool') {
      if (!msg.tool_call_id) {
        // Backward-compatible warning for legacy datasets; v2 requires this by convention.
        if (path.basename(FILE_PATH).includes('_v2')) {
          throw new Error(`Mensagem tool ${msgIdx} na linha ${lineNumber} não possui tool_call_id.`);
        }
      } else {
        if (!pendingToolCalls.has(msg.tool_call_id)) {
          throw new Error(`Mensagem tool ${msgIdx} referencia tool_call_id desconhecido: ${msg.tool_call_id}.`);
        }
        pendingToolCalls.delete(msg.tool_call_id);
      }
      if (msg.name && !allowedTools.has(msg.name)) {
        throw new Error(`Mensagem tool ${msgIdx} usa name não permitido: ${msg.name}.`);
      }
      try { JSON.parse(msg.content); } catch {
        throw new Error(`Mensagem tool ${msgIdx} na linha ${lineNumber} precisa ter content JSON válido.`);
      }
    }
  });

  if (pendingToolCalls.size > 0 && path.basename(FILE_PATH).includes('_v2')) {
    throw new Error(`Linha ${lineNumber} possui tool_calls sem resultado tool: ${Array.from(pendingToolCalls.keys()).join(', ')}`);
  }
  if (assistantCount === 0 || userCount === 0) {
    throw new Error(`Linha ${lineNumber} precisa conter ao menos uma mensagem user e uma assistant.`);
  }

  return { assistantCount, userCount, messageCount: data.messages.length };
}

const fileContent = fs.readFileSync(FILE_PATH, 'utf-8');
const lines = fileContent.split('\n').filter((line) => line.trim());

let validCount = 0;
let invalidCount = 0;
let totalMessages = 0;
let totalAssistant = 0;
let totalUser = 0;
const scenarios = new Map();

lines.forEach((line, idx) => {
  try {
    const data = JSON.parse(line);
    const stats = validateLine(data, idx + 1);
    validCount++;
    totalMessages += stats.messageCount;
    totalAssistant += stats.assistantCount;
    totalUser += stats.userCount;
    if (data.scenario) scenarios.set(data.scenario, (scenarios.get(data.scenario) || 0) + 1);
  } catch (err) {
    invalidCount++;
    console.error(`❌ Erro na linha ${idx + 1}: ${err.message}`);
  }
});

console.log('\n--- RESULTADO DA VALIDAÇÃO ---');
console.log(`✅ Linhas válidas: ${validCount}`);
console.log(`❌ Linhas inválidas: ${invalidCount}`);
console.log(`💬 Mensagens totais: ${totalMessages}`);
console.log(`👤 User msgs: ${totalUser}`);
console.log(`🤖 Assistant msgs: ${totalAssistant}`);
if (scenarios.size) {
  console.log('🧩 Cenários:');
  [...scenarios.entries()].sort().forEach(([scenario, count]) => console.log(`   - ${scenario}: ${count}`));
}
console.log('------------------------------');

if (invalidCount > 0) {
  process.exit(1);
}

console.log('🎉 Dataset validado e pronto para publicação/treinamento.');
