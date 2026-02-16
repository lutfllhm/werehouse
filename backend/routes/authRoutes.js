const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifikasiToken } = require('../middleware/auth');

// Public routes
router.post('/login', authController.login);

// Protected routes
router.get('/profile', verifikasiToken, authController.getProfile);
router.put('/profile', verifikasiToken, authController.updateProfile);

module.exports = router;
