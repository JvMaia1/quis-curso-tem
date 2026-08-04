    const listaDeCursos = document.getElementById('itens-cursos');
    
    const hoje = new Date(); hoje.setHours(0, 0, 0, 0);

    const mapeamento_unidades = {
        'senac-penha': 'Senac Penha',
        'senac-sao-miguel-paulista': 'Senac São Miguel Paulista',
    };

    let cursosCache = [];

    (async function(){
        
        try {
            const resposta = await fetch('cursos.json');
            
            if (!resposta.ok) {throw new Error(`HTTP ${resposta.status}`)};
        
            const dados = await resposta.json();

            for(const unidade of dados.unidades){
                for( const curso of unidade.cursos){
                    cursosCache.push(curso);
                };
            };
        
            listaDeCursos.innerHTML = '<li class="lista-vazia">Selecione uma unidade</li>';

        } catch (erro) {
            console.error('Erro ao carregar cursos:', erro);
            listaDeCursos.innerHTML = '<li class="lista-erro">Erro ao carregar cursos. Tente novamente.</li>';
        }

    })(); 

    
/*        Achata e agrupa cursos por codigoFT (mesmo curso em unidades diferentes vira um card só)
        const cursos = [];
        for (const unidade of dados.unidades) {
            for (const curso of unidade.cursos) {
                cursos.push(curso);
            }
        }
        
        const agrupados = agruparPorCodigo(cursos);
        if (agrupados.length === 0) {
            listaDeCursos.innerHTML = '<li class="lista-vazia">Nenhum curso encontrado.</li>';
            return;
        }
        
        montarLista(agrupados, listaDeCursos, hoje);
        
        */


    /* ---- Funções ---- */

    /*
     * Agrupa cursos pelo codigoFT.
     * Cursos iguais em unidades diferentes viram um só,
     * com unidades mescladas e ofertas concatenadas.
     */
    function agruparPorCodigo(cursos) {
        const indice = new Map();

        for (const curso of cursos) {
            const chave = curso.codigoFT;
            const existente = indice.get(chave);

            if (existente) {
                /* Mescla unidade (sem duplicar) */
                if (!existente.unidades.includes(curso.unidade)) {
                    existente.unidades.push(curso.unidade);
                }
                /* Concatena ofertas */
                existente.ofertas.push(...curso.ofertas);
                /* Se alguma entrada tem ofertas reais, limpa o erro */
                if (curso.ofertas.length > 0) {
                    delete existente.erroOfertas;
                }
                /* Mantém a primeira URL válida encontrada */
                if (!existente.url && curso.url) {
                    existente.url = curso.url;
                }
            } else {
                indice.set(chave, {
                    curso: curso.curso,
                    codigoFT: curso.codigoFT,
                    unidades: [curso.unidade],
                    url: curso.url,
                    ofertas: [...curso.ofertas],
                    erroOfertas: curso.erroOfertas || undefined,
                });
            }
        }

        return Array.from(indice.values());
    }

    function montarLista(cursos, container, hoje) {
        const fragmento = document.createDocumentFragment();

        for (const curso of cursos) {
            const card = document.createElement('li');

            /* Nome do curso */
            const nomeCurso = document.createElement('span');
            nomeCurso.className = 'curso-nome';
            nomeCurso.textContent = curso.curso;

            /* Unidades */
            const nomeUnidade = document.createElement('span');
            nomeUnidade.className = 'curso-unidade';
            nomeUnidade.textContent = curso.unidades.join(', ');

            /* Horários e dias */
            const quadroInfo = document.createElement('div');
            quadroInfo.className = 'curso-info';
            preencherInfoHorarios(quadroInfo, curso);

            card.appendChild(nomeCurso);
            card.appendChild(nomeUnidade);
            card.appendChild(quadroInfo);

            /* Botão de inscrição */
            const botao = criarBotaoInscricao(curso, hoje);
            if (botao) {
                card.appendChild(botao);
            }

            fragmento.appendChild(card);
        }

        container.appendChild(fragmento);
    }

    function preencherInfoHorarios(container, curso) {
        const temOfertas = curso.ofertas && curso.ofertas.length > 0;
        const falhaNaBusca = curso.erroOfertas;

        if (temOfertas) {
            for (const oferta of curso.ofertas) {
                const texto = formatarHorario(oferta);
                if (texto) {
                    const linha = document.createElement('span');
                    linha.textContent = texto;
                    container.appendChild(linha);
                }
            }
            return;
        }

        if (falhaNaBusca) {
            const aviso = document.createElement('span');
            aviso.textContent = 'Turmas indisponíveis no momento';
            aviso.style.color = 'var(--cor-texto-fraco, #888)';
            container.appendChild(aviso);
        }
    }

    /*
     * Entrada  (bruto): "SEG - seg 8h ás 12, qua 8h ás 12h, sex 8h ás 12h"
     * Saída (formatado): "seg, qua, sex — 8h às 12h"
     *
     * Entrada  (simples): diasDaSemana="SEX" + horarios="Sex 13h30 às 17h30"
     * Saída   (formatado): "sex — 13h30 às 17h30"
     */
    function formatarHorario(oferta) {
        const diasBruto = oferta.diasDaSemana || '';
        const horarioBruto = oferta.horarios || '';

        if (!horarioBruto && !diasBruto) return '';

        /* Formato com vírgula indica múltiplos dias no mesmo campo */
        if (horarioBruto.includes(',')) {
            return formatarMultiDia(horarioBruto);
        }

        /* Formato simples: um dia + um horário */
        if (diasBruto && horarioBruto) {
            /*
             * Remove o dia repetido no início do horário.
             * Ex: diasDaSemana="TER" + horarios="Ter 8h às 12h" → "ter — 8h às 12h"
             */
            const horarioLimpo = horarioBruto
                .replace(new RegExp('^' + diasBruto + '\\s+', 'i'), '')
                .toLowerCase();
            return `${diasBruto.toLowerCase()} — ${horarioLimpo}`;
        }

        /* Caso só um dos campos esteja preenchido */
        if (diasBruto) return diasBruto.toLowerCase();
        if (horarioBruto) return horarioBruto.toLowerCase();
        return '';
    }

    /*
     * Exemplo de entrada: "SEG - seg 8h ás 12, qua 8h ás 12h, sex 8h ás 12h"
     * 1. Remove prefixo "SEG - "
     * 2. Quebra por vírgula: ["seg 8h ás 12", " qua 8h ás 12h", " sex 8h ás 12h"]
     * 3. De cada trecho, extrai o dia (1ª palavra) e o horário (resto)
     * 4. Agrupa todos os dias — assume que o horário se repete
     * 5. Formata: "seg, qua, sex — 8h às 12h"
     */
    function formatarMultiDia(horarioBruto) {
        /* Remove prefixo tipo "SEG - " */
        const semPrefixo = horarioBruto.replace(/^[A-Z]{3}\s*-\s*/i, '');

        /* Quebra em trechos: "seg 8h ás 12" , " qua 8h ás 12h" , " sex 8h ás 12h" */
        const trechos = semPrefixo.split(',');

        const diasAgrupados = [];
        let horarioPrincipal = '';

        for (const trecho of trechos) {
            const partes = trecho.trim().split(/\s+/);
            if (partes.length < 2) continue;

            /* Primeira palavra = dia, resto = horário */
            const dia = partes[0].toLowerCase().replace(/\.$/, ''); // remove ponto final se houver
            const horario = partes.slice(1).join(' ');

            diasAgrupados.push(dia);

            /* Guarda o primeiro horário encontrado como referência */
            if (!horarioPrincipal) {
                horarioPrincipal = horario;
            }
        }

        if (diasAgrupados.length === 0) return horarioBruto.toLowerCase();

        return `${diasAgrupados.join(', ')} — ${horarioPrincipal}`;
    }

    /*
     * Devolve um <a> ou <span> com classe .botao-inscricao.
     * - dataAberturaBolsa no futuro → estado "futuro", mostra "Inscrição em DD/MM"
     * - dataAberturaBolsa hoje ou passado → estado "ativo", link para o curso
     * - Sem data ou sem ofertas → null (não mostra botão)
     */
    function criarBotaoInscricao(curso, hoje) {
        if (!curso.ofertas || curso.ofertas.length === 0) return null;

        /* Procura a primeira oferta que tenha data de abertura da bolsa */
        let dataAbertura = null;
        for (const oferta of curso.ofertas) {
            if (oferta.dataAberturaBolsa) {
                dataAbertura = new Date(oferta.dataAberturaBolsa + 'T00:00:00');
                break;
            }
        }

        if (!dataAbertura) return null;

        const urlCurso = curso.url || '#';
        const tag = dataAbertura > hoje ? 'span' : 'a';
        const botao = document.createElement(tag);

        botao.className = 'botao-inscricao';

        if (dataAbertura > hoje) {
            botao.classList.add('futuro');
            botao.textContent = `Inscrição em ${formatarData(dataAbertura)}`;
            botao.setAttribute('role', 'button');
        } else {
            botao.classList.add('ativo');
            botao.textContent = 'Inscrever-se';
            botao.href = urlCurso;
            botao.target = '_blank';
            botao.rel = 'noopener';
        }

        return botao;
    }

    function formatarData(data) {
        const dia = String(data.getDate()).padStart(2, '0');
        const mes = String(data.getMonth() + 1).padStart(2, '0');
        return `${dia}/${mes}`;
    }
