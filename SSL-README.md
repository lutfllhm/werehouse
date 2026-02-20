# 🔒 SSL Setup untuk werehouse.iwareid.com

Dokumentasi lengkap untuk setup dan maintenance SSL/HTTPS menggunakan Let's Encrypt.

---

## 📚 Dokumentasi

### Quick Start (Mulai di sini!)
📄 **SSL-SETUP-QUICKSTART.md** - Panduan cepat setup SSL (5-10 menit)

### Panduan Lengkap
📄 **setup-ssl-manual.md** - Panduan detail step-by-step dengan troubleshooting

### Troubleshooting
📄 **SSL-TROUBLESHOOTING.md** - Solusi untuk masalah umum SSL

---

## 🛠️ Scripts

### Setup SSL (Otomatis)
```bash
chmod +x setup-ssl.sh
./setup-ssl.sh
```
Script otomatis untuk mendapatkan dan mengkonfigurasi sertifikat SSL.

### Cek Status SSL
```bash
chmod +x check-ssl.sh
./check-ssl.sh
```
Cek status DNS, sertifikat, dan konfigurasi SSL.

### Manual Renewal
```bash
chmod +x renew-ssl.sh
./renew-ssl.sh
```
Perpanjang sertifikat SSL secara manual (biasanya tidak diperlukan karena auto-renewal).

---

## ⚡ Quick Commands

### Setup SSL
```bash
# Otomatis (recommended)
./setup-ssl.sh

# Manual
docker-compose run --rm certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email admin@iwareid.com \
    --agree-tos \
    --no-eff-email \
    -d werehouse.iwareid.com \
    -d www.werehouse.iwareid.com
```

### Cek Status
```bash
# Cek HTTPS
curl -I https://werehouse.iwareid.com

# Cek sertifikat
openssl x509 -in ./ssl/live/www.werehouse.iwareid.com/cert.pem -noout -dates

# Cek semua
./check-ssl.sh
```

### Renewal
```bash
# Test renewal
docker-compose run --rm certbot renew --dry-run

# Actual renewal
docker-compose run --rm certbot renew
docker-compose restart nginx
```

### Troubleshooting
```bash
# Cek log
docker-compose logs nginx
docker-compose logs certbot

# Restart
docker-compose restart nginx

# Emergency: gunakan HTTP-only
cp nginx-http-only.conf nginx.conf
docker-compose restart nginx
```

---

## 📋 Checklist Setup

### Persiapan
- [ ] Domain werehouse.iwareid.com mengarah ke IP server
- [ ] Domain www.werehouse.iwareid.com mengarah ke IP server
- [ ] Port 80 dan 443 terbuka di firewall
- [ ] Docker dan Docker Compose terinstall
- [ ] Aplikasi berjalan dengan HTTP

### Setup SSL
- [ ] Jalankan `./setup-ssl.sh` atau setup manual
- [ ] Sertifikat berhasil didapatkan
- [ ] Nginx dikonfigurasi dengan SSL
- [ ] Container di-restart

### Verifikasi
- [ ] HTTPS berfungsi: https://werehouse.iwareid.com
- [ ] HTTP redirect ke HTTPS
- [ ] www redirect berfungsi
- [ ] Sertifikat valid (cek di browser)
- [ ] SSL Labs grade A/A+
- [ ] Auto-renewal berjalan

---

## 🔍 Verifikasi SSL

### Browser
1. Buka https://werehouse.iwareid.com
2. Klik icon gembok di address bar
3. Cek detail sertifikat

### SSL Labs (Recommended)
https://www.ssllabs.com/ssltest/analyze.html?d=werehouse.iwareid.com

Target: Grade A atau A+

### Command Line
```bash
# Quick check
curl -I https://werehouse.iwareid.com

# Detail check
openssl s_client -connect werehouse.iwareid.com:443 -servername werehouse.iwareid.com
```

---

## 🔄 Auto-Renewal

Sertifikat Let's Encrypt valid selama 90 hari. Container certbot sudah dikonfigurasi untuk auto-renewal setiap 12 jam.

### Cek Auto-Renewal
```bash
# Cek log
docker-compose logs certbot | grep -i renew

# Test renewal
docker-compose run --rm certbot renew --dry-run
```

### Manual Renewal (jika diperlukan)
```bash
./renew-ssl.sh
```

---

## 📁 Struktur File

