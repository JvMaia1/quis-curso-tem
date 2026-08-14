# 🏛️ System Architecture (Quis Curso Tem)

> **AI INSTRUCTION:** This file contains the architectural blueprint, data pipelines, and external API mappings. Read this to understand HOW the system works and how modules interact.

## 1. High-Level Processes
The system operates through 3 fully decoupled processes:

| # | Process | Command | Responsibility |
|---|---|---|---|
| 1 | **Extraction** | `npm run dados` | Queries Senac APIs, processes data, and writes to `cursos.json` atomically. |
| 2 | **Express API** | `npm run api` | Serves `cursos.json` via HTTP (port 3000) and runs a daily cronjob (03:00) to trigger Process 1. |
| 3 | **Telegram Bot** | `npm run bot` | Listens to user commands and fetches data exclusively via HTTP from Process 2. |

*(Note: The bot and the extraction never touch. If the API is down, the bot survives and returns a friendly error).*

## 2. System Flowchart
```mermaid
flowchart TD
    subgraph EXT["1. EXTRAÇÃO — npm run dados (ou agendador 03:00)"]
        G1["cursos.js — gerarCursos()"] --> G2["api-senac.js — 5 chamadas à API do Senac (axios)"]
        G2 --> G3["ofertas.js — parseOfertaXML + mapearOfertas"]
        G3 --> G4["cursos.json — wrapper {dataExtracao, totalCursos, totalOfertas, unidades}"]
    end
    subgraph API2["2. API EXPRESS — npm run api (porta 3000)"]
        R1["api.js — rotas Express"] --> R2["dados-cursos.js — consultas sobre o arquivo"]
        R2 --> R3["carregarCursos() — cache por mtime"]
        R3 --> G4
        R4["agendador — 60s tick, HH:MM == 03:00?"] -->|"gerarCursos()"| G4
    end
    subgraph BOT2["3. BOT TELEGRAM — npm run bot"]
        T1["update do Telegram"] --> T2["bot.js — onText: /start /help /unidades /buscar /disponiveis /curso"]
        T2 -->|"axios GET 127.0.0.1:3000"| R1
        T2 --> T3["mensagens.js — formatação HTML + botão Inscrever-se"]
        T3 --> T4["resposta renderizada no app do Telegram"]
    end