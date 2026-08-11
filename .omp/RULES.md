# Regras fixas do projeto — quis-curso-tem

- Atualizações de DOM renderizadas em lote com `DocumentFragment`; proibido tocar no DOM repetidamente.
- Toda função nova: contrato (Entrada/Saída/Testes mentais) antes do código, em `scripts/todo.js`.
- `cursos.json` é dado extraído — nunca commitar.
- Antes de cada commit: revisar código zumbi, funções duplicadas, `console.log` de debug, credenciais expostas.
- Ticket concluído só com atualização no Trello e log arquitetural em `docs/memory/`.
- Config que varia entre ambientes (unidades, filtros, delays, IDs) vai em `config.json`, nunca hardcoded.
- Se houver mais de um caminho lógico/estrutural para resolver um problema: parar, listar as opções e perguntar ao desenvolvedor qual seguir antes de escrever qualquer código.
