# Estado do Projeto — Recanto Eventos

**Data:** 2026-06-09
**Repositório canônico:** `Msc-Company-Org/recanto-eventos` (branch `main`)
**Produção (frontend):** https://recanto-eventos.vercel.app
**Objetivo deste documento:** retrato único e honesto do que já foi feito, o que está implementado, o que só foi planejado, o que está desatualizado e quais são os próximos passos.

---

## 1. Visão geral

Recanto Eventos é uma landing page + funil comercial para buffet/estação gourmet de açaí e sorvete para eventos no Rio de Janeiro, com um chatbot de vendas (Naiara) em protótipo. O posicionamento atual é **exclusivamente açaí + sorvete gourmet** (pivot do antigo mix com pipoca/crepe/algodão doce).

## 2. Status por área

| Área | Status | Observações |
|---|---|---|
| Landing page (React/Vite/Tailwind) | ✅ Implementado e em produção | SEO/A11y/Boas práticas 100/100 via `audit.js`. |
| Simulador de orçamento + checkout | ⚠️ Implementado como **simulação** | Não há gateway de pagamento real; ver §5 (decisão pendente). |
| Chatbot Naiara (web widget) | ✅ Protótipo com fallback client-side | Funciona sem backend, simulando a conversa. |
| Backend Express (chat/CRM/webhook) | ✅ Implementado, **não publicado** | Local apenas; bloqueado para produção até dataset/modelo maturarem. |
| Integração LLM (OpenRouter/Qwen) | ✅ Implementado com fallback | Sem `OPENROUTER_API_KEY`, roda em simulação local. |
| CRM / Lead Score | ✅ Implementado (file-based) | `backend/crm_db.json` (gitignored), scoring 0–100. |
| Dataset Naiara v2 | ✅ Gerado e validado (43 amostras) | Sintético curado; precisa expandir/auditar antes do treino. |
| Publicação do dataset no Hugging Face | ❔ A confirmar ao vivo | Script pronto (`upload_to_hf.py`); requer `HF_TOKEN`. |
| HF Space demo (`Finish-him/naiara-chatbot`) | ❔ A confirmar ao vivo | Script `create_space.py` pronto; status não verificado nesta sessão. |
| Fine-tuning (Unsloth/QLoRA) | 🔲 Só planejado | Script e notebook prontos; treino ainda não executado. |
| Voz (ElevenLabs) / Visão | 🔲 Só planejado | Não iniciado. |
| Documentação de marketing | ✅ Consolidada | Masterplan canônico; docs antigos arquivados. |

Legenda: ✅ feito · ⚠️ feito com ressalva · ❔ a verificar · 🔲 planejado.

## 3. O que já foi feito (implementado)

- **Frontend** React 19 + Vite 8 + Tailwind 4 (`src/App.jsx`), deploy na Vercel.
- **SEO on-page**: meta tags, Open Graph, JSON-LD (`FoodService`/`LocalBusiness`), sitemap e robots; auditoria 100/100 (`docs/relatorios/seo-audit.md`, gerado por `audit.js`).
- **Funil**: simulador de preço → modal de escolha → checkout (simulado) → WhatsApp, com eventos GTM/pixel mapeados.
- **Backend** Express (`backend/index.js`): `/api/chat`, `/api/crm/:leadId`, `/api/webhook` (Evolution API/WhatsApp), `/api/health`.
- **Agente Naiara** (`backend/agent.js`): orquestração com tool calling (Qwen via OpenRouter) + simulação local inteligente como fallback.
- **CRM** (`backend/crm.js`): leads, score, temperatura, etiquetas e as 5 ferramentas de negócio.
- **Dataset v2** (`dataset/naiara_dataset_v2.jsonl`): 43 amostras, 11 cenários, gerado por `generate_dataset_v2.js` e validado por `validate_dataset.js` (quality gates de segredos/claims).
- **Documentação de produto/marketing** consolidada (ver §7).

