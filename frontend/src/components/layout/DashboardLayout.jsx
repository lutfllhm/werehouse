import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiHome,
  FiPackage,
  FiShoppingCart,
  FiCalendar,
  FiFileText,
  FiUsers,
  FiSettings,
  FiLogOut,
  FiMenu,
  FiX
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isSuperAdmin } = useAuth();

  const menuItems = [
    { path: '/dashboard', icon: FiHome, label: 'Dashboard' },
    { path: '/items', icon: FiPackage, label: 'Items' },
    { path: '/sales-orders', icon: FiShoppingCart, label: 'Sales Orders' },
    { path: '/schedule', icon: FiCalendar, label: 'Schedule' },
    { path: '/reports', icon: FiFileText, label: 'Report' },
    ...(isSuperAdmin ? [{ path: '/users', icon: FiUsers, label: 'Manajemen User' }] : []),
    { path: '/settings', icon: FiSettings, label: 'Pengaturan' }
  ];

  const handleLogout = () => {
    logout();
    toast.success('Berhasil logout');
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="w-64 bg-white shadow-xl fixed h-full z-30 lg:relative border-r border-gray-200"
          >
            <div className="flex flex-col h-full">
              {/* Logo */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center overflow-hidden shadow-lg">
                    <img src="/img/logo.png" alt="iware Logo" className="w-full h-full object-contain p-1.5" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">iware</h1>
                    <p className="text-xs text-gray-500 font-medium">Warehouse System</p>
                  </div>
                </div>
              </div>

              {/* Menu */}
              <nav className="flex-1 overflow-y-auto p-4">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  
                  return (
                    <motion.div
                      key={item.path}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Link
                        to={item.path}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-2 transition-all duration-200 ${
                          isActive
                            ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg shadow-primary-200'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <Icon className="text-xl" />
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    </motion.div>
                  );
                })}
              </nav>

              {/* User Info & Logout */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex items-center gap-3 mb-3 p-3 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                    {user?.nama?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{user?.nama}</p>
                    <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                  </div>
                </div>
                <motion.button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors duration-200 font-medium"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <FiLogOut />
                  <span>Logout</span>
                </motion.button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md shadow-sm z-20 border-b border-gray-200">
          <div className="flex items-center justify-between px-6 py-4">
            <motion.button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {sidebarOpen ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
            </motion.button>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">{user?.nama}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                {user?.nama?.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {children}
          </motion.div>
        </main>
      </div>

      {/* Overlay untuk mobile */}
      {sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default DashboardLayout;
