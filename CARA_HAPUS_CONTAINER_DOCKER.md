# 🗑️ Cara Hapus Container Docker di VPS

**Panduan Lengkap Menghapus Container iWare dari VPS**

Domain: werehouse.iwareid.com

---

## 🎯 Quick Commands (Copy-Paste)

### Opsi 1: Hapus Semua (RECOMMENDED)

```bash
# Stop dan hapus semua container, network, dan volumes
cd /opt/iware  # atau /var/www/iware (sesuaikan path)
docker compose down -v

# Hapus images (optional)
docker compose down -v --rmi all

# Hapus folder aplikasi (optional)
cd ..
rm -rf iware
```

### Opsi 2: Hapus Bertahap

```bash
# 1. Stop containers
docker compose stop

# 2. Hapus containers
docker compose rm -f

# 3. Hapus volumes (data akan hilang!)
docker volume rm $(docker volume ls -q | grep iware)

# 4. Hapus network
docker network rm iware-network

# 5. Hapus images
docker rmi $(docker images | grep iware | awk '{print $3}')
```

---

## 📋 Langkah Detail Step-by-Step

### FASE 1: Backup Data (PENTING!)

```bash
# 1. Backup database
docker compose exec -T mysql mysqldump -u root -p"root_password" iware_warehouse > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Backup .env files
cp backend/.env backend/.env.backup
cp .env.docker .env.docker.backup

# 3. Backup folder (optional)
cd ..
tar -czf iware_backup_$(date +%Y%m%d_%H%M%S).tar.gz iware/

# Pindahkan backup ke tempat aman
mv iware_backup_*.tar.gz /root/backups/
mv iware/backup_*.sql /root/backups/
```

---

### FASE 2: Stop Containers

```bash
# Masuk ke folder aplikasi
cd /opt/iware  # atau /var/www/iware

# Check containers yang running
docker compose ps

# Stop semua containers
docker compose stop

# Verifikasi sudah stop
docker compose ps
```

**Output yang diharapkan:**
```
NAME                  STATUS
werehouse-backend     Exited
werehouse-frontend    Exited
werehouse-mysql       Exited
```

---

### FASE 3: Hapus Containers

```bash
# Hapus containers (tapi keep volumes)
docker compose rm -f

# Atau hapus containers + volumes (data hilang!)
docker compose down -v

# Verifikasi containers sudah terhapus
docker ps -a | grep werehouse
# Harus kosong
```

---

### FASE 4: Hapus Volumes (Data)

**⚠️ PERINGATAN: Data database akan hilang!**

```bash
# List volumes
docker volume ls | grep iware

# Hapus volume MySQL (data hilang!)
docker volume rm iware_mysql_data

# Atau hapus semua volumes iware
docker volume rm $(docker volume ls -q | grep iware)

# Verifikasi
docker volume ls | grep iware
# Harus kosong
```

---

### FASE 5: Hapus Networks

```bash
# List networks
docker network ls | grep iware

# Hapus network
docker network rm iware-network

# Verifikasi
docker network ls | grep iware
# Harus kosong
```

---

### FASE 6: Hapus Images

```bash
# List images
docker images | grep iware

# Hapus images
docker rmi iware-backend
docker rmi iware-frontend

# Atau hapus semua images iware
docker rmi $(docker images | grep iware | awk '{print $3}')

# Verifikasi
docker images | grep iware
# Harus kosong
```

---

### FASE 7: Hapus Files Aplikasi

```bash
# Backup dulu (jika belum)
cd /opt
tar -czf iware_backup_$(date +%Y%m%d).tar.gz iware/

# Hapus folder
rm -rf iware/

# Verifikasi
ls -la /opt/ | grep iware
# Harus kosong
```

---

### FASE 8: Cleanup Docker System

```bash
# Hapus unused containers
docker container prune -f

# Hapus unused images
docker image prune -a -f

# Hapus unused volumes
docker volume prune -f

# Hapus unused networks
docker network prune -f

# Atau cleanup semua sekaligus
docker system prune -a --volumes -f
```

---

### FASE 9: Hapus Nginx Config (Jika Ada)

```bash
# Check apakah ada config Nginx
ls -la /etc/nginx/sites-enabled/ | grep iware

# Hapus symbolic link
rm /etc/nginx/sites-enabled/iware

# Hapus config file
rm /etc/nginx/sites-available/iware

# Test Nginx config
nginx -t

# Reload Nginx
systemctl reload nginx
```

---

### FASE 10: Hapus SSL Certificate (Jika Ada)

```bash
# Check certificates
certbot certificates | grep werehouse.iwareid.com

# Hapus certificate
certbot delete --cert-name werehouse.iwareid.com

# Verifikasi
certbot certificates
```

---

### FASE 11: Verifikasi Penghapusan

```bash
# 1. Check containers
docker ps -a | grep werehouse
# Harus kosong

# 2. Check images
docker images | grep iware
# Harus kosong

# 3. Check volumes
docker volume ls | grep iware
# Harus kosong

# 4. Check networks
docker network ls | grep iware
# Harus kosong

# 5. Check folder
ls -la /opt/ | grep iware
# Harus kosong

# 6. Check ports
netstat -tulpn | grep :5000
netstat -tulpn | grep :3001
# Harus kosong

# 7. Check Nginx
ls /etc/nginx/sites-enabled/ | grep iware
# Harus kosong

# 8. Check SSL
certbot certificates | grep werehouse
# Harus kosong
```

