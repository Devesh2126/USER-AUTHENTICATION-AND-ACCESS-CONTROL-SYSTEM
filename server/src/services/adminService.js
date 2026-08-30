const { supabaseAdmin } = require('../config/supabaseClients');

const DEFAULT_PAGE_SIZE = 20;
const VALID_ROLES = ['USER', 'ADMIN', 'MODERATOR'];

function notFound(message = 'User not found') {
  const err = new Error(message);
  err.status = 404;
  err.code = 'USER_NOT_FOUND';
  return err;
}

async function logAudit({ userId, action, metadata }) {
  const { error } = await supabaseAdmin.from('audit_logs').insert({
    user_id: userId,
    action,
    metadata,
  });
  // Don't let an audit-log failure block the actual admin action — but
  // don't silently swallow it either, since losing audit trail entries
  // is itself a real problem worth knowing about.
  if (error) {
    console.error('Failed to write audit log:', error.message);
  }
}

async function listUsers({ page = 1, limit = DEFAULT_PAGE_SIZE, search = '' }) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabaseAdmin
    .from('profiles')
    .select('id, name, role, is_active, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (search) {
    query = query.ilike('name', `%${search}%`);
  }

  const { data: profiles, error, count } = await query;
  if (error) {
    const err = new Error('Failed to list users');
    err.status = 500;
    throw err;
  }

  // profiles has no email column (that's Supabase's own auth.users data,
  // which we don't duplicate). We fetch it separately and merge in
  // memory. NOTE: this pulls up to 1000 auth accounts per call to build
  // the id->email map — fine at portfolio/small-project scale, but would
  // need a per-ID lookup instead if this ever had a large user base.
  const { data: authList } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const emailById = new Map((authList?.users || []).map((u) => [u.id, u.email]));

  const users = profiles.map((p) => ({
    id: p.id,
    name: p.name,
    email: emailById.get(p.id) || null,
    role: p.role,
    isActive: p.is_active,
    createdAt: p.created_at,
  }));

  return { users, total: count ?? 0, page, limit };
}

async function getUserById(id) {
  const { data: profile, error } = await supabaseAdmin
    .from('profiles')
    .select('id, name, role, is_active, created_at, updated_at')
    .eq('id', id)
    .single();

  if (error || !profile) {
    throw notFound();
  }

  const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(id);

  return {
    id: profile.id,
    name: profile.name,
    email: authUser?.user?.email || null,
    role: profile.role,
    isActive: profile.is_active,
    createdAt: profile.created_at,
    updatedAt: profile.updated_at,
    emailConfirmedAt: authUser?.user?.email_confirmed_at || null,
  };
}

async function updateUserRole({ targetUserId, newRole, actingAdminId }) {
  if (!VALID_ROLES.includes(newRole)) {
    const err = new Error(`Role must be one of: ${VALID_ROLES.join(', ')}`);
    err.status = 400;
    err.code = 'INVALID_ROLE';
    throw err;
  }

  // Prevent an admin from locking themselves out by accident.
  if (targetUserId === actingAdminId) {
    const err = new Error("You can't change your own role");
    err.status = 400;
    err.code = 'CANNOT_MODIFY_SELF';
    throw err;
  }

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .update({ role: newRole })
    .eq('id', targetUserId)
    .select('id, role')
    .single();

  if (error || !data) {
    throw notFound();
  }

  await logAudit({
    userId: actingAdminId,
    action: 'ROLE_CHANGED',
    metadata: { targetUserId, newRole },
  });

  return data;
}

async function updateUserStatus({ targetUserId, isActive, actingAdminId }) {
  if (targetUserId === actingAdminId) {
    const err = new Error("You can't disable your own account");
    err.status = 400;
    err.code = 'CANNOT_MODIFY_SELF';
    throw err;
  }

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .update({ is_active: isActive })
    .eq('id', targetUserId)
    .select('id, is_active')
    .single();

  if (error || !data) {
    throw notFound();
  }

  await logAudit({
    userId: actingAdminId,
    action: isActive ? 'ACCOUNT_ENABLED' : 'ACCOUNT_DISABLED',
    metadata: { targetUserId },
  });

  return data;
}

async function listAuditLogs({ page = 1, limit = DEFAULT_PAGE_SIZE }) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabaseAdmin
    .from('audit_logs')
    .select('id, user_id, action, metadata, ip_address, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    const err = new Error('Failed to list audit logs');
    err.status = 500;
    throw err;
  }

  return { logs: data, total: count ?? 0, page, limit };
}

async function listLoginAttempts({ page = 1, limit = DEFAULT_PAGE_SIZE }) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabaseAdmin
    .from('login_attempts')
    .select('id, user_id, email, ip_address, success, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    const err = new Error('Failed to list login attempts');
    err.status = 500;
    throw err;
  }

  return { attempts: data, total: count ?? 0, page, limit };
}

module.exports = {
  listUsers,
  getUserById,
  updateUserRole,
  updateUserStatus,
  listAuditLogs,
  listLoginAttempts,
};
