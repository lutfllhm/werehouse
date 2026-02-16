import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiRefreshCw, FiArrowLeft, FiClock, FiCalendar, FiPackage, FiCheckCircle, FiAlertCircle, FiLoader } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { formatTanggal } from '../utils/helpers';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { toast } from 'react-toastify';
import useDocumentTitle from '../hooks/useDocumentTitle';

const SchedulePage = () => {
  useDocumentTitle('Schedule');
  
  const [salesOrders, setSalesOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadSchedule();
    
    // Auto refresh setiap 30 detik
    const refreshInterval = setInterval(loadSchedule, 30000);
    
    // Update waktu setiap detik
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(refreshInterval);
      clearInterval(timeInterval);
    };
  }, []);

  const loadSchedule = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }
      const response = await api.get('/sales-orders', { params: { limit: 50 } });
      setSalesOrders(response.data.data);
      if (isManualRefresh) {
        toast.success('Data berhasil diperbarui!');
      }
    } catch (error) {
      toast.error('Gagal memuat data schedule');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('id-ID', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Terproses':
        return 'text-green-400';
      case 'Sebagian Terproses':
        return 'text-yellow-400';
      case 'Menunggu Proses':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusCode = (status) => {
    switch (status) {
      case 'Terproses':
        return 'DONE';
      case 'Sebagian Terproses':
        return 'PROG';
      case 'Menunggu Proses':
        return 'WAIT';
      default:
        return 'UNKN';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Terproses':
        return <FiCheckCircle className="w-5 h-5" />;
      case 'Sebagian Terproses':
        return <FiLoader className="w-5 h-5" />;
      case 'Menunggu Proses':
        return <FiAlertCircle className="w-5 h-5" />;
      default:
        return <FiPackage className="w-5 h-5" />;
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -50, scale: 0.9 },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            opacity: [0.03, 0.06, 0.03]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-blue-500 to-purple-500 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
            opacity: [0.03, 0.06, 0.03]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-cyan-500 to-blue-500 rounded-full blur-3xl"
        />
      </div>

      {/* Header dengan Logo dan Waktu */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex items-center justify-between px-8 py-6 bg-gradient-to-r from-slate-800/90 to-blue-900/90 backdrop-blur-xl rounded-2xl border border-blue-500/30 shadow-2xl relative z-10"
      >
        <div className="flex items-center gap-6">
          <motion.button
            onClick={() => navigate('/dashboard')}
            whileHover={{ scale: 1.05, x: -5 }}
            whileTap={{ scale: 0.95 }}
            className="group px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 rounded-xl transition-all duration-300 border border-blue-400/50 flex items-center gap-3 shadow-lg hover:shadow-blue-500/50"
            title="Kembali ke Dashboard"
          >
            <FiArrowLeft className="w-5 h-5 text-white group-hover:translate-x-[-4px] transition-transform" />
            <span className="text-white text-sm font-semibold tracking-wide">KEMBALI</span>
          </motion.button>
          <div className="flex items-center gap-4">
            <motion.div 
              animate={{ 
                scaleY: [1, 1.2, 1],
                boxShadow: [
                  "0 0 20px rgba(251, 191, 36, 0.5)",
                  "0 0 40px rgba(251, 191, 36, 0.8)",
                  "0 0 20px rgba(251, 191, 36, 0.5)"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-2 h-12 bg-gradient-to-b from-yellow-400 to-orange-500 rounded-full"
            />
            <div>
              <motion.div 
                animate={{ 
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
                }}
                transition={{ duration: 5, repeat: Infinity }}
                className="text-4xl font-black bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-500 bg-clip-text text-transparent tracking-tight"
                style={{ backgroundSize: "200% 200%" }}
              >
                JADWAL PRODUKSI
              </motion.div>
              <div className="text-sm text-blue-300 font-medium mt-1 flex items-center gap-2">
                <FiPackage className="w-4 h-4" />
                Production Schedule Board
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="text-right bg-slate-900/50 px-6 py-4 rounded-xl border border-blue-500/30 backdrop-blur-sm"
          >
            <div className="flex items-center gap-3 mb-2">
              <FiClock className="w-5 h-5 text-yellow-400" />
              <motion.div 
                animate={{ 
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
                }}
                transition={{ duration: 3, repeat: Infinity }}
                className="text-5xl font-black bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent tabular-nums tracking-tight"
                style={{ backgroundSize: "200% 200%" }}
              >
                {formatTime(currentTime)}
              </motion.div>
            </div>
            <div className="text-sm text-blue-300 font-medium tracking-wide flex items-center gap-2">
              <FiCalendar className="w-4 h-4" />
              {currentTime.toLocaleDateString('id-ID', { 
                weekday: 'long',
                day: '2-digit',
                month: 'long',
                year: 'numeric'
              })}
            </div>
          </motion.div>
          <motion.button 
            onClick={() => loadSchedule(true)}
            disabled={isRefreshing}
            whileHover={{ scale: 1.1, rotate: 180 }}
            whileTap={{ scale: 0.9 }}
            animate={isRefreshing ? { rotate: 360 } : {}}
            transition={isRefreshing ? { duration: 1, repeat: Infinity, ease: "linear" } : {}}
            className="group px-5 py-5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 rounded-xl transition-all duration-300 border border-green-400/50 shadow-lg hover:shadow-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Refresh Data"
          >
            <FiRefreshCw className="w-6 h-6 text-white" />
          </motion.button>
        </div>
      </motion.div>

      {/* LED Display Board */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-slate-800/95 to-blue-900/95 backdrop-blur-xl rounded-2xl overflow-hidden shadow-2xl border border-blue-500/30 relative z-10"
      >
        {/* Header Row */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-12 gap-6 px-8 py-5 bg-gradient-to-r from-slate-900/90 to-blue-950/90 border-b-2 border-blue-500/40"
        >
          <div className="col-span-2 text-yellow-400 text-base font-bold tracking-wide uppercase flex items-center gap-2">
            <FiPackage className="w-4 h-4" />
            No. SO
          </div>
          <div className="col-span-2 text-yellow-400 text-base font-bold tracking-wide uppercase flex items-center gap-2">
            <FiCalendar className="w-4 h-4" />
            Tanggal
          </div>
          <div className="col-span-3 text-yellow-400 text-base font-bold tracking-wide uppercase">Pelanggan</div>
          <div className="col-span-3 text-yellow-400 text-base font-bold tracking-wide uppercase">Keterangan</div>
          <div className="col-span-2 text-yellow-400 text-base font-bold tracking-wide uppercase text-center">Status</div>
        </motion.div>

        {/* Data Rows */}
        <div className="max-h-[calc(100vh-280px)] overflow-y-auto scrollbar-thin scrollbar-thumb-blue-600 scrollbar-track-slate-800">
          <AnimatePresence mode="wait">
            {salesOrders.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center justify-center py-20"
              >
                <div className="text-center">
                  <motion.div 
                    animate={{ 
                      rotate: [0, 10, -10, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-6xl mb-4"
                  >
                    📋
                  </motion.div>
                  <div className="text-xl text-slate-400 font-medium">Tidak ada data schedule</div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {salesOrders.map((so, index) => (
                  <motion.div
                    key={so.id}
                    variants={itemVariants}
                    whileHover={{ 
                      scale: 1.02,
                      transition: { type: "spring", stiffness: 300 }
                    }}
                    className="grid grid-cols-12 gap-6 px-8 py-6 border-b border-blue-900/30 hover:bg-gradient-to-r hover:from-blue-900/40 hover:to-slate-800/40 transition-all duration-300 group cursor-pointer relative overflow-hidden"
                  >
                    {/* Hover Effect Background */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-blue-500/0"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: "100%" }}
                      transition={{ duration: 0.6 }}
                    />

                    {/* Nomor SO */}
                    <div className="col-span-2 flex items-center relative z-10">
                      <motion.div 
                        whileHover={{ scale: 1.05 }}
                        className="bg-gradient-to-r from-blue-600/20 to-blue-700/20 px-4 py-2 rounded-lg border border-blue-500/30 group-hover:border-blue-400/50 group-hover:shadow-lg group-hover:shadow-blue-500/20 transition-all"
                      >
                        <div className="text-white text-lg font-bold tracking-wider">
                          {so.nomor_so}
                        </div>
                      </motion.div>
                    </div>

                    {/* Tanggal */}
                    <div className="col-span-2 flex items-center relative z-10">
                      <div className="flex items-center gap-2">
                        <FiCalendar className="w-4 h-4 text-yellow-400/70" />
                        <div className="text-yellow-400 text-base font-semibold tabular-nums">
                          {new Date(so.tanggal_so).toLocaleDateString('id-ID', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Pelanggan */}
                    <div className="col-span-3 flex items-center relative z-10">
                      <div className="text-white text-base font-medium truncate group-hover:text-blue-200 transition-colors">
                        {so.nama_pelanggan}
                      </div>
                    </div>

                    {/* Keterangan */}
                    <div className="col-span-3 flex items-center relative z-10">
                      <div className="text-slate-300 text-sm truncate group-hover:text-slate-200 transition-colors">
                        {so.keterangan || '-'}
                      </div>
                    </div>

                    {/* Status */}
                    <div className="col-span-2 flex items-center justify-center relative z-10">
                      <motion.div 
                        whileHover={{ 
                          scale: 1.15,
                          rotate: [0, -5, 5, 0]
                        }}
                        transition={{ duration: 0.3 }}
                        className={`${getStatusColor(so.status)} text-base font-black tracking-widest px-5 py-2 rounded-lg border-2 ${
                          so.status === 'Terproses' ? 'bg-green-500/20 border-green-400/50 shadow-lg shadow-green-500/30' :
                          so.status === 'Sebagian Terproses' ? 'bg-yellow-500/20 border-yellow-400/50 shadow-lg shadow-yellow-500/30' :
                          'bg-red-500/20 border-red-400/50 shadow-lg shadow-red-500/30'
                        } flex items-center gap-2`}
                      >
                        {getStatusIcon(so.status)}
                        {getStatusCode(so.status)}
                      </motion.div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Footer Legend */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-8 px-8 py-6 bg-gradient-to-r from-slate-800/90 to-blue-900/90 backdrop-blur-xl rounded-2xl border border-blue-500/30 shadow-2xl relative z-10"
      >
        <div className="flex items-center justify-center gap-16">
          <motion.div 
            whileHover={{ scale: 1.1, y: -5 }}
            className="flex items-center gap-4 group cursor-default"
          >
            <motion.div 
              animate={{ 
                boxShadow: [
                  "0 0 20px rgba(34, 197, 94, 0.5)",
                  "0 0 30px rgba(34, 197, 94, 0.8)",
                  "0 0 20px rgba(34, 197, 94, 0.5)"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-5 h-5 rounded-full bg-gradient-to-r from-green-400 to-emerald-400 group-hover:scale-125 transition-transform"
            />
            <span className="text-white text-base font-semibold tracking-wide flex items-center gap-2">
              <FiCheckCircle className="w-5 h-5 text-green-400" />
              DONE - Terproses
            </span>
          </motion.div>
          <motion.div 
            whileHover={{ scale: 1.1, y: -5 }}
            className="flex items-center gap-4 group cursor-default"
          >
            <motion.div 
              animate={{ 
                boxShadow: [
                  "0 0 20px rgba(251, 191, 36, 0.5)",
                  "0 0 30px rgba(251, 191, 36, 0.8)",
                  "0 0 20px rgba(251, 191, 36, 0.5)"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              className="w-5 h-5 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 group-hover:scale-125 transition-transform"
            />
            <span className="text-white text-base font-semibold tracking-wide flex items-center gap-2">
              <FiLoader className="w-5 h-5 text-yellow-400" />
              PROG - Sebagian Terproses
            </span>
          </motion.div>
          <motion.div 
            whileHover={{ scale: 1.1, y: -5 }}
            className="flex items-center gap-4 group cursor-default"
          >
            <motion.div 
              animate={{ 
                boxShadow: [
                  "0 0 20px rgba(239, 68, 68, 0.5)",
                  "0 0 30px rgba(239, 68, 68, 0.8)",
                  "0 0 20px rgba(239, 68, 68, 0.5)"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              className="w-5 h-5 rounded-full bg-gradient-to-r from-red-400 to-rose-400 group-hover:scale-125 transition-transform"
            />
            <span className="text-white text-base font-semibold tracking-wide flex items-center gap-2">
              <FiAlertCircle className="w-5 h-5 text-red-400" />
              WAIT - Menunggu Proses
            </span>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default SchedulePage;
