# Relatório Técnico e Operacional — Recanto Eventos / Naiara

**Data:** 2026-06-09  
**Projeto:** Recanto Eventos / Recanto do Açaí  
**Repositório canônico:** https://github.com/Msc-Company-Org/recanto-eventos  
**Produção frontend:** https://recanto-eventos.vercel.app  
**Dataset Hugging Face ativo:** https://huggingface.co/datasets/Finish-him/naiara-recanto-dataset-v2  
**Status:** plataforma versionada, documentação sincronizada, legado arquivado e dataset v2 publicado como privado.

---

## 1. Objetivo desta rodada

Esta rodada teve como objetivo organizar e profissionalizar tudo que existe do **Recanto do Açaí / Recanto Eventos**, deixando claro:

1. o que foi encontrado;
2. qual é o projeto canônico;
3. o que foi limpo;
4. quais riscos foram removidos;
5. o que foi versionado no GitHub;
6. o que foi sincronizado na Alexandria;
7. o que foi arquivado;
8. o estado do chatbot **Naiara**;
9. o estado do dataset e Hugging Face;
10. quais são os próximos passos recomendados.

A decisão central foi tratar o Recanto como um produto digital/comercial sério: **landing page + funil + CRM/chatbot + dataset de IA**, com governança, versionamento e documentação durável.

---

## 2. Inventário encontrado

### 2.1 Projeto atual principal

Foi identificado como projeto mais atual e avançado:

```text
C:/Users/Moises e  Naiara/Desktop/recanto-eventos
```

Esse projeto contém:

- landing page moderna em React/Vite;
- assets reais otimizados em `public/`;
- materiais de SEO, mídia e copywriting;
- backend local/protótipo do agente Naiara;
- dataset e scripts de Hugging Face/Unsloth;
- deploy frontend já ativo na Vercel.

Após a organização, esse projeto virou o repositório canônico:

```text
Msc-Company-Org/recanto-eventos
```

URL:

```text
https://github.com/Msc-Company-Org/recanto-eventos
```

### 2.2 Projeto legado antigo

Também existia o repositório legado:

```text
C:/Users/Moises e  Naiara/workspace/Github/MSC-Company-Org/recanto-acai-eventos-lp
```

GitHub:

```text
https://github.com/Msc-Company-Org/recanto-acai-eventos-lp
```

Esse projeto era HTML/CSS estático e tinha problemas importantes:

- `index.html` chamava `app.js`, mas `app.js` não existia;
- o WhatsApp estava com número placeholder `5521999999999`;
- a calculadora dependia de JavaScript ausente;
- o fallback da Vercel fazia `/app.js` retornar `index.html`, quebrando a lógica client-side;
- a proposta de produto estava menos alinhada ao posicionamento atual premium.

Decisão: **arquivar por enquanto**, sem deletar.

Status atual no GitHub:

```text
Msc-Company-Org/recanto-acai-eventos-lp archived=true
```

### 2.3 Alexandria / Obsidian

Foram encontrados documentos no Obsidian/Alexandria em:

```text
C:/Users/Moises e  Naiara/workspace/Obsidian/Alexandria/40-MSC-Company/recanto-do-acai
C:/Users/Moises e  Naiara/workspace/Obsidian/Alexandria/10-Projetos/msc-company/marcas
```

Arquivos relevantes:

- `40.40-MOC-Recanto-do-Acai.md`
- `40.51-Recanto-Acai-Keywords.md`
- `40.52-Recanto-Acai-LandingPage.md`
- `40.53-Recanto-Acai-WhatsApp.md`
- `005-msc-marketing-keywords-project.md`
- `007-recanto-do-acai-landingpage.md`
- `008-recanto-do-acai-whatsapp-flow.md`
- `009-recanto-do-acai.md`
- `009-recanto-do-acai-marketing.md`

Foi detectado que a versão do Obsidian estava mais atualizada do que a cópia em:

```text
C:/Users/Moises e  Naiara/workspace/Github/MSC-Company-Org/Alexandria
```

Decisão: sincronizar a documentação atual do Obsidian para o GitHub Alexandria.

Commit final na Alexandria:

```text
0d15e61 docs: sync Recanto Eventos documentation
```

---

## 3. Posicionamento estratégico definido

