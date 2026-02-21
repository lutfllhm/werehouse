# iWare Backend API

Backend API untuk sistem Warehouse Monitoring & Schedule iWare dengan integrasi Accurate Online.

## Teknologi

- Node.js + Express.js
- MySQL Database
- JWT Authentication
- Accurate Online API Token Integration

## Instalasi

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Database
```bash
# Setup database otomatis
npm run setup

# Atau setup interaktif
npm run setup-interactive

# Atau import manual
npm run import-db
```

### 3. Konfigurasi Environment
```bash
cp .env.example .env
```

Edit file `.env`:
```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=iware_db

# JWT
JWT_SECRET=your_jwt_secret

# Accurate Online API Token
ACCURATE_ACCESS_TOKEN=aat.xxx.yyy.zzz
ACCURATE_SIGNATURE_SECRET=your_signature_secret
```

### 4. Setup Accurate Integration
```bash
# Tambah tabel accurate_tokens
npm run add-accurate-table

# Tambah token dari .env ke database
npm run add-token

# Test koneksi API Token
npm run test-api-token
```

## Menjalankan Server

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## NPM Scripts

### Development
- `npm run dev` - Jalankan server dengan nodemon
- `npm start` - Jalankan server production

### Database
- `npm run setup` - Setup database otomatis
- `npm run setup-interactive` - Setup database interaktif
- `npm run import-db` - Import SQL file
- `npm run check-db` - Cek koneksi database

### Accurate Integration
- `npm run add-accurate-table` - Tambah tabel accurate_tokens
- `npm run add-token` - Tambah token dari .env ke database
- `npm run test-api-token` - Test API Token Accurate

### Utilities
- `npm run generate-password` - Generate bcrypt password

## Accurate Online Integration

Aplikasi ini menggunakan **API Token** untuk integrasi dengan Accurate Online.

### Setup API Token

1. Login ke https://account.accurate.id
2. Buka menu **Developer** → **API Token**
3. Klik **Create New Token**
4. Copy **API Token** dan **Signature Secret**
5. Tambahkan ke file `.env`

### Dokumentasi

- **Lengkap**: `docs/ACCURATE_API_TOKEN.md`
- **Quick Start**: `docs/ACCURATE_QUICK_START.md`
- **Implementasi**: `../ACCURATE_API_IMPLEMENTATION.md`

### Test Koneksi

```bash
npm run test-api-token
```

Output yang diharapkan:
```
✓ Timestamp generation: OK
✓ HMAC SHA-256 signature: OK
✓ API Token authentication: OK
✓ Dynamic host retrieval: OK
✓ Host caching (30 days): OK
✓ Request headers: OK
✓ API calls with redirect support: OK
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile

### Items
- `GET /api/items` - Get all items
- `GET /api/items/:id` - Get item detail
- `POST /api/items/sync` - Sync items dari Accurate
- `GET /api/items/stats` - Get item statistics

### Sales Orders
- `GET /api/sales-orders` - Get all sales orders
- `GET /api/sales-orders/:id` - Get SO detail
- `POST /api/sales-orders/sync` - Sync SO dari Accurate
- `GET /api/sales-orders/stats` - Get SO statistics
- `PUT /api/sales-orders/:id/status` - Update SO status

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/chart/sales-orders` - Get SO chart data
- `GET /api/dashboard/chart/items` - Get items chart data

### Reports
- `GET /api/reports/items` - Get items report
- `GET /api/reports/sales-orders` - Get SO report
- `GET /api/reports/export` - Export report to CSV

### Users (Superadmin only)
- `GET /api/users` - Get all users
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

## Default Credentials

```
Email: superadmin@iware.id
Password: jasad666
```

⚠️ **PENTING**: Ganti password default setelah login pertama kali!

## Integrasi Accurate Online

Untuk mengintegrasikan dengan Accurate Online:

1. Dapatkan Access Token dari Accurate Online
2. Dapatkan Database ID
3. Update di file `.env`:
```
ACCURATE_ACCESS_TOKEN=your_token_here
ACCURATE_DATABASE_ID=your_db_id_here
```

## Struktur Folder

```
backend/
├── config/           # Konfigurasi database
├── controllers/      # Business logic
├── middleware/       # Middleware (auth, error handling)
├── routes/          # API routes
├── services/        # External services (Accurate API)
├── .env.example     # Environment template
├── server.js        # Entry point
└── package.json
```
