<<<<<<< HEAD
# iWare - Warehouse Monitoring & Schedule System

<div align="center">

![iWare Logo](https://via.placeholder.com/150x150/3b82f6/ffffff?text=iWare)

**Sistem Warehouse Monitoring & Schedule Profesional**

Terintegrasi dengan Accurate Online

[![Node.js](https://img.shields.io/badge/Node.js-v16+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.2-blue.svg)](https://reactjs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-5.7+-orange.svg)](https://www.mysql.com/)
[![License](https://img.shields.io/badge/License-ISC-yellow.svg)](LICENSE)

[Quick Start](QUICK_START.md) • [Installation](INSTALLATION.md) • [API Docs](API_DOCUMENTATION.md) • [Structure](PROJECT_STRUCTURE.md)

</div>

---

## 📋 Tentang Aplikasi

iWare adalah sistem monitoring dan penjadwalan gudang yang dirancang khusus untuk departemen Gudang agar memudahkan monitoring Sales Order (SO) dan stok barang/jasa. Aplikasi ini terintegrasi langsung dengan **Accurate Online** untuk sinkronisasi data real-time.

### 🎯 Tujuan

- Memudahkan monitoring SO (Sales Order) secara real-time
- Tracking stok barang dan jasa dari Accurate Online
- Visualisasi data dengan grafik interaktif
- Generate report dan export data
- Manajemen user dengan role-based access

## ✨ Fitur Utama

### 🏠 Homepage Profesional
- Landing page modern dengan informasi aplikasi
- Keunggulan dan fitur aplikasi
- Informasi tentang perusahaan iWare
- Responsive design

### 🔐 Authentication
- Login dengan email & password
- JWT-based authentication
- Role-based access (Superadmin & Admin)
- Secure password hashing

### 📊 Dashboard
- Statistik real-time (Items, Sales Orders)
- Grafik interaktif dengan Chart.js:
  - Trend Sales Orders (6 bulan terakhir)
  - Status Sales Orders (Doughnut Chart)
  - Items berdasarkan kategori (Bar Chart)
- Recent activities log
- Responsive cards dengan animasi

### 📦 Halaman Items
- Monitoring stok barang dan jasa
- Integrasi real-time dengan Accurate Online API
- Search & pagination
- Sync otomatis dari Accurate
- View only (tidak bisa edit/hapus)
- Informasi: Kode, Nama, Kategori, Stok, Harga

### 🛒 Halaman Sales Orders
- Monitoring sales order dari Accurate Online
- Real-time sync
- Filter berdasarkan status
- Search & pagination
- View only (tidak bisa edit/hapus)
- Tabel: Nomor, Tanggal, Pelanggan, Keterangan, Status, Total

### 📅 Halaman Schedule
- Daftar semua Sales Order
- **Running text** untuk semua SO
- Status visual dengan warna:
  - 🟢 **Hijau** = Terproses
  - 🟡 **Kuning** = Sebagian Terproses
  - 🔴 **Merah** = Menunggu Proses
- Tabel: Nomor, Tanggal, Pelanggan, Keterangan, Status

### 📈 Halaman Report
- Report Items dan Sales Orders
- Filter per bulan/tahun
- Summary statistics
- **Export ke CSV/Excel**
- Rekap data lengkap

### 👥 Manajemen User (Superadmin Only)
- Tambah admin baru
- Edit user
- Hapus user
- Kelola role dan status
- View user list

### ⚙️ Halaman Settings
- Update profile
- Ubah password
- User information

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MySQL** - Database
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Axios** - HTTP client untuk Accurate API

### Frontend
- **React.js 18** - UI library
- **Vite** - Build tool & dev server
- **TailwindCSS** - Modern CSS framework
- **Chart.js** - Interactive charts
- **Framer Motion** - Smooth animations
- **React Router** - Navigation
- **React Icons** - Icon library
- **React Toastify** - Notifications

### Integration
- **Accurate Online API** - Real-time data sync

## 🚀 Quick Start

### Prerequisites
- Node.js v16+
- MySQL 5.7+ / XAMPP / phpMyAdmin
- npm atau yarn

### Installation Cepat (5 Menit)

**📖 BACA PANDUAN LENGKAP:** [PANDUAN_LOGIN_SUKSES.md](PANDUAN_LOGIN_SUKSES.md)

1. **Setup Database**
   - Buka phpMyAdmin: `http://localhost/phpmyadmin`
   - Klik tab "SQL"
   - Copy semua isi file `backend/SETUP_LENGKAP.sql`
   - Paste dan klik "Go"

2. **Setup Backend**
```bash
cd backend
npm install
# Cek file .env sudah ada dan sesuai
node scripts/verifySetup.js  # Verifikasi setup
npm run dev
```

3. **Setup Frontend** (terminal baru)
```bash
cd frontend
npm install
npm run dev
```

4. **Akses aplikasi**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000

### Default Login
```
Email: superadmin@iware.id
Password: jasad666
```

⚠️ **PENTING:**
- Email harus LENGKAP: `superadmin@iware.id`
- Jika gagal login, baca: [PANDUAN_LOGIN_SUKSES.md](PANDUAN_LOGIN_SUKSES.md)
- Segera ubah password setelah login pertama!

## 📁 Struktur Project

```
iware-warehouse/
├── backend/              # Node.js/Express.js API
│   ├── config/          # Database configuration
│   ├── controllers/     # Business logic
│   ├── middleware/      # Auth & error handling
│   ├── routes/          # API routes
│   ├── services/        # Accurate API integration
│   └── scripts/         # Setup scripts
│
├── frontend/            # React.js Application
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── context/     # React Context (Auth)
│   │   ├── pages/       # Page components
│   │   └── utils/       # Helper functions
│   └── public/          # Static assets
│
└── docs/                # Documentation
```

## 📖 Dokumentasi

**📚 [INDEX DOKUMENTASI LENGKAP](INDEX_DOKUMENTASI.md)** - Panduan semua dokumentasi

### Quick Links
- **[🚀 MULAI DISINI](MULAI_DISINI.md)** - Quick start 5 menit
- **[✅ Checklist Setup](CHECKLIST_SETUP.md)** - Checklist lengkap
- **[🔧 Panduan Login Sukses](PANDUAN_LOGIN_SUKSES.md)** - Troubleshooting login
- **[🔐 Kredensial](KREDENSIAL.md)** - Kredensial & info penting

### Dokumentasi Detail
- **[Quick Start Guide](QUICK_START.md)** - Mulai dalam 5 menit
- **[Installation Guide](INSTALLATION.md)** - Panduan instalasi lengkap
- **[API Documentation](API_DOCUMENTATION.md)** - Dokumentasi API
- **[Project Structure](PROJECT_STRUCTURE.md)** - Struktur project detail
- **[Accurate Integration](ACCURATE_INTEGRATION.md)** - Panduan integrasi Accurate Online

### Dokumentasi Hosting VPS
- **[⚡ Quick Start VPS](QUICK_START_VPS.md)** - Deploy ke VPS dalam 30 menit
- **[📘 Panduan Lengkap Hosting](PANDUAN_HOSTING_VPS_HOSTINGER.md)** - Panduan detail hosting di VPS Hostinger
- **[🔧 Troubleshooting](TROUBLESHOOTING.md)** - Solusi masalah umum deployment

### Backend Scripts
```bash
npm run setup-interactive  # Setup database interaktif (RECOMMENDED)
npm run import-db         # Import database schema
npm run verify            # Verifikasi setup
npm run test-login        # Test login otomatis
npm run dev               # Jalankan server
```

## 🔧 Konfigurasi Accurate Online

1. Dapatkan Access Token dari Accurate Online
2. Dapatkan Database ID
3. Update di `backend/.env`:
```env
ACCURATE_API_URL=https://public-api.accurate.id/api
ACCURATE_ACCESS_TOKEN=your_token_here
ACCURATE_DATABASE_ID=your_db_id_here
```
4. Restart backend
5. Klik "Sync dari Accurate" di aplikasi

## 🎨 Fitur UI/UX

- ✅ Modern & Professional design
- ✅ Responsive (Mobile, Tablet, Desktop)
- ✅ Smooth animations dengan Framer Motion
- ✅ Interactive charts
- ✅ Loading states
- ✅ Toast notifications
- ✅ Color-coded status
- ✅ Running text untuk schedule
- ✅ Dark mode ready (struktur)

## 🔒 Security

- Password hashing dengan bcrypt
- JWT authentication
- Protected routes
- Role-based access control
- SQL injection prevention
- XSS protection
- CORS configuration
- Input validation

## 📊 Database Schema

- **users** - User accounts & roles
- **items** - Items cache dari Accurate
- **sales_orders** - Sales orders cache
- **activity_logs** - User activity tracking

## 🚀 Deployment ke VPS

### 🌟 Deployment ke VPS Hostinger (RECOMMENDED)

**⭐ PANDUAN LENGKAP KHUSUS HOSTINGER:**

Panduan lengkap untuk hosting ke VPS Hostinger dengan Accurate Token yang sudah ada!

**📘 Dokumentasi Utama:**
- **[PANDUAN_HOSTING_VPS_HOSTINGER_LENGKAP.md](PANDUAN_HOSTING_VPS_HOSTINGER_LENGKAP.md)** - Panduan ALL-IN-ONE (70 halaman)
  - ✅ Setup VPS dari NOL sampai ONLINE (45-60 menit)
  - ✅ Konfigurasi Accurate Token (sudah ada token)
  - ✅ **CARA HAPUS APLIKASI LENGKAP**
  - ✅ Troubleshooting 12 masalah umum

**📜 Tools & Scripts:**
- **[deploy-vps-hostinger.sh](deploy-vps-hostinger.sh)** - Script deployment otomatis dengan menu (20-30 menit)
- **[uninstall-iware.sh](uninstall-iware.sh)** - Script hapus aplikasi dengan backup otomatis (5-10 menit)

**📋 Quick Reference:**
- **[QUICK_REFERENCE_HOSTINGER.md](QUICK_REFERENCE_HOSTINGER.md)** - Command & troubleshooting (bisa print)
- **[RINGKASAN_DEPLOYMENT_HOSTINGER.md](RINGKASAN_DEPLOYMENT_HOSTINGER.md)** - Ringkasan visual 1 halaman
- **[README_DEPLOYMENT_HOSTINGER.md](README_DEPLOYMENT_HOSTINGER.md)** - Index lengkap semua dokumentasi

**⚡ Quick Deploy dengan Script:**
```bash
# 1. Upload script ke VPS
scp deploy-vps-hostinger.sh root@IP_VPS:/root/

# 2. SSH ke VPS
ssh root@IP_VPS

# 3. Jalankan script
chmod +x deploy-vps-hostinger.sh
./deploy-vps-hostinger.sh

# 4. Pilih "7) Full Deployment"
# 5. Ikuti wizard
# 6. Selesai dalam 20-30 menit!
```

**🗑️ Hapus Aplikasi:**
```bash
# Otomatis dengan script (RECOMMENDED)
chmod +x uninstall-iware.sh
./uninstall-iware.sh

# Atau lihat panduan manual di PANDUAN_HOSTING_VPS_HOSTINGER_LENGKAP.md
```

**Keuntungan Deployment Hostinger:**
- ✅ Panduan khusus untuk VPS Hostinger
- ✅ Sudah termasuk konfigurasi Accurate Token
- ✅ Script otomatis untuk deploy & uninstall
- ✅ Dokumentasi lengkap 70+ halaman
- ✅ Quick reference untuk maintenance
- ✅ Cara hapus aplikasi yang aman

---

### 🐳 Deployment dengan Docker (Alternative)

**⭐ PANDUAN LENGKAP ALL-IN-ONE:**
- **[📘 PANDUAN LENGKAP HOSTING VPS](PANDUAN_LENGKAP_HOSTING_VPS.md)** - Panduan SATU FILE dari NOL sampai ONLINE! (30-45 menit)

Cara tercepat dan termudah untuk deploy aplikasi iWare!

**⚡ Quick Start:**
```bash
# 1. Install Docker di VPS
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# 2. Clone & Setup
git clone https://github.com/username/iware-app.git /opt/iware
cd /opt/iware
cp .env.docker .env
nano .env  # Edit konfigurasi

# 3. Deploy!
docker compose up -d

# 4. Setup Nginx + SSL (lihat panduan lengkap)
```

**📖 Panduan Docker Lainnya:**
- **[🐳 Panduan Docker Deployment](PANDUAN_DOCKER_DEPLOYMENT.md)** - Panduan detail Docker
- **[⚡ Docker Quick Start](DOCKER_QUICK_START.md)** - Quick start 10 menit
- Script helper: `./docker-deploy.sh`

**Keuntungan Docker:**
- ✅ Deploy dalam 30-45 menit (termasuk setup VPS)
- ✅ Tidak perlu install Node.js, MySQL, Nginx manual
- ✅ Konsisten di semua environment
- ✅ Mudah rollback dan update

---

### Hosting Manual ke VPS (Generic)

Jika tidak ingin menggunakan Docker atau Hostinger, tersedia panduan manual lengkap.

**⭐ MULAI DISINI:** [README_DEPLOYMENT.md](README_DEPLOYMENT.md)

**📖 Panduan Deployment Manual:**
- **[🚀 Panduan VPS dari NOL](PANDUAN_VPS_DARI_NOL.md)** - Panduan lengkap dari beli VPS sampai online!
- **[Panduan Lengkap VPS Hostinger](PANDUAN_HOSTING_VPS_HOSTINGER.md)** - Panduan detail step-by-step (±15 hal)
- **[Quick Start Deployment](QUICK_START_DEPLOYMENT.md)** - Checklist cepat deployment (±5 hal)
- **[Index Deployment](INDEX_DEPLOYMENT.md)** - Index semua dokumentasi deployment
- **[Deployment README](DEPLOYMENT_README.md)** - Overview semua file deployment
- **[Deployment Checklist](DEPLOYMENT_CHECKLIST.md)** - Checklist 12 fase (bisa diprint)
- **[Troubleshooting VPS](TROUBLESHOOTING_VPS.md)** - 13 problem umum dan solusinya
- **[Quick Reference VPS](QUICK_REFERENCE_VPS.md)** - Command reference card (bisa diprint)
- **[Arsitektur Deployment](ARSITEKTUR_DEPLOYMENT.md)** - Diagram arsitektur lengkap
- **[Deployment Summary](DEPLOYMENT_SUMMARY.md)** - Ringkasan semua file

**🛠️ Tools Deployment:**
- `deploy-to-vps.sh` - Script bash untuk Linux/Mac
- `deploy-to-vps.ps1` - Script PowerShell untuk Windows
- `nginx-iware.conf` - Template konfigurasi Nginx
- `backend/ecosystem.config.js` - Konfigurasi PM2

**⚡ Quick Deploy:**
```bash
# Windows PowerShell
.\deploy-to-vps.ps1

# Linux/Mac
chmod +x deploy-to-vps.sh
./deploy-to-vps.sh
```

**Fitur Deployment:**
- ✅ Support multiple apps di satu VPS
- ✅ Auto SSL dengan Let's Encrypt
- ✅ PM2 process manager
- ✅ Nginx reverse proxy
- ✅ Database migration tools
- ✅ Monitoring dan logging
- ✅ Backup automation
- ✅ Security best practices

**Total Dokumentasi:** 13 files (±80 KB, ±70 halaman)

## 🤝 Contributing

Project ini dibuat dengan struktur yang jelas dan teratur untuk memudahkan maintenance dan development.

## 📝 License

ISC License - Copyright (c) 2024 iWare

## 👨‍💻 Developer

Dibuat dengan ❤️ menggunakan best practices dan clean code.

Source code menggunakan **Bahasa Indonesia** untuk memudahkan maintenance oleh tim lokal.

## 📞 Support

- **Website**: [iware.id](https://iware.id)
- **Email**: info@iware.id

---

<div align="center">

=======
>>>>>>> 9b898c310c7268aa5b922f65ca03caad516a5375
**iWare Warehouse Monitoring System**
