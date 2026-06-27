const db = require("../config/db");

async function listarTurmas(req, res) {
  try {
    const [turmas] = await db.query(`
      SELECT 
        t.id,
        t.nome,
        s.nome AS sala
      FROM turmas t
      INNER JOIN salas s ON s.id = t.sala_id
      ORDER BY t.id
    `);

    res.json(turmas);
  } catch (erro) {
    console.log(erro);
    res.status(500).json({ erro: "Erro ao buscar turmas" });
  }
}

module.exports = { listarTurmas };