/**
 * Script Test Login
 * Test kredensial login secara otomatis
 */

const axios = require('axios');

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

function logInfo(message) {
  log(`ℹ️  ${message}`, 'cyan');
}

async function testLogin() {
  log('\n===========================================', 'blue');
  log('        TEST LOGIN iWare WAREHOUSE', 'blue');
  log('===========================================\n', 'blue');

  // Kredensial yang akan ditest
  const credentials = {
    email: 'superadmin@iware.id',
    password: 'jasad666'
  };

  logInfo('Kredensial yang ditest:');
  log(`  Email    : ${credentials.email}`, 'cyan');
  log(`  Password : ${credentials.password}`, 'cyan');
  console.log('');

  // URL backend
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
  const loginUrl = `${backendUrl}/api/auth/login`;

  logInfo(`Mengirim request ke: ${loginUrl}`);
  console.log('');

  try {
    // Cek apakah backend jalan
    logInfo('1. Mengecek apakah backend jalan...');
    try {
      await axios.get(backendUrl, { timeout: 3000 });
      logSuccess('Backend jalan!');
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        logError('Backend tidak jalan!');
        log('', 'yellow');
        log('Jalankan backend terlebih dahulu:', 'yellow');
        log('  cd backend', 'yellow');
        log('  npm run dev', 'yellow');
        log('', 'yellow');
        process.exit(1);
      }
    }

    console.log('');

    // Test login
    logInfo('2. Mencoba login...');
    
    const response = await axios.post(loginUrl, credentials, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 5000
    });

    console.log('');

    // Cek response
    if (response.data.sukses) {
      logSuccess('LOGIN BERHASIL! 🎉');
      console.log('');
      
      logInfo('Response dari server:');
      log(`  Status  : ${response.data.sukses ? 'Sukses' : 'Gagal'}`, 'cyan');
      log(`  Pesan   : ${response.data.pesan}`, 'cyan');
      
      if (response.data.data) {
        console.log('');
        logInfo('Data User:');
        log(`  ID      : ${response.data.data.user.id}`, 'cyan');
        log(`  Nama    : ${response.data.data.user.nama}`, 'cyan');
        log(`  Email   : ${response.data.data.user.email}`, 'cyan');
        log(`  Role    : ${response.data.data.user.role}`, 'cyan');
        
        console.log('');
        logInfo('JWT Token:');
        const token = response.data.data.token;
        log(`  ${token.substring(0, 50)}...`, 'cyan');
        log(`  (Total ${token.length} karakter)`, 'cyan');
      }

      console.log('');
      log('===========================================', 'blue');
      logSuccess('KREDENSIAL VALID! ✨');
      log('===========================================\n', 'blue');
      
      logInfo('Anda bisa login ke aplikasi dengan:');
      log(`  URL      : http://localhost:3000`, 'cyan');
      log(`  Email    : ${credentials.email}`, 'cyan');
      log(`  Password : ${credentials.password}`, 'cyan');
      console.log('');

    } else {
      logError('Login gagal!');
      log(`Pesan: ${response.data.pesan}`, 'red');
    }

  } catch (error) {
    console.log('');
    logError('LOGIN GAGAL!');
    console.log('');

    if (error.response) {
      // Server merespon dengan error
      const status = error.response.status;
      const data = error.response.data;

      logInfo('Response dari server:');
      log(`  Status Code : ${status}`, 'red');
      log(`  Pesan       : ${data.pesan || 'Tidak ada pesan'}`, 'red');
      
      console.log('');

      if (status === 401) {
        log('===========================================', 'yellow');
        log('  KEMUNGKINAN PENYEBAB:', 'yellow');
        log('===========================================', 'yellow');
        log('1. Email atau password salah', 'yellow');
        log('2. User belum ada di database', 'yellow');
        log('3. Password hash di database tidak sesuai', 'yellow');
        console.log('');
        log('SOLUSI:', 'yellow');
        log('1. Jalankan ulang: backend/SETUP_LENGKAP.sql', 'yellow');
        log('2. Pastikan email: superadmin@iware.id', 'yellow');
        log('3. Pastikan password: jasad666', 'yellow');
        log('4. Restart backend: npm run dev', 'yellow');
        console.log('');
      } else if (status === 500) {
        log('===========================================', 'yellow');
        log('  KEMUNGKINAN PENYEBAB:', 'yellow');
        log('===========================================', 'yellow');
        log('1. Database tidak terhubung', 'yellow');
        log('2. Tabel users tidak ada', 'yellow');
        log('3. Error di backend', 'yellow');
        console.log('');
        log('SOLUSI:', 'yellow');
        log('1. Cek log backend di terminal', 'yellow');
        log('2. Jalankan: npm run verify', 'yellow');
        log('3. Cek file .env', 'yellow');
        console.log('');
      }

    } else if (error.request) {
      // Request dikirim tapi tidak ada response
      logError('Tidak ada response dari server!');
      console.log('');
      log('KEMUNGKINAN PENYEBAB:', 'yellow');
      log('- Backend tidak jalan', 'yellow');
      log('- Port 5000 tidak bisa diakses', 'yellow');
      log('- Firewall memblokir koneksi', 'yellow');
      console.log('');
      log('SOLUSI:', 'yellow');
      log('1. Pastikan backend jalan: npm run dev', 'yellow');
      log('2. Cek apakah port 5000 tersedia', 'yellow');
      console.log('');

    } else {
      // Error lainnya
      logError(`Error: ${error.message}`);
    }

    log('===========================================\n', 'blue');
    process.exit(1);
  }
}

// Jalankan test
testLogin().catch(error => {
  logError('Error saat test login:');
  console.error(error);
  process.exit(1);
});
