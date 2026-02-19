# 🚀 Panduan Lengkap Hosting di VPS Hostinger dengan Docker

Panduan ini akan membantu Anda deploy aplikasi iWare Warehouse di VPS Hostinger menggunakan Docker dari awal sampai berhasil connect ke Accurate Online.

---

## 📋 Prasyarat

- VPS Hostinger (minimal 2GB RAM, 2 CPU cores)
- Domain atau subdomain (contoh: werehouse.iwareid.com)
- Akun Accurate Online dengan API credentials
- SSH access ke VPS

---

## 🎯 Langkah 1: Persiapan VPS

### 1.1 Login ke VPS via SSH

```bash
ssh root@IP_VPS_ANDA
```

Masukkan password yang diberikan Hostinger.

### 1.2 Update System

```bash
apt update && apt upgrade -y
```

### 1.3 Install Dependencies Dasar

```bash
apt install -y curl wget git nano ufw
```

### 1.4 Setup Firewall

```bash
# Allow SSH, HTTP, HTTPS
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
ufw status
```

---

## 🐳 Langkah 2: Install Docker & Docker Compose

### 2.1 Install Docker

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Verify installation
docker --version
```

### 2.2 Install Docker Compose

```bash
# Install Docker Compose
apt install -y docker-compose-plugin

# Verify installation
docker compose version
```

### 2.3 Start Docker Service

```bash
systemctl start docker
systemctl enable docker
systemctl status docker
```

---

## 📁 Langkah 3: Clone & Setup Aplikasi

### 3.1 Clone Repository

```bash
# Buat direktori untuk aplikasi
mkdir -p /var/www/iware
cd /var/www/iware

# Clone repository (ganti dengan URL repo Anda)
git clone https://github.com/USERNAME/REPO_NAME.git .
```

### 3.2 Setup Environment Variables

```bash
# Copy file .env.docker
cp .env.docker .env

# Edit file .env
nano .env
```

Isi dengan konfigurasi berikut:

```env
# MySQL Configuration
MYSQL_ROOT_PASSWORD=password_root_yang_kuat_123
DB_NAME=iware_warehouse
DB_USER=iware_user
DB_PASSWORD=password_user_yang_kuat_456

# Backend Configuration
PORT=5000
NODE_ENV=production
JWT_SECRET=generate_random_string_32_karakter_disini
JWT_EXPIRE=7d

# Accurate Online API
ACCURATE_API_URL=https://public-api.accurate.id/api
ACCURATE_CLIENT_ID=your_client_id_dari_accurate
ACCURATE_CLIENT_SECRET=your_client_secret_dari_accurate
ACCURATE_REDIRECT_URI=https://werehouse.iwareid.com/api/accurate/callback
ACCURATE_DATABASE_ID=your_database_id
ACCURATE_ACCESS_TOKEN=your_access_token
ACCURATE_REFRESH_TOKEN=your_refresh_token

# CORS
CORS_ORIGIN=https://werehouse.iwareid.com
```

**Cara mendapatkan Accurate credentials:**
1. Login ke [Accurate Developer Portal](https://developer.accurate.id/)
2. Buat aplikasi baru atau gunakan yang sudah ada
3. Dapatkan Client ID dan Client Secret
4. Generate Access Token melalui OAuth flow

### 3.3 Generate JWT Secret

```bash
# Generate random JWT secret
openssl rand -base64 32
```

Copy hasilnya ke `JWT_SECRET` di file `.env`

---

## 🗄️ Langkah 4: Build & Start Docker Containers

### 4.1 Build Images

```bash
cd /var/www/iware

# Build semua images
docker compose build
```

### 4.2 Start Containers

```bash
# Start semua containers
docker compose up -d

# Cek status containers
docker compose ps
```

Output yang benar:

```
NAME                    STATUS              PORTS
werehouse-mysql         Up                  0.0.0.0:3307->3306/tcp
werehouse-backend       Up                  0.0.0.0:5001->5000/tcp
werehouse-frontend      Up                  0.0.0.0:3001->80/tcp
```

### 4.3 Cek Logs

```bash
# Cek logs semua containers
docker compose logs -f

# Cek logs backend saja
docker compose logs -f backend

