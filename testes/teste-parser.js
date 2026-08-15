"use strict";
// const fs = require('fs');

const { XMLParser } = require("fast-xml-parser");

const opcoes = {
  ignoreAttributes: false, // Do not drop XML attributes
  parseTagValue: false, // Automatically convert inner text values to primitive types
};

const parser = new XMLParser(opcoes);

const xmlFalso = `
<root available-locales="pt_BR" default-locale="pt_BR" version="1.0">
  <dynamic-element field-reference="codigoFTOferta" index-type="keyword" instance-id="W5T66esj" name="codigoFTOferta" type="text">
    <dynamic-content language-id="pt_BR"><![CDATA[21831]]></dynamic-content>
    </dynamic-element>
  <dynamic-element field-reference="dataEfetivaOferta" index-type="keyword" instance-id="dV4I3nOc" name="dataEfetivaOferta" type="date">
    <dynamic-content language-id="pt_BR"><![CDATA[2023-07-01]]></dynamic-content>
  </dynamic-element>
  <dynamic-element field-reference="codigoOferta" index-type="keyword" instance-id="7PgsDTeL" name="codigoOferta" type="text">
    <dynamic-content language-id="pt_BR"><![CDATA[9900356116]]></dynamic-content>
  </dynamic-element>
  <dynamic-element field-reference="dataInicioOferta" index-type="keyword" instance-id="wy52ZC0d" name="dataInicioOferta" type="date">
    <dynamic-content language-id="pt_BR"><![CDATA[2026-08-13]]></dynamic-content>
  </dynamic-element>
  <dynamic-element field-reference="dataFimOferta" index-type="keyword" instance-id="uQPChZkn" name="dataFimOferta" type="date">
    <dynamic-content language-id="pt_BR"><![CDATA[2026-09-17]]></dynamic-content>
  </dynamic-element>
  <dynamic-element field-reference="horaInicioOferta" index-type="keyword" instance-id="cyG23Wlf" name="horaInicioOferta" type="text">
    <dynamic-content language-id="pt_BR"><![CDATA[08:00]]></dynamic-content>
  </dynamic-element>
  <dynamic-element field-reference="horaFimOferta" index-type="keyword" instance-id="CoSjnCDv" name="horaFimOferta" type="text">
    <dynamic-content language-id="pt_BR"><![CDATA[12:00]]></dynamic-content>
  </dynamic-element>
  <dynamic-element field-reference="horariosAllOferta" index-type="keyword" instance-id="tB92olej" name="horariosAllOferta" type="text">
    <dynamic-content language-id="pt_BR"><![CDATA[Ter 8h às 12h, Qui 8h às 12h]]></dynamic-content>
  </dynamic-element>
  <dynamic-element field-reference="diasDaSemanaOferta" index-type="keyword" instance-id="tfksV2x2" name="diasDaSemanaOferta" type="select">
    <dynamic-content language-id="pt_BR">
      <option><![CDATA[TER]]></option>
      <option><![CDATA[QUI]]></option>
    </dynamic-content>
  </dynamic-element>
  <dynamic-element field-reference="periodoDiaOferta" index-type="keyword" instance-id="pAPfzady" name="periodoDiaOferta" type="select">
    <dynamic-content language-id="pt_BR"><![CDATA[MA]]></dynamic-content>
  </dynamic-element>
  <dynamic-element field-reference="eadDiaSemana" index-type="keyword" instance-id="coMc2l1v" name="Select27660014" type="select">
    <dynamic-content language-id="pt_BR">
      <option><![CDATA[]]></option>
    </dynamic-content>
  </dynamic-element>
  <dynamic-element field-reference="eadHoraInicial" index-type="keyword" instance-id="Hvq4pJLo" name="Text04535994" type="text">
    <dynamic-content language-id="pt_BR"><![CDATA[]]></dynamic-content>
  </dynamic-element>
  <dynamic-element field-reference="eadHoraFinal" index-type="keyword" instance-id="UyewTcmW" name="Text11578689" type="text">
    <dynamic-content language-id="pt_BR"><![CDATA[]]></dynamic-content>
  </dynamic-element>
  <dynamic-element field-reference="eadHorarios" index-type="keyword" instance-id="727jOH9A" name="Text92761819" type="text">
    <dynamic-content language-id="pt_BR"><![CDATA[]]></dynamic-content>
  </dynamic-element>
  <dynamic-element field-reference="precoCheioOferta" index-type="keyword" instance-id="F4XA9tHL" name="precoCheioOferta" type="text">
    <dynamic-content language-id="pt_BR"><![CDATA[750]]></dynamic-content>
  </dynamic-element>
  <dynamic-element field-reference="precoVendaOferta" index-type="keyword" instance-id="GMAtg0Fa" name="precoVendaOferta" type="text">
    <dynamic-content language-id="pt_BR"><![CDATA[750]]></dynamic-content>
  </dynamic-element>
  <dynamic-element field-reference="numeroMaxParcelasOferta" index-type="keyword" instance-id="ImVHWpgb" name="numeroMaxParcelasOferta" type="text">
    <dynamic-content language-id="pt_BR"><![CDATA[12]]></dynamic-content>
  </dynamic-element>
  <dynamic-element field-reference="precoVendaMaxParcelaOferta" index-type="keyword" instance-id="ueCWbJ9O" name="precoVendaMaxParcelaOferta" type="text">
    <dynamic-content language-id="pt_BR"><![CDATA[62.50]]></dynamic-content>
  </dynamic-element>
  <dynamic-element field-reference="formaDePagamentoCartaoOferta" index-type="none" instance-id="5xxoEflG" name="formaDePagamentoCartaoOferta" type="text">
    <dynamic-content language-id="pt_BR"><![CDATA[Mastercard, Visa, Elo, American Express em até 12 vezes de R$62.50]]></dynamic-content>
  </dynamic-element>
  <dynamic-element field-reference="formaDePagamentoBoletoOferta" index-type="none" instance-id="UCht22FY" name="formaDePagamentoBoletoOferta" type="text">
    <dynamic-content language-id="pt_BR"><![CDATA[Boleto bancário em até 12 vezes de R$62.50]]></dynamic-content>
  </dynamic-element>
  <dynamic-element field-reference="botaoCompraOferta" index-type="keyword" instance-id="3y3EMZ7Y" name="botaoCompraOferta" type="checkbox">
    <dynamic-content language-id="pt_BR"><![CDATA[true]]></dynamic-content>
  </dynamic-element>
  <dynamic-element field-reference="vagasParaCompraOferta" index-type="keyword" instance-id="djSrlgKv" name="vagasParaCompraOferta" type="checkbox">
    <dynamic-content language-id="pt_BR"><![CDATA[true]]></dynamic-content>
  </dynamic-element>
  <dynamic-element field-reference="qtdeTotalVagas" index-type="keyword" instance-id="ggSme7T8" name="qtdeTotalVagas" type="text">
    <dynamic-content language-id="pt_BR"><![CDATA[27]]></dynamic-content>
  </dynamic-element>
  <dynamic-element field-reference="botaoBolsaOferta" index-type="keyword" instance-id="nKx34WM0" name="botaoBolsaOferta" type="checkbox">
    <dynamic-content language-id="pt_BR"><![CDATA[true]]></dynamic-content>
  </dynamic-element>
  <dynamic-element field-reference="vagasBolsaOferta" index-type="keyword" instance-id="j1TuMqRW" name="vagasBolsaOferta" type="checkbox">
    <dynamic-content language-id="pt_BR"><![CDATA[true]]></dynamic-content>
  </dynamic-element>
  <dynamic-element field-reference="qtdeTotalVagasPSG" index-type="keyword" instance-id="eUmHqFbC" name="qtdeTotalVagasPSG" type="text">
    <dynamic-content language-id="pt_BR"><![CDATA[21]]></dynamic-content>
  </dynamic-element>
  <dynamic-element field-reference="dataAberturaBolsaOferta" index-type="keyword" instance-id="HHbJ31Ne" name="dataAberturaBolsaOferta" type="date">
    <dynamic-content language-id="pt_BR"><![CDATA[2026-07-24]]></dynamic-content>
  </dynamic-element>
  <dynamic-element field-reference="horaAberturaBolsaOferta" index-type="keyword" instance-id="es6amGZ5" name="horaAberturaBolsaOferta" type="text">
    <dynamic-content language-id="pt_BR"><![CDATA[12h]]></dynamic-content>
  </dynamic-element>
  <dynamic-element field-reference="espacoExterno" index-type="keyword" instance-id="7gkJ66tZ" name="espacoExterno" type="checkbox">
    <dynamic-content language-id="pt_BR"><![CDATA[true]]></dynamic-content>
  </dynamic-element>
  <dynamic-element field-reference="localEspacoExterno" index-type="keyword" instance-id="o5eWEKSb" name="localEspacoExterno" type="text">
    <dynamic-content language-id="pt_BR"><![CDATA[Neste curso, todos os encontros são presenciais na unidade do Senac que você escolheu.]]></dynamic-content>
  </dynamic-element>
  <dynamic-element field-reference="ruaEspacoExterno" index-type="keyword" instance-id="KHXtJpwa" name="ruaEspacoExterno" type="text">
    <dynamic-content language-id="pt_BR"><![CDATA[]]></dynamic-content>
  </dynamic-element>
  <dynamic-element field-reference="numeroEspacoExterno" index-type="keyword" instance-id="c2MPNF6m" name="numeroEspacoExterno" type="text">
    <dynamic-content language-id="pt_BR"><![CDATA[]]></dynamic-content>
  </dynamic-element>
  <dynamic-element field-reference="complementoEspacoExterno" index-type="keyword" instance-id="e0stHdZO" name="complementoEspacoExterno" type="text">
    <dynamic-content language-id="pt_BR"><![CDATA[]]></dynamic-content>
  </dynamic-element>
  <dynamic-element field-reference="bairroEspacoExterno" index-type="keyword" instance-id="6R6R9wIE" name="bairroEspacoExterno" type="text">
    <dynamic-content language-id="pt_BR"><![CDATA[]]></dynamic-content>
  </dynamic-element>
  <dynamic-element field-reference="cidadeEspacoExterno" index-type="keyword" instance-id="XPE2Ux4Q" name="cidadeEspacoExterno" type="text">
    <dynamic-content language-id="pt_BR"><![CDATA[]]></dynamic-content>
  </dynamic-element>
  <dynamic-element field-reference="ufEspacoExterno" index-type="keyword" instance-id="dbgOGl2t" name="ufEspacoExterno" type="text">
    <dynamic-content language-id="pt_BR"><![CDATA[]]></dynamic-content>
  </dynamic-element>
  <dynamic-element field-reference="cepEspacoExterno" index-type="keyword" instance-id="5YrUP4pb" name="cepEspacoExterno" type="text">
    <dynamic-content language-id="pt_BR"><![CDATA[]]></dynamic-content>
  </dynamic-element>
  <dynamic-element field-reference="dtLimiteMatricula" index-type="keyword" instance-id="T8d5u4x6" name="dtLimiteMatricula" type="date">
    <dynamic-content language-id="pt_BR"><![CDATA[2026-08-13]]></dynamic-content>
  </dynamic-element>
  <dynamic-element field-reference="dataAberturaMatricula" index-type="keyword" instance-id="l9SjB5lA" name="dataAberturaMatricula" type="date">
    <dynamic-content language-id="pt_BR"><![CDATA[]]></dynamic-content>
  </dynamic-element>
  <dynamic-element field-reference="etapa" index-type="keyword" instance-id="eK3Esk1m" name="etapa" type="text">
    <dynamic-content language-id="pt_BR"><![CDATA[0010]]></dynamic-content>
  </dynamic-element>
  <dynamic-element field-reference="permiteListaEspera" index-type="keyword" instance-id="dbzcV4Pa" name="permiteListaEspera" type="checkbox">
    <dynamic-content language-id="pt_BR"><![CDATA[false]]></dynamic-content>
  </dynamic-element>
  <dynamic-element field-reference="destinoCompra" index-type="keyword" instance-id="DGkT3efK" name="destinoCompra" type="numeric">
    <dynamic-content language-id="pt_BR"><![CDATA[2]]></dynamic-content>
  </dynamic-element>
  <dynamic-element field-reference="destinoBolsa" index-type="keyword" instance-id="G8lPjlea" name="destinoBolsa" type="numeric">
    <dynamic-content language-id="pt_BR"><![CDATA[2]]></dynamic-content>
  </dynamic-element>
  <dynamic-element field-reference="precoDescontoOferta" index-type="keyword" instance-id="SObQFYgQ" name="Text91718406" type="text">
    <dynamic-content language-id="pt_BR"><![CDATA[690.0]]></dynamic-content>
  </dynamic-element>
  <dynamic-element field-reference="percentualDescontoOferta" index-type="keyword" instance-id="5LEnkYzK" name="Text38003677" type="text">
    <dynamic-content language-id="pt_BR"><![CDATA[8]]></dynamic-content>
  </dynamic-element>
  <dynamic-element field-reference="duracaoDescricaoOferta" index-type="keyword" instance-id="OrOLTEDG" name="Text29275125" type="text">
    <dynamic-content language-id="pt_BR"><![CDATA[]]></dynamic-content>
  </dynamic-element>
</root>
`;

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
}

console.log(parseOfertaXML(xmlFalso));

