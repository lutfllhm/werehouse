# Panduan Deployment ke VPS Hostinger (Fresh Install)

## Persiapan Sebelum Deploy

### 1. Informasi yang Harus Disiapkan

**Dari Hostinger:**
- IP Address VPS
- Username SSH (biasanya `root`)
- Password SSH
- Domain yang sudah pointing ke IP VPS

**Dari Accurate Online:**
- Client ID
- Client Secret
- Signature Secret
- Access Token (API Token)
- Redirect URI

**Database:**
- Password MySQL yang akan digunakan
- Nama database

### 2. File yang Harus Disiapkan di Local

```
werehouse/
├── backend/
├── frontend/
├── docker-compose.yml
├── Dockerfile.backend
├── Dockerfile.frontend
├── nginx.conf
├── .env.production
└── setup-ssl.sh
```

## Langkah-langkah Deployment

### STEP 1: Koneksi ke VPS

```bash
ssh root@YOUR_VPS_IP
```

### STEP 2: Update System & Install Dependencies

```bash
# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
apt install docker-compose -y

# Install Git
apt install git -y

# Install utilities
apt install curl wget nano htop -y

# Verify installations
docker --version
docker-compose --version
git --version
```

### STEP 3: Setup Firewall

```bash
# Install UFW
apt install ufw -y

# Allow SSH
ufw allow 22/tcp

# Allow HTTP & HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Enable firewall
ufw --force enable

# Check status
ufw status
```

### STEP 4: Clone atau Upload Project

**Opsi A: Via Git (Recommended)**
```bash
cd /var/www
git clone https://github.com/YOUR_USERNAME/werehouse.git iware
cd iware
```

**Opsi B: Via SCP dari Local**
```bash
# Di komputer local (Windows PowerShell)
scp -r D:\werehouse root@YOUR_VPS_IP:/var/www/iware
```

### STEP 5: Setup Environment Variables

```bash
cd /var/www/iware

# Buat file .env untuk backend
nano backend/.env
```

**Isi file `backend/.env`:**
```env
# Server Configuration
NODE_ENV=production
PORT=5000
HOST=0.0.0.0

# Database Configuration
DB_HOST=mysql
DB_PORT=3306
DB_USER=iware_user
DB_PASSWORD=YOUR_STRONG_PASSWORD_HERE
DB_NAME=iware_warehouse

# JWT Secret (generate random string)
JWT_SECRET=YOUR_RANDOM_JWT_SECRET_HERE
JWT_EXPIRES_IN=24h

# Frontend URL
FRONTEND_URL=https://YOUR_DOMAIN.com

# Accurate Online API
ACCURATE_CLIENT_ID=92539fe0-0f37-450c-810c-e4ca29e44b69
ACCURATE_CLIENT_SECRET=1884d3742a4c536d17ed6b922360cb60
ACCURATE_SIGNATURE_SECRET=obiAplB9p0AdOeq269MoIEtWIO9dX9DVZv3uzfB5jfReyeMfmYkwzTCRa87pMRPb
ACCURATE_REDIRECT_URI=https://YOUR_DOMAIN.com/api/accurate/callback
ACCURATE_ACCESS_TOKEN=aat.MTAw.eyJ2IjoxLCJ1IjoxMDkxOTY1LCJkIjoxMTgwNzgsImFpIjo2NTExMSwiYWsiOiI5YmVmNDhiNC1kNjljLTQxYjMtYTk4Yi03NTJmNmVlNzhmZDciLCJhbiI6Iml3YXJld2VyZWhvdXNlIiwiYXAiOiI5MjUzOWZlMC0wZjM3LTQ1MGMtODEwYy1lNGNhMjllNDRiNjkiLCJ0IjoxNzcxNTUwODc3NjY5fQ.MFbiKXfveopURmYGHFpbS4wcXiMdClh4FBF1Fa1SCcZByxxeym1poiXCqxZV7imxBQFN58uurE48EQCe2dbYKcyuUZAMmHeqcAFOEAL17868/hnSLmsfzCuwkVTMhrXuoJ1EJq6pqvz7eGdKoPOBaKuZv7u5BQI+73XKgk4nBb8+LrJtTOTlC1Yalqu6VjaqI9B5VIXwWjk=.UzItw1Mj+vEQxLC/L7Zsejfjmg36plECQ/UbkftMd5Y
ACCURATE_APP_KEY=9bef48b4-d69c-41b3-a98b-752f6ee78fd7
ACCURATE_DATABASE_ID=118078

# CORS
CORS_ORIGIN=https://YOUR_DOMAIN.com
```

**Generate JWT Secret:**
```bash
# Generate random JWT secret
openssl rand -hex 64
```

### STEP 6: Update docker-compose.yml

```bash
nano docker-compose.yml
```

