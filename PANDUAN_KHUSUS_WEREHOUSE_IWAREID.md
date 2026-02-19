# 🚀 Panduan Khusus untuk werehouse.iwareid.com

**Panduan Deployment Sudah Disesuaikan dengan Subdomain Anda**

---

## ✅ Informasi Subdomain Anda

```
Subdomain: werehouse.iwareid.com
Domain Utama: iwareid.com
Status: Sudah ada dan siap digunakan
```

---

## 📋 Yang Sudah Siap

- ✅ Subdomain: werehouse.iwareid.com
- ✅ Accurate Access Token (sudah ada)
- ⏳ VPS Hostinger (perlu setup)
- ⏳ DNS A Record (perlu pointing ke IP VPS)

---

## 🎯 Langkah Deployment (Disesuaikan)

### FASE 1: Setup DNS (5 menit)

**Karena subdomain sudah ada, tinggal pointing ke VPS:**

1. Login ke Hostinger Panel
2. Pilih domain **iwareid.com**
3. Masuk ke **DNS/Name Servers**
4. Cari A Record untuk **werehouse**
5. Update/Tambah A Record:
   ```
   Type: A
   Name: werehouse
   Points to: [IP_VPS_ANDA]
   TTL: 14400
   ```
6. Save changes
7. Tunggu propagasi (5-30 menit)

**Test DNS:**
```bash
nslookup werehouse.iwareid.com
# Harus menunjuk ke IP VPS Anda
```

---

### FASE 2: Setup VPS (15 menit)

**Ikuti panduan lengkap di:** PANDUAN_HOSTING_VPS_HOSTINGER_LENGKAP.md

**Quick commands:**
```bash
# Update system
apt update && apt upgrade -y

# Install dependencies
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs mysql-server nginx certbot python3-certbot-nginx
npm install -g pm2

# Setup firewall
ufw allow 22,80,443/tcp
ufw enable
```

---

### FASE 3: Upload Aplikasi (10 menit)

```bash
# Clone repository
mkdir -p /var/www/iware
cd /var/www/iware
git clone [REPO_URL] .

# Setup backend
cd backend
npm install --production
cp .env.example .env
nano .env
```

**Edit .env dengan subdomain Anda:**
```env
PORT=5000
NODE_ENV=production

DB_HOST=localhost
DB_USER=iware_user
DB_PASSWORD=[PASSWORD_ANDA]
DB_NAME=iware_warehouse

JWT_SECRET=[RANDOM_STRING]
JWT_EXPIRE=7d

ACCURATE_API_URL=https://public-api.accurate.id/api
ACCURATE_ACCESS_TOKEN=[TOKEN_ANDA]
ACCURATE_DATABASE_ID=[DB_ID_ANDA]

# PENTING: Gunakan subdomain Anda
CORS_ORIGIN=https://werehouse.iwareid.com
```

**Build frontend:**
```bash
cd ../frontend
npm install
npm run build
```

---

### FASE 4: Setup Database (5 menit)

```bash
# Login MySQL
mysql -u root -p

# Buat database
CREATE DATABASE iware_warehouse CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'iware_user'@'localhost' IDENTIFIED BY '[PASSWORD_ANDA]';
GRANT ALL PRIVILEGES ON iware_warehouse.* TO 'iware_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# Import schema
cd /var/www/iware/backend
mysql -u iware_user -p iware_warehouse < SETUP_LENGKAP.sql
```

---

### FASE 5: Setup Nginx (5 menit)

**Buat config untuk werehouse.iwareid.com:**

```bash
nano /etc/nginx/sites-available/iware
```

**Paste config ini (sudah disesuaikan):**

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name werehouse.iwareid.com;

    # Frontend (static files dari build)
    root /var/www/iware/frontend/dist;
    index index.html;

    # Logs
    access_log /var/log/nginx/werehouse-access.log;
    error_log /var/log/nginx/werehouse-error.log;

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

**Aktifkan config:**
```bash
ln -s /etc/nginx/sites-available/iware /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx
```

---

### FASE 6: Setup SSL (10 menit)

