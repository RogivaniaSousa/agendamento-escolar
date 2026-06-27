const db = require("../config/db");

async function listarAulas(req, res) {
  try {
    const [aulas] = await db.query("SELECT * FROM aulas ORDER BY id");
    res.json(aulas);
  } catch (erro) {
    console.log(erro);
    res.status(500).json({ erro: "Erro ao buscar aulas" });
  }
}

module.exports = { listarAulas };