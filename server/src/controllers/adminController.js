const adminService = require('../services/adminService');

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function parsePagination(query) {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 20, 1), 100);
  return { page, limit };
}

exports.listUsers = async (req, res, next) => {
  try {
    const { page, limit } = parsePagination(req.query);
    const search = (req.query.search || '').trim();
    const result = await adminService.listUsers({ page, limit, search });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    if (!UUID_RE.test(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID', code: 'INVALID_ID' });
    }
    const user = await adminService.getUserById(req.params.id);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

exports.updateUserRole = async (req, res, next) => {
  try {
    if (!UUID_RE.test(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID', code: 'INVALID_ID' });
    }
    const { role } = req.body;
    if (!role) {
      return res.status(400).json({ success: false, message: 'Role is required' });
    }

    const result = await adminService.updateUserRole({
      targetUserId: req.params.id,
      newRole: role,
      actingAdminId: req.user.id,
    });

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

exports.updateUserStatus = async (req, res, next) => {
  try {
    if (!UUID_RE.test(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID', code: 'INVALID_ID' });
    }
    const { isActive } = req.body;
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ success: false, message: 'isActive must be a boolean' });
    }

    const result = await adminService.updateUserStatus({
      targetUserId: req.params.id,
      isActive,
      actingAdminId: req.user.id,
    });

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

exports.listAuditLogs = async (req, res, next) => {
  try {
    const { page, limit } = parsePagination(req.query);
    const result = await adminService.listAuditLogs({ page, limit });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

exports.listLoginAttempts = async (req, res, next) => {
  try {
    const { page, limit } = parsePagination(req.query);
    const result = await adminService.listLoginAttempts({ page, limit });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};
