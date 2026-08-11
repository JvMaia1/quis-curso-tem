'use strict';

/** Extrai campos nome/valor do XML de detalhes de uma oferta */
function parseOfertaXML(xmlString) {
	/* TODO(MAIA): DADOS-01 — implementar
	 * Entrada:  xmlString (string XML bruto do campo `content` da oferta)
	 * Saída:    objeto { nomeCampo: valor }
	 *
	 * Três formatos possíveis dentro de <dynamic-element name="...">:
	 * 1. CDATA direto:    <dynamic-content><![CDATA[valor]]></dynamic-content>
	 * 2. Option (select): <dynamic-content><option><![CDATA[valor]]></option></dynamic-content>
	 * 3. Texto puro:      <dynamic-content>valor</dynamic-content>
	 *
	 * Testes mentais:
	 * - bloco com CDATA direto → { nomeCampo: 'valor' }
	 * - bloco select com option CDATA → valor dentro do option
	 * - conteúdo vazio → campo com string vazia
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
