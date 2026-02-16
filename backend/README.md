# iWare Backend API

Backend API untuk sistem Warehouse Monitoring & Schedule iWare.

## Teknologi

- Node.js
- Express.js
- MySQL
- JWT Authentication
- Accurate Online API Integration

## Instalasi

1. Install dependencies:
```bash
npm install
```

2. Setup database:
- Buat database MySQL
- Import file `config/database.sql`
- Atau jalankan query SQL di phpMyAdmin

3. Konfigurasi environment:
```bash
cp .env.example .env
```

Edit file `.env` dan sesuaikan dengan konfigurasi Anda.

4. Generate password untuk superadmin:
```bash
node -e "console.log(require('bcryptjs').hashSync('jasad666', 10))"
```

Copy hasil hash dan update di file `config/database.sql` pada bagian INSERT superadmin.

## Menjalankan Server

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
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
