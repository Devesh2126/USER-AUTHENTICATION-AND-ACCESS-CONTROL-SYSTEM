const express = require('express');
const { authenticateUser } = require('../middleware/authenticateUser');
const userController = require('../controllers/userController');
const authRateLimiter = require('../middleware/rateLimiter');

const router = express.Router();

router.get('/me', authenticateUser, userController.getMe);
router.patch('/me', authenticateUser, userController.updateMe);
// Reuses the same rate limiter as login/register — changePassword makes a
// real sign-in attempt internally to verify the current password, so it's
// just as brute-forceable as the login endpoint itself.
router.patch('/me/password', authenticateUser, authRateLimiter, userController.changePassword);

module.exports = router;
