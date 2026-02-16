#!/bin/bash

# Docker Deployment Script untuk iWare
# Mempermudah deployment dengan Docker

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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
    echo "=================================="
    echo "$1"
    echo "=================================="
    echo ""
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker tidak terinstall!"
        echo "Install Docker: https://docs.docker.com/get-docker/"
        exit 1
    fi
    
    if ! command -v docker compose &> /dev/null; then
        print_error "Docker Compose tidak terinstall!"
        exit 1
    fi
    
    print_success "Docker dan Docker Compose terinstall"
}

# Check if .env exists
check_env() {
    if [ ! -f .env ]; then
        print_info ".env tidak ditemukan, membuat dari template..."
        cp .env.docker .env
        print_success ".env dibuat dari template"
        print_info "PENTING: Edit .env dan sesuaikan konfigurasi!"
        read -p "Tekan Enter setelah edit .env..."
    else
        print_success ".env sudah ada"
    fi
}

# Build images
build_images() {
    print_info "Building Docker images..."
    docker compose build
    print_success "Images berhasil di-build"
}

# Start services
start_services() {
    print_info "Starting services..."
    docker compose up -d
    print_success "Services berhasil distart"
}

# Stop services
stop_services() {
    print_info "Stopping services..."
    docker compose down
    print_success "Services berhasil distop"
}

# Show status
show_status() {
    print_info "Status containers:"
    docker compose ps
}

# Show logs
show_logs() {
    if [ -z "$1" ]; then
        docker compose logs -f
    else
        docker compose logs -f "$1"
    fi
}

# Restart service
restart_service() {
    if [ -z "$1" ]; then
        print_error "Nama service harus diisi!"
        exit 1
    fi
    
    print_info "Restarting $1..."
    docker compose restart "$1"
    print_success "$1 berhasil direstart"
}

# Backup database
backup_database() {
    BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"
    print_info "Backing up database ke $BACKUP_FILE..."
    docker compose exec -T mysql mysqldump -u root -p"${MYSQL_ROOT_PASSWORD}" iware_warehouse > "$BACKUP_FILE"
    print_success "Database berhasil di-backup ke $BACKUP_FILE"
}

# Main menu
print_header "🐳 iWare Docker Deployment"

check_docker

echo "Pilih aksi:"
echo "1) Setup & Start (pertama kali)"
echo "2) Start services"
echo "3) Stop services"
echo "4) Restart service"
echo "5) Show status"
echo "6) Show logs"
echo "7) Rebuild images"
echo "8) Backup database"
echo "9) Update aplikasi"
echo "0) Exit"
echo ""
read -p "Pilihan [0-9]: " choice

case $choice in
    1)
        print_header "Setup & Start"
        check_env
        build_images
        start_services
        echo ""
        show_status
        echo ""
        print_success "Setup selesai!"
        print_info "Akses aplikasi: http://localhost"
        print_info "Login: superadmin@iware.id / jasad666"
        ;;
    2)
        print_header "Start Services"
        start_services
        show_status
        ;;
    3)
        print_header "Stop Services"
        stop_services
        ;;
    4)
        print_header "Restart Service"
        echo "Service yang tersedia: backend, frontend, mysql"
        read -p "Nama service: " service
        restart_service "$service"
        ;;
    5)
        print_header "Status"
        show_status
        ;;
    6)
        print_header "Logs"
        echo "Tekan Ctrl+C untuk keluar"
        read -p "Service (kosongkan untuk semua): " service
        show_logs "$service"
        ;;
    7)
        print_header "Rebuild Images"
        build_images
        start_services
        print_success "Images berhasil di-rebuild dan services direstart"
        ;;
    8)
        print_header "Backup Database"
        backup_database
        ;;
    9)
        print_header "Update Aplikasi"
        print_info "Pulling latest code..."
        git pull
        print_info "Rebuilding images..."
        build_images
        print_info "Restarting services..."
        docker compose up -d
        print_success "Aplikasi berhasil diupdate"
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
