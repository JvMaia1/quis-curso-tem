# Quis Curso Tem

Busca bolsas de estudo e cursos livres do Senac SP filtrando por unidade.

Consome a API REST interna do portal Senac (Liferay) — sem navegador, sem scraping.

## Kanban do projeto
- https://trello.com/invite/b/6a6e18b6b11207994c4f4173/ATTI43496975d463750c318d9a724eab32108805D1E5/quis-curso-tem
## Stack

- **Extração:** Node.js + Axios (consumo de API REST + parse XML)
- **Frontend:** Vanilla JS (mobile-first, `DocumentFragment`, sem framework)
- **Mapa:** Leaflet (planejado — MAP-01)

## Estrutura

```
.
├── index.html              # Frontend SPA
├── css/styles.css          # Estilos mobile-first
├── scripts/
│   ├── script.js           # JS de Dados — fetch, cache, renderização
│   ├── selecao.js          # JS de UI — checkboxes de unidade
│   └── cursos.js           # Extrator (WIP — reescrita do legado)
├── legacy/
│   ├── senac-api.js        # Extrator funcional (referência)
│   ├── scout-api.js        # Playwright page inspector (obsoleto)
│   └── senac.js            # Playwright scraper (obsoleto)
├── docs/
│   ├── api_documentacao.md # Documentação dos endpoints do Senac
│   └── exemplo-output-curso.json
├── config.json             # Unidades, filtros e parâmetros da API
└── package.json
```

## Uso

```sh
# Instalar dependências
npm install

# Extrair dados das unidades configuradas → cursos.json
npm run dados

# Abrir index.html no navegador (ou servir com qualquer static server)
python3 -m http.server 8080
```

## Configuração

Editar `config.json` para alterar unidades ou filtros:

```json
{
  "unidades": [
    { "friendlyUrl": "senac-penha", "nome": "Senac Penha" },
    { "friendlyUrl": "senac-sao-miguel-paulista", "nome": "Senac São Miguel Paulista" }
  ],
  "tipoCurso": "Livre",
  "filtros": {
    "temInscricoesAbertas": true,
    "temBolsaEstudo": true
  }
}
```

## API do Senac SP

O portal usa Liferay com endpoints REST não documentados publicamente. O extrator realiza 5 chamadas por curso:

1. `categoriaPorFriendlyURL/{slug}` — ID da unidade
2. `idTipoCursoPorNome/{groupId}/{nome}` — ID do tipo de curso
3. `categories?vocabularyIds=...` — lista de áreas/temas
4. `cursosPorCategoriasComFiltrosBolsaECompra/...` — cursos por categoria
5. `ofertasPorCategoryIds/{groupId}` — ofertas/turmas (XML)

Detalhes completos em [`docs/api_documentacao.md`](docs/api_documentacao.md).

## Arquitetura da busca

Índice estático pré-gerado (`cursos.json`) carregado no browser. Busca textual com tags (BUS-02) filtra em memória.
Para escala (50+ unidades), migrar para API server-side — registrado em [TECH-01](https://trello.com/b/vNCkaTsu/quis-curso-tem).

## Schema de saída

```json
{
  "dataExtracao": "2026-07-29T21:54:55.448Z",
  "totalCursos": 170,
  "unidades": [{
    "nome": "Senac Penha",
    "friendlyUrl": "senac-penha",
    "totalCursos": 76,
    "cursos": [{
      "curso": "Excel Avançado",
      "codigoFT": 21417,
      "tema": "Tecnologia da Informação",
      "url": "https://www.sp.senac.br/...",
      "tags": ["excel", "planilhas"],
      "ofertas": [{
        "dataInicio": "2026-09-11",
        "horarios": "Sex 13h30 às 17h30",
        "totalVagas": "10",
        "vagasPSG": "6",
        "dataAberturaBolsa": "2026-08-22",
        "precoVenda": "2581",
        "maxParcelas": "12"
      }]
    }]
  }]
}
```
