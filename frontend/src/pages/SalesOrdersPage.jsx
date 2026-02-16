import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiRefreshCw, FiSearch } from 'react-icons/fi';
import api from '../utils/api';
import { formatRupiah, formatTanggal, getStatusColor, debounce } from '../utils/helpers';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { toast } from 'react-toastify';
import useDocumentTitle from '../hooks/useDocumentTitle';

const SalesOrdersPage = () => {
  useDocumentTitle('Sales Orders');
  
  const [salesOrders, setSalesOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 20 });

  useEffect(() => {
    loadSalesOrders();
  }, [pagination.page, search, statusFilter]);

  const loadSalesOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/sales-orders', {
        params: { page: pagination.page, limit: pagination.limit, search, status: statusFilter }
      });
      setSalesOrders(response.data.data);
      setPagination(prev => ({ ...prev, ...response.data.pagination }));
    } catch (error) {
      toast.error('Gagal memuat data sales orders');
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await api.post('/sales-orders/sync');
      toast.success('Sinkronisasi berhasil');
      loadSalesOrders();
    } catch (error) {
      toast.error('Sinkronisasi gagal');
    } finally {
      setSyncing(false);
    }
  };

  const handleSearch = debounce((value) => {
    setSearch(value);
    setPagination(prev => ({ ...prev, page: 1 }));
  }, 500);

  if (loading && salesOrders.length === 0) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sales Orders</h1>
          <p className="text-gray-600 mt-1">Data sales order dari Accurate Online</p>
        </div>
        <button onClick={handleSync} disabled={syncing} className="btn-primary flex items-center gap-2">
          <FiRefreshCw className={syncing ? 'animate-spin' : ''} />
          Sync dari Accurate
        </button>
      </div>

      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cari sales order..."
              onChange={(e) => handleSearch(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field"
          >
            <option value="">Semua Status</option>
            <option value="Terproses">Terproses</option>
            <option value="Sebagian Terproses">Sebagian Terproses</option>
            <option value="Menunggu Proses">Menunggu Proses</option>
          </select>
        </div>

        <div className="table-container">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nomor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pelanggan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Keterangan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {salesOrders.map((so) => (
                <motion.tr
                  key={so.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{so.nomor_so}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{formatTanggal(so.tanggal_so)}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{so.nama_pelanggan}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{so.keterangan || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`status-badge ${getStatusColor(so.status)}`}>
                      {so.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{formatRupiah(so.total_amount)}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-600">
            Menampilkan {salesOrders.length} dari {pagination.total} sales orders
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
              className="btn-secondary disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page >= pagination.totalPages}
              className="btn-secondary disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesOrdersPage;
