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

## Próximo objetivo grande

Melhorar a qualidade do dataset da Naiara e continuar publicando/treinando no Hugging Face antes de qualquer publicação de backend em produção.
