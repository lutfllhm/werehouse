#!/bin/bash

# Script untuk cek file sensitif sebelum push ke GitHub

echo "🔍 Checking for sensitive files before push..."
echo ""

# Warna untuk output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counter
ERRORS=0
WARNINGS=0

# Fungsi untuk cek file
check_file() {
    local file=$1
    local description=$2
    
    if git ls-files --error-unmatch "$file" > /dev/null 2>&1; then
        echo -e "${RED}❌ DANGER: $file is tracked by git!${NC}"
        echo "   $description"
        ((ERRORS++))
    else
        echo -e "${GREEN}✓ $file is not tracked${NC}"
    fi
}

# Fungsi untuk cek pattern di staged files
check_pattern() {
    local pattern=$1
    local description=$2
    
    if git diff --cached | grep -q "$pattern"; then
        echo -e "${RED}❌ DANGER: Found '$pattern' in staged files!${NC}"
        echo "   $description"
        ((ERRORS++))
    fi
}

echo "1. Checking environment files..."
echo "--------------------------------"
check_file "backend/.env" "Contains database credentials and API tokens"
check_file "backend/.env.local" "Contains local environment variables"
check_file "backend/.env.production" "Contains production credentials"
check_file ".env" "Contains environment variables"
echo ""

echo "2. Checking credential files..."
echo "--------------------------------"
check_file "accurate.md" "Contains Accurate API credentials"
check_file "accurate-online-api-token-1.0.3.pdf" "Contains API documentation with examples"
check_file "KREDENSIAL.md" "Contains credentials"
check_file "PASSWORD_INFO.md" "Contains password information"
echo ""

echo "3. Checking database files..."
echo "--------------------------------"
if git diff --cached --name-only | grep -q "\.sql$"; then
    echo -e "${YELLOW}⚠ Warning: SQL files found in staged changes${NC}"
    echo "   Make sure they don't contain sensitive data"
    ((WARNINGS++))
else
    echo -e "${GREEN}✓ No SQL files in staged changes${NC}"
fi
echo ""

echo "4. Checking for hardcoded credentials..."
echo "--------------------------------"
check_pattern "aat\.MTAw\." "Accurate API token found"
check_pattern "objApIB9p0AdOeq269MoIEtWlO9dX9DVZy3uzfB5jiReyeMfmYkwzTCRa87pMRPb" "Signature secret found"
check_pattern "9bef48b4-d69c-41b3-a98b-752f6ee78fd7" "App key found"
check_pattern "92539fe0-0f37-450c-810c-e4ca29e44b69" "Client ID found"
check_pattern "1884d3742a4c536d17ed6b922360cb60" "Client secret found"
echo ""

echo "5. Checking node_modules..."
echo "--------------------------------"
if git ls-files | grep -q "node_modules/"; then
    echo -e "${RED}❌ DANGER: node_modules is tracked by git!${NC}"
    ((ERRORS++))
else
    echo -e "${GREEN}✓ node_modules is not tracked${NC}"
fi
echo ""

echo "6. Checking .env.example..."
echo "--------------------------------"
if git diff --cached backend/.env.example | grep -q "your_.*_here"; then
    echo -e "${GREEN}✓ .env.example contains placeholders${NC}"
elif git diff --cached backend/.env.example | grep -q "aat\.MTAw\."; then
    echo -e "${RED}❌ DANGER: .env.example contains real credentials!${NC}"
    ((ERRORS++))
else
    echo -e "${GREEN}✓ .env.example looks safe${NC}"
fi
echo ""

# Summary
echo "================================"
echo "Summary:"
echo "================================"
if [ $ERRORS -gt 0 ]; then
    echo -e "${RED}❌ Found $ERRORS error(s)${NC}"
    echo -e "${RED}DO NOT PUSH! Fix the issues above first.${NC}"
    exit 1
elif [ $WARNINGS -gt 0 ]; then
    echo -e "${YELLOW}⚠ Found $WARNINGS warning(s)${NC}"
    echo -e "${YELLOW}Please review before pushing.${NC}"
    exit 0
else
    echo -e "${GREEN}✅ All checks passed!${NC}"
    echo -e "${GREEN}Safe to push to GitHub.${NC}"
    exit 0
fi
