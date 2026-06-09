const fs = require('fs');
const path = require('path');

const FILE_PATH = path.join(__dirname, 'naiara_dataset.jsonl');

if (!fs.existsSync(FILE_PATH)) {
  console.error(`❌ File not found at: ${FILE_PATH}`);
  process.exit(1);
}

console.log(`🔍 Validando o dataset sintético: ${FILE_PATH}...`);

const fileContent = fs.readFileSync(FILE_PATH, 'utf-8');
const lines = fileContent.trim().split('\n');

let validCount = 0;
let invalidCount = 0;

lines.forEach((line, idx) => {
  if (!line.trim()) return;
  
  try {
    const data = JSON.parse(line);
    
    // Check main schema
    if (!data.messages || !Array.isArray(data.messages)) {
      throw new Error(`Linha ${idx + 1} não possui a propriedade "messages" como array.`);
    }
    
    // Check message roles and structure
    data.messages.forEach((msg, msgIdx) => {
      if (!msg.role) {
        throw new Error(`Mensagem ${msgIdx} na linha ${idx + 1} não possui a chave "role".`);
      }
      if (!['system', 'user', 'assistant', 'tool'].includes(msg.role)) {
        throw new Error(`Mensagem ${msgIdx} na linha ${idx + 1} possui role inválido: "${msg.role}".`);
      }
      
      // If role is assistant, check content structure
      if (msg.role === 'assistant') {
        if (typeof msg.content !== 'string') {
          throw new Error(`Mensagem ${msgIdx} (assistant) na linha ${idx + 1} tem content inválido.`);
        }
      }
      
      // If tool call is present
      if (msg.tool_calls) {
        if (!Array.isArray(msg.tool_calls)) {
          throw new Error(`Mensagem ${msgIdx} na linha ${idx + 1} tem tool_calls malformado (deve ser array).`);
        }
        msg.tool_calls.forEach((tc, tcIdx) => {
          if (!tc.id || !tc.type || !tc.function || !tc.function.name || !tc.function.arguments) {
            throw new Error(`Tool call ${tcIdx} na linha ${idx + 1} está incompleta.`);
          }
        });
      }
    });
    
    validCount++;
  } catch (err) {
    invalidCount++;
    console.error(`❌ Erro na linha ${idx + 1}: ${err.message}`);
  }
});

console.log('\n--- RESULTADO DA VALIDAÇÃO ---');
console.log(`✅ Linhas Válidas: ${validCount}`);
console.log(`❌ Linhas Inválidas: ${invalidCount}`);
console.log('------------------------------');

if (invalidCount > 0) {
  process.exit(1);
} else {
  console.log('🎉 Dataset 100% íntegro e pronto para treinamento no Hugging Face!');
}
