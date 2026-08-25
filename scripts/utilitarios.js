/**Função para poder realizar qoperações de requisição com retry estruturado.
 *
 * @param {function(): Promise<*>} operacao - função assíncrona a ser executada.
 * @param {number} tentativas - numero de tentativas a serem feitas.
 * @param {string} descricao - Texto que descreve a operação.
 * @param {Array<{descricao: string, erro: string}>} falhas Lista de falhas armazenadas no processo
 * @returns {Promise<*|null>} O resultado da operação com sucesso ou null se falhar após os retries.
 */
async function executarComRetentativa(operacao, tentativas, descricao, falhas) {
	for (let i = 0; i < tentativas; i++) {
		try {
			return await operacao();
		} catch (err) {
			// Erros 4xx não adianta retentar, para e avisa o usuário
			const status = err.response && err.response.status;
			if (status && status >= 400 && status < 500) {
				console.error(`  ❌ [${descricao}] erro ${status}: ${err.message}`);
				falhas.push({ descricao, erro: err.message });
				return null;
			}

			if (i < tentativas - 1) {
				// mostrando retentativas ao usuário
				const espera = 1000 * Math.pow(2, i);
				console.log('');
				console.error(
					`  ⚠️  [${descricao}] tentativa ${i + 1}/${tentativas} falhou, retry em ${espera / 1000}s: ${err.message}`,
				);
				await sleep(espera);
			} else {
				console.log('');
				console.error(`  ❌ [${descricao}] esgotadas ${tentativas} tentativas: ${err.message}`);
				falhas.push({ descricao, erro: err.message });
				return null;
			}
		}
	}
}

function mostrarLogInicial() {
	console.log('quis-curso-tem — Estágio 1: lista de cursos');
	console.log(`Unidades: ${CONFIG.unidades.map((u) => u.nome).join(', ')}`);
	console.log(`Tipo: ${CONFIG.tipoCurso}`);
	if (DRY_RUN) console.log('[dry-run] Nenhum arquivo será escrito.\n');
}

function mostrarLogFinal(falhas, totalCursos) {
	// Sumário final
	console.log(`\n${'='.repeat(50)}`);
	console.log(`📊 Total: ${totalCursos} cursos em ${CONFIG.unidades.length} unidade(s)`);

	if (falhas.length > 0) {
		console.log(`\n⚠️  ${falhas.length} falha(s):`);
		falhas.forEach((f) => console.log(`  - ${f.descricao}: ${f.erro}`));
	}

	if (!DRY_RUN) {
		if (totalCursos > 0) {
			console.log(`📄 cursos.json salvo`);
		} else {
			console.log(`⚠️ Nenhum curso extraído — cursos.json anterior mantido`);
		}
	}
}
