# 🏭 iWare - Warehouse Monitoring System

Sistem monitoring warehouse terintegrasi dengan Accurate Online untuk manajemen inventory dan sales order real-time.

## 🚀 Quick Start - Deployment ke VPS

**Ingin deploy ke VPS Hostinger?** 

👉 **[START_HERE.md](./START_HERE.md)** 👈

Atau pilih panduan sesuai kebutuhan:
- **[QUICK_DEPLOY.md](./QUICK_DEPLOY.md)** - Deploy cepat 3 langkah ⚡
- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Panduan lengkap 📖
- **[DEPLOYMENT_INDEX.md](./DEPLOYMENT_INDEX.md)** - Index semua dokumentasi 📚

---

## ✨ Features

- 📊 **Dashboard Real-time** - Monitor inventory dan sales
- 🔄 **Accurate Online Integration** - Sync otomatis dengan Accurate
- 📦 **Item Management** - Kelola produk dan stok
- 🛒 **Sales Order Tracking** - Track pesanan penjualan
- 📈 **Reports & Analytics** - Laporan lengkap
- 👥 **User Management** - Multi-user dengan role-based access
- 🔐 **Secure Authentication** - JWT-based auth
- 📱 **Responsive Design** - Mobile-friendly interface

---

## 🏗️ Tech Stack

### Backend
- Node.js + Express.js
- MySQL Database
- JWT Authentication
- Accurate Online API Integration

### Frontend
- React 18
- Vite
- TailwindCSS
- Chart.js
- React Router
- Axios

### Deployment
- PM2 Process Manager
- Nginx Reverse Proxy
- Let's Encrypt SSL
- Ubuntu/Debian VPS

---

## 📦 Project Structure

```
iware/
├── backend/                 # Backend API
│   ├── config/             # Database config
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Auth & error handling
│   ├── routes/             # API routes
│   ├── services/           # Business logic
│   ├── scripts/            # Utility scripts
│   └── server.js           # Entry point
│
├── frontend/               # Frontend React app
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React context
│   │   ├── utils/         # Utilities
│   │   └── main.jsx       # Entry point
│   └── dist/              # Production build
│
└── docs/                   # Documentation
    ├── START_HERE.md      # 👈 Start here for deployment
    ├── QUICK_DEPLOY.md
    ├── DEPLOYMENT_GUIDE.md
    └── ...
```

---

## 🚀 Deployment

### VPS Hostinger (Production)

**Quick Deploy:**
```bash
# 1. Setup VPS
ssh root@76.13.193.154
bash <(curl -s https://raw.githubusercontent.com/your-repo/vps-setup-commands.sh)

# 2. Deploy aplikasi
chmod +x deploy-to-vps.sh
./deploy-to-vps.sh
```

**Dokumentasi lengkap:** [START_HERE.md](./START_HERE.md)

### Local Development

**Backend:**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env dengan credentials Anda
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**Database:**
```bash
mysql -u root -p
CREATE DATABASE iware_warehouse;
USE iware_warehouse;
SOURCE backend/SETUP_LENGKAP.sql;
```

---

## 🔧 Configuration

### Environment Variables

Copy `.env.example` to `.env` dan configure:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=iware_warehouse

# JWT
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d

# Accurate Online API
ACCURATE_API_URL=https://public-api.accurate.id/api
ACCURATE_APP_KEY=your_app_key
ACCURATE_SIGNATURE_SECRET=your_signature_secret
ACCURATE_ACCESS_TOKEN=your_access_token
ACCURATE_DATABASE_ID=your_database_id

