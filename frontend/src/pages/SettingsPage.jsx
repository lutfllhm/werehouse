import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiLock, FiSave, FiLink, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { getAccurateAuthUrl, checkAccurateStatus, disconnectAccurate } from '../utils/accurate';

const SettingsPage = () => {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    nama: user?.nama || '',
    email: user?.email || '',
    password_lama: '',
    password_baru: '',
    password_konfirmasi: ''
  });
  const [loading, setLoading] = useState(false);
  const [accurateStatus, setAccurateStatus] = useState({
    connected: false,
    loading: true
  });

  // Check Accurate connection status on mount
  useEffect(() => {
    checkStatus();
    
    // Check for OAuth callback success
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('accurate') === 'connected') {
      toast.success('Berhasil terhubung dengan Accurate Online!');
      // Remove query param
      window.history.replaceState({}, '', '/settings');
      checkStatus();
    }
  }, []);

  const checkStatus = async () => {
    try {
      const result = await checkAccurateStatus();
      setAccurateStatus({
        connected: result.connected,
        loading: false,
        data: result.data,
        tokenInfo: result.tokenInfo
      });
    } catch (error) {
      setAccurateStatus({
        connected: false,
        loading: false
      });
    }
  };

  const handleConnectAccurate = async () => {
    try {
      const result = await getAccurateAuthUrl();
      if (result.success && result.authUrl) {
        // Redirect to Accurate OAuth page
        window.location.href = result.authUrl;
      } else {
        toast.error('Gagal mendapatkan authorization URL');
      }
    } catch (error) {
      toast.error('Gagal menghubungkan ke Accurate');
      console.error(error);
    }
  };

  const handleDisconnectAccurate = async () => {
    if (!window.confirm('Apakah Anda yakin ingin memutuskan koneksi dengan Accurate Online?')) {
      return;
    }

    try {
      const result = await disconnectAccurate();
      if (result.success) {
        toast.success('Berhasil memutuskan koneksi dengan Accurate');
        checkStatus();
      } else {
        toast.error(result.message || 'Gagal memutuskan koneksi');
      }
    } catch (error) {
      toast.error('Gagal memutuskan koneksi');
      console.error(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password_baru && formData.password_baru !== formData.password_konfirmasi) {
      toast.error('Password baru dan konfirmasi tidak cocok');
      return;
    }

    setLoading(true);
    const updateData = {
      nama: formData.nama,
      email: formData.email
    };

    if (formData.password_baru) {
      updateData.password_lama = formData.password_lama;
      updateData.password_baru = formData.password_baru;
    }

    const result = await updateProfile(updateData);
    setLoading(false);

    if (result.sukses) {
      toast.success('Profile berhasil diupdate');
      setFormData({ ...formData, password_lama: '', password_baru: '', password_konfirmasi: '' });
    } else {
      toast.error(result.pesan);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Pengaturan</h1>
        <p className="text-gray-600 mt-1">Kelola profile dan pengaturan akun Anda</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Info */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="card">
          <div className="text-center">
            <div className="w-24 h-24 bg-primary-600 rounded-full flex items-center justify-center text-white text-4xl font-bold mx-auto mb-4">
              {user?.nama?.charAt(0).toUpperCase()}
            </div>
            <h3 className="text-xl font-bold text-gray-900">{user?.nama}</h3>
            <p className="text-gray-600">{user?.email}</p>
            <span className="inline-block mt-2 px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-medium capitalize">
              {user?.role}
            </span>
          </div>
        </motion.div>

        {/* Settings Form */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2 space-y-6">
          {/* Accurate Integration Section */}
          {user?.role === 'superadmin' && (
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <FiLink className="text-primary-600" />
                <h3 className="text-lg font-bold text-gray-900">Integrasi Accurate Online</h3>
              </div>
              
              {accurateStatus.loading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                  <p className="text-gray-600 mt-2">Mengecek status koneksi...</p>
                </div>
              ) : accurateStatus.connected ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-green-600">
                    <FiCheckCircle className="text-xl" />
                    <span className="font-medium">Terhubung dengan Accurate Online</span>
                  </div>
                  
                  {accurateStatus.tokenInfo && (
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Scope:</span>
                        <span className="text-gray-900 font-medium">{accurateStatus.tokenInfo.scope || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Expires:</span>
                        <span className="text-gray-900 font-medium">
                          {accurateStatus.tokenInfo.expiresAt 
                            ? new Date(accurateStatus.tokenInfo.expiresAt).toLocaleString('id-ID')
                            : 'N/A'}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  <button
                    onClick={handleDisconnectAccurate}
                    className="btn-secondary w-full"
                  >
                    Putuskan Koneksi
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <FiXCircle className="text-xl" />
                    <span>Belum terhubung dengan Accurate Online</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Hubungkan aplikasi dengan Accurate Online untuk sinkronisasi data items dan sales orders.
                  </p>
                  <button
                    onClick={handleConnectAccurate}
                    className="btn-primary w-full flex items-center justify-center gap-2"
                  >
                    <FiLink />
                    Hubungkan Accurate
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Profile & Password Form */}
          <div className="card">
            <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Section */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <FiUser className="text-primary-600" />
                <h3 className="text-lg font-bold text-gray-900">Informasi Profile</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
                  <input
                    type="text"
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Password Section */}
            <div className="border-t pt-6">
              <div className="flex items-center gap-2 mb-4">
                <FiLock className="text-primary-600" />
                <h3 className="text-lg font-bold text-gray-900">Ubah Password</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password Lama</label>
                  <input
                    type="password"
                    value={formData.password_lama}
                    onChange={(e) => setFormData({ ...formData, password_lama: e.target.value })}
                    className="input-field"
                    placeholder="Kosongkan jika tidak ingin mengubah password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password Baru</label>
                  <input
                    type="password"
                    value={formData.password_baru}
                    onChange={(e) => setFormData({ ...formData, password_baru: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Password Baru</label>
                  <input
                    type="password"
                    value={formData.password_konfirmasi}
                    onChange={(e) => setFormData({ ...formData, password_konfirmasi: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
                <FiSave />
                {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SettingsPage;
