---
name: ticket-methodology
description: Metodologia para criação de tickets no estilo Scrum/Kanban
metadata: 
  node_type: memory
  type: project
  modified: 2026-08-01T15:59:06.322Z
  originSessionId: c0d41e2e-7109-44a0-ac07-5483033d5dd8
---

# Metodologia de Tickets

Definida em 2026-08-01 durante sessão de planejamento com grill-me.

## Formato do ticket

Foco no **O QUE** entregar, não no COMO. A maneira de fazer pode ser detalhada como nota (tecnologia, método), mas o título e escopo descrevem o resultado.

## Estrutura

```
COD-00 — Título descrevendo a entrega

Descrição do comportamento esperado, critério de aceitação.
Sem detalhes de implementação no corpo principal.

*Tecnologia:* Leaflet (exemplo de nota técnica, secundária)
*Depende de:* BUS-01 (se houver)
*Futuro:* integração com XYZ (se aplicável)
```

## Convenções

- Prefixo por área: BUS (busca), MAP (mapa), CARD (card de curso), DADOS (extração de dados), TECH (débito técnico)
- Ordem canônica: o ticket de maior prioridade no topo
- Tickets em bloco "Em andamento" = apenas o que está ativamente sendo trabalhado
- Débito técnico em bloco separado, sempre visível, nunca escondido no fundo do backlog
- Kanban: colunas clássicas (Backlog, Em andamento, Em revisão, Concluído)

## Processo de criação

1. Grill-me para extrair decisões de design (uma pergunta por vez, sem recomendações)
2. Consolidar decisões no memory como narrativa
3. Derivar tickets a partir das decisões, cada ticket = uma entrega de valor
4. Revisar com o Maia antes de subir para o Trello
5. Subir no Trello em estrutura kanban

## Anti-padrões

- Ticket "implementar função X" — muito granular, foco em código
- Ticket "fazer o sistema de busca usando índice estático porque... " — decisão de implementação no título
- Múltiplos tickets em "Em andamento" sem necessidade real