---

## 🤖 Script Otomatis Hapus Container

Buat file untuk mempermudah:

```bash
nano /root/hapus-container-iware.sh
```

**Paste script berikut:**

```bash
#!/bin/bash

# ========================================
# Script Hapus Container Docker iWare
# ========================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}  Hapus Container Docker iWare${NC}"
echo -e "${YELLOW}========================================${NC}"
echo ""

# Konfirmasi
read -p "Apakah Anda yakin ingin menghapus semua container iWare? (ketik 'yes'): " confirm

if [ "$confirm" != "yes" ]; then
    echo -e "${GREEN}Dibatalkan.${NC}"
    exit 0
fi

# Path aplikasi (sesuaikan jika berbeda)
APP_PATH="/opt/iware"

if [ ! -d "$APP_PATH" ]; then
    APP_PATH="/var/www/iware"
fi

if [ ! -d "$APP_PATH" ]; then
    echo -e "${RED}Folder aplikasi tidak ditemukan!${NC}"
    echo "Coba manual: docker ps -a | grep werehouse"
    exit 1
fi

echo ""
echo -e "${YELLOW}1/11 Backup database...${NC}"
cd "$APP_PATH"
if docker compose ps | grep -q "mysql"; then
    BACKUP_FILE="/root/backup_before_delete_$(date +%Y%m%d_%H%M%S).sql"
    docker compose exec -T mysql mysqldump -u root -p"${MYSQL_ROOT_PASSWORD:-root_password_change_this}" iware_warehouse > "$BACKUP_FILE" 2>/dev/null || true
    echo -e "${GREEN}✓ Database di-backup ke: $BACKUP_FILE${NC}"
else
    echo -e "${YELLOW}⚠ MySQL container tidak running, skip backup${NC}"
fi

echo ""
echo -e "${YELLOW}2/11 Backup files...${NC}"
cd ..
tar -czf "/root/iware_files_backup_$(date +%Y%m%d_%H%M%S).tar.gz" iware/ 2>/dev/null || true
echo -e "${GREEN}✓ Files di-backup${NC}"

echo ""
echo -e "${YELLOW}3/11 Stop containers...${NC}"
cd "$APP_PATH"
docker compose stop 2>/dev/null || true
echo -e "${GREEN}✓ Containers stopped${NC}"

echo ""
echo -e "${YELLOW}4/11 Hapus containers...${NC}"
docker compose rm -f 2>/dev/null || true
echo -e "${GREEN}✓ Containers removed${NC}"

echo ""
echo -e "${YELLOW}5/11 Hapus volumes...${NC}"
docker volume rm iware_mysql_data 2>/dev/null || true
docker volume rm $(docker volume ls -q | grep iware) 2>/dev/null || true
echo -e "${GREEN}✓ Volumes removed${NC}"

echo ""
echo -e "${YELLOW}6/11 Hapus networks...${NC}"
docker network rm iware-network 2>/dev/null || true
echo -e "${GREEN}✓ Networks removed${NC}"

echo ""
echo -e "${YELLOW}7/11 Hapus images...${NC}"
docker rmi $(docker images | grep iware | awk '{print $3}') 2>/dev/null || true
echo -e "${GREEN}✓ Images removed${NC}"

echo ""
echo -e "${YELLOW}8/11 Hapus files aplikasi...${NC}"
cd ..
rm -rf iware/
echo -e "${GREEN}✓ Files removed${NC}"

echo ""
echo -e "${YELLOW}9/11 Hapus Nginx config...${NC}"
rm -f /etc/nginx/sites-enabled/iware 2>/dev/null || true
rm -f /etc/nginx/sites-available/iware 2>/dev/null || true
nginx -t 2>/dev/null && systemctl reload nginx 2>/dev/null || true
echo -e "${GREEN}✓ Nginx config removed${NC}"

echo ""
echo -e "${YELLOW}10/11 Hapus SSL certificate...${NC}"
certbot delete --cert-name werehouse.iwareid.com --non-interactive 2>/dev/null || true
echo -e "${GREEN}✓ SSL certificate removed${NC}"

echo ""
echo -e "${YELLOW}11/11 Cleanup Docker system...${NC}"
docker system prune -f 2>/dev/null || true
echo -e "${GREEN}✓ Docker system cleaned${NC}"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  ✓ Penghapusan Selesai!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Backup tersimpan di:"
echo "  - Database: /root/backup_before_delete_*.sql"
echo "  - Files: /root/iware_files_backup_*.tar.gz"
echo ""

# Verifikasi
echo "Verifikasi:"
echo ""

if docker ps -a | grep -q "werehouse"; then
    echo -e "${RED}✗ Containers masih ada${NC}"
else
    echo -e "${GREEN}✓ Containers: Bersih${NC}"
fi

if docker images | grep -q "iware"; then
    echo -e "${RED}✗ Images masih ada${NC}"
else
    echo -e "${GREEN}✓ Images: Bersih${NC}"
fi

if docker volume ls | grep -q "iware"; then
    echo -e "${RED}✗ Volumes masih ada${NC}"
else
    echo -e "${GREEN}✓ Volumes: Bersih${NC}"
fi

if [ -d "/opt/iware" ] || [ -d "/var/www/iware" ]; then
    echo -e "${RED}✗ Folder aplikasi masih ada${NC}"
else
    echo -e "${GREEN}✓ Folder: Bersih${NC}"
fi

echo ""
echo -e "${GREEN}Selesai!${NC}"
```

