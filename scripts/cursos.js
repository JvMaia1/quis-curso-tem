'use strict'

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------
// Config
// ---------------------------------------------------------------

const CONFIG = JSON.parse(fs.readFileSync(path.join(__dirname, '../config.json'), 'utf-8'));
const DRY_RUN = process.argv.includes('--dry-run');

// IDs fixos da plataforma Liferay do Senac SP
const ID_GRUPO_SENAC_SP = CONFIG.api.groupId;       // site/grupo do Senac SP
const ID_EMPRESA_SENAC = CONFIG.api.companyId;      // instância/empresa Senac
const ID_VOCABULARIO_AREA_TEMA = CONFIG.api.vocabularyId; // vocabulário "Área / Tema Mercadológico"

// ---------------------------------------------------------------
// HTTP client
// ---------------------------------------------------------------

const api = axios.create({
  baseURL: CONFIG.api.baseUrl,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json',
  },
  timeout: CONFIG.api.timeoutMs,
});


// ---------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Executa operacao() até `tentativas` vezes com backoff exponencial.
 * Começa em 1s e dobra a cada tentativa (1s, 2s, 4s).
 * Se todas falharem, retorna null e registra o erro em `falhas[]`.
 */
async function executarComRetentativa(operacao, tentativas, descricao, falhas) {
  for (let i = 0; i < tentativas; i++) {
    try {
      return await operacao();
    } catch (err) {
      // Erros 4xx não são transientes — não adianta retentar
      const status = err.response && err.response.status;
      if (status && status >= 400 && status < 500) {
        console.error(`  ❌ [${descricao}] erro ${status}: ${err.message}`);
        falhas.push({ descricao, erro: err.message });
        return null;
      }

      if (i < tentativas - 1) {
        const espera = 1000 * Math.pow(2, i);
        console.error(`  ⚠️  [${descricao}] tentativa ${i + 1}/${tentativas} falhou, retry em ${espera / 1000}s: ${err.message}`);
        await sleep(espera);
      } else {
        console.error(`  ❌ [${descricao}] esgotadas ${tentativas} tentativas: ${err.message}`);
        falhas.push({ descricao, erro: err.message });
        return null;
      }
    }
  }
}

// ---------------------------------------------------------------
// Funções da API do Senac
// ---------------------------------------------------------------

/** Obtém o categoryId da unidade a partir da friendly URL */
async function obterIdUnidade(friendlyUrl) {
  const { data } = await api.get(`/o/senac-unidade-services/categoriaPorFriendlyURL/${friendlyUrl}/0`);
  if (!data || data.length === 0) {
    throw new Error(`Unidade não encontrada: ${friendlyUrl}`);
  }
  return data[0].categoryId;
}

/** Obtém o categoryId do tipo de curso (ex: "Livre", "Técnico") */
async function obterIdTipoCurso(nome) {
  const { data } = await api.get(
    `/o/senac-content-services/idTipoCursoPorNome/${ID_GRUPO_SENAC_SP}/${encodeURIComponent(nome)}`
  );
  return data;
}

/** Lista todas as áreas/temas mercadológicos */
async function listarTemas() {
  const { data } = await api.get('/o/senac-category-services/categories', {
    params: {
      companyId: ID_EMPRESA_SENAC,
      groupIds: ID_GRUPO_SENAC_SP,
      parentCategoryIds: 0,
      vocabularyIds: ID_VOCABULARIO_AREA_TEMA,
    },
  });
  return data;
}

