-- ============================================
-- FIX TABEL ACCURATE_TOKENS
-- ============================================
-- Jalankan SQL ini untuk fix struktur tabel
-- yang sudah ada tapi strukturnya salah
-- ============================================

USE iware_warehouse;

-- Drop tabel lama jika ada
DROP TABLE IF EXISTS accurate_tokens;

-- Buat tabel dengan struktur yang benar
CREATE TABLE accurate_tokens (
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
-- Kolom yang harus ada:
-- - id (INT, PRIMARY KEY, AUTO_INCREMENT)
-- - user_id (INT, FOREIGN KEY ke users)
-- - access_token (TEXT)
-- - refresh_token (TEXT)
-- - token_type (VARCHAR(50), default 'Bearer')
-- - expires_in (INT, default 3600)
-- - expires_at (DATETIME)
-- - scope (TEXT)
-- - is_active (BOOLEAN, default TRUE)
-- - created_at (TIMESTAMP)
-- - updated_at (TIMESTAMP)
-- ============================================
