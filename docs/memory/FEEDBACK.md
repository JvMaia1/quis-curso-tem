---
name: analise-praticas-maia
description: "Análise das práticas de código do Maia — pontos fortes e a melhorar, extraídos da sessão de modularização DADOS-01"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 108ca5bd-ba86-49f3-ba54-743a72cb6cd1
  modified: 2026-08-08T20:21:55.625Z
---

# Análise de Práticas — Maia (2026-08-08)

Extraído da sessão de modularização do `cursos.js` + criação do `api-senac.js`.

## Pontos Fortes (manter e reforçar)

### 1. Modularização por responsabilidade
Separação clara: `api-senac.js` (HTTP, endpoints, IDs) vs `cursos.js` (orquestração, fluxo de negócio). Cada módulo tem uma razão única para mudar.
**Por que funciona:** Facilita testar cada parte isoladamente. O orquestrador não precisa saber detalhes de HTTP.

### 2. Contrato antes da implementação (VDD aplicado)
`todo.js` define interface completa antes de implementar: Entrada, Saída, Testes mentais. Sem adivinhar assinatura no meio do caminho.
**Por que funciona:** Evita retrabalho. O contrato é a especificação executável.

### 3. Funções com responsabilidade única
`agruparCursosPorTema` só agrupa. `extrairCurso` só processa um tema. `processarCursosDaUnidade` só orquestra. Cada função faz uma coisa e faz bem.
**Por que funciona:** Debug focado. Se a extração falha, sabe exatamente onde olhar.

### 4. Nomes em português para domínio de negócio
`extrairCurso`, `buscarCursosPorCategoria`, `agruparCursosPorTema`, `processarCursosDaUnidade`. O domínio fala português, o código também.
**Por que funciona:** Zero tradução mental entre conceito de negócio e nome da função.

### 5. Config externa (`config.json`)
Unidades, filtros, delays, IDs — tudo fora do código. Mudar unidade não mexe em JS.
**Por que funciona:** Separa o que muda por ambiente do que é lógica.

### 6. Retry com backoff exponencial e skip 4xx
`executarComRetentativa` com 3 tentativas, exponencial (1s→2s→4s), não retenta 4xx (erro permanente).
**Por que funciona:** Resiliência sem desperdício em erros do cliente.

### 7. Dry-run mode (`--dry-run`)
Flag CLI que testa o fluxo inteiro sem escrever arquivo.
**Por que funciona:** Medo zero de rodar script em produção.

### 8. Funções de log isoladas
`logInicial()` e `logFinal(falhas, todosCursos)` — apresentação separada da lógica.
**Por que funciona:** Trocar formato de saída não mexe na lógica de extração.

### 9. Destructuring em loops
`for (const { tema, cursos } of agrupados)` — extrai só o que precisa, nome claro.
**Por que funciona:** Código mais limpo, sem `item[0]`/`item[1]` misterioso.

### 10. TODOs centralizados em arquivo dedicado
`todo.js` como backlog de contratos pendentes. Cada TODO tem dono `TODO(MAIA): TICKET-ID`.
**Por que funciona:** Rápido scan do que falta fazer sem grep no código inteiro.

## Pontos a Melhorar

### 1. Higiene de imports/exports
`api-senac.js` não exporta `buscarOfertasCurso`. `cursos.js` chama `buscarOfertasCurso` e `mapearOfertas` sem importar de lugar nenhum.
**Regra:** Toda função chamada em um módulo ou está definida nele ou está no `require` do topo.

### 2. Bugs de sintaxe em scaffold
`api-senac.js:65` — template string com aspas simples `${CONFIG.api.groupId}` não interpola. E falta `return` na função.
**Regra:** Scaffold que compila/roda é melhor que scaffold completo quebrado. Se a função é placeholder, lance `throw new Error('TODO')` ou deixe só o contrato no `todo.js`.

### 3. Comentários de baixo valor
`//Pegando configuraçoes do json de configs`, `//Guardando escolha do usuario se dry run ou nao` — explicam o óbvio. Comentário deve dizer o PORQUÊ, não o QUÊ.
**Regra:** Se o código já diz o que faz, não precisa de comentário. Use comentário só para o não-óbvio (ex: `// API retorna 500 quando start ultrapassa o total — tratar como fim da paginação`).

### 4. Debug residual
`console.log("")` vazio no retry (linha 40), `console.log('c')` no `script.js:112`. Sobrou de debug.
**Regra:** Antes de commit, grep por `console.log` e remover os de debug.

### 5. Nomes inconsistentes
Arquivo tem `agruparCursosPorTema` mas o conceito original era `extrairCursosPorTema`. Os dois nomes coexistem em branches/diffs diferentes.
**Regra:** Decide um nome e usa consistentemente. Renomear no meio causa confusão.
