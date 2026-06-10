// Lógica de precificação do buffet — fonte única usada por simulador,
// formulário de orçamento e simulação de chat.

import { BASE_PRICES } from './constants.js';

// Resolve o custo adicional a partir de um número absoluto de convidados.
// Retorna `null` quando excede 150 (faixa "Sob Consulta" / transbordo humano).
export function resolveGuestExtraByCount(count) {
  const num = parseInt(count, 10);
  if (Number.isNaN(num)) return 0;
  if (num <= 50) return 0;
  if (num <= 80) return 250;
  if (num <= 120) return 450;
  if (num <= 150) return 650;
  return null;
}

// Calcula o total a partir da duração ('3' | '4') e de uma contagem de convidados.
// Retorna 'Sob Consulta' quando a faixa exige atendimento humano.
export function calculateTotalByCount(duration, guestCount) {
  const base = BASE_PRICES[String(duration)] ?? BASE_PRICES['3'];
  const extra = resolveGuestExtraByCount(guestCount);
  if (extra === null) return 'Sob Consulta';
  return base + extra;
}

// Formata um valor numérico como moeda brasileira.
// Strings (ex: 'Sob Consulta') passam direto sem alteração.
export function formatCurrency(val) {
  if (typeof val === 'string') return val;
  return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
