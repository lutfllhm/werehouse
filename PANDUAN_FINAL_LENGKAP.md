# 🚀 PANDUAN LENGKAP: VPS KOSONG → APLIKASI LIVE + ACCURATE ONLINE

**Domain**: werehouse.iwareid.com  
**Platform**: VPS Hostinger  
**Teknologi**: Docker + Docker Compose  
**Integrasi**: Accurate Online API

---

## 📋 PERSIAPAN

### Yang Anda Butuhkan:
- ✅ VPS Hostinger (2GB RAM, 2 CPU, 20GB disk)
- ✅ Domain werehouse.iwareid.com
- ✅ SSH access (IP + password dari Hostinger)
- ✅ Accurate Online credentials (ada di accurate.md)

### Setup Domain DNS:
1. Login ke DNS provider (Cloudflare/Namecheap)
2. Tambah A Record: `werehouse.iwareid.com` → `[IP_VPS]`
3. Tambah A Record: `www.werehouse.iwareid.com` → `[IP_VPS]`
4. Tunggu 5-30 menit untuk propagasi

---

## BAGIAN 1: LOGIN & SETUP DASAR VPS

### 1.1 Login ke VPS
```bash
# Dari Windows: gunakan PuTTY
# Dari Mac/Linux:
ssh root@[IP_VPS_ANDA]
# Masukkan password dari Hostinger
```

### 1.2 Update System
```bash
apt update && apt upgrade -y
```

### 1.3 Install Tools Dasar
```bash
apt install -y curl wget git nano ufw net-tools lsof
```

### 1.4 Setup Firewall
```bash
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw enable
ufw status
```

---

## BAGIAN 2: INSTALASI DOCKER

### 2.1 Remove Old Docker (jika ada)
```bash
apt remove docker docker-engine docker.io containerd runc
```

### 2.2 Install Dependencies
```bash
apt install -y apt-transport-https ca-certificates curl software-properties-common
```

### 2.3 Add Docker Repository
```bash
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | \
  gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] \
  https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | \
  tee /etc/apt/sources.list.d/docker.list > /dev/null
```

### 2.4 Install Docker
```bash
apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
systemctl start docker
systemctl enable docker
```

### 2.5 Verify Docker
```bash
docker --version
docker compose version
docker run hello-world
```

---

## BAGIAN 3: UPLOAD PROJECT

### 3.1 Buat Direktori
```bash
mkdir -p /var/www/iware
cd /var/www/iware
```

### 3.2 Upload Files
**Option A - Git:**
```bash
git clone https://github.com/your-repo/iware.git .
```

**Option B - FileZilla/WinSCP:**
- Host: [IP_VPS], Port: 22, User: root
- Upload ke: /var/www/iware

**Option C - SCP:**
```bash
# Dari komputer lokal
scp -r ./iware/* root@[IP_VPS]:/var/www/iware/
```

### 3.3 Verify Files
```bash
cd /var/www/iware
ls -la
# Harus ada: docker-compose.yml, Dockerfile.backend, Dockerfile.frontend, nginx.conf
```

---

## BAGIAN 4: KONFIGURASI ENVIRONMENT

### 4.1 Copy Template
```bash
cd /var/www/iware
cp .env.production backend/.env
```

### 4.2 Generate JWT Secret
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
# Copy hasilnya
```

### 4.3 Edit Environment
```bash
nano backend/.env
```

Paste konfigurasi ini (GANTI JWT_SECRET dengan hasil generate):
```env
NODE_ENV=production
PORT=5000
HOST=0.0.0.0

DB_HOST=mysql
DB_PORT=3306
DB_USER=iware_user
DB_PASSWORD=IwareSecure2024!
DB_NAME=iware_db

JWT_SECRET=[PASTE_HASIL_GENERATE_DISINI]
JWT_EXPIRES_IN=24h

FRONTEND_URL=https://werehouse.iwareid.com

