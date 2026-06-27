const express = require("express");
const router = express.Router();

const { listarAulas } = require("../controllers/aulaController");

router.get("/", listarAulas);

module.exports = router;