**Generate SSL untuk werehouse.iwareid.com:**

```bash
certbot --nginx -d werehouse.iwareid.com
```

**Ikuti instruksi:**
- Masukkan email: [EMAIL_ANDA]
- Agree to terms: Y
- Share email: N (optional)
- Redirect HTTP to HTTPS: 2 (Yes)

**Verifikasi SSL:**
```bash
certbot certificates
# Harus ada certificate untuk werehouse.iwareid.com
```

---

### FASE 7: Start Aplikasi (5 menit)

```bash
cd /var/www/iware/backend
pm2 start ecosystem.config.js
pm2 save

# Check status
pm2 status
pm2 logs iware-backend
```

---

### FASE 8: Testing (10 menit)

**Test Backend:**
```bash
curl http://localhost:5000/api/health
curl https://werehouse.iwareid.com/api/health
```

**Test Frontend:**
1. Buka browser
2. Akses: **https://werehouse.iwareid.com**
3. Harus muncul halaman login
4. Login: superadmin@iware.id / jasad666

**Test Accurate:**
1. Masuk ke halaman Items
2. Klik "Sync dari Accurate"
3. Data harus muncul

---

## 🔧 Konfigurasi Accurate Token

**Token sudah ada, tinggal masukkan:**

```bash
nano /var/www/iware/backend/.env
```

**Update baris ini:**
```env
ACCURATE_ACCESS_TOKEN=[PASTE_TOKEN_ANDA_DISINI]
ACCURATE_DATABASE_ID=[PASTE_DB_ID_ANDA_DISINI]
```

**Restart backend:**
```bash
pm2 restart iware-backend
```

**Test koneksi:**
```bash
cd /var/www/iware/backend
node scripts/testAccurateConnection.js
```

**Output yang diharapkan:**
```
✓ Koneksi ke Accurate Online berhasil!
✓ Database ID valid
✓ Access Token valid
```

---

## 🗑️ Cara Hapus Aplikasi

### Opsi 1: Script Otomatis

```bash
chmod +x uninstall-iware.sh
./uninstall-iware.sh
```

### Opsi 2: Manual

**Lihat panduan lengkap di:** PANDUAN_HOSTING_VPS_HOSTINGER_LENGKAP.md (Bagian 11)

**Quick commands:**
```bash
# 1. Backup
mysqldump -u iware_user -p iware_warehouse > /root/backup.sql

# 2. Stop PM2
pm2 stop iware-backend
pm2 delete iware-backend
pm2 save

# 3. Hapus database
mysql -u root -p
DROP DATABASE iware_warehouse;
DROP USER 'iware_user'@'localhost';
EXIT;

# 4. Hapus files
rm -rf /var/www/iware

# 5. Hapus Nginx
rm /etc/nginx/sites-enabled/iware
rm /etc/nginx/sites-available/iware
systemctl reload nginx

# 6. Hapus SSL
certbot delete --cert-name werehouse.iwareid.com

# 7. Hapus logs
rm /var/log/nginx/werehouse-*
```

---

## 🗑️ Cara Hapus Container Docker

**Jika menggunakan Docker:**

### Quick Command

```bash
cd /opt/iware  # atau /var/www/iware
docker compose down -v --rmi all
cd .. && rm -rf iware
```

### Dengan Backup

```bash
# Backup
cd /opt/iware
docker compose exec -T mysql mysqldump -u root -p iware_warehouse > /root/backup.sql
cd .. && tar -czf /root/iware_backup.tar.gz iware/

# Hapus
cd iware && docker compose down -v --rmi all
cd .. && rm -rf iware

# Hapus SSL
certbot delete --cert-name werehouse.iwareid.com
```

**Lihat panduan lengkap di:** CARA_HAPUS_CONTAINER_DOCKER.md

---

## 📊 Checklist Deployment

