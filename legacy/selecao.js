'use strict'

const checkboxes = document.querySelectorAll('#lista-checkboxes input[type="checkbox"]')

checkboxes.forEach(cb => {
    cb.addEventListener('change', () => {
        const selecionadas = coletarUnidadesSelecionadas();
        console.log(selecionadas);
    });
});

function coletarUnidadesSelecionadas(){
    const unidadesSelecionadas = document.querySelectorAll("#lista-checkboxes input[type='checkbox']:checked")
    return Array.from(unidadesSelecionadas).map(cb => cb.value);
};

