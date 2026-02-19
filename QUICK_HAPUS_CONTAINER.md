# ⚡ Quick Guide - Hapus Container Docker

**Panduan Cepat untuk werehouse.iwareid.com**

---

## 🎯 Quick Commands (Copy-Paste Langsung)

### Opsi 1: Hapus Semua (Tercepat)

```bash
# Masuk ke folder aplikasi
cd /opt/iware  # atau cd /var/www/iware

# Hapus semua (containers + volumes + images)
docker compose down -v --rmi all

# Hapus folder aplikasi
cd ..
rm -rf iware
```

**Waktu:** 2-3 menit  
**Data:** Hilang semua (backup dulu!)

---

### Opsi 2: Hapus dengan Backup (RECOMMENDED)

```bash
# 1. Backup database
cd /opt/iware  # atau /var/www/iware
docker compose exec -T mysql mysqldump -u root -p"root_password" iware_warehouse > /root/backup_$(date +%Y%m%d).sql

# 2. Backup files
cd ..
tar -czf /root/iware_backup_$(date +%Y%m%d).tar.gz iware/

# 3. Hapus semua
cd iware
docker compose down -v --rmi all

# 4. Hapus folder
cd ..
rm -rf iware
```

**Waktu:** 5-10 menit  
**Data:** Aman (sudah di-backup)

---

### Opsi 3: Gunakan Script Otomatis

```bash
# Download script
wget https://raw.githubusercontent.com/username/iware/main/hapus-container-iware.sh

# Atau buat manual
nano /root/hapus-container-iware.sh
# (copy script dari CARA_HAPUS_CONTAINER_DOCKER.md)

# Jalankan
chmod +x /root/hapus-container-iware.sh
/root/hapus-container-iware.sh
```

**Waktu:** 5-10 menit  
**Data:** Auto backup

---

## 🔍 Check Status

```bash
# Check containers
docker ps -a | grep werehouse

# Check images
docker images | grep iware

# Check volumes
docker volume ls | grep iware

# Check folder
ls -la /opt/ | grep iware
```

---

## 🗑️ Hapus Komponen Spesifik

### Hapus Containers Saja

```bash
cd /opt/iware
docker compose stop
docker compose rm -f
```

### Hapus Volumes (Data)

```bash
docker volume rm iware_mysql_data
```

### Hapus Images

```bash
docker rmi iware-backend iware-frontend
```

### Hapus Network

```bash
docker network rm iware-network
```

---

## 🧹 Cleanup Tambahan

### Hapus Nginx Config

```bash
rm /etc/nginx/sites-enabled/iware
rm /etc/nginx/sites-available/iware
nginx -t && systemctl reload nginx
```

### Hapus SSL Certificate

```bash
certbot delete --cert-name werehouse.iwareid.com
```

### Cleanup Docker System

```bash
docker system prune -a --volumes -f
```

---

## ✅ Verifikasi Penghapusan

```bash
# Semua harus kosong
docker ps -a | grep werehouse
docker images | grep iware
docker volume ls | grep iware
ls /opt/ | grep iware
```

---

## 🔄 Install Ulang

Setelah hapus, untuk install ulang:

```bash
# Clone lagi
git clone REPO_URL /opt/iware
cd /opt/iware

# Setup
cp .env.docker .env
nano .env

# Deploy
docker compose up -d
```

---

## 📞 Troubleshooting

### Container tidak bisa dihapus
```bash
docker compose kill
docker compose rm -f -s -v
```

### Volume tidak bisa dihapus
```bash
docker compose down
docker volume rm iware_mysql_data -f
```

### Port masih digunakan
```bash
kill -9 $(lsof -t -i:5000)
kill -9 $(lsof -t -i:3001)
```

---

## ⚠️ PERINGATAN

**Sebelum hapus:**
- ✅ Backup database
- ✅ Backup files
- ✅ Yakin mau hapus

**Setelah hapus:**
- ❌ Data hilang (jika tidak backup)
- ❌ Container tidak bisa di-start
- ❌ Harus deploy ulang

---

## 📖 Dokumentasi Lengkap

Untuk panduan detail, baca:
- **CARA_HAPUS_CONTAINER_DOCKER.md** - Panduan lengkap 20 halaman

---

**Domain:** werehouse.iwareid.com  
**Path:** /opt/iware atau /var/www/iware

**Selesai! 🎉**
