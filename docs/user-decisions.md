# Decisões do Usuário — Quis Curso Tem

Registro de escolhas arquiteturais tomadas durante o grill (2026-07-27), com justificativas.

## Q1: Monolítico vs Modular

**Escolha: Monolítico** (1 arquivo por estágio, sem módulos internos).

**Por quê:** Script de extração de dados, não aplicação web. Complexidade de módulos (imports, dependências circulares, refatoração ao descobrir API) não se justifica para ~200 linhas. Se crescer muito, refatora depois.

---

## Q2: Sequencial vs Paralelo

**Escolha: Sequencial depth-first** (unidade → tema → curso, um após o outro).

**Por quê:** APIs do Senac podem rate-limitar. Paralelismo prematuro introduz complexidade de concorrência sem ganho claro. Delay entre chamadas já configurável no `config.json`.

---

## Q3: Dois estágios vs Um estágio

**Escolha: Dois estágios independentes** (Estágio 1: lista de cursos, Estágio 2: detalhes/ofertas).

**Por quê:** Lista de cursos é rápida e leve (~200 registros). Ofertas/turmas exigem chamada extra por curso e geram volume maior de dados. Separar permite usar Estágio 1 sozinho (frontend simples) sem esperar Estágio 2. Scripts rodam independentes, outputs são arquivos diferentes.

---

## Q4: Config file vs CLI flags vs Hardcoded

**Escolha: Config file JSON** (`config.json` versionável, script genérico).

**Por quê:** Projeto será web futuramente. JSON é universal, legível por qualquer linguagem. Versionável (dá para ver histórico de mudanças nas unidades). Script fica genérico — mesma lógica, config diferente para cada necessidade.

---

## Q5: Contrato de dados

**Escolha: Contrato magro + descrição** (7 campos: unidade, tema, curso, codigoFT, url, descricao, modalidade).

**Por quê:** Esses são os campos que o usuário final precisa para decidir se quer um curso. Descrição é essencial para busca/filtro. Outros campos (`articleId`, `imagemURL`, `formatos`, `tags`) podem vir depois se necessário.

---

## Q6: Estratégia de output

**Escolha: Sobrescreve sempre** (`cursos.json` reescrito a cada execução).

**Por quê:** Simples, previsível, sem estado entre execuções. Diff entre execuções (quais cursos entraram/saíram) é ideia interessante mas adiada para `ideias.md`.

---

## Q7: Tratamento de erros

**Escolha: Retry com backoff exponencial** (3 tentativas: 1s, 2s, 4s), skip em 4xx, report ao final.

**Por quê:** APIs instáveis precisam de resiliência. Backoff exponencial é padrão industry-standard. 4xx não são transientes — retentar não resolve. Report de falhas ao final evita que erros passem despercebidos. Exit code 1 para CI.

---

## Q8: Unidades e tipos de curso

**Escolha: Unidades hardcoded no config, tipo de curso configurável.**

**Por quê:** Unidades mudam raramente. Tipo de curso ("Livre", "Técnico", etc.) o usuário pode querer variar com frequência. Ambos no config.json, mas mentalidade diferente: unidade é setup, tipo de curso é parâmetro de execução.

---

## Q9: Dry-run

**Escolha: Flag `--dry-run` via CLI.**

**Por quê:** Barato de implementar. Permite validar conexão com APIs e estrutura dos dados sem sujar output. Bom para CI e debug.

---

## Q10: Nomenclatura do código

**Escolha: Português para funções/variáveis de domínio, inglês para APIs/tecnicismos.**

**Por quê:** Domínio do problema é brasileiro (Senac SP, cursos, unidades). Código lido por brasileiros. Nomes em português reduzem carga cognitiva: `obterIdUnidade` melhor que `getUnitId` quando o conceito "unidade Senac" não tem tradução exata. APIs e Node.js mantêm nomes originais (`axios`, `setTimeout`).

---

## Q11: Frontend

**Escolha: HTML+CSS estático** (Opção A do grill), sem build step, sem framework.

**Por quê:** Projeto é simples — listar cursos com busca/filtro. Não justifica React/Vue/Svelte. HTML estático abre em qualquer navegador, zero dependências, deploy é copiar arquivos. Se complexidade crescer, reavalia.

**Pendente:** Decidir entre `<script src>` (inline) vs `fetch()` para carregar `cursos.json`.

---

## Q12: Estilo de desenvolvimento

**Escolha: VDD (Verification-Driven Development), micro-deliverables, human-in-the-loop.**

**Por quê:** Cada bloco de 50-80 linhas é revisado e aprovado antes do próximo. Evita retrabalho. Code review por agente externo (`cavecrew-reviewer`) antes de commitar.

---

# Grill 2026-08-11 — Reestruturação para chatbot do Telegram

## Q13: Relação bot ↔ API

**Escolha: HTTP, processos separados** — `bot.js` e `api.js` rodam independentes; o bot consulta a API com axios em `127.0.0.1:3000`.

**Por quê:** Separação de preocupações — a API serve qualquer cliente (bot hoje, outros depois) e o bot fica magro. Se a API cair, o bot avisa e não trava.

## Q14: Atualização dos dados

**Escolha: Agendador diário** dentro do processo da API (hora configurável em `config.json`, default 03:00), além do `npm run dados` manual.

**Por quê:** Dados de bolsa mudam todo dia; extração manual esquece. **Tensão aceita:** o agendador só dispara enquanto o processo da API estiver aberto (deploy local) — limitação documentada no README. Escrita atômica (`.tmp` + `rename`) garante que o arquivo nunca fique corrompido.

## Q15: Formato das respostas do bot

**Escolha: Híbrido** — texto HTML (`parse_mode: 'HTML'`: `<b>`, `<a href>`) + botão inline "Inscrever-se" (URL) no `/curso` quando `dataAberturaBolsa <= hoje`.

**Por quê:** O Telegram renderiza HTML no próprio app (não é página web). Botão dá atalho de 1 toque para o portal. Contrato: todo dado de origem (nome, tema, unidade) passa por `escaparHtml` antes de entrar no HTML.

## Q16: Conteúdo do `/buscar`

**Escolha: Top 5** (`config.json` → `bot.maxResultados`) — nome em negrito, unidade(s), tema, link "Ver curso", sugestão `Detalhes: /curso <codigoFT>`. Sem paginação.

**Por quê:** Mensagens curtas e escaneáveis; o detalhe completo fica no `/curso`.

## Q17: Destino do frontend web

**Escolha: Arquivar em `legacy/web/`** — `git mv` de `index.html`, `css/`, `scripts/script.js`.

**Por quê:** Foco 100% no bot. Cards de web (BUS-02/03, CARD-01, MAP-01) arquivados no Trello. Regras de formatação e de disponibilidade do web continuam valendo como fonte das regras do bot.

## Q18: Deploy

**Escolha: Local agora, deploy depois** (Oracle free VPS etc. fica para iteração futura).

**Por quê:** MVP valida o fluxo com token real do BotFather sem infraestrutura. Agendador documentado como "roda com processo aberto".

## Q19: Definition of Done

**Escolha: Bot respondendo com dados reais** — os 5 comandos (`/start`, `/unidades`, `/buscar`, `/disponiveis`, `/curso`) funcionando no Telegram real com token BotFather; API validada via curl; docs + Trello atualizados; corpos das funções implementados pelo Maia conforme contratos de `scripts/todo.js` (dinâmica co-piloto).