# CORS
CORS_ORIGIN=http://localhost:3000
```

### Accurate Online Setup

1. Login ke https://account.accurate.id/developer
2. Buat aplikasi baru atau gunakan yang ada
3. Copy App Key dan Signature Secret
4. Generate API Token
5. Dapatkan Database ID dari URL Accurate Online

**Panduan lengkap:** [backend/docs/ACCURATE_QUICK_START.md](./backend/docs/ACCURATE_QUICK_START.md)

---

## 📚 Documentation

### Deployment
- **[START_HERE.md](./START_HERE.md)** - Mulai di sini untuk deployment
- **[QUICK_DEPLOY.md](./QUICK_DEPLOY.md)** - Quick start 3 langkah
- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Panduan lengkap
- **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)** - Checklist deployment
- **[DEPLOYMENT_VISUAL_GUIDE.md](./DEPLOYMENT_VISUAL_GUIDE.md)** - Visual guides
- **[DEPLOYMENT_INDEX.md](./DEPLOYMENT_INDEX.md)** - Index dokumentasi

### Accurate API
- **[ACCURATE_API_IMPLEMENTATION.md](./ACCURATE_API_IMPLEMENTATION.md)** - Implementation guide
- **[backend/docs/ACCURATE_QUICK_START.md](./backend/docs/ACCURATE_QUICK_START.md)** - Quick start
- **[backend/docs/ACCURATE_API_TOKEN.md](./backend/docs/ACCURATE_API_TOKEN.md)** - Token management

### Backend
- **[backend/README.md](./backend/README.md)** - Backend documentation

### Frontend
- **[frontend/README.md](./frontend/README.md)** - Frontend documentation

---

## 🔐 Security

- JWT-based authentication
- Password hashing with bcrypt
- SQL injection prevention
- CORS configuration
- Input validation
- Security headers (Nginx)
- SSL/TLS encryption
- Firewall protection

---

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user

### Items
- `GET /api/items` - Get all items
- `GET /api/items/:id` - Get item by ID
- `POST /api/items/sync` - Sync from Accurate

### Sales Orders
- `GET /api/sales-orders` - Get all orders
- `GET /api/sales-orders/:id` - Get order by ID
- `POST /api/sales-orders/sync` - Sync from Accurate

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

### Accurate
- `GET /api/accurate/test` - Test API connection
- `POST /api/accurate/sync` - Manual sync

---

## 🛠️ Scripts

### Backend Scripts
```bash
npm run dev              # Development mode
npm start                # Production mode
npm run setup            # Setup database
npm run add-token        # Add Accurate token
npm run test-api-token   # Test Accurate API
```

### Frontend Scripts
```bash
npm run dev              # Development server
npm run build            # Production build
npm run preview          # Preview production build
```

### Deployment Scripts
```bash
./vps-setup-commands.sh  # Setup VPS (run on VPS)
./deploy-to-vps.sh       # Deploy from local (Linux/Mac)
./deploy-to-vps.ps1      # Deploy from local (Windows)
./check-deployment.sh    # Check deployment status (run on VPS)
```

---

## 🔄 Update & Maintenance

### Update Application
```bash
cd /var/www/iware
git pull origin main

# Update backend
cd backend
npm install --production
pm2 restart iware-backend

# Update frontend
cd ../frontend
npm install
npm run build
```

### Backup Database
```bash
mysqldump -u iware_user -p iware_warehouse > backup_$(date +%Y%m%d).sql
```

### View Logs
```bash
pm2 logs iware-backend
tail -f /var/log/nginx/iware-error.log
```

---

## 🐛 Troubleshooting

### Backend Issues
```bash
pm2 logs iware-backend
pm2 restart iware-backend
```

### Frontend Issues
```bash
cd frontend
npm run build
```

### Database Issues
```bash
systemctl status mysql
mysql -u iware_user -p
```

### Accurate API Issues
```bash
cd backend
npm run test-api-token
```

**Troubleshooting lengkap:** [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

---

## 📞 Support

### Documentation
- [Deployment Docs](./DEPLOYMENT_INDEX.md)
- [Accurate API Docs](./ACCURATE_API_IMPLEMENTATION.md)
- [Backend Docs](./backend/README.md)
- [Frontend Docs](./frontend/README.md)

### External Resources
- [Accurate Online](https://account.accurate.id)
- [Accurate API Documentation](https://accurate.id/api-docs)
- [Node.js Documentation](https://nodejs.org/docs)
- [React Documentation](https://react.dev)

---

## 📝 License

ISC

---

## 👥 Team

iWare Development Team

---

## 🎉 Ready to Deploy?

👉 **[START_HERE.md](./START_HERE.md)** 👈

**Tidak perlu pindah ke Gemini - semua sudah siap! 🚀**

---

Made with ❤️ for Warehouse Management
