-- Database iWare Warehouse Monitoring System
CREATE DATABASE IF NOT EXISTS iware_warehouse;
USE iware_warehouse;

-- Tabel Users (Admin)
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
);

-- Tabel Items (Cache dari Accurate Online)
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
);

-- Tabel Sales Orders (Cache dari Accurate Online)
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
);

-- Tabel Activity Logs
CREATE TABLE IF NOT EXISTS activity_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  aktivitas VARCHAR(255) NOT NULL,
  deskripsi TEXT,
  ip_address VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Tabel Accurate OAuth Tokens
CREATE TABLE IF NOT EXISTS accurate_tokens (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
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
);

-- Insert Super Admin Default
-- Password: jasad666
INSERT INTO users (nama, email, password, role, status) 
VALUES (
  'Super Admin', 
  'superadmin@iware.id', 
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL2tOiHe', 
  'superadmin', 
  'aktif'
);

-- Indexes untuk performa
CREATE INDEX idx_items_nama ON items(nama_item);
CREATE INDEX idx_items_kode ON items(kode_item);
CREATE INDEX idx_so_nomor ON sales_orders(nomor_so);
CREATE INDEX idx_so_tanggal ON sales_orders(tanggal_so);
CREATE INDEX idx_so_status ON sales_orders(status);
CREATE INDEX idx_logs_user ON activity_logs(user_id);
CREATE INDEX idx_logs_created ON activity_logs(created_at);
