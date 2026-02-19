# ⚡ Quick Start - Deploy ke VPS Hostinger

Panduan super cepat untuk deploy aplikasi iWare ke VPS Hostinger.

---

## 🚀 Langkah Cepat (30 menit)

### 1. Login ke VPS

```bash
ssh root@IP_VPS_ANDA
```

### 2. Install Dependencies (5 menit)

```bash
# Update system
apt update && apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Install MySQL
apt install -y mysql-server

# Install PM2
npm install -g pm2

# Install Nginx
apt install -y nginx

# Install Certbot (untuk SSL)
apt install -y certbot python3-certbot-nginx git

# Setup firewall
apt install -y ufw
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
```

### 3. Secure MySQL (2 menit)

```bash
mysql_secure_installation
```

Jawab semua dengan **YES** dan buat password root yang kuat!

### 4. Clone Aplikasi (2 menit)

```bash
# Buat folder
mkdir -p /var/www/iware
cd /var/www/iware

# Clone repository (ganti dengan URL repo Anda)
git clone https://github.com/USERNAME/REPO.git .

# Atau upload via SFTP ke /var/www/iware
```

### 5. Setup Backend (5 menit)

```bash
cd /var/www/iware/backend

# Install dependencies
npm install --production

# Setup database OTOMATIS (PALING MUDAH!)
npm run setup-interactive
```

**Jawab pertanyaan:**
- MySQL Host: `127.0.0.1` (tekan Enter)
- MySQL Root Username: `root` (tekan Enter)
- MySQL Root Password: (password yang dibuat di step 3)
- Nama Database: `iware_warehouse` (tekan Enter)
- Database Username: `iware_user` (tekan Enter)
- Database Password: (buat password baru yang kuat)

Script akan otomatis:
✓ Membuat database
✓ Membuat user
✓ Import schema
✓ Update .env

### 6. Update Konfigurasi Accurate (2 menit)

```bash
nano .env
```

Update bagian Accurate:

```env
ACCURATE_ACCESS_TOKEN=TOKEN_ANDA_DARI_ACCURATE
ACCURATE_DATABASE_ID=DATABASE_ID_ANDA
CORS_ORIGIN=https://DOMAIN_ANDA.com
```

Save: `Ctrl+O`, Enter, `Ctrl+X`

### 7. Setup Frontend (3 menit)

```bash
cd /var/www/iware/frontend

# Install dependencies
npm install

# Build
npm run build
```

### 8. Setup Domain & Nginx (3 menit)

**A. Setup DNS di Hostinger:**
- Buat A Record: `werehouse` → `IP_VPS_ANDA`

**B. Konfigurasi Nginx:**

```bash
nano /etc/nginx/sites-available/iware
```

Paste konfigurasi ini (ganti `werehouse.iwareid.com` dengan domain Anda):

```nginx
server {
    listen 80;
    server_name werehouse.iwareid.com;

    root /var/www/iware/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

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
    }
}
```

Save dan aktifkan:

```bash
ln -s /etc/nginx/sites-available/iware /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx
```

### 9. Setup SSL (2 menit)

```bash
certbot --nginx -d werehouse.iwareid.com
```

Jawab:
- Email: (email Anda)
- Agree to terms: Yes
- Redirect HTTP to HTTPS: Yes (pilih 2)

### 10. Start Aplikasi (2 menit)

```bash
cd /var/www/iware/backend

# Start dengan PM2
pm2 start ecosystem.config.js

# Save PM2 list
pm2 save

# Setup auto-start
pm2 startup systemd
# Jalankan command yang muncul
```

---

## ✅ Selesai!

Aplikasi Anda sekarang berjalan di: **https://werehouse.iwareid.com**

**Login Default:**
- Username: `superadmin`
- Password: `Admin123!`

**⚠️ Ganti password setelah login pertama!**

---

## 🔍 Verifikasi

```bash
# Check backend
pm2 status

# Check logs
pm2 logs iware-backend

# Test API
curl http://localhost:5000/api/health

# Test Accurate
cd /var/www/iware/backend
node scripts/testAccurateConnection.js
```

---

## 🆘 Troubleshooting

**Backend tidak jalan?**
```bash
pm2 logs iware-backend
```

**Database error?**
```bash
npm run setup-interactive
```

**Nginx error?**
```bash
nginx -t
tail -f /var/log/nginx/error.log
```

**Accurate error?**
```bash
node scripts/testAccurateConnection.js
```

---

## 📚 Dokumentasi Lengkap

- [Panduan Lengkap](PANDUAN_HOSTING_VPS_HOSTINGER.md)
- [Troubleshooting](TROUBLESHOOTING.md)

---

**Selamat! Aplikasi Anda sudah online! 🎉**
