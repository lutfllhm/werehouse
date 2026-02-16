# 🚀 Panduan Lengkap Hosting iWare ke VPS Hostinger

Panduan ALL-IN-ONE dari NOL sampai aplikasi ONLINE menggunakan Docker.

**Estimasi Waktu Total: 30-45 menit**

---

## 📋 Daftar Isi

- [Persiapan](#persiapan)
- [Bagian 1: Beli & Setup VPS](#bagian-1-beli--setup-vps)
- [Bagian 2: Login & Konfigurasi Awal VPS](#bagian-2-login--konfigurasi-awal-vps)
- [Bagian 3: Install Docker](#bagian-3-install-docker)
- [Bagian 4: Upload Aplikasi](#bagian-4-upload-aplikasi)
- [Bagian 5: Konfigurasi Environment](#bagian-5-konfigurasi-environment)
- [Bagian 6: Deploy dengan Docker](#bagian-6-deploy-dengan-docker)
- [Bagian 7: Setup Domain](#bagian-7-setup-domain)
- [Bagian 8: Setup Nginx & SSL](#bagian-8-setup-nginx--ssl)
- [Bagian 9: Testing & Verifikasi](#bagian-9-testing--verifikasi)
- [Bagian 10: Maintenance](#bagian-10-maintenance)
- [Troubleshooting](#troubleshooting)

---

## Persiapan

### Yang Anda Butuhkan:

✅ **Akun Hostinger** - Daftar di https://hostinger.co.id
✅ **Domain** - Beli di Hostinger atau registrar lain (contoh: iware.com)
✅ **Budget VPS** - Mulai dari Rp 50.000/bulan
✅ **SSH Client:**
   - Windows: PuTTY atau Windows Terminal
   - Mac/Linux: Terminal bawaan
✅ **Kode Aplikasi** - Folder project iWare ini

### Catat Informasi Ini:

```
Domain: _________________________
Email: _________________________
```

---

## Bagian 1: Beli & Setup VPS

### Langkah 1.1: Beli VPS Hostinger

1. **Login ke Hostinger:** https://hostinger.co.id
2. **Pilih Menu:** VPS Hosting
3. **Pilih Paket:**
   - **Minimal:** KVM 1 (1 vCPU, 4GB RAM) - ~Rp 50.000/bulan
   - **Recommended:** KVM 2 (2 vCPU, 8GB RAM) - ~Rp 100.000/bulan

4. **Pilih Lokasi Server:**
   - Singapore (recommended untuk Indonesia)
   - Jakarta (jika tersedia)

5. **Pilih Operating System:**
   - **Ubuntu 22.04 LTS** (RECOMMENDED)

6. **Checkout & Bayar**

### Langkah 1.2: Tunggu Email Konfirmasi

Setelah pembayaran, Anda akan menerima email (5-15 menit) berisi:

```
VPS IP Address: xxx.xxx.xxx.xxx
Username: root
Password: xxxxxxxxxx
SSH Port: 22
```

**⚠️ CATAT INFORMASI INI:**

```
IP VPS: _________________________
Username: root
Password: _________________________
```

---

## Bagian 2: Login & Konfigurasi Awal VPS

### Langkah 2.1: Login ke VPS via SSH

**Windows (PowerShell/CMD):**
```powershell
ssh root@IP_VPS_ANDA
# Ketik 'yes' jika diminta
# Paste password dari email
```

**Mac/Linux (Terminal):**
```bash
ssh root@IP_VPS_ANDA
# Ketik 'yes' jika diminta
# Paste password dari email
```

**Berhasil login jika muncul:**
```
root@vps-xxxxx:~#
```

### Langkah 2.2: Update System

```bash
# Update package list
apt update

# Upgrade packages
apt upgrade -y
```

Tunggu proses selesai (5-10 menit).

### Langkah 2.3: Setup Firewall

```bash
# Install UFW
apt install ufw -y

# Allow SSH (PENTING!)
ufw allow OpenSSH

# Allow HTTP & HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Enable firewall
ufw enable

# Ketik 'y' untuk konfirmasi

# Cek status
ufw status
```

Output yang benar:
```
Status: active

To                         Action      From
--                         ------      ----
OpenSSH                    ALLOW       Anywhere
80/tcp                     ALLOW       Anywhere
443/tcp                    ALLOW       Anywhere
```

✅ **Firewall configured!**

### Langkah 2.4: Ganti Password Root (Optional tapi Disarankan)

```bash
passwd
# Masukkan password baru 2x
```

---

## Bagian 3: Install Docker

### Langkah 3.1: Install Docker Engine

```bash
# Download Docker installation script
curl -fsSL https://get.docker.com -o get-docker.sh

# Run installation
sh get-docker.sh

# Verifikasi
docker --version
```

Output yang benar:
```
Docker version 24.x.x, build xxxxx
```

### Langkah 3.2: Install Docker Compose

```bash
# Install Docker Compose plugin
apt install docker-compose-plugin -y

# Verifikasi
docker compose version
```

Output yang benar:
```
Docker Compose version v2.x.x
```

### Langkah 3.3: Start Docker Service

```bash
# Start Docker
systemctl start docker

# Enable auto-start
systemctl enable docker

# Cek status
systemctl status docker
```

Tekan `q` untuk keluar.

✅ **Docker installed!**

---

## Bagian 4: Upload Aplikasi

### Langkah 4.1: Buat Folder di VPS

```bash
# Buat folder untuk aplikasi
mkdir -p /opt/iware

# Masuk ke folder
cd /opt/iware
```

### Langkah 4.2: Upload Kode (Pilih Salah Satu)

**OPSI A: Via Git (RECOMMENDED)**

```bash
# Di VPS
cd /opt/iware

# Clone repository (ganti dengan URL repo Anda)
git clone https://github.com/username/iware-app.git .

# Jika private repo, masukkan username & token
```

**OPSI B: Via SCP (dari komputer lokal)**

Buka PowerShell/Terminal BARU di folder project:

```powershell
# Windows PowerShell
scp -r * root@IP_VPS_ANDA:/opt/iware/

# Mac/Linux
scp -r * root@IP_VPS_ANDA:/opt/iware/
```

**OPSI C: Via FileZilla**

1. Download FileZilla: https://filezilla-project.org/
2. Buka FileZilla
3. Isi koneksi:
   - Host: `sftp://IP_VPS_ANDA`
   - Username: `root`
   - Password: `password_vps`
   - Port: `22`
4. Klik Quickconnect
5. Drag & drop semua file ke `/opt/iware/`

### Langkah 4.3: Verifikasi Upload

```bash
# Di VPS, cek isi folder
cd /opt/iware
ls -la
```

Output yang benar harus ada:
```
drwxr-xr-x backend/
drwxr-xr-x frontend/
-rw-r--r-- docker-compose.yml
-rw-r--r-- .env.docker
```

✅ **Kode berhasil diupload!**

---

## Bagian 5: Konfigurasi Environment

### Langkah 5.1: Copy Environment Template

```bash
# Di VPS
cd /opt/iware

# Copy template
cp .env.docker .env
```

### Langkah 5.2: Generate JWT Secret

```bash
# Generate random string untuk JWT
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copy output (string panjang), Anda akan paste ini ke .env.

### Langkah 5.3: Edit Environment File

```bash
nano .env
```

**Tekan `Ctrl+K` beberapa kali untuk hapus semua, lalu paste:**

```env
# MySQL Configuration
MYSQL_ROOT_PASSWORD=MySQLRoot2024!Strong
DB_NAME=iware_warehouse
DB_USER=iware_user
DB_PASSWORD=iWareDB2024!Strong

# Backend Configuration
PORT=5000
NODE_ENV=production

# JWT Configuration (PASTE JWT SECRET YANG DI-GENERATE TADI)
JWT_SECRET=paste_jwt_secret_yang_panjang_tadi_disini
JWT_EXPIRE=7d

# Accurate Online API Configuration
ACCURATE_API_URL=https://public-api.accurate.id/api
ACCURATE_CLIENT_ID=
ACCURATE_CLIENT_SECRET=
ACCURATE_REDIRECT_URI=https://DOMAIN_ANDA.com/api/accurate/callback
ACCURATE_DATABASE_ID=
ACCURATE_ACCESS_TOKEN=
ACCURATE_REFRESH_TOKEN=

# CORS Configuration (GANTI DENGAN DOMAIN ANDA)
CORS_ORIGIN=https://DOMAIN_ANDA.com
```

**PENTING! Ganti:**
- `MYSQL_ROOT_PASSWORD` → Password kuat untuk MySQL root
- `DB_PASSWORD` → Password kuat untuk database user
- `JWT_SECRET` → Paste JWT secret yang di-generate tadi
- `DOMAIN_ANDA.com` → Domain Anda yang sebenarnya (2 tempat)

**Simpan:** `Ctrl+X`, lalu `Y`, lalu `Enter`

### Langkah 5.4: Edit Frontend API URL

```bash
nano frontend/src/utils/api.js
```

Cari baris `baseURL` dan ganti:

```javascript
const api = axios.create({
  baseURL: 'https://DOMAIN_ANDA.com/api',  // ← GANTI INI
  headers: {
    'Content-Type': 'application/json'
  }
});
```

**Ganti `DOMAIN_ANDA.com` dengan domain Anda!**

**Simpan:** `Ctrl+X`, `Y`, `Enter`

✅ **Environment configured!**

---


## Bagian 6: Deploy dengan Docker

### Langkah 6.1: Build Docker Images

```bash
# Di VPS, pastikan di folder /opt/iware
cd /opt/iware

# Build images
docker compose build
```

Tunggu proses selesai (5-10 menit). Output akan menunjukkan progress build.

### Langkah 6.2: Start Services

```bash
# Start semua services
docker compose up -d
```

Output yang benar:
```
[+] Running 3/3
 ✔ Container iware-mysql     Started
 ✔ Container iware-backend   Started
 ✔ Container iware-frontend  Started
```

### Langkah 6.3: Cek Status Containers

```bash
# Cek status
docker compose ps
```

Output yang benar (semua status: Up):
```
NAME              STATUS    PORTS
iware-mysql       Up        0.0.0.0:3306->3306/tcp
iware-backend     Up        0.0.0.0:5000->5000/tcp
iware-frontend    Up        0.0.0.0:80->80/tcp
```

### Langkah 6.4: Cek Logs

```bash
# Lihat logs semua services
docker compose logs

# Atau lihat logs specific service
docker compose logs backend
docker compose logs mysql
```

Pastikan tidak ada error critical.

### Langkah 6.5: Test Backend API

```bash
# Test API health
curl http://localhost:5000/api/health
```

Output yang benar:
```json
{"sukses":true,"pesan":"Server berjalan dengan baik"}
```

✅ **Docker containers running!**

---

## Bagian 7: Setup Domain

### Langkah 7.1: Pointing Domain ke VPS

**Di Hostinger (atau registrar domain Anda):**

1. Login ke panel domain
2. Pilih domain Anda
3. Masuk ke **DNS / Name Servers**
4. Klik **Manage DNS Records**
5. Tambah/Edit DNS Records:

**Record 1:**
```
Type: A
Name: @
Points to: IP_VPS_ANDA
TTL: 3600
```

**Record 2:**
```
Type: A
Name: www
Points to: IP_VPS_ANDA
TTL: 3600
```

6. **Save Changes**

### Langkah 7.2: Tunggu Propagasi DNS

Propagasi DNS memakan waktu 5 menit - 24 jam (biasanya 15-30 menit).

**Cek propagasi dari komputer lokal:**

```bash
# Windows PowerShell / Mac Terminal
nslookup DOMAIN_ANDA.com

# atau
ping DOMAIN_ANDA.com
```

Jika sudah menunjukkan IP VPS Anda, lanjut ke langkah berikutnya.

✅ **Domain pointing to VPS!**

---

## Bagian 8: Setup Nginx & SSL

### Langkah 8.1: Install Nginx di Host

```bash
# Di VPS
apt install nginx -y

# Start Nginx
systemctl start nginx
systemctl enable nginx
```

### Langkah 8.2: Buat Konfigurasi Nginx

```bash
nano /etc/nginx/sites-available/iware
```

**Paste konfigurasi berikut:**

```nginx
# iWare Application - Nginx Configuration
server {
    listen 80;
    listen [::]:80;
    server_name DOMAIN_ANDA.com www.DOMAIN_ANDA.com;

    # Frontend (dari Docker container)
    location / {
        proxy_pass http://localhost:80;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API (dari Docker container)
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

    # Logs
    access_log /var/log/nginx/iware-access.log;
    error_log /var/log/nginx/iware-error.log;
}
```

**PENTING! Ganti `DOMAIN_ANDA.com` dengan domain Anda (2 tempat)!**

**Simpan:** `Ctrl+X`, `Y`, `Enter`

### Langkah 8.3: Aktifkan Konfigurasi

```bash
# Buat symbolic link
ln -s /etc/nginx/sites-available/iware /etc/nginx/sites-enabled/

# Hapus default config (optional)
rm /etc/nginx/sites-enabled/default

# Test konfigurasi
nginx -t
```

Output yang benar:
```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

### Langkah 8.4: Reload Nginx

```bash
systemctl reload nginx
```

### Langkah 8.5: Install SSL Certificate

```bash
# Install Certbot
apt install certbot python3-certbot-nginx -y

# Generate SSL certificate
certbot --nginx -d DOMAIN_ANDA.com -d www.DOMAIN_ANDA.com
```

**GANTI `DOMAIN_ANDA.com` dengan domain Anda!**

**Jawab pertanyaan:**
```
1. Email address: masukkan_email_anda@gmail.com
2. Terms of Service: Y (Yes)
3. Share email with EFF: N (No)
4. Redirect HTTP to HTTPS: 2 (Yes, redirect)
```

Output yang benar:
```
Successfully received certificate.
Certificate is saved at: /etc/letsencrypt/live/DOMAIN_ANDA.com/fullchain.pem
```

### Langkah 8.6: Test Auto-Renewal

```bash
certbot renew --dry-run
```

Output yang benar:
```
Congratulations, all simulated renewals succeeded
```

✅ **Nginx & SSL configured!**

---

## Bagian 9: Testing & Verifikasi

### Langkah 9.1: Cek Status Semua Services

```bash
# Docker containers
docker compose ps

# Nginx
systemctl status nginx

# Firewall
ufw status
```

Semua harus status: `active` atau `Up`

### Langkah 9.2: Test di Browser

1. **Buka browser**
2. **Akses:** `https://DOMAIN_ANDA.com`
3. **Harus muncul:** Homepage iWare dengan logo dan menu

### Langkah 9.3: Test Login

1. **Klik:** Login (pojok kanan atas)
2. **Isi form:**
   ```
   Email: superadmin@iware.id
   Password: jasad666
   ```
3. **Klik:** Login
4. **Harus redirect ke:** Dashboard

### Langkah 9.4: Test Fitur-Fitur

Cek semua menu:
- ✅ Dashboard - Menampilkan statistik
- ✅ Items - Bisa dibuka
- ✅ Sales Orders - Bisa dibuka
- ✅ Schedule - Bisa dibuka
- ✅ Report - Bisa dibuka
- ✅ Users - Bisa dibuka (Superadmin only)
- ✅ Settings - Bisa dibuka
- ✅ Logout - Berfungsi

### Langkah 9.5: Cek Logs (Jika Ada Error)

```bash
# Backend logs
docker compose logs backend

# Frontend logs
docker compose logs frontend

# MySQL logs
docker compose logs mysql

# Nginx logs
tail -f /var/log/nginx/iware-error.log
```

🎉 **SELAMAT! Aplikasi berhasil ONLINE!**

---

## Bagian 10: Maintenance

### 10.1: Backup Database Otomatis

```bash
# Buat folder backup
mkdir -p /backup

# Setup cron untuk backup otomatis
crontab -e
```

Pilih editor (pilih nano, biasanya nomor 1).

**Tambahkan di baris paling bawah:**

```bash
# Backup database setiap hari jam 2 pagi
0 2 * * * cd /opt/iware && docker compose exec -T mysql mysqldump -u root -p'MYSQL_ROOT_PASSWORD' iware_warehouse > /backup/iware_$(date +\%Y\%m\%d).sql
```

**GANTI `MYSQL_ROOT_PASSWORD` dengan password MySQL root Anda!**

**Simpan:** `Ctrl+X`, `Y`, `Enter`

### 10.2: Cleanup Backup Lama (Optional)

```bash
# Tambahkan di crontab (hapus backup lebih dari 30 hari)
0 3 * * * find /backup -name "iware_*.sql" -mtime +30 -delete
```

### 10.3: Update Aplikasi

```bash
# Stop containers
cd /opt/iware
docker compose down

# Pull latest code (jika pakai Git)
git pull

# Rebuild images
docker compose build

# Start containers
docker compose up -d

# Cek logs
docker compose logs -f
```

### 10.4: Monitoring

```bash
# Cek resource usage
docker stats

# Cek disk space
df -h

# Cek memory
free -h

# Cek logs
docker compose logs -f
```

---

## Troubleshooting

### Problem 1: Container tidak start

```bash
# Cek logs
docker compose logs backend

# Cek status
docker compose ps

# Restart
docker compose restart backend

# Jika masih error, rebuild
docker compose down
docker compose build --no-cache
docker compose up -d
```

### Problem 2: 502 Bad Gateway

```bash
# Cek backend running
docker compose ps

# Cek logs
docker compose logs backend

# Test backend
curl http://localhost:5000/api/health

# Restart
docker compose restart backend
systemctl restart nginx
```

### Problem 3: Database connection error

```bash
# Cek MySQL container
docker compose logs mysql

# Cek .env
cat .env

# Restart MySQL
docker compose restart mysql

# Jika masih error, cek password di .env
```

### Problem 4: Frontend tidak muncul

```bash
# Cek frontend container
docker compose logs frontend

# Rebuild frontend
docker compose build frontend
docker compose up -d frontend

# Cek Nginx
systemctl status nginx
nginx -t
```

### Problem 5: SSL tidak berfungsi

```bash
# Cek certificate
certbot certificates

# Renew certificate
certbot renew

# Reload Nginx
systemctl reload nginx
```

### Problem 6: Port sudah digunakan

```bash
# Cek port yang digunakan
netstat -tulpn | grep :80
netstat -tulpn | grep :5000

# Stop service yang menggunakan port
# atau ubah port di docker-compose.yml
```

### Problem 7: Domain tidak bisa diakses

```bash
# Cek DNS propagation
nslookup DOMAIN_ANDA.com

# Cek firewall
ufw status

# Pastikan port 80 dan 443 open
ufw allow 80/tcp
ufw allow 443/tcp
```

### Problem 8: Lupa password database

```bash
# Edit .env
nano .env

# Ganti password
DB_PASSWORD=password_baru

# Restart containers
docker compose down
docker compose up -d
```

---

## 📊 Checklist Final

Pastikan semua sudah dilakukan:

- [ ] VPS sudah dibeli dan aktif
- [ ] Bisa login ke VPS via SSH
- [ ] System sudah diupdate
- [ ] Firewall sudah dikonfigurasi
- [ ] Docker dan Docker Compose terinstall
- [ ] Kode aplikasi sudah diupload
- [ ] File `.env` sudah dikonfigurasi
- [ ] JWT Secret sudah di-generate
- [ ] Password database sudah diganti
- [ ] Frontend API URL sudah disesuaikan
- [ ] Docker images berhasil di-build
- [ ] Containers berjalan (status: Up)
- [ ] Domain sudah pointing ke VPS
- [ ] Nginx sudah dikonfigurasi
- [ ] SSL certificate sudah terinstall
- [ ] Aplikasi bisa diakses via `https://domain-anda.com`
- [ ] Login berhasil
- [ ] Semua fitur berfungsi normal
- [ ] Backup otomatis sudah disetup
- [ ] Tidak ada error di logs

---

## 📝 Informasi Penting

**Catat informasi berikut untuk referensi:**

```
===========================================
INFORMASI VPS & APLIKASI
===========================================

VPS:
- IP Address: _________________________
- Username: root
- Password: _________________________

Domain:
- Domain: _________________________
- SSL: Let's Encrypt (auto-renew)

Database:
- Host: localhost (di dalam container)
- Database: iware_warehouse
- User: iware_user
- Password: _________________________
- Root Password: _________________________

Aplikasi:
- URL: https://DOMAIN_ANDA.com
- Login: superadmin@iware.id
- Password: jasad666 (GANTI SETELAH LOGIN!)

Docker:
- Location: /opt/iware
- Compose file: /opt/iware/docker-compose.yml
- Env file: /opt/iware/.env

Backup:
- Location: /backup
- Schedule: Setiap hari jam 2 pagi
- Retention: 30 hari

Logs:
- Backend: docker compose logs backend
- Frontend: docker compose logs frontend
- MySQL: docker compose logs mysql
- Nginx: /var/log/nginx/iware-error.log

===========================================
```

---

## 🎯 Next Steps

Setelah aplikasi online:

1. **Ubah Password Default**
   - Login sebagai superadmin
   - Masuk ke Settings
   - Ubah password

2. **Setup Accurate Online Integration**
   - Daftar aplikasi di https://developer.accurate.id/
   - Dapatkan Client ID & Secret
   - Update `.env` dengan credentials Accurate
   - Restart backend: `docker compose restart backend`

3. **Buat User Admin Tambahan**
   - Login sebagai superadmin
   - Masuk ke Users
   - Tambah admin baru

4. **Monitor Aplikasi**
   - Cek logs secara berkala
   - Monitor resource usage
   - Cek backup berjalan

5. **Dokumentasi**
   - Simpan credentials dengan aman
   - Dokumentasi perubahan yang dibuat
   - Backup `.env` file

---

## 📞 Bantuan

Jika mengalami masalah:

1. **Cek logs:**
   ```bash
   docker compose logs -f
   tail -f /var/log/nginx/iware-error.log
   ```

2. **Restart services:**
   ```bash
   docker compose restart
   systemctl restart nginx
   ```

3. **Cek status:**
   ```bash
   docker compose ps
   systemctl status nginx
   ufw status
   ```

4. **Rebuild dari awal:**
   ```bash
   docker compose down -v
   docker compose build --no-cache
   docker compose up -d
   ```

---

## 🎉 Selamat!

Aplikasi iWare Anda sekarang sudah ONLINE dan bisa diakses dari mana saja!

**URL Aplikasi:** https://DOMAIN_ANDA.com

**Login Default:**
```
Email: superadmin@iware.id
Password: jasad666
```

**⚠️ JANGAN LUPA:**
- Ubah password default superadmin
- Setup backup otomatis
- Monitor aplikasi secara berkala
- Update aplikasi secara berkala

---

**Estimasi Total Waktu:** 30-45 menit

**Dibuat dengan ❤️ untuk deployment yang sukses**

**Versi:** 1.0.0
**Tanggal:** 2024