O posicionamento atual documentado para o negócio é:

> **Recanto Eventos — buffet de açaí e sorvete gourmet para festas, casamentos e eventos corporativos no Rio de Janeiro.**

### 3.1 Pivot de negócio

O histórico mostrava um mix antigo com:

- pipoca;
- crepe;
- algodão doce;
- açaí/sorvete;
- lanches simples.

A decisão estratégica consolidada foi migrar o foco principal para:

- açaí gourmet;
- sorvete gourmet;
- estação/buffet premium;
- eventos de maior ticket.

### 3.2 Motivos do pivot

1. **Ticket médio maior:** contratos de R$ 1.290+ contra contratos antigos mais baixos.
2. **Operação mais simples:** menos variação de insumo/equipamento.
3. **Maior margem:** foco em produto de maior valor percebido.
4. **Público mais qualificado:** casamentos, 15 anos, corporativo e famílias com maior intenção de compra.
5. **Melhor estética para anúncios:** fotos e vídeos de açaí/sorvete gourmet têm forte apelo visual.
6. **Mais coerência com IA/comercial:** funil mais simples e precificação mais padronizada.

### 3.3 Precificação atual de referência

| Pacote | Duração | Base até 50 convidados |
|---|---:|---:|
| Express | 3h | R$ 1.290,00 |
| Premium | 4h | R$ 1.390,00 |

Adicionais por convidados:

| Faixa | Adicional |
|---|---:|
| Até 50 | R$ 0,00 |
| Até 80 | + R$ 250,00 |
| Até 120 | + R$ 450,00 |
| Até 150 | + R$ 650,00 |
| Acima de 150 | Sob consulta / humano |

Regra importante: **acima de 150 convidados não deve haver orçamento automático**. O atendimento deve ir para humano por causa da complexidade de logística, equipe, reposição e fila.

---

## 4. Estado técnico da landing page

### 4.1 Stack

O projeto atual usa:

- React 19;
- Vite 8;
- Tailwind CSS v4 via `@tailwindcss/vite`;
- Bun como runtime/gerenciador;
- Vercel para frontend;
- Express local para protótipo do backend da Naiara.

Arquivos principais:

```text
src/App.jsx
src/index.css
index.html
vite.config.js
package.json
```

### 4.2 Funcionalidades existentes

A landing possui:

- hero com proposta de valor;
- simulador de preço;
- formulário de orçamento;
- modal de escolha entre WhatsApp/checkout simulado;
- chatbot flutuante da Naiara;
- CRM/lead score simulado no frontend;
- galeria com fotos/vídeos reais;
- FAQ;
- seções de pacotes;
- tracking por GTM/dataLayer;
- suporte a Meta/TikTok/Google Ads via eventos mapeados.

### 4.3 Deploy

Produção atual:

```text
https://recanto-eventos.vercel.app
```

Projeto Vercel:

```text
recanto-eventos
```

O frontend está publicado, mas o backend da Naiara **não foi publicado** por decisão explícita.

---

## 5. Git e repositório limpo

### 5.1 Criação do repositório

Foi criado o repositório:

```text
https://github.com/Msc-Company-Org/recanto-eventos
```

Commit inicial:

```text
aef1549 feat: initial Recanto Eventos platform
```

Commit do dataset v2:

```text
f939e0d feat(dataset): publish curated Naiara v2 dataset
```

Status final:

```text
main...origin/main limpo
```

### 5.2 `.gitignore` corrigido

O `.gitignore` foi ajustado para evitar versionamento de arquivos sensíveis ou pesados desnecessários.

Ficam fora do Git:

```text
.env
.env.*
.vercel/
node_modules/
dist/
dist-ssr/
coverage/
backend/crm_db.json
logs/
*.log
dataset/space_*.log
Principais Assets/
__pycache__/
*.pyc
```

### 5.3 O que ficou versionado

Ficaram versionados:

- código frontend;
- backend local/protótipo;
- assets otimizados em `public/`;
- documentação estratégica;
- dataset v2;
- scripts Hugging Face/Unsloth sem segredos;
- AGENTS/README/governança.

### 5.4 O que não foi versionado

Não foram versionados:

- `.env` real;
- `.vercel/`;
- banco local `backend/crm_db.json`;
- `node_modules/`;
- `dist/`;
- mídia bruta em `Principais Assets/`;
- logs do Hugging Face Space.

