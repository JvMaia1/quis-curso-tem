'use strict';

const fs = require('fs');
const path = require('path');
const {
	api,
	ID_GRUPO_SENAC_SP,
	ID_EMPRESA_SENAC,
	ID_VOCABULARIO_AREA_TEMA,
	obterIdUnidade,
	obterIdTipoCurso,
	listarTemas,
	buscarOfertasCurso,
} = require('./api-senac');
const { mapearOfertas } = require('./ofertas');
const { executarComRetentativa, mostrarLogInicial, mostrarLogFinal } = require('./utilitarios');

// Config ---------------------------------------------------------------------------------------------------

const CONFIG = JSON.parse(fs.readFileSync(path.join(__dirname, '../config.json'), 'utf-8')); //Pegando configuraçoes do json de configs
const DRY_RUN = process.argv.includes('--dry-run'); //Guardando escolha do usuario se dry run ou nao

// Helpers ---------------------------------------------------------------------------------------------------
function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Processa lista de cursos disponiveis para obter as demais informações das ofertas
 *
 * @param {Array<Object>} cursos Lista de cursos 'crus'(sem as ofertas) (campos: title, codigoFt, articleId ....)
 * @param {Object} tema Tema mercadológico (campos: nome, articleId)
 * @param {String} idUnidade Id da unidade do Senac
 * @param {Array<{descricao: string, erro: string}>} falhas - Acumulador de falhas
 * @param {Object} unidade Dados da unidade
 * @returns {Promise<Array<CursoProcessado>} Curso pronto para o Json final
 */
async function extrairCurso(cursos, tema, idUnidade, falhas, unidade) {
	let cursosProcessados = [];

	for (const curso of cursos) {
		const ofertas = await executarComRetentativa(
			() => buscarOfertasCurso(curso.codigoFT, idUnidade, curso.articleId, curso.dataEfetivaFT),
			3,
			`ofertas de "${curso.title}"`,
			falhas,
		);

		cursosProcessados.push({
			unidade: unidade.nome,
			idUnidade,
			tema: tema.name,
			temaId: tema.categoryId,
			curso: curso.title,
			codigoFT: curso.codigoFT,
			articleId: curso.articleId,
			url: curso.url ? `${CONFIG.api.baseUrl}${curso.url}` : null,
			imagemURL: curso.imagemURL ? `${CONFIG.api.baseUrl}${curso.imagemURL}` : null,
			modalidade: curso.modalidade || [],
			formato: curso.formatos || [],
			tags: curso.tags || [],
			ofertas: ofertas ? mapearOfertas(ofertas) : [],
			erroOfertas: ofertas === null ? 'Falha ao buscar ofertas' : undefined,
		});

		await sleep(CONFIG.api.delayEntreOfertasMs);
	}

	return cursosProcessados;
}

/**Busca lista bruta de cursos de um tema com paginação
 *
 * @param {String} idTema id da tema mercadológico
 * @param {String} idTipoCurso id do tipo de curso (livre/técnico)
 * @param {String} idUnidade id da unidade do Senac
 * @returns {Promise<Array<Object>>} Lista completa com os cursos extraidos do tipo e tema na unidade
 */
async function buscarCursosPorCategoria(idTema, idTipoCurso, idUnidade) {
	const temInscricao = CONFIG.filtros.temInscricoesAbertas ? 1 : 0;
	const temBolsa = CONFIG.filtros.temBolsaEstudo ? 1 : 0;

	let todosCursos = [];
	let start = 0;
	const limit = 100; //transformar em parametro?

	while (true) {
		let data;
		try {
			const response = await api.get(
				`/o/senac-content-services/cursosPorCategoriasComFiltrosBolsaECompra/${ID_GRUPO_SENAC_SP}/${temInscricao}/${temBolsa}/1/${start}/${start + limit}`,
				{
					params: { categoryIds: [idTema, idTipoCurso, idUnidade] },
					paramsSerializer: { indexes: null },
				},
			);
			data = response.data;
		} catch (err) {
			// API retorna 500 quando start ultrapassa o total de cursos da categoria.
			// Tratar como fim da paginação, não como erro.
			if (err.response && err.response.status === 500) break;
			throw err;
		}

		const resultado = typeof data === 'string' ? JSON.parse(data) : data; //comentar o porque disso de maneira resumida
		if (!resultado || !resultado.cursos || resultado.cursos.length === 0) break;

		todosCursos = todosCursos.concat(resultado.cursos);
		start += limit;
	}

	return todosCursos;
}

/**Extrai lista de cursos do tema
 *
 * @param {Array<Object>} temas Lista de objetos que contem os cursos
 * @param {String} idUnidade id da unidade do Senac
 * @param {String} idTipoCurso id do tipo de curso (livre/técnico)
 * @param {Array<{descricao: string, erro: string}>} falhas Lista de falhas armazenadas no processo
 * @returns {Object<Array<{tema: Object, cursos: Array}>}
 */
