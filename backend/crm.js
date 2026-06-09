import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'crm_db.json');

// Initialize database file if it doesn't exist
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify({}, null, 2));
}

function readDB() {
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading CRM DB:', err);
    return {};
  }
}

function writeDB(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error writing CRM DB:', err);
  }
}

export function getLead(leadId) {
  const db = readDB();
  if (!db[leadId]) {
    db[leadId] = {
      id: leadId,
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
      logs: [`[System] CRM Inicializado para Novo Lead: ${leadId}`]
    };
    writeDB(db);
  }
  return db[leadId];
}

export function updateLead(leadId, fields) {
  const db = readDB();
  const lead = db[leadId] || getLead(leadId);
  
  // Update fields
  Object.keys(fields).forEach(key => {
    if (key === 'logs') {
      lead.logs = [...lead.logs, ...fields.logs];
    } else {
      lead[key] = fields[key];
    }
  });

  // Calculate score
  let score = 0;
  if (lead.nome) score += 10;
  if (lead.telefone) score += 10;
  if (lead.data) score += 20;
  if (lead.convidados) score += 15;
  if (lead.pacote) score += 15;
  if (lead.local) score += 10;
  if (lead.disponibilidadeChecada) score += 10;
  if (lead.intencaoPix) score += 10;

  lead.score = score;

  // Calculate temperature
  lead.temperatura = score < 40 ? 'Frio ❄️' : score <= 75 ? 'Morno 🔥' : 'Quente 🌋';

  // Calculate status (unless overridden manually or by handoff)
  if (lead.status !== '[Transbordo Humano]' && lead.status !== '[Aguardando Sinal]') {
    if (score >= 90) {
      lead.status = lead.intencaoPix ? '[Aguardando Sinal]' : '[Lead Quente]';
    } else if (score >= 40) {
      lead.status = '[Orçamento em Andamento]';
    } else {
      lead.status = '[Lead Novo]';
    }
  }

  db[leadId] = lead;
  writeDB(db);
  return lead;
}

// ── BUSINESS TOOLS FOR THE LLM ──────────────────────────────

export function consultarDisponibilidade(leadId, dataStr, horario = '18:00') {
  getLead(leadId);
  
  // Simple check: Dec 25th is blocked, others are free
  const isBlocked = dataStr.includes('25/12') || dataStr.includes('12-25');
  const status = isBlocked ? 'ocupado' : 'disponivel';
  
  const formattedDate = dataStr.split('-').reverse().join('/'); // normalize to BR date
  const logMsg = `[Tool Call] consultar_disponibilidade(data="${dataStr}", horario="${horario}") -> ${status === 'disponivel' ? 'Livre' : 'Ocupado'}`;
  
  updateLead(leadId, {
    disponibilidadeChecada: true,
    logs: [logMsg]
  });

  return {
    status,
    data: dataStr,
    horario,
    mensagem: status === 'disponivel' 
      ? `A data de ${formattedDate} está livre para reserva!` 
      : `Infelizmente a data de ${formattedDate} já está totalmente reservada.`
  };
}

export function reservarDataTemporaria(leadId, nome, telefone, dataStr, pacote) {
  const invoice = 'REC-' + Math.floor(100000 + Math.random() * 900000);
  const logMsg = `[Tool Call] reservar_data_temporaria(nome="${nome}", data="${dataStr}", pacote="${pacote}") -> Sucesso (${invoice})`;
  
  updateLead(leadId, {
    nome: nome || undefined,
    telefone: telefone || undefined,
    data: dataStr || undefined,
    pacote: pacote || undefined,
    intencaoPix: true,
    status: '[Aguardando Sinal]',
    logs: [logMsg]
  });

  return {
    status: 'reservado_sucesso',
    invoice,
    prazo: '24 horas',
    mensagem: `Reserva temporária realizada com sucesso! Código: ${invoice}. Aguardando Pix de sinal de 50%.`
  };
}

export function atualizarLeadScore(leadId, score) {
  const logMsg = `[Tool Call] atualizar_lead_score(score=${score})`;
  updateLead(leadId, {
    score,
    logs: [logMsg]
  });
  return { status: 'success', score };
}

export function aplicarEtiquetaCrm(leadId, etiqueta) {
  const logMsg = `[Tool Call] aplicar_etiqueta_crm(etiqueta="${etiqueta}")`;
  updateLead(leadId, {
    status: etiqueta,
    logs: [logMsg]
  });
  return { status: 'success', etiqueta };
}

export function chamarHumano(leadId, motivo) {
  const logMsg = `[Tool Call] chamar_humano(motivo="${motivo}") -> Atendente Moisés acionado`;
  updateLead(leadId, {
    status: '[Transbordo Humano]',
    logs: [logMsg, `[System] Transbordo Humano ativado pelo motivo: ${motivo}`]
  });
  return {
    status: 'humano_acionado',
    atendente: 'Moises',
    mensagem: `Atendimento humano acionado para o lead. Motivo: ${motivo}.`
  };
}
