# AGENTS.md — recanto-eventos

## Contexto

- **Projeto:** Recanto Eventos / Recanto do Açaí
- **Função:** landing page e funil comercial para buffet de açaí e sorvete gourmet em eventos no RJ
- **Deploy frontend:** Vercel — https://recanto-eventos.vercel.app
- **Backend Naiara:** local/protótipo, não publicar até o dataset/modelo serem melhorados e treinados no Hugging Face

## Ordem de leitura

1. Instruções do usuário na conversa atual
2. Este `AGENTS.md`
3. `README.md`, `package.json`, `vite.config.js`
4. `src/App.jsx`, `src/index.css`, `index.html`
5. `backend/agent.js`, `backend/crm.js`, `backend/index.js`
6. Documentos `.md` de SEO, Ads, copywriting e chatbot
7. Alexandria/Obsidian para decisões duráveis

## Regras de trabalho

1. Sempre verificar `git status` antes de editar.
2. Não versionar segredos: `.env`, tokens, cookies, chaves, URLs assinadas ou dados sensíveis.
3. Não publicar o backend da Naiara sem validação explícita do usuário.
4. Preservar o foco atual: açaí + sorvete gourmet para eventos, não voltar ao mix antigo como produto principal.
5. Antes de finalizar alterações, rodar quando aplicável:
   - `bun run lint`
   - `bun run build`
   - `bun audit.js`
   - `bun dataset/validate_dataset.js`
6. Para documentação durável, sincronizar também a Alexandria quando decisões de produto/marketing mudarem.

## Git limpo

Devem ficar fora do Git:

- `.env` e `.env.*`
- `.vercel/`
- `node_modules/`
- `dist/`
- `backend/crm_db.json`
- logs locais
- `Principais Assets/` (mídia bruta local; `public/` contém os assets otimizados versionados)

## Próximo grande objetivo

Melhorar dataset, publicar no Hugging Face e treinar a persona Naiara com qualidade suficiente antes de ligar o backend em produção.
