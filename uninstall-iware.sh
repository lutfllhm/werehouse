#!/bin/bash

# ========================================
# iWare Uninstall Script
# Hapus aplikasi dari VPS
# ========================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

print_header() {
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
}

print_warning() {
    echo -e "${RED}⚠️  $1${NC}"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    print_error "Script ini harus dijalankan sebagai root"
    echo "Gunakan: sudo bash uninstall-iware.sh"
    exit 1
fi

print_header "🗑️  iWare Uninstall Script"

print_warning "PERINGATAN: Script ini akan menghapus:"
echo "  - Aplikasi iWare (/var/www/iware)"
echo "  - Database iware_warehouse"
echo "  - User database iware_user"
echo "  - Konfigurasi Nginx"
echo "  - SSL Certificate"
echo "  - PM2 Process"
echo "  - Logs"
echo ""
print_warning "Data akan di-backup terlebih dahulu!"
echo ""

read -p "Apakah Anda yakin ingin menghapus aplikasi iWare? (ketik 'yes' untuk konfirmasi): " confirm

if [ "$confirm" != "yes" ]; then
    print_info "Dibatalkan."
    exit 0
fi

echo ""
print_header "📦 Memulai Uninstall..."

# 1. Backup Database
print_info "1/8 Backup database..."
backup_dir="/root/iware_backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$backup_dir"

read -p "MySQL user (default: iware_user): " db_user
db_user=${db_user:-iware_user}

if mysqldump -u "$db_user" -p iware_warehouse > "$backup_dir/database.sql" 2>/dev/null; then
    print_success "Database di-backup ke: $backup_dir/database.sql"
else
    print_warning "Gagal backup database (mungkin sudah tidak ada)"
fi

# 2. Backup Files
print_info "2/8 Backup files..."
if [ -d "/var/www/iware" ]; then
    cd /var/www
    tar -czf "$backup_dir/files.tar.gz" iware/ 2>/dev/null || true
    print_success "Files di-backup ke: $backup_dir/files.tar.gz"
else
    print_warning "Folder aplikasi tidak ditemukan"
fi

# 3. Stop PM2 Process
print_info "3/8 Stop PM2 process..."
if pm2 list | grep -q "iware-backend"; then
    pm2 stop iware-backend 2>/dev/null || true
    pm2 delete iware-backend 2>/dev/null || true
    pm2 save --force 2>/dev/null || true
    print_success "PM2 process dihentikan"
else
    print_warning "PM2 process tidak ditemukan"
fi

# 4. Hapus Database
print_info "4/8 Hapus database..."
read -p "MySQL root password: " -s mysql_root_pass
echo ""

mysql -u root -p"$mysql_root_pass" << EOF 2>/dev/null || true
DROP DATABASE IF EXISTS iware_warehouse;
DROP USER IF EXISTS 'iware_user'@'localhost';
FLUSH PRIVILEGES;
EOF

if [ $? -eq 0 ]; then
    print_success "Database dihapus"
else
    print_warning "Gagal hapus database (mungkin sudah tidak ada)"
fi

# 5. Hapus Files
print_info "5/8 Hapus files aplikasi..."
if [ -d "/var/www/iware" ]; then
    rm -rf /var/www/iware
    print_success "Files aplikasi dihapus"
else
    print_warning "Folder aplikasi tidak ditemukan"
fi

# 6. Hapus Nginx Config
print_info "6/8 Hapus konfigurasi Nginx..."
if [ -f "/etc/nginx/sites-enabled/iware" ]; then
    rm -f /etc/nginx/sites-enabled/iware
    print_success "Nginx symbolic link dihapus"
fi

if [ -f "/etc/nginx/sites-available/iware" ]; then
    rm -f /etc/nginx/sites-available/iware
    print_success "Nginx config dihapus"
fi

if nginx -t 2>/dev/null; then
    systemctl reload nginx
    print_success "Nginx reloaded"
else
    print_warning "Nginx config error, skip reload"
fi

# 7. Hapus SSL Certificate
print_info "7/8 Hapus SSL certificate..."
read -p "Domain yang digunakan (contoh: werehouse.iwareid.com): " domain

if [ ! -z "$domain" ]; then
    if certbot certificates 2>/dev/null | grep -q "$domain"; then
        certbot delete --cert-name "$domain" --non-interactive 2>/dev/null || true
        print_success "SSL certificate dihapus"
    else
        print_warning "SSL certificate tidak ditemukan"
    fi
else
    print_warning "Domain tidak diisi, skip hapus SSL"
fi

# 8. Hapus Logs
print_info "8/8 Hapus logs..."
rm -f /var/log/nginx/iware-* 2>/dev/null || true
rm -rf /root/.pm2/logs/iware-* 2>/dev/null || true
print_success "Logs dihapus"

# Summary
print_header "✅ Uninstall Selesai!"

echo "Backup tersimpan di: $backup_dir"
echo "  - Database: $backup_dir/database.sql"
echo "  - Files: $backup_dir/files.tar.gz"
echo ""

print_info "Verifikasi penghapusan:"
echo ""

# Check PM2
if pm2 list | grep -q "iware-backend"; then
    print_error "PM2 process masih ada"
else
    print_success "PM2 process: Bersih"
fi

# Check Nginx
if [ -f "/etc/nginx/sites-enabled/iware" ]; then
    print_error "Nginx config masih ada"
else
    print_success "Nginx config: Bersih"
fi

# Check Folder
if [ -d "/var/www/iware" ]; then
    print_error "Folder aplikasi masih ada"
else
    print_success "Folder aplikasi: Bersih"
fi

# Check Database
if mysql -u root -p"$mysql_root_pass" -e "SHOW DATABASES;" 2>/dev/null | grep -q "iware_warehouse"; then
    print_error "Database masih ada"
else
    print_success "Database: Bersih"
fi

# Check Port
if netstat -tulpn 2>/dev/null | grep -q ":5000"; then
    print_warning "Port 5000 masih digunakan"
else
    print_success "Port 5000: Bersih"
fi

echo ""
print_success "Aplikasi iWare berhasil dihapus dari VPS!"
echo ""
print_info "Jika ingin install ulang, jalankan: bash deploy-vps-hostinger.sh"
echo ""
