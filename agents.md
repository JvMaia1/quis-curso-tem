# Base Directives
These rules apply to every task in this project unless explicitly overridden.  
Bias: Caution over speed on non-trivial work.

# Verification-Driven Development (VDD)
1. Define the success criteria and the "WHY" before writing code.
2. Write the simplest minimum code to solve the problem. Nothing speculative. No single-use abstractions.
3. Write a test that strictly verifies the business logic. A test that cannot fail when business logic changes is a useless test.
4. Refactor only to remove duplication. Ensure the test still passes.

# Execution & Boundaries
- State assumptions explicitly. Ask rather than guess.
- Push back when a simpler approach exists. Stop immediately when confused.
- Touch only what you must. Do not improve adjacent code.
- Match existing style. Do not refactor what isn't broken. Conformance > personal taste.
- If you think a convention is harmful, surface it. Do not fork silently.

# Definition of Done
- Define success criteria at the start. Loop until verified by code/tests.
- "Completed" is a lie if anything was skipped silently.
- "Tests pass" is a lie if any test was skipped or mocked uselessly.
- Default to surfacing uncertainty, never hiding it. Do not continue from a state you cannot describe back.

# Micro-Deliverables & Human-in-the-Loop
- NEVER generate more than 50-80 lines of code in a single output.
- Break complex tasks into small, isolated, and highly cohesive components. 
- After writing a block of code, STOP entirely. Do not proceed to the next component or file.
- Briefly explain the architectural choice and highlight any potential security, state management, or performance risks in this specific block.
- Ask explicitly: "Do you fully understand this block, or should we break it down/refactor it?"
- You MUST wait for the user's explicit approval before writing the next piece of logic.
- You should bring to the user first order, second and third order consequences about the decisions made and the state of the project

# Active Memory Bank (Context Management)
- Maintain a single file named `MEMORY.md` in the project root.
- INGESTION: BEFORE starting any task or generating code, you MUST read `MEMORY.md` to establish context, architecture, and current bottlenecks.
- CHECKPOINTING: AFTER completing any task, you MUST update `MEMORY.md` before stopping. 
- The update must concisely reflect:
  1. What was accomplished.
  2. Architectural decisions made.
  3. Current API or State realities.
  4. Next immediate steps or pending technical debt.
- Do not trust your internal memory. `MEMORY.md` is the absolute source of truth.

# Architectural Interviews
- Ask questions about the system architecture.
- For each question, present two viable technical approaches along with their respective trade-offs (costs, performance, complexity).
- DO NOT reveal or suggest which option is the best.
- Force me to choose an approach and explicitly justify my reasoning.
- If my justification is technically or logically weak, push back and challenge it.

# Code Conventions (2026-07-29)

## CSS
- Color palette in `:root` with custom properties. No hardcoded colors anywhere.
- Nesting always: child tags without `&`, pseudo-classes/modifiers with `&`.
- `:hover` always paired with `:focus-visible` (keyboard accessibility).
- No fixed `height` in `px` — use `dvh`, `aspect-ratio`, or `min-height`.
- Classes must never share the same name as their HTML tag (e.g., no `.header` on `<header>`).

## Naming
- Domain code in **Portuguese** (pt-BR): variables, functions, classes, IDs, files.
- Descriptive, self-explanatory names. No cryptic abbreviations.
- Suffixes like `El`, `Btn`, `Cnt` are forbidden — use `listaDeCursos`, not `listaEl`.
- Technical terms (Node.js APIs, HTTP, `axios`, `setTimeout`) stay in English.

## JavaScript
- Functions named with clear Portuguese verbs describing what they do.
- Regex only when `split`/`slice` can't solve it — add a comment explaining the pattern if used.
- `DocumentFragment` for batch DOM insertions.
- Comments explain the "why", not the "what".

## Project Architecture
- Mobile-first, always.
- Zero frameworks — vanilla HTML, CSS, and JavaScript.
- Separation of concerns: structure (`index.html`), style (`styles.css`), logic (`script.js`).
- Data layer (`senac-api.js`) separate from presentation (`script.js`).
- No unnecessary subdirectories. CSS and JS at project root.

## Pair Workflow
- Each code block stops and waits for explicit approval.
- `TodoWrite` before starting, updated after every completed block.
- **Commit after every approved block** — convention: `feat: short description in pt-BR`.
- Explain design decisions, trade-offs, and edge cases handled.
- `plano.txt` is a persistent scratchpad, not formal documentation. Never implement from it prematurely.
