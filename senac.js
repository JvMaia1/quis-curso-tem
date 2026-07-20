const { chromium } = require('playwright');
const fs = require('fs');
const { log } = require('console');

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      let distance = 300;
      let timer = setInterval(() => {
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
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 1000 }
  });

  await context.route('**/*', (route) => {
    const type = route.request().resourceType();
    if (['image', 'font', 'media'].includes(type)) return route.abort();
    route.continue();
  });
  
  const unidadesSenac = ['senac-penha', 'senac-sao-miguel-paulista'];
  let todosOsCursos = [];
  
  // Função declarada uma vez na raiz do escopo
  const formatarUnidade = (str) => {
    return str
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  for (const unidade of unidadesSenac) {
    console.log(`\n--- Coletando catálogo da unidade: ${unidade} ---`);
    const page = await context.newPage();
    
    // 1. FORMATAMOS AQUI: A unidade é formatada apenas uma vez por loop
    const unidadeFormatada = formatarUnidade(unidade);
    
    try {
      await page.goto(`https://www.sp.senac.br/${unidade}/cursos-livres?inscricao=true&bolsa=true`, {
        waitUntil: 'domcontentloaded',
        timeout: 30000
      });
      
      await autoScroll(page);
      await page.waitForTimeout(3000);
      
      // 2. INJEÇÃO: Passamos 'unidadeFormatada' como o segundo parâmetro do evaluate
      const cursosUnidade = await page.evaluate((nomeInjetado) => {
        const titles = document.querySelectorAll('.ssp-card-curso__title');
        const listaFiltrada = [];
        
        titles.forEach(titleEl => {
          const titulo = titleEl.innerText ? titleEl.innerText.trim() : '';
          const linkEl = titleEl.closest('a');
          const link = linkEl ? linkEl.href : '';
          
          if (titulo !== '' && link !== '' && !link.includes('#a')) {
            listaFiltrada.push({
              unidade: nomeInjetado, // 3. USO: Usamos o parâmetro que o navegador recebeu
              curso: titulo,
              link: link
            });
          }
        });
        
        return listaFiltrada;
      }, unidadeFormatada); // <--- A variável do Node entra no navegador por aqui
      
      console.log(`[Sucesso] Capturados ${cursosUnidade.length} cursos em ${unidade}.`);
      todosOsCursos.push(...cursosUnidade);
      
    } catch (err) {
      console.log(`[Erro] Falha ao processar a unidade ${unidade}: ${err.message}`);
    } finally {
      await page.close();
    }
  }
  
  fs.writeFileSync('cursos.json', JSON.stringify(todosOsCursos, null, 2));
  
  if (todosOsCursos.length === 0){
    console.log("Houve um erro, nenhum curso encontrado");
  } else { 
    console.log('\n[Backup] Todos os cursos (com links) foram salvos em "cursos.json".');
  }

  todosOsCursos.forEach(item => {
    console.log(`Unidade: ${item.unidade} | Curso: ${item.curso}`);
  });
  console.log('=====================================================================');
  
  await browser.close();
})();