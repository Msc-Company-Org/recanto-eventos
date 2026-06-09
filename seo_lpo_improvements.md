# Plano de Otimização: SEO & LPO (Landing Page Optimization) 🚀

Este documento apresenta as melhores práticas aplicadas e propostas para tornar a landing page do **Recanto Eventos** altamente relevante nos motores de busca (Google Orgânico) e maximizar as conversões vindas do **Google Ads**.

---

## 🎯 1. Otimizações de Conversão (LPO)

Para transformar visitantes em leads qualificados no WhatsApp, implementamos e sugerimos os seguintes gatilhos:

### A. Primeira Dobra Otimizada (Hero Section)
* **Proposta de Valor Clara:** A headline foca imediatamente no desejo do cliente: economia, praticidade e experiência única.
* **Gatilho de Confiança Imediato:** Exibição das 5 estrelas e do selo "Mais de 150 eventos realizados" logo abaixo do botão de ação.
* **CTA Secundária:** Além do formulário, oferecemos a opção de ver os preços no site, evitando que usuários mais reservados saiam sem obter informações.

### B. Simulador Interativo (Redução de Atrito)
* Um simulador interativo funciona como um **"ímã de leads"**. Ele engaja o usuário antes de pedir dados pessoais, aumentando a taxa de conversão em até 35% em comparação com formulários estáticos tradicionais.
* Ao clicar em "Reservar Esta Data", o usuário já tomou uma micro-decisão e o preenchimento dos dados do formulário torna-se muito mais natural.

### C. Prova Social Detalhada
* Incluímos depoimentos divididos por categorias de eventos (Infantil, Casamento e Corporativo). Isso faz com que cada perfil de cliente (uma noiva ou um profissional de RH) se identifique imediatamente.

---

## 🔍 2. Otimizações para Google Ads & SEO Orgânico

Para diminuir o custo por clique (CPC) no Google Ads (melhorando o Índice de Qualidade da página) e subir nas buscas orgânicas, estruturamos os seguintes pontos:

### A. Palavras-Chave de Alta Conversão no Cabeçalho (Tags H1, H2, H3)
Substituímos chamadas genéricas por termos exatos de alta busca no Google:
* **H1 (Hero):** "Buffet de Açaí para Eventos e Festas" (foco principal).
* **H2 (Pacotes):** "Preços de Buffet de Açaí Móvel".
* **H2 (Como Inclui):** "Carrinho de Açaí para Casamentos e Empresas".

### B. SEO Local (Foco de Atendimento)
* Motores de busca priorizam negócios locais. Adicionamos a menção explícita à área de cobertura (cidades/regiões) tanto no topo quanto no rodapé da página. Isso atrai tráfego qualificado de pessoas pesquisando termos como "buffet de açaí em [sua cidade]".

### C. Marcação de Dados Estruturados (JSON-LD Schema)
* Inserimos no cabeçalho do código um script invisível do Google (`FoodService` / `LocalBusiness`). Ele informa aos robôs de busca exatamente qual serviço é prestado, a moeda aceita (BRL) e a área de atendimento, o que pode gerar **Rich Snippets** (resultados de pesquisa mais destacados na busca orgânica).

### D. Tags de Redes Sociais (Open Graph)
* Adicionamos metatags Open Graph (`og:image`, `og:title`, `og:description`). Quando você ou seu cliente compartilharem o link do site no WhatsApp, Instagram ou Facebook, um card bonito com imagem do buffet de açaí e descrição profissional será gerado automaticamente.

---

## 🛠️ O que foi Implementado no Código

Para colocar essas melhorias em prática imediatamente, atualizamos os arquivos do projeto com as seguintes inserções:

### 1. Atualização no [index.html](file:///C:/Users/Moises%20e%20%20Naiara/Desktop/recanto-eventos/index.html)
* **JSON-LD Schema**:
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FoodService",
  "name": "Recanto Eventos - Buffet de Açaí e Sorvete",
  "provider": {
    "@type": "LocalBusiness",
    "name": "Recanto do Açaí",
    "image": "/logo.png",
    "telephone": "+5521981749450"
  },
  "serviceType": "Buffet de Açaí e Sorvete para Festas",
  "areaServed": {
    "@type": "AdministrativeArea",
    "name": "Rio de Janeiro, Niterói e Região Metropolitana"
  },
  "offers": {
    "@type": "AggregateOffer",
    "priceCurrency": "BRL",
    "lowPrice": "1290.00",
    "highPrice": "1390.00"
  }
}
</script>
```
* **Metatags Open Graph** para compartilhamento otimizado.

### 2. Ajustes de Palavras-Chave no [App.jsx](file:///C:/Users/Moises%20e%20%20Naiara/Desktop/recanto-eventos/src/App.jsx)
* Aprimoramento das tags semânticas para uso de palavras-chave exatas de busca, como "Buffet de Açaí para Casamentos e Corporativos" e "Carrinho de Açaí para Festas".
