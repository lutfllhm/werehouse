import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiRefreshCw, FiArrowLeft, FiClock, FiCalendar, FiPackage, FiCheckCircle, FiAlertCircle, FiLoader } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { formatTanggal } from '../utils/helpers';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { toast } from 'react-toastify';

const SchedulePage = () => {
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
    <div className="min-h-screen bg-yellow-300 p-4 md:p-8 relative overflow-hidden">
      {/* Neo-Brutalism Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
        <div className="absolute top-0 left-0 w-full h-full" 
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, black 10px, black 11px)`,
          }}
        />
      </div>

      {/* Header dengan Logo dan Waktu - Asymmetric */}
      <motion.div 
        initial={{ opacity: 0, x: -50, rotate: -2 }}
        animate={{ opacity: 1, x: 0, rotate: 0 }}
        className="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 px-6 py-5 bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative z-10 -rotate-1"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 w-full md:w-auto">
          <motion.button
            onClick={() => navigate('/dashboard')}
            whileHover={{ scale: 1.05, rotate: -3 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-3 bg-black text-white font-black text-sm tracking-wider border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all flex items-center gap-2"
            title="Kembali ke Dashboard"
          >
            <FiArrowLeft className="w-5 h-5" />
            BACK
          </motion.button>
          
          <div className="flex items-center gap-3">
            <motion.div 
              animate={{ 
                scaleY: [1, 1.3, 1],
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-3 h-16 bg-black border-2 border-black"
            />
            <div>
              <motion.div 
                initial={{ x: -20 }}
                animate={{ x: 0 }}
                className="text-3xl md:text-5xl font-black text-black tracking-tighter uppercase"
                style={{ fontFamily: 'Arial Black, sans-serif' }}
              >
                JADWAL
              </motion.div>
              <div className="text-base md:text-lg font-bold text-black uppercase tracking-wide -mt-1">
                Produksi
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full md:w-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, rotate: 2 }}
            animate={{ opacity: 1, scale: 1, rotate: 2 }}
            transition={{ delay: 0.1 }}
            className="bg-cyan-400 px-5 py-4 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rotate-2"
          >
            <div className="flex items-center gap-3 mb-1">
              <FiClock className="w-5 h-5 text-black" />
              <motion.div 
                className="text-4xl md:text-5xl font-black text-black tabular-nums tracking-tighter"
                style={{ fontFamily: 'Arial Black, sans-serif' }}
              >
                {formatTime(currentTime)}
              </motion.div>
            </div>
            <div className="text-xs md:text-sm font-bold text-black uppercase tracking-wide flex items-center gap-2">
              <FiCalendar className="w-4 h-4" />
              {currentTime.toLocaleDateString('id-ID', { 
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              })}
            </div>
          </motion.div>

          <motion.button 
            onClick={() => loadSchedule(true)}
            disabled={isRefreshing}
            whileHover={{ scale: 1.1, rotate: -5 }}
            whileTap={{ scale: 0.9 }}
            animate={isRefreshing ? { rotate: 360 } : {}}
            transition={isRefreshing ? { duration: 1, repeat: Infinity, ease: "linear" } : {}}
            className="px-5 py-5 bg-lime-400 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all disabled:opacity-50 disabled:cursor-not-allowed -rotate-3"
            title="Refresh Data"
          >
            <FiRefreshCw className="w-6 h-6 text-black" />
          </motion.button>
        </div>
      </motion.div>

      {/* Neo-Brutalism Display Board */}
      <motion.div 
        initial={{ opacity: 0, y: 20, rotate: 1 }}
        animate={{ opacity: 1, y: 0, rotate: 1 }}
        transition={{ delay: 0.15 }}
        className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] overflow-hidden relative z-10 rotate-1"
      >
        {/* Header Row - Asymmetric */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="grid grid-cols-12 gap-3 md:gap-6 px-4 md:px-8 py-4 bg-black border-b-4 border-black"
        >
          <div className="col-span-2 text-yellow-300 text-xs md:text-base font-black tracking-wider uppercase flex items-center gap-2">
            <FiPackage className="w-4 h-4 hidden md:block" />
            <span className="hidden md:inline">NO. SO</span>
            <span className="md:hidden">SO</span>
          </div>
          <div className="col-span-2 text-cyan-300 text-xs md:text-base font-black tracking-wider uppercase flex items-center gap-2">
            <FiCalendar className="w-4 h-4 hidden md:block" />
            <span className="hidden md:inline">TANGGAL</span>
            <span className="md:hidden">TGL</span>
          </div>
          <div className="col-span-3 text-lime-300 text-xs md:text-base font-black tracking-wider uppercase">
            <span className="hidden md:inline">PELANGGAN</span>
            <span className="md:hidden">CUST</span>
          </div>
          <div className="col-span-3 text-pink-300 text-xs md:text-base font-black tracking-wider uppercase hidden md:block">KETERANGAN</div>
          <div className="col-span-2 text-orange-300 text-xs md:text-base font-black tracking-wider uppercase text-center">STATUS</div>
        </motion.div>

        {/* Data Rows - Neo-Brutalism Style */}
        <div className="max-h-[calc(100vh-280px)] overflow-y-auto scrollbar-thin scrollbar-thumb-black scrollbar-track-gray-200">
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
                  <div className="text-xl text-black font-black uppercase">Tidak ada data</div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {salesOrders.map((so, index) => {
                  // Asymmetric colors for each row
                  const rowColors = ['bg-yellow-100', 'bg-cyan-100', 'bg-lime-100', 'bg-pink-100', 'bg-orange-100'];
                  const bgColor = rowColors[index % rowColors.length];
                  
                  return (
                    <motion.div
                      key={so.id}
                      variants={itemVariants}
                      whileHover={{ 
                        scale: 1.01,
                        x: 5,
                        transition: { type: "spring", stiffness: 300 }
                      }}
                      className={`grid grid-cols-12 gap-3 md:gap-6 px-4 md:px-8 py-4 md:py-5 border-b-4 border-black ${bgColor} hover:bg-white transition-all duration-200 group cursor-pointer relative`}
                    >
                      {/* Nomor SO */}
                      <div className="col-span-2 flex items-center relative z-10">
                        <motion.div 
                          whileHover={{ scale: 1.05, rotate: -2 }}
                          className="bg-white px-3 py-2 border-3 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] group-hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] transition-all"
                        >
                          <div className="text-black text-sm md:text-lg font-black tracking-tight">
                            {so.nomor_so}
                          </div>
                        </motion.div>
                      </div>

                      {/* Tanggal */}
                      <div className="col-span-2 flex items-center relative z-10">
                        <div className="flex items-center gap-1 md:gap-2">
                          <FiCalendar className="w-3 h-3 md:w-4 md:h-4 text-black hidden md:block" />
                          <div className="text-black text-xs md:text-base font-bold tabular-nums">
                            {new Date(so.tanggal_so).toLocaleDateString('id-ID', {
                              day: '2-digit',
                              month: 'short',
                              year: '2-digit'
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Pelanggan */}
                      <div className="col-span-3 flex items-center relative z-10">
                        <div className="text-black text-xs md:text-base font-bold truncate uppercase">
                          {so.nama_pelanggan}
                        </div>
                      </div>

                      {/* Keterangan */}
                      <div className="col-span-3 flex items-center relative z-10 hidden md:flex">
                        <div className="text-black text-sm font-medium truncate">
                          {so.keterangan || '-'}
                        </div>
                      </div>

                      {/* Status - Neo-Brutalism Badge */}
                      <div className="col-span-2 flex items-center justify-center relative z-10">
                        <motion.div 
                          whileHover={{ 
                            scale: 1.1,
                            rotate: -3
                          }}
                          transition={{ duration: 0.2 }}
                          className={`text-xs md:text-base font-black tracking-wider px-3 md:px-4 py-2 border-3 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] ${
                            so.status === 'Terproses' ? 'bg-lime-400' :
                            so.status === 'Sebagian Terproses' ? 'bg-yellow-400' :
                            'bg-red-400'
                          } flex items-center gap-1 md:gap-2 uppercase`}
                        >
                          <span className="hidden md:inline">{getStatusIcon(so.status)}</span>
                          {getStatusCode(so.status)}
                        </motion.div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Footer Legend - Neo-Brutalism */}
      <motion.div 
        initial={{ opacity: 0, y: 20, rotate: -1 }}
        animate={{ opacity: 1, y: 0, rotate: -1 }}
        transition={{ delay: 0.2 }}
        className="mt-6 px-6 py-5 bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative z-10 -rotate-1"
      >
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
          <motion.div 
            whileHover={{ scale: 1.05, rotate: 2 }}
            className="flex items-center gap-3 group cursor-default bg-lime-400 px-4 py-3 border-3 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
          >
            <div className="w-6 h-6 bg-black border-2 border-black" />
            <span className="text-black text-sm md:text-base font-black tracking-wide flex items-center gap-2 uppercase">
              <FiCheckCircle className="w-5 h-5" />
              DONE
            </span>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.05, rotate: -2 }}
            className="flex items-center gap-3 group cursor-default bg-yellow-400 px-4 py-3 border-3 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
          >
            <div className="w-6 h-6 bg-black border-2 border-black" />
            <span className="text-black text-sm md:text-base font-black tracking-wide flex items-center gap-2 uppercase">
              <FiLoader className="w-5 h-5" />
              PROG
            </span>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.05, rotate: 2 }}
            className="flex items-center gap-3 group cursor-default bg-red-400 px-4 py-3 border-3 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
          >
            <div className="w-6 h-6 bg-black border-2 border-black" />
            <span className="text-black text-sm md:text-base font-black tracking-wide flex items-center gap-2 uppercase">
              <FiAlertCircle className="w-5 h-5" />
              WAIT
            </span>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default SchedulePage;
