/**
 * Script Verifikasi Setup iWare
 * Mengecek apakah semua konfigurasi sudah benar
 */

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Warna untuk console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'cyan');
}

async function verifySetup() {
  log('\n===========================================', 'blue');
  log('   VERIFIKASI SETUP iWare WAREHOUSE', 'blue');
  log('===========================================\n', 'blue');

  let allGood = true;

  // 1. Cek file .env
  logInfo('1. Mengecek file .env...');
  const envPath = path.join(__dirname, '..', '.env');
  
  if (!fs.existsSync(envPath)) {
    logError('File .env tidak ditemukan!');
    logWarning('Jalankan: cp .env.example .env');
    allGood = false;
  } else {
    logSuccess('File .env ditemukan');
    
    // Load .env
    require('dotenv').config({ path: envPath });
    
    // Cek variabel penting
    const requiredVars = ['DB_HOST', 'DB_USER', 'DB_NAME', 'JWT_SECRET'];
    let envComplete = true;
    
    for (const varName of requiredVars) {
      if (!process.env[varName]) {
        logError(`  Variabel ${varName} tidak ada di .env`);
        envComplete = false;
        allGood = false;
      }
    }
    
    if (envComplete) {
      logSuccess('Semua variabel .env lengkap');
      logInfo(`  DB_HOST: ${process.env.DB_HOST}`);
      logInfo(`  DB_USER: ${process.env.DB_USER}`);
      logInfo(`  DB_NAME: ${process.env.DB_NAME}`);
      logInfo(`  DB_PASSWORD: ${process.env.DB_PASSWORD ? '***' : '(kosong)'}`);
    }
  }

  console.log('');

  // 2. Cek koneksi database
  logInfo('2. Mengecek koneksi database...');
  
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'iware_warehouse'
    });

    logSuccess('Koneksi database berhasil');
    
    // 3. Cek tabel
    logInfo('\n3. Mengecek tabel database...');
    const [tables] = await connection.query('SHOW TABLES');
    const tableNames = tables.map(t => Object.values(t)[0]);
    
    const requiredTables = ['users', 'items', 'sales_orders', 'activity_logs'];
    let tablesComplete = true;
    
    for (const tableName of requiredTables) {
      if (tableNames.includes(tableName)) {
        logSuccess(`  Tabel ${tableName} ada`);
      } else {
        logError(`  Tabel ${tableName} tidak ditemukan`);
        tablesComplete = false;
        allGood = false;
      }
    }
    
    if (!tablesComplete) {
      logWarning('Jalankan file SETUP_LENGKAP.sql di phpMyAdmin');
    }

    // 4. Cek user superadmin
    logInfo('\n4. Mengecek user superadmin...');
    const [users] = await connection.query(
      'SELECT * FROM users WHERE email = ?',
      ['superadmin@iware.id']
    );

    if (users.length === 0) {
      logError('User superadmin tidak ditemukan!');
      logWarning('Jalankan file SETUP_LENGKAP.sql di phpMyAdmin');
      allGood = false;
    } else {
      const user = users[0];
      logSuccess('User superadmin ditemukan');
      logInfo(`  ID: ${user.id}`);
      logInfo(`  Nama: ${user.nama}`);
      logInfo(`  Email: ${user.email}`);
      logInfo(`  Role: ${user.role}`);
      logInfo(`  Status: ${user.status}`);
      
      // 5. Test password
      logInfo('\n5. Mengecek password superadmin...');
      const testPassword = 'jasad666';
      const passwordValid = await bcrypt.compare(testPassword, user.password);
      
      if (passwordValid) {
        logSuccess(`Password '${testPassword}' valid!`);
        logInfo('  Anda bisa login dengan:');
        logInfo(`  Email: ${user.email}`);
        logInfo(`  Password: ${testPassword}`);
      } else {
        logError(`Password '${testPassword}' tidak valid!`);
        logWarning('Password hash di database tidak sesuai');
        logWarning('Jalankan ulang SETUP_LENGKAP.sql');
        allGood = false;
      }
    }

    await connection.end();

  } catch (error) {
    logError('Gagal koneksi ke database!');
    logError(`Error: ${error.message}`);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      logWarning('Username atau password MySQL salah');
      logWarning('Cek DB_USER dan DB_PASSWORD di .env');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      logWarning(`Database '${process.env.DB_NAME}' tidak ditemukan`);
      logWarning('Jalankan SETUP_LENGKAP.sql di phpMyAdmin');
    }
    
    allGood = false;
  }

  // 6. Cek dependencies
  logInfo('\n6. Mengecek dependencies...');
  const packageJsonPath = path.join(__dirname, '..', 'package.json');
  
  if (fs.existsSync(packageJsonPath)) {
    logSuccess('package.json ditemukan');
    
    const nodeModulesPath = path.join(__dirname, '..', 'node_modules');
    if (fs.existsSync(nodeModulesPath)) {
      logSuccess('node_modules ditemukan');
    } else {
      logError('node_modules tidak ditemukan');
      logWarning('Jalankan: npm install');
      allGood = false;
    }
  }

  // Hasil akhir
  console.log('\n===========================================', 'blue');
  if (allGood) {
    logSuccess('SEMUA VERIFIKASI BERHASIL! ✨');
    log('===========================================\n', 'blue');
    
    logInfo('Langkah selanjutnya:');
    log('1. Jalankan backend: npm run dev', 'cyan');
    log('2. Jalankan frontend: cd ../frontend && npm run dev', 'cyan');
    log('3. Buka browser: http://localhost:3000', 'cyan');
    log('4. Login dengan:', 'cyan');
    log('   Email: superadmin@iware.id', 'cyan');
    log('   Password: jasad666\n', 'cyan');
  } else {
    logError('ADA MASALAH YANG PERLU DIPERBAIKI!');
    log('===========================================\n', 'blue');
    
    logWarning('Perbaiki masalah di atas, lalu jalankan lagi:');
    log('node scripts/verifySetup.js\n', 'yellow');
  }
}

// Jalankan verifikasi
verifySetup().catch(error => {
  logError('Error saat verifikasi:');
  console.error(error);
  process.exit(1);
});
