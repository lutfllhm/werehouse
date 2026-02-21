const express = require('express');
const router = express.Router();
const accurateController = require('../controllers/accurateController');
const { verifikasiToken } = require('../middleware/auth');

// OAuth Routes
router.get('/auth/url', verifikasiToken, accurateController.getAuthUrl);
router.get('/callback', accurateController.handleCallback);
router.post('/refresh-token', verifikasiToken, accurateController.refreshToken);
router.post('/disconnect', verifikasiToken, accurateController.disconnect);

// API Status & Info
router.get('/status', verifikasiToken, accurateController.checkStatus);
router.get('/databases', verifikasiToken, accurateController.getDatabases);
router.get('/token-info', verifikasiToken, accurateController.getApiTokenInfo);

// Item Routes
router.get('/items', verifikasiToken, accurateController.getItems);
router.get('/items/:id', verifikasiToken, accurateController.getItemDetail);
router.get('/items/:id/stock', verifikasiToken, accurateController.getItemStock);
router.get('/items-stock', verifikasiToken, accurateController.listItemStock);
router.get('/items/:id/selling-price', verifikasiToken, accurateController.getSellingPrice);
router.get('/items/:id/nearest-cost', verifikasiToken, accurateController.getNearestCost);
router.get('/items/:id/vendor-price', verifikasiToken, accurateController.getVendorPrice);
router.get('/items/:id/stock-history', verifikasiToken, accurateController.getStockMutationHistory);
router.get('/items/search/by-item-or-sn', verifikasiToken, accurateController.searchByItemOrSN);
router.get('/items/search/by-upc', verifikasiToken, accurateController.searchByNoUPC);
router.post('/items', verifikasiToken, accurateController.saveItem);
router.post('/items/bulk', verifikasiToken, accurateController.bulkSaveItems);
router.delete('/items/:id', verifikasiToken, accurateController.deleteItem);

// Sales Order Routes
router.get('/sales-orders', verifikasiToken, accurateController.getSalesOrders);
router.get('/sales-orders/:id', verifikasiToken, accurateController.getSalesOrderDetail);
router.post('/sales-orders', verifikasiToken, accurateController.saveSalesOrder);
router.post('/sales-orders/bulk', verifikasiToken, accurateController.bulkSaveSalesOrders);
router.delete('/sales-orders/:id', verifikasiToken, accurateController.deleteSalesOrder);
router.post('/sales-orders/:id/close', verifikasiToken, accurateController.manualCloseSalesOrder);

module.exports = router;
