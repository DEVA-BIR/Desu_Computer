const mysql = require("mysql2/promise");

const dbConfig = {
  connectionLimit: 10,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT),
};

const pool = mysql.createPool(dbConfig);

async function query(sql, params = []) {
  try {
    const [rows] = await pool.execute(sql, params);

    return rows;
  } catch (error) {
    console.error("=================================");
    console.error("DATABASE QUERY ERROR");
    console.error("SQL:", sql);
    console.error("PARAMS:", params);
    console.error("ERROR CODE:", error.code);
    console.error("ERROR MESSAGE:", error.message);
    console.error("=================================");

    throw error;
  }
}

module.exports = {
  query,
};