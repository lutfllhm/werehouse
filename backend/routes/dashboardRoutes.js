const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { verifikasiToken } = require('../middleware/auth');

// Semua routes memerlukan autentikasi
router.use(verifikasiToken);

router.get('/stats', dashboardController.getDashboardStats);
router.get('/chart/sales-orders', dashboardController.getSalesOrderChart);
router.get('/chart/items', dashboardController.getItemChart);

module.exports = router;
