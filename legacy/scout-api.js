'use strict'

const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 1000 }
  });

  const page = await context.newPage();

  // Capturar erros do console
  page.on('console', msg => {
    if (msg.type() === 'error') console.log(`CONSOLE ERROR: ${msg.text()}`);
  });
  page.on('pageerror', err => console.log(`PAGE ERROR: ${err.message}`));

  console.log('🔍 Navegando...');
  const response = await page.goto('https://www.sp.senac.br/senac-penha/cursos-livres?inscricao=true&bolsa=true', {
    waitUntil: 'domcontentloaded',
    timeout: 60000
  });
  console.log(`Status da página: ${response.status()}`);
  console.log(`URL final: ${page.url()}`);

  // Verificar o título
  const title = await page.title();
  console.log(`Título: ${title}`);

  // Aguardar mais
  await page.waitForTimeout(8000);

  // Salvar HTML para inspeção
  const html = await page.content();
  fs.writeFileSync('debug-pagina.html', html);
  console.log(`\n📄 HTML salvo em debug-pagina.html (${html.length} bytes)`);

  // Verificar elementos na página
  const bodyText = await page.evaluate(() => document.body ? document.body.innerText.substring(0, 1000) : 'NO BODY');
  console.log(`\n📝 Conteúdo do body:\n${bodyText}`);

  await browser.close();
})();
