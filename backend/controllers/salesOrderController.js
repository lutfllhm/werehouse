const { pool } = require('../config/database');
const accurateService = require('../services/accurateService');

// Sinkronisasi sales orders dari Accurate Online
exports.syncSalesOrders = async (req, res) => {
  try {
    const userId = req.userData.userId;
    const result = await accurateService.getSalesOrders(userId, { pageSize: 500 });

    if (!result.sukses) {
      return res.status(500).json({
        sukses: false,
        pesan: 'Gagal mengambil data dari Accurate Online',
        error: result.pesan
      });
    }

    // Response dari Accurate biasanya dalam format { d: [...], sp: {...} }
    const salesOrders = result.data.d || result.data || [];
    let syncCount = 0;
    let errorCount = 0;

    for (const so of salesOrders) {
      try {
        // Tentukan status berdasarkan data dari Accurate
        let status = 'Menunggu Proses';
        
        // Mapping status dari Accurate ke status aplikasi
        if (so.transStatus === 'CLOSED' || so.status === 'CLOSED' || so.isClosed) {
          status = 'Terproses';
        } else if (so.transStatus === 'PARTIAL' || so.status === 'PARTIAL' || so.isPartial) {
          status = 'Sebagian Terproses';
        } else if (so.transStatus === 'OPEN' || so.status === 'OPEN' || so.isOpen) {
          status = 'Menunggu Proses';
        }

        // Mapping field dari Accurate API ke database lokal
        await pool.query(
          `INSERT INTO sales_orders (so_id, nomor_so, tanggal_so, nama_pelanggan, keterangan, status, total_amount)
           VALUES (?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
           nomor_so = VALUES(nomor_so),
           tanggal_so = VALUES(tanggal_so),
           nama_pelanggan = VALUES(nama_pelanggan),
           keterangan = VALUES(keterangan),
           status = VALUES(status),
           total_amount = VALUES(total_amount),
           last_sync = CURRENT_TIMESTAMP`,
          [
            so.id || so.salesOrderId || `so_${syncCount}`,
            so.number || so.transNumber || so.orderNumber || '',
            so.transDate || so.date || new Date(),
            so.customerName || so.customer || 'Unknown',
            so.description || so.memo || so.notes || '',
            status,
            so.amount || so.totalAmount || so.total || 0
          ]
        );
        syncCount++;
      } catch (soError) {
        console.error('Error sync SO:', soError.message);
        errorCount++;
      }
    }

    // Log aktivitas
    await pool.query(
      'INSERT INTO activity_logs (user_id, aktivitas, deskripsi) VALUES (?, ?, ?)',
      [req.userData.userId, 'Sync Sales Orders', `Berhasil sync ${syncCount} sales orders dari Accurate Online`]
    );

    res.json({
      sukses: true,
      pesan: `Berhasil sinkronisasi ${syncCount} sales orders${errorCount > 0 ? `, ${errorCount} gagal` : ''}`,
      data: { 
        total: syncCount,
        errors: errorCount,
        totalData: salesOrders.length
      }
    });
  } catch (error) {
    console.error('Error sync sales orders:', error);
    res.status(500).json({
      sukses: false,
      pesan: 'Terjadi kesalahan saat sinkronisasi sales orders',
      error: error.message
    });
  }
};

// Ambil semua sales orders
exports.getAllSalesOrders = async (req, res) => {
  try {
    const { page = 1, limit = 50, search = '', status = '' } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM sales_orders WHERE 1=1';
    let countQuery = 'SELECT COUNT(*) as total FROM sales_orders WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (nomor_so LIKE ? OR nama_pelanggan LIKE ?)';
      countQuery += ' AND (nomor_so LIKE ? OR nama_pelanggan LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (status) {
      query += ' AND status = ?';
      countQuery += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY tanggal_so DESC LIMIT ? OFFSET ?';
    const queryParams = [...params, parseInt(limit), parseInt(offset)];

    const [salesOrders] = await pool.query(query, queryParams);
    const [countResult] = await pool.query(countQuery, params);

    res.json({
      sukses: true,
      data: salesOrders,
      pagination: {
        total: countResult[0].total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(countResult[0].total / limit)
      }
    });
  } catch (error) {
    console.error('Error get sales orders:', error);
    res.status(500).json({
      sukses: false,
      pesan: 'Terjadi kesalahan saat mengambil data sales orders'
    });
  }
};

// Ambil detail sales order
exports.getSalesOrderDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const [salesOrders] = await pool.query('SELECT * FROM sales_orders WHERE id = ?', [id]);

    if (salesOrders.length === 0) {
      return res.status(404).json({
        sukses: false,
        pesan: 'Sales order tidak ditemukan'
      });
    }

    res.json({
      sukses: true,
      data: salesOrders[0]
    });
  } catch (error) {
    console.error('Error get sales order detail:', error);
    res.status(500).json({
      sukses: false,
      pesan: 'Terjadi kesalahan saat mengambil detail sales order'
    });
  }
};

// Statistik sales orders untuk dashboard
exports.getSalesOrderStats = async (req, res) => {
  try {
    const [stats] = await pool.query(`
      SELECT 
        COUNT(*) as total_so,
        SUM(total_amount) as total_nilai,
        COUNT(CASE WHEN status = 'Terproses' THEN 1 END) as terproses,
        COUNT(CASE WHEN status = 'Sebagian Terproses' THEN 1 END) as sebagian_terproses,
        COUNT(CASE WHEN status = 'Menunggu Proses' THEN 1 END) as menunggu_proses
      FROM sales_orders
    `);

    // Data untuk chart berdasarkan bulan
    const [chartData] = await pool.query(`
      SELECT 
        DATE_FORMAT(tanggal_so, '%Y-%m') as bulan,
        COUNT(*) as jumlah,
        SUM(total_amount) as total
      FROM sales_orders
      WHERE tanggal_so >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(tanggal_so, '%Y-%m')
      ORDER BY bulan ASC
    `);

    res.json({
      sukses: true,
      data: {
        statistik: stats[0],
        chart: chartData
      }
    });
  } catch (error) {
    console.error('Error get sales order stats:', error);
    res.status(500).json({
      sukses: false,
      pesan: 'Terjadi kesalahan saat mengambil statistik sales orders'
    });
  }
};

// Update status sales order (manual)
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatus = ['Menunggu Proses', 'Sebagian Terproses', 'Terproses'];
    if (!validStatus.includes(status)) {
      return res.status(400).json({
        sukses: false,
        pesan: 'Status tidak valid'
      });
    }

    await pool.query('UPDATE sales_orders SET status = ? WHERE id = ?', [status, id]);

    // Log aktivitas
    await pool.query(
      'INSERT INTO activity_logs (user_id, aktivitas, deskripsi) VALUES (?, ?, ?)',
      [req.userData.userId, 'Update Status SO', `Update status SO ID ${id} menjadi ${status}`]
    );

    res.json({
      sukses: true,
      pesan: 'Status berhasil diupdate'
    });
  } catch (error) {
    console.error('Error update status:', error);
    res.status(500).json({
      sukses: false,
      pesan: 'Terjadi kesalahan saat update status'
    });
  }
};
