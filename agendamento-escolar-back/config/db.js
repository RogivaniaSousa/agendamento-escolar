const mysql = require("mysql2/promise");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false
  }
});

(async () => {
  try {
    const conn = await pool.getConnection();
    console.log("✅ Banco conectado com sucesso!");

    const [rows] = await conn.query("SELECT DATABASE() AS banco");
    console.log(rows);

    conn.release();
  } catch (err) {
    console.error("❌ ERRO NA CONEXÃO:");
    console.error(err);
  }
})();

module.exports = pool;