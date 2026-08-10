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
} = require('./api-senac');

// Config ---------------------------------------------------------------
const CONFIG = JSON.parse(
	fs.readFileSync(path.join(__dirname, '../config.json'), 'utf-8'),
); //Pegando configuraçoes do json de configs
const DRY_RUN = process.argv.includes('--dry-run'); //Guardando escolha do usuario se dry run ou nao

// Helpers---------------------------------------------------------------
function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

//Função para poder realizar qoperações de requisição com retry estruturado.
/**
 * 
 * @param {function(): Promise<*>} operacao - função assíncrona a ser executada.
 * @param {number} tentativas - numero de tentativas a serem feitas.
 * @param {string} descricao - Texto que descreve a operação.
 * @param {Array<{descricao: string, erro: string}>} falhas - Lista de falhas armazenadas no processo 
 * @returns {Promise<*|null>} O resultado da operação com sucesso ou null se falhar após os retries.
 */
async function executarComRetentativa(operacao, tentativas, descricao, falhas) {
	for (let i = 0; i < tentativas; i++) {
		try {
			return await operacao();
		} catch (err) {
			// Erros 4xx não adianta retentar, para e avisa o usuário
			const status = err.response && err.response.status;
			if (status && status >= 400 && status < 500) {
				console.error(`  ❌ [${descricao}] erro ${status}: ${err.message}`);
				falhas.push({ descricao, erro: err.message });
				return null;
			}

			if (i < tentativas - 1) {
				// mostrando retentativas ao usuário
				const espera = 1000 * Math.pow(2, i);
				console.log('');
				console.error(
					`  ⚠️  [${descricao}] tentativa ${i + 1}/${tentativas} falhou, retry em ${espera / 1000}s: ${err.message}`,
				);
				await sleep(espera);
			} else {
				console.log('');
				console.error(
					`  ❌ [${descricao}] esgotadas ${tentativas} tentativas: ${err.message}`,
				);
				falhas.push({ descricao, erro: err.message });
				return null;
			}
		}
	}
}

async function extrairCurso(cursos, tema, idUnidade, falhas, unidade) {
	let cursosProcessados = [];

	for (const curso of cursos) {
		const ofertas = await executarComRetentativa(
			() =>
				buscarOfertasCurso(
					curso.codigoFT,
					idUnidade,
					curso.articleId,
					curso.dataEfetivaFT,
				),
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
			imagemURL: curso.imagemURL
				? `${CONFIG.api.baseUrl}${curso.imagemURL}`
				: null,
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

async function buscarCursosPorCategoria(idTema, idTipoCurso, idUnidade) {
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

async function processarCursosDaUnidade(
	temas,
	idUnidade,
	idTipoCurso,
	unidade,
	falhas,
) {
	console.log(`\n🏫 ${unidade.nome} (${unidade.friendlyUrl})`);

	console.log(`  ${temas.length} áreas/temas encontradas`);

	const cursosDaUnidade = [];
	const agrupados = await agruparCursosPorTema(
		temas,
		idUnidade,
		idTipoCurso,
		falhas,
	);

	for (const { tema, cursos } of agrupados) {
		cursosDaUnidade.push(
			...(await extrairCurso(cursos, tema, idUnidade, falhas, unidade)),
		);
	}

	return cursosDaUnidade;
}

async function extrairTodosOsCursos(falhas) {
	const todosOsCursos = [];

	const idTipoCurso = await executarComRetentativa(
		() => obterIdTipoCurso(CONFIG.tipoCurso),
		3,
		`ID tipo curso "${CONFIG.tipoCurso}"`,
		falhas,
	);

	const temas = await executarComRetentativa(
		() => listarTemas(),
		3,
		'listar áreas/temas',
		falhas,
	);

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

		const cursos = await processarCursosDaUnidade(
			temas,
			idUnidade,
			idTipoCurso,
			unidade,
			falhas,
		);

		todosOsCursos.push(...cursos);
		console.log(`  Total: ${cursos.length} cursos em ${unidade.nome}`);
	}

	return todosOsCursos;
}

function logInicial() {
	console.log('quis-curso-tem — Estágio 1: lista de cursos');
	console.log(`Unidades: ${CONFIG.unidades.map((u) => u.nome).join(', ')}`);
	console.log(`Tipo: ${CONFIG.tipoCurso}`);
	if (DRY_RUN) console.log('[dry-run] Nenhum arquivo será escrito.\n');
}

function logFinal(falhas, todosCursos) {
	// Sumário final
	console.log(`\n${'='.repeat(50)}`);
	console.log(
		`📊 Total: ${todosCursos.length} cursos em ${CONFIG.unidades.length} unidade(s)`,
	);

	if (falhas.length > 0) {
		console.log(`\n⚠️  ${falhas.length} falha(s):`);
		falhas.forEach((f) => console.log(`  - ${f.descricao}: ${f.erro}`));
	}

	if (!DRY_RUN) {
		const outputPath = path.join(__dirname, '../cursos.json');
		fs.writeFileSync(outputPath, JSON.stringify(todosCursos, null, 2));
		console.log(`📄 ${outputPath} salvo`);
	}
}

// Entry point---------------------------------------------------------------------------------------------------------------
(async () => {
	logInicial();

	const falhas = [];

	let todosCursos = await extrairTodosOsCursos(falhas);

	logFinal(falhas, todosCursos);

	process.exit(falhas.length > 0 ? 1 : 0);
})();
