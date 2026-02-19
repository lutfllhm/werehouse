-- ============================================
-- TAMBAH TABEL ACCURATE_TOKENS
-- ============================================
-- Jalankan SQL ini jika database sudah ada
-- tapi tabel accurate_tokens belum dibuat
-- ============================================

USE iware_warehouse;

-- Buat tabel accurate_tokens
CREATE TABLE IF NOT EXISTS accurate_tokens (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  token_type VARCHAR(50) DEFAULT 'Bearer',
  expires_in INT DEFAULT 3600,
  expires_at DATETIME NOT NULL,
  scope TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Verifikasi tabel berhasil dibuat
SHOW TABLES LIKE 'accurate_tokens';

-- Lihat struktur tabel
DESCRIBE accurate_tokens;

-- ============================================
-- SELESAI!
-- ============================================
-- Setelah menjalankan SQL ini:
-- 1. Restart backend: docker-compose restart backend
--    atau: pm2 restart iware-backend
-- 2. Cek log: docker-compose logs backend
-- 3. Token akan tersimpan otomatis setelah OAuth
-- ============================================
