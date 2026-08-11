'use strict';

const fs = require('fs');
const path = require('path');

const CAMINHO_CURSOS_JSON = path.join(__dirname, '../cursos.json');
const CAMINHO_CONFIG = path.join(__dirname, '../config.json');

let cacheCursos = null;
let cacheMtimeMs = null;

/** Carrega o wrapper completo de cursos.json, com cache invalidado por mtime.
 *
 * @returns {Object} Wrapper { dataExtracao, totalCursos, totalOfertas, unidades: [...] }
 * @throws {Error} Se cursos.json não existir (extração ainda não rodou)
 */
function carregarCursos() {
	/* TODO(MAIA): API-01 — implementar
	 * Entrada:  nenhuma (lê ../cursos.json relativo a este módulo)
	 * Saída:    objeto wrapper completo do cursos.json
	 *
	 * Cache em memória: guarda cacheCursos + cacheMtimeMs do statSync;
	 * recarrega o arquivo quando o mtime mudar (agendador reescreve o arquivo).
	 *
	 * Testes mentais:
	 * - chamada 2x sem alteração no arquivo → mesmo objeto (cache, sem reparse)
	 * - arquivo reescrito (mtime muda) → recarrega e devolve dados novos
	 * - arquivo ausente → throw com mensagem orientando rodar `npm run dados`
	 */
}

/** Lista as unidades configuradas
 *
 * @returns {Array<{friendlyUrl: string, nome: string}>} Unidades de config.json
 */
function listarUnidades() {
	/* TODO(MAIA): API-01 — implementar
	 * Entrada:  nenhuma (lê ../config.json)
	 * Saída:    array de { friendlyUrl, nome } na ordem do config.json
	 *
	 * Testes mentais:
	 * - config.json com 2 unidades → array de 2 itens com as chaves exatas
	 */
}

/** Busca cursos por termo (case-insensitive) em curso, tema, unidade e tags
 *
 * @param {string} termo Texto a buscar
 * @param {number} limite Máximo de resultados
 * @returns {Array<{curso: string, codigoFT: string, tema: string, unidade: string, url: string, tags: Array}>}
 */
function buscarCursos(termo, limite) {
	/* TODO(MAIA): API-01 — implementar
	 * Entrada:  termo (string), limite (inteiro > 0)
	 * Saída:    até `limite` cursos, ordenados alfabeticamente por `curso`,
	 *           cada item com { curso, codigoFT, tema, unidade, url, tags }
	 *
	 * Match: termo.toLowerCase() contido em curso, tema, unidade ou tags
	 * (cada tag individual), tudo em lowercase. Termo vazio ou só espaços → [].
	 * Ignora cursos de unidades que falharam (sem campo `curso`/`codigoFT` úteis).
	 *
	 * Testes mentais:
	 * - 'excel' → só cursos cujo nome/tema/unidade/tag contenha 'excel' (qualquer caixa)
	 * - limite 3 com 10 matches → 3 itens, alfabéticos
	 * - 'zzzzzz' → []
	 * - '' → []
	 */
}

/** Busca curso por codigoFT, mesclando ocorrências entre unidades
 *
 * @param {string} codigoFT Código FT do curso
 * @returns {Object|null} { curso, codigoFT, tema, unidades: [nomes], url, ofertas } ou null
 */
function cursoPorCodigoFT(codigoFT) {
	/* TODO(MAIA): API-01 — implementar
	 * Entrada:  codigoFT (string; comparar como string, ex.: String(curso.codigoFT) === String(codigoFT))
	 * Saída:    curso mesclado entre unidades (regra agruparPorCodigo do web arquivado):
	 *           - ofertas: concatenadas das unidades
	 *           - unidades: lista de nomes distintos
	 *           - url: primeira encontrada
	 *           - erroOfertas: limpo se houver ao menos 1 oferta real
	 *           null se nenhum curso com esse codigoFT
	 *
	 * Testes mentais:
	 * - curso em 1 unidade → ofertas só dela, unidades = [nome]
	 * - curso em 2 unidades → ofertas concatenadas, unidades = [nome1, nome2]
	 * - codigoFT inexistente → null
	 */
}

/** Lista cursos com inscrição aberta (dataAberturaBolsa <= hoje)
 *
 * @param {number} limite Máximo de resultados
 * @returns {Array<{curso: string, codigoFT: string, tema: string, unidade: string, url: string, tags: Array}>}
 */
function cursosDisponiveis(limite) {
	/* TODO(MAIA): API-01 — implementar
	 * Entrada:  limite (inteiro > 0)
	 * Saída:    até `limite` cursos com alguma oferta cuja dataAberturaBolsa
	 *           (ISO YYYY-MM-DD) seja <= hoje, ordenados por dataAberturaBolsa
	 *           crescente (abertura mais recente primeiro)
	 *
	 * hoje = new Date() com horas zeradas (espelha filtroDisponivel do web arquivado);
	 * comparação: new Date(oferta.dataAberturaBolsa + 'T00:00:00') <= hoje
	 *
	 * Testes mentais:
	 * - curso sem ofertas → nunca aparece
	 * - curso só com dataAberturaBolsa futura → excluído
	 * - curso com 1 oferta passada → entra; ordenação por data crescente
	 */
}

module.exports = {
	carregarCursos,
	listarUnidades,
	buscarCursos,
	cursoPorCodigoFT,
	cursosDisponiveis,
};
