# MEMORY.md — Quis Curso Tem

> Fonte absoluta da verdade do projeto. Ler antes de qualquer tarefa. Atualizar após cada tarefa.

## Última atualização
2026-07-27 — Correções do code review aplicadas, housekeeping feito

## Arquitetura
- Projeto: scripts para coleta de dados de cursos do Senac-SP via APIs REST, futuro frontend web
- Branch atual: `usando-apis`
- Branch `legacy`: scripts antigos (`senac.js` Playwright scraping, `senac-api.js` REST)
- `scout-api.js`: ferramenta auxiliar de debug com Playwright (mantida)

## Estado atual
- **Estágio 1**: `cursos.js` + `config.json` — funcional, gera `cursos.json` (~65kb, ~2300 linhas, ~200 cursos)
- **Estágio 2**: pendente — enriquecer cursos com ofertas/turmas (datas, preços, vagas)
- **Frontend**: próximo — HTML+CSS estático para listar cursos do Estágio 1 (Opção A: HTML estático com fetch)

## Decisões arquiteturais
Documentação completa com justificativas em [`user-decisions.md`](user-decisions.md).
Resumo: monolítico, sequencial, 2 estágios, config JSON, contrato magro, sobrescreve sempre, retry backoff, --dry-run, nomes em português

## Correções aplicadas (code review 2026-07-27)
- ✅ Paginação: loop while em `buscarCursosPorCategoria` em vez de `/0/100` fixo
- ✅ Null checks: `=== null` em vez de `!` (evita confundir 0/falsy com falha real)
- ✅ `resultado` null check antes de acessar `.cursos`
- ✅ `process.exit(1)` em caso de falhas
- ✅ `path.join(__dirname, 'cursos.json')` — caminho absoluto consistente
- ✅ 4xx não retenta mais (só 5xx e erros de rede)
- ✅ `.gitignore` expandido
- ✅ `README.md` atualizado

## Dívida técnica (nits adiados)
- `delayEntreOfertasMs` no config não usado ainda (será usado no Estágio 2)
- Backoff exponencial sem jitter: múltiplas instâncias retentariam sincronizadas
- `writeFileSync` não atômico: se script for interrompido, arquivo pode truncar
- Campos `articleId`, `imagemURL`, `formatos`, `tags` omitidos do output (intencional no Estágio 1)
- Paginação em `buscarCursosPorCategoria` faz múltiplas chamadas sequenciais (podia paralelizar páginas)

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
