#!/bin/bash

# ============================================
# QUICK FIX untuk Error accurate_tokens di VPS
# ============================================
# Jalankan script ini di VPS untuk fix error
# Table 'accurate_tokens' doesn't exist
# ============================================

echo "=========================================="
echo "QUICK FIX: accurate_tokens Table"
echo "=========================================="
echo ""

# Warna untuk output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Tanya password MySQL
echo -e "${YELLOW}Masukkan password MySQL root:${NC}"
read -s MYSQL_PASSWORD

echo ""
echo -e "${YELLOW}Membuat tabel accurate_tokens...${NC}"

# Jalankan SQL
mysql -u root -p"$MYSQL_PASSWORD" <<EOF
USE iware_warehouse;

-- Drop tabel lama jika ada
DROP TABLE IF EXISTS accurate_tokens;

-- Buat tabel dengan struktur yang benar
CREATE TABLE accurate_tokens (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  token_type VARCHAR(50) DEFAULT 'Bearer',
  expires_in INT DEFAULT 3600,
  expires_at DATETIME NOT NULL,
  scope TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Verifikasi
SELECT 'Tabel accurate_tokens berhasil dibuat!' as Status;
DESCRIBE accurate_tokens;
EOF

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✓ Tabel accurate_tokens berhasil dibuat!${NC}"
    echo ""
    echo -e "${YELLOW}Restart backend...${NC}"
    
    # Cek apakah menggunakan Docker atau PM2
    if command -v docker-compose &> /dev/null; then
        echo "Menggunakan Docker..."
        docker-compose restart backend
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✓ Backend berhasil direstart!${NC}"
        else
            echo -e "${RED}✗ Gagal restart backend dengan Docker${NC}"
            echo "Coba manual: docker-compose restart backend"
        fi
    elif command -v pm2 &> /dev/null; then
        echo "Menggunakan PM2..."
        pm2 restart iware-backend
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✓ Backend berhasil direstart!${NC}"
        else
            echo -e "${RED}✗ Gagal restart backend dengan PM2${NC}"
            echo "Coba manual: pm2 restart iware-backend"
        fi
    else
        echo -e "${YELLOW}Tidak ditemukan Docker atau PM2${NC}"
        echo "Restart backend secara manual"
    fi
    
    echo ""
    echo -e "${GREEN}=========================================="
    echo "FIX SELESAI!"
    echo "==========================================${NC}"
    echo ""
    echo "Langkah selanjutnya:"
    echo "1. Cek log backend: docker-compose logs backend --tail 50"
    echo "   atau: pm2 logs iware-backend --lines 50"
    echo "2. Pastikan tidak ada error 'accurate_tokens' lagi"
    echo "3. Lanjut ke OAuth untuk dapat token"
    echo ""
else
    echo ""
    echo -e "${RED}✗ Gagal membuat tabel!${NC}"
    echo "Coba jalankan SQL manual di MySQL"
    exit 1
fi
