'use strict'

const fs = require('fs'); // Módulo nativo do Node para salvar arquivos
const { log } = require('console');
const axios = require('axios');

async function buscarCurso(id) {
    try {
        // A URL que você descobriu
        const url = `https://www.sp.senac.br/o/senac-unidade-services/.../${id}`;
        const resposta = await axios.get(url);
        
        // Aqui você acessa os dados
        const dadosCurso = resposta.data;
        console.log(`Sucesso! Curso capturado: ${dadosCurso.title}`);
        return dadosCurso;
    } catch (erro) {
        console.error("Erro ao buscar API:", erro.message);
    }
}

