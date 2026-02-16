import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiRefreshCw, FiSearch, FiPackage } from 'react-icons/fi';
import api from '../utils/api';
import { formatRupiah, formatAngka, formatTanggal, debounce } from '../utils/helpers';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { toast } from 'react-toastify';
import useDocumentTitle from '../hooks/useDocumentTitle';

const ItemsPage = () => {
  useDocumentTitle('Items');
  
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 20 });

  useEffect(() => {
    loadItems();
  }, [pagination.page, search]);

  const loadItems = async () => {
    try {
      setLoading(true);
      const response = await api.get('/items', {
        params: { page: pagination.page, limit: pagination.limit, search }
      });
      setItems(response.data.data);
      setPagination(prev => ({ ...prev, ...response.data.pagination }));
    } catch (error) {
      toast.error('Gagal memuat data items');
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await api.post('/items/sync');
      toast.success('Sinkronisasi berhasil');
      loadItems();
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

  if (loading && items.length === 0) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Items</h1>
          <p className="text-gray-600 mt-1">Data stok barang dan jasa dari Accurate Online</p>
        </div>
        <button onClick={handleSync} disabled={syncing} className="btn-primary flex items-center gap-2">
          <FiRefreshCw className={syncing ? 'animate-spin' : ''} />
          Sync dari Accurate
        </button>
      </div>

      <div className="card">
        <div className="mb-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cari item..."
              onChange={(e) => handleSearch(e.target.value)}
              className="input-field pl-10"
            />
          </div>
        </div>

        <div className="table-container">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kode</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Item</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategori</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stok</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Harga Jual</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Sync</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {items.map((item) => (
                <motion.tr
                  key={item.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.kode_item}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{item.nama_item}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.kategori || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{formatAngka(item.stok_tersedia)} {item.satuan}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{formatRupiah(item.harga_jual)}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{formatTanggal(item.last_sync, 'dd/MM/yyyy HH:mm')}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-600">
            Menampilkan {items.length} dari {pagination.total} items
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

export default ItemsPage;
