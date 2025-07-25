const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",          
  password: "nikshan",
  host: "localhost",
  port: 5432,
  database: "Todo"
});

module.exports = pool;
