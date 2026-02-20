# Panduan Deploy Accurate OAuth - iWare Warehouse

## Data Accurate Anda

```
App Key: 9bef48b4-d69c-41b3-a98b-752f6ee78fd7
Signature Secret: objApIB9p0AdOeq269MoIEtWlO9dX9DVZy3uzfB5jiReyeMfmYkwzTCRa87pMRPb
Client ID: 92539fe0-0f37-450c-810c-e4ca29e44b69
Client Secret: 1884d3742a4c536d17ed6b922360cb60
Database ID: 118078
OAuth Callback: https://werehouse.iwareid.com/api/accurate/callback
Website: https://werehouse.iwareid.com
```

## Langkah 1: Verifikasi Konfigurasi Accurate Developer Console

1. Login ke: https://account.accurate.id/developer/apps

2. Pastikan aplikasi "iwarewerehouse" memiliki:
   - ✓ Client ID: `92539fe0-0f37-450c-810c-e4ca29e44b69`
   - ✓ Client Secret: `1884d3742a4c536d17ed6b922360cb60`
   - ✓ Redirect URI: `https://werehouse.iwareid.com/api/accurate/callback`
   - ✓ Website URL: `https://werehouse.iwareid.com`

3. Pastikan Permissions/Scopes aktif:
   - ✓ item_view
   - ✓ item_save
   - ✓ sales_order_view
   - ✓ sales_order_save
   - ✓ customer_view

4. Save changes jika ada perubahan

## Langkah 2: Update File Konfigurasi di VPS

Semua file sudah saya update dengan konfigurasi yang benar:
- ✓ `backend/.env` - Production config
- ✓ `.env.docker` - Docker config
- ✓ `backend/.env.example` - Template untuk development

## Langkah 3: Deploy ke VPS

### A. Upload File ke VPS

```bash
# Dari komputer lokal, upload ke VPS
scp -r . user@your-vps-ip:/path/to/iware-warehouse/
```

Atau jika menggunakan Git:
```bash
# Di VPS
cd /path/to/iware-warehouse
git pull origin main
```

### B. Restart Docker Containers

```bash
# Di VPS
cd /path/to/iware-warehouse
docker-compose down
docker-compose up -d --build
```

### C. Cek Logs

```bash
# Cek logs backend
docker-compose logs -f backend

# Cek logs frontend
docker-compose logs -f frontend
```

## Langkah 4: Test Konfigurasi

### A. Test Environment Variables

```bash
# Di VPS, masuk ke container backend
docker-compose exec backend sh

# Jalankan test script
node scripts/testOAuthFlow.js
```

Output yang diharapkan:
```
✓ CLIENT_ID: 92539fe0-0f37-450c-810c-e4ca29e44b69
✓ CLIENT_SECRET: SET (hidden)
✓ REDIRECT_URI: https://werehouse.iwareid.com/api/accurate/callback
✓ Redirect URI looks good
```

### B. Test Accurate API Connection

```bash
# Masih di dalam container backend
node scripts/testAccurateAPI.js
```

Output yang diharapkan:
```
✓ Database Status: Active
✓ Items found: XXX
✓ Sales Orders found: XXX
✓ ALL TESTS PASSED!
```

### C. Test OAuth Flow di Browser

1. Buka: https://werehouse.iwareid.com

2. Login dengan:
   ```
   Email: superadmin@iware.id
   Password: jasad666
   ```

3. Klik menu "Settings"

4. Klik tombol "Hubungkan Accurate"

5. Akan redirect ke Accurate OAuth page

6. Login ke Accurate (jika belum login)

7. Klik "Authorize"

8. Akan redirect kembali ke aplikasi dengan pesan sukses

9. Status di Settings page akan berubah menjadi "Terhubung dengan Accurate Online"

## Langkah 5: Verifikasi Integrasi

```bash
# Di VPS, masuk ke container backend
docker-compose exec backend sh

# Jalankan script verifikasi
node scripts/checkAccurateIntegration.js
```

Output yang diharapkan:
```
✓ Environment variables configured
✓ Database connected
✓ Table accurate_tokens exists
✓ Found active token
✓ Integrasi Accurate sudah berfungsi dengan baik!
```

## Troubleshooting

### Error: "Ada Permasalahan" di Accurate OAuth

**Penyebab:**
- Redirect URI tidak match
- Client ID/Secret salah
- Scopes tidak valid

**Solusi:**
1. Cek Accurate Developer Console
2. Pastikan Redirect URI exact match: `https://werehouse.iwareid.com/api/accurate/callback`
3. Pastikan scopes sudah diaktifkan
4. Restart backend: `docker-compose restart backend`

### Error: "Authorization code tidak ditemukan"

**Penyebab:**
- Backend tidak menerima callback dari Accurate

**Solusi:**
1. Cek backend logs: `docker-compose logs -f backend`
2. Pastikan route `/api/accurate/callback` accessible
3. Test manual: `curl https://werehouse.iwareid.com/api/accurate/auth/url`

### Error: Token expired

**Penyebab:**
- Access token sudah kadaluarsa

**Solusi:**
1. Disconnect dari Accurate di Settings page
2. Connect ulang dengan klik "Hubungkan Accurate"
3. Atau gunakan refresh token (otomatis)

### Backend tidak bisa akses Accurate API

**Penyebab:**
- Token API salah atau expired
- Database ID salah

**Solusi:**
1. Cek token di `.env`: `ACCURATE_ACCESS_TOKEN`
2. Test dengan: `node scripts/testAccurateAPI.js`
3. Jika expired, dapatkan token baru dari Accurate

## Monitoring

### Cek Status Koneksi

```bash
# Via API
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  https://werehouse.iwareid.com/api/accurate/status
```

### Cek Logs Real-time

```bash
# Backend logs
docker-compose logs -f backend

# Semua logs
docker-compose logs -f
```

### Cek Container Status

```bash
docker-compose ps
```

## Maintenance

### Update Token API

Jika token API expired, update di `.env`:

```bash
# Edit file
nano backend/.env

# Update line:
ACCURATE_ACCESS_TOKEN=new_token_here

# Restart
docker-compose restart backend
```

### Backup Database

```bash
# Backup database
docker-compose exec mysql mysqldump -u root -p iware_warehouse > backup.sql

# Restore
docker-compose exec -T mysql mysql -u root -p iware_warehouse < backup.sql
```

## Checklist Deployment

- [ ] Accurate Developer Console sudah dikonfigurasi
- [ ] File `.env` sudah diupdate dengan data yang benar
- [ ] Docker containers sudah di-restart
- [ ] Test `testOAuthFlow.js` berhasil
- [ ] Test `testAccurateAPI.js` berhasil
- [ ] OAuth flow di browser berhasil
- [ ] Status "Terhubung" muncul di Settings page
- [ ] Test sync items dari Accurate berhasil
- [ ] Test sync sales orders dari Accurate berhasil

## Support

Jika masih ada masalah:

1. Cek logs: `docker-compose logs -f backend`
2. Jalankan diagnostic: `node scripts/checkAccurateIntegration.js`
3. Hubungi Accurate Support: support@accurate.id
4. Dokumentasi API: https://accurate.id/api-myob/

---

**Catatan:** Semua konfigurasi sudah saya update dengan data Accurate Anda yang benar. Tinggal deploy ke VPS dan test OAuth flow.
