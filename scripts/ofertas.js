"use strict";
// const fs = require('fs');

const { XMLParser } = require("fast-xml-parser");

const opcoes = {
  ignoreAttributes: false, // Do not drop XML attributes
  parseTagValue: false, // Automatically convert inner text values to primitive types
};

const parser = new XMLParser(opcoes);


/** Extrai campos nome/valor do XML de detalhes de uma oferta */
function parseOfertaXML(xmlString) {
	const dadosBrutos = parser.parse(xmlString);
	const dadosExtraidos = {}; // { nomeCampo: valor }
	const elementos = dadosBrutos["dynamic-element"] ?? dadosBrutos.root?.["dynamic-element"]; // funciona com ou sem wrapper <root>

  	if(!elementos) return {}; //se vier vazio já encerra a função

	const lista = Array.isArray(elementos) ?
  	elementos : [elementos]; // confirma se é array, se nao for o encapsula em um array

	lista.forEach(elemento => {  
		if(!elemento['dynamic-content']) return;
		
		const nomeCampo = elemento['@_field-reference'];
		
		const tipoDeDado = elemento['@_type'] === 'select' 
			? 'option'
			: '#text' ;
		
		const conteudo = elemento['dynamic-content'][tipoDeDado] ?? elemento['dynamic-content']['#text'];

		if (!nomeCampo || !conteudo) return; //campo ou nomes vazios não entram no resultado
		dadosExtraidos[nomeCampo] = conteudo;

		if(tipoDeDado === 'option'){
			dadosExtraidos[nomeCampo] = Array.isArray(dadosExtraidos[nomeCampo]) 
			? dadosExtraidos[nomeCampo].join(' - ') 
			: dadosExtraidos[nomeCampo];
		};
	});

	return dadosExtraidos;
};


/** Transforma a lista crua de ofertas no shape do contrato */
function mapearOfertas(ofertasApi) {
	/* TODO(MAIA): DADOS-01 — implementar
	 * Entrada:  ofertasApi (array com `detalhes` parseados por parseOfertaXML)
	 * Saída:    array de ofertas no shape do contrato (15 campos)
	 * Implementação sugerida: ofertasApi.map(mapearOferta)
	 */
}

/** Mapeia uma oferta para o shape do contrato (15 campos, todos string, `|| ''`) */
function mapearOferta(detalhes) {
	/* TODO(MAIA): DADOS-01 — implementar
	 * Entrada:  detalhes (objeto de campos parseados do XML)
	 * Saída:    objeto com 15 campos, todos string, `|| ''` quando ausente:
	 *   dataInicio (dataInicioOferta), dataFim (dataFimOferta),
	 *   horarios (horariosAllOferta), diasDaSemana (diasDaSemanaOferta),
	 *   periodoDia (periodoDiaOferta), totalVagas (qtdeTotalVagas),
	 *   vagasPSG (qtdeTotalVagasPSG), dataAberturaBolsa (dataAberturaBolsaOferta),
	 *   precoVenda (precoVendaOferta), precoDesconto (Text91718406),
	 *   maxParcelas (numeroMaxParcelasOferta), valorParcela (precoVendaMaxParcelaOferta),
	 *   permiteListaEspera (permiteListaEspera), dataLimiteMatricula (dtLimiteMatricula),
	 *   localEspacoExterno (localEspacoExterno)
	 *
	 * Testes mentais:
	 * - { dataInicioOferta: '01/08/2026' } → { dataInicio: '01/08/2026', dataFim: '', ... }
	 * - detalhes vazio → todos os 15 campos com ''
	 */
}

module.exports = {
	parseOfertaXML,
	mapearOfertas,
	mapearOferta,
};