**Pastikan isi seperti ini:**
```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    container_name: iware-mysql
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: YOUR_STRONG_PASSWORD_HERE
      MYSQL_DATABASE: iware_warehouse
      MYSQL_USER: iware_user
      MYSQL_PASSWORD: YOUR_STRONG_PASSWORD_HERE
    volumes:
      - mysql_data:/var/lib/mysql
      - ./backend/SETUP_LENGKAP.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "3306:3306"
    networks:
      - iware-network
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    container_name: iware-backend
    restart: unless-stopped
    env_file:
      - ./backend/.env
    ports:
      - "5000:5000"
    depends_on:
      mysql:
        condition: service_healthy
    networks:
      - iware-network
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:5000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    container_name: iware-frontend
    restart: unless-stopped
    ports:
      - "3000:80"
    depends_on:
      - backend
    networks:
      - iware-network

  nginx:
    image: nginx:alpine
    container_name: iware-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - /etc/letsencrypt:/etc/letsencrypt:ro
      - certbot_data:/var/www/certbot:ro
    depends_on:
      - frontend
      - backend
    networks:
      - iware-network

  certbot:
    image: certbot/certbot
    container_name: iware-certbot
    volumes:
      - ./ssl:/etc/letsencrypt
      - certbot_data:/var/www/certbot
    entrypoint: "/bin/sh -c 'trap exit TERM; while :; do certbot renew; sleep 12h & wait $${!}; done;'"

volumes:
  mysql_data:
  certbot_data:

networks:
  iware-network:
    driver: bridge
```

### STEP 7: Update nginx.conf

```bash
nano nginx.conf
```

**Ganti `werehouse.iwareid.com` dengan domain Anda:**
```nginx
# Cari dan replace semua:
# werehouse.iwareid.com -> YOUR_DOMAIN.com
```

### STEP 8: Build & Start Containers

```bash
cd /var/www/iware

# Build dan start semua containers
docker-compose up -d --build

# Monitor logs
docker-compose logs -f
```

**Tunggu sampai semua container running (sekitar 2-5 menit)**

### STEP 9: Verify Deployment

```bash
# Check container status
docker ps

# Check backend logs
docker logs iware-backend

# Check database
docker exec iware-backend node scripts/checkDatabase.js

# Check Accurate integration
docker exec iware-backend node scripts/checkAccurateIntegration.js
```

### STEP 10: Setup SSL Certificate

**Pastikan domain sudah pointing ke IP VPS!**

```bash
cd /var/www/iware

# Install certbot
apt install certbot -y

# Stop nginx temporarily
docker stop iware-nginx

# Generate SSL certificate
certbot certonly --standalone -d YOUR_DOMAIN.com

# Start nginx again
docker start iware-nginx

# Test auto-renewal
certbot renew --dry-run
```

### STEP 11: Setup Accurate Token di Database

```bash
# Masuk ke container backend
docker exec -it iware-backend sh

# Jalankan script untuk insert token
node scripts/addTokenFromEnv.js

# Exit container
exit
```

### STEP 12: Test Aplikasi

**Buka browser dan test:**
1. `https://YOUR_DOMAIN.com` - Frontend harus load
2. `https://YOUR_DOMAIN.com/api/health` - Harus return `{"status":"ok"}`
3. Login dengan: `superadmin@iware.id` / password yang di-generate
4. Test menu Items dan Sales Orders

## Troubleshooting

### Container tidak start
```bash
# Check logs
docker-compose logs

# Restart specific container
docker restart iware-backend

# Rebuild
docker-compose down
docker-compose up -d --build
```

### Database connection error
```bash
# Check MySQL container
docker logs iware-mysql

# Check database credentials di .env
cat backend/.env | grep DB_

# Test connection
docker exec iware-backend node scripts/checkDatabase.js
```

### Accurate API error
```bash
# Check environment variables
docker exec iware-backend env | grep ACCURATE

# Test API
docker exec iware-backend node scripts/testAccurateAPI.js

# Check logs
docker logs iware-backend | grep Accurate
```

### SSL Certificate error
```bash
# Check certificate
certbot certificates

# Renew manually
certbot renew --force-renewal

# Restart nginx
docker restart iware-nginx
```

### Port sudah digunakan
```bash
# Check port usage
netstat -tulpn | grep :80
netstat -tulpn | grep :443

# Kill process using port
kill -9 PID_NUMBER

# Or change port di docker-compose.yml
```

## Maintenance Commands

### Update aplikasi
```bash
cd /var/www/iware
git pull origin main
docker-compose up -d --build
```

### Backup database
```bash
docker exec iware-mysql mysqldump -u root -p iware_warehouse > backup_$(date +%Y%m%d).sql
```

### Restore database
```bash
docker exec -i iware-mysql mysql -u root -p iware_warehouse < backup_20260220.sql
```

### View logs
```bash
# All containers
docker-compose logs -f

# Specific container
docker logs -f iware-backend
docker logs -f iware-mysql
docker logs -f iware-nginx
```

### Restart services
```bash
# Restart all
docker-compose restart

# Restart specific
docker restart iware-backend
docker restart iware-mysql
docker restart iware-nginx
```

### Clean up
```bash
# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Remove unused containers
docker container prune
```

## Security Checklist

- [ ] Firewall (UFW) enabled
- [ ] SSH key-based authentication (disable password login)
- [ ] Strong MySQL password
- [ ] Strong JWT secret
- [ ] SSL certificate installed
- [ ] Regular backups scheduled
- [ ] Docker containers auto-restart enabled
- [ ] Fail2ban installed (optional)

## Performance Optimization

### Enable Docker logging rotation
```bash
nano /etc/docker/daemon.json
```

```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

```bash
systemctl restart docker
```

### Monitor resources
```bash
# Install htop
apt install htop -y

# Monitor
htop

# Docker stats
docker stats
```

## Support

Jika ada masalah:
1. Check logs: `docker-compose logs`
2. Check container status: `docker ps -a`
3. Check environment variables: `docker exec iware-backend env`
4. Test database: `docker exec iware-backend node scripts/checkDatabase.js`
5. Test Accurate: `docker exec iware-backend node scripts/checkAccurateIntegration.js`
