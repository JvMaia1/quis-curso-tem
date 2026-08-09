# MEMORY.md — Quis Curso Tem

> Fonte absoluta da verdade do projeto. Ler antes de qualquer tarefa. Atualizar após cada tarefa.

## Última atualização
2026-08-08 — Modularização do extrator, api-senac.js extraído, contratos em todo.js

## Arquitetura
- Projeto: scripts para coleta de dados de cursos do Senac-SP via APIs REST, frontend vanilla JS
- Branch atual: `api-express`
- `legacy/`: scripts antigos (`senac.js` Playwright, `senac-api.js` REST monolítico, `selecao.js` UI antiga)
- `scripts/api-senac.js`: módulo cliente HTTP (axios, endpoints, IDs Liferay)
- `scripts/cursos.js`: orquestrador — importa api-senac, coordena fluxo de extração
- `scripts/todo.js`: contratos das funções pendentes (gitignored, só existe local)

## Estado atual
- **Estágio 1 (DADOS-01)**: `cursos.js` + `api-senac.js` — fluxo de extração modularizado: `extrairTodosOsCursos` → `processarCursosDaUnidade` → `agruparCursosPorTema` + `extrairCurso`. `buscarOfertasCurso`/`mapearOfertas` pendentes (contratos em `todo.js`).
- **Frontend (BUS-03)**: `script.js` — busca por unidade, filtro "apenas disponíveis", renderização sob demanda com botão Buscar
- **Próximo**: implementar `buscarOfertasCurso` + `parseOfertaXML` + `mapearOfertas` + `mapearOferta` (DADOS-01)

## Decisões arquiteturais
Documentação completa com justificativas em [`user-decisions.md`](user-decisions.md).
Resumo: monolítico, sequencial, 2 estágios, config JSON, contrato magro, sobrescreve sempre, retry backoff, --dry-run, nomes em português

## Mudanças 2026-08-08 — Modularização DADOS-01
- ✅ `api-senac.js` extraído: `api` (axios), IDs Liferay, `obterIdUnidade`, `obterIdTipoCurso`, `listarTemas`
- ✅ `cursos.js` refatorado: `processarUnidade` monolítica → `agruparCursosPorTema` + `extrairCurso` + `processarCursosDaUnidade` + `extrairTodosOsCursos`
- ✅ `extrairCursosPorTema` retorna `[{tema, cursos}]` — tema e cursos empacotados, sem perder referência ao `tema.name`/`tema.categoryId`
- ✅ `todo.js` — centraliza contratos (Entrada/Saída/Testes mentais) das funções pendentes, gitignored
- ✅ `delayEntreTemasMs`: 300 → 100ms
- ⚠️ `buscarOfertasCurso` em `api-senac.js` com bug de template string (aspas simples, não backticks) e sem `return`
- ⚠️ `mapearOfertas` referenciada em `cursos.js:75` mas não definida/importada

## Dívida técnica
- `buscarOfertasCurso` em `api-senac.js:65` — template literal quebrado (aspas simples)
- `mapearOfertas` não existe em lugar nenhum — `cursos.js:75` chama função fantasma
- `cursos.js` não importa `buscarOfertasCurso` nem `mapearOfertas` de `api-senac.js`
- Backoff exponencial sem jitter
- `writeFileSync` não atômico

## APIs do Senac documentadas
1. `GET /o/senac-unidade-services/categoriaPorFriendlyURL/{friendlyUrl}/0` → categoryId
2. `GET /o/senac-content-services/idTipoCursoPorNome/{groupId}/{nome}` → tipoCursoId
3. `GET /o/senac-category-services/categories?...` → lista de temas/áreas
4. `GET /o/senac-content-services/cursosPorCategoriasComFiltrosBolsaECompra/...` → cursos por categoria (paginado)
5. `GET /o/senac-oferta-services/ofertasPorCategoryIds/...` → ofertas/turmas de um curso (Estágio 2)

## Constantes da plataforma
- ID_GRUPO_SENAC_SP (groupId): 20125 — site/grupo do Senac SP no Liferay
- ID_EMPRESA_SENAC (companyId): 20102 — instância/empresa Senac no Liferay
- ID_VOCABULARIO_AREA_TEMA (vocabularyId): 40393 — vocabulário "Área / Tema Mercadológico"
- BASE_URL: https://www.sp.senac.br

## Próximos passos
- [x] Estágio 1: `cursos.js` — lista de cursos
- [x] Code review + correções
- [x] Housekeeping (.gitignore, README)
- [ ] Frontend simples: HTML+CSS estático para listar cursos do `cursos.json`
  - Decisão pendente: carregar dados via `<script src>` (inline, zero HTTP, precisa wrapper) vs `fetch()` (assíncrono, precisa servidor HTTP)
  - Proposta: HTML único com busca/filtro por texto, tema e unidade, CSS vanilla sem framework
- [ ] Estágio 2: script de detalhes/ofertas (datas, preços, vagas)
