const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function checkAndFix() {
  let connection;
  
  try {
    console.log('\n🔍 iWare System Check & Fix\n');
    console.log('=================================\n');

    // Step 1: Connect to MySQL (without database)
    console.log('📡 Step 1: Connecting to MySQL...');
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || ''
    });
    console.log('✅ Connected to MySQL\n');

    // Step 2: Check/Create Database
    console.log('📦 Step 2: Checking database...');
    const dbName = process.env.DB_NAME || 'iware_warehouse';
    
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
    await connection.query(`USE ${dbName}`);
    console.log(`✅ Database '${dbName}' ready\n`);

    // Step 3: Check/Create Tables
    console.log('📋 Step 3: Checking tables...');
    
    // Create users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        nama VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('superadmin', 'admin') DEFAULT 'admin',
        foto_profil VARCHAR(255) DEFAULT NULL,
        status ENUM('aktif', 'nonaktif') DEFAULT 'aktif',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table users ready');

    // Create activity_logs table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT,
        aktivitas VARCHAR(255) NOT NULL,
        deskripsi TEXT,
        ip_address VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);
    console.log('✅ Table activity_logs ready');

    // Create items table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS items (
        id INT PRIMARY KEY AUTO_INCREMENT,
        item_id VARCHAR(50) UNIQUE NOT NULL,
        nama_item VARCHAR(255) NOT NULL,
        kode_item VARCHAR(100),
        kategori VARCHAR(100),
        satuan VARCHAR(50),
        stok_tersedia DECIMAL(15,2) DEFAULT 0,
        harga_jual DECIMAL(15,2) DEFAULT 0,
        harga_beli DECIMAL(15,2) DEFAULT 0,
        deskripsi TEXT,
        last_sync TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table items ready');

    // Create sales_orders table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS sales_orders (
        id INT PRIMARY KEY AUTO_INCREMENT,
        so_id VARCHAR(50) UNIQUE NOT NULL,
        nomor_so VARCHAR(100) NOT NULL,
        tanggal_so DATE NOT NULL,
        nama_pelanggan VARCHAR(255) NOT NULL,
        keterangan TEXT,
        status ENUM('Menunggu Proses', 'Sebagian Terproses', 'Terproses') DEFAULT 'Menunggu Proses',
        total_amount DECIMAL(15,2) DEFAULT 0,
        last_sync TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table sales_orders ready\n');

    // Step 4: Check/Create Superadmin
    console.log('👤 Step 4: Checking superadmin user...');
    
    const [users] = await connection.query(
      'SELECT * FROM users WHERE email = ?',
      ['superadmin@iware.id']
    );

    if (users.length === 0) {
      console.log('📝 Creating superadmin...');
      const hashedPassword = await bcrypt.hash('jasad666', 10);
      
      await connection.query(
        `INSERT INTO users (nama, email, password, role, status) 
         VALUES (?, ?, ?, ?, ?)`,
        ['Super Admin', 'superadmin@iware.id', hashedPassword, 'superadmin', 'aktif']
      );
      console.log('✅ Superadmin created');
    } else {
      console.log('✅ Superadmin exists');
      console.log(`   ID: ${users[0].id}`);
      console.log(`   Name: ${users[0].nama}`);
      console.log(`   Status: ${users[0].status}`);
      
      // Update password to make sure it's correct
      console.log('🔄 Updating password...');
      const hashedPassword = await bcrypt.hash('jasad666', 10);
      
      await connection.query(
        'UPDATE users SET password = ?, status = ? WHERE email = ?',
        [hashedPassword, 'aktif', 'superadmin@iware.id']
      );
      console.log('✅ Password updated');
    }

    // Step 5: Test Password
    console.log('\n🧪 Step 5: Testing password...');
    const [testUsers] = await connection.query(
      'SELECT * FROM users WHERE email = ?',
      ['superadmin@iware.id']
    );

    const passwordMatch = await bcrypt.compare('jasad666', testUsers[0].password);
    
    if (passwordMatch) {
      console.log('✅ Password test PASSED!\n');
    } else {
      console.log('❌ Password test FAILED!\n');
      throw new Error('Password verification failed');
    }

    // Step 6: Summary
    console.log('=================================');
    console.log('✅ ALL CHECKS PASSED!');
    console.log('=================================\n');
    console.log('📋 Login Credentials:');
    console.log('   Email    : superadmin@iware.id');
    console.log('   Password : jasad666');
    console.log('\n🌐 Access URL:');
    console.log('   http://localhost:3000\n');
    console.log('=================================\n');
    console.log('✅ System ready! You can now login.\n');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('1. Make sure MySQL is running');
    console.error('2. Check .env configuration');
    console.error('3. Verify MySQL credentials');
    console.error('4. Check MySQL user permissions\n');
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkAndFix();
