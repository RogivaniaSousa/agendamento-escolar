const express = require("express");
const router = express.Router();

const { listarTurmas } = require("../controllers/turmaController");

router.get("/", listarTurmas);

module.exports = router;