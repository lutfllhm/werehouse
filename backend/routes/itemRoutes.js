const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const { verifikasiToken } = require('../middleware/auth');

// Semua routes memerlukan autentikasi
router.use(verifikasiToken);

router.post('/sync', itemController.syncItems);
router.get('/', itemController.getAllItems);
router.get('/stats', itemController.getItemStats);
router.get('/:id', itemController.getItemDetail);

module.exports = router;