# Cek logs MySQL saja
docker compose logs -f mysql
```

---

## 🌐 Langkah 5: Setup Nginx Reverse Proxy

### 5.1 Install Nginx

```bash
apt install -y nginx
systemctl start nginx
systemctl enable nginx
```

### 5.2 Buat Konfigurasi Nginx

```bash
nano /etc/nginx/sites-available/werehouse
```

Isi dengan:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name werehouse.iwareid.com;

    # Frontend (dari Docker container port 3001)
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API (dari Docker container port 5001)
    location /api {
        proxy_pass http://localhost:5001;
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

    # Logs
    access_log /var/log/nginx/werehouse-access.log;
    error_log /var/log/nginx/werehouse-error.log;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json;
}
```

### 5.3 Aktifkan Konfigurasi

```bash
# Buat symbolic link
ln -s /etc/nginx/sites-available/werehouse /etc/nginx/sites-enabled/

# Hapus default config
rm -f /etc/nginx/sites-enabled/default

# Test konfigurasi
nginx -t

# Reload Nginx
systemctl reload nginx
```

---

## 🔒 Langkah 6: Setup SSL (HTTPS)

### 6.1 Install Certbot

```bash
apt install -y certbot python3-certbot-nginx
```

### 6.2 Generate SSL Certificate

```bash
# Ganti dengan domain dan email Anda
certbot --nginx -d werehouse.iwareid.com --email your@email.com --agree-tos --redirect
```

Certbot akan otomatis:
- Generate SSL certificate
- Update konfigurasi Nginx
- Setup auto-renewal

### 6.3 Test Auto-Renewal

```bash
certbot renew --dry-run
```

---

## 🔗 Langkah 7: Setup Accurate Online Connection

### 7.1 Dapatkan Accurate Credentials

1. **Login ke Accurate Developer Portal**
   - Buka: https://developer.accurate.id/
   - Login dengan akun Accurate Anda

2. **Buat Aplikasi Baru**
   - Klik "Create Application"
   - Isi nama aplikasi: "iWare Warehouse"
   - Redirect URI: `https://werehouse.iwareid.com/api/accurate/callback`
   - Simpan dan dapatkan Client ID & Client Secret

3. **Generate Access Token**
   
   Akses URL berikut di browser (ganti CLIENT_ID):
   ```
   https://account.accurate.id/oauth/authorize?client_id=CLIENT_ID&response_type=code&redirect_uri=https://werehouse.iwareid.com/api/accurate/callback&scope=item_view sales_order_view sales_order_save
   ```

4. **Authorize Aplikasi**
   - Login ke Accurate
   - Pilih database yang akan digunakan
   - Klik "Authorize"
   - Anda akan di-redirect ke callback URL dengan code

5. **Exchange Code untuk Token**
   
   Jalankan di VPS:
   ```bash
   docker compose exec backend node scripts/generateToken.js
   ```
   
   Atau manual dengan curl:
   ```bash
   curl -X POST https://account.accurate.id/oauth/token \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -d "grant_type=authorization_code" \
     -d "code=CODE_DARI_CALLBACK" \
     -d "client_id=YOUR_CLIENT_ID" \
     -d "client_secret=YOUR_CLIENT_SECRET" \
     -d "redirect_uri=https://werehouse.iwareid.com/api/accurate/callback"
   ```

6. **Update Environment Variables**
   ```bash
   nano /var/www/iware/.env
   ```
   
   Update dengan token yang didapat:
   ```env
   ACCURATE_ACCESS_TOKEN=aat.xxx.xxx
   ACCURATE_REFRESH_TOKEN=art.xxx.xxx
   ACCURATE_DATABASE_ID=123456
   ```

7. **Restart Backend**
   ```bash
   docker compose restart backend
   ```

### 7.2 Test Koneksi Accurate

```bash
# Masuk ke container backend
docker compose exec backend sh

# Jalankan test script
node scripts/testAccurateConnection.js

# Keluar dari container
exit
```

Output yang benar:
```
✓ Koneksi ke Accurate Online berhasil!
✓ Database ID: 123456
✓ Database Name: Your Company Name
```

---

## ✅ Langkah 8: Verifikasi Deployment

### 8.1 Cek Status Containers

```bash
docker compose ps
```

Semua containers harus status "Up".

### 8.2 Cek Database

```bash
# Masuk ke MySQL container
docker compose exec mysql mysql -u iware_user -p iware_warehouse

# Cek tables
SHOW TABLES;

# Cek user admin
SELECT * FROM users WHERE role = 'superadmin';

# Keluar
exit
```

### 8.3 Test Backend API

