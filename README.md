# Recanto Eventos — Buffet de Açaí e Sorvete Gourmet

Landing page e protótipo comercial do Recanto Eventos, focado em buffet/carrinho gourmet de açaí e sorvete para eventos no Rio de Janeiro.

**Produção:** https://recanto-eventos.vercel.app

## Stack

- React 19 + Vite 8
- Tailwind CSS v4 via `@tailwindcss/vite`
- Bun como runtime/gerenciador
- Backend local em Express para o agente Naiara
- Deploy frontend: Vercel

## Scripts

```bash
bun install
bun run lint
bun run build
bun audit.js
bun dataset/generate_dataset_v2.js
bun dataset/validate_dataset.js
```

Backend local da Naiara:

```bash
cd backend
cp .env.example .env
bun install
bun run dev
```

> O backend ainda não está publicado. Enquanto não houver deploy/API pública, a landing page usa fallback client-side para a simulação do chat.

## Documentação principal

- `docs/RECANTO-EVENTOS-RELATORIO-2026-06-09.md` — relatório completo com inventário, limpeza, decisões, segurança, dataset, Hugging Face e próximos passos.
- `docs/COPYWRITING-MASTERPLAN-2026-06-09.md` — masterplan de copy, keywords, naming, Google Ads, Meta Ads, TikTok, Instagram, blog e criativos.
- `docs/KEYWORD-SEED-LIST-2026-06-09.csv` — lista operacional de keywords para importar no Keyword Planner/Google Ads.
- `dataset/README.md` — documentação específica do dataset Naiara v2.

## Estrutura

- `src/` — aplicação React da landing page
- `public/` — assets otimizados usados em produção
- `backend/` — API Express local do chatbot/CRM
- `dataset/` — scripts e dataset inicial para Hugging Face/Unsloth
- `*.md` — estratégia de SEO, mídia, copywriting e playbooks comerciais

## Segurança e versionamento

Não versionar:

- `.env` / `.env.*`
- `.vercel/`
- `node_modules/`
- `dist/`
- `backend/crm_db.json`
- logs gerados localmente
- pasta local de mídia bruta `Principais Assets/`

## Dataset e Hugging Face

Dataset ativo: `dataset/naiara_dataset_v2.jsonl`.

Publicação privada padrão:

```bash
HF_TOKEN=... python dataset/upload_to_hf.py
```

Repositório HF padrão: `Finish-him/naiara-recanto-dataset-v2`.

## Próximo objetivo grande

Expandir e auditar o dataset v2 da Naiara, publicar versões no Hugging Face e só então treinar/avaliar o modelo antes de qualquer publicação de backend em produção.
