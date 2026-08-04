const { chromium } = require('playwright'); //Biblioteca que permite scrapping com seletores css
const fs = require('fs'); //Modulo do node para salvar arquivos

// Função de rolagem
async function autoScroll(page) {
  await page.evaluate(async () => {
    //Injeta o script no js da pagina
    await new Promise((resolve) => {
      //faz com que a função assincrona aguarde o sinal resolve() para continuar
      let totalHeight = 0;
      let distance = 300;
      let timer = setInterval(() => {
        // rola 300 a cada 150ms, e soma a distancia percorrida em uma variavel incremental (totalheight)
        let scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;
        if (totalHeight >= scrollHeight || totalHeight > 15000) {
          clearInterval(timer);
          resolve();
        }
      }, 150);
    });
  });
}

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    //userAgent faz com que o navegador interno se "identifique como humano"
    viewport: { width: 1280, height: 1000 }
  });

  await context.route('**/*', (route) => {
    const type = route.request().resourceType();
    if (['image', 'font', 'media'].includes(type)) return route.abort();
    route.continue();
  });

  const unidadesSenac = ['senac-penha', 'senac-sao-miguel-paulista'];
  let todosOsCursos = [];

  for (const unidade of unidadesSenac) {
    console.log(`\n--- Coletando catálogo da unidade: ${unidade} ---`);
    const page = await context.newPage();

    try {
      await page.goto(`https://www.sp.senac.br/${unidade}/cursos-livres?inscricao=true&bolsa=true`, {
        waitUntil: 'domcontentloaded',
        timeout: 30000
      });
      
      await autoScroll(page);
      await page.waitForTimeout(3000);

      const cursosUnidade = await page.evaluate((unidadeAtual) => {
        const titles = document.querySelectorAll('.ssp-card-curso__title');
        const listaFiltrada = [];

        // Função interna para limpar o nome da unidade (remove traços e capitaliza)
        const formatarUnidade = (str) => {
          return str
            .replace(/-/g, ' ')
            .replace(/\b\w/g, (l) => l.toUpperCase());
        };
        
        const nomeUnidadeFormatado = formatarUnidade(unidade);
        
        titles.forEach(titleEl => {
          const titulo = titleEl.innerText ? titleEl.innerText.trim() : '';
          const linkEl = titleEl.closest('a');
          const link = linkEl ? linkEl.href : '';

          listaFiltrada.push({
              unidade: nomeUnidadeFormatado, 
              curso: titulo,
              link: link
          });
        });

        return listaFiltrada;
      }, unidade);

      console.log(`[Sucesso] Capturados ${cursosUnidade.length} cursos em ${unidade}.`);
      todosOsCursos.push(...cursosUnidade);

    } catch (err) {
      console.log(`[Erro] Falha ao processar a unidade ${unidade}: ${err.message}`);
    } finally {
      await page.close();
    }
  }

  if (todosOsCursos.length === 0){ console.log("Erro! nenhum curso foi encontrado"); };

  // 1. SALVAMENTO SISTÊMICO: Guarda a lista com os links em um arquivo local
  fs.writeFileSync('cursos.json', JSON.stringify(todosOsCursos, null, 2));
  console.log('\n[Backup] Todos os 128 cursos (com links) foram salvos em "cursos.json".');

  // 2. SAÍDA FORMATADA PARA A LLM: Imprime limpo no terminal para você copiar
  console.log('\n================ COPIE AS LINHAS ABAIXO PARA SUA LLM ================');
  todosOsCursos.forEach(item => {
    console.log(`Unidade: ${item.unidade} | Curso: ${item.curso}`);
  });
  console.log('=====================================================================');
  
  await browser.close();
})();