# Quis Curso Tem

Busca bolsas de estudo e cursos livres do Senac SP filtrando por unidade.

Consome a API REST interna do portal Senac (Liferay) — sem navegador, sem scraping.

## Kanban do projeto
- https://trello.com/invite/b/6a6e18b6b11207994c4f4173/ATTI43496975d463750c318d9a724eab32108805D1E5/quis-curso-tem
## Diagrama de arquitetura

[![Abrir no draw.io](https://img.shields.io/badge/draw.io-Abrir%20diagrama-blue)](https://app.diagrams.net/?grid=0&pv=0&border=10&edit=_blank#create=%7B%22type%22%3A%22xml%22%2C%22compressed%22%3Atrue%2C%22data%22%3A%227Vxdc%2BMoFv01VGUe7EIgOfajv7ST3aQ7O0lmp%2BYNS9imGws3Qmlnf%2F0W6COWwIm9nVhOOamutAQIFJ1zr7iHiwAerzZzxilAcClSBfAEIETW627MyEKSVdpNqAIIAQRXImZzRuO8DYKo14H9DvTvIQR4WPzqQgj%2FztuTBU2KDsecZDHNix%2BpTJlIil78LuxCXYGnAA4BgvofHhejAwQTsqJ526H8kTFFVSYJQPDfGUsBguNMpgIgeE9XefesuD8if3R%2BRKrZdTnAavMPSdbLGxFTDhCMN%2FlVHoIw7yd%2Bykv6ZcFCll17zwV37L%2FF3Xlls4zFNK01VEJwxdb1wkgkCY1UrYxIKX7Wm80Fr4%2B6JgtqFdxFhNul%2F2GxWpZ3V%2F4ZuuJ3yhbLYuheUFSsSNm4KEiXJBY%2Ft4rs51g%2BTSmE2ln9%2FMjHlPMtiPJxwsMvrP5GWTGs3tdh3SmmeElOwrPiQboIBsEUgT4EAx8gWOOjeWDqqURB0Y0CeLRUKw7wxAN4lCopvtOx4EICPElEQgEezRnnjSLC2UIbR0QTRSXAo0cqFYsIHxYVKxbH3FwsElXwT4OTnxe34BXnZecAYQgxuYQAjyozVHSz83l6LwFumRIVK6rkE0Cw6BH1CxIVVuQF%2BenPZ0risslyi41%2BUUYKK1hUPe%2FFFIDCAt3%2Fhwczselo3JpMsNCVIkti4wj1c%2F65ZIrerUmka39Ksq4Dv40xQHiKQxROLEIAhL2gF4xhVVNar4Y2JumyGu8Y%2BOE6fJfQgg8FDvgwfFv8DgCPk5kTvOlGSRIRbcIXX0RMu99S08lIW%2FCGifS3to3Xw68bb8WNY4DvN8Dv2eBjB%2FilobRiu2TNPAt7rwsQfEhYTPTko%2Ba8I6LoQkhGboUMJaNJzJ8e%2FrjWN3o5Snm2AJeTN7X70Py8aPdbnBhskYnTuaZjuiYRSxbX5mzSPxYXgrofh32bDMjlCd6WDIcxAVlMQJoJ92yt3YDhQvla3%2BYEi3ULU3Mr5Bexop8MsBngfwQGYIsBuJtP4ki6wxPoSXv4KCIyyziRT1exvm8f4gH%2BZIHNgv5HYIFvscDvlrZv0cAU3go5Lt8M6VisQsaV1G0%2FGdBgAEIfgQGBxYBAM%2BDrnEpleQKRlz5zwDgBBC%2F%2Burm2Z4mfFEC9dihwGAsikczZwuJBXtz9loqkQYMsnzCmAI2NyiOy9VWcn8zfxx30p3aQYWr6IWxwwYOuMKMZPbRABux9BDIQKZ%2BjxC0AaRIPtfgG8GTGRfT9fskSVwhYBuX4RbxoEoeM8xoYNLZ0u1%2BHQlJOFHusd%2Bx6sPv0%2FTzCrWCJ2i3mYOzXR0pFJiNaXLUHiq%2BMh%2F1XxlNELqg6dLyCO9Xje2cxoka1bcdjJhql47lI1lpXlJk%2BiUl8AnpE35Yf6p7oyI4G9ep0QAPb0wycYlTLWuLcFpXfVkrsh8F04PJEaHo5wehEpMSmnGRriZVseEJaogO8UIpE0STWZvsnSRjneiHqn3cAwRsxY5x2QiZT1boB7yMoVgw5CgWC1xVF12pAq4qiQatJAZbEdNPNq2qTxpRyGhHRqU8eV2RN8qNZlkbFYVSEn0eJJyqcTzGewMEe6uLlScWUUZrab3RdFhoo0645qVFjTThVxPQ3NAulOTVyjzHXHgMgiBFcbz454eBE4Fh7Oi1OfLMpkUaSrZWhhTkqVp22WDGnKloWDoFES5ofTkSUrWiiQkkW%2Bv9PRjgYMUCtMOIwUsx5thEdBzVCXQGw7ixa0uj7TGzMIUkW1SJVD%2Bi%2FEUZCew75UL1TGrWJefDyQfJmnREqiGyUkoXM1kRqgUvEbCEa1SuRKCKvWarchIZf4p0X9t3z1P5ojP2hHX68KHAcb9bSkLv8fT1Rm4EHJzPKO0vxSKVFvWmqdIRpcr1MfbEOPhdRlnYeWcpmJhPMpLookTc1v5jGQUsNjolL%2B%2BFpz%2Fy0RYv%2BnrRAbcejNI0EXxLbJb2tteNpEAYua78ceeHwVKLSekTiQxvEnucAcdBqULoTwWlVAe9plLCIvIedFtOAvWLQPTLSKj60IFf70I5BPVdKU6tWS%2B2clqskZpFx0qkiikUCoB7XqMwkQL2FPlpL2llQSWKT9JQab55S%2BchiIY%2B1jlVhu2NGWbn8NrDHDuxdEtQbZyMeArydwjL5egMQHBEVLVmysFG%2FaMYOZwm11xCLPwLWdrLKTU0caCJdaAWjc8QXXb5uy67FgBbhtbNQblVn9If2zbFYsYSJ32yMp190%2FfD2CqBQ0Wh5lsaM%2Bx%2FPmO2Mkz8nExvfuyWbq45RUs4QWH%2FwuhWf5PYAo%2Bq8c%2FwUhngKXRBOe4EHT3ODQOB9iPjJDV%2BuyCFo5ssPaUYkE22rHPvETxUfjvLiDZqI%2B%2FsFUGVeUDsq7I5NAXd6uY6JREukTdf8vIR3FMdcofhqllcLoVLg21q7c3rlt2XW8x3J%2FiO94OpA90IbslG%2BjfSpyMKRcXMOSHu916F2T67aw3pHWv%2BYSJOoG4mVDXhi9nEUcC%2BF1N79PG0bDfZA3PXSbhHxHSn8V0kaSfpIZSelDhs3KxV67SIzWXWKnKeJ%2B3gfEw9OCvAdGfu3QirCbajTdTelCYm6M3mWEAd7ePHe%2B5v0gVnY5bTsFzKw0YvYnGQGtiPV2WtaaG%2Bf1GpXR00eNDty5kwfMSWazO0w%2BTwxR69BtS%2Fm1vv89DC3906eJ%2BY%2BfCPMrVf66WHuf2JevIrh22BuveOPgvnh4miqSPT9fcXR6Xgahs7NcoHfm14OLSp5JyCO9hxb45ziKHpbqewA%2BAx0HeXar%2BT8aIo%2Bu9QJq7%2Ff31wHJr9gRZI8HaGoGd%2FdmY7KfRJV9nNRb%2FZNTO96ea8XW%2FmwjoXs6pqvX2qpD0W5WWIp7u9fJJkRs7XqXlLORevbMQa2cluR9ShRYIONyI4QApemh46w2GKa7fh6WOnAnr%2FTVv9GHEBh%2BZm4vKK4wHzOzpT8Dw%3D%3D%22%7D)

> Ou abra o arquivo local: `poc-arquitetura.drawio`

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
│   ├── script.js           # Frontend — fetch, cache, renderização
│   ├── cursos.js           # Orquestrador da extração (Node)
│   ├── api-senac.js        # Módulo cliente HTTP + endpoints Liferay
│   └── todo.js             # Contratos das funções pendentes (gitignored)
├── legacy/
│   ├── senac-api.js        # Extrator monolítico (referência)
│   ├── selecao.js          # UI checkboxes (substituído por script.js)
│   ├── scout-api.js        # Playwright page inspector (obsoleto)
│   └── senac.js            # Playwright scraper (obsoleto)
├── docs/
│   ├── api_documentacao.md # Documentação dos endpoints do Senac
│   ├── exemplo-output-curso.json
│   └── fluxo-script.drawio # Diagrama do fluxo de extração
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
