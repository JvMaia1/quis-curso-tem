'use strict'

const axios = require('axios');
const fs = require('fs');

// ============================================================
// CONFIGURAÇÃO
// ============================================================

const BASE_URL = 'https://www.sp.senac.br';
const GROUP_ID = '20125';
const COMPANY_ID = '20102';
const VOCABULARY_ID = '40393'; // ID do vocabulário "Tema Mercadológico"

// Unidades a processar (friendlyURL → usar no futuro)
const UNIDADES = [
  { friendlyUrl: 'senac-penha', nome: 'Senac Penha' },
  { friendlyUrl: 'senac-sao-miguel-paulista', nome: 'Senac São Miguel Paulista' },
];

const TIPO_CURSO_NOME = 'Livre'; // Nome interno do tipo de curso
const FILTRAR_INSCRICOES_ABERTAS = true;
const FILTRAR_BOLSA_ESTUDO = true;

// ============================================================
// UTILITÁRIOS
// ============================================================

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json',
  },
  timeout: 30000,
});

/** Pequena pausa entre requisições para evitar rate limiting */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Faz o parse do XML de detalhes da oferta e extrai os campos relevantes.
 * O XML usa nós <dynamic-element name="..."> com conteúdo em <dynamic-content>.
 *
 * Dois formatos possíveis de conteúdo:
 * 1. CDATA direto:    <dynamic-content><![CDATA[valor]]></dynamic-content>
 * 2. Option (select): <dynamic-content><option><![CDATA[valor]]></option></dynamic-content>
 */
function parseOfertaXML(xmlString) {
  const campos = {};

  // Regex captura o bloco dynamic-element inteiro (não-greedy entre elementos)
  const blocoRegex = /<dynamic-element[^>]*name="([^"]*)"[^>]*>([\s\S]*?)<\/dynamic-element>/gi;
  let match;
  while ((match = blocoRegex.exec(xmlString)) !== null) {
    const nome = match[1];
    const conteudoBloco = match[2];

    // Tenta extrair do CDATA dentro de <dynamic-content>
    // Formato 1: CDATA direto
    let cdataMatch = /<dynamic-content[^>]*><!\[CDATA\[(.*?)\]\]><\/dynamic-content>/i.exec(conteudoBloco);
    if (cdataMatch) {
      campos[nome] = cdataMatch[1].trim();
      continue;
    }

    // Formato 2: option dentro de dynamic-content (campos select)
    let optionMatch = /<option><!\[CDATA\[(.*?)\]\]><\/option>/i.exec(conteudoBloco);
    if (optionMatch) {
      campos[nome] = optionMatch[1].trim();
      continue;
    }

    // Formato 3: dynamic-content sem CDATA (texto puro ou vazio)
    let textMatch = /<dynamic-content[^>]*>(.*?)<\/dynamic-content>/i.exec(conteudoBloco);
    if (textMatch) {
      campos[nome] = textMatch[1].trim();
    }
  }

  return campos;
}

// ============================================================
// FUNÇÕES PRINCIPAIS DA API
// ============================================================

/** Obtém o categoryId da unidade a partir da friendly URL */
async function getCategoryIdUnidade(friendlyUrl) {
  const { data } = await api.get(
    `/o/senac-unidade-services/categoriaPorFriendlyURL/${friendlyUrl}/0`
  );
  if (!data || data.length === 0) {
    throw new Error(`Unidade não encontrada: ${friendlyUrl}`);
  }
  return data[0].categoryId;
}

/** Obtém o categoryId do tipo de curso (ex: "Livre", "Técnico", "Extensão") */
async function getCategoryIdTipoCurso(tipoCursoNome) {
  const { data } = await api.get(
    `/o/senac-content-services/idTipoCursoPorNome/${GROUP_ID}/${encodeURIComponent(tipoCursoNome)}`
  );
  return data;
}

/** Lista todos os temas (categorias) do vocabulário de temas mercadológicos */
async function getTemas() {
  const { data } = await api.get('/o/senac-category-services/categories', {
    params: {
      companyId: COMPANY_ID,
      groupIds: GROUP_ID,
      parentCategoryIds: 0,
      vocabularyIds: VOCABULARY_ID,
    },
  });
  return data;
}

