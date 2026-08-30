const express = require('express');
const { authenticateUser, requireRole } = require('../middleware/authenticateUser');
const adminController = require('../controllers/adminController');

const router = express.Router();

// Applied to EVERY route on this router, not per-route — this means a
// future route added here can't accidentally ship unprotected. Defense
// against the exact kind of mistake that's easy to make one Friday
// afternoon: adding a new admin endpoint and forgetting the guard.
router.use(authenticateUser, requireRole('ADMIN'));

router.get('/users', adminController.listUsers);
router.get('/users/:id', adminController.getUserById);
router.patch('/users/:id/role', adminController.updateUserRole);
router.patch('/users/:id/status', adminController.updateUserStatus);
router.get('/audit-logs', adminController.listAuditLogs);
router.get('/login-attempts', adminController.listLoginAttempts);

module.exports = router;
