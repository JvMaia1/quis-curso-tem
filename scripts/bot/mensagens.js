'use strict';

/** Escapa caracteres especiais para uso seguro em texto HTML do Telegram.
 *
 * @param {*} texto Valor a escapar
 * @returns {string} Texto escapado (& < > " ') ou '' se não for string
 */
function escaparHtml(texto) {
	/* TODO(MAIA): BOT-02/03 — implementar
	 * Entrada:  texto (qualquer valor; não-string vira '')
	 * Saída:    string com & < > " ' substituídos por &amp; &lt; &gt; &quot; &#39;
	 *
	 * Testes mentais:
	 * - 'A & B <C>' → 'A &amp; B &lt;C&gt;'
	 * - null/undefined/123 → ''
	 */
}

/** Formata data ISO (YYYY-MM-DD) como DD/MM/AAAA.
 *
 * @param {string} iso Data ISO
 * @returns {string} Data no formato DD/MM/AAAA ou '' se inválida
 */
function formatarData(iso) {
	/* TODO(MAIA): BOT-02/03 — implementar
	 * Entrada:  iso (string "YYYY-MM-DD", ex.: "2026-08-22")
	 * Saída:    "22/08/2026"; '' se não casar com o padrão
	 *
	 * Testes mentais:
	 * - '2026-08-22' → '22/08/2026'
	 * - 'invalido' → ''
	 */
}

/** Formata preço em reais (string do dado) para exibição pt-BR.
 *
 * @param {string} valor Preço (ex.: "2581" = R$ 2581, "2374.52" = R$ 2374,52)
 * @returns {string} "R$ 2.581,00" ou '' se vazio/NaN
 */
function formatarPreco(valor) {
	/* TODO(MAIA): BOT-02/03 — implementar
	 * Entrada:  valor (string com número, ponto como decimal)
	 * Saída:    Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
	 *           aplicado a Number(valor); '' se valor vazio ou NaN
	 *
	 * Testes mentais:
	 * - '2581' → 'R$ 2.581,00'
	 * - '2374.52' → 'R$ 2.374,52'
	 * - '' → ''
	 */
}

/** Formata a lista de unidades.
 *
 * @param {Array<{friendlyUrl: string, nome: string}>} unidades
 * @returns {string} Texto HTML com uma unidade por linha
 */
function formatarListaUnidades(unidades) {
	/* TODO(MAIA): BOT-02/03 — implementar
	 * Entrada:  unidades (array de { friendlyUrl, nome })
	 * Saída:    string HTML: "\n- <b>Senac Penha</b> — senac-penha" por unidade;
	 *           array vazio → 'Nenhuma unidade disponível.'
	 *
	 * Testes mentais:
	 * - 2 unidades → 2 linhas com <b>nome</b> e friendlyUrl
	 * - [] → 'Nenhuma unidade disponível.'
	 */
}

/** Formata a lista de resultados de busca (top N).
 *
 * @param {Array<{curso: string, codigoFT: string, tema: string, unidade: string, url: string}>} cursos
 * @param {number} limite Máximo de itens
 * @returns {string} Texto HTML dos cursos
 */
function formatarListaCursos(cursos, limite) {
	/* TODO(MAIA): BOT-02/03 — implementar
	 * Entrada:  cursos (array de { curso, codigoFT, tema, unidade, url }),
	 *           limite (int)
	 * Saída:    string HTML, por item (todos os dados escapados com escaparHtml;
	 *           URL apenas no href):
	 *             \n<b>Nome do curso</b>\nUnidade — Tema\n<a href="url">Ver curso</a>\nDetalhes: /curso <codigoFT>
	 *           rodapé: \n\nEnvie /curso <codigoFT> para ver ofertas e preços.
	 *           Trunca em `limite` itens; array vazio → 'Nenhum curso encontrado.'
	 *
	 * Testes mentais:
	 * - 1 curso → 1 item + rodapé
	 * - 8 cursos com limite 5 → 5 itens
	 * - [] → 'Nenhum curso encontrado.'
	 */
}

/** Formata o detalhe completo de um curso com suas ofertas.
 *
 * @param {Object} curso { curso, codigoFT, tema, unidades: [nomes], url, ofertas: [...] }
 * @returns {string} Texto HTML do detalhe
 */
function formatarDetalheCurso(curso) {
	/* TODO(MAIA): BOT-02/03 — implementar
	 * Entrada:  curso (shape da API /cursos/:codigoFT: { curso, codigoFT, tema,
	 *           unidades: [nomes], url, ofertas })
	 * Saída:    string HTML:
	 *           - <b>Nome</b> + tema + "Unidades: nome1, nome2"
	 *           - ofertas numeradas (1. 2. ...), cada uma com:
	 *             dataInicio (formatarData), horarios, diasDaSemana,
	 *             "Vagas: <totalVagas> (<vagasPSG> PSG)",
	 *             "Preço: <formatarPreco(precoVenda)>" (+ " (desconto: R$...)" se precoDesconto),
	 *             "Inscrições: <formatarData(dataAberturaBolsa)>",
	 *             maxParcelas quando presente ("até Nx de R$..." com formatarPreco(valorParcela))
	 *           - sem ofertas → 'Turmas indisponíveis no momento.'
	 *           - todos os valores escapados com escaparHtml
	 *
	 * Testes mentais:
	 * - 2 ofertas → cabeçalho + 2 blocos numerados
	 * - ofertas: [] → cabeçalho + 'Turmas indisponíveis no momento.'
	 */
}

/** Monta o botão inline "Inscrever-se" quando há inscrição aberta.
 *
 * @param {Object} curso { url, ofertas: [...] }
 * @param {Date} hoje Data atual com horas zeradas
 * @returns {Object|null} { reply_markup: { inline_keyboard: [[{ text, url }]] } } ou null
 */
function botaoInscricao(curso, hoje) {
	/* TODO(MAIA): BOT-02/03 — implementar
	 * Entrada:  curso (com .url e .ofertas[].dataAberturaBolsa ISO "YYYY-MM-DD"),
	 *           hoje (Date zerado)
	 * Saída:    { reply_markup: { inline_keyboard: [[{ text: 'Inscrever-se', url: curso.url }]] } }
	 *           se alguma oferta tem new Date(dataAberturaBolsa + 'T00:00:00') <= hoje;
	 *           null se nenhuma oferta disponível ou curso sem url
	 *
	 * Testes mentais:
	 * - oferta com dataAberturaBolsa passada + url → objeto reply_markup
	 * - oferta só com data futura → null
	 * - curso sem url → null
	 */
}

module.exports = {
	escaparHtml,
	formatarData,
	formatarPreco,
	formatarListaUnidades,
	formatarListaCursos,
	formatarDetalheCurso,
	botaoInscricao,
};