/** Busca cursos de uma área/tema específica, paginando até esgotar */
async function buscarCursosPorCategoria(idAreaTema, idTipoCurso, idUnidade) {
  const temInscricao = CONFIG.filtros.temInscricoesAbertas ? 1 : 0;
  const temBolsa = CONFIG.filtros.temBolsaEstudo ? 1 : 0;

  let todosCursos = [];
  let start = 0;
  const limit = 100;

  while (true) {
    let data;
    try {
      const response = await api.get(
        `/o/senac-content-services/cursosPorCategoriasComFiltrosBolsaECompra/${ID_GRUPO_SENAC_SP}/${temInscricao}/${temBolsa}/1/${start}/${start + limit}`,
        {
          params: { categoryIds: [idAreaTema, idTipoCurso, idUnidade] },
          paramsSerializer: { indexes: null },
        }
      );
      data = response.data;
    } catch (err) {
      // API retorna 500 quando start ultrapassa o total de cursos da categoria.
      // Tratar como fim da paginação, não como erro.
      if (err.response && err.response.status === 500) break;
      throw err;
    }

    const resultado = typeof data === 'string' ? JSON.parse(data) : data;
    if (!resultado || !resultado.cursos || resultado.cursos.length === 0) break;

    todosCursos = todosCursos.concat(resultado.cursos);
    start += limit;
  }

  return todosCursos;
}

// ---------------------------------------------------------------
// Orquestração
// ---------------------------------------------------------------

async function processarUnidade(unidade, falhas) {
  console.log(`\n🏫 ${unidade.nome} (${unidade.friendlyUrl})`);

  // 1. Obter ID da unidade
  const idUnidade = await executarComRetentativa(
    () => obterIdUnidade(unidade.friendlyUrl),
    3, `ID unidade ${unidade.nome}`, falhas
  );
  if (idUnidade === null) return [];

  // 2. Obter ID do tipo de curso
  const idTipoCurso = await executarComRetentativa(
    () => obterIdTipoCurso(CONFIG.tipoCurso),
    3, `ID tipo curso "${CONFIG.tipoCurso}"`, falhas
  );
  if (idTipoCurso === null) return [];

  // 3. Listar áreas/temas
  const temas = await executarComRetentativa(
    () => listarTemas(), 3, 'listar áreas/temas', falhas
  );
  if (temas === null) return [];

  console.log(`  ${temas.length} áreas/temas encontradas`);

  const cursosDaUnidade = [];

  for (const tema of temas) {
    console.log(`  📂 ${tema.name}`);

    const cursos = await executarComRetentativa(
      () => buscarCursosPorCategoria(tema.categoryId, idTipoCurso, idUnidade),
      3, `cursos da área "${tema.name}"`, falhas
    );

    if (cursos === null || cursos.length === 0) {
      console.log('     → nenhum curso');
      continue;
    }

    console.log(`     → ${cursos.length} cursos`);

    for (const curso of cursos) {
      cursosDaUnidade.push({
        unidade: unidade.nome,
        tema: tema.name,
        curso: curso.title,
        codigoFT: curso.codigoFT,
        url: curso.url ? `${CONFIG.api.baseUrl}${curso.url}` : null,
        descricao: curso.descricao || '',
        modalidade: curso.modalidade || [],
      });
    }

    await sleep(CONFIG.api.delayEntreTemasMs);
  }

  return cursosDaUnidade;
}

// ---------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------

(async () => {
  console.log('quis-curso-tem — Estágio 1: lista de cursos');
  console.log(`Unidades: ${CONFIG.unidades.map(u => u.nome).join(', ')}`);
  console.log(`Tipo: ${CONFIG.tipoCurso}`);
  if (DRY_RUN) console.log('[dry-run] Nenhum arquivo será escrito.\n');

  const falhas = [];
  const todosCursos = [];

  for (const unidade of CONFIG.unidades) {
    const cursos = await processarUnidade(unidade, falhas);
    todosCursos.push(...cursos);
    console.log(`  Total: ${cursos.length} cursos em ${unidade.nome}`);
  }

  // Sumário final
  console.log(`\n${'='.repeat(50)}`);
  console.log(`📊 Total: ${todosCursos.length} cursos em ${CONFIG.unidades.length} unidade(s)`);

  if (falhas.length > 0) {
    console.log(`\n⚠️  ${falhas.length} falha(s):`);
    falhas.forEach(f => console.log(`  - ${f.descricao}: ${f.erro}`));
  }

  if (!DRY_RUN) {
    const outputPath = path.join(__dirname, '../cursos.json');
    fs.writeFileSync(outputPath, JSON.stringify(todosCursos, null, 2));
    console.log(`📄 ${outputPath} salvo`);
  }

  process.exit(falhas.length > 0 ? 1 : 0);
})();
