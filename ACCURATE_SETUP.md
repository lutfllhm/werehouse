# Accurate OAuth Setup Guide

## Quick Setup

### 1. Konfigurasi di Accurate Developer Console

Login: https://account.accurate.id/developer/apps

**App Settings:**
- Client ID: `92539fe0-0f37-450c-810c-e4ca29e44b69`
- Client Secret: `1884d3742a4c536d17ed6b922360cb60`
- Redirect URI: `https://werehouse.iwareid.com/api/accurate/callback`
- Website: `https://werehouse.iwareid.com`

**Permissions (Scopes):**
- item_view
- item_save
- sales_order_view
- sales_order_save
- customer_view

### 2. Environment Variables

File `backend/.env` di VPS:
```env
ACCURATE_CLIENT_ID=92539fe0-0f37-450c-810c-e4ca29e44b69
ACCURATE_CLIENT_SECRET=1884d3742a4c536d17ed6b922360cb60
ACCURATE_REDIRECT_URI=https://werehouse.iwareid.com/api/accurate/callback
ACCURATE_DATABASE_ID=118078
CORS_ORIGIN=https://werehouse.iwareid.com
```

### 3. Deploy & Test

```bash
# Di VPS
git pull origin main
docker-compose down
docker-compose up -d --build

# Test OAuth config
docker-compose exec backend node scripts/testOAuthFlow.js

# Test API connection
docker-compose exec backend node scripts/testAccurateAPI.js

# Test di browser
# https://werehouse.iwareid.com → Login → Settings → Hubungkan Accurate
```

## Troubleshooting

### Error: "Ada Permasalahan" di Accurate
- Cek Redirect URI di Accurate Console exact match
- Pastikan scopes sudah diaktifkan
- Restart backend: `docker-compose restart backend`

### Error: "Authorization code tidak ditemukan"
- Cek backend logs: `docker-compose logs -f backend`
- Pastikan route `/api/accurate/callback` accessible

### Token Expired
- Disconnect & reconnect di Settings page
- Atau akan auto-refresh menggunakan refresh token

## Available Scripts

```bash
# Check OAuth configuration
node backend/scripts/testOAuthFlow.js

# Test Accurate API connection
node backend/scripts/testAccurateAPI.js

# Check integration status
node backend/scripts/checkAccurateIntegration.js

# Check database
node backend/scripts/checkDatabase.js
```

## Security Notes

- File `.env` dengan credentials TIDAK boleh di-push ke Git
- Sudah di-exclude di `.gitignore`
- Credentials hanya ada di VPS dan Accurate Console
