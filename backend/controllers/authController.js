const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('🔐 Login attempt:', email); // Debug log

    // Validasi input
    if (!email || !password) {
      return res.status(400).json({
        sukses: false,
        pesan: 'Email dan password harus diisi'
      });
    }

    // Cari user berdasarkan email
    const [users] = await pool.query(
      'SELECT * FROM users WHERE email = ? AND status = "aktif"',
      [email]
    );

    console.log('👤 User found:', users.length > 0); // Debug log

    if (users.length === 0) {
      return res.status(401).json({
        sukses: false,
        pesan: 'Email atau password salah'
      });
    }

    const user = users[0];
    console.log('🔑 Verifying password...'); // Debug log

    // Verifikasi password
    const passwordValid = await bcrypt.compare(password, user.password);
    console.log('✅ Password valid:', passwordValid); // Debug log

    if (!passwordValid) {
      return res.status(401).json({
        sukses: false,
        pesan: 'Email atau password salah'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET || 'iware_secret_key_2024',
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    console.log('🎫 Token generated'); // Debug log

    // Log aktivitas (optional - jangan fail jika error)
    try {
      await pool.query(
        'INSERT INTO activity_logs (user_id, aktivitas, deskripsi) VALUES (?, ?, ?)',
        [user.id, 'Login', `User ${user.nama} berhasil login`]
      );
    } catch (logError) {
      console.warn('⚠️ Failed to log activity:', logError.message);
      // Continue anyway - logging is not critical
    }

    console.log('✅ Login successful'); // Debug log

    res.json({
      sukses: true,
      pesan: 'Login berhasil',
      data: {
        token,
        user: {
          id: user.id,
          nama: user.nama,
          email: user.email,
          role: user.role,
          foto_profil: user.foto_profil
        }
      }
    });
  } catch (error) {
    console.error('❌ Error login:', error);
    res.status(500).json({
      sukses: false,
      pesan: 'Terjadi kesalahan saat login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get profile user yang sedang login
exports.getProfile = async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, nama, email, role, foto_profil, status, created_at FROM users WHERE id = ?',
      [req.userData.userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        sukses: false,
        pesan: 'User tidak ditemukan'
      });
    }

    res.json({
      sukses: true,
      data: users[0]
    });
  } catch (error) {
    console.error('Error get profile:', error);
    res.status(500).json({
      sukses: false,
      pesan: 'Terjadi kesalahan saat mengambil profile'
    });
  }
};

// Update profile
exports.updateProfile = async (req, res) => {
  try {
    const { nama, email, password_lama, password_baru } = req.body;
    const userId = req.userData.userId;

    // Ambil data user
    const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);
    if (users.length === 0) {
      return res.status(404).json({
        sukses: false,
        pesan: 'User tidak ditemukan'
      });
    }

    const user = users[0];
    let updateData = {};

    // Update nama dan email
    if (nama) updateData.nama = nama;
    if (email) updateData.email = email;

    // Update password jika ada
    if (password_baru) {
      if (!password_lama) {
        return res.status(400).json({
          sukses: false,
          pesan: 'Password lama harus diisi'
        });
      }

      const passwordValid = await bcrypt.compare(password_lama, user.password);
      if (!passwordValid) {
        return res.status(400).json({
          sukses: false,
          pesan: 'Password lama tidak sesuai'
        });
      }

      updateData.password = await bcrypt.hash(password_baru, 10);
    }

    // Update ke database
    if (Object.keys(updateData).length > 0) {
      const setClause = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
      const values = [...Object.values(updateData), userId];

      await pool.query(
        `UPDATE users SET ${setClause} WHERE id = ?`,
        values
      );
    }

    res.json({
      sukses: true,
      pesan: 'Profile berhasil diupdate'
    });
  } catch (error) {
    console.error('Error update profile:', error);
    res.status(500).json({
      sukses: false,
      pesan: 'Terjadi kesalahan saat update profile'
    });
  }
};
