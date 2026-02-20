#!/bin/bash

# Script untuk setup SSL dengan Let's Encrypt untuk werehouse.iwareid.com
# Pastikan domain sudah mengarah ke IP server ini

set -e

echo "=========================================="
echo "Setup SSL untuk werehouse.iwareid.com"
echo "=========================================="
echo ""

# Warna untuk output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Domain
DOMAIN="werehouse.iwareid.com"
WWW_DOMAIN="www.werehouse.iwareid.com"
EMAIL="admin@iwareid.com"  # Ganti dengan email Anda

echo -e "${YELLOW}Langkah 1: Cek DNS domain...${NC}"
echo "Pastikan domain $DOMAIN dan $WWW_DOMAIN sudah mengarah ke IP server ini"
echo ""
read -p "Apakah DNS sudah dikonfigurasi? (y/n): " dns_ready

if [ "$dns_ready" != "y" ]; then
    echo -e "${RED}Silakan konfigurasi DNS terlebih dahulu!${NC}"
    echo "Tambahkan A Record:"
    echo "  @ -> IP Server Anda"
    echo "  www -> IP Server Anda"
    exit 1
fi

echo ""
echo -e "${YELLOW}Langkah 2: Backup konfigurasi nginx saat ini...${NC}"
if [ -f "nginx.conf.backup" ]; then
    echo "Backup sudah ada, skip..."
else
    cp nginx.conf nginx.conf.backup
    echo -e "${GREEN}✓ Backup dibuat: nginx.conf.backup${NC}"
fi

echo ""
echo -e "${YELLOW}Langkah 3: Gunakan konfigurasi HTTP-only untuk mendapatkan sertifikat...${NC}"
cp nginx-http-only.conf nginx.conf
echo -e "${GREEN}✓ Menggunakan nginx-http-only.conf${NC}"

echo ""
echo -e "${YELLOW}Langkah 4: Restart nginx dengan konfigurasi HTTP-only...${NC}"
docker-compose restart nginx
sleep 3
echo -e "${GREEN}✓ Nginx restarted${NC}"

echo ""
echo -e "${YELLOW}Langkah 5: Buat direktori untuk certbot...${NC}"
mkdir -p ./ssl
chmod 755 ./ssl
echo -e "${GREEN}✓ Direktori ssl dibuat${NC}"

echo ""
echo -e "${YELLOW}Langkah 6: Dapatkan sertifikat SSL dari Let's Encrypt...${NC}"
echo "Domain: $DOMAIN, $WWW_DOMAIN"
echo "Email: $EMAIL"
echo ""

# Jalankan certbot untuk mendapatkan sertifikat
docker-compose run --rm certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    -d $DOMAIN \
    -d $WWW_DOMAIN

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Sertifikat SSL berhasil didapatkan!${NC}"
else
    echo -e "${RED}✗ Gagal mendapatkan sertifikat SSL${NC}"
    echo "Kembalikan konfigurasi nginx..."
    cp nginx.conf.backup nginx.conf
    docker-compose restart nginx
    exit 1
fi

echo ""
echo -e "${YELLOW}Langkah 7: Kembalikan konfigurasi nginx dengan SSL...${NC}"
cp nginx.conf.backup nginx.conf
echo -e "${GREEN}✓ Konfigurasi nginx dengan SSL dikembalikan${NC}"

echo ""
echo -e "${YELLOW}Langkah 8: Update docker-compose untuk menggunakan sertifikat dari ./ssl...${NC}"
# Update volume mapping di docker-compose.yml
sed -i.bak 's|/etc/letsencrypt:/etc/letsencrypt:ro|./ssl:/etc/letsencrypt:ro|g' docker-compose.yml
echo -e "${GREEN}✓ docker-compose.yml updated${NC}"

echo ""
echo -e "${YELLOW}Langkah 9: Restart semua container...${NC}"
docker-compose down
docker-compose up -d
sleep 5
echo -e "${GREEN}✓ Semua container restarted${NC}"

echo ""
echo -e "${YELLOW}Langkah 10: Cek status SSL...${NC}"
sleep 3
curl -I https://$DOMAIN 2>&1 | head -n 1

echo ""
echo "=========================================="
echo -e "${GREEN}Setup SSL Selesai!${NC}"
echo "=========================================="
echo ""
echo "Sertifikat SSL tersimpan di: ./ssl/live/$WWW_DOMAIN/"
echo ""
echo "Akses aplikasi Anda di:"
echo "  https://$DOMAIN"
echo "  https://$WWW_DOMAIN"
echo ""
echo "Sertifikat akan diperpanjang otomatis setiap 12 jam oleh container certbot."
echo ""
echo -e "${YELLOW}Catatan:${NC}"
echo "- Sertifikat valid selama 90 hari"
echo "- Auto-renewal sudah dikonfigurasi"
echo "- Backup konfigurasi: nginx.conf.backup"
echo ""
