# 📦 PAKET DEPLOYMENT IWARE - VPS HOSTINGER

## 🎯 PANDUAN UTAMA

👉 **BACA INI DULU**: `PANDUAN_FINAL_LENGKAP.md`

Panduan lengkap dari VPS kosong sampai aplikasi live dengan integrasi Accurate Online.

---

## 📚 STRUKTUR FILE

### 🐳 Docker Files (SUDAH LENGKAP)
```
✅ docker-compose.yml      - 5 containers (MySQL, Backend, Frontend, Nginx, Certbot)
✅ Dockerfile.backend      - Node.js 18 Alpine
✅ Dockerfile.frontend     - React + Nginx (multi-stage)
✅ nginx.conf              - Reverse proxy + SSL
```

### ⚙️ Configuration Files
```
✅ .env.production         - Template environment variables
✅ .dockerignore           - Docker ignore rules
✅ .gitignore              - Git ignore rules
✅ accurate.md             - Accurate Online credentials
```

### 📖 Documentation
```
✅ PANDUAN_FINAL_LENGKAP.md    - PANDUAN UTAMA (BACA INI!)
✅ README_DEPLOYMENT.md         - File ini
```

---

## 🚀 QUICK START

### 1. Upload ke VPS
```bash
# Upload semua file ke /var/www/iware
```

### 2. Setup Environment
```bash
cd /var/www/iware
cp .env.production backend/.env
nano backend/.env  # Edit JWT_SECRET
```

### 3. Deploy
```bash
docker compose build
docker compose up -d
```

### 4. Setup SSL
```bash
apt install -y certbot
docker compose stop nginx
certbot certonly --standalone -d werehouse.iwareid.com
mkdir -p ssl && cp -r /etc/letsencrypt/* ssl/
docker compose start nginx
```

### 5. Done!
```
https://werehouse.iwareid.com
```

---

## 📋 YANG DIINSTALL DI VPS

### System Packages
- curl, wget, git, nano
- ufw (firewall)
- net-tools, lsof
- certbot (SSL)

### Docker
- Docker Engine
- Docker Compose Plugin
- Docker Buildx Plugin

### Containers
1. MySQL 8.0 (database)
2. Node.js Backend (API)
3. React Frontend (UI)
4. Nginx (reverse proxy)
5. Certbot (SSL management)

---

## 🔑 CREDENTIALS

### Database
```
Host: mysql
User: iware_user
Password: IwareSecure2024!
Database: iware_db
```

### Accurate Online
Lihat: `accurate.md`

---

## 📝 COMMAND REFERENCE

### Status & Monitoring
```bash
docker compose ps              # Status containers
docker compose logs -f         # View logs
docker compose logs backend -f # Logs specific service
docker stats                   # Resource usage
```

### Management
```bash
docker compose restart         # Restart all
docker compose restart backend # Restart specific
docker compose down            # Stop all
docker compose up -d           # Start all
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

## 🆘 TROUBLESHOOTING

### Container tidak start
```bash
docker compose logs [service-name]
docker compose restart [service-name]
```

### Database connection error
```bash
docker compose logs mysql
docker compose restart mysql
cat backend/.env | grep DB_
```

### SSL certificate error
```bash
docker compose stop nginx
certbot renew --force-renewal
cp -r /etc/letsencrypt/* /var/www/iware/ssl/
docker compose start nginx
```

### 502 Bad Gateway
```bash
docker compose logs backend
docker compose restart backend
sleep 30
curl http://localhost:5000/api/health
```

---

## ⏱️ ESTIMASI WAKTU

- Setup VPS: 10 menit
- Install Docker: 10 menit
- Upload & Config: 10 menit
- Build & Deploy: 10 menit
- Setup SSL: 5 menit
- Testing: 5 menit

**Total: 50 menit**

---

## ✅ CHECKLIST DEPLOYMENT

- [ ] VPS Hostinger ready
- [ ] Domain pointing ke IP VPS
- [ ] SSH access working
- [ ] Docker installed
- [ ] Project uploaded
- [ ] .env configured
- [ ] JWT_SECRET generated
- [ ] Containers running
- [ ] SSL certificate installed
- [ ] HTTPS working
- [ ] Database initialized
- [ ] Accurate token added
- [ ] Website accessible
- [ ] Login working
- [ ] Accurate integration working

---

## 🌐 HASIL AKHIR

**URL**: https://werehouse.iwareid.com

**Features**:
- ✅ HTTPS/SSL encryption
- ✅ Docker containerization
- ✅ MySQL database
- ✅ Accurate Online integration
- ✅ Auto-renewal SSL
- ✅ Health monitoring
- ✅ Automated backups

---

## 📞 SUPPORT

Jika ada masalah:
1. Check logs: `docker compose logs -f`
2. Check status: `docker compose ps`
3. Lihat troubleshooting di `PANDUAN_FINAL_LENGKAP.md`
4. Restart service: `docker compose restart [service]`

---

## 🎓 DOKUMENTASI LENGKAP

Untuk instruksi detail step-by-step, baca:
👉 **PANDUAN_FINAL_LENGKAP.md**

---

**Semua file sudah lengkap dan siap deploy! 🚀**
