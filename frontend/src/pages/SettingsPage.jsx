import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiLock, FiSave } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

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
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2 card">
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
        </motion.div>
      </div>
    </div>
  );
};

export default SettingsPage;
