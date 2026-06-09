# Dataset Naiara — Recanto Eventos

## Estado atual

- `naiara_dataset_v2.jsonl` é o dataset ativo para publicação/treinamento.
- `naiara_dataset.jsonl` era o dataset sintético v1 e foi removido do fluxo ativo por conter baixa qualidade comercial (ex.: placeholders de Pix e claims de pagamento não validados).
- `generate_dataset_v2.js` gera o v2 curado de forma determinística.
- `validate_dataset.js` valida schema, tool calls, segredos e claims proibidas.

## Comandos

```bash
bun dataset/generate_dataset_v2.js
bun dataset/validate_dataset.js
HF_TOKEN=... python dataset/upload_to_hf.py
```

## Repositório Hugging Face padrão

`Finish-him/naiara-recanto-dataset-v2`

O upload é privado por padrão.

## Quality gates

O validador bloqueia:

- tokens/chaves (`sk-...`, `hf_...`, `github_pat_...`);
- chaves privadas;
- Pix/CNPJ placeholder (`12.345.678/0001-90`);
- promessa de `Stripe` sem integração validada;
- promessa ampla de atendimento no Brasil inteiro;
- tool calls sem tool result correspondente no dataset v2;
- ferramentas fora da lista permitida.

## Diretrizes comerciais

- Foco atual: açaí + sorvete gourmet para eventos.
- Não reintroduzir pipoca/crepe/algodão doce como oferta principal.
- Não inventar CNPJ, Pix, senha, token ou dado bancário.
- Acima de 150 convidados sempre acionar humano.
- Área principal: Rio de Janeiro, Niterói, Baixada e Região Metropolitana.
