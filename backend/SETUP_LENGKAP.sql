-- ============================================
-- SETUP LENGKAP DATABASE iWare
-- ============================================
-- Jalankan SEMUA SQL ini di phpMyAdmin
-- ============================================

-- 1. Buat database (jika belum ada)
CREATE DATABASE IF NOT EXISTS iware_warehouse;

-- 2. Gunakan database
USE iware_warehouse;

-- 3. Hapus tabel lama (jika ada)
DROP TABLE IF EXISTS activity_logs;
DROP TABLE IF EXISTS sales_orders;
DROP TABLE IF EXISTS items;
DROP TABLE IF EXISTS users;

-- 4. Buat tabel users
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nama VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('superadmin', 'admin') DEFAULT 'admin',
  foto_profil VARCHAR(255) DEFAULT NULL,
  status ENUM('aktif', 'nonaktif') DEFAULT 'aktif',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 5. Buat tabel items
CREATE TABLE items (
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
);

-- 6. Buat tabel sales_orders
CREATE TABLE sales_orders (
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
);

-- 7. Buat tabel activity_logs
CREATE TABLE activity_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  aktivitas VARCHAR(255) NOT NULL,
  deskripsi TEXT,
  ip_address VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 8. Insert superadmin
-- Email: superadmin@iware.id
-- Password: jasad666
-- Hash generated: 2024
INSERT INTO users (id, nama, email, password, role, status, created_at) 
VALUES (
  1,
  'Super Admin', 
  'superadmin@iware.id', 
  '$2a$10$eweUqstkhfT5eB2sr5dw0uRA1F2zMPvKeiOXd5qLwUh0TnNNPivFe', 
  'superadmin', 
  'aktif',
  NOW()
);

-- 9. Buat indexes untuk performa
CREATE INDEX idx_items_nama ON items(nama_item);
CREATE INDEX idx_items_kode ON items(kode_item);
CREATE INDEX idx_so_nomor ON sales_orders(nomor_so);
CREATE INDEX idx_so_tanggal ON sales_orders(tanggal_so);
CREATE INDEX idx_so_status ON sales_orders(status);
CREATE INDEX idx_logs_user ON activity_logs(user_id);
CREATE INDEX idx_logs_created ON activity_logs(created_at);

-- 10. Verifikasi semua tabel
SHOW TABLES;

-- 11. Verifikasi user superadmin
SELECT 
  id,
  nama,
  email,
  role,
  status,
  LENGTH(password) as password_length,
  created_at
FROM users;

-- ============================================
-- HASIL YANG HARUS MUNCUL:
-- ============================================
-- Tables:
-- - users
-- - items
-- - sales_orders
-- - activity_logs
--
-- User superadmin:
-- - id: 1
-- - nama: Super Admin
-- - email: superadmin@iware.id
-- - role: superadmin
-- - status: aktif
-- - password_length: 60
-- ============================================

-- ============================================
-- SETELAH MENJALANKAN SQL INI:
-- ============================================
-- 1. Restart backend:
--    cd backend
--    npm run dev
--
-- 2. Buka browser: http://localhost:3000
--
-- 3. Login dengan:
--    Email: superadmin@iware.id
--    Password: jasad666
--
-- 4. PASTI BERHASIL! ✅
-- ============================================