```bash
# Test health check
curl http://localhost:5001/api/health

# Test login
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### 8.4 Test Frontend

Buka browser dan akses:
```
https://werehouse.iwareid.com
```

Login dengan:
- Username: `admin`
- Password: `admin123`

### 8.5 Test Accurate Connection

1. Login ke aplikasi
2. Buka menu "Settings" atau "Items"
3. Coba sync data dari Accurate
4. Pastikan data muncul tanpa error

---

## 🔧 Langkah 9: Maintenance & Monitoring

### 9.1 Monitoring Logs

```bash
# Real-time logs semua containers
docker compose logs -f

# Logs backend saja
docker compose logs -f backend

# Logs 100 baris terakhir
docker compose logs --tail=100 backend
```

### 9.2 Restart Containers

```bash
# Restart semua
docker compose restart

# Restart backend saja
docker compose restart backend
```

### 9.3 Update Aplikasi

```bash
cd /var/www/iware

# Pull latest code
git pull origin main

# Rebuild dan restart
docker compose down
docker compose build
docker compose up -d
```

### 9.4 Backup Database

```bash
# Backup database
docker compose exec mysql mysqldump -u iware_user -p iware_warehouse > backup_$(date +%Y%m%d).sql

# Atau dengan script
docker compose exec mysql sh -c 'mysqldump -u iware_user -p$DB_PASSWORD iware_warehouse' > backup_$(date +%Y%m%d).sql
```

### 9.5 Restore Database

```bash
# Restore dari backup
docker compose exec -T mysql mysql -u iware_user -p iware_warehouse < backup_20240101.sql
```

---

## 🐛 Troubleshooting

### Problem: Container tidak bisa start

```bash
# Cek logs
docker compose logs

# Cek port yang digunakan
netstat -tulpn | grep -E '3001|5001|3307'

# Stop dan remove containers
docker compose down
docker compose up -d
```

### Problem: Database connection error

```bash
# Cek MySQL container
docker compose logs mysql

# Cek environment variables
docker compose exec backend env | grep DB_

# Test koneksi manual
docker compose exec mysql mysql -u iware_user -p
```

### Problem: Accurate API error

```bash
# Cek token masih valid
docker compose exec backend node scripts/testAccurateConnection.js

# Refresh token jika expired
docker compose exec backend node scripts/generateToken.js

# Update .env dan restart
nano .env
docker compose restart backend
```

### Problem: Nginx 502 Bad Gateway

```bash
# Cek backend container running
docker compose ps backend

# Cek backend logs
docker compose logs backend

# Test backend langsung
curl http://localhost:5001/api/health

# Restart Nginx
systemctl restart nginx
```

### Problem: SSL certificate error

```bash
# Renew certificate
certbot renew

# Atau force renew
certbot renew --force-renewal

# Restart Nginx
systemctl restart nginx
```

---

## 📊 Monitoring & Performance

### Setup Monitoring dengan Docker Stats

```bash
# Real-time resource usage
docker stats

# Specific container
docker stats werehouse-backend
```

### Setup Log Rotation

```bash
# Edit Docker daemon config
nano /etc/docker/daemon.json
```

Tambahkan:
```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

Restart Docker:
```bash
systemctl restart docker
docker compose up -d
```

---

## 🎉 Selesai!

Aplikasi Anda sekarang sudah running di:
- **Frontend**: https://werehouse.iwareid.com
- **Backend API**: https://werehouse.iwareid.com/api
- **Database**: MySQL di container (port 3307)

### Default Login:
- Username: `admin`
- Password: `admin123`

**PENTING**: Segera ganti password default setelah login pertama kali!

---

## 📞 Support

Jika ada masalah:
1. Cek logs: `docker compose logs -f`
2. Cek status: `docker compose ps`
3. Restart: `docker compose restart`
4. Rebuild: `docker compose down && docker compose up -d --build`

---

## 📝 Checklist Deployment

- [ ] VPS sudah siap dan bisa diakses via SSH
- [ ] Docker & Docker Compose terinstall
- [ ] Repository sudah di-clone
- [ ] File .env sudah dikonfigurasi dengan benar
- [ ] Containers berhasil running (mysql, backend, frontend)
- [ ] Nginx sudah dikonfigurasi dan running
- [ ] SSL certificate sudah terinstall
- [ ] DNS A Record sudah pointing ke IP VPS
- [ ] Accurate credentials sudah didapatkan
- [ ] Access token Accurate sudah di-generate
- [ ] Test koneksi Accurate berhasil
- [ ] Login ke aplikasi berhasil
- [ ] Sync data dari Accurate berhasil
- [ ] Password default sudah diganti

---

**Selamat! Aplikasi Anda sudah live dan terhubung dengan Accurate Online! 🎊**
