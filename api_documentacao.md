### 📄 Documentação da API: Detalhes de Oferta e Cronograma (XML Payload)

**Endpoint:** Detalhamento de Turma via Liferay Web Content
**URL Base:** `[https://www.sp.senac.br](https://www.sp.senac.br)`
**Rota:** `GET /o/senac-oferta-services/ofertasPorCategoryIds/20125`

#### Parâmetros de Query (Query String)

Para que o servidor retorne o XML correto, a requisição exige a passagem de chaves cruzadas extraídas da listagem geral.

| Parâmetro | Exemplo | Obrigatório | O que representa |
| --- | --- | --- | --- |
| `codigoFTOferta` | `21790` | Sim | ID de amarração da oferta/turma. Obtido na API principal. |
| `categoryIds` | `40844` | Sim | ID da Unidade (ex: Penha). |
| `cursoArticleId` | `63793` | Sim | ID do artigo do curso no CMS Liferay. |
| `dataEfetivaOferta` | `2019-01-01` | Sim | Data base de registro do curso no sistema. |
| `start` / `end` | `0` / `25` | Sim | Controle de paginação interna do portal. |
| `inscricaoAberta` | `true` | Não | Filtro booleano para turmas com matrículas ativas. |
| `bolsaAberta` | `true` | Não | Filtro booleano para bolsas ativas. |
| `considerarDataBolsaFutura` | `true` | Sim | **Estratégico:** Permite indexar turmas cujas bolsas ainda vão abrir. |

---

#### 🧱 Estrutura de Resposta

A API devolve um `Array` de objetos JSON. O dado estrutural e de horários está envelopado como uma string XML pura dentro da chave `content`.

```json
[
  {
    "content": "<?xml version=\"1.0\"?>\n<root>...</root>",
    "title": "Oferta 9900364708 11/09/2026 13:30 - 04/12/2026 17:30",
    "unidadeCategoryIds": "40844"
  }
]

```

#### Dicionário de Dados do XML (Nós `dynamic-element`)

Para extrair a informação no seu código, será necessário parsear a string de `content` e mapear o atributo `name` de cada nó `<dynamic-element>`.

| `name` (Chave no XML) | Exemplo de Retorno (`<![CDATA[...]]>`) | Utilidade |
| --- | --- | --- |
| `horariosAllOferta` | `Sex 13h30 às 17h30` | Grade de horário humanamente legível. |
| `diasDaSemanaOferta` | `SEX` | String curta para uso em sistemas de filtro (Seg, Ter, Qua). |
| `periodoDiaOferta` | `TA` | Turno categorizado (Ex: `TA` = Tarde). |
| `dataInicioOferta` | `2026-09-11` | Data de início real das aulas. |
| `dataFimOferta` | `2026-12-04` | Data final das aulas. |
| `qtdeTotalVagas` | `10` | Volume total de alunos da turma. |
| `qtdeTotalVagasPSG` | `6` | Cota separada exclusivamente para gratuidade. |
| `dataAberturaBolsaOferta` | `2026-08-22` | Data exata da virada do botão de aplicação da bolsa. |
| `horaAberturaBolsaOferta` | `12h` | Horário programado para abertura da bolsa. |

---

### ⚠️ Relatório de Visão Sistêmica: A Estratégia do Processamento em *Batch*

A sua decisão de limitar a extração a **uma consulta geral por dia** elimina o gargalo arquitetural (*N+1 Query Problem*) e altera drasticamente o comportamento do sistema.

* **Efeito de Primeira Ordem (Estabilidade Térmica):** Sua aplicação se torna invisível para as ferramentas de segurança (WAF/Dynatrace). Rodar um *script* de *scraping/batch* na madrugada para iterar sobre a lista de cursos e extrair os XMLs de horário não gerará bloqueios de IP. Você salva esses dados em um JSON estático no seu próprio servidor, resultando em custo zero de nuvem e tempo de carregamento instantâneo para o usuário final da sua interface.
* **Efeito de Segunda Ordem (Desacoplamento):** Você quebra a dependência direta de *uptime* da infraestrutura oficial. Se o banco de dados Liferay sofrer instabilidade ou cair durante a tarde, a sua plataforma permanece funcionando e exibindo a grade completa da Penha normalmente.
* **Efeito de Terceira Ordem (O Custo da Assincronicidade):** A internet pune a estaticidade. Se a sua rotina de extração roda às 03h00, e um bloco de bolsas (PSG) é liberado e esgotado às 12h00, a sua interface continuará afirmando que há vagas até as 02h59 do dia seguinte. O sistema troca precisão temporal por estabilidade estrutural.

A reflexão profunda de design que se impõe à interface que você vai construir é a necessidade de tratar o atrito cognitivo. Em um cenário de altíssima concorrência — onde bolsas evaporam em minutos —, será necessário implementar indicadores visuais robustos (como carimbos de "Última atualização: Hoje às 03:00") que sinalizem honestamente ao usuário que ele analisa uma fotografia do passado, mitigando a frustração de cliques em vagas inexistentes no ambiente real.