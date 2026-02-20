# Troubleshooting SSL untuk werehouse.iwareid.com

## Masalah Umum dan Solusinya

### 1. ❌ Challenge Failed - DNS tidak resolve

**Error:**
```
Challenge failed for domain werehouse.iwareid.com
```

**Penyebab:**
- DNS belum mengarah ke IP server
- DNS belum propagasi
- Port 80 tidak terbuka

**Solusi:**

```bash
# 1. Cek DNS
nslookup werehouse.iwareid.com
dig werehouse.iwareid.com

# 2. Cek apakah domain mengarah ke IP server Anda
ping werehouse.iwareid.com

# 3. Cek port 80 terbuka
curl http://werehouse.iwareid.com/.well-known/acme-challenge/test

# 4. Cek firewall
sudo ufw status
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# 5. Tunggu propagasi DNS (5 menit - 24 jam)
# Cek propagasi: https://dnschecker.org
```

**Jika DNS sudah benar tapi masih error:**
```bash
# Restart nginx dan coba lagi
docker-compose restart nginx
sleep 5

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

---

### 2. ❌ Too Many Requests

**Error:**
```
Error: urn:ietf:params:acme:error:rateLimited
Too many failed authorizations recently
```

**Penyebab:**
Let's Encrypt rate limit: 5 percobaan gagal per jam per domain

**Solusi:**

```bash
# Opsi 1: Tunggu 1 jam
# Kemudian coba lagi

# Opsi 2: Gunakan staging untuk testing
docker-compose run --rm certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email admin@iwareid.com \
    --agree-tos \
    --no-eff-email \
    --staging \
    -d werehouse.iwareid.com \
    -d www.werehouse.iwareid.com

# Jika staging berhasil, tunggu 1 jam lalu gunakan production
```

**Rate Limits Let's Encrypt:**
- 50 sertifikat per domain per minggu
- 5 percobaan gagal per jam
- 300 pending authorizations per akun

---

### 3. ❌ Certificate Not Found

**Error:**
```
nginx: [emerg] cannot load certificate "/etc/letsencrypt/live/www.werehouse.iwareid.com/fullchain.pem"
```

**Penyebab:**
- Sertifikat belum dibuat
- Path sertifikat salah
- Volume mapping salah

**Solusi:**

```bash
# 1. Cek apakah sertifikat ada
ls -la ./ssl/live/www.werehouse.iwareid.com/

# 2. Jika tidak ada, gunakan HTTP-only dulu
cp nginx-http-only.conf nginx.conf
docker-compose restart nginx

# 3. Dapatkan sertifikat
docker-compose run --rm certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email admin@iwareid.com \
    --agree-tos \
    --no-eff-email \
    -d werehouse.iwareid.com \
    -d www.werehouse.iwareid.com

# 4. Cek lagi
ls -la ./ssl/live/www.werehouse.iwareid.com/

# 5. Kembalikan konfigurasi SSL
cp nginx.conf.backup nginx.conf
docker-compose restart nginx
```

---

### 4. ❌ Nginx Configuration Test Failed

**Error:**
```
nginx: [emerg] invalid number of arguments in "ssl_certificate" directive
```

**Penyebab:**
- Syntax error di nginx.conf
- Path sertifikat salah

**Solusi:**

```bash
# 1. Test konfigurasi nginx
docker-compose exec nginx nginx -t

# 2. Cek log error
docker-compose logs nginx | tail -50

# 3. Validasi nginx.conf
cat nginx.conf | grep ssl_certificate

# 4. Pastikan path benar
# Seharusnya: /etc/letsencrypt/live/www.werehouse.iwareid.com/fullchain.pem
# Bukan: /etc/letsencrypt/live/werehouse.iwareid.com/fullchain.pem

# 5. Jika masih error, gunakan backup
cp nginx.conf.backup nginx.conf
docker-compose restart nginx
```

---

### 5. ❌ 502 Bad Gateway setelah SSL

**Error:**
Browser menampilkan "502 Bad Gateway"

**Penyebab:**
- Backend tidak running
- Nginx tidak bisa connect ke backend
- Port mapping salah

**Solusi:**

```bash
# 1. Cek status container
docker-compose ps

# 2. Cek log backend
docker-compose logs backend | tail -50

