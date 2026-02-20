# Fix: Accurate OAuth Callback "Ada Permasalahan"

## Error yang Muncul
Saat melakukan OAuth authorization dengan Accurate Online, muncul halaman error:
```
Ada Permasalahan

Tidak dapat melanjutkan proses otorisasi. Hal ini bisa terjadi dikarenakan salah satu hal berikut ini:
- Client ID yang digunakan tidak tepat
- URL redirect yang digunakan tidak sesuai dengan yang didaftarkan
- Scope otorisasi yang diajukan tidak tepat
```

## Penyebab Utama
1. **Client ID tidak terdaftar** atau salah
2. **Redirect URI tidak match** dengan yang didaftarkan di Accurate Developer Console
3. **Scope tidak valid** atau aplikasi tidak punya permission untuk scope tersebut

## Solusi Lengkap

### Langkah 1: Verifikasi Konfigurasi Backend

Jalankan script test:
```bash
node backend/scripts/testOAuthFlow.js
```

Script ini akan:
- Mengecek environment variables
- Validasi redirect URI
- Generate authorization URL yang benar
- Memberikan instruksi testing

### Langkah 2: Update Accurate Developer Console

1. **Login ke Accurate Developer Console:**
   ```
   https://account.accurate.id/developer/apps
   ```

2. **Pilih atau Buat Aplikasi:**
   - Jika belum ada, klik "Create New App"
   - Nama: `iwarewerehouse` (atau nama lain)
   - Deskripsi: Warehouse Monitoring System

3. **Catat Client ID dan Client Secret:**
   ```
   Client ID: 92539fe0-0f37-450c-810c-e4ca29e44b69
   Client Secret: 1884d3742a4c536d17ed6b922360cb60
   ```

4. **Set Redirect URI (PENTING!):**
   ```
   https://werehouse.iwareid.com/api/accurate/callback
   ```
   
   ⚠️ **PERHATIAN:**
   - Harus HTTPS (bukan HTTP) untuk production
   - Harus lowercase `accurate` (bukan `Accurate`)
   - Harus exact match dengan yang di `.env`
   - Case-sensitive!

5. **Set Permissions/Scopes:**
   Pastikan aplikasi Anda punya permission untuk:
   - ✓ item_view
   - ✓ item_save
   - ✓ sales_order_view
   - ✓ sales_order_save
   - ✓ customer_view

6. **Save Changes**

### Langkah 3: Update Environment Variables

Edit `backend/.env`:
```env
# Accurate OAuth Configuration
ACCURATE_CLIENT_ID=92539fe0-0f37-450c-810c-e4ca29e44b69
ACCURATE_CLIENT_SECRET=1884d3742a4c536d17ed6b922360cb60
ACCURATE_REDIRECT_URI=https://werehouse.iwareid.com/api/accurate/callback

# CORS
CORS_ORIGIN=https://werehouse.iwareid.com
```

Atau edit `.env.docker` jika menggunakan Docker.

### Langkah 4: Restart Backend

**Jika menggunakan Docker:**
```bash
docker-compose restart backend
```

**Jika menggunakan PM2:**
```bash
pm2 restart backend
```

**Jika manual:**
```bash
cd backend
npm start
```

### Langkah 5: Test OAuth Flow

1. **Buka aplikasi di browser:**
   ```
   https://werehouse.iwareid.com
   ```

2. **Login sebagai superadmin:**
   ```
   Email: superadmin@iware.id
   Password: jasad666
   ```

3. **Buka halaman Settings**

4. **Klik "Hubungkan Accurate"**

5. **Authorize aplikasi di Accurate**

6. **Seharusnya redirect kembali dengan sukses**

### Langkah 6: Verifikasi Koneksi

Jalankan script checker:
```bash
node backend/scripts/checkAccurateIntegration.js
```

Seharusnya menampilkan:
```
✓ Environment variables configured
✓ Database connected
✓ Table accurate_tokens exists
✓ Found active token
✓ Integrasi Accurate sudah berfungsi dengan baik!
```

## Catatan Penting

### URL Callback Harus Exact Match
```
✓ BENAR: https://werehouse.iwareid.com/api/accurate/callback
✗ SALAH: https://werehouse.iwareid.com/api/Accurate/callback (huruf besar)
✗ SALAH: http://werehouse.iwareid.com/api/accurate/callback (http bukan https)
✗ SALAH: https://werehouse.iwareid.com/accurate/callback (tanpa /api)
```

### Scope OAuth
Aplikasi meminta scope berikut:
- `item_view` - Melihat data item/produk
- `sales_order_view` - Melihat sales order
- `sales_order_save` - Membuat/update sales order
- `customer_view` - Melihat data customer

### Multiple Environments

Jika Anda punya development dan production:

**Development (.env.local)**
```env
ACCURATE_REDIRECT_URI=http://localhost:5000/api/accurate/callback
CORS_ORIGIN=http://localhost:3000
```

