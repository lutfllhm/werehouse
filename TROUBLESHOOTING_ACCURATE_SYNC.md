# Troubleshooting: Sinkronisasi Gagal dari Accurate

## Langkah Diagnosis

### 1. Jalankan Script Test Koneksi

```bash
cd backend
node scripts/testAccurateConnection.js
```

Script ini akan mengecek:
- Environment variables
- Database connection
- Tabel accurate_tokens
- Token yang tersimpan
- Koneksi ke Accurate API

### 2. Cek Logs Backend

Jika menggunakan Docker:
```bash
docker-compose logs -f backend
```

Jika menggunakan PM2:
```bash
pm2 logs backend
```

Cari error message yang spesifik seperti:
- "Token tidak ditemukan"
- "Token sudah expired"
- "401 Unauthorized"
- "403 Forbidden"

### 3. Cek Browser Console

Buka Developer Tools (F12) di browser, lalu:
1. Buka tab Console
2. Klik tombol "Sync dari Accurate"
3. Lihat error message yang muncul

## Masalah Umum dan Solusi

### A. Token Tidak Ditemukan

**Error:** "Token tidak ditemukan"

**Penyebab:** Belum menghubungkan akun Accurate

**Solusi:**
1. Login ke aplikasi sebagai superadmin
2. Buka halaman Settings
3. Klik tombol "Hubungkan Accurate"
4. Authorize aplikasi di Accurate Online
5. Setelah redirect kembali, token akan tersimpan

### B. Token Expired

**Error:** "Token sudah expired"

**Penyebab:** Access token Accurate sudah kadaluarsa (biasanya 1 jam)

**Solusi 1 - Refresh Token (Otomatis):**
```bash
# Implementasi auto-refresh akan ditambahkan
```

**Solusi 2 - Manual Reconnect:**
1. Buka Settings
2. Klik "Hubungkan Accurate" lagi
3. Authorize ulang

### C. Database ID Salah

**Error:** "403 Forbidden" atau "Invalid database"

**Penyebab:** ACCURATE_DATABASE_ID di .env salah

**Solusi:**
1. Login ke Accurate Online
2. Buka database yang ingin digunakan
3. Lihat URL: `https://web.accurate.id/accurate5/app/db/{DATABASE_ID}/...`
4. Copy DATABASE_ID tersebut
5. Update di `backend/.env`:
   ```
   ACCURATE_DATABASE_ID=your_database_id_here
   ```
6. Restart aplikasi

### D. API URL Salah

**Error:** "Network Error" atau "ENOTFOUND"

**Penyebab:** ACCURATE_API_URL salah

**Solusi:**
Update di `backend/.env`:
```
ACCURATE_API_URL=https://public-api.accurate.id/api
```

### E. Tabel accurate_tokens Tidak Ada

**Error:** "Table 'accurate_tokens' doesn't exist"

**Penyebab:** Migrasi database belum dijalankan

**Solusi:**
```bash
cd backend
node scripts/addAccurateTokensTable.js
```

### F. Network/Firewall Issue

**Error:** "ETIMEDOUT" atau "ECONNREFUSED"

**Penyebab:** 
- Firewall memblokir koneksi ke Accurate API
- VPS tidak bisa akses internet
- DNS issue

**Solusi:**
1. Test koneksi dari VPS:
   ```bash
   curl https://public-api.accurate.id/api
   ```

2. Jika gagal, cek firewall:
   ```bash
   sudo ufw status
   sudo ufw allow out 443/tcp
   ```

3. Cek DNS:
   ```bash
   nslookup public-api.accurate.id
   ```

### G. CORS Error (Frontend)

**Error:** "CORS policy blocked"

**Penyebab:** Backend tidak mengizinkan origin frontend

**Solusi:**
Update `backend/.env`:
```
CORS_ORIGIN=https://your-domain.com
# atau untuk development
CORS_ORIGIN=http://localhost:3000
```

## Cek Manual via cURL

Test API Accurate langsung:

```bash
# Ganti YOUR_ACCESS_TOKEN dan YOUR_DATABASE_ID
curl -X GET "https://public-api.accurate.id/api/sales-order/list.do?sp=1&pageSize=10" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "X-Api-Key: YOUR_DATABASE_ID" \
  -H "Content-Type: application/json"
```

Response sukses:
```json
{
  "d": [
    {
      "id": 123,
      "number": "SO-001",
      "customerName": "Customer Name",
      ...
    }
  ],
  "sp": {
    "page": 1,
    "pageSize": 10,
    "totalCount": 100
  }
}
```

## Cek Database Manual

```bash
# Login ke MySQL
mysql -u root -p

# Pilih database
USE iware_warehouse;

# Cek tokens
SELECT id, user_id, token_type, expires_at, is_active, created_at 
FROM accurate_tokens 
ORDER BY created_at DESC 
LIMIT 5;

# Cek apakah ada token aktif
SELECT COUNT(*) as active_tokens 
FROM accurate_tokens 
WHERE is_active = TRUE AND expires_at > NOW();
```

## Enable Debug Mode

Untuk logging lebih detail, update `backend/.env`:
```
NODE_ENV=development
```

Restart aplikasi, lalu cek logs lagi.

## Masih Gagal?

Jika semua langkah di atas sudah dicoba tapi masih gagal:

1. **Capture full error:**
   - Screenshot error di browser
   - Copy full error dari backend logs
   - Copy output dari testAccurateConnection.js

2. **Cek Accurate API Status:**
   - Buka https://status.accurate.id
   - Pastikan API tidak sedang maintenance

3. **Verifikasi Credentials:**
   - Login ke Accurate Online
   - Pastikan akun masih aktif
   - Pastikan database masih accessible

4. **Contact Support:**
   - Kirim error details ke developer
   - Sertakan logs dan screenshots

## Preventive Measures

Untuk mencegah masalah di masa depan:

1. **Implement Token Auto-Refresh**
2. **Setup Monitoring/Alerting**
3. **Regular Token Health Check**
4. **Backup Token ke Secure Storage**
5. **Document API Changes dari Accurate**