**Simpan dan jalankan:**

```bash
# Beri permission
chmod +x /root/hapus-container-iware.sh

# Jalankan
/root/hapus-container-iware.sh
```

---

## 🔍 Troubleshooting

### Problem 1: Container tidak bisa dihapus

**Error:** `Error response from daemon: conflict: unable to remove...`

**Solusi:**
```bash
# Force stop
docker compose kill

# Force remove
docker compose rm -f -s -v

# Atau manual
docker rm -f werehouse-backend werehouse-frontend werehouse-mysql
```

---

### Problem 2: Volume tidak bisa dihapus

**Error:** `Error response from daemon: volume is in use`

**Solusi:**
```bash
# Stop semua containers dulu
docker compose down

# Hapus volume
docker volume rm iware_mysql_data -f

# Atau force remove semua
docker volume prune -f
```

---

### Problem 3: Image tidak bisa dihapus

**Error:** `Error response from daemon: conflict: unable to delete...`

**Solusi:**
```bash
# Hapus containers dulu
docker compose rm -f

# Hapus image
docker rmi -f iware-backend iware-frontend

# Atau force remove semua
docker image prune -a -f
```

---

### Problem 4: Port masih digunakan

**Check port:**
```bash
netstat -tulpn | grep :5000
netstat -tulpn | grep :3001
netstat -tulpn | grep :3306
```

**Solusi:**
```bash
# Kill process di port
kill -9 $(lsof -t -i:5000)
kill -9 $(lsof -t -i:3001)
kill -9 $(lsof -t -i:3306)
```

---

### Problem 5: Nginx masih pointing ke container

**Solusi:**
```bash
# Hapus config
rm /etc/nginx/sites-enabled/iware
rm /etc/nginx/sites-available/iware

# Test config
nginx -t

# Reload
systemctl reload nginx
```

---

## 📊 Checklist Penghapusan

- [ ] Backup database
- [ ] Backup files
- [ ] Stop containers
- [ ] Hapus containers
- [ ] Hapus volumes
- [ ] Hapus networks
- [ ] Hapus images
- [ ] Hapus files aplikasi
- [ ] Hapus Nginx config
- [ ] Hapus SSL certificate
- [ ] Cleanup Docker system
- [ ] Verifikasi penghapusan

---

## 🔄 Jika Mau Install Ulang

Setelah hapus container, untuk install ulang:

```bash
# 1. Clone repository lagi
git clone REPO_URL /opt/iware
cd /opt/iware

# 2. Setup .env
cp .env.docker .env
nano .env  # Edit konfigurasi

# 3. Deploy lagi
docker compose up -d

# 4. Setup Nginx + SSL lagi
# (lihat PANDUAN_HOSTING_VPS_HOSTINGER_LENGKAP.md)
```

---

## 📞 Command Reference Cepat

```bash
# List containers
docker ps -a

# List images
docker images

# List volumes
docker volume ls

# List networks
docker network ls

# Stop semua
docker compose stop

# Hapus semua (containers + volumes)
docker compose down -v

# Hapus semua (containers + volumes + images)
docker compose down -v --rmi all

# Cleanup system
docker system prune -a --volumes -f
```

---

## ⚠️ PERINGATAN

**Sebelum hapus, pastikan:**
1. ✅ Sudah backup database
2. ✅ Sudah backup files
3. ✅ Tidak ada data penting yang belum di-backup
4. ✅ Yakin mau hapus (tidak bisa undo!)

**Setelah hapus:**
- Data database akan hilang (jika hapus volume)
- Container tidak bisa di-start lagi
- Harus deploy ulang dari awal

---

## 🎯 Quick Summary

**Hapus cepat (1 command):**
```bash
cd /opt/iware && docker compose down -v --rmi all && cd .. && rm -rf iware
```

**Hapus dengan backup:**
```bash
# Backup
docker compose exec -T mysql mysqldump -u root -p iware_warehouse > backup.sql
tar -czf iware_backup.tar.gz iware/

# Hapus
cd /opt/iware && docker compose down -v --rmi all && cd .. && rm -rf iware
```

**Hapus dengan script:**
```bash
chmod +x /root/hapus-container-iware.sh
/root/hapus-container-iware.sh
```

---

**Subdomain Anda:** werehouse.iwareid.com  
**Path aplikasi:** /opt/iware atau /var/www/iware

**Selesai! Container Docker berhasil dihapus! 🎉**

**Dibuat dengan ❤️ untuk iWare**
