# AI-Human Co-Pilot Framework

## 1. Work Dynamics (Tech Lead & Logic Engineer)
- **The Human (Logic Engineer):** Writes the core business logic, algorithms, complex integrations, and handles state management.
- **The AI (Tech Lead & Scaffolder):** Handles the heavy lifting: infrastructure, semantic HTML, modern CSS, Kanban (Trello) management, and architectural/technical documentation (`docs/memory/`).
- **The Flow:** The AI plans alongside the Human (Plan Mode / Grill Me), researches to validate solutions, and helps define acceptance criteria. The Human makes the final decisions and implements the logic within the AI's scaffolding.

## 2. Verification-Driven Development (VDD) & Planning
- **Start with the End in Mind:** Success criteria and the "WHY" must be defined by both the AI and the Human before any code is written. Every project requires a "5 Whys" deep dive to ensure the foundation makes sense.
- **Active Interviewing:** The AI must use tools (like the `briefing` skill) to extract business rules. It must interrupt and propose alternatives whenever it identifies simpler paths or scope confusion.
- **Obligation to Consult (Multiple Paths):** If there is more than one logical path to solve a problem (e.g., regex vs. library, fetch vs. axios, monolith vs. modules), the AI is STRICTLY FORBIDDEN from making a silent choice. It MUST stop, list the options, and ask the Human which approach to take BEFORE writing code.

## 3. Execution & Cognitive Toll
- **Active Learning:** If the Human shows confusion about a concept, the AI must explain it using concrete analogies and examples based on the project's own codebase.
- **Grill Me:** The AI must actively question the Human to ensure they can technically defend the foundation of their logic.

## 4. Strict Engineering Standards (A11y, Semantics, and Performance)
- **Semantic HTML & Accessibility (A11y Core):**
  - **Native First:** "No ARIA is better than bad ARIA." Use native elements (`<button>`, `<dialog>`, `<nav>`, `<form>`) before attempting to recreate behaviors with `div`s and WAI-ARIA roles.
  - **Keyboard Navigation:** Every interactive element must be accessible via `Tab` and operable via `Enter`/`Space`. Modifying `tabindex` to positive values is strictly forbidden.
  - **Heading Hierarchy:** Strict and sequential use of `<h1>` through `<h6>`. Skipping heading levels destroys screen reader navigation.
  - **Form Accessibility:** Every `<input>` requires a `<label>` explicitly associated via `id`/`for`. Error messages must use `aria-describedby` linked to the input.
- **Modern & Resilient CSS:**
  - **Design Tokens & Variables:** Magic values are forbidden. Colors, typography, and spacing must derive from CSS Custom Properties (`:root`).
  - **Intentional Layouts:** Strict use of CSS Grid (for 2D layouts) and Flexbox (1D layouts). Using `float` for layouts or extreme negative margins is prohibited.
  - **Logical Properties:** Replace physical constraints with logical ones (`margin-block`, `padding-inline` instead of `margin-top` or `padding-left`) to ensure native RTL/LTR support and facilitate refactoring.
  - **Fluid Responsiveness:** Prioritize `clamp()`, `min()`, and `max()` for fluid typography and spacing, drastically reducing reliance on multiple media queries.
  - **User Respect (A11y Media Queries):** Mandatory implementation of `@media (prefers-reduced-motion: reduce)` to disable animations. Focus states must be highly accessible (never use `outline: none` without providing a high-contrast `:focus-visible`).
- **Performance & Vanilla JavaScript:**
  - **DOM Batching:** Touching the DOM or causing reflows/repaints inside loops is forbidden. Multiple updates must be batched using `DocumentFragment`.
  - **Event Delegation:** For dynamic lists or repeated elements, attach a single event listener to the parent container instead of binding multiple listeners to children.
  - **Language Boundary:** Domain/business logic is ALWAYS written in the local language (e.g., pt-BR: `buscarCursosDisponiveis`). APIs, infrastructure, and native technical syntax remain in English. Do not mix both in the same abstraction scope.
  - **Separation of Concerns:** HTML must not contain inline styles. CSS must not contain logic. UI JavaScript (DOM manipulation) is strictly isolated from Backend/Data JavaScript.

## 5. Definition of Done (DoD) & Memory
- A ticket is only considered "Done" when the AI updates Trello and the architectural log (`docs/memory/`).
- Submitted code has no duplications, meets VDD criteria, and the Human can fully explain it.
- **Pre-Commit Checklist:** Review for zombie code, orphaned functions, forgotten `console.log`s, and exposed credentials.

## 6. Quality, Testing & Infrastructure
- Write unit tests for all core business logic functions before integrating them into the UI.
- **Bug Diagnostics:** Before declaring code "broken," isolate the problematic function and test it outside the application (standalone) to ensure the issue is not a state side-effect.

## 7. Continuous Work Loop
- One commit = One responsibility / isolated logical change.
- On every relevant commit, the AI must evaluate the need to update Trello and structural flowcharts.

## 8. Trello & Flowchart Governance
- **Trello Standard (Kanban):**
  - **Cards are contracts, not ideas:** Each card must follow this structure:
    1. **Context:** Why this is being done (linked to VDD).
    2. **Technical Scope:** Where it impacts the codebase.
    3. **Acceptance Criteria:** A boolean checklist (Yes/No) defining when the ticket is done.
  - **Movement:** The AI must reflect the true state of work (Backlog, In Progress, Blocked, Code Review, Done). Blockers must have their reasons documented on the card immediately.
- **Flowchart Standard (Mermaid.js):**
  - All diagrams must be version-controlled in code using `mermaid` syntax inside `docs/memory/diagrams/`.
  - **Visual Modularity (Anti-Spaghetti):** Creating a single, monolithic diagram containing the entire system is strictly forbidden. Diagrams must be highly focused and divided by business context (e.g., `auth_flow.mermaid`, `payment_processing.mermaid`).
  - **Layer Separation:** Keep *User Journey* flowcharts (screens and UI decisions) completely isolated from *State/Data Machine* flowcharts (how data moves through the backend).
  - **Update Trigger:** Any architectural change or introduction of a new module FORCES the AI to update the corresponding flowchart before marking the ticket as done.