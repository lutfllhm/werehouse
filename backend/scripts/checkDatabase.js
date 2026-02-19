#!/usr/bin/env node

/**
 * Quick check database status
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`)
};

async function checkDatabase() {
  let connection;
  
  try {
    log.info('Checking database...\n');
    
    const config = {
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'iware_warehouse'
    };
    
    // Connect
    connection = await mysql.createConnection(config);
    log.success(`Connected to ${config.database} at ${config.host}`);
    
    // Check tables
    const [tables] = await connection.query('SHOW TABLES');
    
    if (tables.length === 0) {
      log.error('No tables found! Database is empty.');
      log.info('Run: npm run setup-interactive');
      process.exit(1);
    }
    
    log.success(`Found ${tables.length} tables:\n`);
    
    // Check each table
    for (const table of tables) {
      const tableName = Object.values(table)[0];
      const [rows] = await connection.query(`SELECT COUNT(*) as count FROM ${tableName}`);
      const count = rows[0].count;
      
      console.log(`  ${tableName.padEnd(20)} - ${count} rows`);
    }
    
    // Check users specifically
    console.log('');
    log.info('Checking users table...');
    
    const [users] = await connection.query('SELECT id, nama, email, role, status FROM users');
    
    if (users.length === 0) {
      log.warning('No users found!');
      log.info('Run: npm run fix-login');
    } else {
      log.success(`Found ${users.length} user(s):\n`);
      users.forEach(user => {
        console.log(`  ID: ${user.id}`);
        console.log(`  Nama: ${user.nama}`);
        console.log(`  Email: ${user.email}`);
        console.log(`  Role: ${user.role}`);
        console.log(`  Status: ${user.status}`);
        console.log('');
      });
    }
    
    log.success('Database check complete!');
    
  } catch (error) {
    log.error('Error checking database:');
    console.error(error.message);
    
    if (error.code === 'ECONNREFUSED') {
      log.error('\nMySQL not accessible. Check:');
      log.error('1. MySQL is running: systemctl status mysql');
      log.error('2. .env configuration is correct');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      log.error('\nAccess denied. Check .env credentials');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      log.error('\nDatabase does not exist!');
      log.error('Run: npm run setup-interactive');
    }
    
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkDatabase();
