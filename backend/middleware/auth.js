const jwt = require('jsonwebtoken');

// Middleware untuk verifikasi token JWT
const verifikasiToken = (req, res, next) => {
  try {
    // Ambil token dari header
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        sukses: false,
        pesan: 'Token tidak ditemukan. Silakan login terlebih dahulu.'
      });
    }

    // Verifikasi token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userData = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      sukses: false,
      pesan: 'Token tidak valid atau sudah kadaluarsa.'
    });
  }
};

// Middleware untuk verifikasi role superadmin
const verifikasiSuperAdmin = (req, res, next) => {
  if (req.userData.role !== 'superadmin') {
    return res.status(403).json({
      sukses: false,
      pesan: 'Akses ditolak. Hanya superadmin yang dapat mengakses.'
    });
  }
  next();
};

// Middleware untuk verifikasi role admin atau superadmin
const verifikasiAdmin = (req, res, next) => {
  if (req.userData.role !== 'admin' && req.userData.role !== 'superadmin') {
    return res.status(403).json({
      sukses: false,
      pesan: 'Akses ditolak. Hanya admin yang dapat mengakses.'
    });
  }
  next();
};

module.exports = {
  verifikasiToken,
  verifikasiSuperAdmin,
  verifikasiAdmin
};
