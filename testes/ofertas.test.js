'use strict';

const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

const { parseOfertaXML, mapearOfertas, mapearOferta } = require('../scripts/ofertas');

// Contrato: scripts/todo.js (TODO(MAIA): DADOS-01) + docs/user-decisions.md Q20

test('parseOfertaXML: CDATA direto vira { nomeCampo: valor }', () => {
	const xml =
		'<root><dynamic-element name="codigoOferta"><dynamic-content language-id="pt_BR"><![CDATA[9900356116]]></dynamic-content></dynamic-element></root>';
	assert.deepStrictEqual(parseOfertaXML(xml), { codigoOferta: '9900356116' });
});

test('parseOfertaXML: select com option vira valor do option', () => {
	const xml =
		'<root><dynamic-element name="diasDaSemanaOferta"><dynamic-content language-id="pt_BR"><option><![CDATA[TER]]></option></dynamic-content></dynamic-element></root>';
	assert.deepStrictEqual(parseOfertaXML(xml), { diasDaSemanaOferta: 'TER' });
});

test('parseOfertaXML: conteúdo vazio vira string vazia', () => {
	const xml =
		'<root><dynamic-element name="ruaEspacoExterno"><dynamic-content language-id="pt_BR"><![CDATA[]]></dynamic-content></dynamic-element></root>';
	assert.deepStrictEqual(parseOfertaXML(xml), { ruaEspacoExterno: '' });
});

test('parseOfertaXML: XML real da Senac (fixture) — campos-chave como string', () => {
	const xml = fs.readFileSync(
		path.join(__dirname, 'fixtures', 'oferta-content.xml'),
		'utf-8',
	);
	const detalhes = parseOfertaXML(xml);
	assert.strictEqual(detalhes.dataInicioOferta, '2026-08-13');
	assert.strictEqual(detalhes.horariosAllOferta, 'Ter 8h às 12h, Qui 8h às 12h');
	assert.strictEqual(detalhes.diasDaSemanaOferta, 'TER');
	assert.strictEqual(detalhes.precoVendaOferta, '750'); // string, não number (Q20: parseTagValue: false)
	assert.strictEqual(detalhes.qtdeTotalVagas, '27');
	assert.strictEqual(detalhes.dataAberturaBolsaOferta, '2026-07-24');
	assert.strictEqual(detalhes.permiteListaEspera, 'false');
	assert.strictEqual(detalhes.Text91718406, '690.0'); // precoDesconto — nome lixo do Liferay
});

test('mapearOferta: preenche campo mapeado e zera o resto', () => {
	const detalhes = { dataInicioOferta: '2026-08-13' };
	const oferta = mapearOferta(detalhes);
	assert.strictEqual(oferta.dataInicio, '2026-08-13');
	assert.strictEqual(oferta.dataFim, '');
	assert.strictEqual(oferta.precoVenda, '');
	assert.strictEqual(Object.keys(oferta).length, 15);
});

test('mapearOferta: detalhes vazio vira 15 campos com string vazia', () => {
	const oferta = mapearOferta({});
	assert.strictEqual(Object.keys(oferta).length, 15);
	for (const valor of Object.values(oferta)) {
		assert.strictEqual(valor, '');
	}
});

test('mapearOfertas: mapeia cada oferta para o shape de 15 campos', () => {
	const ofertasApi = [
		{ detalhes: { dataInicioOferta: '2026-08-13' } },
		{ detalhes: { precoVendaOferta: '750' } },
	];
	const ofertas = mapearOfertas(ofertasApi);
	assert.strictEqual(ofertas.length, 2);
	assert.strictEqual(ofertas[0].dataInicio, '2026-08-13');
	assert.strictEqual(ofertas[1].precoVenda, '750');
	assert.strictEqual(Object.keys(ofertas[0]).length, 15);
});
