const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function fixLogin() {
  let connection;
  
  try {
    console.log('\n🔧 iWare Login Fix Tool\n');
    console.log('=================================\n');

    // Koneksi ke database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'iware_warehouse'
    });

    console.log('✅ Terhubung ke database\n');

    // Cek apakah user superadmin ada
    const [users] = await connection.query(
      'SELECT * FROM users WHERE email = ?',
      ['superadmin@iware.id']
    );

    if (users.length === 0) {
      console.log('❌ User superadmin tidak ditemukan!');
      console.log('📝 Membuat user superadmin baru...\n');

      // Generate hash untuk password jasad666
      const hashedPassword = await bcrypt.hash('jasad666', 10);

      await connection.query(
        `INSERT INTO users (nama, email, password, role, status) 
         VALUES (?, ?, ?, ?, ?)`,
        ['Super Admin', 'superadmin@iware.id', hashedPassword, 'superadmin', 'aktif']
      );

      console.log('✅ User superadmin berhasil dibuat!\n');
    } else {
      console.log('✅ User superadmin ditemukan');
      console.log(`   ID: ${users[0].id}`);
      console.log(`   Nama: ${users[0].nama}`);
      console.log(`   Email: ${users[0].email}`);
      console.log(`   Role: ${users[0].role}`);
      console.log(`   Status: ${users[0].status}\n`);

      // Update password dengan hash yang benar
      console.log('🔄 Mengupdate password...\n');
      const hashedPassword = await bcrypt.hash('jasad666', 10);

      await connection.query(
        'UPDATE users SET password = ?, status = ? WHERE email = ?',
        [hashedPassword, 'aktif', 'superadmin@iware.id']
      );

      console.log('✅ Password berhasil diupdate!\n');
    }

    // Test password
    console.log('🧪 Testing password...\n');
    const [testUsers] = await connection.query(
      'SELECT * FROM users WHERE email = ?',
      ['superadmin@iware.id']
    );

    const passwordMatch = await bcrypt.compare('jasad666', testUsers[0].password);
    
    if (passwordMatch) {
      console.log('✅ Password test BERHASIL!\n');
    } else {
      console.log('❌ Password test GAGAL!\n');
    }

    console.log('=================================');
    console.log('📋 Login Credentials:');
    console.log('=================================');
    console.log('Email    : superadmin@iware.id');
    console.log('Password : jasad666');
    console.log('=================================\n');

    console.log('✅ Fix selesai! Silakan coba login lagi.\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('1. Pastikan MySQL sudah berjalan');
    console.error('2. Cek konfigurasi di file .env');
    console.error('3. Pastikan database iware_warehouse sudah dibuat');
    console.error('4. Jalankan: npm run setup\n');
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

fixLogin();
