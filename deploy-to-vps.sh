#!/bin/bash

# Script Deployment Otomatis ke VPS Hostinger
# Usage: ./deploy-to-vps.sh

set -e

echo "=========================================="
echo "  iWare Warehouse - VPS Deployment"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${YELLOW}ℹ${NC} $1"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    print_error "Please run as root (use: sudo ./deploy-to-vps.sh)"
    exit 1
fi

print_info "Starting deployment process..."
echo ""

# Step 1: Update system
print_info "Step 1: Updating system..."
apt update && apt upgrade -y
print_success "System updated"
echo ""

# Step 2: Install Docker
print_info "Step 2: Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
    print_success "Docker installed"
else
    print_success "Docker already installed"
fi
echo ""

# Step 3: Install Docker Compose
print_info "Step 3: Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    apt install docker-compose -y
    print_success "Docker Compose installed"
else
    print_success "Docker Compose already installed"
fi
echo ""

# Step 4: Install utilities
print_info "Step 4: Installing utilities..."
apt install git curl wget nano htop ufw certbot -y
print_success "Utilities installed"
echo ""

# Step 5: Setup firewall
print_info "Step 5: Setting up firewall..."
ufw --force enable
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
print_success "Firewall configured"
echo ""

# Step 6: Create project directory
print_info "Step 6: Creating project directory..."
mkdir -p /var/www/iware
cd /var/www/iware
print_success "Project directory created"
echo ""

# Step 7: Check if project files exist
if [ ! -f "docker-compose.yml" ]; then
    print_error "docker-compose.yml not found!"
    print_info "Please upload your project files to /var/www/iware"
    print_info "You can use: scp -r /path/to/werehouse/* root@YOUR_VPS_IP:/var/www/iware/"
    exit 1
fi

# Step 8: Check .env file
if [ ! -f "backend/.env" ]; then
    print_error "backend/.env not found!"
    print_info "Creating template .env file..."
    
    cat > backend/.env << 'EOF'
# Server Configuration
NODE_ENV=production
PORT=5000
HOST=0.0.0.0

# Database Configuration
DB_HOST=mysql
DB_PORT=3306
DB_USER=iware_user
DB_PASSWORD=CHANGE_THIS_PASSWORD
DB_NAME=iware_warehouse

# JWT Secret (generate with: openssl rand -hex 64)
JWT_SECRET=CHANGE_THIS_SECRET
JWT_EXPIRES_IN=24h

# Frontend URL
FRONTEND_URL=https://YOUR_DOMAIN.com

# Accurate Online API
ACCURATE_CLIENT_ID=92539fe0-0f37-450c-810c-e4ca29e44b69
ACCURATE_CLIENT_SECRET=1884d3742a4c536d17ed6b922360cb60
ACCURATE_SIGNATURE_SECRET=obiAplB9p0AdOeq269MoIEtWIO9dX9DVZv3uzfB5jfReyeMfmYkwzTCRa87pMRPb
ACCURATE_REDIRECT_URI=https://YOUR_DOMAIN.com/api/accurate/callback
ACCURATE_ACCESS_TOKEN=YOUR_ACCESS_TOKEN_HERE
ACCURATE_APP_KEY=9bef48b4-d69c-41b3-a98b-752f6ee78fd7
ACCURATE_DATABASE_ID=118078

# CORS
CORS_ORIGIN=https://YOUR_DOMAIN.com
EOF

    print_info "Template .env created at backend/.env"
    print_error "Please edit backend/.env and update all values!"
    print_info "Then run this script again."
    exit 1
fi

# Step 9: Build and start containers
print_info "Step 9: Building and starting containers..."
docker-compose down 2>/dev/null || true
docker-compose up -d --build

print_success "Containers started"
echo ""

# Step 10: Wait for containers to be healthy
print_info "Step 10: Waiting for containers to be healthy..."
sleep 10

# Check container status
if docker ps | grep -q "iware-backend"; then
    print_success "Backend container running"
else
    print_error "Backend container not running"
    docker logs iware-backend
    exit 1
fi

if docker ps | grep -q "iware-mysql"; then
    print_success "MySQL container running"
else
    print_error "MySQL container not running"
    docker logs iware-mysql
    exit 1
fi

if docker ps | grep -q "iware-frontend"; then
    print_success "Frontend container running"
else
    print_error "Frontend container not running"
    docker logs iware-frontend
    exit 1
fi

if docker ps | grep -q "iware-nginx"; then
    print_success "Nginx container running"
else
    print_error "Nginx container not running"
    docker logs iware-nginx
    exit 1
fi

echo ""

# Step 11: Check database
print_info "Step 11: Checking database..."
sleep 5
if docker exec iware-backend node scripts/checkDatabase.js; then
    print_success "Database check passed"
else
    print_error "Database check failed"
fi
echo ""

# Step 12: Setup Accurate token
print_info "Step 12: Setting up Accurate token..."
if docker exec iware-backend node scripts/addTokenFromEnv.js; then
    print_success "Accurate token added"
else
    print_error "Failed to add Accurate token"
fi
echo ""

# Step 13: Check Accurate integration
print_info "Step 13: Checking Accurate integration..."
docker exec iware-backend node scripts/checkAccurateIntegration.js
echo ""

# Final summary
echo "=========================================="
echo "  Deployment Summary"
echo "=========================================="
echo ""
print_success "All containers are running!"
echo ""
echo "Container Status:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""
echo "Next Steps:"
echo "1. Setup SSL certificate:"
echo "   - Stop nginx: docker stop iware-nginx"
echo "   - Run certbot: certbot certonly --standalone -d YOUR_DOMAIN.com"
echo "   - Start nginx: docker start iware-nginx"
echo ""
echo "2. Access your application:"
echo "   - Frontend: http://YOUR_SERVER_IP"
echo "   - Backend API: http://YOUR_SERVER_IP:5000/api/health"
echo ""
echo "3. Default login:"
echo "   - Email: superadmin@iware.id"
echo "   - Password: Check with: docker exec iware-backend cat logs/admin-password.txt"
echo ""
echo "4. Monitor logs:"
echo "   - All: docker-compose logs -f"
echo "   - Backend: docker logs -f iware-backend"
echo ""
print_success "Deployment completed successfully!"
