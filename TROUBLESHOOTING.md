# 🔧 Troubleshooting Guide - iWare Warehouse

Panduan cepat untuk mengatasi masalah umum saat deployment.

---

## ❌ Error: `ECONNREFUSED ::1:3306` atau `Access denied`

**Masalah:** Node.js tidak bisa connect ke MySQL.

**Solusi Termudah - Gunakan Setup Interaktif:**

```bash
cd /var/www/iware/backend

# Jalankan setup interaktif yang akan handle semuanya
npm run setup-interactive

# Ikuti instruksi di layar
# Script akan otomatis:
# - Membuat database
# - Membuat user
# - Import schema
# - Update .env
```

**Solusi Manual:**

```bash
# 1. Pastikan MySQL berjalan
systemctl status mysql

# 2. Test koneksi MySQL dengan root
mysql -u root -p -h 127.0.0.1

# 3. Buat database dan user (di MySQL prompt):
CREATE DATABASE IF NOT EXISTS iware_warehouse CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'iware_user'@'localhost' IDENTIFIED BY 'PASSWORD_KUAT';
GRANT ALL PRIVILEGES ON iware_warehouse.* TO 'iware_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# 4. Update .env
nano /var/www/iware/backend/.env

# Pastikan konfigurasi berikut:
DB_HOST=127.0.0.1
DB_USER=iware_user
DB_PASSWORD=PASSWORD_KUAT
DB_NAME=iware_warehouse

# 5. Import database
npm run import-db

# 6. Restart backend
pm2 restart iware-backend
```

---

## ❌ Error: `Access denied for user`

**Masalah:** Username atau password MySQL salah.

**Solusi:**

```bash
# 1. Test login MySQL
mysql -u iware_user -p -h 127.0.0.1

# Jika gagal, reset password:
mysql -u root -p

# Di MySQL prompt:
ALTER USER 'iware_user'@'localhost' IDENTIFIED BY 'PASSWORD_BARU';
FLUSH PRIVILEGES;
EXIT;

# 2. Update .env
nano /var/www/iware/backend/.env

# Update DB_PASSWORD dengan password baru

# 3. Restart backend
pm2 restart iware-backend
```

---

## ❌ Error: `Unknown database 'iware_warehouse'`

**Masalah:** Database belum dibuat.

**Solusi:**

```bash
# Login ke MySQL
mysql -u root -p

# Buat database
CREATE DATABASE iware_warehouse CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Berikan akses ke user
GRANT ALL PRIVILEGES ON iware_warehouse.* TO 'iware_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# Import schema
cd /var/www/iware/backend
npm run import-db
```

---

## ❌ Backend tidak bisa diakses dari browser

**Masalah:** Backend tidak berjalan atau Nginx tidak dikonfigurasi dengan benar.

**Solusi:**

```bash
# 1. Check backend status
pm2 status

# Jika tidak running:
cd /var/www/iware/backend
pm2 start ecosystem.config.js

# 2. Check backend logs
pm2 logs iware-backend

# 3. Test backend langsung
curl http://localhost:5000/api/health

# 4. Check Nginx config
nginx -t

# 5. Reload Nginx
systemctl reload nginx

# 6. Check Nginx logs
tail -f /var/log/nginx/iware-error.log
```

---

## ❌ Frontend menampilkan halaman kosong

**Masalah:** Frontend tidak ter-build dengan benar atau Nginx tidak serve file static.

**Solusi:**

```bash
# 1. Rebuild frontend
cd /var/www/iware/frontend
npm run build

# 2. Check dist folder
ls -la dist/

# 3. Check Nginx config
cat /etc/nginx/sites-available/iware

# Pastikan root path benar:
# root /var/www/iware/frontend/dist;

# 4. Reload Nginx
systemctl reload nginx

# 5. Clear browser cache (Ctrl+Shift+R)
```

---

## ❌ Error 500 Internal Server Error atau 502 Bad Gateway

**Masalah:** Website menampilkan error 500/502 - Nginx tidak bisa connect ke backend atau ada error di aplikasi.

**Diagnostic Otomatis (RECOMMENDED):**

```bash
cd /var/www/iware/backend

# Jalankan diagnostic script
npm run diagnose

# Script akan check:
# ✓ Backend running?
# ✓ Frontend built?
# ✓ Nginx configured?
# ✓ Environment variables set?
```

**Solusi Manual:**

```bash
# 1. Check backend running
pm2 status

# Jika tidak running atau error:
cd /var/www/iware/backend
pm2 delete iware-backend
pm2 start ecosystem.config.js
pm2 save

# 2. Check backend logs untuk error
pm2 logs iware-backend --lines 50

# 3. Test backend langsung
curl http://localhost:5000/api/health

# Harus return: {"status":"ok","timestamp":"..."}
# Jika error, check logs di step 2

# 4. Check frontend sudah di-build
ls -la /var/www/iware/frontend/dist/

# Jika kosong atau tidak ada:
cd /var/www/iware/frontend
npm install
npm run build

# 5. Check Nginx error log
tail -50 /var/log/nginx/error.log
tail -50 /var/log/nginx/iware-error.log

# 6. Check Nginx config
nginx -t

# Jika error, perbaiki config:
nano /etc/nginx/sites-available/iware

# 7. Reload Nginx
systemctl reload nginx

# 8. Check port 5000 listening
netstat -tulpn | grep 5000

# Harus ada: tcp 0.0.0.0:5000 ... node
```

