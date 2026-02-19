# Fix: MySQL Connection Error di VPS

## Error yang Muncul
```
ERROR 2002 (HY000): Can't connect to local server through socket '/run/mysqld/mysqld.sock'
```

## Penyebab
1. MySQL service tidak berjalan
2. MySQL belum terinstall
3. Socket path salah
4. Menggunakan Docker tapi MySQL container tidak jalan

---

## Solusi Berdasarkan Setup

### A. Jika Pakai Docker

#### 1. Cek Status Container
```bash
docker-compose ps
```

Output yang benar:
```
NAME                  STATUS
werehouse-mysql       Up
werehouse-backend     Up
werehouse-frontend    Up
```

#### 2. Jika MySQL Container Tidak Jalan
```bash
# Start semua container
docker-compose up -d

# Atau start MySQL saja
docker-compose up -d mysql

# Cek log MySQL
docker-compose logs mysql
```

#### 3. Jika Container Error
```bash
# Restart semua
docker-compose down
docker-compose up -d

# Cek log untuk lihat error
docker-compose logs mysql --tail 50
```

#### 4. Akses MySQL di Docker
```bash
# Masuk ke MySQL container
docker-compose exec mysql mysql -u root -p

# Atau dari host (port 3307)
mysql -h 127.0.0.1 -P 3307 -u root -p
```

#### 5. Jalankan SQL Fix
```bash
# Via container
docker-compose exec mysql mysql -u root -p iware_warehouse < backend/config/fix-accurate-tokens-table.sql

# Atau copy file ke container
docker cp backend/config/fix-accurate-tokens-table.sql werehouse-mysql:/tmp/
docker-compose exec mysql mysql -u root -p iware_warehouse < /tmp/fix-accurate-tokens-table.sql
```

---

### B. Jika Install MySQL Manual (Tanpa Docker)

#### 1. Cek Status MySQL Service
```bash
# Ubuntu/Debian
sudo systemctl status mysql

# CentOS/RHEL
sudo systemctl status mysqld
```

#### 2. Jika MySQL Tidak Jalan
```bash
# Start MySQL
sudo systemctl start mysql

# Enable auto-start saat boot
sudo systemctl enable mysql

# Cek status lagi
sudo systemctl status mysql
```

#### 3. Jika MySQL Belum Terinstall
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install mysql-server -y

# CentOS/RHEL
sudo yum install mysql-server -y

# Start service
sudo systemctl start mysql
sudo systemctl enable mysql

# Secure installation
sudo mysql_secure_installation
```

#### 4. Cek Socket Path
```bash
# Cari socket MySQL
sudo find / -name "mysqld.sock" 2>/dev/null

# Biasanya di:
# /var/run/mysqld/mysqld.sock
# /tmp/mysql.sock
# /var/lib/mysql/mysql.sock
```

#### 5. Fix Socket Path (Jika Beda)
Edit `backend/.env`:
```env
DB_HOST=localhost
DB_SOCKET=/path/to/mysqld.sock
```

Atau gunakan TCP/IP:
```env
DB_HOST=127.0.0.1
DB_PORT=3306
```

#### 6. Test Koneksi
```bash
# Test login MySQL
mysql -u root -p

# Jika berhasil, jalankan SQL
mysql -u root -p iware_warehouse < backend/config/fix-accurate-tokens-table.sql
```

---

## Verifikasi Fix Berhasil

### 1. Test Koneksi MySQL
```bash
# Docker
docker-compose exec mysql mysql -u root -p -e "SELECT 1;"

# Manual
mysql -u root -p -e "SELECT 1;"
```

### 2. Cek Database Exists
```bash
# Docker
docker-compose exec mysql mysql -u root -p -e "SHOW DATABASES;"

