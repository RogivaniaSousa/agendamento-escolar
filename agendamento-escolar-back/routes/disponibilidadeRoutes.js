const express = require("express");
const router = express.Router();

const { verificarDisponibilidade } = require("../controllers/disponibilidadeController");

router.post("/", verificarDisponibilidade);

module.exports = router;