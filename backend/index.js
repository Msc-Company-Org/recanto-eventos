import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { chatWithAgent } from './agent.js';
import { getLead } from './crm.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Log requests
app.use((req, res, next) => {
  console.log(`[HTTP] ${req.method} ${req.url}`);
  next();
});

// 1. Chat API for Web Widget
app.post('/api/chat', async (req, res) => {
  const { leadId, message } = req.body;

  if (!leadId || !message) {
    return res.status(400).json({ error: 'leadId e message são obrigatórios.' });
  }

  try {
    const result = await chatWithAgent(leadId, message);
    res.json(result);
  } catch (err) {
    console.error('Chat API Error:', err);
    res.status(500).json({ error: 'Erro interno ao processar conversa.' });
  }
});

// 2. CRM API to fetch Lead Status
app.get('/api/crm/:leadId', (req, res) => {
  const { leadId } = req.params;

  try {
    const lead = getLead(leadId);
    res.json(lead);
  } catch (err) {
    console.error('CRM API Error:', err);
    res.status(500).json({ error: 'Erro ao obter dados do CRM.' });
  }
});

// 3. Webhook for Evolution API (WhatsApp)
// Handles incoming messages from Evolution API instances and responds
app.post('/api/webhook', async (req, res) => {
  const payload = req.body;

  // Check event type from Evolution API
  if (payload.event === 'messages.upsert') {
    const messageData = payload.data;
    const isFromMe = messageData.key.fromMe;
    const remoteJid = messageData.key.remoteJid;
    const messageContent = messageData.message?.conversation || messageData.message?.extendedTextMessage?.text || '';

    // Ignore messages sent by ourselves or group messages
    if (!isFromMe && remoteJid && !remoteJid.includes('@g.us') && messageContent) {
      const leadId = remoteJid.replace('@s.whatsapp.net', '');
      console.log(`[WhatsApp Webhook] Mensagem de ${leadId}: "${messageContent}"`);

      try {
        // Run chatbot agent
        const result = await chatWithAgent(leadId, messageContent);
        
        console.log(`[WhatsApp Webhook] Resposta enviada para ${leadId}: "${result.reply}"`);
        
        // Return response mapping for Evolution API integration logger
        return res.json({
          status: 'processed',
          recipient: remoteJid,
          response: result.reply,
          lead: result.lead
        });
      } catch (err) {
        console.error('[WhatsApp Webhook Error] Failed to process webhook response:', err);
        return res.status(500).json({ error: 'Failed to process WhatsApp response.' });
      }
    }
  }

  // Acknowledge webhook payload delivery
  res.json({ status: 'ignored_or_acknowledged' });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// Start Express server
app.listen(PORT, () => {
  console.log(`🚀 Servidor backend rodando em http://localhost:${PORT}`);
  console.log(`👉 API Chat: POST http://localhost:${PORT}/api/chat`);
  console.log(`👉 Webhook WhatsApp: POST http://localhost:${PORT}/api/webhook`);
});
