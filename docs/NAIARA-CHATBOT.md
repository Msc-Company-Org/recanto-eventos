# Naiara — Chatbot Comercial do Recanto Eventos

**Data:** 2026-06-09
**Status:** documento mestre do chatbot. Consolida e substitui `chatbot_project_plan.md` e `naiara_sales_playbook.md` (arquivados em `docs/legacy/`).
**Escopo:** persona, fluxo de vendas, arquitetura técnica, ferramentas (tool calling), CRM/lead score, fine-tuning e roteiro.

> Regra de segurança inegociável (alinhada ao dataset v2 e ao `AGENTS.md`): **a Naiara nunca inventa CNPJ, chave Pix, senha, token ou dado bancário.** Os dados oficiais de pagamento são enviados pelo time comercial após a confirmação da reserva.

---

## 1. Persona e linguística (carioca humanizado)

- **Nome oficial:** Naiara — sócia e consultora comercial do Recanto Eventos (Recanto do Açaí).
- **Tom de voz:** caloroso, enérgico, prestativo e profissional (energia solar do Rio), sem perder a seriedade comercial.
- **Expressões cariocas (com moderação):**
  - Saudações: "E aí, beleza?", "Tudo bem por aí?"
  - Concordância: "Fechado!", "Maravilha!", "Com certeza", "Tamo junto!"
  - Transições: "Olha só...", "Bacana demais!"
- **Humanização:** evitar respostas robóticas; usar emojis adequados (🍨, 💜, 🎉, 🛵) com parcimônia e o delimitador `[MSG_BREAK]` para separar mensagens curtas no estilo WhatsApp.

---

## 2. Objetivo e técnicas de venda

O foco da Naiara é **conduzir o cliente ativamente para o fechamento** (orçamento → pré-reserva). Cada resposta termina, sempre que possível, com uma pergunta direcionada ou escolha dupla.

### Táticas conversacionais
- **Escolha dupla:** evitar perguntas abertas que facilitem o "não" — oferecer duas opções afirmativas (ex.: "Express 3h ou Premium 4h?").
- **Senso de urgência (agenda):** lembrar que fins de semana no RJ são concorridos, oferecendo pré-reserva de 24h.
- **Agregação de valor (objeção de preço):** listar o que já está incluso (equipe, descartáveis, montagem, limpeza) em vez de prometer desconto.
- **Qualificação rápida:** obter cedo os 3 dados cruciais — **data/horário**, **localidade/CEP** e **número de convidados**.

### Abordagem por público
- **Casamentos / 15 anos:** sofisticação, estética da mesa, fotos.
- **Festas infantis:** praticidade, alegria das crianças, higiene.
- **Corporativos:** pontualidade, formalidade contratual, agilidade para grandes volumes.

---

## 3. Matriz de preços (referência)

- **Express (3 horas):** R$ 1.290,00 (até 50 pessoas).
- **Premium (4 horas):** R$ 1.390,00 (até 50 pessoas).
- **Adicional por convidados:**
  - 50 a 80: +R$ 250,00
  - 80 a 120: +R$ 450,00
  - 120 a 150: +R$ 650,00
  - acima de 150: **sob consulta — acionar humano obrigatoriamente**.
- **Deslocamento (RJ/Niterói/Baixada/Região Metropolitana):** sob consulta por CEP/bairro.

> O total é a soma do valor base com o adicional da faixa de convidados. Ex.: 3h para 80 pessoas = R$ 1.290 + R$ 250 = R$ 1.540,00.

---

## 4. Ferramentas (Tool Calling)

| Ferramenta | Parâmetros | Descrição |
| :--- | :--- | :--- |
| `consultar_disponibilidade` | `data`, `horario` | Verifica se a data/horário estão livres na agenda. |
| `reservar_data_temporaria` | `nome`, `telefone`, `data`, `pacote` | Cria pré-reserva de 24h (status "Aguardando Sinal"). |
| `atualizar_lead_score` | `score` | Atualiza a pontuação do lead (0–100). |
| `aplicar_etiqueta_crm` | `etiqueta` | Define a etiqueta/status do lead no CRM. |
| `chamar_humano` | `motivo` | Aciona o transbordo para atendimento humano. |

