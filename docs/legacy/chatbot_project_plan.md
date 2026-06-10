# 🤖 Planejamento do Chatbot Especialista em Vendas: Recanto Eventos

> [!IMPORTANT]
> Documento **arquivado**. Consolidado em [`docs/NAIARA-CHATBOT.md`](../NAIARA-CHATBOT.md), que é a fonte canônica atual da persona, arquitetura e roteiro do chatbot.

Este documento detalha o planejamento técnico, a modelagem de persona (carioca), a arquitetura de integrações e o roteiro de treinamento/fine-tuning para o desenvolvimento do chatbot inteligente do **Recanto Eventos**.

---

## 🎭 1. Persona e Linguística (Carioca Humanizado)

Para conectar com o cliente do Rio de Janeiro de forma autêntica e afetuosa, o chatbot assumirá uma persona com tom de voz leve, praiano e acolhedor, sem perder o profissionalismo corporativo.

* **Nome Oficial:** **Naiara** (nome simpático, confiável e cheio de personalidade).
* **Tom de Voz:** Caloroso, enérgico, prestativo e otimista (energia solar do Rio).
* **Uso de Expressões Cariocas (Moderação):**
  * *Saudações:* "E aí, beleza?", "Tudo bem por aí?"
  * *Concordância:* "Fechado!", "Maravilha!", "Com certeza", "Tamo junto!"
  * *Transições:* "Olha só...", "Cara, deixa eu te falar...", "Bacana demais!"
* **Diretriz de Humanização:** Evitar respostas robóticas ou listas excessivamente formais. Utilizar emojis adequados (🍨, 💜, 🎉, 🛵) e quebras de linha que simulam uma digitação humana.

---

## 🛠️ 2. Arquitetura Tecnológica

O sistema será dividido em três camadas básicas:

1. **Canal de Integração (WhatsApp & Web)**
   * **WhatsApp:** Integração via APIs parceiras estáveis (como Evolution API, Z-API ou a API Oficial Cloud da Meta).
   * **Web:** Widget flutuante de chat criado em React e embutido no site.
   * **Orquestrador:** Backend em **Python (FastAPI)** ou **Node.js (NestJS)** para gerenciar sessões de conversa (Redis) e regras de encaminhamento.

2. **Modelo de IA (LLM)**
   * **Modelo Recomendado:** **Qwen-2.5-7B-Instruct** ou **Llama-3.2-3B-Instruct**.
     * *Motivo:* Modelos extremamente leves, rápidos, com excelente suporte ao português e capacidades avançadas de "Tool Calling" (o modelo consegue decidir quando usar uma função interna para calcular orçamentos).
   * **Multimodality (Visão e Áudio)**:
     * **Texto para Voz (ElevenLabs):** Quando o recurso de áudio estiver ativo, o backend envia a resposta de texto da *Naiara* para a API da ElevenLabs com um modelo de voz personalizado (clonado com sotaque carioca) e envia o arquivo de áudio de volta ao WhatsApp.
     * **Visão (Leitura de Comprovantes):** O modelo multimodal (ex: *Llama-3.2-11B-Vision-Instruct*) poderá analisar imagens enviadas pelo cliente para validar comprovantes de Pix de sinal de 50%.

---

## 🧠 3. Estratégia de Fine-Tuning com Unsloth & QLoRA

Para que o modelo fale exatamente como a persona *Naiara* e entenda todas as regras de precificação do Recanto Eventos, faremos um treinamento especializado.

### A. Ferramenta de Treinamento: **Unsloth**
O **Unsloth** é a biblioteca de fine-tuning mais recomendada atualmente:
* **2x a 5x mais rápido** do que o treinamento tradicional do Hugging Face.
* **Reduz o consumo de VRAM em até 80%**, permitindo treinar um modelo de 7B parâmetros em GPUs de baixo custo (como a NVIDIA T4 ou L4 no Google Colab/RunPod).
* Suporta **QLoRA** (Quantized Low-Rank Adaptation), mantendo os pesos originais do modelo congelados em 4 bits e treinando apenas pequenas camadas adicionais, garantindo eficiência sem perda de qualidade.

### B. Como estruturar o Dataset (Português - RJ)
Criaremos um dataset customizado no formato **ShareGPT** (conversacional). O dataset conterá centenas de exemplos de interações de venda reais adaptadas para a persona.

#### Exemplo de Estrutura do Dataset (`dataset.json`):
```json
[
  {
    "conversations": [
      {
        "from": "system",
        "value": "Você é a Naiara, especialista em vendas do Recanto do Açaí Eventos no Rio de Janeiro. Seu tom é carioca, caloroso, prestativo e profissional. Você vende buffets de açaí e sorvete usando gírias do RJ moderadamente."
      },
      {
        "from": "human",
        "value": "Olá, queria saber os preços de vocês para uma festa de aniversário."
      },
      {
        "from": "gpt",
        "value": "E aí! Beleza? 🎉 Pô, que maravilha de comemoração! A gente tem dois pacotes bem bacanas para o seu evento. O Festa Express de 3 horas sai a R$ 1.290,00 e o Festa Premium de 4 horas fica a R$ 1.390,00. Qual deles combina mais com a sua ideia? Me conta também para quantas pessoas você está planejando!"
      }
    ]
  }
]
```

### C. Pipeline de Treinamento no Hugging Face:
1. **Coleta de Dados:** Compilar conversas passadas de atendentes humanos, reescrevendo-as no formato de dataset conversacional da persona *Naiara*.
2. **Treinamento com Notebook Unsloth:** Configurar o script de QLoRA no notebook, apontando para o modelo base `Qwen/Qwen2.5-7B-Instruct`.
3. **Métricas de Validação:** Acompanhar a perda de treinamento (Loss) para evitar *overfitting* (quando o modelo decora as respostas em vez de aprender o comportamento).
4. **Exportação:** Salvar os adaptadores LoRA diretamente no seu repositório privado no **Hugging Face Hub**.
5. **Merge e Quantização:** Realizar o merge do LoRA com o modelo base e exportar no formato **GGUF** para rodar com baixíssima latência localmente ou em servidores de inferência (como vLLM ou Ollama).

---

## 📈 4. Roteiro de Implementação Inicial

1. **Dataset Alpha (Fase 1):** Escrever manualmente ou sintetizar com auxílio de IA (usando Claude/GPT-4o) 150 conversas completas contendo dúvidas sobre:
   * Detalhes dos pacotes (3h vs 4h).
   * Ingredientes (açaí, coberturas, caldas).
   * Logística de eventos (energia, tomada, tempo de montagem no RJ).
   * Negociação de preço para acima de 150 convidados.
2. **Setup do Treinamento:** Rodar o fine-tuning QLoRA via Unsloth.
3. **Integração Básica:** Conectar o modelo quantizado ao orquestrador FastAPI com envio de mensagens de texto no WhatsApp.
4. **Voz (Fase 2):** Clonar a voz de uma locutora carioca na ElevenLabs e habilitar mensagens de áudio opcionais para clientes VIPs.
