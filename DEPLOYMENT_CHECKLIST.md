# Checklist Deployment ke VPS Hostinger

## Persiapan (Di Local)

### 1. Informasi yang Dibutuhkan
- [ ] IP Address VPS dari Hostinger
- [ ] Password SSH root
- [ ] Domain sudah pointing ke IP VPS
- [ ] Accurate Online credentials (Client ID, Secret, Token)

### 2. File Project
- [ ] Semua file project sudah siap di `D:\werehouse\`
- [ ] `docker-compose.yml` sudah dikonfigurasi
- [ ] `nginx.conf` sudah update domain
- [ ] `backend/.env` template sudah siap

### 3. Update Konfigurasi
- [ ] Update domain di `nginx.conf`
- [ ] Update domain di `backend/.env` (FRONTEND_URL, CORS_ORIGIN, ACCURATE_REDIRECT_URI)
- [ ] Generate JWT_SECRET baru
- [ ] Set password MySQL yang kuat

## Deployment (Di VPS)

### 4. Koneksi & Setup Awal
```bash
# Login ke VPS
ssh root@YOUR_VPS_IP

# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
apt install docker-compose -y

# Install utilities
apt install git curl wget nano htop ufw certbot -y
```

- [ ] Berhasil login ke VPS
- [ ] Docker terinstall
- [ ] Docker Compose terinstall
- [ ] Utilities terinstall

### 5. Setup Firewall
```bash
ufw --force enable
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw status
```

- [ ] Firewall aktif
- [ ] Port 22, 80, 443 terbuka

### 6. Upload Project
```bash
# Opsi 1: Via SCP (dari local Windows)
scp -r D:\werehouse root@YOUR_VPS_IP:/var/www/iware

# Opsi 2: Via Git (di VPS)
cd /var/www
git clone YOUR_REPO_URL iware
```

- [ ] Project berhasil di-upload ke `/var/www/iware`

### 7. Konfigurasi Environment
```bash
cd /var/www/iware
nano backend/.env
```

**Update nilai berikut:**
- [ ] `DB_PASSWORD` - Password MySQL yang kuat
- [ ] `JWT_SECRET` - Generate dengan `openssl rand -hex 64`
- [ ] `FRONTEND_URL` - Domain Anda
- [ ] `CORS_ORIGIN` - Domain Anda
- [ ] `ACCURATE_REDIRECT_URI` - Domain Anda + `/api/accurate/callback`
- [ ] `ACCURATE_ACCESS_TOKEN` - Token dari Accurate Online
- [ ] `ACCURATE_SIGNATURE_SECRET` - Secret dari Accurate Online

**Update docker-compose.yml:**
- [ ] `MYSQL_ROOT_PASSWORD` sama dengan `DB_PASSWORD`
- [ ] `MYSQL_PASSWORD` sama dengan `DB_PASSWORD`

### 8. Build & Start
```bash
cd /var/www/iware
docker-compose up -d --build
```

- [ ] Build berhasil tanpa error
- [ ] Semua container running

### 9. Verifikasi Containers
```bash
docker ps
```

Harus ada 5 containers running:
- [ ] `iware-mysql` - Status: Up, Healthy
- [ ] `iware-backend` - Status: Up, Healthy
- [ ] `iware-frontend` - Status: Up
- [ ] `iware-nginx` - Status: Up
- [ ] `iware-certbot` - Status: Up

### 10. Check Database
```bash
docker exec iware-backend node scripts/checkDatabase.js
```

- [ ] Database connected
- [ ] Tables created (users, items, sales_orders, accurate_tokens, activity_logs)
- [ ] Superadmin user created

### 11. Setup Accurate Token
```bash
docker exec iware-backend node scripts/addTokenFromEnv.js
```

- [ ] Token berhasil ditambahkan ke database

### 12. Check Accurate Integration
```bash
docker exec iware-backend node scripts/checkAccurateIntegration.js
```

- [ ] Environment variables ter-set
- [ ] Database connected
- [ ] Table accurate_tokens exists
- [ ] Token active di database

### 13. Setup SSL Certificate
```bash
# Stop nginx
docker stop iware-nginx

