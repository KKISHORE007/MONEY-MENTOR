const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const { URL } = require('url');

dotenv.config();

async function checkTables() {
  try {
    const dbUrl = new URL(process.env.DATABASE_URL);
    const connection = await mysql.createConnection({
      host: dbUrl.hostname,
      port: dbUrl.port || 3306,
      user: dbUrl.username,
      password: decodeURIComponent(dbUrl.password),
      database: dbUrl.pathname.substring(1),
    });

    console.log('Checking tables in database:', dbUrl.pathname.substring(1));
    const [rows] = await connection.query('SHOW TABLES');
    const tables = rows.map(row => Object.values(row)[0]);
    
    console.log('Found tables:', tables);
    
    const requiredTables = ['users', 'profiles', 'portfolio', 'portfolio_holdings'];
    const missingTables = requiredTables.filter(t => !tables.includes(t));
    
    if (missingTables.length === 0) {
      console.log('RESULT: YES, ALL TABLES CREATED');
    } else {
      console.log('RESULT: NO, MISSING TABLES:', missingTables.join(', '));
    }
    
    await connection.end();
  } catch (err) {
    console.error('ERROR:', err.message);
  }
}

checkTables();

// minor safe update 1
