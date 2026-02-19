# Panduan Update Token API Accurate di VPS

Panduan ini menjelaskan langkah-langkah untuk mengupdate Access Token dan Refresh Token Accurate Online API setelah mendapatkan token dari proses OAuth.

## Skenario 1: Deploy dengan Docker

### Langkah 1: SSH ke VPS
```bash
ssh user@your-vps-ip
```

### Langkah 2: Masuk ke Direktori Project
```bash
cd /path/to/your/project
```

### Langkah 3: Edit File .env di Root Project
```bash
nano .env
```

### Langkah 4: Update Token di File .env
Cari baris berikut dan isi dengan token yang sudah didapat:
```env
ACCURATE_ACCESS_TOKEN=your_access_token_here
ACCURATE_REFRESH_TOKEN=your_refresh_token_here
```

Simpan file (Ctrl + O, Enter, Ctrl + X)

### Langkah 5: Restart Container Backend
```bash
docker-compose restart backend
```

### Langkah 6: Verifikasi Token Tersimpan
```bash
docker-compose logs backend | grep -i accurate
```

---

## Skenario 2: Deploy Manual (Tanpa Docker)

### Langkah 1: SSH ke VPS
```bash
ssh user@your-vps-ip
```

### Langkah 2: Masuk ke Direktori Backend
```bash
cd /path/to/your/project/backend
```

### Langkah 3: Edit File .env Backend
```bash
nano .env
```

### Langkah 4: Update Token di File .env
Cari baris berikut dan isi dengan token yang sudah didapat:
```env
ACCURATE_ACCESS_TOKEN=your_access_token_here
ACCURATE_REFRESH_TOKEN=your_refresh_token_here
```

Simpan file (Ctrl + O, Enter, Ctrl + X)

### Langkah 5: Restart Backend dengan PM2
```bash
pm2 restart iware-backend
```

Atau jika menggunakan nama lain:
```bash
pm2 list
pm2 restart <app-name>
```

### Langkah 6: Verifikasi Token Tersimpan
```bash
pm2 logs iware-backend --lines 50 | grep -i accurate
```

---

## Cara Mendapatkan Token (OAuth Flow)

### Metode 1: Via Browser (Recommended)

1. Buka browser dan akses:
```
https://yourdomain.com/api/accurate/auth
```

2. Login dengan akun Accurate Online

3. Authorize aplikasi

4. Setelah berhasil, token akan otomatis tersimpan di database

5. Cek token di database:
```bash
# Login ke MySQL
mysql -u root -p

# Pilih database
USE iware_warehouse;

# Lihat token
SELECT * FROM accurate_tokens ORDER BY created_at DESC LIMIT 1;
```

6. Copy `access_token` dan `refresh_token` dari hasil query

### Metode 2: Via API Testing Tool (Postman/Insomnia)

1. GET Request ke:
```
https://yourdomain.com/api/accurate/auth
```

2. Follow redirect untuk login

3. Setelah callback, token tersimpan di database

4. Ambil token dari database seperti Metode 1 langkah 5-6

---

## Update Token Secara Otomatis (Recommended)

Token akan di-refresh otomatis oleh sistem ketika expired. Pastikan:

### 1. Cek Service Token Berjalan
```bash
# Untuk Docker
docker-compose logs backend | grep -i "token refresh"

# Untuk PM2
pm2 logs iware-backend | grep -i "token refresh"
```

### 2. Verifikasi Cron Job Token Refresh
Token service akan otomatis refresh token setiap 50 menit (token Accurate expired dalam 1 jam).

Cek di `backend/services/tokenService.js`:
- Auto refresh setiap 50 menit
- Simpan ke database
- Update environment variable

---

## Troubleshooting

### Error: Table 'accurate_tokens' doesn't exist

Jika muncul error ini, berarti tabel `accurate_tokens` belum dibuat. Solusi:

