-- ============================================
-- Fix Superadmin Login - iWare System
-- ============================================
-- Jalankan script ini di MySQL/phpMyAdmin
-- untuk memperbaiki masalah login
-- ============================================

USE iware_warehouse;

-- Hapus user superadmin lama (jika ada)
DELETE FROM users WHERE email = 'superadmin@iware.id';

-- Insert superadmin baru dengan password yang benar
-- Email: superadmin@iware.id
-- Password: jasad666
INSERT INTO users (nama, email, password, role, status) 
VALUES (
  'Super Admin', 
  'superadmin@iware.id', 
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL2tOiHe', 
  'superadmin', 
  'aktif'
);

-- Verifikasi user berhasil dibuat
SELECT 
  id,
  nama,
  email,
  role,
  status,
  created_at
FROM users 
WHERE email = 'superadmin@iware.id';

-- ============================================
-- Setelah menjalankan script ini:
-- 1. Restart backend server
-- 2. Login dengan:
--    Email: superadmin@iware.id
--    Password: jasad666
-- ============================================
