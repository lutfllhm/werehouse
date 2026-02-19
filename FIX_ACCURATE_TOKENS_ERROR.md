# Quick Fix: Error Table 'accurate_tokens' doesn't exist

## Error yang Muncul
```
Error: Table 'iware_warehouse.accurate_tokens' doesn't exist
```

## Solusi Cepat (Pilih salah satu)

### Opsi 0: Pakai Script Otomatis (PALING MUDAH)
```bash
# SSH ke VPS
ssh user@your-vps-ip

# Masuk ke direktori project
cd /path/to/your/project

# Jalankan script fix
bash QUICK_FIX_VPS.sh
```

Script ini akan otomatis:
1. Drop tabel lama (jika ada)
2. Buat tabel baru dengan struktur yang benar
3. Restart backend (Docker atau PM2)

### Opsi 1: SQL Command (Tercepat)
```bash
# SSH ke VPS
ssh user@your-vps-ip

# Login MySQL dan jalankan (SATU BARIS)
mysql -u root -p -e "USE iware_warehouse; CREATE TABLE IF NOT EXISTS accurate_tokens (id INT PRIMARY KEY AUTO_INCREMENT, user_id INT, access_token TEXT NOT NULL, refresh_token TEXT NOT NULL, token_type VARCHAR(50) DEFAULT 'Bearer', expires_in INT DEFAULT 3600, expires_at DATETIME NOT NULL, scope TEXT, is_active BOOLEAN DEFAULT TRUE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE);"

# Restart backend
docker-compose restart backend
# atau
pm2 restart iware-backend
```

### Opsi 2: Via MySQL Interactive
```bash
# SSH ke VPS
ssh user@your-vps-ip

# Login ke MySQL
mysql -u root -p

# Jalankan SQL berikut
USE iware_warehouse;

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

# Verifikasi
SHOW TABLES;
DESCRIBE accurate_tokens;

# Keluar
exit;

# Restart backend
docker-compose restart backend
# atau
pm2 restart iware-backend
```

### Opsi 3: Via SQL File
```bash
# SSH ke VPS
ssh user@your-vps-ip

# Masuk ke direktori project
cd /path/to/your/project

# Jalankan SQL file
mysql -u root -p iware_warehouse < backend/config/add-accurate-tokens-table.sql

# Restart backend
docker-compose restart backend
# atau
pm2 restart iware-backend
```

### Opsi 4: Via SQL File (Recommended)
```bash
# SSH ke VPS
ssh user@your-vps-ip

# Masuk ke direktori project
cd /path/to/your/project

# Jalankan SQL file fix
mysql -u root -p iware_warehouse < backend/config/fix-accurate-tokens-table.sql

# Restart backend
docker-compose restart backend
# atau
pm2 restart iware-backend
```

### Opsi 5: Via Node Script
```bash
# SSH ke VPS
ssh user@your-vps-ip

# Masuk ke direktori backend
cd /path/to/your/project/backend

# Jalankan script
node scripts/addAccurateTokensTable.js

# Restart backend
cd ..
docker-compose restart backend
# atau
pm2 restart iware-backend
```

## Verifikasi Fix Berhasil

### Cek Tabel Sudah Ada
```bash
mysql -u root -p -e "USE iware_warehouse; SHOW TABLES LIKE 'accurate_tokens';"
```

Output yang benar:
```
+------------------------------------------+
| Tables_in_iware_warehouse (accurate_tokens) |
+------------------------------------------+
| accurate_tokens                          |
+------------------------------------------+
```

### Cek Backend Tidak Error Lagi
```bash
# Docker
docker-compose logs backend --tail 50

# PM2
pm2 logs iware-backend --lines 50
```

Tidak boleh ada error "Table 'accurate_tokens' doesn't exist" lagi.

## Setelah Fix

1. Backend sudah bisa jalan normal
2. Lanjut ke proses OAuth untuk dapat token
3. Akses: `https://yourdomain.com/api/accurate/auth`
4. Token akan tersimpan otomatis di tabel `accurate_tokens`

## Jika Masih Error

### Cek Database Connection
```bash
mysql -u root -p -e "SHOW DATABASES;"
```

Pastikan `iware_warehouse` ada dalam list.

### Cek User Permission
```bash
mysql -u root -p -e "SHOW GRANTS FOR 'iware_user'@'%';"
```

Pastikan user punya akses CREATE TABLE.

### Re-run Full Setup
Jika masih bermasalah, jalankan ulang setup lengkap:
```bash
mysql -u root -p < backend/SETUP_LENGKAP.sql
```

Ini akan drop dan recreate semua tabel termasuk `accurate_tokens`.

**WARNING**: Ini akan menghapus semua data! Backup dulu jika ada data penting.

## Backup Sebelum Fix (Recommended)

```bash
# Backup database
mysqldump -u root -p iware_warehouse > backup_before_fix.sql

# Jika ada masalah, restore dengan:
mysql -u root -p iware_warehouse < backup_before_fix.sql
```
