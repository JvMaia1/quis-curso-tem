'use strict';

const express = require('express');
const app = express();

const fs = require('fs');
const path = require('path');

const PORTA = 3000;
const objResposta = JSON.parse(
	fs.readFileSync(path.join(__dirname, '../cursos.json'), 'utf-8'),
);

app.get('/', (req, res) => {
	res.send(objResposta);
});

app.listen(PORTA, () => {
	console.log(`Rodando na porta ${PORTA}`);
});
1;
