#!/bin/bash

# ========================================
# iWare VPS Deployment Script
# Untuk VPS Hostinger
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

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    print_error "Script ini harus dijalankan sebagai root"
    echo "Gunakan: sudo bash deploy-vps-hostinger.sh"
    exit 1
fi

print_header "🚀 iWare VPS Deployment Script"

# Menu
echo "Pilih aksi:"
echo "1) Install Dependencies (Node.js, MySQL, Nginx, PM2)"
echo "2) Setup Aplikasi (Upload & Configure)"
echo "3) Setup Database"
echo "4) Setup Nginx & Domain"
echo "5) Setup SSL (HTTPS)"
echo "6) Start Aplikasi"
echo "7) Full Deployment (Semua langkah)"
echo "8) Update Aplikasi"
echo "9) Backup Database"
echo "0) Exit"
echo ""
read -p "Pilihan [0-9]: " choice

case $choice in
    1)
        print_header "📦 Install Dependencies"
        
        print_info "Update system..."
        apt update && apt upgrade -y
        apt install -y curl wget git nano ufw
        print_success "System updated"
        
        print_info "Setup firewall..."
        ufw allow 22/tcp
        ufw allow 80/tcp
        ufw allow 443/tcp
        ufw --force enable
        print_success "Firewall configured"
        
        print_info "Install Node.js 18.x..."
        curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
        apt install -y nodejs
        node --version
        npm --version
        print_success "Node.js installed"
        
        print_info "Install MySQL..."
        apt install -y mysql-server
        print_success "MySQL installed"
        print_info "Jalankan: mysql_secure_installation"
        
        print_info "Install PM2..."
        npm install -g pm2
        pm2 startup systemd
        print_success "PM2 installed"
        
        print_info "Install Nginx..."
        apt install -y nginx
        systemctl start nginx
        systemctl enable nginx
        print_success "Nginx installed"
        
        print_info "Install Certbot..."
        apt install -y certbot python3-certbot-nginx
        print_success "Certbot installed"
        
        print_success "Semua dependencies berhasil diinstall!"
        ;;
        
    2)
        print_header "📁 Setup Aplikasi"
        
        read -p "Git repository URL: " repo_url
        read -p "Domain (contoh: werehouse.iwareid.com): " domain
        read -p "Accurate Access Token: " accurate_token
        read -p "Accurate Database ID: " accurate_db_id
        read -p "MySQL Database Password: " db_password
        
        print_info "Clone repository..."
        mkdir -p /var/www/iware
        cd /var/www/iware
        git clone "$repo_url" .
        print_success "Repository cloned"
        
        print_info "Setup backend..."
        cd backend
        npm install --production
        
        # Create .env
        cat > .env << EOF
PORT=5000
NODE_ENV=production

DB_HOST=localhost
DB_USER=iware_user
DB_PASSWORD=$db_password
DB_NAME=iware_warehouse

JWT_SECRET=$(openssl rand -base64 32)
JWT_EXPIRE=7d

ACCURATE_API_URL=https://public-api.accurate.id/api
ACCURATE_ACCESS_TOKEN=$accurate_token
ACCURATE_DATABASE_ID=$accurate_db_id

CORS_ORIGIN=https://$domain
EOF
        print_success "Backend configured"
        
        print_info "Setup frontend..."
        cd ../frontend
        npm install
        npm run build
        print_success "Frontend built"
        
        print_success "Aplikasi berhasil di-setup!"
        ;;
        
    3)
        print_header "🗄️ Setup Database"
        
        read -p "MySQL root password: " mysql_root_pass
        read -p "Database password untuk iware_user: " db_password
        
        print_info "Buat database dan user..."
        mysql -u root -p"$mysql_root_pass" << EOF
CREATE DATABASE IF NOT EXISTS iware_warehouse CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'iware_user'@'localhost' IDENTIFIED BY '$db_password';
GRANT ALL PRIVILEGES ON iware_warehouse.* TO 'iware_user'@'localhost';
FLUSH PRIVILEGES;
EOF
        print_success "Database created"
        
        print_info "Import schema..."
        mysql -u iware_user -p"$db_password" iware_warehouse < /var/www/iware/backend/SETUP_LENGKAP.sql
        print_success "Schema imported"
        
        print_success "Database berhasil di-setup!"
        ;;
        
    4)
        print_header "🌐 Setup Nginx & Domain"
        
        read -p "Domain (contoh: werehouse.iwareid.com): " domain
        
        print_info "Buat Nginx config..."
        cat > /etc/nginx/sites-available/iware << EOF
server {
    listen 80;
    listen [::]:80;
    server_name $domain;

    root /var/www/iware/frontend/dist;
    index index.html;

    access_log /var/log/nginx/iware-access.log;
    error_log /var/log/nginx/iware-error.log;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;
}
EOF
        
        ln -sf /etc/nginx/sites-available/iware /etc/nginx/sites-enabled/
        rm -f /etc/nginx/sites-enabled/default
        
        nginx -t
        systemctl reload nginx
        
        print_success "Nginx configured"
        print_info "Pastikan DNS A Record sudah pointing ke IP VPS ini!"
        ;;
        
    5)
        print_header "🔒 Setup SSL (HTTPS)"
        
        read -p "Domain: " domain
        read -p "Email untuk SSL: " email
        
        print_info "Generate SSL certificate..."
        certbot --nginx -d "$domain" --non-interactive --agree-tos --email "$email" --redirect
        
        print_success "SSL certificate installed"
        print_info "Auto-renewal sudah aktif"
        ;;
        
    6)
        print_header "▶️ Start Aplikasi"
        
        print_info "Start backend dengan PM2..."
        cd /var/www/iware/backend
        pm2 start ecosystem.config.js
        pm2 save
        
        print_success "Backend started"
        
        print_info "Status:"
        pm2 status
        
        print_success "Aplikasi berhasil dijalankan!"
        ;;
        
    7)
        print_header "🚀 Full Deployment"
        
        print_info "Ini akan menjalankan semua langkah deployment"
        read -p "Lanjutkan? (yes/no): " confirm
        
        if [ "$confirm" != "yes" ]; then
            print_info "Dibatalkan"
            exit 0
        fi
        
        # Jalankan semua langkah
        bash "$0" 1
        bash "$0" 2
        bash "$0" 3
        bash "$0" 4
        bash "$0" 5
        bash "$0" 6
        
        print_success "Full deployment selesai!"
        ;;
        
    8)
        print_header "🔄 Update Aplikasi"
        
        print_info "Pull latest code..."
        cd /var/www/iware
        git pull origin main
        
        print_info "Update backend..."
        cd backend
        npm install --production
        pm2 restart iware-backend
        
        print_info "Update frontend..."
        cd ../frontend
        npm install
        npm run build
        
        systemctl reload nginx
        
        print_success "Aplikasi berhasil diupdate!"
        ;;
        
    9)
        print_header "💾 Backup Database"
        
        backup_file="/root/iware_backup_$(date +%Y%m%d_%H%M%S).sql"
        
        read -p "MySQL user (default: iware_user): " db_user
        db_user=${db_user:-iware_user}
        
        print_info "Backup database..."
        mysqldump -u "$db_user" -p iware_warehouse > "$backup_file"
        
        print_success "Database di-backup ke: $backup_file"
        ;;
        
    0)
        print_info "Exit"
        exit 0
        ;;
        
    *)
        print_error "Pilihan tidak valid!"
        exit 1
        ;;
esac

echo ""
print_success "Selesai!"
