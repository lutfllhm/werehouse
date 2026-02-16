const mysql = require('mysql2');
require('dotenv').config();

// Konfigurasi koneksi database
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'iware_warehouse',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Menggunakan promise untuk query
const promisePool = pool.promise();

// Test koneksi database
const testConnection = async () => {
  try {
    const connection = await promisePool.getConnection();
    console.log('✅ Database terhubung dengan sukses');
    connection.release();
  } catch (error) {
    console.error('❌ Error koneksi database:', error.message);
    process.exit(1);
  }
};

module.exports = { pool: promisePool, testConnection };
