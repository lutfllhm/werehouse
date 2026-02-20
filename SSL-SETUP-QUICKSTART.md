# Quick Start: Setup SSL untuk werehouse.iwareid.com

## Persiapan (PENTING!)

### 1. Konfigurasi DNS
Pastikan domain sudah mengarah ke IP server Anda:

**Di DNS Provider (Cloudflare/Namecheap/dll):**
```
Type: A Record
Name: @               Value: [IP_SERVER_ANDA]
Name: www             Value: [IP_SERVER_ANDA]
```

**Cek DNS sudah propagasi:**
```bash
nslookup werehouse.iwareid.com
nslookup www.werehouse.iwareid.com
```

### 2. Buka Port di Firewall
```bash
# Jika menggunakan UFW
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw status

# Jika menggunakan firewalld
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

### 3. Pastikan Docker Running
```bash
docker-compose ps
```

## Setup SSL (Pilih Salah Satu)

### Opsi A: Otomatis dengan Script (RECOMMENDED) ⚡

```bash
# 1. Berikan permission
chmod +x setup-ssl.sh

# 2. Edit email (opsional)
nano setup-ssl.sh
# Ubah baris: EMAIL="admin@iwareid.com"

# 3. Jalankan
./setup-ssl.sh
```

**Selesai!** Script akan otomatis:
- Backup konfigurasi
- Mendapatkan sertifikat SSL
- Mengkonfigurasi nginx
- Restart container

### Opsi B: Manual (Step by Step) 🔧

#### Step 1: Backup & Gunakan HTTP-only
```bash
cp nginx.conf nginx.conf.backup
cp nginx-http-only.conf nginx.conf
docker-compose restart nginx
```

#### Step 2: Buat direktori SSL
```bash
mkdir -p ./ssl
chmod 755 ./ssl
```

#### Step 3: Dapatkan Sertifikat
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

**Ganti `admin@iwareid.com` dengan email Anda!**

#### Step 4: Kembalikan Konfigurasi SSL
```bash
cp nginx.conf.backup nginx.conf
docker-compose down
docker-compose up -d
```

#### Step 5: Verifikasi
```bash
curl -I https://werehouse.iwareid.com
```

## Cek Status SSL

```bash
# Berikan permission
chmod +x check-ssl.sh

# Jalankan
./check-ssl.sh
```

Atau manual:
```bash
# Cek HTTPS
curl -I https://werehouse.iwareid.com

# Cek sertifikat
ls -la ./ssl/live/www.werehouse.iwareid.com/

# Cek expiry
openssl x509 -in ./ssl/live/www.werehouse.iwareid.com/cert.pem -noout -dates
```

## Troubleshooting Cepat

### ❌ Error: "Challenge failed"
**Penyebab:** DNS belum mengarah atau port 80 tertutup

**Solusi:**
```bash
# Cek DNS
nslookup werehouse.iwareid.com

# Cek port 80 terbuka
curl http://werehouse.iwareid.com

# Cek firewall
sudo ufw status
```

### ❌ Error: "Certificate not found"
**Penyebab:** Certbot gagal membuat sertifikat

**Solusi:**
```bash
# Cek log
docker-compose logs certbot

# Coba lagi
docker-compose run --rm certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email admin@iwareid.com \
    --agree-tos \
    --no-eff-email \
    -d werehouse.iwareid.com \
    -d www.werehouse.iwareid.com
```

### ❌ Nginx tidak bisa start
**Solusi:**
```bash
# Gunakan HTTP-only dulu
cp nginx-http-only.conf nginx.conf
docker-compose restart nginx

# Cek log
docker-compose logs nginx
```

### ❌ "Too many requests" dari Let's Encrypt
**Penyebab:** Terlalu banyak percobaan (limit: 5x/jam)

**Solusi:**
- Tunggu 1 jam
- Atau gunakan staging untuk testing:
```bash
docker-compose run --rm certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email admin@iwareid.com \
    --agree-tos \
    --no-eff-email \
    --staging \
    -d werehouse.iwareid.com \
    -d www.werehouse.iwareid.com
```

## Pembaruan Sertifikat

Sertifikat otomatis diperbaharui setiap 12 jam oleh container certbot.

### Manual Renewal (jika diperlukan)
```bash
# Berikan permission
chmod +x renew-ssl.sh

# Jalankan
./renew-ssl.sh
```

Atau manual:
```bash
# Test renewal
docker-compose run --rm certbot renew --dry-run

# Actual renewal
docker-compose run --rm certbot renew
docker-compose restart nginx
```

## Verifikasi SSL Grade

### Online Tools
1. **SSL Labs:** https://www.ssllabs.com/ssltest/analyze.html?d=werehouse.iwareid.com
2. **SSL Checker:** https://www.sslshopper.com/ssl-checker.html

### Command Line
```bash
# Cek detail sertifikat
openssl s_client -connect werehouse.iwareid.com:443 -servername werehouse.iwareid.com

# Cek cipher yang digunakan
nmap --script ssl-enum-ciphers -p 443 werehouse.iwareid.com
```

## Maintenance

### Backup Sertifikat
```bash
tar -czf ssl-backup-$(date +%Y%m%d).tar.gz ./ssl/
```

### Restore Sertifikat
```bash
tar -xzf ssl-backup-YYYYMMDD.tar.gz
docker-compose restart nginx
```

### Cek Log
```bash
# Log nginx
docker-compose logs nginx

# Log certbot
docker-compose logs certbot

# Follow log real-time
docker-compose logs -f nginx
```

## Checklist Setelah Setup ✅

- [ ] HTTPS berfungsi: https://werehouse.iwareid.com
- [ ] HTTP redirect ke HTTPS
- [ ] www redirect berfungsi
- [ ] Sertifikat valid (cek di browser)
- [ ] SSL Labs grade A/A+
- [ ] Auto-renewal berjalan (cek log certbot)

## File-file Penting

```
.
├── nginx.conf                    # Konfigurasi nginx dengan SSL
├── nginx-http-only.conf          # Konfigurasi nginx tanpa SSL (untuk setup)
├── docker-compose.yml            # Docker compose config
├── setup-ssl.sh                  # Script setup otomatis
├── check-ssl.sh                  # Script cek status SSL
├── renew-ssl.sh                  # Script manual renewal
├── SSL-SETUP-QUICKSTART.md       # File ini
├── setup-ssl-manual.md           # Panduan lengkap manual
└── ssl/                          # Direktori sertifikat SSL
    └── live/
        └── www.werehouse.iwareid.com/
            ├── fullchain.pem     # Sertifikat lengkap
            ├── privkey.pem       # Private key
            ├── cert.pem          # Sertifikat
            └── chain.pem         # Chain sertifikat
```

## Kontak Support

Jika masih ada masalah:
1. Cek file `setup-ssl-manual.md` untuk troubleshooting lengkap
2. Cek log: `docker-compose logs nginx` dan `docker-compose logs certbot`
3. Dokumentasi Let's Encrypt: https://letsencrypt.org/docs/

---

**Tips:**
- Sertifikat valid 90 hari, auto-renewal sudah dikonfigurasi
- Backup sertifikat secara berkala
- Monitor expiry date: `./check-ssl.sh`
- Jangan expose private key ke publik