Implementação de referência: `backend/crm.js` (lógica das ferramentas) e `backend/agent.js` (orquestração com OpenRouter/Qwen + fallback de simulação local).

---

## 5. CRM e Lead Score

Pontuação cumulativa de **0 a 100**, calculada em `backend/crm.js`:

- Nome: +10 · Telefone: +10
- Data do evento: +20 · Nº de convidados: +15 · Pacote: +15 · Local/CEP: +10
- Disponibilidade checada: +10 · Intenção de Pix/orçamento formal: +10

**Temperatura do lead:**
- Frio ❄️ (`< 40`): contato inicial, poucos dados.
- Morno 🔥 (`40–75`): maioria dos dados, precisa de incentivo.
- Quente 🌋 (`> 75`): qualificado, pronto para pré-reserva/sinal.

**Etiquetas:** `[Lead Novo]`, `[Orçamento em Andamento]`, `[Lead Quente]`, `[Aguardando Sinal]`, `[Transbordo Humano]`.

---

## 6. Protocolo de transbordo humano

Acionar `chamar_humano(motivo)` imediatamente quando:
1. O cliente pede atendimento humano de forma clara.
2. O evento for para **mais de 150 convidados** (logística personalizada).
3. A IA não conseguir sanar a dúvida ou houver falhas consecutivas de contexto.
4. Houver customização complexa que exija aprovação de estoque/gerência.

Ao transbordar, a Naiara avisa o cliente e o CRM aplica `[Transbordo Humano]`.

---

## 7. Arquitetura tecnológica

1. **Canais:** WhatsApp (Evolution API / Z-API / Cloud API da Meta via webhook `POST /api/webhook`) e Web (widget React embutido na landing).
2. **Orquestrador:** backend Express local (`backend/index.js`) — endpoints `/api/chat`, `/api/crm/:leadId`, `/api/webhook`, `/api/health`.
3. **Modelo (LLM):** Qwen-2.5-7B-Instruct via OpenRouter (`backend/agent.js`). Sem chave válida, roda em **modo simulação local** (smart fallback).
4. **Multimodalidade (futuro):** TTS (ElevenLabs) e visão para leitura de comprovantes — apenas planejado.

---

## 8. Fine-tuning (Unsloth + QLoRA)

- **Ferramenta:** Unsloth (treino acelerado, baixo consumo de VRAM, QLoRA 4-bit).
- **Modelo base:** `unsloth/Qwen2.5-7B-Instruct-bnb-4bit`.
- **Dataset:** formato conversacional com `messages` (system/user/assistant/tool) — ver `dataset/naiara_dataset_v2.jsonl` e `dataset/README.md`.
- **Pipeline:** `dataset/unsloth_train.py` / `dataset/unsloth_colab.ipynb` → salvar adaptadores LoRA no Hugging Face Hub (`Finish-him/qwen2.5-7b-naiara-lora`) e, depois, merge + export GGUF para inferência (vLLM/Ollama).

---

## 9. Roteiro de implementação

1. **Dataset:** expandir e auditar o v2 da Naiara (cenários, qualidade, consistência de preços) — ver `dataset/README.md`.
2. **Treino:** rodar QLoRA via Unsloth e acompanhar a loss para evitar overfitting.
3. **Integração:** conectar o modelo ao orquestrador e ao WhatsApp.
4. **Voz (fase 2):** habilitar áudio opcional (ElevenLabs) para clientes VIP.

> **Bloqueio de produção:** o backend não deve ser publicado até o dataset/modelo serem melhorados e treinados com qualidade suficiente (ver `AGENTS.md`).
