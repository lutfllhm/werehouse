# Panduan Deploy ke VPS Hostinger
## Aplikasi Terintegrasi dengan Accurate Online - Dari Nol Sampai Berhasil

---

## 📋 Daftar Isi
1. [Persiapan VPS Hostinger](#1-persiapan-vps-hostinger)
2. [Setup Domain & DNS](#2-setup-domain--dns)
3. [Koneksi ke VPS](#3-koneksi-ke-vps)
4. [Install Software yang Diperlukan](#4-install-software-yang-diperlukan)
5. [Setup Database MySQL](#5-setup-database-mysql)
6. [Upload & Setup Aplikasi](#6-upload--setup-aplikasi)
7. [Konfigurasi Nginx](#7-konfigurasi-nginx)
8. [Setup SSL Certificate (HTTPS)](#8-setup-ssl-certificate-https)
9. [Konfigurasi Accurate Online](#9-konfigurasi-accurate-online)
10. [Setup PM2 untuk Auto-Restart](#10-setup-pm2-untuk-auto-restart)
11. [Testing & Verifikasi](#11-testing--verifikasi)
12. [Troubleshooting](#12-troubleshooting)

---

## 1. Persiapan VPS Hostinger

### Yang Anda Butuhkan:
- ✅ VPS Hostinger aktif (minimal 2GB RAM)
- ✅ Domain (bisa beli di Hostinger atau registrar lain)
- ✅ Akun Accurate Online aktif
- ✅ SSH client (PuTTY untuk Windows atau Terminal untuk Mac/Linux)

### Spesifikasi VPS Recommended:
- **RAM**: 2GB atau lebih
- **Storage**: 20GB atau lebih
- **OS**: Ubuntu 24.04 LTS (atau 22.04 LTS)
- **CPU**: 1 core atau lebih

**PENTING**: Jika VPS Anda menggunakan Ubuntu 25.10, ikuti instruksi khusus di bagian instalasi MySQL (Langkah 4.2).

### Informasi yang Perlu Dicatat:
Dari panel Hostinger VPS, catat:
- IP Address VPS: `xxx.xxx.xxx.xxx`
- SSH Port: biasanya `22`
- Root Password: (dikirim via email atau bisa reset di panel)

---

## 2. Setup Domain & DNS

### Langkah 1: Pointing Domain ke VPS

Login ke panel domain Anda (Hostinger atau registrar lain):

1. Masuk ke **DNS Management** atau **DNS Zone**
2. Tambahkan/edit record berikut:

```
Type    Name    Value               TTL
A       @       [IP_VPS_ANDA]       3600
A       www     [IP_VPS_ANDA]       3600
```

Contoh:
```
A       @       123.45.67.89        3600
A       www     123.45.67.89        3600
```

3. Simpan perubahan
4. Tunggu propagasi DNS (5-30 menit)

### Langkah 2: Verifikasi DNS

Buka Command Prompt/Terminal dan test:

```bash
ping yourdomain.com
```

Jika sudah mengarah ke IP VPS Anda, DNS sudah siap!

---

## 3. Koneksi ke VPS

### Untuk Windows (menggunakan PuTTY):

1. Download PuTTY: https://www.putty.org/
2. Buka PuTTY
3. Isi:
   - **Host Name**: IP VPS Anda
   - **Port**: 22
   - **Connection Type**: SSH
4. Klik **Open**
5. Login:
   - **Username**: `root`
   - **Password**: [password dari Hostinger]

### Untuk Mac/Linux (menggunakan Terminal):

```bash
ssh root@[IP_VPS_ANDA]
# Masukkan password saat diminta
```

### Setelah Login Pertama Kali:

Update sistem:

```bash
apt update && apt upgrade -y
```

---

## 4. Install Software yang Diperlukan

### Langkah 1: Install Node.js (versi 18 LTS)

```bash
# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Verifikasi instalasi
node --version
npm --version
```

Output yang benar:
```
v18.x.x
9.x.x
```

### Langkah 2: Install MySQL

**Untuk Ubuntu 24.04 LTS atau 22.04 LTS:**

```bash
# Install MySQL Server
apt install -y mysql-server

# Start MySQL service
systemctl start mysql
systemctl enable mysql

# Verifikasi
systemctl status mysql
```

**Untuk Ubuntu 25.10 (Gunakan Docker - Recommended):**

Ubuntu 25.10 masih versi development dengan dependency yang belum stabil. Solusi terbaik adalah menggunakan MySQL via Docker:

```bash
# Install Docker
apt update
apt install -y docker.io

# Start dan enable Docker
systemctl start docker
systemctl enable docker

# Jalankan MySQL di Docker
docker run -d \
  --name mysql \
  -e MYSQL_ROOT_PASSWORD=your_strong_root_password \
  -p 3306:3306 \
  --restart unless-stopped \
  -v mysql-data:/var/lib/mysql \
  mysql:8.0

# Verifikasi MySQL berjalan
docker ps

# Test koneksi
docker exec -it mysql mysql -uroot -p
# Masukkan password: your_strong_root_password
# Ketik EXIT; untuk keluar
```

**Alternatif untuk Ubuntu 25.10 (MariaDB):**

Jika tidak ingin menggunakan Docker:

```bash
# Install MariaDB (lebih kompatibel dengan Ubuntu 25.10)
apt update
apt install -y mariadb-server mariadb-client

# Start MariaDB
systemctl start mariadb
systemctl enable mariadb

# Verifikasi
systemctl status mariadb
```

MariaDB 100% kompatibel dengan MySQL, semua command dan syntax sama.

### Langkah 3: Install Nginx

```bash
# Install Nginx
apt install -y nginx

# Start Nginx
systemctl start nginx
systemctl enable nginx

# Verifikasi
systemctl status nginx
```

Test: Buka browser dan akses `http://[IP_VPS_ANDA]`
Jika muncul halaman "Welcome to nginx", instalasi berhasil!

### Langkah 4: Install PM2 (Process Manager)

```bash
npm install -g pm2
pm2 --version
```

### Langkah 5: Install Git

```bash
apt install -y git
git --version
```

---

## 5. Setup Database MySQL

### Langkah 1: Secure MySQL Installation

**Untuk MySQL standar atau MariaDB:**

```bash
mysql_secure_installation
```

Jawab pertanyaan:
- **Set root password?** Y → masukkan password baru (catat!)
- **Remove anonymous users?** Y
- **Disallow root login remotely?** N (pilih NO agar bisa remote)
- **Remove test database?** Y
- **Reload privilege tables?** Y

**Untuk MySQL di Docker (Ubuntu 25.10):**

Password root sudah diset saat menjalankan container. Langsung lanjut ke Langkah 2.

### Langkah 2: Login ke MySQL

**Untuk MySQL standar atau MariaDB:**

```bash
mysql -u root -p
# Masukkan password yang baru dibuat
```

**Untuk MySQL di Docker:**

```bash
docker exec -it mysql mysql -uroot -p
# Masukkan password: your_strong_root_password
```

### Langkah 3: Buat Database dan User

**Untuk semua versi (MySQL standar, MariaDB, atau Docker):**

```sql
-- Buat database
CREATE DATABASE accurate_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Buat user untuk aplikasi
CREATE USER 'accurate_user'@'localhost' IDENTIFIED BY 'password_yang_kuat_123';

-- Untuk Docker, juga buat user dengan akses dari host
CREATE USER 'accurate_user'@'%' IDENTIFIED BY 'password_yang_kuat_123';

-- Berikan akses penuh ke database
GRANT ALL PRIVILEGES ON accurate_app.* TO 'accurate_user'@'localhost';
GRANT ALL PRIVILEGES ON accurate_app.* TO 'accurate_user'@'%';

-- Refresh privileges
FLUSH PRIVILEGES;

-- Keluar dari MySQL
EXIT;
```

**PENTING**: Catat informasi ini:
- Database name: `accurate_app`
- Username: `accurate_user`
- Password: `password_yang_kuat_123`
- Host: `localhost` (atau `127.0.0.1` untuk Docker)

---

## 6. Upload & Setup Aplikasi

### Langkah 1: Buat Direktori Aplikasi

```bash
# Buat folder untuk aplikasi
mkdir -p /var/www/accurate-app
cd /var/www/accurate-app
```

### Langkah 2: Upload Aplikasi ke VPS

**Opsi A: Menggunakan Git (Recommended)**

Jika project Anda di GitHub/GitLab:

```bash
cd /var/www/accurate-app
git clone https://github.com/username/your-repo.git .
```

**Opsi B: Menggunakan FTP/SFTP**

1. Download FileZilla: https://filezilla-project.org/
2. Koneksi SFTP:
   - **Host**: sftp://[IP_VPS_ANDA]
   - **Username**: root
   - **Password**: [password VPS]
   - **Port**: 22
3. Upload semua file project ke `/var/www/accurate-app/`

**Opsi C: Menggunakan SCP (dari komputer lokal)**

```bash
# Dari komputer lokal (bukan VPS)
scp -r /path/to/your/project/* root@[IP_VPS]:/var/www/accurate-app/
```

### Langkah 3: Install Dependencies Backend

```bash
cd /var/www/accurate-app/backend
npm install --production
```

### Langkah 4: Setup Environment Backend

```bash
cd /var/www/accurate-app/backend
cp .env.example .env
nano .env
```

Edit file `.env` dengan konfigurasi production:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=accurate_user
DB_PASSWORD=password_yang_kuat_123
DB_NAME=accurate_app
DB_PORT=3306

# Server Configuration
PORT=5000
NODE_ENV=production

# JWT Secret (generate yang baru!)
JWT_SECRET=generate_random_string_yang_sangat_panjang_dan_aman

# Accurate API Configuration
ACCURATE_CLIENT_ID=your_client_id
ACCURATE_CLIENT_SECRET=your_client_secret
ACCURATE_REDIRECT_URI=https://yourdomain.com/api/accurate/callback

# Accurate API Token (akan diisi nanti)
ACCURATE_ACCESS_TOKEN=
ACCURATE_REFRESH_TOKEN=
ACCURATE_DATABASE_ID=
```

**Simpan**: Tekan `Ctrl+X`, lalu `Y`, lalu `Enter`

### Langkah 5: Generate JWT Secret

```bash
cd /var/www/accurate-app/backend
node scripts/generatePassword.js
```

Copy output dan paste ke `JWT_SECRET` di file `.env`:

```bash
nano .env
# Edit JWT_SECRET dengan hasil generate
# Simpan: Ctrl+X, Y, Enter
```

### Langkah 6: Import Database

```bash
cd /var/www/accurate-app/backend
mysql -u accurate_user -p accurate_app < SETUP_LENGKAP.sql
# Masukkan password database saat diminta
```

Atau gunakan script setup:

```bash
node scripts/setupDatabase.js
```

### Langkah 7: Verifikasi Database

```bash
node scripts/checkDatabase.js
```

Output yang benar:
```
✓ Database connection successful
✓ All required tables exist
✓ Database setup is complete
```

### Langkah 8: Build Frontend

```bash
cd /var/www/accurate-app/frontend

# Install dependencies
npm install

# Buat file .env untuk production
nano .env
```

Isi file `.env`:

```env
VITE_API_URL=https://yourdomain.com/api
```

Simpan dan build:

```bash
npm run build
```

Folder `dist` akan terbuat dengan file production-ready.

---

## 7. Konfigurasi Nginx

### Langkah 1: Buat Konfigurasi Nginx

```bash
nano /etc/nginx/sites-available/accurate-app
```

Paste konfigurasi berikut:

```nginx
# Backend API Server
upstream backend {
    server localhost:5000;
    keepalive 64;
}

# HTTP Server - Redirect ke HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com www.yourdomain.com;

    # Untuk Let's Encrypt verification
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    # Redirect semua request ke HTTPS
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS Server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Certificate (akan disetup nanti)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Frontend - Serve static files
    location / {
        root /var/www/accurate-app/frontend/dist;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend API
    location /api {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Logs
    access_log /var/log/nginx/accurate-app-access.log;
    error_log /var/log/nginx/accurate-app-error.log;
}
```

**PENTING**: Ganti `yourdomain.com` dengan domain Anda yang sebenarnya!

Simpan: `Ctrl+X`, `Y`, `Enter`

### Langkah 2: Enable Site

```bash
# Buat symbolic link
ln -s /etc/nginx/sites-available/accurate-app /etc/nginx/sites-enabled/

# Hapus default site (opsional)
rm /etc/nginx/sites-enabled/default

# Test konfigurasi
nginx -t
```

Output yang benar:
```
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

**JANGAN restart Nginx dulu**, kita setup SSL dulu!

---

## 8. Setup SSL Certificate (HTTPS)

### Langkah 1: Install Certbot

```bash
apt install -y certbot python3-certbot-nginx
```

### Langkah 2: Buat Folder untuk Certbot

```bash
mkdir -p /var/www/certbot
```

### Langkah 3: Temporary Nginx Config (untuk mendapatkan SSL)

Edit konfigurasi sementara:

```bash
nano /etc/nginx/sites-available/accurate-app
```

Comment out bagian SSL dan HTTPS server, hanya aktifkan HTTP server:

```nginx
# Backend API Server
upstream backend {
    server localhost:5000;
    keepalive 64;
}

# HTTP Server - Sementara untuk mendapatkan SSL
server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com www.yourdomain.com;

    # Untuk Let's Encrypt verification
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    # Sementara serve aplikasi via HTTP
    location / {
        root /var/www/accurate-app/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Restart Nginx:

```bash
nginx -t
systemctl restart nginx
```

### Langkah 4: Dapatkan SSL Certificate

```bash
certbot certonly --webroot -w /var/www/certbot -d yourdomain.com -d www.yourdomain.com
```

Ikuti instruksi:
- Masukkan email Anda
- Setuju terms of service (Y)
- Share email (N atau Y, terserah)

Jika berhasil:
```
Successfully received certificate.
Certificate is saved at: /etc/letsencrypt/live/yourdomain.com/fullchain.pem
Key is saved at: /etc/letsencrypt/live/yourdomain.com/privkey.pem
```

### Langkah 5: Restore Full Nginx Config

```bash
nano /etc/nginx/sites-available/accurate-app
```

Kembalikan ke konfigurasi lengkap (yang ada di Langkah 7.1), lalu:

```bash
nginx -t
systemctl restart nginx
```

### Langkah 6: Setup Auto-Renewal SSL

```bash
# Test renewal
certbot renew --dry-run

# Setup cron job untuk auto-renewal
crontab -e
```

Pilih editor (pilih nano, biasanya nomor 1), lalu tambahkan di baris paling bawah:

```
0 3 * * * certbot renew --quiet && systemctl reload nginx
```

Simpan: `Ctrl+X`, `Y`, `Enter`

---

## 9. Konfigurasi Accurate Online

### Langkah 1: Update Redirect URI di Accurate Developer

1. Login ke https://account.accurate.id/
2. Masuk ke **Developer** atau **API Settings**
3. Edit aplikasi Anda
4. Update **Redirect URI** menjadi:
   ```
   https://yourdomain.com/api/accurate/callback
   ```
5. Simpan perubahan

### Langkah 2: Update Environment Backend

```bash
nano /var/www/accurate-app/backend/.env
```

Pastikan:
```env
ACCURATE_CLIENT_ID=your_client_id_from_accurate
ACCURATE_CLIENT_SECRET=your_client_secret_from_accurate
ACCURATE_REDIRECT_URI=https://yourdomain.com/api/accurate/callback
```

Simpan: `Ctrl+X`, `Y`, `Enter`

---

## 10. Setup PM2 untuk Auto-Restart

### Langkah 1: Start Backend dengan PM2

```bash
cd /var/www/accurate-app/backend
pm2 start server.js --name "accurate-backend" --env production
```

### Langkah 2: Setup PM2 Startup

```bash
# Generate startup script
pm2 startup

# Copy dan jalankan command yang muncul
# Contoh output:
# sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u root --hp /root
# Copy dan paste command tersebut, lalu Enter

# Save PM2 process list
pm2 save
```

### Langkah 3: Verifikasi PM2

```bash
pm2 list
```

Output:
```
┌─────┬──────────────────┬─────────┬─────────┬──────────┐
│ id  │ name             │ status  │ restart │ uptime   │
├─────┼──────────────────┼─────────┼─────────┼──────────┤
│ 0   │ accurate-backend │ online  │ 0       │ 10s      │
└─────┴──────────────────┴─────────┴─────────┴──────────┘
```

### Langkah 4: Monitoring PM2

```bash
# Lihat logs
pm2 logs accurate-backend

# Lihat monitoring
pm2 monit

# Restart aplikasi
pm2 restart accurate-backend

# Stop aplikasi
pm2 stop accurate-backend
```

---

## 11. Testing & Verifikasi

### Test 1: Akses Website

Buka browser: `https://yourdomain.com`

Harus muncul halaman login aplikasi dengan HTTPS (gembok hijau).

### Test 2: Login ke Aplikasi

Login dengan kredensial default:
- Username: `admin`
- Password: `admin123`

### Test 3: Authorize Accurate

1. Setelah login, buka: `https://yourdomain.com/api/accurate/auth`
2. Atau dari aplikasi, klik menu **Settings** → **Connect Accurate**
3. Login ke Accurate Online
4. Pilih database
5. Klik **Authorize**

### Test 4: Verifikasi Token di Server

```bash
cd /var/www/accurate-app/backend
node scripts/testApiToken.js
```

Output yang benar:
```
✓ Token is valid
✓ Connected to database: [Nama Database]
✓ Company: [Nama Perusahaan]
```

### Test 5: Test Sync Data

1. Buka halaman **Items** di aplikasi
2. Klik **Sync from Accurate**
3. Data harus muncul

### Test 6: Check Backend Logs

```bash
pm2 logs accurate-backend --lines 50
```

Pastikan tidak ada error.

---

## 12. Troubleshooting

### Problem: Website tidak bisa diakses

**Cek Nginx:**
```bash
systemctl status nginx
nginx -t
```

**Cek Firewall:**
```bash
# Allow HTTP dan HTTPS
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 22/tcp
ufw enable
ufw status
```

### Problem: Backend tidak jalan

**Cek PM2:**
```bash
pm2 list
pm2 logs accurate-backend
```

**Restart Backend:**
```bash
pm2 restart accurate-backend
```

### Problem: Database connection error

**Cek MySQL:**
```bash
# Untuk MySQL standar atau MariaDB
systemctl status mysql
# atau
systemctl status mariadb

# Untuk MySQL di Docker
docker ps
docker logs mysql

# Test koneksi standar
mysql -u accurate_user -p accurate_app

# Test koneksi Docker
docker exec -it mysql mysql -u accurate_user -p accurate_app
```

**Cek .env:**
```bash
cat /var/www/accurate-app/backend/.env | grep DB_
```

**Untuk MySQL di Docker, pastikan DB_HOST di .env:**
```env
DB_HOST=127.0.0.1
# atau
DB_HOST=localhost
```

### Problem: SSL Certificate error

**Renew manual:**
```bash
certbot renew
systemctl restart nginx
```

**Cek certificate:**
```bash
certbot certificates
```

### Problem: Accurate API error

**Cek token:**
```bash
cd /var/www/accurate-app/backend
node scripts/testApiToken.js
```

**Re-authorize:**
Buka: `https://yourdomain.com/api/accurate/auth`

### Problem: 502 Bad Gateway

Backend tidak jalan. Cek:
```bash
pm2 list
pm2 logs accurate-backend

# Restart
pm2 restart accurate-backend
```

### Problem: Port 5000 sudah digunakan

```bash
# Cek process di port 5000
lsof -i :5000

# Kill process
kill -9 [PID]

# Atau ubah port di .env
nano /var/www/accurate-app/backend/.env
# Ubah PORT=5000 ke PORT=5001
# Jangan lupa update nginx config juga!
```

---

## 🎯 Checklist Deployment Berhasil

- [ ] VPS bisa diakses via SSH
- [ ] Domain sudah pointing ke IP VPS
- [ ] Node.js, MySQL, Nginx terinstall
- [ ] Database terbuat dan terisi
- [ ] Backend berjalan dengan PM2
- [ ] Frontend ter-build dan ter-serve
- [ ] Nginx konfigurasi benar
- [ ] SSL certificate aktif (HTTPS)
- [ ] Website bisa diakses via HTTPS
- [ ] Bisa login ke aplikasi
- [ ] Accurate authorization berhasil
- [ ] Token tersimpan dan valid
- [ ] Bisa sync data dari Accurate
- [ ] PM2 auto-restart aktif

---

## 🔧 Maintenance & Update

### Update Aplikasi

```bash
cd /var/www/accurate-app

# Pull update dari Git
git pull origin main

# Update backend
cd backend
npm install --production
pm2 restart accurate-backend

# Update frontend
cd ../frontend
npm install
npm run build

# Restart Nginx
systemctl restart nginx
```

### Backup Database

**Untuk MySQL standar atau MariaDB:**

```bash
# Backup manual
mysqldump -u accurate_user -p accurate_app > backup_$(date +%Y%m%d).sql

# Setup auto backup (crontab)
crontab -e
```

Tambahkan:
```
0 2 * * * mysqldump -u accurate_user -pYOUR_PASSWORD accurate_app > /root/backups/db_$(date +\%Y\%m\%d).sql
```

**Untuk MySQL di Docker:**

```bash
# Backup manual
docker exec mysql mysqldump -u accurate_user -p accurate_app > backup_$(date +%Y%m%d).sql

# Setup auto backup (crontab)
crontab -e
```

Tambahkan:
```
0 2 * * * docker exec mysql mysqldump -u accurate_user -pYOUR_PASSWORD accurate_app > /root/backups/db_$(date +\%Y\%m\%d).sql
```

Buat folder backup dulu:
```bash
mkdir -p /root/backups
```

### Monitor Resource

```bash
# CPU & Memory
htop

# Disk usage
df -h

# PM2 monitoring
pm2 monit
```

---

## 📞 Support

Jika ada masalah:

1. Cek logs: `pm2 logs accurate-backend`
2. Cek Nginx logs: `tail -f /var/log/nginx/accurate-app-error.log`
3. Cek MySQL logs: `tail -f /var/log/mysql/error.log`
4. Contact Hostinger support untuk masalah VPS
5. Contact Accurate support untuk masalah API

---

## 🚀 Optimasi Production (Opsional)

### Enable Gzip Compression

```bash
nano /etc/nginx/nginx.conf
```

Tambahkan di dalam `http` block:
```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;
```

### Setup Redis untuk Caching (Advanced)

```bash
apt install -y redis-server
systemctl enable redis-server
```

### Setup Monitoring dengan PM2 Plus (Opsional)

```bash
pm2 plus
# Follow instruksi untuk connect ke PM2 Plus dashboard
```

---

**Selamat! Aplikasi Anda sudah live di VPS Hostinger dan terintegrasi dengan Accurate Online!** 🎉

URL Aplikasi: `https://yourdomain.com`

Jangan lupa:
- Ganti password default admin
- Setup backup rutin
- Monitor resource VPS
- Update aplikasi secara berkala
