const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'nikshan',
  database: process.env.POSTGRES_DB || 'Todo',
  port: 5432,
});

module.exports = pool;


