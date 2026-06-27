const db = require("../config/db");

async function verificarDisponibilidade(req, res) {
  try {
    const { data, aulas } = req.body;

    if (!data || !aulas || aulas.length === 0) {
      return res.status(400).json({ erro: "Informe a data e as aulas." });
    }

    const [equipamentos] = await db.query("SELECT * FROM equipamentos");

    const qtdProjetor = equipamentos.find(e => e.nome === "Projetor")?.quantidade || 0;
    const qtdCaixaSom = equipamentos.find(e => e.nome === "Caixa de Som")?.quantidade || 0;

    const [projetoresUsados] = await db.query(
      `
      SELECT aa.aula_id, COUNT(*) AS total
      FROM agendamentos a
      INNER JOIN agendamento_aulas aa ON aa.agendamento_id = a.id
      WHERE a.projetor = true
      AND a.data = ?
      AND aa.aula_id IN (?)
      GROUP BY aa.aula_id
      `,
      [data, aulas]
    );

    const [caixasUsadas] = await db.query(
      `
      SELECT aa.aula_id, COUNT(*) AS total
      FROM agendamentos a
      INNER JOIN agendamento_aulas aa ON aa.agendamento_id = a.id
      WHERE a.caixa_som = true
      AND a.data = ?
      AND aa.aula_id IN (?)
      GROUP BY aa.aula_id
      `,
      [data, aulas]
    );

    const projetorDisponivel = !projetoresUsados.some(item => item.total >= qtdProjetor);
    const caixaSomDisponivel = !caixasUsadas.some(item => item.total >= qtdCaixaSom);

    const [ambientes] = await db.query("SELECT * FROM ambientes ORDER BY nome");

    const ambientesComStatus = [];

    for (const ambiente of ambientes) {
      const [ocupado] = await db.query(
        `
        SELECT a.id
        FROM agendamentos a
        INNER JOIN agendamento_aulas aa ON aa.agendamento_id = a.id
        WHERE a.ambiente_id = ?
        AND a.data = ?
        AND aa.aula_id IN (?)
        `,
        [ambiente.id, data, aulas]
      );

      ambientesComStatus.push({
        ...ambiente,
        disponivel: ocupado.length === 0
      });
    }

    res.json({
      projetor: projetorDisponivel,
      caixa_som: caixaSomDisponivel,
      ambientes: ambientesComStatus
    });
  } catch (erro) {
    console.log(erro);
    res.status(500).json({ erro: "Erro ao verificar disponibilidade." });
  }
}

module.exports = { verificarDisponibilidade };