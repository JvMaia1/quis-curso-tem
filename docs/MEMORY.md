# MEMORY.md — Quis Curso Tem

> Fonte absoluta da verdade do projeto. Ler antes de qualquer tarefa. Atualizar após cada tarefa.

## Última atualização
2026-08-11 — Reestruturação chatbot: API Express de consulta + bot Telegram + frontend web arquivado (grill Q13–Q19)

## Arquitetura
- Projeto: bot de busca de bolsas de estudo do Senac-SP — extração via APIs REST, dados em `cursos.json`, servidos por API Express, consumidos por bot Telegram
- Branch atual: `main`
- **3 processos**: extração (`npm run dados` → `scripts/cursos.js`), API (`npm run api` → `scripts/api.js`, porta 3000), bot (`npm run bot` → `bot/bot.js`, polling)
- `scripts/api-senac.js`: cliente HTTP (axios, endpoints, IDs Liferay) — `buscarOfertasCurso` corrigida (return/export/`indexes:null`)
- `scripts/ofertas.js` (novo): `parseOfertaXML`, `mapearOfertas`, `mapearOferta` — stubs, corpos = Maia
- `scripts/cursos.js`: orquestrador — `gerarCursos()` exportado, wrapper `{dataExtracao, totalCursos, totalOfertas, unidades}`, escrita atômica
- `scripts/dados-cursos.js` (novo): consultas sobre cursos.json (cache mtime) — stubs, corpos = Maia
- `scripts/api.js`: Express — rotas + agendador diário (03:00 configurável)
- `bot/bot.js`: wiring (handlers onText + axios) — IA; `bot/mensagens.js`: formatação — stubs, corpos = Maia
- `scripts/todo.js`: contratos das funções pendentes (gitignored, só existe local)
- `legacy/web/`: frontend web arquivado (git mv 2026-08-11); `legacy/senac-api.js`: extrator monolítico (referência)
- `CODIGO.md` (raiz): guia do código arquivo por arquivo + fluxograma

## Estado atual
- **Extração (DADOS-01)**: wiring completo (imports, return, paramsSerializer, wrapper, atômico). Corpos pendentes: `parseOfertaXML`, `mapearOfertas`, `mapearOferta` (Maia).
- **API (API-01)**: endpoints + agendador prontos. Corpos pendentes: `dados-cursos.js` (5 funções, Maia).
- **Bot (BOT-01/02/03)**: `bot.js` wiring pronto. Corpos pendentes: `mensagens.js` (7 funções, Maia).
- **Web**: arquivado em `legacy/web/` — regras (formatarData, formatarPreco, disponível = `dataAberturaBolsa <= hoje`, botão inscrição) valem como fonte das regras do bot.
- **Próximo**: Maia implementa os 12 corpos de `scripts/todo.js`; verificação final (dados reais + curl + Telegram E2E).

## Decisões arquiteturais
Documentação completa com justificativas em [`user-decisions.md`](user-decisions.md) (Q1–Q19).
Q13–Q19 (grill 2026-08-11): bot↔API por HTTP (processos separados); agendador diário na API (03:00); respostas HTML + botão inline; `/buscar` top 5; web → `legacy/web/`; deploy local; DoD = bot com dados reais.

## Bugs resolvidos 2026-08-11
- `buscarOfertasCurso` sem `return` / não exportada / vírgula órfã — corrigido
- Falta `paramsSerializer: { indexes: null }` no request de ofertas (API devolve `{}` com colchetes) — corrigido
- `cursos.js` importava funções-fantasma (`buscarOfertasCurso`, `mapearOfertas`) — corrigido
- `cursos.js` gravava array plano — agora wrapper + atômico (`.tmp` + `rename`), não sobrescreve com 0 cursos
- `npm run dados` rodava o legado — agora aponta para `scripts/cursos.js`
- Lixo removido: `legacy/teste.js`, `scripts/tsconfig.json`, dep `typescript`, artefato de sessão na raiz

## Dívida técnica
- Backoff exponencial sem jitter
- `/cursos?q=` e `disponiveis=1` mutuamente exclusivos (iteração futura: busca combinada)
- TECH-01: banco de dados para 50+ unidades (parcialmente endereçado por API-01 — busca server-side real)
- Agendador roda só com processo da API aberto (deploy local; VPS fica para depois — Q18)

## APIs do Senac documentadas
1. `GET /o/senac-unidade-services/categoriaPorFriendlyURL/{friendlyUrl}/0` → categoryId
2. `GET /o/senac-content-services/idTipoCursoPorNome/{groupId}/{nome}` → tipoCursoId
3. `GET /o/senac-category-services/categories?...` → lista de temas/áreas
4. `GET /o/senac-content-services/cursosPorCategoriasComFiltrosBolsaECompra/...` → cursos por categoria (paginado; HTTP 500 = fim)
5. `GET /o/senac-oferta-services/ofertasPorCategoryIds/...` → ofertas/turmas (XML; exige `paramsSerializer: { indexes: null }`; `dataEfetivaOferta` obrigatório vindo de `dataEfetivaFT` do curso)

## Constantes da plataforma
- ID_GRUPO_SENAC_SP (groupId): 20125
- ID_EMPRESA_SENAC (companyId): 20102
- ID_VOCABULARIO_AREA_TEMA (vocabularyId): 40393
- BASE_URL: https://www.sp.senac.br

## Próximos passos
- [x] Estágio 1: extração modular (DADOS-01) — wiring
- [x] API Express de consulta + agendador (API-01) — wiring
- [x] Bot Telegram — wiring
- [x] Housekeeping: web arquivado, .env, limpeza
- [ ] Corpos do Maia em `scripts/todo.js` (12 funções) + verificação final (dados + curl + Telegram)
- [ ] Deploy (VPS) — iteração futura
