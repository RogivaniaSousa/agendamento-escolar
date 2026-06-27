const professor = JSON.parse(sessionStorage.getItem("professor"));
const token = sessionStorage.getItem("token");

if (!professor || !token) {
  window.location.href = "login.html";
}

document.getElementById("nomeProfessor").innerHTML = `Olá, ${professor.nome}`;

document.getElementById("sair").onclick = () => {
  sessionStorage.clear();
  window.location.href = "login.html";
};

async function carregarAmbientes() {
  try {
    const resposta = await fetch(`${API_URL}/ambientes`);
    const ambientes = await resposta.json();

    document.getElementById("qtdAmbientes").innerHTML = ambientes.length;

    let html = "";

    ambientes.forEach(a => {
      html += `
        <div class="item">
          <strong>${a.nome}</strong>
          <br>
          ${a.tipo}
        </div>
      `;
    });

    document.getElementById("listaAmbientes").innerHTML = html;
  } catch {
    document.getElementById("listaAmbientes").innerHTML =
      "<p>Erro ao carregar ambientes.</p>";
  }
}

async function carregarEquipamentos() {
  try {
    const resposta = await fetch(`${API_URL}/equipamentos`);
    const equipamentos = await resposta.json();

    equipamentos.forEach(e => {
      if (e.nome === "Projetor") {
        document.getElementById("qtdProjetores").innerHTML = e.quantidade;
      }

      if (e.nome === "Caixa de Som") {
        document.getElementById("qtdCaixas").innerHTML = e.quantidade;
      }
    });
  } catch {
    document.getElementById("qtdProjetores").innerHTML = "0";
    document.getElementById("qtdCaixas").innerHTML = "0";
  }
}

async function carregarAgendamentos() {
  try {
    const resposta = await fetch(`${API_URL}/agendamentos`);
    const agendamentos = await resposta.json();

    let html = "";

    if (agendamentos.length === 0) {
      html = "<p>Nenhum agendamento encontrado.</p>";
    } else {
      agendamentos.forEach(a => {
        html += `
          <div class="agendamento">
            <strong>${a.ambiente || "Sala da turma"}</strong>
            <br>
            <span>${a.turma} - ${a.sala}</span>
            <br>
            <span>${a.disciplina}</span>
            <br>
            <span>${formatarData(a.data)}</span>
            <br>
            <span>${a.aulas}</span>
            <br>
            <span>Projetor: ${a.projetor ? "Sim" : "Não"}</span>
            <br>
            <span>Caixa de som: ${a.caixa_som ? "Sim" : "Não"}</span>
            <br>
            <button onclick="cancelarAgendamento(${a.id})">Cancelar</button>
          </div>
        `;
      });
    }

    document.getElementById("listaAgendamentos").innerHTML = html;
  } catch {
    document.getElementById("listaAgendamentos").innerHTML =
      "<p>Erro ao carregar agendamentos.</p>";
  }
}

async function cancelarAgendamento(id) {
  const confirmar = confirm("Deseja cancelar este agendamento?");

  if (!confirmar) return;

  try {
    const resposta = await fetch(`${API_URL}/agendamentos/${id}`, {
      method: "DELETE"
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      alert(dados.erro);
      return;
    }

    alert("Agendamento cancelado com sucesso!");
    carregarAgendamentos();
  } catch {
    alert("Erro ao cancelar agendamento.");
  }
}

function formatarData(data) {
  return new Date(data).toLocaleDateString("pt-BR", {
    timeZone: "UTC"
  });
}

carregarAmbientes();
carregarEquipamentos();
carregarAgendamentos();