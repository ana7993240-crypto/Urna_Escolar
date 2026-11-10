let votos = [0, 0, 0, 0, 0, 0, 0, 0];
let totalVotos = 0;
let codigoEleitorAtual = null;
let nomeEleitorAtual = null;

const formIdentificacao = document.getElementById("formIdentificacao");
const campoNome = document.getElementById("nomeAluno");
const campoCodigo = document.getElementById("codigoAluno");
const confirmacaoDados = document.getElementById("confirmacaoDados");
const nomeConferido = document.getElementById("nomeConferido");
const codigoConferido = document.getElementById("codigoConferido");
const botaoConfirmarIdentificacao = document.getElementById("confirmarIdentificacao");
const botaoEditarDados = document.getElementById("editarDados");
const etapaIdentificacao = document.getElementById("etapaIdentificacao");
const etapaVotacao = document.getElementById("etapaVotacao");
const formVotacao = document.getElementById("formVotacao");
const opcoesChapa = Array.from(document.querySelectorAll(".opcao-chapa"));
let numeroChapaSelecionada = null;
const mensagem = document.getElementById("mensagem");
const mensagemVoto = document.getElementById("mensagemVoto");
const estadoSistema = document.getElementById("estadoSistema");
const botaoNovoVoto = document.getElementById("novoVoto");
const botaoCorrigirChapa = document.getElementById("corrigirChapa");
const botaoCancelarVoto = document.getElementById("cancelarVoto");
const botaoConfirmarVoto = document.getElementById("confirmarVoto");

function atualizarEstado(texto) {
    estadoSistema.textContent = `Situação da urna: ${texto}`;
}

function atualizarResultados() {
    votos.forEach(function(valor, indice) {
        document.getElementById(`votos${indice + 1}`).textContent = valor;
    });
    document.getElementById("totalVotos").textContent = totalVotos;
}

function mostrarMensagem(elemento, texto, tipo = "informacao") {
    elemento.textContent = texto;
    elemento.dataset.tipo = tipo;
}

function marcarCampoInvalido(campo, elementoMensagem, texto) {
    campo.setAttribute("aria-invalid", "true");
    campo.classList.add("campo-invalido");
    mostrarMensagem(elementoMensagem, texto, "erro");
}

function limparErroCampo(campo) {
    campo.removeAttribute("aria-invalid");
    campo.classList.remove("campo-invalido");
}

campoNome.addEventListener("input", function() {
    if (campoNome.hasAttribute("aria-invalid")) {
        limparErroCampo(campoNome);
        mostrarMensagem(mensagem, "Digite o nome completo e confira o código de 7 caracteres.", "informacao");
    }
});

campoCodigo.addEventListener("input", function() {
    if (campoCodigo.hasAttribute("aria-invalid")) {
        limparErroCampo(campoCodigo);
        mostrarMensagem(mensagem, "Corrija o código usando exatamente 7 letras ou números, por exemplo AB12CD3.", "informacao");
    }
});

formIdentificacao.addEventListener("submit", function(event) {
    event.preventDefault();
    const nome = campoNome.value.trim().replace(/\s+/g, " ");
    const codigo = campoCodigo.value.trim().toUpperCase();

    if (nome.length < 3) {
        atualizarEstado("nome incompleto");
        marcarCampoInvalido(campoNome, mensagem, "Digite seu nome completo antes de conferir os dados.");
        campoNome.focus();
        return;
    }

    if (!/^[A-Z0-9]{7}$/.test(codigo)) {
        atualizarEstado("formato do código não reconhecido");
        marcarCampoInvalido(campoCodigo, mensagem, "Formato incorreto: digite exatamente 7 caracteres alfanuméricos, por exemplo AB12CD3. Apague o conteúdo e tente novamente.");
        campoCodigo.focus();
        campoCodigo.select();
        return;
    }

    limparErroCampo(campoNome);
    limparErroCampo(campoCodigo);
    codigoEleitorAtual = codigo;
    nomeEleitorAtual = nome;
    nomeConferido.textContent = nome;
    codigoConferido.textContent = codigo;
    confirmacaoDados.hidden = false;
    mostrarMensagem(mensagem, "Confira se nome e código estão corretos antes de confirmar.", "informacao");
    atualizarEstado("aguardando a confirmação dos dados do aluno");
    botaoConfirmarIdentificacao.focus();
});

botaoEditarDados.addEventListener("click", function() {
    confirmacaoDados.hidden = true;
    mostrarMensagem(mensagem, "Dados liberados para edição. Confira os caracteres do código.", "informacao");
    atualizarEstado("corrigindo os dados de identificação");
    campoCodigo.focus();
    campoCodigo.select();
});

botaoConfirmarIdentificacao.addEventListener("click", function() {
    confirmacaoDados.hidden = true;
    formIdentificacao.hidden = true;
    etapaVotacao.hidden = false;
    mostrarMensagem(mensagem, "", "informacao");
    mostrarMensagem(mensagemVoto, "", "informacao");
    botaoConfirmarVoto.disabled = true;
    botaoCorrigirChapa.disabled = false;
    botaoCancelarVoto.disabled = false;
    opcoesChapa.forEach(function(opcao) {
        opcao.disabled = false;
    });
    atualizarEstado(`dados confirmados; ${nomeEleitorAtual}, escolha uma chapa`);
    opcoesChapa[0].focus();
});

function selecionarChapa(opcao) {
    if (opcao.disabled) {
        return;
    }

    numeroChapaSelecionada = Number(opcao.dataset.numero);

    opcoesChapa.forEach(function(item) {
        item.classList.remove("selecionada");
        item.setAttribute("aria-pressed", "false");
    });

    opcao.classList.add("selecionada");
    opcao.setAttribute("aria-pressed", "true");
    botaoConfirmarVoto.disabled = false;
    mostrarMensagem(mensagemVoto, `Chapa ${numeroChapaSelecionada} selecionada: ${opcao.querySelector("span").textContent}. Confirme o voto para finalizar.`, "informacao");
}

