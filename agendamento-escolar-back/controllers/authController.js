const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

async function login(req, res) {
  try {
    const { email, senha } = req.body;

    const [professores] = await db.query(
      "SELECT * FROM professores WHERE email = ?",
      [email]
    );

    if (professores.length === 0) {
      return res.status(401).json({ erro: "E-mail ou senha inválidos." });
    }

    const professor = professores[0];

    let senhaCorreta = false;

    if (professor.senha.startsWith("$2a$") || professor.senha.startsWith("$2b$")) {
      senhaCorreta = await bcrypt.compare(senha, professor.senha);
    } else {
      senhaCorreta = senha === professor.senha;
    }

    if (!senhaCorreta) {
      return res.status(401).json({ erro: "E-mail ou senha inválidos." });
    }

    const token = jwt.sign(
      { id: professor.id, nome: professor.nome, email: professor.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      mensagem: "Login realizado com sucesso.",
      token,
      professor: {
        id: professor.id,
        nome: professor.nome,
        email: professor.email
      }
    });
  } catch (erro) {
    console.log(erro);
    res.status(500).json({ erro: "Erro no login." });
  }
}

async function cadastrar(req, res) {
  try {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({ erro: "Preencha todos os campos." });
    }

    const [existe] = await db.query(
      "SELECT id FROM professores WHERE email = ?",
      [email]
    );

    if (existe.length > 0) {
      return res.status(400).json({ erro: "Este e-mail já está cadastrado." });
    }

    const senhaCriptografada = await bcrypt.hash(senha, 10);

    await db.query(
      "INSERT INTO professores (nome, email, senha) VALUES (?, ?, ?)",
      [nome, email, senhaCriptografada]
    );

    res.status(201).json({ mensagem: "Cadastro realizado com sucesso." });
  } catch (erro) {
    console.log(erro);
    res.status(500).json({ erro: "Erro ao cadastrar professor." });
  }
}

module.exports = { login, cadastrar };