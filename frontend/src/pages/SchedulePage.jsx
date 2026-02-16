import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiRefreshCw, FiArrowLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { formatTanggal } from '../utils/helpers';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { toast } from 'react-toastify';

const SchedulePage = () => {
  const [salesOrders, setSalesOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
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

  const loadSchedule = async () => {
    try {
      setLoading(true);
      const response = await api.get('/sales-orders', { params: { limit: 50 } });
      setSalesOrders(response.data.data);
    } catch (error) {
      toast.error('Gagal memuat data schedule');
    } finally {
      setLoading(false);
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

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      {/* Header dengan Logo dan Waktu */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex items-center justify-between px-8 py-6 bg-gradient-to-r from-slate-800/90 to-blue-900/90 backdrop-blur-sm rounded-2xl border border-blue-500/30 shadow-2xl"
      >
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="group px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 rounded-xl transition-all duration-300 border border-blue-400/50 flex items-center gap-3 shadow-lg hover:shadow-blue-500/50 hover:scale-105"
            title="Kembali ke Dashboard"
          >
            <FiArrowLeft className="w-5 h-5 text-white group-hover:translate-x-[-4px] transition-transform" />
            <span className="text-white text-sm font-semibold tracking-wide">KEMBALI</span>
          </button>
          <div className="flex items-center gap-4">
            <div className="w-2 h-12 bg-gradient-to-b from-yellow-400 to-orange-500 rounded-full shadow-lg shadow-yellow-500/50"></div>
            <div>
              <div className="text-4xl font-black bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-500 bg-clip-text text-transparent tracking-tight">
                JADWAL PRODUKSI
              </div>
              <div className="text-sm text-blue-300 font-medium mt-1">Production Schedule Board</div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-8">
          <div className="text-right bg-slate-900/50 px-6 py-4 rounded-xl border border-blue-500/30">
            <div className="text-5xl font-black bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent tabular-nums tracking-tight">
              {formatTime(currentTime)}
            </div>
            <div className="text-sm text-blue-300 font-medium mt-2 tracking-wide">
              {currentTime.toLocaleDateString('id-ID', { 
                weekday: 'long',
                day: '2-digit',
                month: 'long',
                year: 'numeric'
              })}
            </div>
          </div>
          <button 
            onClick={loadSchedule}
            className="group px-5 py-5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 rounded-xl transition-all duration-300 border border-green-400/50 shadow-lg hover:shadow-green-500/50 hover:scale-110 hover:rotate-180"
            title="Refresh Data"
          >
            <FiRefreshCw className="w-6 h-6 text-white transition-transform duration-300" />
          </button>
        </div>
      </motion.div>

      {/* LED Display Board */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-slate-800/95 to-blue-900/95 backdrop-blur-sm rounded-2xl overflow-hidden shadow-2xl border border-blue-500/30"
      >
        {/* Header Row */}
        <div className="grid grid-cols-12 gap-6 px-8 py-5 bg-gradient-to-r from-slate-900/90 to-blue-950/90 border-b-2 border-blue-500/40">
          <div className="col-span-2 text-yellow-400 text-base font-bold tracking-wide uppercase">No. SO</div>
          <div className="col-span-2 text-yellow-400 text-base font-bold tracking-wide uppercase">Tanggal</div>
          <div className="col-span-3 text-yellow-400 text-base font-bold tracking-wide uppercase">Pelanggan</div>
          <div className="col-span-3 text-yellow-400 text-base font-bold tracking-wide uppercase">Keterangan</div>
          <div className="col-span-2 text-yellow-400 text-base font-bold tracking-wide uppercase text-center">Status</div>
        </div>

        {/* Data Rows */}
        <div className="max-h-[calc(100vh-280px)] overflow-y-auto scrollbar-thin scrollbar-thumb-blue-600 scrollbar-track-slate-800">
          {salesOrders.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="text-6xl mb-4">📋</div>
                <div className="text-xl text-slate-400 font-medium">Tidak ada data schedule</div>
              </div>
            </div>
          ) : (
            salesOrders.map((so, index) => (
              <motion.div
                key={so.id}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.02 }}
                className="grid grid-cols-12 gap-6 px-8 py-6 border-b border-blue-900/30 hover:bg-gradient-to-r hover:from-blue-900/30 hover:to-slate-800/30 transition-all duration-300 group"
              >
                {/* Nomor SO */}
                <div className="col-span-2 flex items-center">
                  <div className="bg-gradient-to-r from-blue-600/20 to-blue-700/20 px-4 py-2 rounded-lg border border-blue-500/30 group-hover:border-blue-400/50 transition-colors">
                    <div className="text-white text-lg font-bold tracking-wider">
                      {so.nomor_so}
                    </div>
                  </div>
                </div>

                {/* Tanggal */}
                <div className="col-span-2 flex items-center">
                  <div className="text-yellow-400 text-base font-semibold tabular-nums">
                    {new Date(so.tanggal_so).toLocaleDateString('id-ID', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </div>
                </div>

                {/* Pelanggan */}
                <div className="col-span-3 flex items-center">
                  <div className="text-white text-base font-medium truncate">
                    {so.nama_pelanggan}
                  </div>
                </div>

                {/* Keterangan */}
                <div className="col-span-3 flex items-center">
                  <div className="text-slate-300 text-sm truncate">
                    {so.keterangan || '-'}
                  </div>
                </div>

                {/* Status */}
                <div className="col-span-2 flex items-center justify-center">
                  <div className={`${getStatusColor(so.status)} text-base font-black tracking-widest px-5 py-2 rounded-lg border-2 ${
                    so.status === 'Terproses' ? 'bg-green-500/20 border-green-400/50 shadow-lg shadow-green-500/30' :
                    so.status === 'Sebagian Terproses' ? 'bg-yellow-500/20 border-yellow-400/50 shadow-lg shadow-yellow-500/30' :
                    'bg-red-500/20 border-red-400/50 shadow-lg shadow-red-500/30'
                  } group-hover:scale-110 transition-transform duration-300`}>
                    {getStatusCode(so.status)}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>

      {/* Footer Legend */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-8 px-8 py-6 bg-gradient-to-r from-slate-800/90 to-blue-900/90 backdrop-blur-sm rounded-2xl border border-blue-500/30 shadow-2xl"
      >
        <div className="flex items-center justify-center gap-16">
          <div className="flex items-center gap-4 group cursor-default">
            <div className="w-5 h-5 rounded-full bg-gradient-to-r from-green-400 to-emerald-400 shadow-lg shadow-green-500/50 group-hover:scale-125 transition-transform"></div>
            <span className="text-white text-base font-semibold tracking-wide">DONE - Terproses</span>
          </div>
          <div className="flex items-center gap-4 group cursor-default">
            <div className="w-5 h-5 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 shadow-lg shadow-yellow-500/50 group-hover:scale-125 transition-transform"></div>
            <span className="text-white text-base font-semibold tracking-wide">PROG - Sebagian Terproses</span>
          </div>
          <div className="flex items-center gap-4 group cursor-default">
            <div className="w-5 h-5 rounded-full bg-gradient-to-r from-red-400 to-rose-400 shadow-lg shadow-red-500/50 group-hover:scale-125 transition-transform"></div>
            <span className="text-white text-base font-semibold tracking-wide">WAIT - Menunggu Proses</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SchedulePage;
