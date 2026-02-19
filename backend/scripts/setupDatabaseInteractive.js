#!/usr/bin/env node

/**
 * Interactive Database Setup Script
 * Membantu setup database dengan input interaktif
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  header: (msg) => console.log(`\n${colors.cyan}${msg}${colors.reset}\n`)
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function setupDatabase() {
  try {
    log.header('=== iWare Database Setup ===');
    
    log.info('Script ini akan membantu Anda setup database MySQL');
    log.info('Pastikan MySQL sudah terinstall dan berjalan\n');
    
    // Get MySQL root credentials
    const mysqlHost = await question('MySQL Host [127.0.0.1]: ') || '127.0.0.1';
    const mysqlRootUser = await question('MySQL Root Username [root]: ') || 'root';
    const mysqlRootPass = await question('MySQL Root Password: ');
    
    log.info('\nMencoba koneksi ke MySQL...');
    
    // Connect as root
    let rootConnection;
    try {
      rootConnection = await mysql.createConnection({
        host: mysqlHost,
        user: mysqlRootUser,
        password: mysqlRootPass,
        multipleStatements: true
      });
      log.success('Koneksi ke MySQL berhasil!');
    } catch (error) {
      log.error('Gagal koneksi ke MySQL!');
      log.error(error.message);
      log.error('\nPastikan:');
      log.error('1. MySQL service berjalan: systemctl status mysql');
      log.error('2. Username dan password benar');
      log.error('3. Host benar (gunakan 127.0.0.1 bukan localhost)');
      process.exit(1);
    }
    
    // Database configuration
    log.header('Konfigurasi Database');
    const dbName = await question('Nama Database [iware_warehouse]: ') || 'iware_warehouse';
    const dbUser = await question('Database Username [iware_user]: ') || 'iware_user';
    const dbPass = await question('Database Password: ');
    
    if (!dbPass) {
      log.warning('Password kosong tidak direkomendasikan untuk production!');
      const confirm = await question('Lanjutkan dengan password kosong? (yes/no): ');
      if (confirm.toLowerCase() !== 'yes') {
        log.info('Setup dibatalkan');
        process.exit(0);
      }
    }
    
    // Create database
    log.info(`\nMembuat database: ${dbName}...`);
    try {
      await rootConnection.query(`CREATE DATABASE IF NOT EXISTS ${dbName} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
      log.success(`Database ${dbName} berhasil dibuat`);
    } catch (error) {
      log.warning(`Database mungkin sudah ada: ${error.message}`);
    }
    
    // Create user
    log.info(`Membuat user: ${dbUser}...`);
    try {
      await rootConnection.query(`CREATE USER IF NOT EXISTS '${dbUser}'@'localhost' IDENTIFIED BY '${dbPass}'`);
      await rootConnection.query(`GRANT ALL PRIVILEGES ON ${dbName}.* TO '${dbUser}'@'localhost'`);
      await rootConnection.query(`FLUSH PRIVILEGES`);
      log.success(`User ${dbUser} berhasil dibuat dan diberi akses`);
    } catch (error) {
      log.warning(`User mungkin sudah ada, update password...`);
      await rootConnection.query(`ALTER USER '${dbUser}'@'localhost' IDENTIFIED BY '${dbPass}'`);
      await rootConnection.query(`GRANT ALL PRIVILEGES ON ${dbName}.* TO '${dbUser}'@'localhost'`);
      await rootConnection.query(`FLUSH PRIVILEGES`);
      log.success('Password user berhasil diupdate');
    }
    
    await rootConnection.end();
    
    // Import schema
    log.header('Import Database Schema');
    const sqlFile = path.join(__dirname, '..', 'SETUP_LENGKAP.sql');
    
    if (!fs.existsSync(sqlFile)) {
      log.error(`File SQL tidak ditemukan: ${sqlFile}`);
      process.exit(1);
    }
    
    log.info('Membaca file SQL...');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    log.info('Koneksi ke database sebagai user baru...');
    const userConnection = await mysql.createConnection({
      host: mysqlHost,
      user: dbUser,
      password: dbPass,
      database: dbName,
      multipleStatements: true,
      charset: 'utf8mb4'
    });
    
    log.info('Mengeksekusi SQL statements...');
    
    // Split and execute statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement) {
        try {
          await userConnection.query(statement);
          successCount++;
          process.stdout.write(`\rProgress: ${i + 1}/${statements.length} (✓ ${successCount})`);
        } catch (err) {
          // Ignore expected errors
          if (!err.message.includes('already exists') && 
              !err.message.includes('Unknown table') &&
              !err.message.includes('Duplicate key') &&
              !err.message.includes('Unknown column')) {
            errorCount++;
            log.warning(`\nWarning pada statement ${i + 1}: ${err.message}`);
          }
        }
      }
    }
    
    console.log('');
    log.success('Database schema berhasil diimport!');
    
    // Verify
    const [tables] = await userConnection.query('SHOW TABLES');
    log.success(`Total ${tables.length} tabel berhasil dibuat`);
    
    await userConnection.end();
    
    // Update .env file
    log.header('Update File .env');
    const envPath = path.join(__dirname, '..', '.env');
    const envExamplePath = path.join(__dirname, '..', '.env.example');
    
    let envContent = '';
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    } else if (fs.existsSync(envExamplePath)) {
      envContent = fs.readFileSync(envExamplePath, 'utf8');
    }
    
    // Update database config in .env
    envContent = envContent
      .replace(/DB_HOST=.*/g, `DB_HOST=${mysqlHost}`)
      .replace(/DB_USER=.*/g, `DB_USER=${dbUser}`)
      .replace(/DB_PASSWORD=.*/g, `DB_PASSWORD=${dbPass}`)
      .replace(/DB_NAME=.*/g, `DB_NAME=${dbName}`);
    
    fs.writeFileSync(envPath, envContent);
    log.success('File .env berhasil diupdate!');
    
    // Summary
    log.header('=== Setup Selesai! ===');
    log.success('Database berhasil di-setup dengan konfigurasi:');
    console.log(`  Host: ${mysqlHost}`);
    console.log(`  Database: ${dbName}`);
    console.log(`  User: ${dbUser}`);
    console.log(`  Password: ${'*'.repeat(dbPass.length)}`);
    console.log('');
    log.info('Konfigurasi sudah disimpan di file .env');
    log.info('Anda bisa langsung menjalankan: npm start');
    
  } catch (error) {
    log.error('Error saat setup database:');
    console.error(error);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Run
setupDatabase();
