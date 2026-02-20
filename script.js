// Controle de pedidos por dia
const hoje = new Date().toLocaleDateString();

let dataSalva = localStorage.getItem("dataPedidos");
let numeroPedido = localStorage.getItem("numeroPedido");

if (dataSalva !== hoje) {
    numeroPedido = 1;
    localStorage.setItem("dataPedidos", hoje);
    localStorage.setItem("numeroPedido", numeroPedido);
} else {
    numeroPedido = numeroPedido ? parseInt(numeroPedido) : 1;
}

const espetos = [
    { nome: "Carne", preco: 10 },
    { nome: "Medalhão de Frango", preco: 10 },
    { nome: "Coração", preco: 10 },
    { nome: "Costela", preco: 10 },
    { nome: "Linguiça com Pimenta", preco: 8 },
    { nome: "Linguiça Tradicional", preco: 8 },
    { nome: "Pão de Alho", preco: 8 },
    { nome: "Queijo", preco: 10 },
    { nome: "Mandioca", preco: 4 },
    { nome: "Baguete", preco: 18 }
];

const porcoes = [
    { nome: "Porção de Peixe (500g)", preco: 45 }
];

const precoJantinha = 25;

let carrinho = {};
let jantinhas = [];

[...espetos, ...porcoes].forEach(item => {
    carrinho[item.nome] = 0;
});

function gerarId(nome) {
    return nome.replace(/\s+/g, '').normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function criarCard(item, containerId) {
    const container = document.getElementById(containerId);
    const id = gerarId(item.nome);

    container.innerHTML += `
        <div class="item">
            <div>
                <strong>${item.nome}</strong>
                <p>R$ ${item.preco.toFixed(2)}</p>
            </div>

            <div class="controls">
                <button onclick="alterarQuantidade('${item.nome}', -1)">-</button>
                <span id="${id}">0</span>
                <button onclick="alterarQuantidade('${item.nome}', 1)">+</button>
            </div>
        </div>
    `;
}

espetos.forEach(item => criarCard(item, "menu"));
porcoes.forEach(item => criarCard(item, "porcoes"));

function alterarQuantidade(nome, valor) {
    carrinho[nome] += valor;

    if (carrinho[nome] < 0) {
        carrinho[nome] = 0;
    }

    document.getElementById(gerarId(nome)).innerText = carrinho[nome];
    atualizarTotal();
}

function adicionarJantinha() {
    jantinhas.push("");

    atualizarJantinhas();
    atualizarTotal();
}

function removerJantinha(index) {
    jantinhas.splice(index, 1);
    atualizarJantinhas();
    atualizarTotal();
}

function atualizarJantinhas() {
    const container = document.getElementById("jantinha-container");

    let html = `
        <div class="item">
            <div>
                <strong>Jantinha</strong>
                <p>R$ ${precoJantinha.toFixed(2)}</p>
                <p class="descricao">
                    Acompanha: arroz, salada, mandioca, farofa, molho + 1 espeto incluso.
                </p>
                <button class="btn-jantinha" onclick="adicionarJantinha()">+ Adicionar Jantinha</button>

            </div>
        </div>
    `;

    jantinhas.forEach((espeto, index) => {
        html += `
            <div class="jantinha-box">
                <strong>Jantinha ${index + 1}</strong>
                <select onchange="jantinhas[${index}] = this.value; atualizarTotal();">
                    <option value="">Selecione o espeto</option>
                    ${espetos.map(e => `<option value="${e.nome}" ${e.nome === espeto ? "selected" : ""}>${e.nome}</option>`).join("")}
                </select>
                <button class="btn-remover" onclick="removerJantinha(${index})">Remover</button>
            </div>
        `;
    });

    container.innerHTML = html;
}

atualizarJantinhas();

function atualizarTotal() {
    let total = 0;

    [...espetos, ...porcoes].forEach(item => {
        total += carrinho[item.nome] * item.preco;
    });

    total += jantinhas.length * precoJantinha;

    document.getElementById("total").innerText = total.toFixed(2);
}

function enviarPedido() {

    const nome = document.getElementById("nome").value.trim();
    const mesa = document.getElementById("mesa").value.trim();
    const endereco = document.getElementById("endereco").value.trim();

    if (nome === "" || mesa === "") {
        alert("Insira o nome e número da mesa por favor.");
        return;
    }

    if (jantinhas.some(j => j === "")) {
        alert("Escolha o espeto de todas as jantinhas.");
        return;
    }

    let mensagem = `Pedido Nº ${numeroPedido}\n\n`;
    mensagem += `Olá, gostaria de fazer meu pedido:\n\n`;

    for (let item in carrinho) {
        if (carrinho[item] > 0) {
            mensagem += `${item} x${carrinho[item]}\n`;
        }
    }

    jantinhas.forEach((espeto, index) => {
        mensagem += `Jantinha ${index + 1} (Espeto: ${espeto})\n`;
    });

    mensagem += `\nNome: ${nome}`;
    mensagem += `\nMesa: ${mesa}`;

    if (endereco !== "") {
        mensagem += `\nEndereço: ${endereco}`;
    }

    mensagem += `\n\nTotal: R$ ${document.getElementById("total").innerText}`;

    const numeroWhatsApp = "5518991645859";
    const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensagem)}`;

    window.open(url, "_blank");

    numeroPedido++;
    localStorage.setItem("numeroPedido", numeroPedido);

    for (let item in carrinho) {
        carrinho[item] = 0;
        document.getElementById(gerarId(item)).innerText = 0;
    }

    jantinhas = [];
    atualizarJantinhas();
    atualizarTotal();

    document.getElementById("nome").value = "";
    document.getElementById("mesa").value = "";
    document.getElementById("endereco").value = "";
}