/** Busca cursos de uma categoria/tema específico */
async function getCursosPorCategoria(categoriaTemaId, tipoCursoId, unidadeId, start = 0, limit = 100) {
  const url = `/o/senac-content-services/cursosPorCategoriasComFiltrosBolsaECompra/${GROUP_ID}/${FILTRAR_INSCRICOES_ABERTAS ? 1 : 0}/${FILTRAR_BOLSA_ESTUDO ? 1 : 0}/1/${start}/${start + limit}`;

  const { data } = await api.get(url, {
    params: {
      categoryIds: [categoriaTemaId, tipoCursoId, unidadeId],
    },
    paramsSerializer: { indexes: null }, // Axios vai enviar categoryIds=val1&categoryIds=val2
  });

  // A API retorna uma string JSON que precisa ser parseada
  const parsed = typeof data === 'string' ? JSON.parse(data) : data;
  return parsed;
}

/** Busca ofertas/turmas para um curso específico */
async function getOfertasCurso(codigoFTOferta, categoryIdsUnidade, cursoArticleId, dataEfetivaOferta) {
  const { data } = await api.get(
    `/o/senac-oferta-services/ofertasPorCategoryIds/${GROUP_ID}`,
    {
      params: {
        codigoFTOferta,
        categoryIds: categoryIdsUnidade,
        cursoArticleId,
        dataEfetivaOferta,
        start: 0,
        end: 100,
        considerarDataBolsaFutura: true,
      },
    }
  );

  // Parse XML em cada oferta
  return (data || []).map(oferta => ({
    ...oferta,
    detalhes: parseOfertaXML(oferta.content || ''),
  }));
}

// ============================================================
// FLUXO PRINCIPAL
// ============================================================

