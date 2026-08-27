const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const { URL } = require('url');

dotenv.config();

async function setup() {
  try {
    const fullUrl = process.env.DATABASE_URL;
    const dbUrl = new URL(fullUrl);
    
    // 1. Connect to MySQL server WITHOUT specifying a database first
    const connection = await mysql.createConnection({
      host: dbUrl.hostname,
      port: dbUrl.port || 3306,
      user: dbUrl.username,
      password: decodeURIComponent(dbUrl.password),
    });

    const dbName = dbUrl.pathname.substring(1);
    console.log(`Creating database ${dbName}...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
    await connection.query(`USE ${dbName}`);

    console.log('Creating tables...');
    
    // Users Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          full_name VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Profiles Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS profiles (
          user_id INT PRIMARY KEY,
          age INT,
          monthly_income DECIMAL(15, 2),
          monthly_expenses DECIMAL(15, 2),
          current_savings DECIMAL(15, 2),
          existing_loans DECIMAL(15, 2),
          risk_appetite ENUM('Low', 'Medium', 'High') DEFAULT 'Medium',
          financial_goals JSON,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Portfolio Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS portfolio (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT,
          asset_name VARCHAR(255),
          asset_value DECIMAL(15, 2),
          asset_color VARCHAR(50),
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Portfolio Holdings Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS portfolio_holdings (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT,
          holding_name VARCHAR(255),
          category VARCHAR(100),
          current_value DECIMAL(15, 2),
          buy_price DECIMAL(15, 2),
          quantity DECIMAL(15, 4),
          expense_ratio DECIMAL(5, 2),
          sector VARCHAR(100),
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    console.log('✅ DATABASE AND TABLES CREATED SUCCESSFULLY');
    await connection.end();
  } catch (err) {
    console.error('❌ SETUP ERROR:', err.message);
  }
}

setup();

// minor safe update 4
