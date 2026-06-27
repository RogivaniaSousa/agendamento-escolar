const db = require("../config/db");

async function listarEquipamentos(req, res) {
  try {
    const [equipamentos] = await db.query("SELECT * FROM equipamentos");
    res.json(equipamentos);
  } catch (erro) {
    console.log(erro);
    res.status(500).json({ erro: "Erro ao buscar equipamentos" });
  }
}

module.exports = { listarEquipamentos };