const { pool } = require('../config/database');

// Report items
exports.getItemReport = async (req, res) => {
  try {
    const { bulan, tahun } = req.query;

    let query = 'SELECT * FROM items WHERE 1=1';
    const params = [];

    if (bulan && tahun) {
      query += ' AND MONTH(last_sync) = ? AND YEAR(last_sync) = ?';
      params.push(parseInt(bulan), parseInt(tahun));
    } else if (tahun) {
      query += ' AND YEAR(last_sync) = ?';
      params.push(parseInt(tahun));
    }

    query += ' ORDER BY last_sync DESC';

    const [items] = await pool.query(query, params);

    // Hitung total
    const totalStok = items.reduce((sum, item) => sum + parseFloat(item.stok_tersedia || 0), 0);
    const totalNilai = items.reduce((sum, item) => 
      sum + (parseFloat(item.harga_jual || 0) * parseFloat(item.stok_tersedia || 0)), 0
    );

    res.json({
      sukses: true,
      data: {
        items,
        summary: {
          total_items: items.length,
          total_stok: totalStok,
          total_nilai: totalNilai
        }
      }
    });
  } catch (error) {
    console.error('Error get item report:', error);
    res.status(500).json({
      sukses: false,
      pesan: 'Terjadi kesalahan saat mengambil report items'
    });
  }
};

// Report sales orders
exports.getSalesOrderReport = async (req, res) => {
  try {
    const { bulan, tahun, status } = req.query;

    let query = 'SELECT * FROM sales_orders WHERE 1=1';
    const params = [];

    if (bulan && tahun) {
      query += ' AND MONTH(tanggal_so) = ? AND YEAR(tanggal_so) = ?';
      params.push(parseInt(bulan), parseInt(tahun));
    } else if (tahun) {
      query += ' AND YEAR(tanggal_so) = ?';
      params.push(parseInt(tahun));
    }

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY tanggal_so DESC';

    const [salesOrders] = await pool.query(query, params);

    // Hitung total
    const totalNilai = salesOrders.reduce((sum, so) => sum + parseFloat(so.total_amount || 0), 0);
    const statusCount = {
      terproses: salesOrders.filter(so => so.status === 'Terproses').length,
      sebagian_terproses: salesOrders.filter(so => so.status === 'Sebagian Terproses').length,
      menunggu_proses: salesOrders.filter(so => so.status === 'Menunggu Proses').length
    };

    res.json({
      sukses: true,
      data: {
        salesOrders,
        summary: {
          total_so: salesOrders.length,
          total_nilai: totalNilai,
          status: statusCount
        }
      }
    });
  } catch (error) {
    console.error('Error get SO report:', error);
    res.status(500).json({
      sukses: false,
      pesan: 'Terjadi kesalahan saat mengambil report sales orders'
    });
  }
};

// Export report ke CSV format
exports.exportReport = async (req, res) => {
  try {
    const { type, bulan, tahun } = req.query;

    if (type === 'items') {
      let query = 'SELECT * FROM items WHERE 1=1';
      const params = [];

      if (bulan && tahun) {
        query += ' AND MONTH(last_sync) = ? AND YEAR(last_sync) = ?';
        params.push(parseInt(bulan), parseInt(tahun));
      }

      const [items] = await pool.query(query, params);

      // Format CSV
      let csv = 'ID,Kode Item,Nama Item,Kategori,Satuan,Stok Tersedia,Harga Jual,Harga Beli,Last Sync\n';
      items.forEach(item => {
        csv += `${item.id},"${item.kode_item}","${item.nama_item}","${item.kategori}","${item.satuan}",${item.stok_tersedia},${item.harga_jual},${item.harga_beli},"${item.last_sync}"\n`;
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=report_items_${Date.now()}.csv`);
      res.send(csv);

    } else if (type === 'sales_orders') {
      let query = 'SELECT * FROM sales_orders WHERE 1=1';
      const params = [];

      if (bulan && tahun) {
        query += ' AND MONTH(tanggal_so) = ? AND YEAR(tanggal_so) = ?';
        params.push(parseInt(bulan), parseInt(tahun));
      }

      const [salesOrders] = await pool.query(query, params);

      // Format CSV
      let csv = 'ID,Nomor SO,Tanggal,Pelanggan,Keterangan,Status,Total Amount,Last Sync\n';
      salesOrders.forEach(so => {
        csv += `${so.id},"${so.nomor_so}","${so.tanggal_so}","${so.nama_pelanggan}","${so.keterangan}","${so.status}",${so.total_amount},"${so.last_sync}"\n`;
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=report_sales_orders_${Date.now()}.csv`);
      res.send(csv);

    } else {
      res.status(400).json({
        sukses: false,
        pesan: 'Tipe report tidak valid'
      });
    }
  } catch (error) {
    console.error('Error export report:', error);
    res.status(500).json({
      sukses: false,
      pesan: 'Terjadi kesalahan saat export report'
    });
  }
};
