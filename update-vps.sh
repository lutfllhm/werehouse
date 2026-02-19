#!/bin/bash

# Script untuk update aplikasi di VPS
# Cara pakai: bash update-vps.sh

echo "=========================================="
echo "  Update Aplikasi Werehouse di VPS"
echo "=========================================="
echo ""

# Warna untuk output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Fungsi untuk print dengan warna
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# 1. Cek apakah di direktori yang benar
if [ ! -f "docker-compose.yml" ]; then
    print_error "File docker-compose.yml tidak ditemukan!"
    print_warning "Pastikan Anda berada di direktori aplikasi yang benar"
    exit 1
fi

print_success "Direktori aplikasi ditemukan"

# 2. Backup file .env jika ada
if [ -f "backend/.env" ]; then
    print_warning "Backup file .env..."
    cp backend/.env backend/.env.backup.$(date +%Y%m%d_%H%M%S)
    print_success "File .env di-backup"
fi

# 3. Pull perubahan dari GitHub
echo ""
echo "Pulling perubahan dari GitHub..."
git fetch origin

# Cek apakah ada perubahan
LOCAL=$(git rev-parse @)
REMOTE=$(git rev-parse @{u})

if [ $LOCAL = $REMOTE ]; then
    print_warning "Tidak ada perubahan baru dari GitHub"
    read -p "Lanjutkan restart aplikasi? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 0
    fi
else
    print_success "Ada perubahan baru, melakukan pull..."
    git pull origin main
    
    if [ $? -eq 0 ]; then
        print_success "Pull berhasil"
    else
        print_error "Pull gagal! Cek conflict atau error"
        exit 1
    fi
fi

# 4. Tanya user apakah ingin rebuild atau restart saja
echo ""
echo "Pilih mode update:"
echo "1) Restart saja (cepat, untuk perubahan kode saja)"
echo "2) Rebuild & Restart (untuk perubahan dependency)"
echo "3) Full Clean Restart (hapus semua dan build ulang)"
read -p "Pilihan (1/2/3): " choice

case $choice in
    1)
        echo ""
        print_warning "Restarting containers..."
        docker-compose restart
        ;;
    2)
        echo ""
        print_warning "Rebuilding dan restarting containers..."
        docker-compose down
        docker-compose up -d --build
        ;;
    3)
        echo ""
        print_warning "Full clean restart..."
        docker-compose down
        docker system prune -f
        docker-compose up -d --build
        ;;
    *)
        print_error "Pilihan tidak valid"
        exit 1
        ;;
esac

# 5. Tunggu containers ready
echo ""
print_warning "Menunggu containers ready..."
sleep 10

# 6. Cek status containers
echo ""
echo "Status Containers:"
docker-compose ps

# 7. Cek logs untuk error
echo ""
echo "Checking logs untuk error..."
ERROR_COUNT=$(docker-compose logs --tail=50 | grep -i "error" | wc -l)

if [ $ERROR_COUNT -gt 0 ]; then
    print_warning "Ditemukan $ERROR_COUNT baris error di logs"
    echo "Lihat detail dengan: docker-compose logs -f"
else
    print_success "Tidak ada error di logs"
fi

# 8. Test endpoint
echo ""
echo "Testing endpoints..."

# Test backend
if curl -s -o /dev/null -w "%{http_code}" http://localhost:5000 | grep -q "200\|404"; then
    print_success "Backend responding"
else
    print_error "Backend tidak responding"
fi

# Test frontend
if curl -s -o /dev/null -w "%{http_code}" http://localhost:80 | grep -q "200\|404"; then
    print_success "Frontend responding"
else
    print_error "Frontend tidak responding"
fi

echo ""
echo "=========================================="
print_success "Update selesai!"
echo "=========================================="
echo ""
echo "Untuk monitoring:"
echo "  - Lihat logs: docker-compose logs -f"
echo "  - Lihat status: docker-compose ps"
echo "  - Lihat resource: docker stats"
echo ""
