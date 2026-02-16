import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPackage, FiShoppingCart, FiTrendingUp, FiRefreshCw } from 'react-icons/fi';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import api from '../utils/api';
import { formatRupiah, formatAngka, formatTanggal } from '../utils/helpers';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { toast } from 'react-toastify';
import useDocumentTitle from '../hooks/useDocumentTitle';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const DashboardPage = () => {
  useDocumentTitle('Dashboard');
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const response = await api.get('/dashboard/stats');
      setStats(response.data.data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast.error('Gagal memuat data dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
    toast.success('Data berhasil diperbarui');
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  // Chart data untuk Sales Orders
  const soChartData = {
    labels: stats?.charts?.salesOrders?.map(item => item.label) || [],
    datasets: [
      {
        label: 'Total Sales Orders',
        data: stats?.charts?.salesOrders?.map(item => item.jumlah) || [],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  // Chart data untuk Items berdasarkan kategori
  const itemChartData = {
    labels: stats?.charts?.items?.map(item => item.kategori) || [],
    datasets: [
      {
        label: 'Jumlah Items',
        data: stats?.charts?.items?.map(item => item.jumlah) || [],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(236, 72, 153, 0.8)',
        ]
      }
    ]
  };

  // Status SO Doughnut Chart
  const statusChartData = {
    labels: ['Terproses', 'Sebagian Terproses', 'Menunggu Proses'],
    datasets: [
      {
        data: [
          stats?.salesOrders?.terproses || 0,
          stats?.salesOrders?.sebagian_terproses || 0,
          stats?.salesOrders?.menunggu_proses || 0
        ],
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)'
        ],
        borderWidth: 2,
        borderColor: '#fff'
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Ringkasan data warehouse monitoring</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="btn-primary flex items-center gap-2"
        >
          <FiRefreshCw className={refreshing ? 'animate-spin' : ''} />
          Refresh Data
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Items</p>
              <h3 className="text-3xl font-bold mt-2">{formatAngka(stats?.items?.total_items)}</h3>
            </div>
            <div className="w-14 h-14 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
              <FiPackage className="text-3xl" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card bg-gradient-to-br from-green-500 to-green-600 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Total Stok</p>
              <h3 className="text-3xl font-bold mt-2">{formatAngka(stats?.items?.total_stok)}</h3>
            </div>
            <div className="w-14 h-14 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
              <FiTrendingUp className="text-3xl" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Total Sales Orders</p>
              <h3 className="text-3xl font-bold mt-2">{formatAngka(stats?.salesOrders?.total_so)}</h3>
            </div>
            <div className="w-14 h-14 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
              <FiShoppingCart className="text-3xl" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card bg-gradient-to-br from-orange-500 to-orange-600 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Total Nilai SO</p>
              <h3 className="text-2xl font-bold mt-2">{formatRupiah(stats?.salesOrders?.total_nilai)}</h3>
            </div>
            <div className="w-14 h-14 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
              <FiTrendingUp className="text-3xl" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Orders Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-4">Trend Sales Orders (6 Bulan Terakhir)</h3>
          <div className="h-80">
            <Line data={soChartData} options={chartOptions} />
          </div>
        </motion.div>

        {/* Status SO Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-4">Status Sales Orders</h3>
          <div className="h-80">
            <Doughnut data={statusChartData} options={chartOptions} />
          </div>
        </motion.div>
      </div>

      {/* Items by Category Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="card"
      >
        <h3 className="text-xl font-bold text-gray-900 mb-4">Items Berdasarkan Kategori</h3>
        <div className="h-80">
          <Bar data={itemChartData} options={chartOptions} />
        </div>
      </motion.div>

      {/* Recent Activities */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="card"
      >
        <h3 className="text-xl font-bold text-gray-900 mb-4">Aktivitas Terbaru</h3>
        <div className="space-y-3">
          {stats?.recentActivities?.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-primary-600 rounded-full mt-2"></div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{activity.aktivitas}</p>
                <p className="text-sm text-gray-600">{activity.deskripsi}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {activity.user_nama} • {formatTanggal(activity.created_at, 'dd MMM yyyy HH:mm')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardPage;