---

## 6. Segurança e limpeza de segredos

### 6.1 Problema encontrado

Foram encontrados tokens Hugging Face hardcoded em scripts do diretório `dataset/`.

Arquivos afetados inicialmente incluíam:

- `dataset/check_hf.py`
- `dataset/create_space.py`
- `dataset/dump_space_logs.py`
- `dataset/get_hf_datasets.py`
- `dataset/get_space_logs.py`
- `dataset/get_space_logs_hf.py`
- `dataset/get_space_status.py`
- `dataset/unsloth_train.py`
- `dataset/upload_to_hf.py`
- notebook Unsloth

### 6.2 Correção feita

Os scripts foram alterados para usar variável de ambiente:

```text
HF_TOKEN
```

Foi feita varredura antes dos commits para impedir tokens do tipo:

- `hf_...`
- `sk-...`
- `ghp_...`
- `github_pat_...`
- private keys.

Nenhum token foi commitado no repositório novo.

### 6.3 Recomendação de segurança

Mesmo sem ter sido commitado, o token existia em arquivos locais antes da limpeza. Portanto:

> **Recomendação:** rotacionar o token Hugging Face como precaução.

---

## 7. Variáveis e APIs disponíveis no ambiente global

Foi analisado o `.env` global sem expor valores.

Fontes encontradas:

```text
C:/Users/Moises e  Naiara/.secrets/.env
C:/Users/Moises e  Naiara/workspace/Obsidian/Alexandria/.env
C:/Users/Moises e  Naiara/AppData/Local/hermes/.env
C:/Users/Moises e  Naiara/Desktop/recanto-eventos/backend/.env
```

Serviços disponíveis por nome:

- OpenAI;
- Anthropic;
- Gemini;
- DeepSeek;
- OpenRouter;
- GitHub;
- Vercel;
- Hugging Face;
- ElevenLabs;
- Firecrawl;
- FAL;
- MiniMax;
- Neon;
- TiDB;
- Supabase;
- LangSmith;
- Trello;
- Telegram;
- Notion;
- Google Drive/OAuth/Service Account/GCP;
- Evolution API / WhatsApp;
- Hostinger;
- VPS Detran;
- VPS MSC;
- Steam;
- tokens internos MSC/WhatsApp.

### 7.1 Observação sobre `.secrets/.env`

Foi identificado um problema de shell ao tentar fazer `source` no `.env` global:

- há valor com espaço em `WA_VAULT_PATH`;
- sem aspas, o shell interpreta incorretamente.

Recomendação:

```env
WA_VAULT_PATH="C:/caminho/com espaco/..."
```

ou evitar `source` direto e carregar com parser seguro.

---

## 8. Backend da Naiara

### 8.1 Localização

```text
backend/
```

Arquivos principais:

```text
backend/index.js
backend/agent.js
backend/crm.js
backend/test_chat.js
backend/.env.example
```

### 8.2 Funcionalidades

O backend possui:

- API Express;
- endpoint `/api/chat`;
- endpoint `/api/webhook` para Evolution API;
- endpoint `/api/crm/:leadId`;
- endpoint `/api/health`;
- orquestração com OpenRouter/Qwen;
- fallback local inteligente;
- CRM JSON local;
- lead score;
- temperatura do lead;
- status do funil;
- handoff humano.

### 8.3 Decisão atual

O backend **não será publicado agora**.

Motivos:

1. o modelo ainda não foi treinado com dataset de qualidade;
2. o dataset v1 era fraco;
3. o dataset v2 é apenas primeira base curada;
4. ainda falta avaliação antes/depois;
5. publicar agora poderia gerar resposta comercial errada em produção.

Regra atual:

> **Não publicar backend da Naiara até melhorar dataset, treinar, avaliar e aprovar qualidade.**

---

## 9. Dataset da Naiara

### 9.1 Dataset v1 encontrado

O dataset inicial era:

```text
dataset/naiara_dataset.jsonl
```

Ele tinha 100 conversas sintéticas e passava em uma validação estrutural simples, mas a qualidade comercial era baixa.

Problemas encontrados:

- placeholder de Pix/CNPJ (`12.345.678/0001-90`);
- menção a Stripe sem integração validada;
- conversa muito repetitiva;
- pouca diversidade de cenários;
- risco de treinar o modelo a inventar dados financeiros;
- baixa robustez para edge cases;
- validação antiga não checava claims comerciais perigosas.

Decisão:

> remover o dataset v1 do fluxo ativo.

O arquivo foi removido do repositório no commit `f939e0d`.

### 9.2 Dataset v2 criado

Novo dataset ativo:

```text
dataset/naiara_dataset_v2.jsonl
```

Gerador:

```text
dataset/generate_dataset_v2.js
```

Validador:

```text
dataset/validate_dataset.js
```

Documentação:

```text
dataset/README.md
```

### 9.3 Estatísticas do v2

O dataset v2 possui:

- 43 conversas curadas;
- 277 mensagens;
- 77 mensagens de usuário;
- 113 mensagens da assistente;
- tool calls com resultados pareados;
- metadata por cenário;
- tags de qualidade.

Cenários cobertos:

| Cenário | Quantidade |
|---|---:|
| orçamento padrão até pré-reserva | 8 |
| lead vindo da landing page | 8 |
| objeção de preço | 6 |
| evento acima de 150 convidados | 5 |
| pedido explícito de humano | 4 |
| data indisponível | 3 |
| FAQ de infraestrutura | 4 |
| cardápio | 1 |
| pivot do mix antigo | 1 |
| fora da área de atendimento | 1 |
| corporativo/contrato | 2 |

### 9.4 Quality gates do validador

O validador agora bloqueia:

- tokens Hugging Face (`hf_...`);
- chaves `sk-...`;
- GitHub tokens;
- private keys;
- placeholder de Pix/CNPJ;
- claim de Stripe sem validação;
- promessa de atendimento no Brasil inteiro;
- ferramentas não permitidas;
- tool call sem resultado correspondente;
- tool result com JSON inválido;
- mensagens sem role/content correto.

Comando:

```bash
bun dataset/validate_dataset.js
```

Resultado final:

```text
✅ Linhas válidas: 43
❌ Linhas inválidas: 0
```

### 9.5 Publicação no Hugging Face

O dataset v2 foi publicado como privado em:

```text
https://huggingface.co/datasets/Finish-him/naiara-recanto-dataset-v2
```

Verificação:

```text
id=Finish-him/naiara-recanto-dataset-v2
private=True
```

Upload padrão:

```bash
HF_TOKEN=... python dataset/upload_to_hf.py
```

Repositório padrão configurado nos scripts:

```text
Finish-him/naiara-recanto-dataset-v2
```

---

## 10. Validações executadas

Foram executadas e aprovadas:

```bash
bun run lint
bun run build
bun audit.js
bun dataset/validate_dataset.js
```

Resultados importantes:

- lint passou;
- build passou;
- dataset v2 passou;
- auditoria SEO continua 100/100.

Auditoria:

| Categoria | Score |
|---|---:|
| SEO | 100/100 |
| Acessibilidade | 100/100 |
| Boas práticas | 100/100 |

---

## 11. Documentação e governança adicionadas

### 11.1 No repositório Recanto Eventos

Foram adicionados/atualizados:

- `README.md`;
- `AGENTS.md`;
- `dataset/README.md`;
- este relatório em `docs/RECANTO-EVENTOS-RELATORIO-2026-06-09.md`.

### 11.2 Na Alexandria

A documentação do Recanto foi sincronizada para o repositório Alexandria.

Commit:

```text
0d15e61 docs: sync Recanto Eventos documentation
```

Arquivos sincronizados:

- landing page;
- WhatsApp/Naiara;
- marca/estratégia;
- marketing/tráfego.

---

## 12. Histórico de commits relevantes

### Repositório Recanto Eventos

```text
aef1549 feat: initial Recanto Eventos platform
f939e0d feat(dataset): publish curated Naiara v2 dataset
```

### Repositório Alexandria

```text
0d15e61 docs: sync Recanto Eventos documentation
```

---

## 13. Problemas resolvidos

