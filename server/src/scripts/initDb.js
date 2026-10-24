const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

async function init() {
  console.log('🔄 Initializing Apex Bank MySQL database...');

  const host = process.env.DB_HOST || 'localhost';
  const port = parseInt(process.env.DB_PORT, 10) || 3306;
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'bank_simulation';

  console.log(`Connecting to MySQL server at ${host}:${port} as ${user}...`);

  let connection;
  try {
    // Connect without selecting database first to ensure CREATE DATABASE works
    connection = await mysql.createConnection({
      host,
      port,
      user,
      password,
      multipleStatements: true
    });
    console.log('✅ Connected to MySQL server.');

    // 1. Run schema.sql
    const schemaPath = path.resolve(__dirname, '../../../database/schema.sql');
    console.log(`Reading schema from ${schemaPath}...`);
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    await connection.query(schemaSql);
    console.log('✅ Schema created successfully.');

    // 2. Run seed.sql
    const seedPath = path.resolve(__dirname, '../../../database/seed.sql');
    console.log(`Reading seed data from ${seedPath}...`);
    const seedSql = fs.readFileSync(seedPath, 'utf8');
    await connection.query(seedSql);
    console.log('✅ Seed data inserted successfully.');

    console.log(`🎉 Database ${database} is ready for Apex National Bank!`);
  } catch (err) {
    console.error('❌ Error initializing database:', err.message);
    if (err.code === 'ECONNREFUSED') {
      console.error('\n👉 MySQL server is not reachable on port ' + port + '.');
      console.error('Please ensure your MySQL service is running or open MySQL Workbench to verify connection parameters.');
    }
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

init();
