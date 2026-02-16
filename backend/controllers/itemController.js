const { pool } = require('../config/database');
const accurateService = require('../services/accurateService');

// Sinkronisasi items dari Accurate Online ke database lokal
exports.syncItems = async (req, res) => {
  try {
    const userId = req.userData.userId;
    const result = await accurateService.getItems(userId, { pageSize: 500 });

    if (!result.sukses) {
      return res.status(500).json({
        sukses: false,
        pesan: 'Gagal mengambil data dari Accurate Online',
        error: result.pesan
      });
    }

    // Response dari Accurate biasanya dalam format { d: [...], sp: {...} }
    const items = result.data.d || result.data || [];
    let syncCount = 0;
    let errorCount = 0;

    for (const item of items) {
      try {
        // Mapping field dari Accurate API ke database lokal
        // Sesuaikan dengan struktur response actual dari Accurate
        await pool.query(
          `INSERT INTO items (item_id, nama_item, kode_item, kategori, satuan, stok_tersedia, harga_jual, harga_beli, deskripsi)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
           nama_item = VALUES(nama_item),
           kode_item = VALUES(kode_item),
           kategori = VALUES(kategori),
           satuan = VALUES(satuan),
           stok_tersedia = VALUES(stok_tersedia),
           harga_jual = VALUES(harga_jual),
           harga_beli = VALUES(harga_beli),
           deskripsi = VALUES(deskripsi),
           last_sync = CURRENT_TIMESTAMP`,
          [
            item.id || item.itemId || `item_${syncCount}`,
            item.name || item.itemName || 'Unknown',
            item.no || item.itemNo || '',
            item.itemCategoryName || item.category || '',
            item.unitName || item.unit || 'PCS',
            item.availableQty || item.stock || 0,
            item.unitPrice || item.price || 0,
            item.cogs || item.costPrice || 0,
            item.description || item.memo || ''
          ]
        );
        syncCount++;
      } catch (itemError) {
        console.error('Error sync item:', itemError.message);
        errorCount++;
      }
    }

    // Log aktivitas
    await pool.query(
      'INSERT INTO activity_logs (user_id, aktivitas, deskripsi) VALUES (?, ?, ?)',
      [req.userData.userId, 'Sync Items', `Berhasil sync ${syncCount} items dari Accurate Online`]
    );

    res.json({
      sukses: true,
      pesan: `Berhasil sinkronisasi ${syncCount} items${errorCount > 0 ? `, ${errorCount} gagal` : ''}`,
      data: { 
        total: syncCount,
        errors: errorCount,
        totalData: items.length
      }
    });
  } catch (error) {
    console.error('Error sync items:', error);
    res.status(500).json({
      sukses: false,
      pesan: 'Terjadi kesalahan saat sinkronisasi items',
      error: error.message
    });
  }
};

// Ambil semua items dari database lokal
exports.getAllItems = async (req, res) => {
  try {
    const { page = 1, limit = 50, search = '' } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM items';
    let countQuery = 'SELECT COUNT(*) as total FROM items';
    const params = [];

    if (search) {
      query += ' WHERE nama_item LIKE ? OR kode_item LIKE ?';
      countQuery += ' WHERE nama_item LIKE ? OR kode_item LIKE ?';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY last_sync DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [items] = await pool.query(query, params);
    const [countResult] = await pool.query(countQuery, search ? [`%${search}%`, `%${search}%`] : []);

    res.json({
      sukses: true,
      data: items,
      pagination: {
        total: countResult[0].total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(countResult[0].total / limit)
      }
    });
  } catch (error) {
    console.error('Error get items:', error);
    res.status(500).json({
      sukses: false,
      pesan: 'Terjadi kesalahan saat mengambil data items'
    });
  }
};

// Ambil detail item
exports.getItemDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const [items] = await pool.query('SELECT * FROM items WHERE id = ?', [id]);

    if (items.length === 0) {
      return res.status(404).json({
        sukses: false,
        pesan: 'Item tidak ditemukan'
      });
    }

    res.json({
      sukses: true,
      data: items[0]
    });
  } catch (error) {
    console.error('Error get item detail:', error);
    res.status(500).json({
      sukses: false,
      pesan: 'Terjadi kesalahan saat mengambil detail item'
    });
  }
};

// Statistik items untuk dashboard
exports.getItemStats = async (req, res) => {
  try {
    const [stats] = await pool.query(`
      SELECT 
        COUNT(*) as total_items,
        SUM(stok_tersedia) as total_stok,
        COUNT(CASE WHEN stok_tersedia < 10 THEN 1 END) as stok_rendah
      FROM items
    `);

    res.json({
      sukses: true,
      data: stats[0]
    });
  } catch (error) {
    console.error('Error get item stats:', error);
    res.status(500).json({
      sukses: false,
      pesan: 'Terjadi kesalahan saat mengambil statistik items'
    });
  }
};
