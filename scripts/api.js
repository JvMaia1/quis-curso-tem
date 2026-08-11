'use strict';

const express = require('express');
const fs = require('fs');
const path = require('path');

const { gerarCursos } = require('./cursos');
const dadosCursos = require('./dados-cursos');

const CONFIG = JSON.parse(
	fs.readFileSync(path.join(__dirname, '../config.json'), 'utf-8'),
);

const app = express();

// Agendador diário -----------------------------------------------------------------

let extraindoEmAndamento = false;

/** Compara a hora local (HH:MM) com a hora configurada do agendador.
 *
 * @param {Date} agora Momento atual
 * @param {string} horaConfig Hora no formato "HH:MM"
 * @returns {boolean} true quando as horas coincidem
 */
function chegouHoraAgendada(agora, horaConfig) {
	const hhmm = `${String(agora.getHours()).padStart(2, '0')}:${String(agora.getMinutes()).padStart(2, '0')}`;
	return hhmm === horaConfig;
}

async function rodarExtracaoAgendada() {
	if (extraindoEmAndamento) return;
	extraindoEmAndamento = true;
	console.log('[agendador] extração iniciada');
	const falhas = [];
	try {
		const { totalCursos } = await gerarCursos(falhas);
		console.log(`[agendador] concluída: ${totalCursos} cursos`);
		if (falhas.length > 0) {
			console.error(`[agendador] ${falhas.length} falha(s) durante a extração`);
		}
	} catch (err) {
		console.error(`[agendador] falhou: ${err.message}`);
	} finally {
		extraindoEmAndamento = false;
	}
}

function iniciarAgendador() {
	setInterval(() => {
		if (chegouHoraAgendada(new Date(), CONFIG.agendador.hora)) {
			rodarExtracaoAgendada();
		}
	}, 60_000);
	console.log(`[agendador] ativo — extração diária às ${CONFIG.agendador.hora} (hora local)`);
}

// Rotas -----------------------------------------------------------------------------

function responderErro(res, status, mensagem) {
	res.status(status).json({ erro: mensagem });
}

app.get('/', (req, res) => {
	res.json({
		servico: 'quis-curso-tem-api',
		endpoints: [
			'/cursos',
			'/cursos?q=&limite=',
			'/cursos?disponiveis=1',
			'/cursos/:codigoFT',
			'/unidades',
		],
	});
});

app.get('/cursos', async (req, res) => {
	const { q, disponiveis, limite: limiteRaw } = req.query;
	const limite = limiteRaw === undefined ? CONFIG.bot.maxResultados : Number(limiteRaw);

	if ((limiteRaw !== undefined && !Number.isInteger(limite)) || limite <= 0) {
		return responderErro(res, 400, 'Parâmetro limite deve ser um inteiro positivo.');
	}

	try {
		if (disponiveis === '1') {
			res.json(dadosCursos.cursosDisponiveis(limite));
			return;
		}
		if (q !== undefined) {
			res.json(dadosCursos.buscarCursos(String(q), limite));
			return;
		}
		res.json(dadosCursos.carregarCursos());
	} catch {
		responderErro(res, 503, 'cursos.json não encontrado. Rode npm run dados.');
	}
});

app.get('/cursos/:codigoFT', (req, res) => {
	const curso = dadosCursos.cursoPorCodigoFT(req.params.codigoFT);
	if (!curso) {
		return responderErro(res, 404, `Curso ${req.params.codigoFT} não encontrado.`);
	}
	res.json(curso);
});

app.get('/unidades', (req, res) => {
	res.json(dadosCursos.listarUnidades());
});

app.use((req, res) => {
	responderErro(res, 404, 'Rota não encontrada.');
});

// Express 5 encaminha rejeições de handlers async para cá
app.use((err, req, res, next) => {
	console.error(err);
	responderErro(res, 500, 'Erro interno.');
});

if (require.main === module) {
	const PORTA = CONFIG.servidor.porta;
	app.listen(PORTA, () => {
		console.log(`API rodando na porta ${PORTA}`);
		iniciarAgendador();
	});
}

module.exports = { chegouHoraAgendada };
