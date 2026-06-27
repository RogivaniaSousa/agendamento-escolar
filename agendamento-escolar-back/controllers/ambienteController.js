const db = require("../config/db");

async function listarAmbientes(req, res) {
  try {
    const [ambientes] = await db.query("SELECT * FROM ambientes ORDER BY nome");
    res.json(ambientes);
  } catch (erro) {
  console.log(erro);
  res.status(500).json({ erro: "Erro ao buscar ambientes" });
}
}

module.exports = { listarAmbientes };