# 3. Cek health backend
curl http://localhost:5000/api/health

# 4. Restart backend
docker-compose restart backend
sleep 10

# 5. Test lagi
curl -I https://werehouse.iwareid.com

# 6. Jika masih error, restart semua
docker-compose down
docker-compose up -d
```

---

### 6. ❌ Mixed Content Warning

**Error:**
Browser console: "Mixed Content: The page was loaded over HTTPS, but requested an insecure resource"

**Penyebab:**
Frontend masih menggunakan HTTP untuk API calls

**Solusi:**

```bash
# 1. Cek frontend environment
cat frontend/.env

# 2. Pastikan API URL menggunakan HTTPS
# VITE_API_URL=https://werehouse.iwareid.com/api

# 3. Rebuild frontend
docker-compose build frontend
docker-compose up -d frontend

# 4. Clear browser cache
# Ctrl+Shift+Delete (Chrome/Firefox)
```

---

### 7. ❌ Certificate Expired

**Error:**
```
NET::ERR_CERT_DATE_INVALID
```

**Penyebab:**
Sertifikat sudah expired (90 hari)

**Solusi:**

```bash
# 1. Cek expiry date
openssl x509 -in ./ssl/live/www.werehouse.iwareid.com/cert.pem -noout -dates

# 2. Manual renewal
./renew-ssl.sh

# Atau:
docker-compose run --rm certbot renew --force-renewal
docker-compose restart nginx

# 3. Cek auto-renewal berjalan
docker-compose logs certbot | grep -i renew

# 4. Pastikan certbot container running
docker-compose ps certbot
```

---

### 8. ❌ Permission Denied

**Error:**
```
Permission denied: '/etc/letsencrypt/live/www.werehouse.iwareid.com/privkey.pem'
```

**Penyebab:**
Permission file sertifikat salah

**Solusi:**

```bash
# 1. Cek permission
ls -la ./ssl/live/www.werehouse.iwareid.com/

