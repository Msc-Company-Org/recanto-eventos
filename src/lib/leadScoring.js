// Qualificação de leads — fonte única para score, temperatura e status.
// Mantém a paridade com a lógica do backend (backend/crm.js).

import { SCORE_WEIGHTS } from './constants.js';

// Soma os pesos dos campos preenchidos do lead (0 a 100).
export function calculateLeadScore(data) {
  let score = 0;
  if (data.nome) score += SCORE_WEIGHTS.nome;
  if (data.telefone) score += SCORE_WEIGHTS.telefone;
  if (data.data) score += SCORE_WEIGHTS.data;
  if (data.convidados) score += SCORE_WEIGHTS.convidados;
  if (data.pacote) score += SCORE_WEIGHTS.pacote;
  if (data.local) score += SCORE_WEIGHTS.local;
  if (data.disponibilidadeChecada) score += SCORE_WEIGHTS.disponibilidadeChecada;
  if (data.intencaoPix) score += SCORE_WEIGHTS.intencaoPix;
  return score;
}

// Temperatura do lead a partir do score.
export function getTemperature(score) {
  if (score < 40) return 'Frio ❄️';
  if (score <= 75) return 'Morno 🔥';
  return 'Quente 🌋';
}

// Status padrão do lead a partir do score (não considera overrides manuais
// como [Transbordo Humano] ou [Aguardando Sinal], tratados separadamente).
export function getLeadStatus(score, intencaoPix) {
  if (score >= 90) return intencaoPix ? '[Aguardando Sinal]' : '[Lead Quente]';
  if (score >= 40) return '[Orçamento em Andamento]';
  return '[Lead Novo]';
}
