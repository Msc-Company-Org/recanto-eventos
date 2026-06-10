// Constantes centrais do Recanto Eventos.
// Fonte única de verdade para contato, preços e custos por faixa de convidados.

export const STORE_WHATSAPP_NUMBER = '5521981749450'; // WhatsApp comercial RJ

// Valor base do pacote por duração (em horas).
export const BASE_PRICES = {
  '3': 1290.0,
  '4': 1390.0,
};

// Custo adicional por faixa de convidados (chave = teto da faixa).
// `null` significa "Sob Consulta" (aciona atendimento humano).
export const GUEST_EXTRA_COSTS = {
  '50': 0.0,
  '80': 250.0,
  '120': 450.0,
  '150': 650.0,
  '200': null, // Sob consulta
};

// Pesos de qualificação do lead (somam 100 no máximo).
export const SCORE_WEIGHTS = {
  nome: 10,
  telefone: 10,
  data: 20,
  convidados: 15,
  pacote: 15,
  local: 10,
  disponibilidadeChecada: 10,
  intencaoPix: 10,
};
