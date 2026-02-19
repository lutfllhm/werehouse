const mysql = require('mysql2/promise');
require('dotenv').config();

async function addAccurateTokensTable() {
  let connection;
  
  try {
    console.log('🔄 Menambahkan tabel accurate_tokens...');

    // Create connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'iware_warehouse'
    });

    // Cek apakah tabel sudah ada
    const [tables] = await connection.query(
      "SHOW TABLES LIKE 'accurate_tokens'"
    );

    if (tables.length > 0) {
      console.log('✅ Tabel accurate_tokens sudah ada');
      return;
    }

    // Buat tabel accurate_tokens
    await connection.query(`
      CREATE TABLE accurate_tokens (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        access_token TEXT NOT NULL,
        refresh_token TEXT,
        token_type VARCHAR(50) DEFAULT 'Bearer',
        expires_in INT DEFAULT 3600,
        expires_at DATETIME NOT NULL,
        scope TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_active (user_id, is_active),
        INDEX idx_expires_at (expires_at)
      )
    `);

    console.log('✅ Tabel accurate_tokens berhasil dibuat');
    console.log('');
    console.log('📋 Struktur tabel:');
    console.log('   - id: Primary key');
    console.log('   - user_id: Foreign key ke tabel users');
    console.log('   - access_token: Token untuk akses API');
    console.log('   - refresh_token: Token untuk refresh');
    console.log('   - expires_at: Waktu expired token');
    console.log('   - is_active: Status aktif token');
    console.log('');

  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.code === 'ER_NO_REFERENCED_ROW_2' || error.message.includes('foreign key')) {
      console.error('');
      console.error('⚠️  Tabel users belum ada atau kosong!');
      console.error('Jalankan: npm run setup-interactive');
    }
    
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Jalankan migration
addAccurateTokensTable()
  .then(() => {
    console.log('✅ Migration selesai');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration gagal:', error);
    process.exit(1);
  });
