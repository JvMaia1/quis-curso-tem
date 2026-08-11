'use strict';

const axios = require('axios');
const fs = require('fs');
const path = require('path');

const CONFIG = JSON.parse(
	fs.readFileSync(path.join(__dirname, '../config.json'), 'utf-8'),
);

// IDs fixos da plataforma Liferay do Senac SP
const ID_GRUPO_SENAC_SP = CONFIG.api.groupId; // site/grupo do Senac SP
const ID_EMPRESA_SENAC = CONFIG.api.companyId; // instância/empresa Senac
const ID_VOCABULARIO_AREA_TEMA = CONFIG.api.vocabularyId; // vocabulário "Área / Tema Mercadológico"

// cliente HTTP
const api = axios.create({
	baseURL: CONFIG.api.baseUrl,
	headers: {
		'User-Agent':
			'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
		Accept: 'application/json',
	},
	timeout: CONFIG.api.timeoutMs,
});

/** Obtém o id da unidade a partir da friendly URL */
async function obterIdUnidade(friendlyUrl) {
	const { data } = await api.get(
		`/o/senac-unidade-services/categoriaPorFriendlyURL/${friendlyUrl}/0`,
	);
	if (!data || data.length === 0) {
		throw new Error(`Unidade não encontrada: ${friendlyUrl}`);
	}
	return data[0].categoryId;
}

/** Obtém o id do TIPO de curso (ex: "Livre", "Técnico") */
async function obterIdTipoCurso(nome) {
	const { data } = await api.get(
		`/o/senac-content-services/idTipoCursoPorNome/${ID_GRUPO_SENAC_SP}/${encodeURIComponent(nome)}`,
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

async function buscarOfertasCurso(codigoFTOferta, idUnidade, cursoArticleId, dataEfetivaOferta,) {
	const { data } = await api.get(
		`/o/senac-oferta-services/ofertasPorCategoryIds/${CONFIG.api.groupId}`,
		{
			params: {
				codigoFTOferta: codigoFTOferta,
				categoryIds: [idUnidade],
				cursoArticleId: cursoArticleId,
				dataEfetivaOferta: dataEfetivaOferta,
				start: 0,
				end: 100,
				considerarDataBolsaFutura: true,
			},
		},
	);
}

module.exports = {
	api,
	ID_GRUPO_SENAC_SP,
	ID_EMPRESA_SENAC,
	ID_VOCABULARIO_AREA_TEMA,
	obterIdUnidade,
	obterIdTipoCurso,
	listarTemas,
};
