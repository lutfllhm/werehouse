#!/bin/bash

# Script untuk manual renewal sertifikat SSL

echo "=========================================="
echo "Manual SSL Certificate Renewal"
echo "=========================================="
echo ""

# Warna
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}1. Test renewal (dry-run)...${NC}"
docker-compose run --rm certbot renew --dry-run

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Dry-run berhasil${NC}"
    echo ""
    read -p "Lanjutkan dengan renewal sebenarnya? (y/n): " confirm
    
    if [ "$confirm" = "y" ]; then
        echo ""
        echo -e "${YELLOW}2. Melakukan renewal...${NC}"
        docker-compose run --rm certbot renew
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✓ Renewal berhasil${NC}"
            echo ""
            echo -e "${YELLOW}3. Restart nginx...${NC}"
            docker-compose restart nginx
            echo -e "${GREEN}✓ Nginx restarted${NC}"
            echo ""
            echo "=========================================="
            echo -e "${GREEN}SSL Certificate berhasil diperbaharui!${NC}"
            echo "=========================================="
        else
            echo -e "${RED}✗ Renewal gagal${NC}"
            echo "Cek log: docker-compose logs certbot"
        fi
    else
        echo "Renewal dibatalkan"
    fi
else
    echo -e "${RED}✗ Dry-run gagal${NC}"
    echo "Cek log: docker-compose logs certbot"
fi
echo ""
