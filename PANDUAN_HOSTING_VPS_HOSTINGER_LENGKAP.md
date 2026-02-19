# 🚀 Panduan Lengkap Hosting ke VPS Hostinger

**Panduan All-in-One: Dari NOL sampai ONLINE + Cara Hapus Aplikasi**

Estimasi waktu: 45-60 menit

---

## 📋 Daftar Isi

1. [Persiapan Awal](#1-persiapan-awal)
2. [Setup VPS Hostinger](#2-setup-vps-hostinger)
3. [Instalasi Dependencies](#3-instalasi-dependencies)
4. [Upload & Setup Aplikasi](#4-upload--setup-aplikasi)
5. [Konfigurasi Accurate Token](#5-konfigurasi-accurate-token)
6. [Setup Database](#6-setup-database)
7. [Setup Nginx & Domain](#7-setup-nginx--domain)
8. [Setup SSL (HTTPS)](#8-setup-ssl-https)
9. [Testing & Verifikasi](#9-testing--verifikasi)
10. [Monitoring & Maintenance](#10-monitoring--maintenance)
11. [Cara Hapus Aplikasi](#11-cara-hapus-aplikasi-dari-vps)
12. [Troubleshooting](#12-troubleshooting)

---

## 1. Persiapan Awal

### ✅ Yang Harus Disiapkan

- [ ] Akun VPS Hostinger (sudah aktif)
- [ ] Domain/subdomain (contoh: werehouse.iwareid.com)
- [ ] Accurate Access Token (sudah ada)
- [ ] Accurate Database ID
- [ ] SSH client (PuTTY untuk Windows / Terminal untuk Mac/Linux)
- [ ] File aplikasi (source code)

### 📝 Informasi yang Perlu Dicatat

```
VPS IP Address: ___________________
SSH Username: root
SSH Password: ___________________
Domain: ___________________

Accurate Access Token: ___________________
Accurate Database ID: ___________________
```

---

## 2. Setup VPS Hostinger

### 2.1 Login ke VPS via SSH

**Windows (PuTTY):**
1. Download PuTTY dari https://www.putty.org/
2. Buka PuTTY
3. Host Name: masukkan IP VPS
4. Port: 22
5. Click "Open"
6. Login dengan username `root` dan password VPS

**Mac/Linux (Terminal):**
```bash
ssh root@IP_VPS_ANDA
# Masukkan password saat diminta
```

### 2.2 Update System

```bash
# Update package list
apt update

# Upgrade semua packages
apt upgrade -y

# Install basic tools
apt install -y curl wget git nano ufw
```

### 2.3 Setup Firewall

```bash
# Allow SSH
ufw allow 22/tcp

# Allow HTTP & HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Allow MySQL (optional, jika perlu akses dari luar)
ufw allow 3306/tcp

# Enable firewall
ufw enable

# Check status
ufw status
```

---

## 3. Instalasi Dependencies

### 3.1 Install Node.js (v18 LTS)

```bash
# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Verifikasi instalasi
node --version  # Harus v18.x.x
npm --version   # Harus v9.x.x atau lebih
```

### 3.2 Install MySQL

```bash
# Install MySQL Server
apt install -y mysql-server

# Secure MySQL installation
mysql_secure_installation
```

**Jawab pertanyaan:**
- Set root password? **Y** → masukkan password kuat
- Remove anonymous users? **Y**
- Disallow root login remotely? **Y**
- Remove test database? **Y**
- Reload privilege tables? **Y**

```bash
# Login ke MySQL
mysql -u root -p

# Buat database dan user
CREATE DATABASE iware_warehouse CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'iware_user'@'localhost' IDENTIFIED BY 'password_kuat_anda';
GRANT ALL PRIVILEGES ON iware_warehouse.* TO 'iware_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3.3 Install PM2 (Process Manager)

```bash
# Install PM2 globally
npm install -g pm2

# Setup PM2 startup
pm2 startup systemd
# Copy dan jalankan command yang muncul
```

### 3.4 Install Nginx

```bash
# Install Nginx
apt install -y nginx

# Start Nginx
systemctl start nginx
systemctl enable nginx

# Check status
systemctl status nginx
```

---

## 4. Upload & Setup Aplikasi

### 4.1 Buat Direktori Aplikasi

```bash
# Buat folder untuk aplikasi
mkdir -p /var/www/iware
cd /var/www/iware
```

### 4.2 Upload Source Code

**Opsi A: Via Git (RECOMMENDED)**
```bash
# Clone repository
git clone https://github.com/username/iware-app.git .

# Atau jika private repo
git clone https://username:token@github.com/username/iware-app.git .
```

**Opsi B: Via FTP/SFTP**
1. Gunakan FileZilla atau WinSCP
2. Connect ke VPS (SFTP, port 22)
3. Upload semua file ke `/var/www/iware`

**Opsi C: Via SCP (dari komputer lokal)**
```bash
# Dari komputer lokal (bukan VPS)
scp -r /path/to/local/iware root@IP_VPS:/var/www/
```

### 4.3 Setup Backend

```bash
cd /var/www/iware/backend

# Install dependencies
npm install --production

# Copy environment file
cp .env.example .env

# Edit .env
nano .env
```

**Edit file .env:**
```env
# Server Configuration
PORT=5000
NODE_ENV=production

# Database Configuration
DB_HOST=localhost
DB_USER=iware_user
DB_PASSWORD=password_kuat_anda
DB_NAME=iware_warehouse

# JWT Secret (GANTI dengan random string)
JWT_SECRET=ganti_dengan_random_string_panjang_dan_aman_12345
JWT_EXPIRE=7d

# Accurate Online API Configuration
ACCURATE_API_URL=https://public-api.accurate.id/api
ACCURATE_ACCESS_TOKEN=paste_token_accurate_anda_disini
ACCURATE_DATABASE_ID=paste_database_id_anda_disini

# CORS (ganti dengan domain anda)
CORS_ORIGIN=https://werehouse.iwareid.com
```

**Simpan:** Ctrl+O, Enter, Ctrl+X

### 4.4 Setup Frontend

```bash
cd /var/www/iware/frontend

# Install dependencies
npm install

# Edit API URL di vite.config.js
nano vite.config.js
```

**Tambahkan/edit:**
```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
})
```

```bash
# Build untuk production
npm run build

# Hasil build ada di folder 'dist'
ls -la dist/
```

---

## 5. Konfigurasi Accurate Token

### 5.1 Cara Mendapatkan Accurate Access Token

**Jika sudah punya token, skip ke 5.2**

1. Login ke https://developer.accurate.id/
2. Buat aplikasi baru atau pilih aplikasi existing
3. Catat:
   - Client ID
   - Client Secret
   - Redirect URI
4. Authorize aplikasi untuk akses database Accurate
5. Dapatkan Access Token dan Refresh Token

### 5.2 Masukkan Token ke Aplikasi

```bash
cd /var/www/iware/backend

# Edit .env
nano .env
```

**Update baris berikut:**
```env
# Paste token yang sudah ada
ACCURATE_ACCESS_TOKEN=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
ACCURATE_DATABASE_ID=123456

# Jika punya refresh token (optional)
ACCURATE_REFRESH_TOKEN=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Simpan:** Ctrl+O, Enter, Ctrl+X

### 5.3 Test Koneksi Accurate

```bash
cd /var/www/iware/backend

# Test koneksi
node scripts/testAccurateConnection.js
```

**Output yang diharapkan:**
```
✓ Koneksi ke Accurate Online berhasil!
✓ Database ID valid
✓ Access Token valid
```

---

## 6. Setup Database

### 6.1 Import Database Schema

```bash
cd /var/www/iware/backend

# Import schema lengkap
mysql -u iware_user -p iware_warehouse < SETUP_LENGKAP.sql

# Masukkan password database saat diminta
```

### 6.2 Verifikasi Database

```bash
# Login ke MySQL
mysql -u iware_user -p iware_warehouse

# Check tables
SHOW TABLES;

# Check user superadmin
SELECT * FROM users WHERE email = 'superadmin@iware.id';

# Exit
EXIT;
```

### 6.3 Generate Password Baru (Optional)

```bash
cd /var/www/iware/backend

# Generate password hash baru
node scripts/generatePassword.js

# Copy hash yang dihasilkan
# Update di database jika perlu
```

---

## 7. Setup Nginx & Domain

### 7.1 Konfigurasi DNS di Hostinger

1. Login ke Hostinger Panel
2. Pilih domain anda
3. Masuk ke DNS/Name Servers
4. Tambah A Record:
   - Type: **A**
   - Name: **werehouse** (atau @ untuk root domain)
   - Points to: **IP_VPS_ANDA**
   - TTL: **14400**
5. Save changes
6. Tunggu propagasi DNS (5-30 menit)

### 7.2 Buat Konfigurasi Nginx

```bash
# Buat file konfigurasi
nano /etc/nginx/sites-available/iware
```

**Paste konfigurasi berikut:**
```nginx
server {
    listen 80;
    listen [::]:80;
    server_name werehouse.iwareid.com;

    # Frontend (static files dari build)
    root /var/www/iware/frontend/dist;
    index index.html;

    # Logs
    access_log /var/log/nginx/iware-access.log;
    error_log /var/log/nginx/iware-error.log;

    # Frontend routes (SPA)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;
}
```

**Simpan:** Ctrl+O, Enter, Ctrl+X

### 7.3 Aktifkan Konfigurasi

```bash
# Buat symbolic link
ln -s /etc/nginx/sites-available/iware /etc/nginx/sites-enabled/

# Hapus default config (optional)
rm /etc/nginx/sites-enabled/default

# Test konfigurasi
nginx -t

# Reload Nginx
systemctl reload nginx
```

---

## 8. Setup SSL (HTTPS)

### 8.1 Install Certbot

```bash
# Install Certbot
apt install -y certbot python3-certbot-nginx
```

### 8.2 Generate SSL Certificate

```bash
# Generate certificate (ganti domain)
certbot --nginx -d werehouse.iwareid.com

# Ikuti instruksi:
# - Masukkan email
# - Agree to terms: Y
# - Share email: N (optional)
# - Redirect HTTP to HTTPS: 2 (Yes)
```

### 8.3 Auto-Renewal SSL

```bash
# Test auto-renewal
certbot renew --dry-run

# Setup cron job (sudah otomatis)
systemctl status certbot.timer
```

---

## 9. Testing & Verifikasi

### 9.1 Start Backend dengan PM2

```bash
cd /var/www/iware/backend

# Start dengan PM2
pm2 start ecosystem.config.js

# Check status
pm2 status

# View logs
pm2 logs iware-backend

# Save PM2 process list
pm2 save
```

### 9.2 Test Aplikasi

**Test Backend API:**
```bash
# Test health check
curl http://localhost:5000/api/health

# Test dari luar
curl https://werehouse.iwareid.com/api/health
```

**Test Frontend:**
1. Buka browser
2. Akses: https://werehouse.iwareid.com
3. Harus muncul halaman login

### 9.3 Test Login

**Default credentials:**
```
Email: superadmin@iware.id
Password: jasad666
```

**Jika gagal login:**
```bash
cd /var/www/iware/backend

# Verifikasi setup
node scripts/verifySetup.js

# Test login
node scripts/testLogin.js
```

### 9.4 Test Accurate Integration

1. Login ke aplikasi
2. Masuk ke halaman Items
3. Klik "Sync dari Accurate"
4. Data harus muncul dari Accurate Online

---

## 10. Monitoring & Maintenance

### 10.1 PM2 Commands

```bash
# Status semua process
pm2 status

# Logs real-time
pm2 logs

# Logs specific app
pm2 logs iware-backend

# Restart app
pm2 restart iware-backend

# Stop app
pm2 stop iware-backend

# Delete app dari PM2
pm2 delete iware-backend

# Monitor (dashboard)
pm2 monit
```

### 10.2 Nginx Commands

```bash
# Status
systemctl status nginx

# Restart
systemctl restart nginx

# Reload (tanpa downtime)
systemctl reload nginx

# Test config
nginx -t

# View logs
tail -f /var/log/nginx/iware-access.log
tail -f /var/log/nginx/iware-error.log
```

### 10.3 MySQL Commands

```bash
# Login
mysql -u iware_user -p iware_warehouse

# Backup database
mysqldump -u iware_user -p iware_warehouse > backup_$(date +%Y%m%d).sql

# Restore database
mysql -u iware_user -p iware_warehouse < backup_20240101.sql
```

### 10.4 Update Aplikasi

```bash
cd /var/www/iware

# Pull latest code
git pull origin main

# Update backend
cd backend
npm install --production
pm2 restart iware-backend

# Update frontend
cd ../frontend
npm install
npm run build

# Reload Nginx
systemctl reload nginx
```

---

## 11. Cara Hapus Aplikasi dari VPS

### 11.1 Stop Semua Services

```bash
# Stop PM2 process
pm2 stop iware-backend
pm2 delete iware-backend
pm2 save

# Stop Nginx (optional, jika tidak ada app lain)
systemctl stop nginx
```

### 11.2 Hapus Database

```bash
# Login ke MySQL
mysql -u root -p

# Backup dulu (PENTING!)
mysqldump -u iware_user -p iware_warehouse > /root/backup_before_delete.sql

# Hapus database
DROP DATABASE iware_warehouse;

# Hapus user
DROP USER 'iware_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 11.3 Hapus File Aplikasi

```bash
# Backup dulu (optional)
cd /var/www
tar -czf /root/iware_backup_$(date +%Y%m%d).tar.gz iware/

# Hapus folder aplikasi
rm -rf /var/www/iware

# Verifikasi
ls -la /var/www/
```

### 11.4 Hapus Konfigurasi Nginx

```bash
# Hapus symbolic link
rm /etc/nginx/sites-enabled/iware

# Hapus file konfigurasi
rm /etc/nginx/sites-available/iware

# Test config
nginx -t

# Reload Nginx
systemctl reload nginx
```

### 11.5 Hapus SSL Certificate

```bash
# Hapus certificate (ganti domain)
certbot delete --cert-name werehouse.iwareid.com

# Verifikasi
certbot certificates
```

### 11.6 Hapus Logs

```bash
# Hapus logs Nginx
rm /var/log/nginx/iware-*

# Hapus logs PM2
rm -rf /root/.pm2/logs/iware-*
```

### 11.7 Cleanup Dependencies (Optional)

**HATI-HATI: Hanya jika tidak ada aplikasi lain!**

```bash
# Uninstall Node.js
apt remove -y nodejs npm

# Uninstall MySQL
apt remove -y mysql-server mysql-client
apt autoremove -y

# Uninstall Nginx
apt remove -y nginx
apt autoremove -y

# Uninstall PM2
npm uninstall -g pm2
```

### 11.8 Hapus DNS Record

1. Login ke Hostinger Panel
2. Pilih domain
3. Masuk ke DNS Settings
4. Hapus A Record untuk subdomain werehouse
5. Save changes

### 11.9 Verifikasi Penghapusan

```bash
# Check PM2
pm2 list  # Harus kosong atau tidak ada iware-backend

# Check Nginx
ls /etc/nginx/sites-enabled/  # Tidak ada file iware

# Check folder
ls /var/www/  # Tidak ada folder iware

# Check database
mysql -u root -p -e "SHOW DATABASES;"  # Tidak ada iware_warehouse

# Check ports
netstat -tulpn | grep :5000  # Tidak ada yang listening
netstat -tulpn | grep :80    # Nginx mungkin masih jalan jika ada app lain
```

### 11.10 Script Otomatis Hapus Aplikasi

Buat file untuk mempermudah penghapusan:

```bash
nano /root/uninstall-iware.sh
```

**Paste script berikut:**
```bash
#!/bin/bash

echo "========================================="
echo "  UNINSTALL iWare Application"
echo "========================================="
echo ""

# Konfirmasi
read -p "Apakah Anda yakin ingin menghapus aplikasi iWare? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "Dibatalkan."
    exit 0
fi

echo ""
echo "1. Backup database..."
mysqldump -u iware_user -p iware_warehouse > /root/iware_backup_$(date +%Y%m%d_%H%M%S).sql
echo "✓ Database di-backup ke /root/"

echo ""
echo "2. Backup files..."
cd /var/www
tar -czf /root/iware_files_backup_$(date +%Y%m%d_%H%M%S).tar.gz iware/
echo "✓ Files di-backup ke /root/"

echo ""
echo "3. Stop PM2 process..."
pm2 stop iware-backend
pm2 delete iware-backend
pm2 save
echo "✓ PM2 process dihentikan"

echo ""
echo "4. Hapus database..."
mysql -u root -p -e "DROP DATABASE iware_warehouse; DROP USER 'iware_user'@'localhost'; FLUSH PRIVILEGES;"
echo "✓ Database dihapus"

echo ""
echo "5. Hapus files..."
rm -rf /var/www/iware
echo "✓ Files dihapus"

echo ""
echo "6. Hapus Nginx config..."
rm /etc/nginx/sites-enabled/iware
rm /etc/nginx/sites-available/iware
nginx -t && systemctl reload nginx
echo "✓ Nginx config dihapus"

echo ""
echo "7. Hapus SSL certificate..."
certbot delete --cert-name werehouse.iwareid.com
echo "✓ SSL certificate dihapus"

echo ""
echo "8. Hapus logs..."
rm /var/log/nginx/iware-*
rm -rf /root/.pm2/logs/iware-*
echo "✓ Logs dihapus"

echo ""
echo "========================================="
echo "  ✓ Uninstall Selesai!"
echo "========================================="
echo ""
echo "Backup tersimpan di:"
echo "  - Database: /root/iware_backup_*.sql"
echo "  - Files: /root/iware_files_backup_*.tar.gz"
echo ""
```

**Simpan dan jalankan:**
```bash
# Beri permission
chmod +x /root/uninstall-iware.sh

# Jalankan
/root/uninstall-iware.sh
```

---

## 12. Troubleshooting

### Problem 1: Backend tidak bisa start

**Solusi:**
```bash
# Check logs
pm2 logs iware-backend

# Check port
netstat -tulpn | grep :5000

# Kill process jika ada
kill -9 $(lsof -t -i:5000)

# Restart
pm2 restart iware-backend
```

### Problem 2: Nginx 502 Bad Gateway

**Solusi:**
```bash
# Check backend running
pm2 status

# Check Nginx error log
tail -f /var/log/nginx/iware-error.log

# Restart backend
pm2 restart iware-backend

# Restart Nginx
systemctl restart nginx
```

### Problem 3: Database connection error

**Solusi:**
```bash
# Check MySQL running
systemctl status mysql

# Test connection
mysql -u iware_user -p iware_warehouse

# Check .env file
cat /var/www/iware/backend/.env | grep DB_

# Restart MySQL
systemctl restart mysql
```

### Problem 4: SSL certificate error

**Solusi:**
```bash
# Renew certificate
certbot renew --force-renewal

# Check certificate
certbot certificates

# Restart Nginx
systemctl restart nginx
```

### Problem 5: Accurate API error

**Solusi:**
```bash
cd /var/www/iware/backend

# Test connection
node scripts/testAccurateConnection.js

# Check token di .env
cat .env | grep ACCURATE_

# Generate new token jika expired
node scripts/generateToken.js
```

### Problem 6: Frontend tidak muncul

**Solusi:**
```bash
# Check build folder
ls -la /var/www/iware/frontend/dist/

# Rebuild frontend
cd /var/www/iware/frontend
npm run build

# Check Nginx config
nginx -t

# Reload Nginx
systemctl reload nginx
```

### Problem 7: Permission denied

**Solusi:**
```bash
# Fix ownership
chown -R www-data:www-data /var/www/iware

# Fix permissions
chmod -R 755 /var/www/iware

# Restart services
pm2 restart all
systemctl restart nginx
```

---

## 📞 Support & Bantuan

Jika mengalami masalah:

1. Check logs:
   - PM2: `pm2 logs`
   - Nginx: `tail -f /var/log/nginx/iware-error.log`
   - MySQL: `tail -f /var/log/mysql/error.log`

2. Restart services:
   ```bash
   pm2 restart all
   systemctl restart nginx
   systemctl restart mysql
   ```

3. Verifikasi setup:
   ```bash
   cd /var/www/iware/backend
   node scripts/verifySetup.js
   ```

---

## ✅ Checklist Deployment

- [ ] VPS sudah aktif dan bisa diakses via SSH
- [ ] Domain/subdomain sudah pointing ke IP VPS
- [ ] Node.js, MySQL, Nginx, PM2 sudah terinstall
- [ ] Database sudah dibuat dan di-import
- [ ] Source code sudah di-upload
- [ ] File .env sudah dikonfigurasi dengan benar
- [ ] Accurate token sudah dimasukkan dan ditest
- [ ] Nginx config sudah dibuat dan aktif
- [ ] SSL certificate sudah terinstall
- [ ] Backend berjalan dengan PM2
- [ ] Frontend sudah di-build
- [ ] Aplikasi bisa diakses via browser
- [ ] Login berhasil
- [ ] Sync Accurate berhasil

---

## 🎉 Selesai!

Aplikasi iWare sudah berhasil di-hosting di VPS Hostinger!

**Akses aplikasi:**
- URL: https://werehouse.iwareid.com
- Login: superadmin@iware.id / jasad666

**Jangan lupa:**
- Ubah password default setelah login pertama
- Backup database secara berkala
- Monitor logs secara rutin
- Update aplikasi secara berkala

---

**Dibuat dengan ❤️ untuk iWare**