# 2. Fix permission
sudo chmod -R 755 ./ssl/
sudo chmod 644 ./ssl/live/www.werehouse.iwareid.com/*.pem

# 3. Restart nginx
docker-compose restart nginx
```

---

### 9. ❌ Certbot Container Exits Immediately

**Error:**
Container certbot exit dengan code 0 atau 1

**Penyebab:**
- Certbot sudah selesai (normal)
- Error saat renewal

**Solusi:**

```bash
# 1. Cek log certbot
docker-compose logs certbot

# 2. Jika ada error, cek detail
docker-compose run --rm certbot renew --dry-run

# 3. Manual renewal
docker-compose run --rm certbot renew

# 4. Restart nginx setelah renewal
docker-compose restart nginx
```

---

### 10. ❌ Domain Mismatch

**Error:**
```
NET::ERR_CERT_COMMON_NAME_INVALID
```

**Penyebab:**
Sertifikat tidak match dengan domain yang diakses

**Solusi:**

```bash
# 1. Cek domain di sertifikat
openssl x509 -in ./ssl/live/www.werehouse.iwareid.com/cert.pem -noout -text | grep DNS

# 2. Pastikan sertifikat mencakup kedua domain:
# DNS:werehouse.iwareid.com
# DNS:www.werehouse.iwareid.com

# 3. Jika tidak, dapatkan sertifikat baru
docker-compose run --rm certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email admin@iwareid.com \
    --agree-tos \
    --no-eff-email \
    --force-renewal \
    -d werehouse.iwareid.com \
    -d www.werehouse.iwareid.com

# 4. Restart nginx
docker-compose restart nginx
```

---

## Diagnostic Commands

### Cek Status Lengkap
```bash
./check-ssl.sh
```

### Cek DNS
```bash
nslookup werehouse.iwareid.com
dig werehouse.iwareid.com
host werehouse.iwareid.com
```

### Cek Port
```bash
# Port 80
nc -zv werehouse.iwareid.com 80
curl -I http://werehouse.iwareid.com

# Port 443
nc -zv werehouse.iwareid.com 443
curl -I https://werehouse.iwareid.com
```

### Cek Sertifikat
```bash
# Detail sertifikat
openssl x509 -in ./ssl/live/www.werehouse.iwareid.com/cert.pem -noout -text

# Expiry date
openssl x509 -in ./ssl/live/www.werehouse.iwareid.com/cert.pem -noout -dates

# Issuer
openssl x509 -in ./ssl/live/www.werehouse.iwareid.com/cert.pem -noout -issuer

# Subject
openssl x509 -in ./ssl/live/www.werehouse.iwareid.com/cert.pem -noout -subject
```

### Cek SSL Connection
```bash
# Basic check
openssl s_client -connect werehouse.iwareid.com:443 -servername werehouse.iwareid.com

# Cek cipher
openssl s_client -connect werehouse.iwareid.com:443 -cipher 'ECDHE-RSA-AES128-GCM-SHA256'

# Cek protocol
openssl s_client -connect werehouse.iwareid.com:443 -tls1_2
openssl s_client -connect werehouse.iwareid.com:443 -tls1_3
```

### Cek Nginx
```bash
# Test konfigurasi
docker-compose exec nginx nginx -t

# Reload konfigurasi
docker-compose exec nginx nginx -s reload

# Cek log
docker-compose logs nginx | tail -100

# Cek error log
docker-compose exec nginx cat /var/log/nginx/error.log
```

### Cek Container
```bash
# Status
docker-compose ps

# Resource usage
docker stats

# Inspect
docker inspect iware-nginx
docker inspect iware-certbot
```

---

## Testing Tools

### Online Tools
1. **SSL Labs:** https://www.ssllabs.com/ssltest/analyze.html?d=werehouse.iwareid.com
2. **SSL Checker:** https://www.sslshopper.com/ssl-checker.html
3. **DNS Checker:** https://dnschecker.org
4. **What's My DNS:** https://www.whatsmydns.net

### Command Line Tools
```bash
# Install tools
apt install -y curl openssl dnsutils netcat nmap

# Test SSL
curl -vI https://werehouse.iwareid.com

# Test cipher
nmap --script ssl-enum-ciphers -p 443 werehouse.iwareid.com

# Test certificate chain
openssl s_client -connect werehouse.iwareid.com:443 -showcerts
```

---

## Emergency Recovery

### Jika Semua Gagal

```bash
# 1. Stop semua
docker-compose down

# 2. Backup sertifikat (jika ada)
tar -czf ssl-backup-emergency.tar.gz ./ssl/

# 3. Hapus sertifikat lama
rm -rf ./ssl/*

# 4. Gunakan HTTP-only
cp nginx-http-only.conf nginx.conf

# 5. Start dengan HTTP-only
docker-compose up -d

# 6. Cek HTTP berfungsi
curl -I http://werehouse.iwareid.com

# 7. Dapatkan sertifikat baru
docker-compose run --rm certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email admin@iwareid.com \
    --agree-tos \
    --no-eff-email \
    -d werehouse.iwareid.com \
    -d www.werehouse.iwareid.com

# 8. Kembalikan konfigurasi SSL
cp nginx.conf.backup nginx.conf

# 9. Restart
docker-compose down
docker-compose up -d

# 10. Test HTTPS
curl -I https://werehouse.iwareid.com
```

---

## Prevention Tips

### 1. Monitor Expiry
```bash
# Tambahkan ke crontab untuk monitoring
0 0 * * * /var/www/iware/check-ssl.sh | mail -s "SSL Status" admin@iwareid.com
```

### 2. Backup Regular
```bash
# Backup sertifikat setiap minggu
0 0 * * 0 tar -czf /backup/ssl-$(date +\%Y\%m\%d).tar.gz /var/www/iware/ssl/
```

### 3. Test Renewal
```bash
# Test renewal setiap bulan
docker-compose run --rm certbot renew --dry-run
```

### 4. Monitor Logs
```bash
# Cek log certbot untuk error
docker-compose logs certbot | grep -i error
```

---

## Kontak Support

Jika masih ada masalah setelah troubleshooting:

1. **Cek dokumentasi:**
   - `SSL-SETUP-QUICKSTART.md`
   - `setup-ssl-manual.md`

2. **Cek log:**
   ```bash
   docker-compose logs nginx
   docker-compose logs certbot
   ```

3. **Let's Encrypt Community:**
   - https://community.letsencrypt.org/

4. **Certbot Documentation:**
   - https://certbot.eff.org/docs/

---

**Catatan:** Simpan file ini untuk referensi troubleshooting SSL di masa depan.
