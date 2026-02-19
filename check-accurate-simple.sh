#!/bin/bash

# Script sederhana untuk cek Accurate connection
# Bisa dijalankan langsung di VPS tanpa masuk container

echo "=============================================="
echo "  CHECK ACCURATE CONNECTION - SIMPLE"
echo "=============================================="
echo ""

# Warna
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 1. Cek apakah menggunakan Docker
if [ -f "docker-compose.yml" ]; then
    echo -e "${YELLOW}Detected Docker setup${NC}"
    echo ""
    
    # Cek apakah container running
    if docker-compose ps | grep -q "werehouse-backend.*Up"; then
        echo -e "${GREEN}✓ Backend container is running${NC}"
        echo ""
        
        # Jalankan test di dalam container
        echo "Running test inside Docker container..."
        echo ""
        docker exec werehouse-backend node scripts/quickTestAccurate.js
        
    else
        echo -e "${RED}✗ Backend container is not running${NC}"
        echo ""
        echo "Start containers first:"
        echo "  docker-compose up -d"
    fi
    
else
    echo -e "${YELLOW}No Docker detected, checking local setup${NC}"
    echo ""
    
    # Cek apakah backend directory ada
    if [ ! -d "backend" ]; then
        echo -e "${RED}✗ Backend directory not found${NC}"
        exit 1
    fi
    
    # Cek apakah node_modules ada
    if [ ! -d "backend/node_modules" ]; then
        echo -e "${RED}✗ Dependencies not installed${NC}"
        echo ""
        echo "Install dependencies first:"
        echo "  cd backend"
        echo "  npm install"
        exit 1
    fi
    
    # Jalankan test
    echo "Running test..."
    echo ""
    cd backend
    node scripts/quickTestAccurate.js
fi
