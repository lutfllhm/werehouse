# iWare Frontend

Frontend aplikasi iWare Warehouse Monitoring System menggunakan React.js dan TailwindCSS.

## Teknologi

- React.js 18
- Vite (Build Tool)
- TailwindCSS
- React Router DOM
- Chart.js & React-Chartjs-2
- Axios
- Framer Motion (Animasi)
- React Icons
- React Toastify

## Instalasi

1. Install dependencies:
```bash
npm install
```

2. Konfigurasi:
File `vite.config.js` sudah dikonfigurasi untuk proxy ke backend di `http://localhost:5000`

3. Jalankan development server:
```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:3000`

## Build untuk Production

```bash
npm run build
```

File hasil build akan ada di folder `dist/`

## Struktur Folder

```
frontend/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable components
│   │   ├── common/      # Common components (Loading, etc)
│   │   └── layout/      # Layout components
│   ├── context/         # React Context (Auth)
│   ├── pages/           # Page components
│   ├── utils/           # Utility functions
│   ├── App.jsx          # Main App component
│   ├── main.jsx         # Entry point
│   └── index.css        # Global styles
├── index.html
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## Fitur

- ✅ Responsive Design
- ✅ Modern UI dengan TailwindCSS
- ✅ Animasi smooth dengan Framer Motion
- ✅ Chart interaktif dengan Chart.js
- ✅ Authentication & Authorization
- ✅ Real-time data sync
- ✅ Export report ke CSV
- ✅ Running text pada schedule
- ✅ Status visual dengan warna

## Halaman

1. **Homepage** - Landing page dengan informasi aplikasi
2. **Login** - Halaman autentikasi
3. **Dashboard** - Overview dengan grafik dan statistik
4. **Items** - Monitoring stok barang
5. **Sales Orders** - Monitoring sales order
6. **Schedule** - Jadwal SO dengan running text
7. **Report** - Generate dan export report
8. **Users** - Manajemen user (Superadmin only)
9. **Settings** - Pengaturan profile

## Default Login

```
Email: superadmin@iware.id
Password: jasad666
```

## Catatan

- Pastikan backend sudah berjalan di port 5000
- Untuk production, sesuaikan proxy di `vite.config.js`
- Semua API call menggunakan relative path `/api/*`
