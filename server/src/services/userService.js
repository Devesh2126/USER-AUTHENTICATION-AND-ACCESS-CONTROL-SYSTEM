const { supabaseAdmin } = require('../config/supabaseClients');

async function getProfileById(userId) {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('id, name, role, is_active, created_at, updated_at')
    .eq('id', userId)
    .single();

  if (error || !data) {
    const err = new Error('Profile not found');
    err.status = 404;
    err.code = 'PROFILE_NOT_FOUND';
    throw err;
  }

  return data;
}

// Deliberately whitelists updatable fields rather than accepting whatever
// the client sends — e.g. role and is_active must NEVER be settable here,
// only through the admin endpoints. This is the actual enforcement point,
// not just something the frontend happens to not expose.
async function updateProfile(userId, updates) {
  const allowed = {};
  if (updates.name !== undefined) {
    allowed.name = updates.name;
  }

  if (Object.keys(allowed).length === 0) {
    const err = new Error('No valid fields to update');
    err.status = 400;
    err.code = 'NO_UPDATES';
    throw err;
  }

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .update(allowed)
    .eq('id', userId)
    .select('id, name, role, is_active, created_at, updated_at')
    .single();

  if (error || !data) {
    const err = new Error('Failed to update profile');
    err.status = 500;
    throw err;
  }

  return data;
}

module.exports = { getProfileById, updateProfile };
