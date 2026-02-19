# 🚀 Panduan Lengkap Hosting Aplikasi iWare di VPS Hostinger

Panduan ini akan membantu Anda melakukan hosting aplikasi iWare Warehouse Monitoring System di VPS Hostinger dari awal sampai aplikasi berjalan dengan integrasi Accurate Online.

---

## 📋 Daftar Isi

1. [Persiapan Awal](#1-persiapan-awal)
2. [Setup VPS Hostinger](#2-setup-vps-hostinger)
3. [Install Dependencies](#3-install-dependencies)
4. [Setup Database MySQL](#4-setup-database-mysql)
5. [Upload & Konfigurasi Aplikasi](#5-upload--konfigurasi-aplikasi)
6. [Konfigurasi Integrasi Accurate Online](#6-konfigurasi-integrasi-accurate-online)
7. [Setup Nginx & Domain](#7-setup-nginx--domain)
8. [Setup SSL (HTTPS)](#8-setup-ssl-https)
9. [Jalankan Aplikasi](#9-jalankan-aplikasi)
10. [Testing & Verifikasi](#10-testing--verifikasi)
11. [Maintenance & Troubleshooting](#11-maintenance--troubleshooting)

---

## 1. Persiapan Awal

### Yang Anda Butuhkan:

✅ **VPS Hostinger** (minimal 2GB RAM, 2 CPU Core)  
✅ **Domain/Subdomain** (contoh: werehouse.iwareid.com)  
✅ **Akun Accurate Online** dengan akses API  
✅ **SSH Client** (PuTTY untuk Windows, Terminal untuk Mac/Linux)  
✅ **Git** (untuk clone repository)

### Informasi Accurate Online yang Diperlukan:

- **Access Token** (dari Accurate Online Developer Console)
- **Database ID** (ID database Accurate Anda)
- **Client ID** (jika menggunakan OAuth)
- **Client Secret** (jika menggunakan OAuth)

### Cara Mendapatkan Accurate Access Token:

1. Login ke [Accurate Online](https://web.accurate.id)
2. Buka **Developer Console**: https://account.accurate.id/developer
3. Buat aplikasi baru atau gunakan yang sudah ada
4. Copy **Access Token** dan **Database ID**

---

## 2. Setup VPS Hostinger

### 2.1 Login ke VPS

1. Buka **hPanel Hostinger** → **VPS** → Pilih VPS Anda
2. Catat **IP Address** VPS Anda
3. Login via SSH:

```bash
ssh root@IP_VPS_ANDA
# Masukkan password yang dikirim Hostinger via email
```

### 2.2 Update System

```bash
apt update && apt upgrade -y
```

### 2.3 Setup Firewall

```bash
# Install UFW
apt install -y ufw

# Allow SSH, HTTP, HTTPS
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp

# Enable firewall
ufw --force enable

# Check status
ufw status
```

---

## 3. Install Dependencies

### 3.1 Install Node.js 18.x

```bash
# Install Node.js repository
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -

# Install Node.js
apt install -y nodejs

# Verify installation
node --version  # Should show v18.x.x
npm --version   # Should show 9.x.x or higher
```

### 3.2 Install MySQL 8.0

```bash
# Install MySQL Server
apt install -y mysql-server

# Start MySQL
systemctl start mysql
systemctl enable mysql

# Secure MySQL installation
mysql_secure_installation
```

**Jawab pertanyaan berikut:**
- Set root password: **YES** (buat password yang kuat)
- Remove anonymous users: **YES**
- Disallow root login remotely: **YES**
- Remove test database: **YES**
- Reload privilege tables: **YES**

### 3.3 Install PM2 (Process Manager)

```bash
npm install -g pm2

# Setup PM2 startup
pm2 startup systemd
# Jalankan command yang muncul
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

### 3.5 Install Git & Tools

```bash
apt install -y git curl wget nano
```

### 3.6 Install Certbot (untuk SSL)

```bash
apt install -y certbot python3-certbot-nginx
```

---

## 4. Setup Database MySQL

### 4.1 Install dan Secure MySQL

```bash
# MySQL sudah terinstall dari langkah sebelumnya
# Jalankan secure installation
mysql_secure_installation
```

**Jawab pertanyaan berikut:**
- Set root password: **YES** (buat password yang kuat, catat password ini!)
- Remove anonymous users: **YES**
- Disallow root login remotely: **YES**
- Remove test database: **YES**
- Reload privilege tables: **YES**

### 4.2 Verifikasi MySQL Berjalan

```bash
# Check MySQL status
systemctl status mysql

# Test login
mysql -u root -p -h 127.0.0.1
# Masukkan password root yang baru dibuat
# Ketik EXIT; untuk keluar
```

**⚠️ PENTING:** Catat password root MySQL, Anda akan membutuhkannya di langkah selanjutnya!

**Note:** Database dan user akan dibuat otomatis menggunakan script interaktif di langkah 5.3

---

## 5. Upload & Konfigurasi Aplikasi

### 5.1 Clone Repository

```bash
# Buat direktori aplikasi
mkdir -p /var/www/iware
cd /var/www/iware

# Clone repository (ganti dengan URL repo Anda)
git clone https://github.com/USERNAME/REPO_NAME.git .

# Atau upload manual via SFTP/SCP
```

### 5.2 Setup Backend

```bash
cd /var/www/iware/backend

# Install dependencies
npm install --production

# Copy .env example
cp .env.example .env

# Edit .env
nano .env
```

**Isi file `.env` dengan konfigurasi berikut:**

```env
# Server Configuration
PORT=5000
NODE_ENV=production

# Database Configuration
DB_HOST=127.0.0.1
DB_USER=iware_user
DB_PASSWORD=PASSWORD_DATABASE_ANDA
DB_NAME=iware_warehouse

# JWT Secret (generate random string)
JWT_SECRET=RANDOM_STRING_32_KARAKTER
JWT_EXPIRE=7d

# Accurate Online API
ACCURATE_API_URL=https://public-api.accurate.id/api
ACCURATE_ACCESS_TOKEN=aat.NTA.eyJ2IjoxLCJ1IjoyNjUzMDcsImQiOjExODA3OCwiYWkiOjY1MTExLCJhayI6IjliZWY0OGI0LWQ2OWMtNDFiMy1hOThiLTc1MmY2ZWU3OGZkNyIsImFuIjoiaXdhcmV3ZXJlaG91c2UiLCJhcCI6IjkyNTM5ZmUwLTBmMzctNDUwYy04MTBjLWU0Y2EyOWU0NGI2OSIsInQiOjE3NzE0NjY1OTE0OTR9.JYN8jFpbRxR4vkVQ0YD4v6M0PNeCdYI39p21uA/ve20WIwpgvyy6t9rJK88WzKBerTK4WMJ+DmjISy22lgG8d2/1zSCXEAKCfiiIIOGyeSgyjL5O8NzwjP6tyqEuX2hMwQUYPgMxdHQBaGURJFlwAE5xcoFUlNtzTfubvbXIrWGeV7AfL3TxIsumzi0qvrLQprQGx1OcW24=.SaYIuBxZVA6JDnJB/sI7fNGSu6YFotc7giT3WiFokMU
ACCURATE_DATABASE_ID=118078

# Accurate OAuth (opsional, untuk refresh token otomatis)
ACCURATE_CLIENT_ID=92539fe0-0f37-450c-810c-e4ca29e44b69
ACCURATE_CLIENT_SECRET=1884d3742a4c536d17ed6b922360cb60
ACCURATE_REDIRECT_URI=https://DOMAIN_ANDA.com/api/accurate/callback

# CORS (ganti dengan domain Anda)
CORS_ORIGIN=https://werehouse.iwareid.com
```

**Generate JWT Secret:**

```bash
# Generate random string untuk JWT_SECRET
openssl rand -base64 32
```

### 5.3 Import Database Schema

**Metode 1: Setup Interaktif (PALING MUDAH - RECOMMENDED)**

```bash
cd /var/www/iware/backend

# Jalankan setup interaktif
npm run setup-interactive
```

Script ini akan:
- Meminta kredensial MySQL root
- Membuat database otomatis
- Membuat user database otomatis
- Import schema otomatis
- Update file .env otomatis

**Jawab pertanyaan berikut:**
```
MySQL Host [127.0.0.1]: (tekan Enter)
MySQL Root Username [root]: (tekan Enter)
MySQL Root Password: (masukkan password root MySQL)

Nama Database [iware_warehouse]: (tekan Enter)
Database Username [iware_user]: (tekan Enter)
Database Password: (buat password yang kuat)
```

**⚠️ PENTING:** Beberapa warning seperti "Unknown column 'username'" adalah NORMAL dan bisa diabaikan. Yang penting adalah tabel berhasil dibuat.

**Verifikasi database berhasil:**

```bash
# Check database
npm run check-db

# Harus menampilkan:
# ✓ Found 5 tables:
#   users
#   items
#   sales_orders
#   activity_logs
#   accurate_tokens
```

**Jika tidak ada user superadmin:**

```bash
# Fix login dan buat user superadmin
npm run fix-login
```

**Metode 2: Import Manual**

Jika Anda sudah membuat database dan user secara manual:

```bash
cd /var/www/iware/backend

# Import schema langsung
mysql -u iware_user -p -h 127.0.0.1 iware_warehouse < SETUP_LENGKAP.sql

# Check hasilnya
npm run check-db
```

### 5.4 Setup Frontend

```bash
cd /var/www/iware/frontend

# Install dependencies
npm install

# Build untuk production
npm run build
```

**Build akan menghasilkan folder `dist` yang berisi file static.**

---

## 6. Konfigurasi Integrasi Accurate Online

### 6.1 Verifikasi Koneksi Accurate

```bash
cd /var/www/iware/backend

# Test koneksi Accurate
npm run test-accurate
```

**Output yang diharapkan:**
```
✓ Environment variables loaded
✓ Database connected
✓ Table accurate_tokens found
✓ Koneksi ke Accurate Online berhasil!
```

**Jika tabel `accurate_tokens` tidak ditemukan:**

```bash
# Buat tabel accurate_tokens
npm run add-accurate-table

# Test lagi
npm run test-accurate
```

### 6.2 Setup Accurate Tokens Table

```bash
# Jalankan script untuk membuat tabel tokens
node scripts/addAccurateTokensTable.js
```

### 6.3 Test API Accurate

```bash
# Quick test Accurate API
node scripts/quickTestAccurate.js
```

### 6.4 Konfigurasi Webhook (Opsional)

Jika Anda ingin menerima notifikasi real-time dari Accurate:

1. Login ke [Accurate Developer Console](https://account.accurate.id/developer)
2. Pilih aplikasi Anda
3. Setup **Webhook URL**: `https://DOMAIN_ANDA.com/api/accurate/webhook`
4. Pilih events yang ingin di-subscribe

---

## 7. Setup Nginx & Domain

### 7.1 Setup DNS

Di **Hostinger DNS Management** atau DNS provider Anda:

1. Buat **A Record**:
   - Name: `werehouse` (atau subdomain yang Anda inginkan)
   - Type: `A`
   - Value: `IP_VPS_ANDA`
   - TTL: `3600`

2. Tunggu propagasi DNS (5-30 menit)

### 7.2 Konfigurasi Nginx

```bash
# Buat file konfigurasi Nginx
nano /etc/nginx/sites-available/iware
```

**Paste konfigurasi berikut:**

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name werehouse.iwareid.com;

    # Root directory untuk frontend
    root /var/www/iware/frontend/dist;
    index index.html;

    # Logs
    access_log /var/log/nginx/iware-access.log;
    error_log /var/log/nginx/iware-error.log;

    # Frontend - serve static files
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API - proxy ke Node.js
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
        
        # Timeout settings untuk Accurate API
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
    gzip_types text/plain text/css text/xml text/javascript 
               application/x-javascript application/xml+rss 
               application/json application/javascript;
}
```

**⚠️ Ganti `werehouse.iwareid.com` dengan domain Anda!**

### 7.3 Aktifkan Konfigurasi

```bash
# Buat symbolic link
ln -s /etc/nginx/sites-available/iware /etc/nginx/sites-enabled/

# Hapus default config
rm -f /etc/nginx/sites-enabled/default

# Test konfigurasi
nginx -t

# Reload Nginx
systemctl reload nginx
```

---

## 8. Setup SSL (HTTPS)

### 8.1 Generate SSL Certificate dengan Certbot

```bash
# Generate SSL certificate
certbot --nginx -d werehouse.iwareid.com

# Ikuti instruksi:
# 1. Masukkan email Anda
# 2. Agree to terms: Yes
# 3. Share email: No (opsional)
# 4. Redirect HTTP to HTTPS: Yes (pilih 2)
```

### 8.2 Verifikasi SSL

```bash
# Check certificate
certbot certificates

# Test auto-renewal
certbot renew --dry-run
```

**SSL certificate akan otomatis diperpanjang setiap 90 hari.**

### 8.3 Update CORS di Backend

```bash
nano /var/www/iware/backend/.env
```

Update `CORS_ORIGIN`:
```env
CORS_ORIGIN=https://werehouse.iwareid.com
```

---

## 9. Jalankan Aplikasi

### 9.1 Setup PM2 Ecosystem

File `ecosystem.config.js` sudah ada di folder backend:

```bash
cd /var/www/iware/backend
cat ecosystem.config.js
```

### 9.2 Start Backend dengan PM2

```bash
cd /var/www/iware/backend

# Start aplikasi
pm2 start ecosystem.config.js

# Save PM2 process list
pm2 save

# Check status
pm2 status

# View logs
pm2 logs iware-backend
```

### 9.3 Setup PM2 Startup

```bash
# Generate startup script
pm2 startup systemd

# Jalankan command yang muncul (biasanya seperti ini):
# sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u root --hp /root

# Save current process list
pm2 save
```

**Aplikasi sekarang akan otomatis start saat VPS reboot!**

---

## 10. Testing & Verifikasi

### 10.1 Test Backend API

```bash
# Test health check
curl http://localhost:5000/api/health

# Expected output:
# {"status":"ok","timestamp":"..."}
```

### 10.2 Test Accurate Integration

```bash
cd /var/www/iware/backend

# Test Accurate connection
node scripts/testAccurateConnection.js

# Quick test Accurate API
node scripts/quickTestAccurate.js
```

### 10.3 Test Login

```bash
# Generate password untuk user
node scripts/generatePassword.js

# Test login
node scripts/testLogin.js
```

### 10.4 Test dari Browser

1. Buka browser: `https://werehouse.iwareid.com`
2. Login dengan kredensial default:
   - Username: `superadmin`
   - Password: `Admin123!` (atau yang Anda set)

### 10.5 Test Integrasi Accurate

1. Login ke aplikasi
2. Buka menu **Settings** → **Accurate Integration**
3. Klik **Test Connection**
4. Jika berhasil, akan muncul: ✓ Connected to Accurate Online

---

## 11. Maintenance & Troubleshooting

**📖 Untuk troubleshooting lengkap, lihat file [TROUBLESHOOTING.md](TROUBLESHOOTING.md)**

### 11.1 Monitoring Aplikasi

```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs iware-backend

# Monitor resources
pm2 monit

# Check Nginx logs
tail -f /var/log/nginx/iware-access.log
tail -f /var/log/nginx/iware-error.log
```

### 11.2 Restart Aplikasi

```bash
# Restart backend
pm2 restart iware-backend

# Restart Nginx
systemctl restart nginx

# Restart MySQL
systemctl restart mysql
```

### 11.3 Update Aplikasi

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

### 11.4 Backup Database

```bash
# Manual backup
mysqldump -u iware_user -p iware_warehouse > /root/backup_$(date +%Y%m%d).sql

# Setup automatic backup (crontab)
crontab -e

# Add this line (backup setiap hari jam 2 pagi):
0 2 * * * mysqldump -u iware_user -pPASSWORD iware_warehouse > /root/backup_$(date +\%Y\%m\%d).sql
```

### 11.5 Troubleshooting Umum

#### ❌ Backend tidak bisa connect ke database

**Error: `ECONNREFUSED ::1:3306`**

Ini terjadi karena Node.js mencoba connect ke MySQL via IPv6 tapi MySQL hanya listen di IPv4.

**Solusi:**

```bash
# 1. Update .env file
nano /var/www/iware/backend/.env

# Ganti DB_HOST dari localhost ke 127.0.0.1:
DB_HOST=127.0.0.1

# 2. Test koneksi MySQL
mysql -u iware_user -p -h 127.0.0.1 iware_warehouse

# 3. Restart backend
pm2 restart iware-backend
```

**Atau konfigurasi MySQL untuk listen di IPv6:**

```bash
# Edit MySQL config
nano /etc/mysql/mysql.conf.d/mysqld.cnf

# Pastikan bind-address adalah:
bind-address = 0.0.0.0

# Restart MySQL
systemctl restart mysql
```

**Error: `Access denied for user`**

```bash
# Check MySQL status
systemctl status mysql

# Check database credentials
mysql -u iware_user -p iware_warehouse

# Reset password jika perlu
mysql -u root -p
# Kemudian:
ALTER USER 'iware_user'@'localhost' IDENTIFIED BY 'PASSWORD_BARU';
FLUSH PRIVILEGES;

# Update .env file
nano /var/www/iware/backend/.env
```

#### ❌ Accurate API error 401 (Unauthorized)

```bash
# Token expired, perlu refresh
# 1. Login ke Accurate Developer Console
# 2. Generate new Access Token
# 3. Update .env file
nano /var/www/iware/backend/.env

# 4. Restart backend
pm2 restart iware-backend
```

#### ❌ Frontend tidak bisa akses backend API

```bash
# Check CORS settings
cat /var/www/iware/backend/.env | grep CORS

# Check Nginx proxy
nginx -t
systemctl reload nginx

# Check backend logs
pm2 logs iware-backend
```

#### ❌ SSL certificate error

```bash
# Renew certificate
certbot renew

# Force renew
certbot renew --force-renewal

# Check certificate
certbot certificates
```

### 11.6 Performance Optimization

```bash
# Enable PM2 cluster mode (untuk multi-core)
pm2 delete iware-backend
pm2 start ecosystem.config.js --instances max

# Setup log rotation
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7

# Optimize MySQL
nano /etc/mysql/mysql.conf.d/mysqld.cnf
# Add:
# innodb_buffer_pool_size = 1G
# max_connections = 200

systemctl restart mysql
```

---

## 📞 Support & Resources

### Dokumentasi:
- **Accurate API**: https://accurate.id/api-documentation
- **PM2**: https://pm2.keymetrics.io/docs
- **Nginx**: https://nginx.org/en/docs
- **Certbot**: https://certbot.eff.org/docs

### Useful Commands:

```bash
# Check all services
systemctl status nginx mysql

# Check disk space
df -h

# Check memory usage
free -h

# Check CPU usage
top

# Check open ports
netstat -tulpn | grep LISTEN

# Check PM2 processes
pm2 list

# View real-time logs
pm2 logs --lines 100

# Import database (jika npm run setup gagal)
cd /var/www/iware/backend
npm run import-db

# Test MySQL connection
mysql -u iware_user -p -h 127.0.0.1 iware_warehouse

# Check MySQL is running
systemctl status mysql

# Restart all services
pm2 restart all
systemctl restart nginx
systemctl restart mysql
```

---

## ✅ Checklist Deployment

- [ ] VPS Hostinger sudah aktif
- [ ] Domain/subdomain sudah pointing ke IP VPS
- [ ] Dependencies terinstall (Node.js, MySQL, Nginx, PM2)
- [ ] Database MySQL sudah dibuat dan schema diimport
- [ ] Aplikasi sudah diupload dan dikonfigurasi
- [ ] File `.env` sudah diisi dengan benar
- [ ] Accurate Access Token sudah valid
- [ ] Nginx sudah dikonfigurasi
- [ ] SSL certificate sudah terinstall
- [ ] Backend berjalan dengan PM2
- [ ] Frontend bisa diakses via browser
- [ ] Login berhasil
- [ ] Integrasi Accurate berfungsi
- [ ] Backup database sudah dijadwalkan

---

## 🎉 Selamat!

Aplikasi iWare Warehouse Monitoring System Anda sudah berhasil di-hosting di VPS Hostinger dengan integrasi Accurate Online!

**URL Aplikasi:** https://werehouse.iwareid.com

**Login Default:**
- Username: `superadmin`
- Password: `Admin123!`

**⚠️ PENTING:** Segera ganti password default setelah login pertama kali!

---

**Dibuat dengan ❤️ untuk iWare Team**