## 4. Próximos passos (recomendado, nesta ordem)

1. **Definir dados de pagamento reais** (CNPJ/Pix) ou decidir manter o checkout apenas como demonstração — ver §5.
2. **Expandir e auditar o dataset v2** da Naiara (mais cenários, variação linguística, consistência de preços).
3. **Confirmar ao vivo** o estado no Hugging Face (dataset privado e Space) — requer `HF_TOKEN`.
4. **Treinar** a persona via Unsloth/QLoRA e avaliar a loss/qualidade.
5. **Só então** preparar a publicação do backend em produção (com segredos fora do Git).
6. Clonar voz carioca (ElevenLabs) como fase 2 opcional.

## 5. Pontos que exigem decisão do dono (alto valor)

1. **Pagamento real vs. simulação:** a landing tinha CNPJ/Pix placeholder (`12.345.678/0001-90`) e claims de "Stripe"/"12x" sem integração. Nesta sessão isso foi **neutralizado** (rotulado como demonstração e sem chave falsa). Decisão necessária: fornecer dados oficiais de pagamento e/ou integrar um gateway real, ou manter como demonstração.
2. **`package.json` está em `0.0.0`:** definir versionamento (ex.: `0.1.0`) e tags.
3. **`bun.lock`:** manter versionado (recomendado para builds reproduzíveis) — está no repo.

## 6. O que estava desatualizado e foi corrigido nesta sessão

- Removidos os placeholders de **CNPJ/Pix** falso e claims de **Stripe/12x** do frontend (`src/App.jsx`), do backend (`backend/agent.js`) e dos scripts de Space (`dataset/create_space.py`, `dataset/test_space/app.py`).
- Corrigido telefone falso de SP (`+5511…`) para o número real do RJ (`+5521981749450`) no snippet JSON-LD documentado.
- Removido o gerador de dataset **v1 órfão** (`dataset/generate_dataset.js`) e o fallback morto no validador.
- `.gitignore` ampliado para artefatos gerados (`space_files/`, `outputs/`, `lora_adapters/`).
- Documentação consolidada e reorganizada (ver §7).

## 7. Mapa da documentação (pós-consolidação)

```
docs/
  ESTADO-DO-PROJETO.md                      (este documento)
  COPYWRITING-MASTERPLAN-2026-06-09.md      (marketing/copy/SEO/ads — canônico)
  NAIARA-CHATBOT.md                         (persona/arquitetura/treino do chatbot — canônico)
  RECANTO-EVENTOS-RELATORIO-2026-06-09.md   (relatório operacional)
  relatorios/
    campanhas-2023-2026.md                  (dados históricos de mídia)
    seo-audit.md                            (gerado por audit.js)
  legacy/                                    (arquivados, substituídos pelos canônicos)
    seo_and_ads_strategy.md
    google_ads_rj_campaign.md
    google_meta_tiktok_ads_guide.md
    campanhas_copywriting_playbook.md
    seo_lpo_improvements.md
    chatbot_project_plan.md
    naiara_sales_playbook.md
dataset/README.md                           (dataset Naiara v2)
README.md / AGENTS.md                       (raiz)
```

## 8. Como rodar e verificar

```bash
bun install
bun run lint
bun run build
bun audit.js                       # gera docs/relatorios/seo-audit.md
bun dataset/generate_dataset_v2.js # regenera o dataset v2
bun dataset/validate_dataset.js    # valida schema/segredos/claims
```

Backend local da Naiara:

```bash
cd backend && cp .env.example .env && bun install && bun run dev
```

## 9. Segurança e governança

- Não versionar: `.env*`, `.vercel/`, `node_modules/`, `dist/`, `backend/crm_db.json`, logs, `Principais Assets/`, artefatos de treino.
- Nunca expor segredos no código, docs ou dataset (validador bloqueia tokens/chaves/Pix/claims).
- Backend só vai a produção após validação explícita do dono (ver `AGENTS.md`).
