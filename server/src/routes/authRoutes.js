const express = require('express');
const authController = require('../controllers/authController');
const authRateLimiter = require('../middleware/rateLimiter');

const router = express.Router();

// Public routes — rate limited on register/login/refresh, the three an
// attacker could actually abuse (guessing passwords, credential stuffing,
// hammering refresh). logout has no brute-force value, left unlimited.
router.post('/register', authRateLimiter, authController.register);
router.post('/login', authRateLimiter, authController.login);
router.post('/logout', authController.logout);
router.post('/refresh', authRateLimiter, authController.refresh);
router.post('/resend-verification', authRateLimiter, authController.resendVerification);
router.post('/forgot-password', authRateLimiter, authController.forgotPassword);
router.post('/reset-password', authRateLimiter, authController.resetPassword);

module.exports = router;
