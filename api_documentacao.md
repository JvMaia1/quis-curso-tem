# 📡 Documentação da API — Portal Senac SP

> **Projeto:** quis-curso-tem  
> **Branch:** `usando-apis`  
> **Abordagem:** Consumo direto dos endpoints REST internos do portal Liferay  
> **Base URL:** `https://www.sp.senac.br`

---

## 🧭 Visão Geral

O portal [www.sp.senac.br](https://www.sp.senac.br) é construído sobre **Liferay**, um CMS/portal Java corporativo. O frontend consome um conjunto de serviços REST internos (padrão `/o/senac-*-services/...`) que expõem catálogo de cursos, unidades, temas mercadológicos e ofertas/turmas.

O script `senac-api.js` replica o fluxo de navegação do frontend chamando esses endpoints diretamente, sem necessidade de browser ou Playwright. O resultado é salvo em `cursos.json` para consulta offline.

### Fluxo de extração

```
Unidade (friendly URL)
  → [API 1] categoryId da unidade

Tipo de curso ("Livre")
  → [API 2] categoryId do tipo de curso

Vocabulário "Tema Mercadológico"
  → [API 3] Lista de temas (categoryId + nome)

Para cada tema:
  → [API 4] Cursos daquele tema na unidade (filtros: inscrição aberta + bolsa)
    → Para cada curso:
      → [API 5] Ofertas/turmas (XML com detalhes: horários, preços, vagas, bolsa)
```

---

## 🔧 Configuração do cliente HTTP

O script usa **axios** com a seguinte configuração base:

```js
const api = axios.create({
  baseURL: 'https://www.sp.senac.br',
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ... Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json',
  },
  timeout: 30000,
});
```

### Rate limiting

O script insere pausas entre requisições para evitar sobrecarga e bloqueios:

| Pausa | Local | Duração |
|-------|-------|---------|
| Entre ofertas (cada curso) | Loop interno | 200ms |
| Entre temas | Loop externo | 500ms |

---

## 🌐 Endpoints

### Constantes compartilhadas

| Constante | Valor | Significado |
|-----------|-------|-------------|
| `GROUP_ID` | `20125` | ID do grupo/portal principal no Liferay |
| `COMPANY_ID` | `20102` | ID da company (instância) no Liferay |
| `VOCABULARY_ID` | `40393` | ID do vocabulário "Tema Mercadológico" |

---

### API 1 — Obter ID da unidade pela friendly URL

Obtém o `categoryId` interno da unidade a partir do slug amigável usado na URL do site.

| Item | Detalhe |
|------|---------|
| **Método** | `GET` |
| **Rota** | `/o/senac-unidade-services/categoriaPorFriendlyURL/{friendlyUrl}/0` |
| **Exemplo** | `/o/senac-unidade-services/categoriaPorFriendlyURL/senac-penha/0` |

#### Parâmetros de path

| Parâmetro | Exemplo | Descrição |
|-----------|---------|-----------|
| `friendlyUrl` | `senac-penha` | Slug da unidade na URL do site |
| (fixo) | `0` | Offset de subcategoria (sempre 0 para a unidade raiz) |

#### Resposta

Array JSON. O primeiro elemento contém o `categoryId` da unidade.

```json
[
  {
    "categoryId": 40844,
    "name": "Senac Penha",
    "...": "..."
  }
]
```

#### IDs de unidade conhecidos

| Friendly URL | Nome | Category ID |
|-------------|------|-------------|
| `senac-penha` | Senac Penha | `40844` |
| `senac-sao-miguel-paulista` | Senac São Miguel Paulista | (obtido em runtime) |

---

### API 2 — Obter ID do tipo de curso

Converte o nome legível do tipo de curso ("Livre", "Técnico", "Extensão") para o `categoryId` interno.

| Item | Detalhe |
|------|---------|
| **Método** | `GET` |
| **Rota** | `/o/senac-content-services/idTipoCursoPorNome/{groupId}/{tipoCursoNome}` |
| **Exemplo** | `/o/senac-content-services/idTipoCursoPorNome/20125/Livre` |

#### Parâmetros de path

| Parâmetro | Exemplo | Descrição |
|-----------|---------|-----------|
| `groupId` | `20125` | ID do grupo no Liferay |
| `tipoCursoNome` | `Livre` | Nome interno do tipo de curso (aplicar `encodeURIComponent`) |

#### Resposta

Um número inteiro (ID do tipo de curso).

```
40882
```

---

### API 3 — Listar temas mercadológicos

Retorna todas as categorias do vocabulário "Tema Mercadológico", usado para organizar os cursos (ex: "Administração", "Tecnologia", "Saúde").

| Item | Detalhe |
|------|---------|
| **Método** | `GET` |
| **Rota** | `/o/senac-category-services/categories` |

#### Query parameters

| Parâmetro | Valor | Descrição |
|-----------|-------|-----------|
| `companyId` | `20102` | ID da company no Liferay |
| `groupIds` | `20125` | ID do grupo |
| `parentCategoryIds` | `0` | Categorias raiz (sem pai) |
| `vocabularyIds` | `40393` | ID do vocabulário "Tema Mercadológico" |

#### Resposta

Array JSON de objetos com `name` e `categoryId`.

```json
[
  { "categoryId": 40787, "name": "Administração e Negócios" },
  { "categoryId": 40788, "name": "Arquitetura e Urbanismo" },
  { "categoryId": 40789, "name": "Artes" },
  "..."
]
```

---

### API 4 — Buscar cursos por categoria (com filtros de bolsa e compra)

Endpoint central que retorna os cursos de uma combinação específica de tema + tipo de curso + unidade, aplicando filtros de inscrições abertas e bolsa de estudo.

| Item | Detalhe |
|------|---------|
| **Método** | `GET` |
| **Rota** | `/o/senac-content-services/cursosPorCategoriasComFiltrosBolsaECompra/{groupId}/{filtrarInscricoes}/{filtrarBolsa}/{considerarFuturo}/{start}/{end}` |
| **Exemplo** | `/o/senac-content-services/cursosPorCategoriasComFiltrosBolsaECompra/20125/1/1/1/0/108` |

#### Parâmetros de path

| Parâmetro | Valor típico | Descrição |
|-----------|-------------|-----------|
| `groupId` | `20125` | ID do grupo no Liferay |
| `filtrarInscricoes` | `1` | Filtrar apenas cursos com inscrições abertas (0/1) |
| `filtrarBolsa` | `1` | Filtrar apenas cursos com bolsa disponível (0/1) |
| `considerarFuturo` | `1` | Incluir turmas futuras (0/1) |
| `start` | `0` | Offset de paginação |
| `end` | `start + limit` | Limite superior da paginação (ex: `108` para `start=0` com 108 temas) |

#### Query parameters

| Parâmetro | Exemplo | Descrição |
|-----------|---------|-----------|
| `categoryIds` | `40787` | Repetido para cada categoria: tema, tipo de curso, unidade |

**Importante:** O parâmetro `categoryIds` é enviado múltiplas vezes (uma por valor). A ordem importa e deve ser: `temaId`, `tipoCursoId`, `unidadeId`.

Exemplo de query string completa:
```
?categoryIds=40787&categoryIds=40882&categoryIds=40844
```

O axios requer `paramsSerializer: { indexes: null }` para enviar arrays nesse formato.

#### Resposta

String JSON que precisa ser parseada (`JSON.parse()`). Contém um objeto com array `cursos`.

```json
{
  "cursos": [
    {
      "title": "Excel Avançado",
      "codigoFT": "21790",
      "articleId": "63793",
      "dataEfetivaFT": "2019-01-01",
      "url": "/senac-penha/cursos-livres/excel-avancado",
      "imagemURL": "/documents/20125/.../imagem.jpg",
      "modalidade": ["Presencial"],
      "formatos": ["Regular"],
      "oqueVouAprender": "<p>Conteúdo programático em HTML...</p>",
      "comoVouAprender": "<p>Metodologia em HTML...</p>",
      "possoFazerEsseCurso": "<p>Pré-requisitos em HTML...</p>",
      "objetivoComercial": "Aprimore suas habilidades em planilhas",
      "tags": ["Informática", "Office"]
    }
  ]
}
```

#### Campos utilizados como chave para a API 5

| Campo | Uso |
|-------|-----|
| `codigoFT` | Passado como `codigoFTOferta` na API 5 |
| `articleId` | Passado como `cursoArticleId` na API 5 |
| `dataEfetivaFT` | Passado como `dataEfetivaOferta` na API 5 |

---

### API 5 — Buscar ofertas/turmas de um curso

Retorna as turmas (ofertas) disponíveis para um curso específico em uma unidade. O detalhamento (horários, preços, vagas, bolsa) está envelopado em **XML** no campo `content`.

| Item | Detalhe |
|------|---------|
| **Método** | `GET` |
| **Rota** | `/o/senac-oferta-services/ofertasPorCategoryIds/{groupId}` |
| **Exemplo** | `/o/senac-oferta-services/ofertasPorCategoryIds/20125` |

#### Query parameters

| Parâmetro | Exemplo | Obrigatório | Descrição |
|-----------|---------|:---:|-----------|
| `codigoFTOferta` | `21790` | Sim | ID de amarração da oferta/turma (vem do `codigoFT` da API 4) |
| `categoryIds` | `40844` | Sim | ID da unidade |
| `cursoArticleId` | `63793` | Sim | ID do artigo do curso no CMS (vem do `articleId` da API 4) |
| `dataEfetivaOferta` | `2019-01-01` | Sim | Data base de registro do curso (vem do `dataEfetivaFT` da API 4) |
| `start` | `0` | Sim | Offset de paginação |
| `end` | `100` | Sim | Limite de registros |
| `considerarDataBolsaFutura` | `true` | Sim | **Estratégico:** Permite indexar turmas cujas bolsas ainda vão abrir |

#### Resposta

Array JSON. Cada item contém dados básicos e o XML com detalhes no campo `content`.

```json
[
  {
    "title": "Oferta 9900364708 11/09/2026 13:30 - 04/12/2026 17:30",
    "content": "<?xml version=\"1.0\"?>\n<root>...</root>",
    "unidadeCategoryIds": "40844"
  }
]
```

---

## 🧱 Parsing do XML de ofertas

O campo `content` da API 5 é uma string XML com estrutura de **Liferay Journal Article**. Os dados estão em nós `<dynamic-element name="...">` com conteúdo em `<dynamic-content>`.

A função `parseOfertaXML()` extrai esses campos usando regex. Três formatos de conteúdo são suportados:

### Formato 1 — CDATA direto
```xml
<dynamic-element name="horariosAllOferta">
  <dynamic-content><![CDATA[Sex 13h30 às 17h30]]></dynamic-content>
</dynamic-element>
```

### Formato 2 — Option (select)
```xml
<dynamic-element name="periodoDiaOferta">
  <dynamic-content><option><![CDATA[TA]]></option></dynamic-content>
</dynamic-element>
```

### Formato 3 — Texto puro (sem CDATA)
```xml
<dynamic-element name="codigoOferta">
  <dynamic-content>9900364708</dynamic-content>
</dynamic-element>
```

### Algoritmo de extração

```
Para cada <dynamic-element name="X"> no XML:
  1. Tenta extrair CDATA direto de <dynamic-content>
  2. Se não encontrou, tenta CDATA dentro de <option>
  3. Se não encontrou, pega texto puro de <dynamic-content>
```

---

## 📋 Dicionário de dados do XML de oferta

> **Legenda:** 🟢 `n` = necessário &nbsp;|&nbsp; 🟡 `q` = questionável &nbsp;|&nbsp; 🔴 `d` = dispensável

| `name` (chave no XML) | Exemplo | Class. | Descrição |
|------------------------|---------|:---:|-----------|
| `horariosAllOferta` | `Sex 13h30 às 17h30` | 🟢 | Grade de horário legível |
| `diasDaSemanaOferta` | `SEX` | 🟢 | Dias abreviados (SEG, TER, QUA, QUI, SEX, SAB, DOM) |
| `periodoDiaOferta` | `TA` | 🟢 | Turno: `MA` (Manhã), `TA` (Tarde), `NO` (Noite) |
| `dataInicioOferta` | `2026-09-11` | 🟢 | Data de início das aulas |
| `dataFimOferta` | `2026-12-04` | 🟢 | Data final das aulas |
| `qtdeTotalVagas` | `10` | 🟢 | Total de vagas da turma |
| `qtdeTotalVagasPSG` | `6` | 🟢 | Cota para bolsa de estudo (PSG — Programa Senac de Gratuidade) |
| `dataAberturaBolsaOferta` | `2026-08-22` | 🟢 | Data de abertura das inscrições para bolsa |
| `precoVendaOferta` | `R$ 960,00` | 🟢 | Preço de venda (com desconto aplicado) |
| `Text91718406` | `R$ 840,00` | 🟢 | Preço com desconto adicional (campo de ID dinâmico) |
| `numeroMaxParcelasOferta` | `12` | 🟢 | Número máximo de parcelas |
| `precoVendaMaxParcelaOferta` | `R$ 80,00` | 🟢 | Valor da parcela máxima |
| `dtLimiteMatricula` | `2026-09-04` | 🟢 | Data limite para matrícula |
| `localEspacoExterno` | `Rua Exemplo, 123` | 🟢 | Endereço do local externo (preenchido quando aplicável) |
| `codigoOferta` | `9900364708` | 🟡 | Código identificador interno da turma |
| `horaAberturaBolsaOferta` | `12h` | 🟡 | Horário de abertura da bolsa |
| `permiteListaEspera` | `true` | 🟡 | Se permite lista de espera |
| `precoCheioOferta` | `R$ 1.200,00` | 🔴 | Preço sem desconto (redundante com `precoVenda`) |
| `Text38003677` | `30%` | 🔴 | Percentual de desconto (campo de ID dinâmico) |
| `formaDePagamentoCartaoOferta` | `Visa, Mastercard` | 🔴 | Bandeiras de cartão aceitas |
| `formaDePagamentoBoletoOferta` | `true` | 🔴 | Se aceita pagamento por boleto |
| `botaoCompraOferta` | `true` | 🔴 | Flag: botão de compra ativo |
| `vagasParaCompraOferta` | `true` | 🔴 | Flag: há vagas para compra |
| `botaoBolsaOferta` | `true` | 🔴 | Flag: botão de bolsa ativo |
| `vagasBolsaOferta` | `true` | 🔴 | Flag: há vagas para bolsa |
| `etapa` | `Em andamento` | 🔴 | Etapa atual da turma |
| `espacoExterno` | `true` | 🔴 | Flag se usa espaço externo (redundante com `localEspacoExterno`) |

> **Nota sobre campos com ID numérico:** `Text91718406` e `Text38003677` são nomes de campo com ID dinâmico gerado pelo Liferay. Eles representam respectivamente o preço com desconto e o percentual de desconto. Esses IDs **não são garantidos** entre ambientes ou ao longo do tempo — foram descobertos por inspeção do payload real e podem precisar de atualização futura.

---

## 📦 Estrutura do JSON de saída (`cursos.json`)

> **Legenda:** 🟢 `n` = necessário &nbsp;|&nbsp; 🟡 `q` = questionável (mantido) &nbsp;|&nbsp; 🔴 `d` = dispensável (não incluso)

```json
{
  "dataExtracao": "2026-07-22T00:00:00.000Z",   // 🟢
  "totalCursos": 186,                            // 🟢
  "unidades": [                                  // 🟢
    {
      "nome": "Senac Penha",                     // 🟡
      "friendlyUrl": "senac-penha",              // 🟢
      "totalCursos": 80,                         // 🟢
      "cursos": [                                // 🟢
        {
          "unidade": "Senac Penha",              // 🟢
          "unidadeId": 40844,                    // 🟢
          "tema": "Informática",                 // 🟢
          "temaId": 40795,                       // 🟢
          "curso": "Excel Avançado",             // 🟢
          "codigoFT": "21790",                   // 🟢
          "articleId": "63793",                  // 🟢
          "url": "https://www.sp.senac.br/...",  // 🟢
          "imagemURL": "https://www.sp.senac.br/documents/...",  // 🟢
          "modalidade": ["Presencial"],          // 🟡
          "formato": ["Regular"],                // 🟢
          "tags": ["Informática", "Office"],     // 🟢
          "ofertas": [
            {
              "dataInicio": "2026-09-11",        // 🟢
              "dataFim": "2026-12-04",           // 🟢
              "horarios": "Sex 13h30 às 17h30",  // 🟢
              "diasDaSemana": "SEX",             // 🟢
              "periodoDia": "TA",                // 🟢
              "totalVagas": "10",                // 🟢
              "vagasPSG": "6",                   // 🟢
              "dataAberturaBolsa": "2026-08-22", // 🟢
              "precoVenda": "960",               // 🟢
              "precoDesconto": "840",            // 🟢
              "maxParcelas": "12",               // 🟢
              "valorParcela": "80",              // 🟢
              "permiteListaEspera": "false",     // 🟡
              "dataLimiteMatricula": "2026-09-04", // 🟢
              "localEspacoExterno": "Neste curso, todos os encontros..."  // 🟢
            }
          ]
        }
      ]
    }
  ]
}
```

### Campos removidos do JSON de saída

Estes campos eram extraídos mas foram considerados desnecessários para o consumidor final:

| Campo removido | Motivo |
|----------------|--------|
| `totalOfertas` (raiz e unidade) | Redundante — pode ser calculado com `ofertas.length` |
| `dataEfetivaFT` | Só serve como chave para a API 5, sem valor informativo |
| `oqueVouAprender` | Conteúdo HTML pesado, sem uso imediato |
| `comoVouAprender` | Conteúdo HTML pesado, sem uso imediato |
| `possoFazerEsseCurso` | Conteúdo HTML pesado, sem uso imediato |
| `objetivoComercial` | Texto de marketing, sem utilidade para consulta |
| `codigoOferta` | Código interno, irrelevante para o usuário |
| `title` (oferta) | String montada com dados já disponíveis separadamente |
| `horaAberturaBolsa` | Precisão de horas raramente necessária |
| `precoCheio` | Redundante com `precoVenda` |
| `percentualDesconto` | Campo com ID dinâmico, pode ser calculado |
| `pagamentoCartao` | Texto descritivo, sem utilidade para filtro |
| `pagamentoBoleto` | Texto descritivo, sem utilidade para filtro |
| `botaoCompra` / `vagasCompra` | Se o curso aparece na extração, já tem vaga para compra |
| `botaoBolsa` / `vagasBolsa` | Se o curso aparece na extração, já tem vaga para bolsa |
| `etapa` | Código interno de etapa da turma |
| `espacoExterno` | Redundante com `localEspacoExterno` |

---

## ⚠️ Análise estratégica: processamento em batch

A decisão de extrair todos os dados de uma vez e salvar em JSON estático tem implicações profundas:

### Efeito de primeira ordem — Estabilidade

O script itera sobre temas e cursos com pausas entre requisições (200ms entre cursos, 500ms entre temas). Isso torna o tráfego indistinguível de navegação humana para WAFs e sistemas de segurança. Executar o script em horários de baixo tráfego (madrugada) elimina virtualmente o risco de bloqueio.

### Efeito de segunda ordem — Desacoplamento

O JSON estático elimina a dependência de uptime da infraestrutura do Senac. Se o portal Liferay estiver instável ou fora do ar, a interface que consome `cursos.json` continua funcionando normalmente.

### Efeito de terceira ordem — Custo da assincronicidade

Dados estáticos têm uma janela de staleness. Se a extração roda às 03h e uma bolsa esgota às 12h, o JSON continuará indicando vagas até a próxima execução. A interface deve comunicar isso honestamente ao usuário com indicadores como:

> **"Última atualização: Hoje às 03:00"**

Isso mitiga a frustração de clicar em vagas que já não existem no ambiente real.

### N+1 Query Problem

O fluxo atual sofre do problema N+1: para cada curso encontrado, uma chamada adicional é feita à API de ofertas. Para 186 cursos, são ~186 chamadas extras depois das chamadas de listagem. As pausas (200ms) mantêm isso seguro, mas significa que a extração completa leva vários minutos. Uma otimização futura possível seria buscar ofertas em paralelo com um pool controlado (ex: 3-5 requisições simultâneas).

---

## 🧪 Como descobrir novos endpoints ou parâmetros

Os endpoints foram descobertos observando o tráfego de rede do portal:

1. Abrir `https://www.sp.senac.br/senac-penha/cursos-livres?inscricao=true&bolsa=true`
2. Monitorar as requisições XHR/Fetch no DevTools (aba Network)
3. Filtrar pelas URLs contendo `/o/senac-`
4. Reproduzir as chamadas com `curl` para confirmar parâmetros e respostas

O script `scout-api.js` (Playwright) salva o HTML completo da página em `debug-pagina.html` para inspeção offline — útil para debugar mudanças na estrutura do portal.

---

## 📊 Resumo dos endpoints

| # | Endpoint | Entrada chave | Saída chave |
|---|----------|---------------|-------------|
| 1 | `categoriaPorFriendlyURL/{slug}/0` | Slug da unidade | `categoryId` da unidade |
| 2 | `idTipoCursoPorNome/{groupId}/{nome}` | Nome do tipo de curso | `categoryId` do tipo |
| 3 | `categories?vocabularyIds=40393` | — | Lista de temas |
| 4 | `cursosPorCategoriasComFiltrosBolsaECompra/...` | 3 `categoryIds` (tema, tipo, unidade) | Lista de cursos |
| 5 | `ofertasPorCategoryIds/{groupId}` | `codigoFT`, `articleId`, `dataEfetiva` | Turmas (XML no `content`) |
