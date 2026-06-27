const express = require("express");
const router = express.Router();

const {
  listarAgendamentos,
  criarAgendamento,
  cancelarAgendamento
} = require("../controllers/agendamentoController");

router.get("/", listarAgendamentos);
router.post("/", criarAgendamento);
router.delete("/:id", cancelarAgendamento);

module.exports = router;