ACCURATE_CLIENT_ID=92539fe0-0f37-450c-810c-e4ca29e44b69
ACCURATE_CLIENT_SECRET=1884d3742a4c536d17ed6b922360cb60
ACCURATE_REDIRECT_URI=https://werehouse.iwareid.com/api/accurate/callback
ACCURATE_API_BASE_URL=https://public-api.accurate.id/api
ACCURATE_AUTH_URL=https://account.accurate.id/oauth/authorize
ACCURATE_TOKEN_URL=https://account.accurate.id/oauth/token
ACCURATE_ACCESS_TOKEN=aat.MTAw.eyJ2IjoxLCJ1IjoxMDkxOTY1LCJkIjoxMTgwNzgsImFpIjo2NTExMSwiYWsiOiI5YmVmNDhiNC1kNjljLTQxYjMtYTk4Yi03NTJmNmVlNzhmZDciLCJhbiI6Iml3YXJld2VyZWhvdXNlIiwiYXAiOiI5MjUzOWZlMC0wZjM3LTQ1MGMtODEwYy1lNGNhMjllNDRiNjkiLCJ0IjoxNzcxNTUwODc3NjY5fQ.MFbiKXfveopURmYGHFpbS4wcXiMdClh4FBF1Fa1SCcZByxxeym1poiXCqxZV7imxBQFN58uurE48EQCe2dbYKcyuUZAMmHeqcAFOEAL17868/hnSLmsfzCuwkVTMhrXuoJ1EJq6pqvz7eGdKoPOBaKuZv7u5BQI+73XKgk4nBb8+LrJtTOTlC1Yalqu6VjaqI9B5VIXwWjk=.UzItw1Mj+vEQxLC/L7Zsejfjmg36plECQ/UbkftMd5Y
ACCURATE_APP_KEY=9bef48b4-d69c-41b3-a98b-752f6ee78fd7
ACCURATE_SIGNATURE_SECRET=obiAplB9p0AdOeq269MoIEtWIO9dX9DVZv3uzfB5jfReyeMfmYkwzTCRa87pMRPb
```

Save: Ctrl+X, Y, Enter

---

## BAGIAN 5: BUILD & DEPLOY DOCKER

### 5.1 Build Images
```bash
cd /var/www/iware
docker compose build
# Tunggu 5-10 menit
```

### 5.2 Start Containers
```bash
docker compose up -d
```

### 5.3 Check Status
```bash
docker compose ps
# Tunggu sampai semua "healthy" (~2-3 menit)
```

### 5.4 View Logs
```bash
docker compose logs -f
# Ctrl+C untuk exit
```

---

## BAGIAN 6: SETUP SSL CERTIFICATE

### 6.1 Install Certbot
```bash
apt install -y certbot
```

### 6.2 Stop Nginx
```bash
docker compose stop nginx
```

### 6.3 Generate Certificate
```bash
certbot certonly --standalone \
  -d werehouse.iwareid.com \
  -d www.werehouse.iwareid.com \
  --email your-email@example.com \
  --agree-tos --non-interactive
