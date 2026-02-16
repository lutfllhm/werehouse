const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { verifikasiToken } = require('../middleware/auth');

// Semua routes memerlukan autentikasi
router.use(verifikasiToken);

router.get('/items', reportController.getItemReport);
router.get('/sales-orders', reportController.getSalesOrderReport);
router.get('/export', reportController.exportReport);

module.exports = router;
