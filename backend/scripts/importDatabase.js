#!/usr/bin/env node

/**
 * Script untuk import database schema
 * Alternatif untuk npm run setup yang lebih robust
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
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

async function importDatabase() {
  let connection;
  
  try {
    log.info('Memulai import database...');
    
    // Konfigurasi koneksi - force IPv4
    const config = {
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'iware_warehouse',
      multipleStatements: true,
      charset: 'utf8mb4'
    };
    
    // Validasi konfigurasi
    log.info('Konfigurasi database:');
    log.info(`  Host: ${config.host}`);
    log.info(`  User: ${config.user}`);
    log.info(`  Database: ${config.database}`);
    log.info(`  Password: ${config.password ? '***' + config.password.slice(-3) : '(kosong)'}`);
    
    if (!config.password) {
      log.warning('Password database kosong!');
      log.warning('Jika Anda sudah set password MySQL, update file .env');
    }
    
    log.info(`Connecting to MySQL at ${config.host}...`);
    
    // Buat koneksi
    connection = await mysql.createConnection(config);
    log.success('Koneksi ke database berhasil');
    
    // Baca file SQL
    const sqlFile = path.join(__dirname, '..', 'SETUP_LENGKAP.sql');
    
    if (!fs.existsSync(sqlFile)) {
      throw new Error(`File SQL tidak ditemukan: ${sqlFile}`);
    }
    
    log.info('Membaca file SQL...');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    // Split SQL statements (handle multiple statements)
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    log.info(`Mengeksekusi ${statements.length} SQL statements...`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement) {
        try {
          await connection.query(statement);
          process.stdout.write(`\rProgress: ${i + 1}/${statements.length}`);
        } catch (err) {
          // Ignore errors for DROP TABLE IF EXISTS, etc.
          if (!err.message.includes('already exists') && 
              !err.message.includes('Unknown table')) {
            log.warning(`Warning pada statement ${i + 1}: ${err.message}`);
          }
        }
      }
    }
    
    console.log(''); // New line after progress
    log.success('Database schema berhasil diimport');
    
    // Verify tables
    const [tables] = await connection.query('SHOW TABLES');
    log.success(`Total ${tables.length} tabel berhasil dibuat:`);
    tables.forEach(table => {
      const tableName = Object.values(table)[0];
      console.log(`  - ${tableName}`);
    });
    
    // Check if superadmin exists
    const [users] = await connection.query(
      'SELECT username, role FROM users WHERE role = "superadmin"'
    );
    
    if (users.length > 0) {
      log.success(`User superadmin ditemukan: ${users[0].username}`);
    } else {
      log.warning('User superadmin tidak ditemukan. Jalankan: npm run fix-login');
    }
    
    log.success('Import database selesai!');
    
  } catch (error) {
    log.error('Error saat import database:');
    console.error(error.message);
    
    if (error.code === 'ECONNREFUSED') {
      log.error('');
      log.error('MySQL tidak bisa diakses. Pastikan:');
      log.error('1. MySQL service berjalan: systemctl status mysql');
      log.error('2. DB_HOST di .env menggunakan 127.0.0.1 bukan localhost');
      log.error('3. Credentials di .env sudah benar');
      log.error('4. Database sudah dibuat: CREATE DATABASE iware_warehouse;');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      log.error('');
      log.error('Access denied. Pastikan:');
      log.error('1. Username dan password di .env sudah benar');
      log.error('2. User memiliki akses ke database');
      log.error('3. Test dengan: mysql -u USER -p -h 127.0.0.1 DATABASE');
    }
    
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run
importDatabase();
