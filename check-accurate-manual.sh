#!/bin/bash

# Manual check Accurate connection tanpa Node.js
# Hanya menggunakan MySQL dan curl

echo "=============================================="
echo "  MANUAL CHECK ACCURATE CONNECTION"
echo "=============================================="
echo ""

# Warna
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Load .env file
if [ -f "backend/.env" ]; then
    export $(cat backend/.env | grep -v '^#' | xargs)
    echo -e "${GREEN}✓ Loaded backend/.env${NC}"
else
    echo -e "${RED}✗ backend/.env not found${NC}"
    exit 1
fi

echo ""
echo "Environment Variables:"
echo "  DB_HOST: ${DB_HOST}"
echo "  DB_NAME: ${DB_NAME}"
echo "  ACCURATE_API_URL: ${ACCURATE_API_URL}"
echo "  ACCURATE_DATABASE_ID: ${ACCURATE_DATABASE_ID:0:10}..."
echo ""

# 1. Check database connection
echo "1. Checking database connection..."
if docker exec werehouse-mysql mysql -u${DB_USER} -p${DB_PASSWORD} -e "SELECT 1" ${DB_NAME} > /dev/null 2>&1; then
    echo -e "   ${GREEN}✓ Database connected${NC}"
else
    echo -e "   ${RED}✗ Database connection failed${NC}"
    exit 1
fi
echo ""

# 2. Check accurate_tokens table
echo "2. Checking accurate_tokens table..."
TABLE_EXISTS=$(docker exec werehouse-mysql mysql -u${DB_USER} -p${DB_PASSWORD} -D${DB_NAME} -se "SHOW TABLES LIKE 'accurate_tokens'")

if [ -z "$TABLE_EXISTS" ]; then
    echo -e "   ${RED}✗ Table accurate_tokens NOT FOUND${NC}"
    echo "   Run: docker exec werehouse-backend node scripts/addAccurateTokensTable.js"
    exit 1
else
    echo -e "   ${GREEN}✓ Table exists${NC}"
fi
echo ""

# 3. Check tokens
echo "3. Checking tokens in database..."
TOKEN_COUNT=$(docker exec werehouse-mysql mysql -u${DB_USER} -p${DB_PASSWORD} -D${DB_NAME} -se "SELECT COUNT(*) FROM accurate_tokens WHERE is_active = TRUE AND expires_at > NOW()")

if [ "$TOKEN_COUNT" -eq "0" ]; then
    echo -e "   ${RED}✗ NO ACTIVE TOKENS FOUND${NC}"
    echo ""
    echo "SOLUTION:"
    echo "1. Login to app as superadmin"
    echo "2. Go to Settings page"
    echo "3. Click 'Hubungkan Accurate'"
    echo "4. Authorize the app"
    exit 1
else
    echo -e "   ${GREEN}✓ Found $TOKEN_COUNT active token(s)${NC}"
fi
echo ""

# 4. Get token and test API
echo "4. Testing Accurate API..."
ACCESS_TOKEN=$(docker exec werehouse-mysql mysql -u${DB_USER} -p${DB_PASSWORD} -D${DB_NAME} -se "SELECT access_token FROM accurate_tokens WHERE is_active = TRUE AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1")

if [ -z "$ACCESS_TOKEN" ]; then
    echo -e "   ${RED}✗ Could not retrieve access token${NC}"
    exit 1
fi

echo "   Token length: ${#ACCESS_TOKEN}"
echo "   Testing API call..."

# Test API dengan curl
HTTP_CODE=$(curl -s -o /tmp/accurate_response.json -w "%{http_code}" \
    -H "Authorization: Bearer ${ACCESS_TOKEN}" \
    -H "X-Api-Key: ${ACCURATE_DATABASE_ID}" \
    -H "Content-Type: application/json" \
    "${ACCURATE_API_URL}/sales-order/list.do?sp=1&pageSize=5")

echo "   HTTP Status: $HTTP_CODE"

if [ "$HTTP_CODE" -eq "200" ]; then
    echo -e "   ${GREEN}✓ API CALL SUCCESS!${NC}"
    echo ""
    echo "Response preview:"
    cat /tmp/accurate_response.json | head -20
    echo ""
    echo "=============================================="
    echo -e "${GREEN}✓✓✓ ALL CHECKS PASSED! ✓✓✓${NC}"
    echo "Accurate API connection is working!"
    echo "=============================================="
elif [ "$HTTP_CODE" -eq "401" ]; then
    echo -e "   ${RED}✗ 401 Unauthorized - Token invalid or expired${NC}"
    echo ""
    echo "SOLUTION: Reconnect Accurate via Settings page"
    cat /tmp/accurate_response.json
elif [ "$HTTP_CODE" -eq "403" ]; then
    echo -e "   ${RED}✗ 403 Forbidden - Database ID wrong or no access${NC}"
    echo ""
    echo "SOLUTION: Check ACCURATE_DATABASE_ID in backend/.env"
    cat /tmp/accurate_response.json
else
    echo -e "   ${RED}✗ API call failed with status $HTTP_CODE${NC}"
    echo ""
    echo "Response:"
    cat /tmp/accurate_response.json
fi

# Cleanup
rm -f /tmp/accurate_response.json