**Cara 1: Jalankan SQL Manual**
```bash
# Login ke MySQL di VPS
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
SHOW TABLES LIKE 'accurate_tokens';
DESCRIBE accurate_tokens;

# Keluar
exit;
```

**Cara 2: Jalankan Script SQL**
```bash
# Di VPS, masuk ke direktori project
cd /path/to/your/project

# Jalankan SQL file
mysql -u root -p iware_warehouse < backend/config/add-accurate-tokens-table.sql
```

**Cara 3: Jalankan Node Script**
```bash
# Di direktori backend
cd backend
node scripts/addAccurateTokensTable.js
```

Setelah tabel dibuat, restart backend:
```bash
# Docker
docker-compose restart backend

# PM2
pm2 restart iware-backend
```

### Token Tidak Tersimpan
```bash
# Cek log error
docker-compose logs backend --tail 100
# atau
pm2 logs iware-backend --lines 100

# Cek koneksi database
mysql -u root -p -e "USE iware_warehouse; SHOW TABLES;"
```

### Token Expired Terus
```bash
# Cek apakah token service berjalan
# Lihat di backend/services/tokenService.js

# Restart backend
docker-compose restart backend
# atau
pm2 restart iware-backend
```

### Tidak Bisa Akses OAuth URL
```bash
# Cek Nginx config
sudo nginx -t

# Cek backend running
curl http://localhost:5000/api/health

# Cek firewall
sudo ufw status
```

---

## Verifikasi Token Bekerja

### Test API Accurate
```bash
curl -X GET "https://yourdomain.com/api/accurate/test" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Cek di Frontend
1. Login ke aplikasi
2. Buka halaman Settings
3. Cek status koneksi Accurate
4. Test sync data

---

## Backup Token (Important!)

Setelah mendapat token, backup untuk jaga-jaga:

```bash
# Backup .env file
cp .env .env.backup.$(date +%Y%m%d)

# Atau backup dari database
mysqldump -u root -p iware_warehouse accurate_tokens > accurate_tokens_backup.sql
```

---

## Update Token Manual via Database

Jika perlu update langsung ke database:

```sql
-- Login ke MySQL
mysql -u root -p

-- Pilih database
USE iware_warehouse;

-- Update token
UPDATE accurate_tokens 
SET 
  access_token = 'your_new_access_token',
  refresh_token = 'your_new_refresh_token',
  expires_at = DATE_ADD(NOW(), INTERVAL 1 HOUR),
  updated_at = NOW()
WHERE id = 1;

-- Verifikasi
SELECT * FROM accurate_tokens;
```

Setelah update database, restart backend:
```bash
docker-compose restart backend
# atau
pm2 restart iware-backend
```

---

## Monitoring Token

### Setup Monitoring (Optional)
Tambahkan cron job untuk cek token status:

```bash
# Edit crontab
crontab -e

# Tambahkan (cek setiap 1 jam)
0 * * * * curl -s https://yourdomain.com/api/accurate/token-status >> /var/log/accurate-token.log
```

---

## Keamanan Token

1. **Jangan commit token ke Git**
   - Pastikan `.env` ada di `.gitignore`

2. **Gunakan HTTPS**
   - Token harus dikirim via HTTPS

3. **Backup terenkripsi**
   ```bash
   # Encrypt backup
   gpg -c .env.backup
   ```

4. **Rotate token berkala**
   - Lakukan OAuth ulang setiap 3-6 bulan

---

## Checklist Update Token

- [ ] SSH ke VPS
- [ ] Backup file .env lama
- [ ] Update ACCURATE_ACCESS_TOKEN
- [ ] Update ACCURATE_REFRESH_TOKEN
- [ ] Simpan file .env
- [ ] Restart backend service
- [ ] Verifikasi di log
- [ ] Test API Accurate
- [ ] Test di frontend
- [ ] Backup token baru

---

## Kontak Support

Jika mengalami masalah:
1. Cek log error di backend
2. Verifikasi credentials Accurate di developer.accurate.id
3. Pastikan database ID benar
4. Cek network/firewall VPS
