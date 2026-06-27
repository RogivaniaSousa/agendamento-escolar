const professor = JSON.parse(sessionStorage.getItem("professor"));
const token = sessionStorage.getItem("token");

if (!professor || !token) {
  window.location.href = "login.html";
}

const tipoAgendamento = document.getElementById("tipoAgendamento");
const campoAmbiente = document.getElementById("campoAmbiente");
const selectTurma = document.getElementById("turma");
const selectAmbiente = document.getElementById("ambiente");
const salaTurma = document.getElementById("salaTurma");
const listaAulas = document.getElementById("listaAulas");
const dataInput = document.getElementById("data");

const projetor = document.getElementById("projetor");
const caixaSom = document.getElementById("caixaSom");
const cardProjetor = document.getElementById("cardProjetor");
const cardCaixaSom = document.getElementById("cardCaixaSom");
const statusProjetor = document.getElementById("statusProjetor");
const statusCaixaSom = document.getElementById("statusCaixaSom");
const avisoDisponibilidade = document.getElementById("avisoDisponibilidade");

const form = document.getElementById("formAgendamento");
const mensagem = document.getElementById("mensagem");

let turmas = [];
let ambientesOriginais = [];

tipoAgendamento.addEventListener("change", () => {
  campoAmbiente.classList.toggle("oculto", tipoAgendamento.value !== "ambiente");
  verificarDisponibilidade();
});

selectTurma.addEventListener("change", () => {
  const turma = turmas.find(t => t.id == selectTurma.value);
  salaTurma.textContent = turma ? `Sala da turma: ${turma.sala}` : "";
});

dataInput.addEventListener("change", verificarDisponibilidade);

function pegarAulasSelecionadas() {
  const checks = document.querySelectorAll(".aula-check:checked");
  return Array.from(checks).map(check => Number(check.value));
}

async function carregarTurmas() {
  const resposta = await fetch(`${API_URL}/turmas`);
  turmas = await resposta.json();

  selectTurma.innerHTML = `<option value="">Selecione uma turma</option>`;

  turmas.forEach(turma => {
    selectTurma.innerHTML += `<option value="${turma.id}">${turma.nome}</option>`;
  });
}

async function carregarAmbientes() {
  const resposta = await fetch(`${API_URL}/ambientes`);
  ambientesOriginais = await resposta.json();

  renderizarAmbientes(ambientesOriginais.map(a => ({ ...a, disponivel: true })));
}

function renderizarAmbientes(ambientes) {
  selectAmbiente.innerHTML = `<option value="">Selecione um ambiente</option>`;

  ambientes.forEach(ambiente => {
    selectAmbiente.innerHTML += `
      <option value="${ambiente.id}" ${ambiente.disponivel ? "" : "disabled"}>
        ${ambiente.nome} ${ambiente.disponivel ? "" : "(Indisponível)"}
      </option>
    `;
  });
}

async function carregarAulas() {
  const resposta = await fetch(`${API_URL}/aulas`);
  const aulas = await resposta.json();

  listaAulas.innerHTML = "";

  aulas.forEach(aula => {
    listaAulas.innerHTML += `
      <label class="aula-card">
        <input type="checkbox" value="${aula.id}" class="aula-check">
        ${aula.nome}
      </label>
    `;
  });

  document.querySelectorAll(".aula-check").forEach(check => {
    check.addEventListener("change", verificarDisponibilidade);
  });
}

function atualizarStatusEquipamento(elemento, card, status, disponivel, textoDisponivel, textoIndisponivel) {
  elemento.disabled = !disponivel;

  if (!disponivel) {
    elemento.checked = false;
    card.classList.add("indisponivel");
    status.textContent = textoIndisponivel;
  } else {
    card.classList.remove("indisponivel");
    status.textContent = textoDisponivel;
  }
}

async function verificarDisponibilidade() {
  const data = dataInput.value;
  const aulas = pegarAulasSelecionadas();

  if (!data || aulas.length === 0) {
    avisoDisponibilidade.classList.add("oculto");
    renderizarAmbientes(ambientesOriginais.map(a => ({ ...a, disponivel: true })));

    atualizarStatusEquipamento(
      projetor,
      cardProjetor,
      statusProjetor,
      true,
      "Disponível",
      "Indisponível"
    );

    atualizarStatusEquipamento(
      caixaSom,
      cardCaixaSom,
      statusCaixaSom,
      true,
      "Disponível",
      "Indisponível"
    );

    return;
  }

  try {
    const resposta = await fetch(`${API_URL}/disponibilidade`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ data, aulas })
    });

    const dados = await resposta.json();

    if (!resposta.ok) return;

    atualizarStatusEquipamento(
      projetor,
      cardProjetor,
      statusProjetor,
      dados.projetor,
      "Disponível",
      "Indisponível nas aulas selecionadas"
    );

    atualizarStatusEquipamento(
      caixaSom,
      cardCaixaSom,
      statusCaixaSom,
      dados.caixa_som,
      "Disponível",
      "Indisponível nas aulas selecionadas"
    );

    renderizarAmbientes(dados.ambientes);

    avisoDisponibilidade.classList.remove("oculto");
    avisoDisponibilidade.textContent =
      "Disponibilidade atualizada para a data e aulas escolhidas.";
  } catch {
    avisoDisponibilidade.classList.remove("oculto");
    avisoDisponibilidade.textContent =
      "Não foi possível verificar a disponibilidade.";
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const tipo = tipoAgendamento.value;
  const turma_id = selectTurma.value;
  const ambiente_id = tipo === "ambiente" ? selectAmbiente.value : null;
  const data = dataInput.value;
  const disciplina = document.getElementById("disciplina").value;
  const observacao = document.getElementById("observacao").value;
  const aulas = pegarAulasSelecionadas();

  if (tipo === "ambiente" && !ambiente_id) {
    mensagem.style.color = "red";
    mensagem.textContent = "Selecione um ambiente disponível.";
    return;
  }

  if (aulas.length === 0) {
    mensagem.style.color = "red";
    mensagem.textContent = "Selecione pelo menos uma aula.";
    return;
  }

  if (tipo === "equipamento" && !projetor.checked && !caixaSom.checked) {
    mensagem.style.color = "red";
    mensagem.textContent = "Selecione pelo menos um equipamento.";
    return;
  }

  try {
    const resposta = await fetch(`${API_URL}/agendamentos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        professor_id: professor.id,
        turma_id,
        ambiente_id,
        data,
        disciplina,
        projetor: projetor.checked,
        caixa_som: caixaSom.checked,
        observacao,
        aulas
      })
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      mensagem.style.color = "red";
      mensagem.textContent = dados.erro;
      return;
    }

    mensagem.style.color = "green";
    mensagem.textContent = "Agendamento realizado com sucesso!";

    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 1200);
  } catch {
    mensagem.style.color = "red";
    mensagem.textContent = "Erro ao conectar com o servidor.";
  }
});

carregarTurmas();
carregarAmbientes();
carregarAulas();