async function agruparCursosPorTema(temas, idUnidade, idTipoCurso, falhas) {
	const resultado = [];
	for (const tema of temas) {
		console.log(`  📂 ${tema.name}`);

		const cursos = await executarComRetentativa(
			() => buscarCursosPorCategoria(tema.categoryId, idTipoCurso, idUnidade),
			3,
			`cursos da área "${tema.name}"`,
			falhas,
		);

		if (!cursos || cursos.length === 0) {
			console.log('     → nenhum curso');
			continue;
		}

		console.log(`     → ${cursos.length} cursos`);
		resultado.push({ tema, cursos });

		await sleep(CONFIG.api.delayEntreTemasMs);
	}

	return resultado;
}

/**Processa todos os cursos de uma unidade, agrupados por tema
 *
 * @param {Array} temas Lista de temas mercadológicos
 * @param {String} idUnidade Contem o Id da unidade
 * @param {String} idTipoCurso Número do id do tipo de curso (livre/técnico)
 * @param {Object} unidade Objeto contendo dados da unidade
 * @param {Array<{descricao: string, erro: string}>} falhas Lista de falhas armazenadas no processo
 * @returns {Array} Lista de cursos processados da unidade
 */
async function extrairCursosDaUnidade(temas, idUnidade, idTipoCurso, unidade, falhas) {
	console.log(`\n🏫 ${unidade.nome} (${unidade.friendlyUrl})`);

	console.log(`  ${temas.length} áreas/temas encontradas`);

	const cursosDaUnidade = [];
	const agrupados = await agruparCursosPorTema(temas, idUnidade, idTipoCurso, falhas);

	for (const { tema, cursos } of agrupados) {
		cursosDaUnidade.push(...(await extrairCurso(cursos, tema, idUnidade, falhas, unidade)));
	}

	return cursosDaUnidade;
}

/**Executa o fluxo de funções para extração dos cursos
 *
 * @param {Array<{descricao: string, erro: string}>} falhas Lista de falhas armazenadas no processo
 * @returns {Array} Lista de cursos pronta para o Json
 */
async function extrairTodosOsCursos(falhas) {
	const todosOsCursos = [];

	const idTipoCurso = await executarComRetentativa(
		() => obterIdTipoCurso(CONFIG.tipoCurso),
		3,
		`ID tipo curso "${CONFIG.tipoCurso}"`,
		falhas,
	);

	const temas = await executarComRetentativa(() => listarTemas(), 3, 'listar áreas/temas', falhas);

	if (!idTipoCurso || !temas) return [];

	for (const unidade of CONFIG.unidades) {
		//1. Obter id da unidade
		const idUnidade = await executarComRetentativa(
			() => obterIdUnidade(unidade.friendlyUrl),
			3,
			`ID unidade ${unidade.nome}`,
			falhas,
		);

		if (idUnidade === null) continue;

		const cursos = await extrairCursosDaUnidade(temas, idUnidade, idTipoCurso, unidade, falhas);

		todosOsCursos.push(...cursos);
		console.log(`  Total: ${cursos.length} cursos em ${unidade.nome}`);
	}

	return todosOsCursos;
}

/** Executa a extração completa e grava o wrapper em cursos.json (escrita atômica).
 *
 * Formato de saída: { dataExtracao, totalCursos, totalOfertas,
 *                     unidades: [{ nome, friendlyUrl, totalCursos, totalOfertas, cursos }] }
 * Nunca sobrescreve o arquivo anterior quando nenhum curso é extraído
 * (falha total) — o JSON velho permanece como fonte dos consumidores.
 *
 * @param {Array<{descricao: string, erro: string}>} [falhas=[]] Acumulador de falhas
 * @returns {Promise<{totalCursos: number, totalOfertas: number, falhas: Array}>} Resumo da extração
 */
async function gerarJsonCursos(falhas = []) {
	const cursos = await extrairTodosOsCursos(falhas);

	const unidades = CONFIG.unidades.map((unidade) => {
		const cursosDaUnidade = cursos.filter((curso) => curso.unidade === unidade.nome);
		const totalOfertas = cursosDaUnidade.reduce(
			(soma, curso) => soma + (curso.ofertas ? curso.ofertas.length : 0),
			0,
		);
		return {
			nome: unidade.nome,
			friendlyUrl: unidade.friendlyUrl,
			totalCursos: cursosDaUnidade.length,
			totalOfertas,
			cursos: cursosDaUnidade,
		};
	});

	const totalOfertas = unidades.reduce((soma, unidade) => soma + unidade.totalOfertas, 0);

	const resultadoFinal = {
		dataExtracao: new Date().toISOString(),
		totalCursos: cursos.length,
		totalOfertas,
		unidades,
	};

	if (!DRY_RUN && cursos.length > 0) {
		const outputPath = path.join(__dirname, '../cursos.json');
		const tmpPath = `${outputPath}.tmp`;
		fs.writeFileSync(tmpPath, JSON.stringify(resultadoFinal, null, 2));
		fs.renameSync(tmpPath, outputPath);
	}

	return { totalCursos: cursos.length, totalOfertas, falhas };
}

// Entry point---------------------------------------------------------------------------------------------------------------
if (require.main === module) {
	(async () => {
		mostrarLogInicial();

		const falhas = [];

		const { totalCursos } = await gerarJsonCursos(falhas);

		mostrarLogFinal(falhas, totalCursos);

		process.exit(falhas.length > 0 ? 1 : 0);
	})();
}

module.exports = { gerarCursos: gerarJsonCursos, extrairTodosOsCursos };
