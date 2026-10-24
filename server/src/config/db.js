const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'bank_simulation',
  waitForConnections: true,
  connectionLimit: 15,
  queueLimit: 0,
  multipleStatements: true,
  decimalNumbers: true
};

let pool = null;
let isConnected = false;
let connectionError = null;

function getPool() {
  if (!pool) {
    pool = mysql.createPool(dbConfig);
  }
  return pool;
}

async function testConnection() {
  try {
    const currentPool = getPool();
    const connection = await currentPool.getConnection();
    await connection.ping();
    connection.release();
    isConnected = true;
    connectionError = null;
    return { success: true, message: 'Connected to MySQL database successfully.' };
  } catch (err) {
    isConnected = false;
    connectionError = err.message;
    return { success: false, error: err.message, code: err.code };
  }
}

async function checkAndAutoSeed() {
  try {
    const currentPool = getPool();
    // Check if users table exists and has rows
    const [tables] = await currentPool.query(`
      SELECT TABLE_NAME FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users'
    `, [dbConfig.database]);

    if (tables.length === 0) {
      console.log('📦 Database tables not found. Automatically running schema.sql and seed.sql...');
      await runSqlScripts();
      console.log('✅ Database schema and initial seed data applied successfully.');
    } else {
      const [rows] = await currentPool.query('SELECT COUNT(*) as count FROM users');
      if (rows[0].count === 0) {
        console.log('📦 Database tables found but empty. Running seed.sql...');
        const seedPath = path.resolve(__dirname, '../../../database/seed.sql');
        if (fs.existsSync(seedPath)) {
          const seedSql = fs.readFileSync(seedPath, 'utf8');
          await currentPool.query(seedSql);
          console.log('✅ Seed data applied.');
        }
      }
    }
  } catch (err) {
    console.warn('⚠️ Note during database auto-check:', err.message);
  }
}

async function runSqlScripts() {
  const currentPool = getPool();
  const schemaPath = path.resolve(__dirname, '../../../database/schema.sql');
  const seedPath = path.resolve(__dirname, '../../../database/seed.sql');

  if (fs.existsSync(schemaPath)) {
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    await currentPool.query(schemaSql);
  }
  if (fs.existsSync(seedPath)) {
    const seedSql = fs.readFileSync(seedPath, 'utf8');
    await currentPool.query(seedSql);
  }
}

function getDbStatus() {
  return {
    connected: isConnected,
    database: dbConfig.database,
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    error: connectionError
  };
}

module.exports = {
  getPool,
  testConnection,
  checkAndAutoSeed,
  runSqlScripts,
  getDbStatus,
  dbConfig
};