**Production (.env atau .env.docker)**
```env
ACCURATE_REDIRECT_URI=https://werehouse.iwareid.com/api/accurate/callback
CORS_ORIGIN=https://werehouse.iwareid.com
```

Daftarkan KEDUA URL di Accurate Developer Console (dipisah dengan enter).

## Troubleshooting

### Error: "redirect_uri_mismatch"
- Pastikan URL di `.env` sama persis dengan yang di Accurate Console
- Cek typo, case sensitivity, http vs https

### Error: "invalid_client"
- Cek `ACCURATE_CLIENT_ID` dan `ACCURATE_CLIENT_SECRET`
- Pastikan credentials benar

### Error: "Authorization code tidak ditemukan"
- Backend tidak menerima parameter `code` dari Accurate
- Cek route `/api/accurate/callback` berfungsi
- Cek logs backend saat callback dipanggil

### Cek Logs Backend
```bash
# Docker
docker-compose logs -f backend

# PM2
pm2 logs backend
```

## Testing

Setelah fix, test dengan:

1. **Check OAuth Config**
   ```bash
   node backend/scripts/checkOAuthConfig.js
   ```

2. **Check Accurate Integration**
   ```bash
   node backend/scripts/checkAccurateIntegration.js
   ```

3. **Manual Test di Browser**
   - Buka aplikasi
   - Login sebagai superadmin
   - Settings → Hubungkan Accurate
   - Authorize
   - Harus redirect kembali dengan sukses

## Referensi

- Accurate OAuth Documentation: https://accurate.id/api-myob/
- Developer Console: https://account.accurate.id/developer/apps

---

## Checklist Troubleshooting

Gunakan checklist ini untuk memastikan semua sudah benar:

### Di Accurate Developer Console:
- [ ] Aplikasi sudah dibuat
- [ ] Client ID dan Client Secret sudah dicatat
- [ ] Redirect URI: `https://werehouse.iwareid.com/api/accurate/callback`
- [ ] Redirect URI menggunakan HTTPS
- [ ] Redirect URI menggunakan lowercase `accurate`
- [ ] Permissions/scopes sudah diaktifkan (item_view, item_save, sales_order_view, sales_order_save, customer_view)
- [ ] Changes sudah di-save

### Di Backend (.env):
- [ ] ACCURATE_CLIENT_ID sudah diisi
- [ ] ACCURATE_CLIENT_SECRET sudah diisi
- [ ] ACCURATE_REDIRECT_URI = `https://werehouse.iwareid.com/api/accurate/callback`
- [ ] CORS_ORIGIN = `https://werehouse.iwareid.com`
- [ ] Tidak ada typo atau spasi ekstra

### Di Server:
- [ ] Backend sudah di-restart setelah update .env
- [ ] Backend berjalan dan accessible
- [ ] Route `/api/accurate/callback` berfungsi
- [ ] Tidak ada firewall yang blocking

### Testing:
- [ ] Bisa akses aplikasi di browser
- [ ] Bisa login sebagai superadmin
- [ ] Tombol "Hubungkan Accurate" muncul di Settings
- [ ] Klik tombol redirect ke Accurate
- [ ] Setelah authorize, redirect kembali ke aplikasi
- [ ] Status "Terhubung dengan Accurate Online" muncul

## Jika Masih Gagal

1. **Cek logs backend:**
   ```bash
   docker-compose logs -f backend
   # atau
   pm2 logs backend
   ```

2. **Test manual dengan curl:**
   ```bash
   curl https://werehouse.iwareid.com/api/accurate/auth/url
   ```
   
   Seharusnya return JSON dengan `authUrl`.

3. **Cek browser console:**
   - Buka Developer Tools (F12)
   - Lihat tab Console untuk error
   - Lihat tab Network untuk request yang gagal

4. **Hubungi support Accurate:**
   - Email: support@accurate.id
   - Tanyakan apakah aplikasi Anda sudah approved
   - Tanyakan apakah scopes yang diminta valid

## Screenshot untuk Referensi

### Accurate Developer Console - App Settings
```
Application Name: iwarewerehouse
Client ID: 92539fe0-0f37-450c-810c-e4ca29e44b69
Client Secret: ****************
Redirect URIs:
  https://werehouse.iwareid.com/api/accurate/callback
  
Permissions:
  ✓ item_view
  ✓ item_save
  ✓ sales_order_view
  ✓ sales_order_save
  ✓ customer_view
```

### Backend .env File
```env
ACCURATE_CLIENT_ID=92539fe0-0f37-450c-810c-e4ca29e44b69
ACCURATE_CLIENT_SECRET=1884d3742a4c536d17ed6b922360cb60
ACCURATE_REDIRECT_URI=https://werehouse.iwareid.com/api/accurate/callback
CORS_ORIGIN=https://werehouse.iwareid.com
```