opcoesChapa.forEach(function(opcao) {
    opcao.addEventListener("click", function() {
        selecionarChapa(opcao);
    });
});

formVotacao.addEventListener("submit", function(event) {
    event.preventDefault();

    if (botaoConfirmarVoto.disabled || numeroChapaSelecionada === null) {
        return;
    }

    const numeroChapa = numeroChapaSelecionada;
    if (!Number.isInteger(numeroChapa) || numeroChapa < 1 || numeroChapa > 8) {
        atualizarEstado("chapa selecionada não reconhecida");
        mostrarMensagem(mensagemVoto, "Seleção inválida. Selecione novamente uma das 8 chapas exibidas.", "erro");
        botaoCorrigirChapa.click();
        return;
    }

    const confirmou = window.confirm(`Confirma seu voto na chapa ${numeroChapa}? Esta ação não poderá ser desfeita.`);
    if (!confirmou) {
        atualizarEstado("confirmação do voto cancelada");
        mostrarMensagem(mensagemVoto, "Voto não registrado. Confira a chapa selecionada ou clique em Corrigir escolha para mudar.", "informacao");
        return;
    }

    votos[numeroChapa - 1]++;
    totalVotos++;

    const registros = JSON.parse(localStorage.getItem("votosUrnaEscolar") || "[]");
    registros.push({
        nome: nomeEleitorAtual,
        codigo: codigoEleitorAtual,
        votou: true,
        chapa: numeroChapa,
        dataHora: new Date().toISOString()
    });
    localStorage.setItem("votosUrnaEscolar", JSON.stringify(registros));

    atualizarResultados();

    atualizarEstado(`voto confirmado na chapa ${numeroChapa}`);
    mostrarMensagem(mensagemVoto, `Voto confirmado na chapa ${numeroChapa}.`, "sucesso");
    numeroChapaSelecionada = null;
    codigoEleitorAtual = null;
    nomeEleitorAtual = null;
    opcoesChapa.forEach(function(opcao) {
        opcao.disabled = true;
        opcao.classList.remove("selecionada");
    });
    botaoConfirmarVoto.disabled = true;
    botaoCorrigirChapa.disabled = true;
    botaoCancelarVoto.disabled = true;
    botaoNovoVoto.hidden = false;
    botaoNovoVoto.focus();
});

botaoNovoVoto.addEventListener("click", function() {
    etapaVotacao.hidden = true;
    etapaIdentificacao.hidden = false;
    formIdentificacao.hidden = false;
    confirmacaoDados.hidden = true;
    botaoNovoVoto.hidden = true;
    numeroChapaSelecionada = null;
    opcoesChapa.forEach(function(opcao) {
        opcao.disabled = false;
        opcao.classList.remove("selecionada");
        opcao.setAttribute("aria-pressed", "false");
    });
    botaoConfirmarVoto.disabled = true;
    campoNome.value = "";
    campoCodigo.value = "";
    limparErroCampo(campoNome);
    limparErroCampo(campoCodigo);
    mostrarMensagem(mensagem, "Voto concluído. Informe o nome e o código do próximo aluno.", "sucesso");
    atualizarEstado("pronta para o próximo aluno");
    campoCodigo.focus();
});

botaoCorrigirChapa.addEventListener("click", function() {
    numeroChapaSelecionada = null;
    botaoConfirmarVoto.disabled = true;
    opcoesChapa.forEach(function(opcao) {
        opcao.classList.remove("selecionada");
        opcao.setAttribute("aria-pressed", "false");
    });
    mostrarMensagem(mensagemVoto, "Seleção apagada. Escolha outra chapa.", "informacao");
    atualizarEstado("corrigindo a escolha da chapa");
    opcoesChapa[0].focus();
});

document.addEventListener("keydown", function(event) {
    if (etapaVotacao.hidden || event.altKey || event.ctrlKey || event.metaKey) {
        return;
    }

    if (/^[1-8]$/.test(event.key)) {
        event.preventDefault();
        selecionarChapa(opcoesChapa[Number(event.key) - 1]);
        opcoesChapa[Number(event.key) - 1].focus();
    } else if (event.key === "Escape") {
        event.preventDefault();
        botaoCorrigirChapa.click();
    } else if (event.key === "Enter" && numeroChapaSelecionada !== null && !botaoConfirmarVoto.disabled) {
        event.preventDefault();
        formVotacao.requestSubmit();
    }
});

botaoCancelarVoto.addEventListener("click", function() {
    codigoEleitorAtual = null;
    nomeEleitorAtual = null;
    numeroChapaSelecionada = null;
    opcoesChapa.forEach(function(opcao) {
        opcao.classList.remove("selecionada");
        opcao.setAttribute("aria-pressed", "false");
    });
    mostrarMensagem(mensagemVoto, "Votação cancelada. Nenhum voto foi registrado.", "informacao");
    etapaVotacao.hidden = true;
    etapaIdentificacao.hidden = false;
    formIdentificacao.hidden = false;
    confirmacaoDados.hidden = true;
    campoNome.value = "";
    campoCodigo.value = "";
    limparErroCampo(campoNome);
    limparErroCampo(campoCodigo);
    mostrarMensagem(mensagem, "Ação cancelada. Nenhum voto foi registrado para este aluno.", "informacao");
    atualizarEstado("votação cancelada; aguardando outro aluno");
    campoCodigo.focus();
});