```
.
├── nginx.conf                    # Konfigurasi nginx dengan SSL
├── nginx-http-only.conf          # Konfigurasi nginx tanpa SSL
├── docker-compose.yml            # Docker compose dengan certbot
│
├── setup-ssl.sh                  # Script setup otomatis ⭐
├── check-ssl.sh                  # Script cek status
├── renew-ssl.sh                  # Script manual renewal
│
├── SSL-README.md                 # File ini
├── SSL-SETUP-QUICKSTART.md       # Quick start guide ⭐
├── setup-ssl-manual.md           # Panduan lengkap
├── SSL-TROUBLESHOOTING.md        # Troubleshooting guide
│
└── ssl/                          # Direktori sertifikat (auto-generated)
    ├── accounts/
    ├── archive/
    ├── live/
    │   └── www.werehouse.iwareid.com/
    │       ├── fullchain.pem     # Sertifikat lengkap
    │       ├── privkey.pem       # Private key
    │       ├── cert.pem          # Sertifikat
    │       └── chain.pem         # Chain sertifikat
    └── renewal/
```

---

## 🚨 Troubleshooting Cepat

### Challenge Failed
```bash
# Cek DNS
nslookup werehouse.iwareid.com

# Cek port 80
curl http://werehouse.iwareid.com

# Cek firewall
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

### Certificate Not Found
```bash
# Gunakan HTTP-only dulu
cp nginx-http-only.conf nginx.conf
docker-compose restart nginx

# Dapatkan sertifikat
./setup-ssl.sh
```

### 502 Bad Gateway
```bash
# Restart backend
docker-compose restart backend
sleep 10

# Test
curl -I https://werehouse.iwareid.com
```

### Nginx Won't Start
```bash
# Cek log
docker-compose logs nginx

# Test config
docker-compose exec nginx nginx -t

# Gunakan HTTP-only
cp nginx-http-only.conf nginx.conf
docker-compose restart nginx
```

**Untuk troubleshooting lengkap, lihat:** `SSL-TROUBLESHOOTING.md`

---

## 💾 Backup & Restore

### Backup Sertifikat
```bash
tar -czf ssl-backup-$(date +%Y%m%d).tar.gz ./ssl/
```

### Restore Sertifikat
```bash
tar -xzf ssl-backup-YYYYMMDD.tar.gz
docker-compose restart nginx
```

---

## 📊 Monitoring

### Cek Expiry Date
```bash
openssl x509 -in ./ssl/live/www.werehouse.iwareid.com/cert.pem -noout -dates
```

### Cek Auto-Renewal Log
```bash
docker-compose logs certbot | tail -50
```

### Cek SSL Grade
https://www.ssllabs.com/ssltest/analyze.html?d=werehouse.iwareid.com

---

## 🎯 Best Practices

1. **Monitor expiry date** - Cek setiap bulan
2. **Backup sertifikat** - Backup setiap minggu
3. **Test renewal** - Test setiap bulan dengan `--dry-run`
4. **Monitor logs** - Cek log certbot untuk error
5. **Keep updated** - Update nginx dan certbot secara berkala

---

## 📞 Support & Resources

### Dokumentasi
- Let's Encrypt: https://letsencrypt.org/docs/
- Certbot: https://certbot.eff.org/docs/
- Nginx SSL: https://nginx.org/en/docs/http/configuring_https_servers.html

### Community
- Let's Encrypt Community: https://community.letsencrypt.org/
- Nginx Forum: https://forum.nginx.org/

### Tools
- SSL Labs: https://www.ssllabs.com/ssltest/
- DNS Checker: https://dnschecker.org/
- SSL Checker: https://www.sslshopper.com/ssl-checker.html

---

## ⚠️ Catatan Penting

1. **Sertifikat gratis** - Let's Encrypt 100% gratis
2. **Valid 90 hari** - Auto-renewal sudah dikonfigurasi
3. **Rate limits** - 5 percobaan gagal per jam per domain
4. **Backup penting** - Backup sertifikat secara berkala
5. **Private key** - Jangan expose privkey.pem ke publik

---

## 🎓 Mulai Setup

**Baru pertama kali?** Mulai di sini:
👉 **SSL-SETUP-QUICKSTART.md**

**Butuh detail lengkap?** Baca ini:
👉 **setup-ssl-manual.md**

**Ada masalah?** Cek ini:
👉 **SSL-TROUBLESHOOTING.md**

---

**Happy Secure Browsing! 🔒✨**
