# Quis curso tem

# Dependencias
Node.js

Axios

# O que faz?
Consulta as APIs internas do portal do Senac SP e extrai quais cursos estão disponíveis (filtrando por vagas para compra ou bolsa de estudo) nas unidades que você escolher.

Diferente da abordagem antiga com Playwright, esse script consome os endpoints REST diretamente — sem abrir navegador, sem simular rolagem, sem depender de HTML renderizado. Muito mais rápido e estável.

A saída é um arquivo `cursos.json` com os cursos encontrados e os detalhes de cada turma: datas, horários, preços, vagas e data de abertura da bolsa.

##### passo a passo:
```sh
# Clone o repositório
git clone https://github.com/JvMaia1/quis-curso-tem.git

# Vá até a pasta
cd quis-curso-tem

# Troque para a branch que usa APIs
git checkout usando-apis

# Instale as dependências
npm install

# Rode o script
node senac-api.js
```

# o que sai no json?
Cada curso vem com suas turmas (ofertas) e os dados que importam:

```json
{
  "dataExtracao": "2026-07-21T12:12:47.917Z",
  "totalCursos": 179,
  "unidades": [
    "nome": "Senac Penha",
    "totalCursos": 80,
    "cursos": [
      "curso": "Excel Avançado",
      "tema": "Tecnologia da Informação",
      "url": "https://www.sp.senac.br/...",
      "modalidade": ["Presencial"],
      "tags": ["Informática", "Office"],
      "ofertas": [
        "dataInicio": "2026-09-11",
        "dataFim": "2026-12-04",
        "horarios": "Sex 13h30 às 17h30",
        "periodoDia": "TA",
        "totalVagas": "10",
        "vagasPSG": "6",
        "dataAberturaBolsa": "2026-08-22",
        "precoVenda": "960",
        "maxParcelas": "12"
      ]
    ]
  ]
}
```

# como editar as unidades
Altere o array inserindo as unidades que você precisa.
Você pode pegar o slug no proprio site do https://www.sp.senac.br, basta acessar a unidade de sua escolha.

```js
const UNIDADES = [
  { friendlyUrl: 'senac-penha', nome: 'Senac Penha' },
  { friendlyUrl: 'senac-sao-miguel-paulista', nome: 'Senac São Miguel Paulista' },
];
```

# documentação da api
Os endpoints usados e o dicionário de dados do XML estão documentados em [`api_documentacao.md`](api_documentacao.md).

esse projeto foi desenvolvido por mim e codado com inteligência artificial em 30 minutos
