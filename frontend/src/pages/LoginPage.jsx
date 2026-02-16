import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff, FiPackage, FiPrinter } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/common/LoadingSpinner';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Email dan password harus diisi');
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.sukses) {
      toast.success('Login berhasil!');
      navigate('/dashboard');
    } else {
      toast.error(result.pesan);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Walking Printer Animation */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800">
        {/* Animated Background Shapes */}
        <motion.div
          className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Ground/Floor */}
        <div className="absolute bottom-32 left-0 right-0 h-1 bg-white/20"></div>
        
        {/* Illustration Content */}
        <div className="relative z-10 flex flex-col justify-center items-center p-12 text-white w-full">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="max-w-md text-center"
          >
            <motion.h1 
              className="text-5xl font-bold mb-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              iware
            </motion.h1>
            
            <motion.p 
              className="text-xl text-white/90 mb-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              Warehouse Monitoring System
            </motion.p>

            {/* Walking Printer Character */}
            <div className="relative w-full h-64 mb-8">
              <motion.div
                className="absolute"
                animate={{
                  x: ['-100%', '100%'],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "linear"
                }}
                style={{ left: '50%' }}
              >
                <div className="relative">
                  {/* Logo being carried */}
                  <motion.div
                    className="absolute -top-16 left-1/2 transform -translate-x-1/2 w-20 h-20 bg-white rounded-2xl shadow-2xl p-2 z-20"
                    animate={{
                      y: [0, -5, 0],
                      rotate: [-2, 2, -2]
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <img src="/img/logo.png" alt="iware Logo" className="w-full h-full object-contain" />
                  </motion.div>

                  {/* Printer Body */}
                  <div className="relative">
                    {/* Printer Head */}
                    <div className="relative bg-white/90 rounded-t-3xl w-32 h-24 mx-auto shadow-xl">
                      {/* Face */}
                      <div className="absolute top-6 left-1/2 transform -translate-x-1/2 flex gap-3">
                        {/* Eyes */}
                        <motion.div
                          className="w-3 h-3 bg-gray-800 rounded-full"
                          animate={{ scaleY: [1, 0.1, 1] }}
                          transition={{ duration: 3, repeat: Infinity }}
                        />
                        <motion.div
                          className="w-3 h-3 bg-gray-800 rounded-full"
                          animate={{ scaleY: [1, 0.1, 1] }}
                          transition={{ duration: 3, repeat: Infinity }}
                        />
                      </div>
                      {/* Smile */}
                      <div className="absolute top-12 left-1/2 transform -translate-x-1/2 w-8 h-3 border-b-2 border-gray-800 rounded-full"></div>
                      
                      {/* Printer Display */}
                      <div className="absolute top-3 right-3 w-4 h-3 bg-green-400 rounded-sm">
                        <motion.div
                          className="w-full h-full bg-green-500"
                          animate={{ opacity: [1, 0.3, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        />
                      </div>
                    </div>

                    {/* Printer Body */}
                    <div className="bg-white/80 rounded-b-2xl w-32 h-16 mx-auto shadow-lg relative">
                      {/* Paper slot */}
                      <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gray-700 rounded"></div>
                      
                      {/* Arms holding logo */}
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 flex gap-12">
                        <motion.div
                          className="w-1 h-12 bg-white/90 rounded-full origin-top"
                          animate={{ rotate: [-10, 10, -10] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        />
                        <motion.div
                          className="w-1 h-12 bg-white/90 rounded-full origin-top"
                          animate={{ rotate: [10, -10, 10] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        />
                      </div>
                    </div>

                    {/* Legs */}
                    <div className="flex justify-center gap-8 relative -mt-1">
                      {/* Left Leg */}
                      <motion.div
                        animate={{
                          rotate: [0, 20, 0, -20, 0],
                          y: [0, -2, 0, -2, 0]
                        }}
                        transition={{
                          duration: 0.8,
                          repeat: Infinity,
                          ease: "linear"
                        }}
                        className="origin-top"
                      >
                        <div className="w-3 h-12 bg-white/90 rounded-full"></div>
                        {/* Foot */}
                        <div className="w-6 h-3 bg-white/90 rounded-full -mt-1"></div>
                      </motion.div>

                      {/* Right Leg */}
                      <motion.div
                        animate={{
                          rotate: [0, -20, 0, 20, 0],
                          y: [0, -2, 0, -2, 0]
                        }}
                        transition={{
                          duration: 0.8,
                          repeat: Infinity,
                          ease: "linear"
                        }}
                        className="origin-top"
                      >
                        <div className="w-3 h-12 bg-white/90 rounded-full"></div>
                        {/* Foot */}
                        <div className="w-6 h-3 bg-white/90 rounded-full -mt-1"></div>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Walking dust clouds */}
              <motion.div
                className="absolute bottom-0 left-1/4"
                animate={{
                  scale: [0, 1.5, 0],
                  opacity: [0, 0.5, 0]
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  ease: "easeOut"
                }}
              >
                <div className="w-8 h-4 bg-white/30 rounded-full blur-sm"></div>
              </motion.div>
              <motion.div
                className="absolute bottom-0 right-1/4"
                animate={{
                  scale: [0, 1.5, 0],
                  opacity: [0, 0.5, 0]
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: 0.4,
                  ease: "easeOut"
                }}
              >
                <div className="w-8 h-4 bg-white/30 rounded-full blur-sm"></div>
              </motion.div>
            </div>
            
            <motion.p 
              className="text-white/80 leading-relaxed text-base px-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.6 }}
            >
              Solusi lengkap untuk monitoring dan penjadwalan gudang yang terintegrasi dengan Accurate Online.
            </motion.p>

            {/* Fun message */}
            <motion.p
              className="mt-6 text-white/60 text-sm italic"
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              "Delivering efficiency, one step at a time!"
            </motion.p>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
        {/* Decorative animated circles */}
        <motion.div
          className="absolute top-0 right-0 w-64 h-64 bg-primary-100 rounded-full blur-3xl opacity-30"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 30, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-0 left-0 w-64 h-64 bg-orange-100 rounded-full blur-3xl opacity-30"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -30, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md relative z-10"
        >
          {/* Mobile Logo with Animation */}
          <div className="lg:hidden text-center mb-8">
            <motion.div 
              className="w-20 h-20 bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl shadow-lg mb-4 mx-auto overflow-hidden p-3"
              animate={{ 
                rotate: [0, 5, -5, 0],
                scale: [1, 1.05, 1]
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <img src="/img/logo.png" alt="iware Logo" className="w-full h-full object-contain" />
            </motion.div>
            <motion.h1 
              className="text-3xl font-bold text-gray-900"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              iware
            </motion.h1>
            <motion.p 
              className="text-gray-600 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Warehouse Monitoring System
            </motion.p>
          </div>

          {/* Login Form with Animations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Selamat Datang</h2>
            <p className="text-gray-600 mb-8">Silakan login ke akun Anda</p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input with Animation */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative group">
                  <motion.div 
                    className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                    whileHover={{ scale: 1.1 }}
                  >
                    <FiMail className="text-gray-400 group-focus-within:text-primary-600 transition-colors" />
                  </motion.div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    placeholder="admin@iware.id"
                    disabled={loading}
                  />
                </div>
              </motion.div>

              {/* Password Input with Animation */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative group">
                  <motion.div 
                    className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                    whileHover={{ scale: 1.1 }}
                  >
                    <FiLock className="text-gray-400 group-focus-within:text-primary-600 transition-colors" />
                  </motion.div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    placeholder="••••••••"
                    disabled={loading}
                  />
                  <motion.button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    disabled={loading}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {showPassword ? (
                      <FiEyeOff className="text-gray-400 hover:text-gray-600 transition-colors" />
                    ) : (
                      <FiEye className="text-gray-400 hover:text-gray-600 transition-colors" />
                    )}
                  </motion.button>
                </div>
              </motion.div>

              {/* Submit Button with Animation */}
              <motion.button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
                whileHover={{ scale: loading ? 1 : 1.02, boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <LoadingSpinner size="sm" />
                    <span>Memproses...</span>
                  </div>
                ) : (
                  'Login'
                )}
                {/* Button shine effect */}
                {!loading && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{
                      x: ['-100%', '100%']
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 3
                    }}
                  />
                )}
              </motion.button>
            </form>

            {/* Back to Home with Animation */}
            <motion.div 
              className="mt-8 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              <Link to="/" className="text-sm text-primary-600 hover:text-primary-700 font-medium inline-flex items-center gap-1 group">
                <motion.span
                  animate={{ x: [0, -5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  ←
                </motion.span>
                <span className="group-hover:underline">Kembali ke Beranda</span>
              </Link>
            </motion.div>

            {/* Footer */}
            <motion.p 
              className="text-center text-gray-500 mt-8 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              &copy; 2026 iware. All rights reserved.
            </motion.p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