| Problema | Ação |
|---|---|
| projeto atual sem Git | criado repo canônico e push |
| `.gitignore` insuficiente | corrigido para segredos/build/logs |
| token HF hardcoded | removido e trocado por `HF_TOKEN` |
| dataset v1 fraco | removido do fluxo ativo |
| validação fraca de dataset | criada validação com quality gates |
| legado quebrado | arquivado no GitHub |
| documentação divergente | sincronizada na Alexandria |
| lint falhando | config e warnings corrigidos |
| backend tentador de publicar cedo | decisão documentada de não publicar ainda |

---

## 14. Riscos remanescentes

### 14.1 Token Hugging Face antigo

Risco: token já existiu em arquivos locais antes da limpeza.

Ação recomendada:

- rotacionar token Hugging Face;
- atualizar `.secrets/.env` com token novo;
- testar `dataset/upload_to_hf.py` novamente.

### 14.2 Dataset ainda pequeno

O v2 é muito melhor que o v1, mas ainda é pequeno para treinamento robusto.

Risco:

- overfitting;
- pouca cobertura de objeções reais;
- respostas boas em cenários sintéticos, ruins em conversas livres.

### 14.3 Backend sem deploy

Decisão correta por enquanto, mas a landing em produção ainda usa fallback/local para chat.

Risco:

- experiência da Naiara em produção não é o backend real;
- dados reais de leads não persistem em CRM definitivo.

### 14.4 Integrações comerciais reais pendentes

Ainda falta validar:

- pagamento real;
- CRM definitivo;
- calendário real;
- webhook Evolution API real;
- handoff humano operacional;
- contrato/proposta formal.

---

## 15. Próximos passos recomendados

### Fase 1 — Dataset v3 / qualidade

1. Expandir de 43 para 200–500 conversas.
2. Separar por intenção:
   - preço;
   - data;
   - cardápio;
   - logística;
   - objeção de preço;
   - casamento;
   - infantil;
   - corporativo;
   - data indisponível;
   - fora da área;
   - lead frio;
   - lead agressivo/confuso;
   - pedido de áudio;
   - comprovante;
   - pedido de humano.
3. Criar exemplos negativos onde a assistente deve **não** inventar:
   - Pix;
   - CNPJ;
   - desconto;
   - disponibilidade;
   - atendimento fora de área;
   - contrato;
   - nota fiscal.
4. Criar split:
   - `train`;
   - `validation`;
   - `test`.
5. Criar scorecard humano de avaliação.

### Fase 2 — Dados reais

1. Selecionar conversas reais boas do WhatsApp.
2. Remover dados pessoais sensíveis.
3. Reescrever em formato limpo de treinamento.
4. Marcar com cenários e tags.
5. Misturar com sintéticos curados.

### Fase 3 — Treino

1. Rodar treino LoRA com Unsloth.
2. Publicar adaptadores em repo privado Hugging Face.
3. Testar modelo contra conjunto de avaliação fixo.
4. Comparar:
   - modelo base;
   - prompt atual;
   - LoRA v1.

### Fase 4 — Backend controlado

1. Criar API staging, não produção.
2. Conectar a um ambiente de teste da Evolution API.
3. Testar handoff humano.
4. Testar persistência de CRM.
5. Só publicar produção após checklist.

### Fase 5 — Comercial real

1. Definir dados oficiais de pagamento.
2. Definir contrato/proposta padrão.
3. Definir política de sinal.
4. Definir política de deslocamento.
5. Definir política de cancelamento/remarcação.
6. Atualizar system prompt e dataset com essas regras reais.

---

## 16. Comandos úteis

### Desenvolvimento frontend

```bash
bun install
bun run lint
bun run build
bun audit.js
```

### Dataset

```bash
bun dataset/generate_dataset_v2.js
bun dataset/validate_dataset.js
HF_TOKEN=... python dataset/upload_to_hf.py
```

### Backend local

```bash
cd backend
cp .env.example .env
bun install
bun run dev
```

### Git

```bash
git status --short --branch
git log --oneline -5
git push
```

---

## 17. Estado final desta rodada

- Repositório canônico criado e publicado.
- Legado arquivado.
- Alexandria sincronizada.
- `.gitignore` limpo.
- Tokens removidos dos scripts.
- Dataset v1 removido do fluxo.
- Dataset v2 criado, validado e publicado privado no Hugging Face.
- Backend mantido local por decisão estratégica.
- Próximo passo grande definido: **dataset v3 + treino Hugging Face/Unsloth + avaliação antes de produção**.
