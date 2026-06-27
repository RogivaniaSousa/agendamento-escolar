const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("../routes/authRoutes");
const ambienteRoutes = require("../routes/ambienteRoutes");
const agendamentoRoutes = require("../routes/agendamentoRoutes");
const turmaRoutes = require("../routes/turmaRoutes");
const equipamentoRoutes = require("../routes/equipamentoRoutes");
const aulaRoutes = require("../routes/aulaRoutes");
const disponibilidadeRoutes = require("../routes/disponibilidadeRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ mensagem: "API funcionando!" });
});

app.use("/login", authRoutes);
app.use("/cadastro", authRoutes);
app.use("/ambientes", ambienteRoutes);
app.use("/agendamentos", agendamentoRoutes);
app.use("/turmas", turmaRoutes);
app.use("/equipamentos", equipamentoRoutes);
app.use("/aulas", aulaRoutes);
app.use("/disponibilidade", disponibilidadeRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});

module.exports = app;