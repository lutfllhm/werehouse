#!/bin/bash

# Script untuk cek status SSL

DOMAIN="werehouse.iwareid.com"
WWW_DOMAIN="www.werehouse.iwareid.com"

echo "=========================================="
echo "Cek Status SSL untuk $DOMAIN"
echo "=========================================="
echo ""

# Warna
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}1. Cek DNS Resolution...${NC}"
echo "Domain: $DOMAIN"
nslookup $DOMAIN | grep -A 2 "Name:"
echo ""
echo "Domain: $WWW_DOMAIN"
nslookup $WWW_DOMAIN | grep -A 2 "Name:"
echo ""

echo -e "${YELLOW}2. Cek HTTP Response...${NC}"
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://$DOMAIN)
echo "HTTP Status: $HTTP_STATUS"
if [ "$HTTP_STATUS" = "301" ] || [ "$HTTP_STATUS" = "200" ]; then
    echo -e "${GREEN}✓ HTTP OK${NC}"
else
    echo -e "${RED}✗ HTTP Error${NC}"
fi
echo ""

echo -e "${YELLOW}3. Cek HTTPS Response...${NC}"
HTTPS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN 2>/dev/null)
echo "HTTPS Status: $HTTPS_STATUS"
if [ "$HTTPS_STATUS" = "200" ]; then
    echo -e "${GREEN}✓ HTTPS OK${NC}"
else
    echo -e "${RED}✗ HTTPS Error${NC}"
fi
echo ""

echo -e "${YELLOW}4. Cek Sertifikat SSL...${NC}"
if [ -d "./ssl/live/$WWW_DOMAIN" ]; then
    echo -e "${GREEN}✓ Sertifikat ditemukan di: ./ssl/live/$WWW_DOMAIN${NC}"
    echo ""
    echo "Files:"
    ls -lh ./ssl/live/$WWW_DOMAIN/
    echo ""
    
    # Cek expiry date
    if [ -f "./ssl/live/$WWW_DOMAIN/cert.pem" ]; then
        echo "Expiry Date:"
        openssl x509 -in ./ssl/live/$WWW_DOMAIN/cert.pem -noout -dates
    fi
else
    echo -e "${RED}✗ Sertifikat tidak ditemukan${NC}"
fi
echo ""

echo -e "${YELLOW}5. Cek Container Status...${NC}"
docker-compose ps
echo ""

echo -e "${YELLOW}6. Cek Nginx Configuration...${NC}"
docker-compose exec nginx nginx -t 2>&1
echo ""

echo -e "${YELLOW}7. Test SSL Connection...${NC}"
echo | openssl s_client -connect $DOMAIN:443 -servername $DOMAIN 2>/dev/null | grep -E "subject=|issuer=|Verify return code"
echo ""

echo "=========================================="
echo "Cek Selesai"
echo "=========================================="
echo ""
echo "Untuk cek detail SSL grade, kunjungi:"
echo "https://www.ssllabs.com/ssltest/analyze.html?d=$DOMAIN"
echo ""
