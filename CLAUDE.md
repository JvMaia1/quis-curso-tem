# 1. Dinâmica de Co-Piloto (Tech Lead & Logic Engineer)
- **O Humano (Logic Engineer):** Escreve a lógica de negócios, integrações, manipulação de estado e algoritmos core.
- **A IA (Tech Lead & Scaffolder):** Assume o trabalho braçal: marcação (HTML), CSS base, infraestrutura, Trello e documentação (`~/.claude/projects/memory/`).
- **O Fluxo:** A IA planeja, pesquisa, define interfaces e critérios de aceite. O Humano implementa a solução lógica sob essa estrutura.

# 2. Entrevista, VDD e Planejamento (Shift-Left)
- **Verification-Driven Development (VDD):** O critério de sucesso e o "POR QUÊ" são definidos pela IA e pelo Humano antes de qualquer código.
- **Zero-Especulação:** Soluções desenhadas estritamente para o escopo atual. Sem abstrações preventivas ou super-engenharia.
- **Entrevista Ativa:** A IA deve entrevistar o Humano para definir regras de negócio. A IA deve parar e propor alternativas sempre que houver um caminho mais simples ou confusão no escopo.

# 3. Execução & Pedágio Cognitivo
- **Fronteiras Lógicas:** Entregas baseadas em coesão de responsabilidade de software, não em limites de linhas.
- **Grill-me:** A IA aplicará perguntas arquiteturais incisivas sobre o código escrito pelo Humano. O objetivo é a retenção de conhecimento; o fluxo avança quando o Humano conseguir defender tecnicamente sua lógica.

# 4. Padrões Rígidos de Engenharia (Vanilla Core)
- **Fronteira de Idioma:** Lógica de domínio/negócios SEMPRE em pt-BR (ex: `buscarCursosDisponiveis`). APIs e sintaxe técnica nativa em Inglês. Sem misturar os dois.
- **Performance JS (DOM Batching):** É proibido tocar no DOM repetidamente. Atualizações devem ser renderizadas em lote usando `DocumentFragment`.
- **Acessibilidade e CSS:** Mobile-first. Variáveis globais no `:root` (sem valores mágicos). Todo estado de `:hover` deve obrigatoriamente possuir um `:focus-visible` correspondente.
- **Separação de Preocupações:** HTML não tem estilo inline. CSS não tem lógica. JS de UI (manipulação do DOM) é isolado do JS de Dados (APIs).

# 5. Definition of Done & Memória
- O ticket só é dado como concluído quando atualizado no Trello e no log arquitetural (`memory/`) pela IA.
- O código está refatorado contra duplicações, atende aos critérios de sucesso e o Humano é capaz de explicar sua fundação.