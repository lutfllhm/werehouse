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
    <div className="min-h-screen bg-[#0a0e27] p-4">
      {/* Header dengan Logo dan Waktu */}
      <div className="mb-6 flex items-center justify-between px-6 py-4 bg-[#1a1f3a] rounded-lg border border-[#2a3f5f]">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-[#2a3f5f] hover:bg-[#3a4f6f] rounded-lg transition-colors border border-[#4a5f7f] flex items-center gap-2"
            title="Kembali ke Dashboard"
          >
            <FiArrowLeft className="w-5 h-5 text-yellow-400" />
            <span className="led-text-yellow text-sm font-medium">BACK</span>
          </button>
          <div className="text-3xl font-bold led-text-yellow">
            PRODUCTION SCHEDULE
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-4xl font-bold led-text-yellow tabular-nums">
              {formatTime(currentTime)}
            </div>
            <div className="text-sm led-text-white opacity-70">
              {currentTime.toLocaleDateString('id-ID', { 
                weekday: 'short',
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              })}
            </div>
          </div>
          <button 
            onClick={loadSchedule}
            className="px-4 py-2 bg-[#2a3f5f] hover:bg-[#3a4f6f] rounded-lg transition-colors border border-[#4a5f7f]"
            title="Refresh Data"
          >
            <FiRefreshCw className="w-5 h-5 text-yellow-400" />
          </button>
        </div>
      </div>

      {/* LED Display Board */}
      <div className="led-board rounded-lg overflow-hidden shadow-2xl border-8 border-[#1a1f3a]">
        {/* Header Row */}
        <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-[#0d1129] border-b-2 border-[#2a3f5f]">
          <div className="col-span-2 led-text-yellow text-lg font-bold">NOMOR SO</div>
          <div className="col-span-2 led-text-yellow text-lg font-bold">TANGGAL</div>
          <div className="col-span-3 led-text-yellow text-lg font-bold">PELANGGAN</div>
          <div className="col-span-3 led-text-yellow text-lg font-bold">KETERANGAN</div>
          <div className="col-span-2 led-text-yellow text-lg font-bold text-center">STATUS</div>
        </div>

        {/* Data Rows */}
        <div className="max-h-[calc(100vh-250px)] overflow-y-auto led-scrollbar">
          {salesOrders.map((so, index) => (
            <motion.div
              key={so.id}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
              className="grid grid-cols-12 gap-4 px-6 py-5 border-b border-[#1a2f4f] hover:bg-[#0d1129] transition-colors"
            >
              {/* Nomor SO */}
              <div className="col-span-2">
                <div className="led-text-white text-xl font-bold tracking-wider">
                  {so.nomor_so}
                </div>
              </div>

              {/* Tanggal */}
              <div className="col-span-2">
                <div className="led-text-yellow text-lg font-mono tabular-nums">
                  {new Date(so.tanggal_so).toLocaleDateString('id-ID', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  })}
                </div>
              </div>

              {/* Pelanggan */}
              <div className="col-span-3">
                <div className="led-text-white text-lg font-medium">
                  {so.nama_pelanggan}
                </div>
              </div>

              {/* Keterangan */}
              <div className="col-span-3">
                <div className="led-text-white text-base opacity-80">
                  {so.keterangan || '-'}
                </div>
              </div>

              {/* Status */}
              <div className="col-span-2 text-center">
                <div className={`${getStatusColor(so.status)} text-lg font-bold tracking-wider led-glow inline-block px-3 py-1 rounded`}>
                  {getStatusCode(so.status)}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer Legend */}
      <div className="mt-6 px-6 py-4 bg-[#1a1f3a] rounded-lg border border-[#2a3f5f]">
        <div className="flex items-center justify-center gap-12">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-green-400 led-glow-green"></div>
            <span className="led-text-white text-sm">DONE - Terproses</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-yellow-400 led-glow-yellow"></div>
            <span className="led-text-white text-sm">PROG - Sebagian Terproses</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-red-400 led-glow-red"></div>
            <span className="led-text-white text-sm">WAIT - Menunggu Proses</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchedulePage;
