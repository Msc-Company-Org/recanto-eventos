const fs = require('fs');
const path = require('path');

// Target files to audit
const HTML_FILE_PATH = path.join(__dirname, 'index.html');
const REPORT_OUTPUT_PATH = path.join(__dirname, 'docs', 'relatorios', 'seo-audit.md');

console.log('🔍 Iniciando Auditoria SEO e Boas Práticas do Recanto Eventos...');

if (!fs.existsSync(HTML_FILE_PATH)) {
    console.error(`❌ Erro: O arquivo index.html não foi encontrado em: ${HTML_FILE_PATH}`);
    process.exit(1);
}

const htmlContent = fs.readFileSync(HTML_FILE_PATH, 'utf-8');

// Categories score tracking
const scores = {
    seo: 100,
    accessibility: 100,
    bestPractices: 100
};

const issues = [];
const successes = [];

// Helper to register audit results
function recordResult(category, points, pass, title, desc, details = '') {
    if (pass) {
        successes.push({ category, title, desc, details });
    } else {
        scores[category] = Math.max(0, scores[category] - points);
        issues.push({ category, title, desc, details });
    }
}

// ==========================================================================
// 1. AUDITORIA DE SEO
// ==========================================================================

// A. Title Tag
const titleMatch = htmlContent.match(/<title>([^]*?)<\/title>/i);
if (titleMatch) {
    const title = titleMatch[1].trim();
    const len = title.length;
    const isGoodLen = len >= 30 && len <= 70;
    recordResult(
        'seo',
        15,
        isGoodLen,
        'Tag de Título (<title>)',
        `Título encontrado: "${title}" (${len} caracteres). O recomendado é entre 30 e 70 caracteres.`,
        `Tamanho ideal ajuda a evitar cortes nos resultados de pesquisa do Google.`
    );
} else {
    recordResult('seo', 25, false, 'Tag de Título (<title>)', 'Tag <title> não foi encontrada no documento HTML!', 'Crítico para indexação orgânica.');
}

