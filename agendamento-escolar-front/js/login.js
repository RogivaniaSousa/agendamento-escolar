const formLogin = document.getElementById("formLogin");
const campoNome = document.getElementById("campoNome");
const botaoEnviar = document.getElementById("botaoEnviar");
const alternarModo = document.getElementById("alternarModo");
const subtitulo = document.getElementById("subtitulo");
const mensagem = document.getElementById("mensagem");

let modoCadastro = false;

alternarModo.addEventListener("click", () => {
  modoCadastro = !modoCadastro;

  campoNome.classList.toggle("oculto", !modoCadastro);

  botaoEnviar.textContent = modoCadastro ? "Cadastrar" : "Entrar";
  alternarModo.textContent = modoCadastro ? "Já tenho uma conta" : "Criar uma conta";
  subtitulo.textContent = modoCadastro
    ? "Crie sua conta de professor."
    : "Entre com sua conta de professor.";

  mensagem.textContent = "";
});

formLogin.addEventListener("submit", async (event) => {
  event.preventDefault();

  const nome = document.getElementById("nome").value;
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  try {
    if (modoCadastro) {
      const resposta = await fetch(`${API_URL}/cadastro/novo`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ nome, email, senha })
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        mensagem.style.color = "red";
        mensagem.textContent = dados.erro;
        return;
      }

      mensagem.style.color = "green";
      mensagem.textContent = "Cadastro realizado! Agora faça login.";

      modoCadastro = false;
      campoNome.classList.add("oculto");
      botaoEnviar.textContent = "Entrar";
      alternarModo.textContent = "Criar uma conta";
      subtitulo.textContent = "Entre com sua conta de professor.";
      formLogin.reset();
      return;
    }

    const resposta = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, senha })
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      mensagem.style.color = "red";
      mensagem.textContent = dados.erro;
      return;
    }

    sessionStorage.setItem("token", dados.token);
    sessionStorage.setItem("professor", JSON.stringify(dados.professor));

    window.location.href = "dashboard.html";
  } catch {
    mensagem.style.color = "red";
    mensagem.textContent = "Erro ao conectar com o servidor.";
  }
});