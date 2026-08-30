const userService = require('../services/userService');
const { supabaseAuth, supabaseAdmin } = require('../config/supabaseClients');
const { validatePasswordStrength } = require('../validators/passwordValidator');

async function getMe(req, res, next) {
  try {
    const profile = await userService.getProfileById(req.user.id);
    res.json({
      success: true,
      data: {
        id: profile.id,
        name: profile.name,
        email: req.user.email,
        role: profile.role,
        isActive: profile.is_active,
        createdAt: profile.created_at,
      },
    });
  } catch (err) {
    next(err);
  }
}

async function updateMe(req, res, next) {
  try {
    const { name } = req.body;

    if (name !== undefined && (typeof name !== 'string' || name.trim().length === 0)) {
      return res.status(400).json({ success: false, message: 'Name cannot be empty' });
    }

    const profile = await userService.updateProfile(req.user.id, {
      name: name?.trim(),
    });

    res.json({
      success: true,
      data: {
        id: profile.id,
        name: profile.name,
        email: req.user.email,
        role: profile.role,
        isActive: profile.is_active,
        createdAt: profile.created_at,
      },
    });
  } catch (err) {
    next(err);
  }
}

async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current and new password are required',
      });
    }

    const strength = validatePasswordStrength(newPassword);
    if (!strength.valid) {
      return res.status(400).json({ success: false, message: strength.message });
    }

    // Verify current password with a real sign-in attempt — confirms the
    // requester actually knows it, not just that they hold a (possibly
    // stolen) valid session cookie. This uses the stateless anon client,
    // so it doesn't touch this request's actual session cookies at all.
    const { error: verifyError } = await supabaseAuth.auth.signInWithPassword({
      email: req.user.email,
      password: currentPassword,
    });

    if (verifyError) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
        code: 'INCORRECT_PASSWORD',
      });
    }

    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(req.user.id, {
      password: newPassword,
    });

    if (updateError) {
      const err = new Error('Failed to update password');
      err.status = 500;
      throw err;
    }

    // Revoke every OTHER session for this user, but keep the current
    // request's session alive — someone with a stolen session shouldn't
    // stay logged in after the real owner changes their password, but the
    // person making the change shouldn't be logged out of their own
    // device for doing so.
    const currentAccessToken = req.cookies.access_token;
    if (currentAccessToken) {
      const { error: signOutError } = await supabaseAdmin.auth.admin.signOut(
        currentAccessToken,
        'others'
      );
      if (signOutError) {
        console.error('changePassword: failed to revoke other sessions:', signOutError.message);
      }
    }

    await supabaseAdmin.from('audit_logs').insert({
      user_id: req.user.id,
      action: 'PASSWORD_CHANGED',
    });

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getMe, updateMe, changePassword };
