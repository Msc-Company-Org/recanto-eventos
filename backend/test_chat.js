// Script de teste da API do chatbot
const leadId = 'test_rj_99';
const message = 'Olá, meu nome é Rodrigo e gostaria de orçamento para o dia 24/10/2026.';

console.log(`📡 Enviando mensagem de teste para o chatbot (${leadId})...`);

try {
  const response = await fetch('http://localhost:3000/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ leadId, message })
  });

  const data = await response.json();
  console.log('\n📥 Resposta Recebida:');
  console.log(JSON.stringify(data, null, 2));
} catch (err) {
  console.error('❌ Erro no teste:', err.message);
}
