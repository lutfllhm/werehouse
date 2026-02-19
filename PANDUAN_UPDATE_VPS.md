# Panduan Update Aplikasi ke VPS

## Langkah-langkah Update

### 1. Push Perubahan ke GitHub (Sudah Dilakukan)
```bash
git add .
git commit -m "Update aplikasi"
git push
```

### 2. Login ke VPS
```bash
ssh root@IP_VPS_ANDA
# atau
ssh username@IP_VPS_ANDA
```

### 3. Masuk ke Direktori Aplikasi
```bash
cd /var/www/werehouse
# atau sesuai lokasi instalasi Anda
```

### 4. Pull Perubahan dari GitHub
```bash
git pull origin main
```

### 5. Restart Aplikasi dengan Docker

#### Opsi A: Restart Cepat (Tanpa Rebuild)
```bash
docker-compose restart
```

#### Opsi B: Rebuild dan Restart (Jika Ada Perubahan Dependency)
```bash
docker-compose down
docker-compose up -d --build
```

#### Opsi C: Full Clean Restart
```bash
docker-compose down
docker system prune -f
docker-compose up -d --build
```

### 6. Cek Status Aplikasi
```bash
# Cek container yang berjalan
docker-compose ps

# Cek logs jika ada masalah
docker-compose logs -f backend
docker-compose logs -f frontend
```

### 7. Test Aplikasi
Buka browser dan akses:
- Frontend: http://IP_VPS_ANDA:3001 atau https://domain-anda.com
- Backend API: http://IP_VPS_ANDA:5001 atau https://api.domain-anda.com

---

## Script Otomatis untuk Update

Saya sudah buatkan script `update-vps.sh` yang bisa Anda jalankan di VPS untuk otomatis update.

### Cara Menggunakan Script:
```bash
# Di VPS, masuk ke direktori aplikasi
cd /var/www/werehouse

# Jalankan script update
bash update-vps.sh
```

---

## Troubleshooting

### Jika Git Pull Gagal (Ada Conflict)
```bash
# Backup perubahan lokal
git stash

# Pull perubahan
git pull origin main

# Restore perubahan lokal jika diperlukan
git stash pop
```

### Jika Docker Compose Gagal
```bash
# Cek error detail
docker-compose logs

# Restart Docker service
sudo systemctl restart docker

# Coba lagi
docker-compose up -d
```

### Jika Port Sudah Digunakan
```bash
# Cek proses yang menggunakan port
sudo lsof -i :3001
sudo lsof -i :5001

# Kill proses jika perlu
sudo kill -9 PID
```

---

## Update Tanpa Downtime (Zero Downtime Deployment)

Untuk production, gunakan strategi blue-green deployment:

```bash
# 1. Build image baru dengan tag berbeda
docker-compose build

# 2. Start container baru
docker-compose up -d --no-deps --scale backend=2 backend

# 3. Tunggu container baru ready
sleep 10

# 4. Stop container lama
docker-compose up -d --no-deps --scale backend=1 backend
```

---

## Monitoring Setelah Update

```bash
# Monitor CPU dan Memory
docker stats

# Monitor logs real-time
docker-compose logs -f --tail=100

# Cek health check
curl http://localhost:5001/health
```
