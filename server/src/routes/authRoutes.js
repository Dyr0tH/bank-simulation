const express = require('express');
const router = express.Router();
const { login, register, getMe, getDemoCredentials } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

router.post('/login', login);
router.post('/register', register);
router.get('/demo-credentials', getDemoCredentials);
router.get('/me', authenticateToken, getMe);

module.exports = router;
