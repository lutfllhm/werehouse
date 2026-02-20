# Panduan Setup SSL Manual untuk werehouse.iwareid.com

## Prasyarat

1. **Domain sudah mengarah ke server**
   - Tambahkan A Record di DNS provider Anda:
     ```
     @ (atau werehouse)     -> IP_SERVER_ANDA
     www                    -> IP_SERVER_ANDA
     ```
   - Tunggu propagasi DNS (bisa 5 menit - 24 jam)
   - Cek dengan: `nslookup werehouse.iwareid.com`

2. **Port 80 dan 443 terbuka**
   - Pastikan firewall mengizinkan port 80 dan 443
   - Cek dengan: `sudo ufw status` (jika menggunakan UFW)

3. **Docker dan Docker Compose terinstall**

## Langkah-langkah Setup SSL

### Metode 1: Menggunakan Script Otomatis (Recommended)

```bash
# 1. Berikan permission execute
chmod +x setup-ssl.sh

# 2. Edit email di script (opsional)
nano setup-ssl.sh
# Ubah: EMAIL="admin@iwareid.com" dengan email Anda

# 3. Jalankan script
./setup-ssl.sh
```

### Metode 2: Manual Step-by-Step

#### Step 1: Backup konfigurasi nginx
```bash
cp nginx.conf nginx.conf.backup
```

#### Step 2: Gunakan konfigurasi HTTP-only sementara
```bash
cp nginx-http-only.conf nginx.conf
docker-compose restart nginx
```

#### Step 3: Buat direktori untuk sertifikat
```bash
mkdir -p ./ssl
chmod 755 ./ssl
```

#### Step 4: Dapatkan sertifikat SSL
```bash
docker-compose run --rm certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email admin@iwareid.com \
    --agree-tos \
    --no-eff-email \
    -d werehouse.iwareid.com \
    -d www.werehouse.iwareid.com
```

**Catatan:** Ganti `admin@iwareid.com` dengan email Anda yang valid.

#### Step 5: Kembalikan konfigurasi nginx dengan SSL
```bash
cp nginx.conf.backup nginx.conf
```

#### Step 6: Update docker-compose.yml
Edit `docker-compose.yml`, ubah volume mapping nginx:
```yaml
volumes:
  - ./nginx.conf:/etc/nginx/nginx.conf:ro
  - ./ssl:/etc/letsencrypt:ro  # Ubah dari /etc/letsencrypt
  - certbot_data:/var/www/certbot:ro
```

#### Step 7: Restart semua container
```bash
docker-compose down
docker-compose up -d
```

#### Step 8: Verifikasi SSL
```bash
# Cek status HTTPS
curl -I https://werehouse.iwareid.com

# Atau buka di browser
# https://werehouse.iwareid.com
```

## Troubleshooting

### Error: "Challenge failed"
**Penyebab:** DNS belum mengarah ke server atau port 80 tidak terbuka

**Solusi:**
```bash
# Cek DNS
nslookup werehouse.iwareid.com

# Cek port 80
curl http://werehouse.iwareid.com/.well-known/acme-challenge/test

# Cek firewall
sudo ufw status
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

### Error: "Certificate not found"
**Penyebab:** Sertifikat belum berhasil dibuat

**Solusi:**
```bash
# Cek log certbot
docker-compose logs certbot

# Coba dapatkan sertifikat lagi
docker-compose run --rm certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email admin@iwareid.com \
    --agree-tos \
    --no-eff-email \
    -d werehouse.iwareid.com \
    -d www.werehouse.iwareid.com
```

### Error: "nginx: [emerg] cannot load certificate"
**Penyebab:** Path sertifikat salah atau sertifikat belum ada

**Solusi:**
```bash
# Cek apakah sertifikat ada
ls -la ./ssl/live/www.werehouse.iwareid.com/

# Jika tidak ada, gunakan konfigurasi HTTP-only dulu
cp nginx-http-only.conf nginx.conf
docker-compose restart nginx
```

### Nginx tidak bisa restart
**Solusi:**
```bash
# Cek log nginx
docker-compose logs nginx

# Cek syntax nginx
docker-compose exec nginx nginx -t

# Restart paksa
docker-compose down
docker-compose up -d
```

## Pembaruan Sertifikat Otomatis

Sertifikat Let's Encrypt valid selama 90 hari. Container certbot sudah dikonfigurasi untuk memperbaruinya otomatis setiap 12 jam.

### Cek status auto-renewal
```bash
# Cek log certbot
docker-compose logs certbot

# Test renewal manual
docker-compose run --rm certbot renew --dry-run
```

### Force renewal manual (jika diperlukan)
```bash
docker-compose run --rm certbot renew --force-renewal
docker-compose restart nginx
```

## Verifikasi SSL

### Menggunakan Browser
1. Buka https://werehouse.iwareid.com
2. Klik icon gembok di address bar
3. Cek detail sertifikat

### Menggunakan SSL Labs
1. Buka https://www.ssllabs.com/ssltest/
2. Masukkan: werehouse.iwareid.com
3. Tunggu hasil analisis (grade A/A+ adalah bagus)

### Menggunakan Command Line
```bash
# Cek sertifikat
openssl s_client -connect werehouse.iwareid.com:443 -servername werehouse.iwareid.com

# Cek expiry date
echo | openssl s_client -connect werehouse.iwareid.com:443 -servername werehouse.iwareid.com 2>/dev/null | openssl x509 -noout -dates
```

## Maintenance

### Backup sertifikat
```bash
# Backup direktori ssl
tar -czf ssl-backup-$(date +%Y%m%d).tar.gz ./ssl/
```

### Restore sertifikat
```bash
# Restore dari backup
tar -xzf ssl-backup-YYYYMMDD.tar.gz
docker-compose restart nginx
```

### Revoke sertifikat (jika diperlukan)
```bash
docker-compose run --rm certbot revoke \
    --cert-path /etc/letsencrypt/live/www.werehouse.iwareid.com/cert.pem
```

## Konfigurasi Tambahan (Opsional)

### Redirect www ke non-www (atau sebaliknya)
Edit `nginx.conf`, tambahkan di dalam server block HTTPS:
```nginx
# Redirect www ke non-www
if ($host = 'www.werehouse.iwareid.com') {
    return 301 https://werehouse.iwareid.com$request_uri;
}
```

### Enable HTTP/2 Push (untuk performa)
Sudah enabled di konfigurasi: `listen 443 ssl http2;`

### Enable OCSP Stapling (untuk performa)
Tambahkan di server block HTTPS:
```nginx
ssl_stapling on;
ssl_stapling_verify on;
ssl_trusted_certificate /etc/letsencrypt/live/www.werehouse.iwareid.com/chain.pem;
resolver 8.8.8.8 8.8.4.4 valid=300s;
resolver_timeout 5s;
```

## Kontak & Support

Jika mengalami masalah:
1. Cek log: `docker-compose logs nginx` dan `docker-compose logs certbot`
2. Cek dokumentasi Let's Encrypt: https://letsencrypt.org/docs/
3. Cek dokumentasi Certbot: https://certbot.eff.org/docs/

---

**Catatan Penting:**
- Sertifikat Let's Encrypt gratis dan valid selama 90 hari
- Auto-renewal sudah dikonfigurasi
- Jangan expose private key (`privkey.pem`) ke publik
- Backup sertifikat secara berkala
