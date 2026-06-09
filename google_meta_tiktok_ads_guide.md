# 🚀 Guia de Configuração e Mídia: Google, Meta & TikTok Ads

Este guia orienta o planejamento e a veiculação comercial das campanhas pagas do **Recanto Eventos** nas três principais plataformas de tráfego: **Google Ads**, **Meta Ads** e **TikTok Ads**. 

Integramos no código do site um sistema de **Dupla Camada de Rastreamento**, permitindo que os eventos de pixel sejam disparados tanto via Google Tag Manager (GTM) quanto por chamadas nativas diretas.

---

## 📊 1. Mapeamento de Eventos e Rastreamento

Para medir o retorno de cada centavo investido em anúncios, o site envia eventos padronizados para as três plataformas de acordo com a ação realizada pelo usuário:

| Ação do Usuário no Site | Evento no GTM / dataLayer | Evento no Meta Ads (Facebook) | Evento no TikTok Ads | Conversão no Google Ads |
| :--- | :--- | :--- | :--- | :--- |
| **Acessa a Landing Page** | \`page_view\` | \`PageView\` | \`Page` | Visualização da Página |
| **Simula valor no painel** | \`simulator_applied\` | \`ViewContent\` | \`ViewContent\` | Visualização de Conteúdo |
| **Clica em "Fechar Online Agora"** | \`choice_modal_option_clicked\` | \`InitiateCheckout\` | \`InitiateCheckout\` | Início de Finalização |
| **Clica em "Chamar no WhatsApp"** | \`choice_modal_option_clicked\` | \`Lead\` | \`Contact\` | Clique de Conversão |
| **Envia formulário de orçamento** | \`quote_form_submitted\` | \`Lead\` | \`SubmitForm\` | \`generate_lead\` (Conversão) |
| **Finaliza pagamento simulado** | \`purchase_completed\` | \`Purchase\` (com valor) | \`CompletePayment\` | \`purchase\` (Conversão de Venda) |

---

## 🔍 2. Estratégia no Google Ads (Intenção de Compra)

Como as pessoas pesquisam no Google ativamente quando precisam de um serviço, o foco deve ser na **Rede de Pesquisa (Search)**.

### Configuração da Campanha:
*   **Objetivo:** Leads (Contatos via Formulário e WhatsApp).
*   **Segmentação Geográfica:** Rio de Janeiro e Niterói (Raio de 25km a partir dos salões e principais bairros, como Barra da Tijuca, Copacabana e Tijuca).
*   **Palavras-Chave Principais:**
    *   \`"buffet de acai para festas rj"\` (Correspondência de frase)
    *   \`"carrinho gourmet de sorvete rj"\` (Correspondência de frase)
    *   \`[buffet de acai rj]\` (Correspondência exata)
    *   \`[carrinho de sorvete para eventos rj]\` (Correspondência exata)
*   **Conversão Principal:** \`generate_lead\` (disparada ao enviar o formulário de orçamento).

---

## 🌸 3. Estratégia no Meta Ads (Facebook & Instagram)

O Meta é focado em **interrupção visual e desejo**. Usaremos as fotos e vídeos reais do Recanto para chamar a atenção de quem está organizando festas.

### Configuração da Campanha:
*   **Objetivo:** Mensagens (WhatsApp) ou Vendas (Site).
*   **Segmentação de Público:** 
    *   *Interesses:* Casamento, Noiva, Aniversário infantil, Organização de eventos, Recursos Humanos.
    *   *Idades:* Focar em **25-34 anos** (noivas e pais de aniversário) e **45-64 anos** (mães de noivos/casamento premium com alta taxa de engajamento).

### Mapeamento de Mídias e Copies:

#### 🎬 Anúncio 1: Vídeo Servindo a Taça (Desejo e Fartura)
*   **Arquivo de Vídeo:** \`luana_servindo.mp4\` (Vídeo real de serviço - Vertical/Atrativo).
*   **Texto Principal:** 
    > Copo cheio, açaí artesanal super cremoso e mais de 20 acompanhamentos liberados à vontade para seus convidados! 🍦🍇
    > 
    > O Recanto Eventos leva a melhor estação gourmet de açaí e sorvete para o seu evento no Rio de Janeiro. Montagem rústico-chique, operadores uniformizados e limpeza total inclusa.
    > 
    > 👇 **Simule o valor na hora pelo nosso site!**
*   **Título:** Açaí e Sorvete Gourmet Liberado no RJ 🍨
*   **CTA:** Saiba Mais (Link da Landing Page)

#### 📸 Anúncio 2: Carrossel Premium (Casamentos & 15 anos)
*   **Arquivos de Fotos:** 
    1.  \`imagem_principal.jpg\` (Foto da mesa montada - Capa).
    2.  \`sorvete_de_perto.jpg\` ( Close dos sorvetes gourmet).
    3.  \`acai_de_perto.jpg\` (Close do copo com morangos e Nutella).
*   **Texto Principal:**
    > Um casamento inesquecível pede uma atração que faça a pista de dança ferver! 🥂✨ 
    > 
    > A estação gourmet do Recanto Eventos combina com a decoração do seu casamento rústico-chique e leva açaí artesanal e sorvetes finos com reposição livre. 
    > 
    > 👇 **Clique para fazer um orçamento online em 2 minutos!**
*   **Título:** Estação Gourmet de Açaí para Casamentos
*   **CTA:** Obter Cotação

---

## 🎵 4. Estratégia no TikTok Ads (Entretenimento e Dinamismo)

O TikTok exige criativos **rápidos, nativos e descontraídos**. A regra de ouro é: "Não faça anúncios, faça TikToks".

### Configuração da Campanha:
*   **Objetivo:** Conversões de Site (focado em cliques em WhatsApp ou leads no site).
*   **Público-alvo:** Noivos jovens, debutantes (15 anos) e público de festas gerais (18 a 35 anos).

### Mapeamento de Mídias e Copies:

#### ⚡ Criativo 1: Tendência/Bastidores (Cremoso e Rápido)
*   **Arquivo de Vídeo:** \`sorvete_qualidade.mp4\` ou \`video_principal.mp4\` (Cuts rápidos).
*   **Legenda TikTok:** 
    > Pov: você contratou buffet liberado de açaí e sorvete gourmet para o seu aniversário no Rio 🥵🍨 Morangos frescos, Nutella de verdade e reposição livre. 
    > 
    > 👇 **Simulador de orçamento na bio/link!**
*   **CTA:** Saiba Mais

#### 🧸 Criativo 2: Festa Infantil e Sucesso com Crianças (Prova Social)
*   **Arquivo de Vídeo:** \`festa_kids.mp4\` (Crianças montando copos felizes).
*   **Legenda TikTok:** 
    > A melhor ideia que você terá para a festa do seu filho este ano! Carrinho gourmet de sorvete e açaí com equipe que serve copos em 20 segundos. Zero filas, zero sujeira para você! 🎉
    > 
    > 👇 **Simule o valor pelo link!**
*   **CTA:** Fazer Simulação

---

## 🛠️ 5. Como Inserir seus Pixels no Site

Os scripts de Pixel já estão totalmente integrados e monitoram os eventos dinâmicos. Caso opte por inserir os IDs diretamente em HTML em vez de usar o Google Tag Manager, abra o arquivo [index.html](file:///C:/Users/Moises%20e%20%20Naiara/Desktop/recanto-eventos/index.html) e siga as instruções contidas no bloco de comentário explicativo inserido na tag \`<head>\`.
