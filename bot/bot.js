'use strict';

const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');
const CONFIG = require('../config.json');
const {
	formatarListaCursos,
	formatarDetalheCurso,
	formatarListaUnidades,
	botaoInscricao,
} = require('./mensagens');

const TOKEN = process.env.TELEGRAM_TOKEN;
if (!TOKEN) {
	console.error('TELEGRAM_TOKEN ausente. Copie .env.example para .env e preencha.');
	process.exit(1);
}

const baseUrl = `http://127.0.0.1:${CONFIG.servidor.porta}`;
const LIMITE = CONFIG.bot.maxResultados;
const hoje = new Date();
hoje.setHours(0, 0, 0, 0);

const bot = new TelegramBot(TOKEN, { polling: true });

const TEXTO_AJUDA = [
	'Comandos do bot:',
	'',
	'/start — boas-vindas',
	'/unidades — unidades atendidas',
	'/buscar <termo> — busca cursos por termo',
	'/disponiveis — cursos com inscrições abertas',
	'/curso <codigoFT> — detalhes de um curso',
	'/help — esta lista',
].join('\n');

/** Chama um endpoint da API local de dados.
 *
 * @param {string} caminho Caminho (ex.: "/unidades", "/cursos?q=excel&limite=5")
 * @returns {Promise<{ok: boolean, data?: *, status?: number, erro?: Error}>}
 */
async function consultarApi(caminho) {
	try {
		const { data } = await axios.get(baseUrl + caminho, { timeout: 15000 });
		return { ok: true, data };
	} catch (err) {
		const status = err.response && err.response.status;
		if (status) {
			return { ok: false, status, data: err.response.data };
		}
		return { ok: false, erro: err };
	}
}

function responderErro(chatId, erro) {
	console.error('[bot] erro:', erro);
	bot.sendMessage(chatId, 'Algo deu errado. Tente de novo em instantes.');
}

function avisarApiForaDoAr(chatId) {
	bot.sendMessage(chatId, 'A API de dados está fora do ar. Tente de novo em instantes.');
}

bot.onText(/\/start/, (msg) => {
	bot.sendMessage(msg.chat.id, `Olá! Sou o bot de bolsas do Senac SP.\n\n${TEXTO_AJUDA}`);
});

bot.onText(/\/help/, (msg) => {
	bot.sendMessage(msg.chat.id, TEXTO_AJUDA);
});

bot.onText(/\/unidades/, async (msg) => {
	const resultado = await consultarApi('/unidades');
	if (!resultado.ok) {
		if (resultado.status) return responderErro(msg.chat.id, resultado.data);
		return avisarApiForaDoAr(msg.chat.id);
	}
	bot.sendMessage(msg.chat.id, formatarListaUnidades(resultado.data), { parse_mode: 'HTML' });
});

bot.onText(/\/buscar (.+)/, async (msg, match) => {
	const termo = match[1].trim();
	if (!termo) {
		return bot.sendMessage(msg.chat.id, 'Uso: /buscar <termo>');
	}
	const resultado = await consultarApi(`/cursos?q=${encodeURIComponent(termo)}&limite=${LIMITE}`);
	if (!resultado.ok) {
		if (resultado.status) return responderErro(msg.chat.id, resultado.data);
		return avisarApiForaDoAr(msg.chat.id);
	}
	if (!resultado.data || resultado.data.length === 0) {
		return bot.sendMessage(msg.chat.id, `Nenhum curso encontrado para "${termo}".`);
	}
	bot.sendMessage(msg.chat.id, formatarListaCursos(resultado.data, LIMITE), {
		parse_mode: 'HTML',
	});
});

bot.onText(/\/disponiveis/, async (msg) => {
	const resultado = await consultarApi(`/cursos?disponiveis=1&limite=${LIMITE}`);
	if (!resultado.ok) {
		if (resultado.status) return responderErro(msg.chat.id, resultado.data);
		return avisarApiForaDoAr(msg.chat.id);
	}
	if (!resultado.data || resultado.data.length === 0) {
		return bot.sendMessage(msg.chat.id, 'Nenhum curso com inscrições abertas no momento.');
	}
	bot.sendMessage(msg.chat.id, formatarListaCursos(resultado.data, LIMITE), {
		parse_mode: 'HTML',
	});
});

bot.onText(/\/curso (\d+)/, async (msg, match) => {
	const codigoFT = match[1];
	const resultado = await consultarApi(`/cursos/${codigoFT}`);
	if (!resultado.ok) {
		if (resultado.status === 404) {
			return bot.sendMessage(msg.chat.id, `Curso ${codigoFT} não encontrado.`);
		}
		if (resultado.status) return responderErro(msg.chat.id, resultado.data);
		return avisarApiForaDoAr(msg.chat.id);
	}
	const texto = formatarDetalheCurso(resultado.data);
	const opcoes = botaoInscricao(resultado.data, hoje) || {};
	bot.sendMessage(msg.chat.id, texto, { parse_mode: 'HTML', ...opcoes });
});

// Fallback: mensagens que não casam com nenhum comando
const COMANDOS = [/\/start/, /\/help/, /\/unidades/, /\/buscar/, /\/disponiveis/, /\/curso/];
bot.on('message', (msg) => {
	if (!msg.text) return; // ignora mídia, callbacks, etc.
	if (COMANDOS.some((regex) => regex.test(msg.text))) return; // já tratado por onText
	bot.sendMessage(msg.chat.id, 'Comando não reconhecido. Envie /help.');
});

console.log('[bot] rodando com polling...');
