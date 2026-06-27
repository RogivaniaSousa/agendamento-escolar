const express = require("express");
const router = express.Router();

const { listarEquipamentos } = require("../controllers/equipamentoController");

router.get("/", listarEquipamentos);

module.exports = router;