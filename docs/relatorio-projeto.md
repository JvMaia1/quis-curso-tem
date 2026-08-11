# Relatório — Quis Curso Tem

> Gerado em 2026-08-05. Atualizado em 2026-08-08 e 2026-08-11 (reestruturação chatbot).

## Visão geral
Sistema que lista **bolsas de estudo Senac SP** de 2 unidades (Penha, São Miguel Paulista). Dados **extraídos de API Liferay** → `cursos.json` → servidos por **API Express** → consumidos por **bot do Telegram** (interface primária, decisão 2026-08-11). Frontend web arquivado em `legacy/web/`.

## Estágio 1 — Extração de dados (`scripts/cursos.js` + `scripts/api-senac.js`, `npm run dados`)

Arquitetura modularizada em 2026-08-08. Orquestra coleta da API `https://www.sp.senac.br` (Liferay). Config em `config.json`.

### Módulo API (`scripts/api-senac.js`)
- `api` — instância axios com User-Agent, Accept, timeout
- IDs Liferay: `ID_GRUPO_SENAC_SP` (20125), `ID_EMPRESA_SENAC` (20102), `ID_VOCABULARIO_AREA_TEMA` (40393)
- `obterIdUnidade(friendlyUrl)` → `categoryId`
- `obterIdTipoCurso(nome)` → id do tipo de curso
- `listarTemas()` → lista de áreas/temas mercadológicos
- `buscarOfertasCurso` — scaffold (bug: template string aspas simples, sem return)

### Orquestrador (`scripts/cursos.js`)
Fluxo em camadas:
```
extrairTodosOsCursos(falhas)
  → obterIdTipoCurso + listarTemas (com retry)
  → para cada unidade:
      processarCursosDaUnidade(temas, idUnidade, idTipoCurso, unidade, falhas)
        → agruparCursosPorTema(temas, idUnidade, idTipoCurso, falhas)
            → buscarCursosPorCategoria (paginação, retry)
            → retorna [{tema, cursos}]
        → para cada {tema, cursos}:
            extrairCurso(cursos, tema, idUnidade, falhas, unidade)
              → buscarOfertasCurso (retry) + mapearOfertas
              → retorna cursos enriquecidos
```

Funções:
- `executarComRetentativa(operacao, tentativas, descricao, falhas)` — retry backoff exponencial (1s→2s→4s). **4xx não retenta** (erro permanente).
- `buscarCursosPorCategoria` — página de 100 em 100. **HTTP 500 = fim da paginação** (tratado como `break`).
- `agruparCursosPorTema` — agrupa cursos por tema, retorna `[{tema, cursos}]` preservando referência ao tema.
- `extrairCurso` — processa cursos de um tema, enriquece com ofertas, monta objeto final com `tema.name` e `tema.categoryId`.
- `processarCursosDaUnidade` — orquestra agrupamento + extração por unidade.
- `logInicial` / `logFinal` — funções de log isoladas da lógica.
- `--dry-run` — testa sem escrever arquivo.

### Pendências (contratos em `scripts/todo.js`)
- ✅ (wiring 2026-08-11) `buscarOfertasCurso` — return + export + `paramsSerializer: { indexes: null }` (sem colchetes; API devolve `{}` senão)
- ⏳ `parseOfertaXML` — parse de XML com 3 formatos (CDATA direto, option, texto puro) — **corpo = Maia**, referência em `legacy/senac-api.js:56-98`
- ⏳ `mapearOfertas` / `mapearOferta` — shape de 15 campos — **corpos = Maia** (stubs em `scripts/ofertas.js`)

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

1. **✅ RESOLVIDO (2026-08-11)** — `cursos.js` agora gera o wrapper correto `{dataExtracao, totalCursos, totalOfertas, unidades:[{nome, friendlyUrl, totalCursos, totalOfertas, cursos}]}` com escrita atômica (`gerarCursos`). `npm run dados` passou a apontar para `scripts/cursos.js` (antes rodava o legado).

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

## Estágio 3 — API Express + Bot Telegram (2026-08-11)

### API (`scripts/api.js`, `npm run api`)
Express na porta `config.servidor.porta` (3000). Endpoints: `GET /` (auto-descrição), `GET /cursos` (wrapper completo), `GET /cursos?q=&limite=` (busca), `GET /cursos?disponiveis=1` (inscrições abertas), `GET /cursos/:codigoFT` (detalhe mesclado), `GET /unidades`. Erros JSON `{erro}` (400/404/503/500). Consultas delegadas a `scripts/dados-cursos.js` (cache de `cursos.json` invalidado por mtime).

**Agendador diário:** tick de 60 s; `HH:MM` local == `config.agendador.hora` (03:00) → `gerarCursos()` (extração completa) com guarda anti-concorrência. Só roda enquanto o processo da API estiver aberto (deploy local — decisão Q18).

### Bot (`bot/bot.js` + `bot/mensagens.js`, `npm run bot`)
`node-telegram-bot-api` com polling; token em `.env` (`TELEGRAM_TOKEN`, gitignored — template em `.env.example`). Comandos: `/start`, `/help`, `/unidades`, `/buscar <termo>` (top 5), `/disponiveis`, `/curso <codigoFT>`. Respostas em texto HTML (`parse_mode: 'HTML'`, decisão Q15) com botão inline "Inscrever-se" quando `dataAberturaBolsa <= hoje` (regra BUS-03). Formatação em `bot/mensagens.js` (escaparHtml, formatarData DD/MM/AAAA, formatarPreco pt-BR, listas, botão) — corpos pendentes do Maia.

### Dados
- `scripts/ofertas.js` (novo) — `parseOfertaXML`, `mapearOfertas`, `mapearOferta` (15 campos) — stubs com contratos, corpos do Maia.
- `scripts/dados-cursos.js` (novo) — `carregarCursos`, `listarUnidades`, `buscarCursos`, `cursoPorCodigoFT` (mescla unidades), `cursosDisponiveis` — stubs com contratos, corpos do Maia.
- `scripts/cursos.js` — `gerarCursos()` exportado, wrapper com `totalOfertas`, escrita atômica (`.tmp` + `rename`), nunca sobrescreve com 0 cursos.
- `scripts/api-senac.js` — `buscarOfertasCurso` corrigida (return, export, `paramsSerializer: { indexes: null }`).

### Limpeza
- Frontend web movido para `legacy/web/` (git mv) — arquivado, não mantido.
- Removidos: `legacy/teste.js` (quebrado), `scripts/tsconfig.json` + dep `typescript` (órfãos), artefato de sessão na raiz.
- `npm run dados` agora roda `scripts/cursos.js` (substitui `legacy/senac-api.js`, que fica como referência).

### Verificação (2026-08-11)
- `npm run dados:dev` — 146 cursos, 0 falhas, exit 0 (sem ReferenceError; ofertas vazias até os corpos do Maia).
- `node --check` em todos os módulos novos; teste puro de `chegouHoraAgendada`.
- Pendente (pós-corpos do Maia): `npm run dados` real + `jq` das ofertas, curl da API, ponta a ponta no Telegram.
