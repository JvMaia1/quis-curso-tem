'use strict';
// const fs = require('fs');

const { XMLParser } = require('fast-xml-parser');

const opcoes = {
	ignoreAttributes: false, // Do not drop XML attributes
	parseTagValue: false, // Automatically convert inner text values to primitive types

	// 4. Array Enforcement (Force specific tags to always map to an array)
	isArray: (name, jpath, isLeafNode, isAttribute) => {
		const arrayTags = ['item', 'user', 'link'];
		return arrayTags.includes(name);
	},
};

const parser = new XMLParser(opcoes);

/** Extrai campos nome/valor do XML de detalhes de uma oferta */
function parseOfertaXML(xmlString) {
	return parser.parse(xmlString);
	/* TODO(MAIA): DADOS-01 — implementar
	 * Entrada:  xmlString (string XML bruto do campo `content` da oferta)
	 * Saída:    objeto { nomeCampo: valor }
	 *
	 * Abordagem DEFINIDA (Q20): fast-xml-parser — não usar regex.
	 * Decisão: docs/user-decisions.md (Q20). Dep instalada: fast-xml-parser 5.10.1.
	 * Config descoberta (validada com XML real da Senac):
	 * - CDATA direto cai em `#text` por default; select com <option> cai em `option`
	 * - parseTagValue: false mantém valores como string (contrato exige string)
	 * - ignoreAttributes: false expõe o nome do campo em `@_name`
	 *
	 * Testes mentais:
	 * - bloco com CDATA direto → { nomeCampo: 'valor' }
	 * - bloco select com option CDATA → valor dentro do option
	 * - conteúdo vazio → campo com string vazia
	 * - valor numérico (ex: 9900356116) permanece string, não number
	 */
}

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
