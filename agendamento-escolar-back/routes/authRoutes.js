const express = require("express");
const router = express.Router();

const { login, cadastrar } = require("../controllers/authController");

router.post("/", login);
router.post("/novo", cadastrar);

module.exports = router;