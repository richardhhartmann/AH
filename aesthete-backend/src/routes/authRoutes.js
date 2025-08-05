const express = require('express');
const router = express.Router();
const { registerUser, loginUser, forgotPassword, resetPassword } = require('../controllers/authController');

// Rota para registro: POST /api/auth/register
router.post('/register', registerUser);

// Rota para login: POST /api/auth/login
router.post('/login', loginUser);

router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:resettoken', resetPassword);

module.exports = router;