const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifikasiToken, verifikasiSuperAdmin } = require('../middleware/auth');

// Semua routes memerlukan autentikasi dan role superadmin
router.use(verifikasiToken);
router.use(verifikasiSuperAdmin);

router.get('/', userController.getAllUsers);
router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;
