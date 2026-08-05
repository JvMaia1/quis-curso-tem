# Relatório — Quis Curso Tem

> Gerado em 2026-08-05.

## Visão geral
App vanilla (HTML+CSS+JS, zero framework) que lista **bolsas de estudo Senac SP** de 2 unidades (Penha, São Miguel Paulista). Dados **extraídos de API Liferay** → arquivo estático `cursos.json` → filtro por checkbox no navegador.

## Estágio 1 — Extração de dados (`scripts/cursos.js`, `npm run dados`)

Orquestra coleta da API `https://www.sp.senac.br` (Liferay). Config em `config.json`. Cadeia por unidade:

```
obterIdUnidade(friendlyUrl) → id de categoria
  → obterIdTipoCurso("Livre")
  → listarTemas() → lista de áreas/temas mercadológicos
  → buscarCursosPorCategoria(tema, tipo, unidade) → cursos com paginação
```

Funções:
- `executarComRetentativa(operacao, tentativas, descricao, falhas)` — retry backoff exponencial (1s→2s→4s). **4xx não retenta** (erro permanente). Falhas acumulam em `falhas[]`, exit code 1.
- `buscarCursosPorCategoria` — página de 100 em 100. **HTTP 500 = fim da paginação** (bug conhecido da API, tratado como `break`, não erro).
- `processarUnidade` — orquestra os 3 IDs + temas, coleta `{unidade, tema, curso, codigoFT, url, descricao, modalidade}`.
- `--dry-run` — testa sem escrever arquivo.

## Estágio 2 — Frontend (`scripts/script.js`)

Fluxo completo:

```
fetch('cursos.json') → IIFE acha dados → achata em cursosEmCache (plano)
  → change no checkbox → coletarUnidadesSelecionadas() → ids (senac-penha, ...)
  → converterUrlsEmNomes() → nomes via mapeamento_unidades
  → renderizarCursos() → filtrarCursosUnSelecionadas() (filtra por unidade)
  → agruparPorCodigo() → montarLista()
```

Funções e responsabilidade:

| Função | Papel |
|---|---|
| `coletarUnidadesSelecionadas` | Lê checkboxes `:checked`, retorna `Array.from(...).map(value)` — NodeList→Array (regra do CLAUDE.md) |
| `converterUrlsEmNomes` | Mapeia id→nome via objeto hardcoded `mapeamento_unidades` (2 unidades) |
| `filtrarCursosUnSelecionadas` | `cursos.filter(curso => unidades.includes(curso.unidade))` |
| `agruparPorCodigo` | Merge cursos mesmo `codigoFT` entre unidades: une `unidades`, concatena `ofertas`, limpa `erroOfertas` se achar oferta real, mantém 1ª URL |
| `montarLista` | Constrói cards com **DocumentFragment** (DOM batching obrigatório) |
| `preencherInfoHorarios` | Mostra horários por oferta; se `erroOfertas` → "Turmas indisponíveis no momento" |
| `formatarHorario` | 3 casos: multi-dia (vírgula) → `formatarMultiDia`; simples (dia+horário) → remove dia repetido, minúsculas; campo único |
| `formatarMultiDia` | `"SEG - seg 8h ás 12, qua 8h ás 12h"` → `"seg, qua — 8h às 12h"` (agrupa dias, horário 1º) |
| `criarBotaoInscricao` | Data `dataAberturaBolsa`: futura → `<span>` "Inscrição em DD/MM"; hoje/passado → `<a>` "Inscrever-se" (com `rel=noopener`); sem data/ofertas → null |
| `formatarData` | Date → `DD/MM` |

## Pontos de atenção (achados reais)

1. **⚠️ `cursos.js` NÃO gera o formato que o frontend lê.** `cursos.js` escreve array plano `[{unidade, tema, curso, ...}]` (`cursos.js:236-237`). `cursos.json` real tem wrapper `{dataExtracao, totalCursos, unidades:[{nome, cursos:[...]}]}`. `script.js` lê `dados.unidades[].cursos` (`script.js:29-30`). **`npm run dados` hoje geraria arquivo que quebra a página** (TypeError `dados.unidades` undefined). O `cursos.json` atual deve ter vindo de versão não-commitada do gerador — desincronizado do git.

2. **Dados extra do JSON não usados:** `unidadeId`, `temaId`, `articleId`, `imagemURL`, `formato`, `tags`, e ofertas tem `totalVagas`, `precoVenda`, `precoDesconto`, `maxParcelas`. Frontend só usa `unidade`, `codigoFT`, `curso`, `url`, `ofertas` (e `erroOfertas`). Resto = colhido mas nunca renderizado.

3. **`selecao.js` é código zumbi.** Duplica `coletarUnidadesSelecionadas` do script.js, comentado no HTML, lógica coberta pela function em script.js. Candidato a deleção.

4. **Busca e mapa são placeholders.** Input busca `disabled`, mapa mostra "em breve".

5. **Erros transientes no JSON:** 10/153 cursos com `erroOfertas` (404 persistido como string no JSON) — `preencherInfoHorarios` trata.

6. **`mapeamento_unidades` hardcoded** duplica checkboxes do HTML (`data-nome`). Duas fontes de verdade pra mesma informação.

## Arquivos
- `index.html` — markup, checkboxes, placeholders, carrega script.js
- `scripts/script.js` — lógica frontend (acima)
- `scripts/cursos.js` — gerador dados (Node, axios)
- `scripts/selecao.js` — zumbi
- `config.json` — unidades, tipo, filtros, IDs Liferay, delays
- `legacy/senac-api.js` — estágio 0 (extração + ofertas XML), superado por cursos.js
