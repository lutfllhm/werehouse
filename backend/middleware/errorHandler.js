// Middleware untuk handle error
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Error dari validasi
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      sukses: false,
      pesan: 'Validasi gagal',
      errors: err.errors
    });
  }

  // Error JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      sukses: false,
      pesan: 'Token tidak valid'
    });
  }

  // Error JWT expired
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      sukses: false,
      pesan: 'Token sudah kadaluarsa'
    });
  }

  // Default error
  res.status(err.status || 500).json({
    sukses: false,
    pesan: err.message || 'Terjadi kesalahan pada server',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// Middleware untuk handle 404
const notFound = (req, res, next) => {
  res.status(404).json({
    sukses: false,
    pesan: 'Endpoint tidak ditemukan'
  });
};

module.exports = { errorHandler, notFound };
