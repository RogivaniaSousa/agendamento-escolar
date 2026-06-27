const db = require("../config/db");

async function listarAgendamentos(req, res) {
  try {
    const [agendamentos] = await db.query(`
      SELECT 
        a.id,
        p.nome AS professor,
        t.nome AS turma,
        s.nome AS sala,
        am.nome AS ambiente,
        a.data,
        a.disciplina,
        a.projetor,
        a.caixa_som,
        a.observacao,
        GROUP_CONCAT(au.nome ORDER BY au.id SEPARATOR ', ') AS aulas
      FROM agendamentos a
      INNER JOIN professores p ON p.id = a.professor_id
      INNER JOIN turmas t ON t.id = a.turma_id
      INNER JOIN salas s ON s.id = t.sala_id
      LEFT JOIN ambientes am ON am.id = a.ambiente_id
      INNER JOIN agendamento_aulas aa ON aa.agendamento_id = a.id
      INNER JOIN aulas au ON au.id = aa.aula_id
      GROUP BY a.id
      ORDER BY a.data DESC, a.id DESC
    `);

    res.json(agendamentos);
  } catch (erro) {
    console.log(erro);
    res.status(500).json({ erro: "Erro ao buscar agendamentos" });
  }
}

async function criarAgendamento(req, res) {
  const conexao = await db.getConnection();

  try {
    await conexao.beginTransaction();

    const {
      professor_id,
      turma_id,
      ambiente_id,
      data,
      disciplina,
      projetor,
      caixa_som,
      observacao,
      aulas
    } = req.body;

    if (!professor_id || !turma_id || !data || !disciplina || !aulas || aulas.length === 0) {
      return res.status(400).json({ erro: "Preencha todos os campos obrigatórios." });
    }

    if (!ambiente_id && !projetor && !caixa_som) {
      return res.status(400).json({ erro: "Selecione pelo menos um equipamento ou ambiente." });
    }

    if (ambiente_id) {
      const [conflitoAmbiente] = await conexao.query(
        `
        SELECT a.id FROM agendamentos a
        INNER JOIN agendamento_aulas aa ON aa.agendamento_id = a.id
        WHERE a.ambiente_id = ?
        AND a.data = ?
        AND aa.aula_id IN (?)
        `,
        [ambiente_id, data, aulas]
      );

      if (conflitoAmbiente.length > 0) {
        await conexao.rollback();
        return res.status(400).json({
          erro: "Esse ambiente já está agendado em uma das aulas selecionadas."
        });
      }
    }

    const [equipamentos] = await conexao.query("SELECT * FROM equipamentos");

    const qtdProjetor = equipamentos.find(e => e.nome === "Projetor")?.quantidade || 0;
    const qtdCaixaSom = equipamentos.find(e => e.nome === "Caixa de Som")?.quantidade || 0;

    if (projetor) {
      const [usados] = await conexao.query(
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

      const semProjetor = usados.some(item => item.total >= qtdProjetor);

      if (semProjetor) {
        await conexao.rollback();
        return res.status(400).json({
          erro: "Não há projetores disponíveis em uma das aulas selecionadas."
        });
      }
    }

    if (caixa_som) {
      const [usadas] = await conexao.query(
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

      const semCaixa = usadas.some(item => item.total >= qtdCaixaSom);

      if (semCaixa) {
        await conexao.rollback();
        return res.status(400).json({
          erro: "A caixa de som já está reservada em uma das aulas selecionadas."
        });
      }
    }

    const [resultado] = await conexao.query(
      `
      INSERT INTO agendamentos
      (professor_id, turma_id, ambiente_id, data, disciplina, projetor, caixa_som, observacao)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        professor_id,
        turma_id,
        ambiente_id || null,
        data,
        disciplina,
        projetor,
        caixa_som,
        observacao
      ]
    );

    const agendamentoId = resultado.insertId;

    for (const aulaId of aulas) {
      await conexao.query(
        "INSERT INTO agendamento_aulas (agendamento_id, aula_id) VALUES (?, ?)",
        [agendamentoId, aulaId]
      );
    }

    await conexao.commit();

    res.status(201).json({ mensagem: "Agendamento realizado com sucesso!" });
  } catch (erro) {
    await conexao.rollback();
    console.log(erro);
    res.status(500).json({ erro: "Erro ao criar agendamento" });
  } finally {
    conexao.release();
  }
}

async function cancelarAgendamento(req, res) {
  try {
    const { id } = req.params;

    await db.query("DELETE FROM agendamentos WHERE id = ?", [id]);

    res.json({ mensagem: "Agendamento cancelado com sucesso!" });
  } catch (erro) {
    console.log(erro);
    res.status(500).json({ erro: "Erro ao cancelar agendamento" });
  }
}

module.exports = {
  listarAgendamentos,
  criarAgendamento,
  cancelarAgendamento
};