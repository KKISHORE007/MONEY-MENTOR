const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const { URL } = require('url');

dotenv.config();

const dbUrl = new URL(process.env.DATABASE_URL);

const poolConfig = {
  host: dbUrl.hostname,
  port: dbUrl.port || 3306,
  user: dbUrl.username,
  password: decodeURIComponent(dbUrl.password),
  database: dbUrl.pathname.substring(1),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

const pool = mysql.createPool(poolConfig);

module.exports = pool;

// minor safe update 8
