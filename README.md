# Quis curso tem

# O que faz?
Realiza um web scraping simples extraindo que cursos estão disponiveis no senac para compra/bolsa de estudo 

##### Depois:
```sh
# clone o repositorio
git clone https://github.com/JvMaia1/quis-curso-tem.git

# Va até apasta
cd quis-curso-tem

# Rode o script
node senac.js
```

# como editar as unidades
Altere o array inserindo as unidades que você precisa.
Você pode pegar o slug no proprio site do https://www.sp.senac.br, basta acessar a unidade de sua escolha.

```sh
const unidadesSenac = ['senac-penha', 'senac-sao-miguel-paulista'];
```