const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');

// Ambil semua users
exports.getAllUsers = async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, nama, email, role, foto_profil, status, created_at FROM users ORDER BY created_at DESC'
    );

    res.json({
      sukses: true,
      data: users
    });
  } catch (error) {
    console.error('Error get users:', error);
    res.status(500).json({
      sukses: false,
      pesan: 'Terjadi kesalahan saat mengambil data users'
    });
  }
};

// Tambah user baru
exports.createUser = async (req, res) => {
  try {
    const { nama, email, password, role = 'admin' } = req.body;

    // Validasi input
    if (!nama || !email || !password) {
      return res.status(400).json({
        sukses: false,
        pesan: 'Nama, email, dan password harus diisi'
      });
    }

    // Cek apakah email sudah terdaftar
    const [existingUsers] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({
        sukses: false,
        pesan: 'Email sudah terdaftar'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user baru
    const [result] = await pool.query(
      'INSERT INTO users (nama, email, password, role) VALUES (?, ?, ?, ?)',
      [nama, email, hashedPassword, role]
    );

    // Log aktivitas
    await pool.query(
      'INSERT INTO activity_logs (user_id, aktivitas, deskripsi) VALUES (?, ?, ?)',
      [req.userData.userId, 'Tambah User', `Menambahkan user baru: ${nama}`]
    );

    res.status(201).json({
      sukses: true,
      pesan: 'User berhasil ditambahkan',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('Error create user:', error);
    res.status(500).json({
      sukses: false,
      pesan: 'Terjadi kesalahan saat menambahkan user'
    });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, email, password, role, status } = req.body;

    // Cek apakah user ada
    const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    if (users.length === 0) {
      return res.status(404).json({
        sukses: false,
        pesan: 'User tidak ditemukan'
      });
    }

    // Tidak bisa mengubah superadmin
    if (users[0].role === 'superadmin' && req.userData.userId !== parseInt(id)) {
      return res.status(403).json({
        sukses: false,
        pesan: 'Tidak dapat mengubah data superadmin'
      });
    }

    let updateData = {};
    if (nama) updateData.nama = nama;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (status) updateData.status = status;

    // Update password jika ada
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    if (Object.keys(updateData).length > 0) {
      const setClause = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
      const values = [...Object.values(updateData), id];

      await pool.query(`UPDATE users SET ${setClause} WHERE id = ?`, values);
    }

    // Log aktivitas
    await pool.query(
      'INSERT INTO activity_logs (user_id, aktivitas, deskripsi) VALUES (?, ?, ?)',
      [req.userData.userId, 'Update User', `Mengupdate user ID ${id}`]
    );

    res.json({
      sukses: true,
      pesan: 'User berhasil diupdate'
    });
  } catch (error) {
    console.error('Error update user:', error);
    res.status(500).json({
      sukses: false,
      pesan: 'Terjadi kesalahan saat update user'
    });
  }
};

// Hapus user
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Cek apakah user ada
    const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    if (users.length === 0) {
      return res.status(404).json({
        sukses: false,
        pesan: 'User tidak ditemukan'
      });
    }

    // Tidak bisa menghapus superadmin
    if (users[0].role === 'superadmin') {
      return res.status(403).json({
        sukses: false,
        pesan: 'Tidak dapat menghapus superadmin'
      });
    }

    // Tidak bisa menghapus diri sendiri
    if (parseInt(id) === req.userData.userId) {
      return res.status(403).json({
        sukses: false,
        pesan: 'Tidak dapat menghapus akun sendiri'
      });
    }

    await pool.query('DELETE FROM users WHERE id = ?', [id]);

    // Log aktivitas
    await pool.query(
      'INSERT INTO activity_logs (user_id, aktivitas, deskripsi) VALUES (?, ?, ?)',
      [req.userData.userId, 'Hapus User', `Menghapus user: ${users[0].nama}`]
    );

    res.json({
      sukses: true,
      pesan: 'User berhasil dihapus'
    });
  } catch (error) {
    console.error('Error delete user:', error);
    res.status(500).json({
      sukses: false,
      pesan: 'Terjadi kesalahan saat menghapus user'
    });
  }
};
