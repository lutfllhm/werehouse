import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { FiPackage, FiTrendingUp, FiClock, FiShield, FiZap, FiUsers } from 'react-icons/fi';

const HomePage = () => {
  useDocumentTitle('Home');
  const [scrollY, setScrollY] = useState(0);
  const { scrollYProgress } = useScroll();
  
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: FiPackage,
      title: 'Monitoring Stok Real-time',
      description: 'Pantau stok barang dan jasa secara real-time terintegrasi dengan Accurate Online'
    },
    {
      icon: FiTrendingUp,
      title: 'Dashboard Analitik',
      description: 'Visualisasi data dengan grafik interaktif untuk pengambilan keputusan yang lebih baik'
    },
    {
      icon: FiClock,
      title: 'Schedule Management',
      description: 'Kelola jadwal sales order dengan sistem status visual yang mudah dipahami'
    },
    {
      icon: FiShield,
      title: 'Keamanan Terjamin',
      description: 'Sistem autentikasi dan otorisasi yang aman untuk melindungi data perusahaan'
    },
    {
      icon: FiZap,
      title: 'Performa Cepat',
      description: 'Akses data dengan cepat dan responsif untuk meningkatkan produktivitas'
    },
    {
      icon: FiUsers,
      title: 'Multi User Management',
      description: 'Kelola multiple admin dengan role dan permission yang berbeda'
    }
  ];

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Navbar with parallax effect */}
      <motion.nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrollY > 50 ? 'bg-white shadow-lg' : 'bg-white/90 backdrop-blur-sm'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <motion.div 
                className="w-10 h-10 rounded-lg overflow-hidden"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <img src="/img/logo.png" alt="iWare Logo" className="w-full h-full object-contain" />
              </motion.div>
              <div>
                <h1 className="text-xl font-bold text-primary-600">iware</h1>
                <p className="text-xs text-gray-500">Warehouse System</p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/login"
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all duration-300 font-medium shadow-md hover:shadow-lg"
                >
                  Login
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section with Parallax */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 pb-16">
        {/* Animated Background Particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white/10 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.2, 0.5, 0.2],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        {/* Parallax Background */}
        <motion.div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: 'url(/img/bg2.jpeg)',
            y: heroY
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/90 via-slate-800/85 to-gray-900/90"></div>
        
        {/* Hero Content */}
        <motion.div 
          className="relative z-10 container mx-auto px-6 text-center flex items-center justify-center min-h-[calc(100vh-6rem)]"
          style={{ opacity: heroOpacity }}
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-5xl mx-auto w-full"
          >
            <motion.div 
              className="mb-6"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <span className="inline-block px-6 py-2.5 bg-white/20 backdrop-blur-sm text-white text-sm font-medium rounded-full border border-white/30 whitespace-nowrap">
                Monitoring Warehouse Gudang iware
              </span>
            </motion.div>
            
            <motion.h1 
              className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              Sistem Monitoring SO
              <br />
              <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                Gudang iware
              </span>
            </motion.h1>
            
            <motion.p 
              className="text-xl md:text-2xl text-gray-200 mb-4 max-w-3xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              Sistem yang digunakan untuk monitoring dan penjadwalan gudang yang terintegrasi dengan Accurate Online.
            </motion.p>
            
            <motion.p 
              className="text-lg text-gray-300 mb-12 max-w-3xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              Efesiensi SO dan effesien dalam memonitoring.
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center mb-20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9 }}
            >
              <Link 
                to="/login" 
                className="px-8 py-4 bg-white text-primary-700 rounded-lg hover:bg-gray-100 hover:scale-105 transition-all font-semibold shadow-xl"
              >
                Mulai Sekarang
              </Link>
              <a
                href="#tentang"
                className="px-8 py-4 bg-transparent text-white rounded-lg border-2 border-white hover:bg-white hover:text-primary-700 transition-all font-semibold"
              >
                Tentang iware
              </a>
            </motion.div>
          </motion.div>
        </motion.div>
        
        {/* Scroll Indicator */}
        <motion.div 
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/70 rounded-full mt-2"></div>
          </div>
        </motion.div>
      </section>

      {/* Features Section with Parallax Cards */}
      <section className="py-32 bg-gradient-to-b from-white to-gray-50 relative">
        <div className="container mx-auto px-6">
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl font-bold text-gray-900 mb-4">Keunggulan Aplikasi</h2>
            <p className="text-xl text-gray-600">Fitur-fitur unggulan yang memudahkan pekerjaan Anda</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: 0.5, 
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 100
                  }}
                  viewport={{ once: true, margin: "-100px" }}
                  whileHover={{ 
                    y: -10,
                    transition: { duration: 0.3 }
                  }}
                  className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all group"
                  style={{
                    transform: `translateY(${scrollY * 0.05 * (index % 2 === 0 ? 1 : -1)}px)`
                  }}
                >
                  <motion.div 
                    className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Icon className="text-3xl text-white" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* About Section with Parallax */}
      <section id="tentang" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <motion.div 
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="text-center mb-12">
              <motion.h2 
                className="text-5xl font-bold text-gray-900 mb-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                Tentang iware
              </motion.h2>
              <motion.div 
                className="w-24 h-1 bg-gradient-to-r from-primary-600 to-primary-400 mx-auto rounded-full"
                initial={{ width: 0 }}
                whileInView={{ width: 96 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
              />
            </div>
            
            <motion.div 
              className="bg-gradient-to-br from-gray-50 to-white rounded-3xl p-10 shadow-xl border border-gray-100"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <p className="text-xl text-gray-700 mb-6 leading-relaxed">
                iware adalah perusahaan teknologi yang berfokus pada pengembangan solusi software untuk
                meningkatkan efisiensi bisnis. Kami berkomitmen untuk memberikan produk berkualitas tinggi
                yang membantu perusahaan dalam mengelola operasional mereka dengan lebih baik.
              </p>
              <p className="text-xl text-gray-700 mb-10 leading-relaxed">
                Dengan pengalaman bertahun-tahun dalam industri teknologi, kami memahami kebutuhan bisnis
                modern dan menyediakan solusi yang tepat untuk setiap tantangan.
              </p>
              <div className="text-center">
                <motion.a
                  href="https://iware.id"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-10 py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:shadow-2xl transition-all font-semibold text-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Kunjungi Website Kami
                </motion.a>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg overflow-hidden">
                  <img src="/img/logo.png" alt="iWare Logo" className="w-full h-full object-contain" />
                </div>
                <h3 className="text-xl font-bold">iware</h3>
              </div>
              <p className="text-gray-400 text-sm">
                Sistem Monitoring SO Pada Gudang iware.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-3">Kontak</h3>
              <p className="text-gray-400 text-sm mb-1">Email: info@iware.id</p>
              <p className="text-gray-400 text-sm">Website: iware.id</p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-3">Integrasi</h3>
              <p className="text-gray-400 text-sm mb-1">Accurate Online</p>
              <p className="text-gray-400 text-sm">Real-time Sync</p>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 text-center">
            <p className="text-gray-400 text-sm">&copy; 2026 iware. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
