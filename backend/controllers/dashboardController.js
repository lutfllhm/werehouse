const { pool } = require('../config/database');

// Dashboard statistik utama
exports.getDashboardStats = async (req, res) => {
  try {
    // Statistik items
    const [itemStats] = await pool.query(`
      SELECT 
        COUNT(*) as total_items,
        SUM(stok_tersedia) as total_stok
      FROM items
    `);

    // Statistik sales orders
    const [soStats] = await pool.query(`
      SELECT 
        COUNT(*) as total_so,
        SUM(total_amount) as total_nilai,
        COUNT(CASE WHEN status = 'Terproses' THEN 1 END) as terproses,
        COUNT(CASE WHEN status = 'Sebagian Terproses' THEN 1 END) as sebagian_terproses,
        COUNT(CASE WHEN status = 'Menunggu Proses' THEN 1 END) as menunggu_proses
      FROM sales_orders
    `);

    // Data chart SO per bulan (6 bulan terakhir)
    const [soChartData] = await pool.query(`
      SELECT 
        DATE_FORMAT(tanggal_so, '%Y-%m') as bulan,
        DATE_FORMAT(tanggal_so, '%b %Y') as label,
        COUNT(*) as jumlah,
        SUM(total_amount) as total
      FROM sales_orders
      WHERE tanggal_so >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(tanggal_so, '%Y-%m')
      ORDER BY bulan ASC
    `);

    // Data chart items berdasarkan kategori
    const [itemChartData] = await pool.query(`
      SELECT 
        COALESCE(kategori, 'Tanpa Kategori') as kategori,
        COUNT(*) as jumlah,
        SUM(stok_tersedia) as total_stok
      FROM items
      GROUP BY kategori
      ORDER BY jumlah DESC
      LIMIT 10
    `);

    // Aktivitas terbaru
    const [recentActivities] = await pool.query(`
      SELECT 
        al.id,
        al.aktivitas,
        al.deskripsi,
        al.created_at,
        u.nama as user_nama
      FROM activity_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ORDER BY al.created_at DESC
      LIMIT 10
    `);

    res.json({
      sukses: true,
      data: {
        items: itemStats[0],
        salesOrders: soStats[0],
        charts: {
          salesOrders: soChartData,
          items: itemChartData
        },
        recentActivities
      }
    });
  } catch (error) {
    console.error('Error get dashboard stats:', error);
    res.status(500).json({
      sukses: false,
      pesan: 'Terjadi kesalahan saat mengambil data dashboard'
    });
  }
};

// Chart data untuk sales orders
exports.getSalesOrderChart = async (req, res) => {
  try {
    const { period = '6' } = req.query; // Default 6 bulan

    const [chartData] = await pool.query(`
      SELECT 
        DATE_FORMAT(tanggal_so, '%Y-%m') as bulan,
        DATE_FORMAT(tanggal_so, '%b %Y') as label,
        COUNT(*) as jumlah,
        SUM(total_amount) as total,
        COUNT(CASE WHEN status = 'Terproses' THEN 1 END) as terproses,
        COUNT(CASE WHEN status = 'Sebagian Terproses' THEN 1 END) as sebagian_terproses,
        COUNT(CASE WHEN status = 'Menunggu Proses' THEN 1 END) as menunggu_proses
      FROM sales_orders
      WHERE tanggal_so >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)
      GROUP BY DATE_FORMAT(tanggal_so, '%Y-%m')
      ORDER BY bulan ASC
    `, [parseInt(period)]);

    res.json({
      sukses: true,
      data: chartData
    });
  } catch (error) {
    console.error('Error get SO chart:', error);
    res.status(500).json({
      sukses: false,
      pesan: 'Terjadi kesalahan saat mengambil data chart'
    });
  }
};

// Chart data untuk items
exports.getItemChart = async (req, res) => {
  try {
    const [chartData] = await pool.query(`
      SELECT 
        COALESCE(kategori, 'Tanpa Kategori') as kategori,
        COUNT(*) as jumlah,
        SUM(stok_tersedia) as total_stok,
        SUM(harga_jual * stok_tersedia) as nilai_stok
      FROM items
      GROUP BY kategori
      ORDER BY jumlah DESC
      LIMIT 15
    `);

    res.json({
      sukses: true,
      data: chartData
    });
  } catch (error) {
    console.error('Error get item chart:', error);
    res.status(500).json({
      sukses: false,
      pesan: 'Terjadi kesalahan saat mengambil data chart'
    });
  }
};