# Generate certificate
certbot certonly --standalone -d YOUR_DOMAIN.com

# Start nginx
docker start iware-nginx

# Test auto-renewal
certbot renew --dry-run
```

- [ ] SSL certificate berhasil di-generate
- [ ] Nginx restart berhasil
- [ ] Auto-renewal test passed

### 14. Test Aplikasi

**Test dari browser:**
- [ ] `http://YOUR_DOMAIN.com` redirect ke HTTPS
- [ ] `https://YOUR_DOMAIN.com` - Frontend load
- [ ] `https://YOUR_DOMAIN.com/api/health` - Return `{"status":"ok"}`
- [ ] Login page muncul
- [ ] Bisa login dengan superadmin
- [ ] Dashboard muncul
- [ ] Menu Items bisa diakses
- [ ] Menu Sales Orders bisa diakses

**Get admin password:**
```bash
docker exec iware-backend cat logs/admin-password.txt
```

### 15. Test Accurate Integration

**Di aplikasi:**
- [ ] Buka menu Items
- [ ] Klik "Sync dari Accurate"
- [ ] Data items muncul
- [ ] Buka menu Sales Orders
- [ ] Data sales orders muncul

**Via command:**
```bash
docker exec iware-backend node scripts/testAccurateAPI.js
```

- [ ] API connection berhasil
- [ ] Bisa fetch items
- [ ] Bisa fetch sales orders

## Post-Deployment

### 16. Security
- [ ] Change SSH port (optional)
- [ ] Setup SSH key authentication
- [ ] Disable password login
- [ ] Install fail2ban (optional)
- [ ] Setup automatic backups

### 17. Monitoring
- [ ] Setup log rotation
- [ ] Monitor disk space: `df -h`
- [ ] Monitor memory: `free -h`
- [ ] Monitor containers: `docker stats`

### 18. Backup
```bash
# Backup database
docker exec iware-mysql mysqldump -u root -pYOUR_PASSWORD iware_warehouse > backup_$(date +%Y%m%d).sql

# Backup .env
cp backend/.env backend/.env.backup
```

- [ ] Database backup berhasil
- [ ] .env backup berhasil

### 19. Documentation
- [ ] Catat password MySQL
- [ ] Catat JWT secret
- [ ] Catat admin password
- [ ] Catat SSL certificate location
- [ ] Simpan backup di tempat aman

## Troubleshooting Quick Reference

### Container tidak start
```bash
docker-compose logs
docker-compose down
docker-compose up -d --build
```

### Database error
```bash
docker logs iware-mysql
docker exec iware-backend node scripts/checkDatabase.js
```

### Accurate API error
```bash
docker logs iware-backend | grep Accurate
docker exec iware-backend node scripts/testAccurateAPI.js
```

### SSL error
```bash
certbot certificates
certbot renew --force-renewal
docker restart iware-nginx
```

### Check all logs
```bash
docker-compose logs -f
```

## Maintenance Commands

```bash
# Restart all
docker-compose restart

# Restart specific
docker restart iware-backend

# Update code
cd /var/www/iware
git pull
docker-compose up -d --build

# View logs
docker logs -f iware-backend

# Backup database
docker exec iware-mysql mysqldump -u root -p iware_warehouse > backup.sql

# Clean up
docker system prune -a
```

## Success Criteria

✅ Deployment berhasil jika:
1. Semua 5 containers running
2. Database connected dan tables created
3. Accurate token active di database
4. SSL certificate installed
5. Frontend accessible via HTTPS
6. Backend API responding
7. Login berhasil
8. Bisa fetch data dari Accurate Online

## Support

Jika ada masalah, check:
1. Container logs: `docker-compose logs`
2. Container status: `docker ps -a`
3. Database: `docker exec iware-backend node scripts/checkDatabase.js`
4. Accurate: `docker exec iware-backend node scripts/checkAccurateIntegration.js`
5. Environment: `docker exec iware-backend env | grep ACCURATE`
