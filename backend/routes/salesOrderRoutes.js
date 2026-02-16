const express = require('express');
const router = express.Router();
const salesOrderController = require('../controllers/salesOrderController');
const { verifikasiToken } = require('../middleware/auth');

// Semua routes memerlukan autentikasi
router.use(verifikasiToken);

router.post('/sync', salesOrderController.syncSalesOrders);
router.get('/', salesOrderController.getAllSalesOrders);
router.get('/stats', salesOrderController.getSalesOrderStats);
router.get('/:id', salesOrderController.getSalesOrderDetail);
router.put('/:id/status', salesOrderController.updateStatus);

module.exports = router;