# Manual
mysql -u root -p -e "SHOW DATABASES;"
```

Pastikan `iware_warehouse` ada dalam list.

### 3. Cek Tabel accurate_tokens
```bash
# Docker
docker-compose exec mysql mysql -u root -p iware_warehouse -e "SHOW TABLES LIKE 'accurate_tokens';"

# Manual
mysql -u root -p iware_warehouse -e "SHOW TABLES LIKE 'accurate_tokens';"
```

### 4. Restart Backend
```bash
# Docker
docker-compose restart backend

# PM2
pm2 restart iware-backend
```

### 5. Cek Backend Log
```bash
# Docker
docker-compose logs backend --tail 50

# PM2
pm2 logs iware-backend --lines 50
```

Harus muncul: `✅ Database terhubung dengan sukses`

---

## Troubleshooting Lanjutan

### Error: Access Denied for User
```bash
# Reset password MySQL root
# Docker
docker-compose exec mysql mysql -u root -p -e "ALTER USER 'root'@'localhost' IDENTIFIED BY 'new_password';"

# Manual
sudo mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED BY 'new_password';"
```

Update `backend/.env`:
```env
DB_PASSWORD=new_password
```

### Error: Database 'iware_warehouse' doesn't exist
```bash
# Buat database
# Docker
docker-compose exec mysql mysql -u root -p -e "CREATE DATABASE iware_warehouse;"

# Manual
mysql -u root -p -e "CREATE DATABASE iware_warehouse;"

# Jalankan setup lengkap
mysql -u root -p < backend/SETUP_LENGKAP.sql
```

### Error: Can't connect to MySQL server on '127.0.0.1'
Cek firewall:
```bash
# Ubuntu/Debian
sudo ufw status
sudo ufw allow 3306

# CentOS/RHEL
sudo firewall-cmd --permanent --add-port=3306/tcp
sudo firewall-cmd --reload
```

Cek MySQL bind address:
```bash
# Edit config
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf

# Cari dan ubah
bind-address = 0.0.0.0

# Restart MySQL
sudo systemctl restart mysql
```

---

## Rekomendasi Setup

### Untuk Production (Pakai Docker)
```bash
# 1. Pastikan Docker dan Docker Compose terinstall
docker --version
docker-compose --version

# 2. Clone/upload project ke VPS
cd /var/www/werehouse

# 3. Setup .env
cp .env.docker .env
nano .env  # Edit sesuai kebutuhan

# 4. Start semua service
docker-compose up -d

# 5. Cek status
docker-compose ps
docker-compose logs

# 6. Setup database (jika belum)
docker-compose exec mysql mysql -u root -p < backend/SETUP_LENGKAP.sql
```

### Untuk Development (Manual Install)
```bash
# 1. Install MySQL
sudo apt install mysql-server -y

# 2. Secure installation
sudo mysql_secure_installation

# 3. Setup database
mysql -u root -p < backend/SETUP_LENGKAP.sql

# 4. Setup backend
cd backend
npm install
cp .env.example .env
nano .env  # Edit DB credentials

# 5. Start backend
npm run dev
# atau dengan PM2
pm2 start ecosystem.config.js
```

---

## Checklist

- [ ] MySQL service berjalan
- [ ] Database `iware_warehouse` exists
- [ ] Tabel `accurate_tokens` exists dengan struktur lengkap
- [ ] Backend bisa connect ke MySQL
- [ ] Log backend tidak ada error MySQL
- [ ] Test query berhasil

---

## Command Cepat untuk Copy-Paste

### Docker Setup
```bash
cd /var/www/werehouse
docker-compose up -d
docker-compose exec mysql mysql -u root -p iware_warehouse < backend/config/fix-accurate-tokens-table.sql
docker-compose restart backend
docker-compose logs backend --tail 50
```

### Manual Setup
```bash
sudo systemctl start mysql
mysql -u root -p iware_warehouse < backend/config/fix-accurate-tokens-table.sql
pm2 restart iware-backend
pm2 logs iware-backend --lines 50
```
