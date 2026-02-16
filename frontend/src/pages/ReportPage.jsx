import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiDownload, FiFileText } from 'react-icons/fi';
import api from '../utils/api';
import { formatRupiah, formatAngka } from '../utils/helpers';
import { toast } from 'react-toastify';
import useDocumentTitle from '../hooks/useDocumentTitle';

const ReportPage = () => {
  useDocumentTitle('Reports');
  
  const [reportType, setReportType] = useState('sales_orders');
  const [bulan, setBulan] = useState('');
  const [tahun, setTahun] = useState(new Date().getFullYear());
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerateReport = async () => {
    setLoading(true);
    try {
      const endpoint = reportType === 'items' ? '/reports/items' : '/reports/sales-orders';
      const response = await api.get(endpoint, { params: { bulan, tahun } });
      setReportData(response.data.data);
      toast.success('Report berhasil dibuat');
    } catch (error) {
      toast.error('Gagal membuat report');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await api.get('/reports/export', {
        params: { type: reportType, bulan, tahun },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report_${reportType}_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Report berhasil didownload');
    } catch (error) {
      toast.error('Gagal download report');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Report</h1>
        <p className="text-gray-600 mt-1">Generate dan export report data</p>
      </div>

      <div className="card">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Filter Report</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select value={reportType} onChange={(e) => setReportType(e.target.value)} className="input-field">
            <option value="sales_orders">Sales Orders</option>
            <option value="items">Items</option>
          </select>
          <select value={bulan} onChange={(e) => setBulan(e.target.value)} className="input-field">
            <option value="">Semua Bulan</option>
            {[...Array(12)].map((_, i) => (
              <option key={i + 1} value={i + 1}>{new Date(2024, i).toLocaleString('id', { month: 'long' })}</option>
            ))}
          </select>
          <input
            type="number"
            value={tahun}
            onChange={(e) => setTahun(e.target.value)}
            className="input-field"
            placeholder="Tahun"
          />
          <button onClick={handleGenerateReport} disabled={loading} className="btn-primary">
            <FiFileText className="inline mr-2" />
            Generate Report
          </button>
        </div>
      </div>

      {reportData && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">Hasil Report</h3>
            <button onClick={handleExport} className="btn-primary">
              <FiDownload className="inline mr-2" />
              Export CSV
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {reportType === 'sales_orders' ? (
              <>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-600">Total SO</p>
                  <p className="text-2xl font-bold text-blue-900">{reportData.summary.total_so}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-600">Total Nilai</p>
                  <p className="text-2xl font-bold text-green-900">{formatRupiah(reportData.summary.total_nilai)}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-purple-600">Terproses</p>
                  <p className="text-2xl font-bold text-purple-900">{reportData.summary.status.terproses}</p>
                </div>
              </>
            ) : (
              <>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-600">Total Items</p>
                  <p className="text-2xl font-bold text-blue-900">{reportData.summary.total_items}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-600">Total Stok</p>
                  <p className="text-2xl font-bold text-green-900">{formatAngka(reportData.summary.total_stok)}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-purple-600">Total Nilai</p>
                  <p className="text-2xl font-bold text-purple-900">{formatRupiah(reportData.summary.total_nilai)}</p>
                </div>
              </>
            )}
          </div>

          <p className="text-sm text-gray-600">
            Total data: {reportType === 'sales_orders' ? reportData.salesOrders?.length : reportData.items?.length} records
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default ReportPage;
