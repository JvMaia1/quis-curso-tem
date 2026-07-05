# Quis curso tem

# Dependencias
Node.js

Playwright

# O que faz?
Realiza um web scraping que extrai quais cursos estão disponíveis no Senac SP (filtrando por vagas para compra ou bolsa de estudo) nas unidades que você escolher.

O script simula a rolagem da página para carregar o conteúdo dinâmico, limpa os elementos vazios do layout e gera duas saídas:

Um arquivo cursos.json com o backup dos nomes e links.

Uma lista limpa no terminal no formato Unidade: X | Curso: Y, pronta para dar Ctrl+C e jogar em uma LLM (ChatGPT/Gemini) para filtrar o que te interessa.

##### passo a passo:
```sh
# Clone o repositório
git clone https://github.com/JvMaia1/quis-curso-tem.git

# Vá até a pasta
cd quis-curso-tem

# Instale o Playwright
npm install playwright

# Rode o script
node senac.js
```

# como editar as unidades
Altere o array inserindo as unidades que você precisa.
Você pode pegar o slug no proprio site do https://www.sp.senac.br, basta acessar a unidade de sua escolha.

```sh
const unidadesSenac = ['senac-penha', 'senac-sao-miguel-paulista'];
```