const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function setupDatabase() {
  let connection;
  
  try {
    // Koneksi tanpa database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || ''
    });

    console.log('✅ Terhubung ke MySQL');

    // Buat database
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'iware_warehouse'}`);
    console.log('✅ Database dibuat');

    // Gunakan database
    await connection.query(`USE ${process.env.DB_NAME || 'iware_warehouse'}`);

    // Buat tabel users
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
    console.log('✅ Tabel users dibuat');

    // Buat tabel items
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
    console.log('✅ Tabel items dibuat');

    // Buat tabel sales_orders
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
    console.log('✅ Tabel sales_orders dibuat');

    // Buat tabel activity_logs
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
    console.log('✅ Tabel activity_logs dibuat');

    // Hash password untuk superadmin
    const hashedPassword = await bcrypt.hash('jasad666', 10);

    // Insert superadmin
    await connection.query(`
      INSERT IGNORE INTO users (nama, email, password, role, status) 
      VALUES ('Super Admin', 'superadmin@iware.id', ?, 'superadmin', 'aktif')
    `, [hashedPassword]);
    console.log('✅ Superadmin dibuat');

    // Buat indexes
    await connection.query('CREATE INDEX IF NOT EXISTS idx_items_nama ON items(nama_item)');
    await connection.query('CREATE INDEX IF NOT EXISTS idx_items_kode ON items(kode_item)');
    await connection.query('CREATE INDEX IF NOT EXISTS idx_so_nomor ON sales_orders(nomor_so)');
    await connection.query('CREATE INDEX IF NOT EXISTS idx_so_tanggal ON sales_orders(tanggal_so)');
    await connection.query('CREATE INDEX IF NOT EXISTS idx_so_status ON sales_orders(status)');
    console.log('✅ Indexes dibuat');

    console.log('\n=================================');
    console.log('✅ Setup database selesai!');
    console.log('=================================');
    console.log('Login credentials:');
    console.log('Email: superadmin@iware.id');
    console.log('Password: jasad666');
    console.log('=================================\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setupDatabase();