- [ ] DNS A Record sudah pointing ke IP VPS
- [ ] DNS sudah propagasi (test: `nslookup werehouse.iwareid.com`)
- [ ] VPS sudah setup (Node.js, MySQL, Nginx, PM2)
- [ ] Source code sudah di-upload
- [ ] .env sudah dikonfigurasi dengan:
  - [ ] Database credentials
  - [ ] Accurate Access Token
  - [ ] Accurate Database ID
  - [ ] CORS_ORIGIN=https://werehouse.iwareid.com
- [ ] Database sudah dibuat dan schema di-import
- [ ] Nginx config sudah dibuat untuk werehouse.iwareid.com
- [ ] SSL certificate sudah terinstall
- [ ] Backend running dengan PM2
- [ ] Frontend sudah di-build
- [ ] Aplikasi bisa diakses via https://werehouse.iwareid.com
- [ ] Login berhasil
- [ ] Sync Accurate berhasil

---

## 🎯 URLs Penting

```
Aplikasi: https://werehouse.iwareid.com
Backend API: https://werehouse.iwareid.com/api
Health Check: https://werehouse.iwareid.com/api/health

Login:
Email: superadmin@iware.id
Password: jasad666 (GANTI SETELAH LOGIN!)
```

---

## 📞 Command Reference Cepat

### PM2
```bash
pm2 status
pm2 logs iware-backend
pm2 restart iware-backend
pm2 monit
```

### Nginx
```bash
systemctl status nginx
systemctl reload nginx
nginx -t
tail -f /var/log/nginx/werehouse-error.log
```

### MySQL
```bash
mysql -u iware_user -p iware_warehouse
mysqldump -u iware_user -p iware_warehouse > backup.sql
```

### SSL
```bash
certbot certificates
certbot renew
certbot delete --cert-name werehouse.iwareid.com
```

### Update Aplikasi
```bash
cd /var/www/iware
git pull origin main
cd backend && npm install && pm2 restart iware-backend
cd ../frontend && npm install && npm run build
systemctl reload nginx
```

---

## 🆘 Troubleshooting

### DNS tidak resolve
```bash
# Check DNS
nslookup werehouse.iwareid.com

# Tunggu propagasi (5-30 menit)
# Atau flush DNS cache
systemd-resolve --flush-caches
```

### SSL gagal generate
```bash
# Pastikan DNS sudah propagasi
nslookup werehouse.iwareid.com

# Coba lagi
certbot --nginx -d werehouse.iwareid.com --force-renewal
```

### Backend tidak bisa start
```bash
pm2 logs iware-backend
# Check error di logs

# Check .env
cat /var/www/iware/backend/.env | grep CORS_ORIGIN
# Harus: CORS_ORIGIN=https://werehouse.iwareid.com
```

### Accurate API error
```bash
cd /var/www/iware/backend
node scripts/testAccurateConnection.js

# Jika error, update token di .env
nano .env
pm2 restart iware-backend
```

---

## 📖 Dokumentasi Lengkap

**Untuk panduan detail, baca:**

1. **PANDUAN_HOSTING_VPS_HOSTINGER_LENGKAP.md** - Panduan lengkap 70 halaman
2. **CARA_HAPUS_CONTAINER_DOCKER.md** - Cara hapus container Docker
3. **QUICK_REFERENCE_HOSTINGER.md** - Quick reference command
4. **FAQ_DEPLOYMENT_HOSTINGER.md** - 80+ FAQ

---

## ✅ Kesimpulan

Panduan hosting **SUDAH DISESUAIKAN** dengan subdomain Anda:

- ✅ Subdomain: **werehouse.iwareid.com**
- ✅ Nginx config sudah menggunakan subdomain Anda
- ✅ SSL command sudah menggunakan subdomain Anda
- ✅ CORS_ORIGIN sudah disesuaikan
- ✅ Cara hapus aplikasi sudah disesuaikan
- ✅ Cara hapus container Docker sudah disesuaikan

**Tinggal ikuti langkah-langkah di atas!**

---

**Subdomain:** werehouse.iwareid.com  
**Status:** Siap deploy!  
**Estimasi waktu:** 45-60 menit

**Selamat Deploy! 🚀**

**Dibuat dengan ❤️ untuk iWare**