async function processarUnidade(unidade) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🏫 Processando unidade: ${unidade.nome} (${unidade.friendlyUrl})`);
  console.log(`${'='.repeat(60)}`);

  // 1. Obter ID da unidade
  console.log('  📍 Obtendo ID da unidade...');
  const unidadeId = await getCategoryIdUnidade(unidade.friendlyUrl);
  console.log(`     → ID: ${unidadeId}`);

  // 2. Obter ID do tipo de curso
  console.log(`  📘 Obtendo ID do tipo de curso "${TIPO_CURSO_NOME}"...`);
  const tipoCursoId = await getCategoryIdTipoCurso(TIPO_CURSO_NOME);
  console.log(`     → ID: ${tipoCursoId}`);

  // 3. Listar temas
  console.log('  🏷️  Listando temas...');
  const temas = await getTemas();
  console.log(`     → ${temas.length} temas encontrados`);

  const todosCursos = [];

  // 4. Para cada tema, buscar cursos
  for (const tema of temas) {
    console.log(`\n  📂 Tema: ${tema.name} (ID: ${tema.categoryId})`);

    try {
      const resultado = await getCursosPorCategoria(
        tema.categoryId,
        tipoCursoId,
        unidadeId
      );

      const cursos = resultado.cursos || [];

      if (cursos.length === 0) {
        console.log(`     → Nenhum curso encontrado`);
        continue;
      }

      console.log(`     → ${cursos.length} cursos encontrados`);

      // 5. Para cada curso, buscar ofertas/turmas
      for (const curso of cursos) {
        console.log(`       📖 ${curso.title} (codigoFT: ${curso.codigoFT})`);

        try {
          const ofertas = await getOfertasCurso(
            curso.codigoFT,
            unidadeId,
            curso.articleId,
            curso.dataEfetivaFT
          );

          todosCursos.push({
            unidade: unidade.nome,
            unidadeId,
            tema: tema.name,
            temaId: tema.categoryId,
            curso: curso.title,
            codigoFT: curso.codigoFT,
            articleId: curso.articleId,
            url: curso.url ? `${BASE_URL}${curso.url}` : null,
            imagemURL: curso.imagemURL ? `${BASE_URL}${curso.imagemURL}` : null,
            modalidade: curso.modalidade || [],
            formato: curso.formatos || [],
            tags: curso.tags || [],
            ofertas: ofertas.map(o => ({
              dataInicio: o.detalhes.dataInicioOferta || '',
              dataFim: o.detalhes.dataFimOferta || '',
              horarios: o.detalhes.horariosAllOferta || '',
              diasDaSemana: o.detalhes.diasDaSemanaOferta || '',
              periodoDia: o.detalhes.periodoDiaOferta || '',
              totalVagas: o.detalhes.qtdeTotalVagas || '',
              vagasPSG: o.detalhes.qtdeTotalVagasPSG || '',
              dataAberturaBolsa: o.detalhes.dataAberturaBolsaOferta || '',
              precoVenda: o.detalhes.precoVendaOferta || '',
              precoDesconto: o.detalhes.Text91718406 || '',
              maxParcelas: o.detalhes.numeroMaxParcelasOferta || '',
              valorParcela: o.detalhes.precoVendaMaxParcelaOferta || '',
              permiteListaEspera: o.detalhes.permiteListaEspera || '',
              dataLimiteMatricula: o.detalhes.dtLimiteMatricula || '',
              localEspacoExterno: o.detalhes.localEspacoExterno || '',
            })),
          });

          // Pequena pausa para não sobrecarregar o servidor
          await sleep(200);
        } catch (err) {
          console.error(`       ⚠️  Erro ao buscar ofertas para "${curso.title}": ${err.message}`);
          // Adiciona o curso mesmo sem ofertas
          todosCursos.push({
            unidade: unidade.nome,
            unidadeId,
            tema: tema.name,
            temaId: tema.categoryId,
            curso: curso.title,
            codigoFT: curso.codigoFT,
            articleId: curso.articleId,
            url: curso.url ? `${BASE_URL}${curso.url}` : null,
            imagemURL: curso.imagemURL ? `${BASE_URL}${curso.imagemURL}` : null,
            modalidade: curso.modalidade || [],
            formato: curso.formatos || [],
            tags: curso.tags || [],
            ofertas: [],
            erroOfertas: err.message,
          });
        }
      }

      await sleep(500); // Pausa entre temas
    } catch (err) {
      console.error(`     ⚠️  Erro ao buscar cursos do tema "${tema.name}": ${err.message}`);
    }
  }

  return todosCursos;
}

// ============================================================
// EXECUÇÃO
// ============================================================

(async () => {
  console.log('🚀 Iniciando extração de cursos do Senac...');
  console.log(`   Unidades: ${UNIDADES.map(u => u.nome).join(', ')}`);
  console.log(`   Tipo de curso: ${TIPO_CURSO_NOME}`);
  console.log(`   Filtrar inscrições abertas: ${FILTRAR_INSCRICOES_ABERTAS}`);
  console.log(`   Filtrar bolsa estudo: ${FILTRAR_BOLSA_ESTUDO}\n`);

  const resultadoFinal = {
    dataExtracao: new Date().toISOString(),
    totalCursos: 0,
    unidades: [],
  };

  for (const unidade of UNIDADES) {
    try {
      const cursos = await processarUnidade(unidade);
      resultadoFinal.unidades.push({
        nome: unidade.nome,
        friendlyUrl: unidade.friendlyUrl,
        totalCursos: cursos.length,
        cursos,
      });
      resultadoFinal.totalCursos += cursos.length;
    } catch (err) {
      console.error(`❌ Erro fatal ao processar unidade ${unidade.nome}: ${err.message}`);
      resultadoFinal.unidades.push({
        nome: unidade.nome,
        friendlyUrl: unidade.friendlyUrl,
        erro: err.message,
        cursos: [],
      });
    }
  }

  // Salvar resultado
  const outputFile = 'cursos.json';
  fs.writeFileSync(outputFile, JSON.stringify(resultadoFinal, null, 2));
  console.log(`\n\n✅ Extração concluída!`);
  console.log(`   📄 Arquivo salvo: ${outputFile}`);
  console.log(`   📊 Total de cursos: ${resultadoFinal.totalCursos}`);
})();
