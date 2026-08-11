---
name: agents-directives
description: Diretrizes de trabalho definidas pelo usuário para este projeto (agents.md)
metadata: 
  node_type: memory
  type: project
  originSessionId: 99383d36-65bf-4381-93c0-68943ea0194e
  modified: 2026-07-30T01:06:51.726Z
---

# Diretrizes do Projeto (agents.md)

## VDD (Verification-Driven Development)
- Definir critérios de sucesso e o "PORQUÊ" antes de escrever código
- Código mínimo. Nada especulativo. Sem abstrações de uso único
- Teste que verifica lógica de negócio — se não pode falhar quando a lógica muda, é inútil
- Refatorar apenas para remover duplicação

## Execution & Boundaries
- Assumir explicitamente. Perguntar, não adivinhar
- Push back quando existir abordagem mais simples. Parar imediatamente se confuso
- **Múltiplos caminhos = parar e perguntar:** se houver mais de um caminho lógico ou estrutural para resolver um problema, listar as opções e perguntar ao desenvolvedor qual seguir ANTES de escrever qualquer código (decisão Q21)
- Tocar apenas no necessário. Não "melhorar" código adjacente
- Estilo existente > gosto pessoal. Não refatorar o que funciona
- Se convenção parecer prejudicial, surface. Não faça fork silencioso

## Definition of Done
- Critérios de sucesso no início. Loop até verificado por código/testes
- "Completed" = mentira se algo foi skipped silenciosamente
- "Tests pass" = mentira se algum teste foi skipped ou mocked inutilmente
- Surface uncertainty. Nunca continuar de estado indescritível

## Micro-Deliverables & Human-in-the-Loop
- Máximo 50-80 linhas por output
- Tarefas complexas quebradas em componentes pequenos, isolados, coesos
- PARAR após cada bloco de código. Não prosseguir para próximo arquivo/componente
- Explicar escolha arquitetural, riscos de segurança/estado/performance
- Perguntar: "Entendeu completamente esse bloco ou quer quebrar/refatorar?"
- AGUARDAR aprovação explícita antes do próximo bloco
- Trazer consequências de primeira, segunda e terceira ordem sobre decisões

## Active Memory Bank
- `MEMORY.md` na raiz do projeto é a fonte absoluta da verdade
- LER antes de qualquer tarefa
- ATUALIZAR após cada tarefa: o que foi feito, decisões, estado atual, próximos passos

## Convenções de Código

### CSS
- Paleta de cores em `:root` com custom properties — sem cores hardcoded
- Nesting sempre: tags filhas sem `&`, pseudo-classes/modificadores com `&`
- `:hover` sempre acompanhado de `:focus-visible` (acessibilidade teclado)
- Nada de height fixa — usar `dvh`, `aspect-ratio` ou `min-height`
- Classes nunca com mesmo nome da tag (ex: nada de `.header` no `<header>`)

### Nomenclatura
- **Tudo em pt-BR**: variáveis, funções, classes, IDs, arquivos
- Nomes descritivos e de fácil compreensão
- Nada de sufixos crípticos tipo `El`, `Btn`, `Cnt`
- Sufixos tipo `El` ou `Btn` ou `Cnt` proibidos — use `listaDeCursos`, não `listaEl`

### JavaScript
- Funções com nome claro em pt-BR descrevendo o que fazem
- Regex só quando split/slice não resolvem — explicar com comentário se usar
- `DocumentFragment` para operações batch no DOM
- Comentários explicando lógica não-óbvia (o "porquê", não o "o quê")

### Arquitetura do Projeto
- Mobile-first sempre
- Zero frameworks — HTML, CSS e JS vanilla
- Separação: estrutura (index.html), estilo (styles.css), lógica (script.js)
- Camada de dados (senac-api.js) separada da apresentação (script.js)
- CSS e JS no mesmo diretório, sem subpastas desnecessárias

### Fluxo de Trabalho em Dupla
- Cada bloco de código para e espera aprovação explícita
- TodoWrite antes de começar, atualizado a cada bloco concluído
- **Commit após cada bloco aprovado** — convenção: `feat: descricao curta em pt-BR`
- Explicar decisões de design, trade-offs e edge cases tratados
- `plano.txt` é rascunho temporário constante, não é documentação formal

**Why:** Convenções estabelecidas durante a sessão de 2026-07-29 para manter consistência. Nomenclatura em pt-BR mantém o código acessível. Paleta no :root facilita troca de tema depois. Nesting + hover/focus-visible são padrão de acessibilidade e CSS moderno.

**How to apply:** Checar cada bloco contra estas regras antes de entregar. Nome em inglês = rejeitado. Classe = nome de tag = rejeitado. Cores fora do :root = rejeitado.
