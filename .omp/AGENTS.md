# Contexto do Projeto — quis-curso-tem

As regras canônicas de engenharia vivem em `CLAUDE.md` na raiz do repo. O omp não
descobre `CLAUDE.md` na raiz por conta própria (o provider `claude` só lê
`.claude/CLAUDE.md`), então este arquivo `.omp/AGENTS.md` importa o canônico:

@../CLAUDE.md
