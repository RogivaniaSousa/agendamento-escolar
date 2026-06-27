const express = require("express");
const router = express.Router();

const { listarAmbientes } = require("../controllers/ambienteController");

router.get("/", listarAmbientes);

module.exports = router;