```

### 6.4 Copy Certificates
```bash
mkdir -p /var/www/iware/ssl
cp -r /etc/letsencrypt/* /var/www/iware/ssl/
chmod -R 755 /var/www/iware/ssl
```

### 6.5 Start Nginx
```bash
docker compose start nginx
```

### 6.6 Setup Auto-Renewal
```bash
cat > /usr/local/bin/renew-ssl.sh << 'EOF'
#!/bin/bash
certbot renew --quiet
cp -r /etc/letsencrypt/* /var/www/iware/ssl/
docker compose -f /var/www/iware/docker-compose.yml restart nginx
EOF

chmod +x /usr/local/bin/renew-ssl.sh
(crontab -l 2>/dev/null; echo "0 3 * * * /usr/local/bin/renew-ssl.sh") | crontab -
```

---

## BAGIAN 7: INTEGRASI ACCURATE ONLINE

### 7.1 Verify Database
```bash
docker exec -it iware-mysql mysql -u iware_user -pIwareSecure2024! \
  -e "USE iware_db; SHOW TABLES;"
```

### 7.2 Add Accurate Token
```bash
docker exec -it iware-mysql mysql -u iware_user -pIwareSecure2024! iware_db
```

Dalam MySQL, jalankan:
```sql
INSERT INTO accurate_tokens (user_id, access_token, token_type, expires_at, database_id, is_active)
VALUES (1, 'aat.MTAw.eyJ2IjoxLCJ1IjoxMDkxOTY1LCJkIjoxMTgwNzgsImFpIjo2NTExMSwiYWsiOiI5YmVmNDhiNC1kNjljLTQxYjMtYTk4Yi03NTJmNmVlNzhmZDciLCJhbiI6Iml3YXJld2VyZWhvdXNlIiwiYXAiOiI5MjUzOWZlMC0wZjM3LTQ1MGMtODEwYy1lNGNhMjllNDRiNjkiLCJ0IjoxNzcxNTUwODc3NjY5fQ.MFbiKXfveopURmYGHFpbS4wcXiMdClh4FBF1Fa1SCcZByxxeym1poiXCqxZV7imxBQFN58uurE48EQCe2dbYKcyuUZAMmHeqcAFOEAL17868/hnSLmsfzCuwkVTMhrXuoJ1EJq6pqvz7eGdKoPOBaKuZv7u5BQI+73XKgk4nBb8+LrJtTOTlC1Yalqu6VjaqI9B5VIXwWjk=.UzItw1Mj+vEQxLC/L7Zsejfjmg36plECQ/UbkftMd5Y', 'Bearer', DATE_ADD(NOW(), INTERVAL 1 YEAR), 118078, 1);
EXIT;
```

### 7.3 Test Integration
```bash
docker exec -it iware-backend sh
npm run test-accurate
exit
```

---

## BAGIAN 8: TESTING

### 8.1 Test Backend
```bash
curl http://localhost:5000/api/health
# Expected: {"status":"ok"}
```

### 8.2 Test HTTPS
```bash
curl -I https://werehouse.iwareid.com
# Expected: HTTP/2 200
```

### 8.3 Test di Browser
Buka: https://werehouse.iwareid.com

---

## BAGIAN 9: MAINTENANCE

### Daily Commands
```bash
docker compose ps              # Status
docker compose logs -f         # Logs
docker compose restart backend # Restart
```

### Backup
```bash
docker exec iware-mysql mysqldump -u iware_user -pIwareSecure2024! iware_db > backup.sql
```

### Update
```bash
cd /var/www/iware
git pull
docker compose build
docker compose up -d
```

---

## ✅ CHECKLIST

- [ ] VPS setup & firewall
- [ ] Docker installed
- [ ] Project uploaded
- [ ] .env configured
- [ ] Containers running
- [ ] SSL installed
- [ ] HTTPS working
- [ ] Database initialized
- [ ] Accurate token added
- [ ] Website accessible
- [ ] Integration working

---

## 🆘 TROUBLESHOOTING

**Container tidak start:**
```bash
docker compose logs [service]
docker compose restart [service]
```

**Database error:**
```bash
docker compose logs mysql
docker compose restart mysql
```

**SSL error:**
```bash
docker compose stop nginx
certbot renew --force-renewal
cp -r /etc/letsencrypt/* /var/www/iware/ssl/
docker compose start nginx
```

---

## 📊 RINGKASAN INSTALASI

**Yang Diinstall di VPS:**
1. ✅ System updates & tools (curl, wget, git, nano, ufw)
2. ✅ Docker Engine
3. ✅ Docker Compose Plugin
4. ✅ Certbot (SSL)
5. ✅ Firewall (UFW)

**Docker Containers:**
1. ✅ MySQL 8.0
2. ✅ Backend (Node.js)
3. ✅ Frontend (React + Nginx)
4. ✅ Nginx (Reverse Proxy)
5. ✅ Certbot (SSL Management)

**Konfigurasi:**
1. ✅ Environment variables
2. ✅ SSL certificate
3. ✅ Database initialization
4. ✅ Accurate Online integration
5. ✅ Auto-renewal SSL

---

## 🎉 SELESAI!

Website: **https://werehouse.iwareid.com**

Total waktu: **45-60 menit**

Aplikasi sudah LIVE dengan:
- ✅ HTTPS/SSL
- ✅ Docker
- ✅ MySQL
- ✅ Accurate Online
- ✅ Auto-renewal
- ✅ Monitoring

**Selamat! Deployment berhasil! 🚀**
