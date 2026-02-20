# Git Push Checklist - iWare Warehouse

## ✅ FILE YANG AMAN DI-PUSH (Sudah Diupdate)

### Frontend
- ✅ `frontend/src/pages/SettingsPage.jsx` - UI OAuth Accurate
- ✅ `frontend/src/utils/accurate.js` - Utility functions OAuth

### Backend
- ✅ `backend/controllers/accurateController.js` - Controller dengan scope yang benar
- ✅ `backend/.env.example` - Template (tanpa credentials asli)

### Scripts
- ✅ `backend/scripts/checkAccurateIntegration.js` - Fix kolom username → email
- ✅ `backend/scripts/checkOAuthConfig.js` - OAuth config checker
- ✅ `backend/scripts/testOAuthFlow.js` - OAuth flow tester
- ✅ `backend/scripts/testAccurateAPI.js` - API connection tester

### Dokumentasi
- ✅ `ACCURATE_OAUTH_FIX.md` - Troubleshooting guide
- ✅ `DEPLOY_ACCURATE_OAUTH.md` - Deployment guide
- ✅ `GIT_PUSH_CHECKLIST.md` - File ini

### Config
- ✅ `.gitignore` - Updated untuk exclude .env files

## ❌ FILE YANG TIDAK BOLEH DI-PUSH (Berisi Credentials)

- ❌ `backend/.env` - Berisi token API dan secrets PRODUCTION
- ❌ `.env.docker` - Berisi credentials PRODUCTION
- ❌ `KREDENSIAL.md` - Jika ada
- ❌ `PASSWORD_INFO.md` - Jika ada

**PENTING:** File-file ini sudah ada di `.gitignore` dan tidak akan ter-push.

## 📝 Perintah Git untuk Push

```bash
# 1. Cek status file yang akan di-commit
git status

# 2. Pastikan file .env TIDAK muncul di list
# Jika muncul, jangan lanjut! Cek .gitignore dulu

# 3. Add file yang sudah diupdate
git add frontend/src/pages/SettingsPage.jsx
git add frontend/src/utils/accurate.js
git add backend/controllers/accurateController.js
git add backend/scripts/checkAccurateIntegration.js
git add backend/scripts/checkOAuthConfig.js
git add backend/scripts/testOAuthFlow.js
git add backend/scripts/testAccurateAPI.js
git add backend/.env.example
git add ACCURATE_OAUTH_FIX.md
git add DEPLOY_ACCURATE_OAUTH.md
git add GIT_PUSH_CHECKLIST.md
git add .gitignore

# 4. Commit dengan pesan yang jelas
git commit -m "feat: Add Accurate OAuth integration with UI and testing scripts

- Add OAuth UI in Settings page
- Add accurate.js utility for OAuth functions
- Fix accurateController scope configuration
- Add multiple testing scripts for OAuth and API
- Update documentation with troubleshooting guides
- Fix checkAccurateIntegration.js (username → email)
- Update .gitignore to exclude .env files"

# 5. Push ke repository
git push origin main
```

## 🔒 Keamanan - Double Check

Sebelum push, pastikan:

```bash
# Cek apakah .env ada di staging area
git status | grep ".env"

# Jika muncul .env, JANGAN PUSH! Remove dulu:
git reset HEAD backend/.env
git reset HEAD .env.docker

# Cek file yang akan di-commit
git diff --cached --name-only

# Pastikan TIDAK ADA file .env di list
```

## 📋 Setelah Push ke Git

Di VPS, jalankan:

```bash
# 1. Pull code terbaru
cd /path/to/iware-warehouse
git pull origin main

# 2. Copy .env dari backup atau buat baru
# JANGAN gunakan .env.example langsung!
# Gunakan credentials yang sudah ada di VPS

# 3. Restart containers
docker-compose down
docker-compose up -d --build

# 4. Test
docker-compose exec backend node scripts/testOAuthFlow.js
```

## ⚠️ PENTING: Credentials di VPS

Setelah pull di VPS, pastikan file `.env` di VPS tetap ada dan berisi:

```env
# File ini HANYA ada di VPS, TIDAK di Git!
ACCURATE_CLIENT_ID=92539fe0-0f37-450c-810c-e4ca29e44b69
ACCURATE_CLIENT_SECRET=1884d3742a4c536d17ed6b922360cb60
ACCURATE_ACCESS_TOKEN=aat.MTAw.eyJ2IjoxLCJ1IjoxMDkxOTY1...
ACCURATE_REDIRECT_URI=https://werehouse.iwareid.com/api/accurate/callback
CORS_ORIGIN=https://werehouse.iwareid.com
```

## 🔄 Workflow untuk Update Selanjutnya

1. **Development:**
   - Edit code
   - Test di local dengan `.env.local`
   - Commit & push (tanpa .env)

2. **Production:**
   - Pull di VPS
   - `.env` di VPS tetap ada (tidak ter-overwrite)
   - Restart containers
   - Test

## 📞 Jika Ada Masalah

Jika tidak sengaja push file `.env`:

```bash
# 1. Remove dari Git history (HATI-HATI!)
git rm --cached backend/.env
git rm --cached .env.docker

# 2. Commit removal
git commit -m "Remove sensitive .env files from repository"

# 3. Push
git push origin main

# 4. Ganti semua credentials di Accurate Console
# Karena sudah ter-expose di Git history
```

## ✅ Checklist Final

Sebelum push, pastikan:

- [ ] File `.env` dan `.env.docker` TIDAK ada di `git status`
- [ ] File `.gitignore` sudah updated
- [ ] Semua file code sudah di-add
- [ ] Commit message jelas dan deskriptif
- [ ] Sudah test di local (jika memungkinkan)
- [ ] Backup `.env` dari VPS sebelum pull

---

**Catatan:** Credentials Accurate Anda aman karena hanya ada di:
1. File `.env` di VPS (tidak di Git)
2. Accurate Developer Console
3. Dokumentasi lokal Anda (jangan upload ke Git!)