// B. Meta Description
const descMatch = htmlContent.match(/<meta\s+name=["']description["']\s+content=["']([^]*?)["']\s*\/?>/i) || 
                  htmlContent.match(/<meta\s+content=["']([^]*?)["']\s+name=["']description["']\s*\/?>/i);
if (descMatch) {
    const desc = descMatch[1].trim();
    const len = desc.length;
    const isGoodLen = len >= 120 && len <= 170;
    recordResult(
        'seo',
        15,
        isGoodLen,
        'Meta Description',
        `Meta description encontrada: "${desc.substring(0, 50)}..." (${len} caracteres). Recomendado: entre 120 e 170 caracteres.`,
        `Meta descrições curtas ou longas demais diminuem a taxa de clique (CTR) no Google.`
    );
} else {
    recordResult('seo', 25, false, 'Meta Description', 'Tag meta name="description" não foi encontrada!', 'Afeta diretamente a CTR de buscas orgânicas.');
}

// C. Lang Attribute
const langMatch = htmlContent.match(/<html\s+lang=["']([^]*?)["']/i);
if (langMatch) {
    const lang = langMatch[1].trim();
    const isPT = lang.toLowerCase().startsWith('pt');
    recordResult(
        'seo',
        10,
        isPT,
        'Atributo de Idioma (lang)',
        `O idioma configurado é "${lang}".`,
        'Indica aos motores de busca a localização principal da página (pt-BR para o Brasil).'
    );
} else {
    recordResult('seo', 15, false, 'Atributo de Idioma (lang)', 'A tag <html> não possui atributo lang!', 'Importante para motores de busca direcionarem ao público geográfico correto.');
}

// D. Meta Viewport (Mobile Friendly)
const viewportMatch = htmlContent.match(/<meta\s+name=["']viewport["']/i);
recordResult(
    'seo',
    15,
    !!viewportMatch,
    'Configuração Mobile (meta viewport)',
    viewportMatch ? 'Meta viewport encontrada.' : 'Meta viewport ausente no cabeçalho!',
    'Crucial para adaptabilidade móvel e usabilidade em celulares (SEO Mobile).'
);

// E. Headings Hierarchy
const h1Matches = htmlContent.match(/<h1[^]*?>([^]*?)<\/h1>/gi);
const h1Count = h1Matches ? h1Matches.length : 0;
recordResult(
    'seo',
    15,
    h1Count === 1,
    'Título Principal Único (H1)',
    h1Count === 1 ? 'Exatamente 1 tag H1 encontrada na estrutura.' : `Encontrados ${h1Count} tags H1 no documento.`,
    'Ter exatamente um H1 por página contendo a palavra-chave primária é uma das principais regras de SEO On-Page.'
);

// F. Open Graph Social Metadata
const ogTitle = htmlContent.match(/<meta\s+property=["']og:title["']/i);
const ogDesc = htmlContent.match(/<meta\s+property=["']og:description["']/i);
const ogImage = htmlContent.match(/<meta\s+property=["']og:image["']/i);
const hasOG = ogTitle && ogDesc && ogImage;
recordResult(
    'seo',
    10,
    !!hasOG,
    'Metadados Open Graph (Social)',
    hasOG ? 'Tags Open Graph completas encontradas.' : 'Faltam tags Open Graph principais no cabeçalho (og:title, og:description ou og:image).',
    'Permite que links compartilhados em redes sociais e WhatsApp tenham pré-visualização profissional.'
);

// G. Structured Data (JSON-LD)
const jsonLdMatch = htmlContent.match(/<script\s+type=["']application\/ld\+json["']/i);
recordResult(
    'seo',
    10,
    !!jsonLdMatch,
    'Dados Estruturados (JSON-LD)',
    jsonLdMatch ? 'Marcação JSON-LD encontrada.' : 'Nenhuma marcação JSON-LD encontrada!',
    'Informa ao Google detalhes ricos sobre o negócio (LocalBusiness / FoodService) para habilitar Rich Snippets.'
);

// ==========================================================================
// 2. AUDITORIA DE ACESSIBILIDADE & BEST PRACTICES
// ==========================================================================

// A. Image Alt tags (Lightweight parser)
const imgTags = htmlContent.match(/<img[^>]*?>/g) || [];
let missingAlts = 0;
imgTags.forEach(img => {
    if (!img.match(/alt=["'][^]*?["']/i)) {
        missingAlts++;
    }
});
recordResult(
    'accessibility',
    15,
    missingAlts === 0,
    'Atributos de Texto Alternativo (alt) em Imagens',
    missingAlts === 0 ? 'Todas as imagens possuem tag alt descritiva.' : `Existem ${missingAlts} imagens sem o atributo alt configurado.`,
    'Essencial para leitores de tela de deficientes visuais e indexação de imagens do Google.'
);

// B. Performance Preconnect
const preconnectMatch = htmlContent.match(/<link\s+rel=["']preconnect["']/i);
recordResult(
    'bestPractices',
    10,
    !!preconnectMatch,
    'Preconexão de Fontes e Recursos Externos (preconnect)',
    preconnectMatch ? 'Tags preconnect para carregamento de fontes encontradas.' : 'Ausência de preconnect no cabeçalho para fontes Google.',
    'Acelera o tempo de renderização visual inicial da página (FCP).'
);

// ==========================================================================
// GENERATE MARKDOWN REPORT
// ==========================================================================

let reportMarkdown = `# 📊 Relatório de Auditoria SEO & Desempenho

Este relatório foi gerado automaticamente pelo script de análise local do **Recanto Eventos** para medir a conformidade com as diretrizes do Google Lighthouse.

## 🎯 Índices de Conformidade

| Categoria | Nota | Status |
| :--- | :---: | :---: |
| 🔍 **SEO / Indexação** | **${scores.seo}/100** | ${scores.seo >= 90 ? '🟢 Excelente' : '🟡 Atenção'} |
| ♿ **Acessibilidade** | **${scores.accessibility}/100** | ${scores.accessibility >= 90 ? '🟢 Excelente' : '🟡 Atenção'} |
| ⚡ **Melhores Práticas** | **${scores.bestPractices}/100** | ${scores.bestPractices >= 90 ? '🟢 Excelente' : '🟡 Atenção'} |

---

## ❌ Oportunidades de Otimização (${issues.length})

${issues.length === 0 ? '*Nenhuma pendência encontrada! Parabéns, a página está 100% otimizada.*' : issues.map(iss => `
### ⚠️ ${iss.title} [\`${iss.category.toUpperCase()}\`]
* **Diagnóstico:** ${iss.desc}
* **Impacto:** _${iss.details}_
`).join('\n')}

---

## 🟢 Otimizações Concluídas (${successes.length})

${successes.map(suc => `
### ✅ ${suc.title}
* **Conformidade:** ${suc.desc}
* **Detalhes:** _${suc.details}_
`).join('\n')}

---
*Relatório de Auditoria Recanto Eventos v1.0. Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}.*
`;

fs.writeFileSync(REPORT_OUTPUT_PATH, reportMarkdown);
console.log(`✅ Relatório de auditoria salvo com sucesso em: ${REPORT_OUTPUT_PATH}`);

// Exibe resumo no console
console.log('\n--- RESUMO DO SCORE ---');
console.log(`🔍 SEO: ${scores.seo}/100`);
console.log(`♿ Acessibilidade: ${scores.accessibility}/100`);
console.log(`⚡ Melhores Práticas: ${scores.bestPractices}/100`);
console.log('-----------------------\n');