---

## ❌ Accurate API Error 401 (Unauthorized)

**Masalah:** Access token expired atau tidak valid.

**Solusi:**

```bash
# 1. Login ke Accurate Developer Console
# https://account.accurate.id/developer

# 2. Generate new Access Token

# 3. Update .env
nano /var/www/iware/backend/.env

# Update ACCURATE_ACCESS_TOKEN dengan token baru

# 4. Restart backend
pm2 restart iware-backend

# 5. Test koneksi
cd /var/www/iware/backend
npm run test-accurate
```

---

## ❌ Table 'accurate_tokens' NOT FOUND

**Masalah:** Tabel accurate_tokens belum dibuat.

**Solusi:**

```bash
cd /var/www/iware/backend

# Buat tabel accurate_tokens
npm run add-accurate-table

# Verifikasi
npm run test-accurate

# Harus menampilkan:
# ✓ Table accurate_tokens found
```

---

## ❌ SSL Certificate Error

**Masalah:** SSL certificate tidak valid atau expired.

**Solusi:**

```bash
# 1. Check certificate
certbot certificates

# 2. Renew certificate
certbot renew

# 3. Force renew jika belum expired
certbot renew --force-renewal

# 4. Reload Nginx
systemctl reload nginx

# 5. Test SSL
curl -I https://werehouse.iwareid.com
```

---

## ❌ PM2 Process Crashed

**Masalah:** Backend crash dan tidak restart otomatis.

**Solusi:**

```bash
# 1. Check PM2 logs
pm2 logs iware-backend --lines 50

# 2. Check error di logs
pm2 logs iware-backend --err

# 3. Delete crashed process
pm2 delete iware-backend

# 4. Start ulang
cd /var/www/iware/backend
pm2 start ecosystem.config.js

# 5. Save PM2 list
pm2 save

# 6. Monitor
pm2 monit
```

---

## ❌ Database Connection Pool Exhausted

**Masalah:** Terlalu banyak koneksi database.

**Solusi:**

```bash
# 1. Check MySQL connections
mysql -u root -p -e "SHOW PROCESSLIST;"

# 2. Kill idle connections
mysql -u root -p -e "KILL CONNECTION_ID;"

# 3. Increase connection limit di MySQL
nano /etc/mysql/mysql.conf.d/mysqld.cnf

# Add/update:
max_connections = 200

# 4. Restart MySQL
systemctl restart mysql

# 5. Restart backend
pm2 restart iware-backend
```

---

## ❌ Disk Space Full

**Masalah:** VPS kehabisan disk space.

**Solusi:**

```bash
# 1. Check disk usage
df -h

# 2. Find large files
du -h /var/www/iware | sort -rh | head -20

# 3. Clean PM2 logs
pm2 flush

# 4. Clean old logs
find /var/log -type f -name "*.log" -mtime +30 -delete

# 5. Clean apt cache
apt clean
apt autoremove

# 6. Clean MySQL binary logs
mysql -u root -p -e "PURGE BINARY LOGS BEFORE NOW();"
```

---

## 🔍 Diagnostic Commands

```bash
# Check all services status
systemctl status nginx mysql

# Check ports
netstat -tulpn | grep -E '(80|443|3306|5000)'

# Check PM2 processes
pm2 list
pm2 monit

# Check logs
pm2 logs iware-backend --lines 50
tail -f /var/log/nginx/iware-error.log
tail -f /var/log/mysql/error.log

# Check disk space
df -h

# Check memory
free -h

# Check CPU
top

# Test backend API
curl http://localhost:5000/api/health

# Test MySQL connection
mysql -u iware_user -p -h 127.0.0.1 iware_warehouse -e "SELECT 1;"

# Test Accurate API
cd /var/www/iware/backend
node scripts/testAccurateConnection.js
```

---

## 📞 Masih Bermasalah?

Jika masalah masih berlanjut:

1. **Collect logs:**
   ```bash
   pm2 logs iware-backend --lines 100 > backend-logs.txt
   tail -100 /var/log/nginx/iware-error.log > nginx-logs.txt
   ```

2. **Check configuration:**
   ```bash
   cat /var/www/iware/backend/.env > config.txt
   # Hapus sensitive data sebelum share!
   ```

3. **System info:**
   ```bash
   uname -a
   node --version
   npm --version
   mysql --version
   nginx -v
   ```

4. Hubungi tim support dengan informasi di atas.

---

**Last Updated:** 2024
