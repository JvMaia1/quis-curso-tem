# Quis Curso Tem

Busca bolsas de estudo e cursos livres do Senac SP, agora via **bot do Telegram** como interface primária.

Consome a API REST interna do portal Senac (Liferay) — sem navegador, sem scraping.

## Kanban do projeto
- https://trello.com/invite/b/6a6e18b6b11207994c4f4173/ATTI43496975d463750c318d9a724eab32108805D1E5/quis-curso-tem

## Como o programa funciona (3 processos)

| Processo | Comando | Papel |
|----------|---------|-------|
| Extração | `npm run dados` | Consulta a API do Senac e grava `cursos.json` |
| API Express | `npm run api` | Serve `cursos.json` por HTTP (porta 3000) + agendador diário de extração |
| Bot Telegram | `npm run bot` | Escuta comandos no Telegram e consulta a API |

O bot **nunca lê `cursos.json` diretamente** — ele conversa com a API por HTTP
(axios). O frontend web antigo foi **arquivado** em `legacy/web/` (referência
não mantida).

- **Guia do código**: [`CODIGO.md`](CODIGO.md) — explica cada arquivo em linguagem simples
- **Fluxograma**: [`docs/fluxo-bot.drawio`](docs/fluxo-bot.drawio) e [`poc-arquitetura.drawio`](poc-arquitetura.drawio)

## Stack

- **Extração:** Node.js + Axios (API REST + parse XML)
- **API:** Express 5 (`scripts/api.js`)
- **Bot:** `node-telegram-bot-api` (polling) + formatação HTML (`bot/`)
- **Dados:** `cursos.json` (JSON estático pré-gerado, gitignored)

## Estrutura

```
.
├── bot/
│   ├── bot.js           # Bot Telegram — polling + handlers de comando
│   └── mensagens.js     # Formatação HTML, preços, datas, botão de inscrição
├── scripts/
│   ├── api-senac.js     # Cliente HTTP da API Liferay do Senac
│   ├── ofertas.js       # Parse XML + mapeamento de ofertas (15 campos)
│   ├── cursos.js        # Orquestrador da extração (gerarCursos, escrita atômica)
│   ├── dados-cursos.js  # Consultas sobre cursos.json (busca, detalhe, disponíveis)
│   ├── api.js           # API Express (endpoints + agendador diário)
│   └── todo.js          # Contratos das funções pendentes (gitignored)
├── legacy/
│   ├── web/             # Frontend web arquivado (index.html, css, script.js)
│   └── senac-api.js     # Extrator monolítico (referência)
├── docs/                # Decisões, memórias, diagramas, sessões
├── config.json          # Unidades, filtros, API, servidor, bot, agendador
├── .env.example         # Template do token do bot (copiar para .env)
└── cursos.json          # Dado extraído (gerado, NUNCA commitado)
```

## Setup

```sh
# 1. Instalar dependências
npm install

# 2. Token do bot (um com o @BotFather)
cp .env.example .env        # editar .env e preencher TELEGRAM_TOKEN

# 3. Extrair os dados (cursos + ofertas → cursos.json)
npm run dados

# 4. Subir a API (deixe rodando)
npm run api

# 5. Em outro terminal, subir o bot (deixe rodando)
npm run bot
```

> O agendador da API roda a extração automaticamente todos os dias às 03:00
> (hora local, configurável em `config.json` → `agendador.hora`) — mas **só
> enquanto o processo da API estiver aberto**. Para extrair manualmente a
> qualquer momento: `npm run dados`. `npm run dados:dev` roda em modo
> `--dry-run` (não grava arquivo).

## Comandos do bot

| Comando | O que faz |
|---------|-----------|
| `/start` | Boas-vindas + lista de comandos |
| `/help` | Lista de comandos |
| `/unidades` | Unidades atendidas |
| `/buscar <termo>` | Busca cursos por termo (top 5, com link) |
| `/disponiveis` | Cursos com inscrições abertas agora |
| `/curso <codigoFT>` | Detalhes do curso: datas, horários, vagas, preços + botão "Inscrever-se" |

As respostas usam texto HTML (`<b>`, `<a href>`) que o Telegram renderiza no
app. O botão "Inscrever-se" aparece quando a oferta tem
`dataAberturaBolsa <= hoje` e leva direto ao portal do Senac.

## Configuração

`config.json`:

```json
{
  "unidades": [
    { "friendlyUrl": "senac-penha", "nome": "Senac Penha" },
    { "friendlyUrl": "senac-sao-miguel-paulista", "nome": "Senac São Miguel Paulista" }
  ],
  "tipoCurso": "Livre",
  "filtros": { "temInscricoesAbertas": true, "temBolsaEstudo": true },
  "servidor": { "porta": 3000 },
  "bot": { "maxResultados": 5 },
  "agendador": { "hora": "03:00" }
}
```

## API local (Express)

- `GET /` — lista de endpoints
- `GET /cursos` — wrapper completo de `cursos.json`
- `GET /cursos?q=<termo>&limite=<n>` — busca textual (top N)
- `GET /cursos?disponiveis=1` — cursos com inscrição aberta
- `GET /cursos/:codigoFT` — detalhe do curso (ofertas mescladas entre unidades)
- `GET /unidades` — unidades

Erros em JSON `{ "erro": "..." }` com status 400/404/503/500.

## API do Senac SP

O portal usa Liferay com endpoints REST não documentados publicamente. O
extrator realiza 5 chamadas por curso:

1. `categoriaPorFriendlyURL/{slug}` — ID da unidade
2. `idTipoCursoPorNome/{groupId}/{nome}` — ID do tipo de curso
3. `categories?vocabularyIds=...` — lista de áreas/temas
4. `cursosPorCategoriasComFiltrosBolsaECompra/...` — cursos por categoria
5. `ofertasPorCategoryIds/{groupId}` — ofertas/turmas (XML; exige `paramsSerializer: { indexes: null }`)

Detalhes completos em [`docs/api_documentacao.md`](docs/api_documentacao.md).

## Schema de saída (`cursos.json`)

```json
{
  "dataExtracao": "2026-08-10T12:40:31.831Z",
  "totalCursos": 170,
  "totalOfertas": 224,
  "unidades": [{
    "nome": "Senac Penha",
    "friendlyUrl": "senac-penha",
    "totalCursos": 76,
    "totalOfertas": 104,
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

Escrita atômica (`.tmp` + `rename`): o arquivo nunca fica pela metade; se uma
extração falhar por completo, o arquivo anterior é mantido.

## Arquitetura da busca

Busca server-side: a API consulta `cursos.json` em memória (cache invalidado
por mtime). Para escala (50+ unidades), migração para banco de dados
permanece registrada em [TECH-01](https://trello.com/b/vNCkaTsu/quis-curso-tem).

## Documentação adicional

- [`CODIGO.md`](CODIGO.md) — guia do código, arquivo por arquivo
- [`docs/user-decisions.md`](docs/user-decisions.md) — decisões do grill (Q1–Q19)
- [`docs/MEMORY.md`](docs/MEMORY.md) — memória do projeto
- [`docs/api_documentacao.md`](docs/api_documentacao.md) — endpoints do Senac
