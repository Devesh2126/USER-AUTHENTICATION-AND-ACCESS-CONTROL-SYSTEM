const { supabaseAuth, supabaseAdmin } = require('../config/supabaseClients');
const env = require('../config/env');
const { validatePasswordStrength } = require('../validators/passwordValidator');

const isProd = env.nodeEnv === 'production';

// Helper to set secure auth cookies
// Note: cookie-based auth introduces CSRF risk. Setting sameSite: 'strict' is our
// primary mitigation for now. A dedicated CSRF token pattern should be added during
// the security-hardening phase for any state-changing routes if sameSite alone proves insufficient.
const setAuthCookies = (res, session) => {
  const cookieOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: 'strict',
  };

  res.cookie('access_token', session.access_token, {
    ...cookieOptions,
    maxAge: session.expires_in * 1000,
  });

  res.cookie('refresh_token', session.refresh_token, {
    ...cookieOptions,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });
};

const clearAuthCookies = (res) => {
  const cookieOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: 'strict',
  };

  res.clearCookie('access_token', cookieOptions);
  res.clearCookie('refresh_token', cookieOptions);
};

// Writes to login_attempts for security monitoring / the admin dashboard.
// Deliberately swallows its own errors — a logging failure should never
// be the reason a real login request fails.
async function recordLoginAttempt({ req, email, success, userId }) {
  try {
    await supabaseAdmin.from('login_attempts').insert({
      user_id: userId,
      email,
      ip_address: req.ip,
      user_agent: req.headers['user-agent'] || null,
      success,
    });
  } catch (err) {
    console.error('Failed to record login attempt:', err.message);
  }
}

exports.register = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ success: false, message: 'Email, password, and name are required' });
    }

    const strength = validatePasswordStrength(password);
    if (!strength.valid) {
      return res.status(400).json({ success: false, message: strength.message });
    }

    const { data, error } = await supabaseAuth.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });

    if (error) {
      return res.status(400).json({ success: false, message: error.message });
    }

    // If Supabase's "Confirm email" setting is ON, signUp succeeds but
    // returns no session — the account exists, but can't log in yet until
    // the confirmation link is clicked. Without this check, the frontend
    // would silently treat this as a successful login and immediately
    // hit a wall on the next request.
    if (data.session) {
      setAuthCookies(res, data.session);
      return res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: { user: data.user, requiresEmailConfirmation: false },
      });
    }

    res.status(201).json({
      success: true,
      message: 'Please check your email to confirm your account before logging in.',
      data: { user: data.user, requiresEmailConfirmation: true },
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const { data, error } = await supabaseAuth.auth.signInWithPassword({
      email,
      password,
    });

    await recordLoginAttempt({
      req,
      email,
      success: !error,
      userId: data?.user?.id || null,
    });

    if (error) {
      const isAuthMessage = error.status && error.status < 500;
      const isUnconfirmed =
        error.code === 'email_not_confirmed' ||
        error.message?.toLowerCase().includes('email not confirmed');

      return res.status(401).json({
        success: false,
        message: isAuthMessage ? error.message : 'Login failed. Please try again.',
        code: isUnconfirmed ? 'EMAIL_NOT_CONFIRMED' : undefined,
      });
    }

    // Check account active status before setting auth cookies
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('is_active')
      .eq('id', data.user.id)
      .single();

    if (profileError || !profile?.is_active) {
      // Clean up Supabase session if created
      if (data.session?.access_token) {
        await supabaseAdmin.auth.admin.signOut(data.session.access_token, 'local');
      }

      return res.status(403).json({
        success: false,
        message: 'This account has been disabled. Please contact an administrator.',
        code: 'ACCOUNT_DISABLED',
      });
    }

    setAuthCookies(res, data.session);

    res.json({
      success: true,
      message: 'Login successful',
      data: { user: data.user },
    });
  } catch (err) {
    next(err);
  }
};
exports.logout = async (req, res, next) => {
  try {
    const accessToken = req.cookies.access_token;

    // Clearing cookies alone doesn't revoke anything server-side — the
    // refresh token would stay valid until its 30-day expiry even after
    // "logout" if we stopped there. supabaseAdmin.auth.admin.signOut()
    // is the actual revocation call: it invalidates the session on
    // Supabase's side using our service-role client (this needs elevated
    // privilege, which is why it's on supabaseAdmin, not supabaseAuth).
    // scope: 'local' revokes only this session, not the user's other
    // logged-in devices.
    if (accessToken) {
      const { error } = await supabaseAdmin.auth.admin.signOut(accessToken, 'local');
      if (error) {
        // Not fatal — token may already be expired/invalid, which is a
        // fine outcome for a logout request. Log it, don't block the user.
        console.error('logout: signOut revocation failed:', error.message);
      }
    }

    clearAuthCookies(res);

    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
};

exports.resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const { error } = await supabaseAuth.auth.resend({ type: 'signup', email });

    // Deliberately generic response regardless of what actually happened —
    // same account-enumeration protection as forgot-password. Whether the
    // email doesn't exist, is already confirmed, or genuinely got a new
    // link, the response looks identical to anyone watching the network
    // tab. We log the real error server-side for our own debugging.
    if (error) {
      console.error('resendVerification:', error.message);
    }

    res.json({
      success: true,
      message: 'If that account exists and is unconfirmed, a new confirmation email has been sent.',
    });
  } catch (err) {
    next(err);
  }
};
exports.refresh = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refresh_token;

    if (!refreshToken) {
      return res.status(401).json({ success: false, message: 'No refresh token provided' });
    }

    const { data, error } = await supabaseAuth.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error || !data.session) {
      clearAuthCookies(res);
      return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
    }

    setAuthCookies(res, data.session);

    res.json({ success: true, message: 'Session refreshed successfully' });
  } catch (err) {
    next(err);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const { error } = await supabaseAuth.auth.resetPasswordForEmail(email, {
      redirectTo: `${env.frontendUrl}/reset-password`,
    });

    // Supabase itself already avoids revealing whether the account exists
    // for this call, and we match that here — same message regardless of
    // outcome. Real errors (rate limits, infra issues) are logged for us,
    // never surfaced to the client.
    if (error) {
      console.error('forgotPassword:', error.message);
    }

    res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.',
    });
  } catch (err) {
    next(err);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { tokenHash, newPassword } = req.body;

    if (!tokenHash || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Reset token and new password are required',
      });
    }

    const strength = validatePasswordStrength(newPassword);
    if (!strength.valid) {
      return res.status(400).json({ success: false, message: strength.message });
    }

    // verifyOtp proves the requester actually clicked the link sent to
    // that email address — this IS the identity check for this flow
    // (there's no "current password" to verify, since the whole point is
    // the user can't log in normally).
    const { data, error } = await supabaseAuth.auth.verifyOtp({
      token_hash: tokenHash,
      type: 'recovery',
    });

    if (error || !data.user) {
      return res.status(400).json({
        success: false,
        message: 'This reset link is invalid or has expired. Please request a new one.',
        code: 'INVALID_RESET_TOKEN',
      });
    }

    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(data.user.id, {
      password: newPassword,
    });

    if (updateError) {
      const err = new Error('Failed to reset password');
      err.status = 500;
      throw err;
    }

    // Unlike Phase 7's change-password (which keeps the current session
    // alive), a reset means the user COULDN'T log in normally — we can't
    // assume the account isn't already compromised elsewhere, so every
    // session gets revoked, including the one verifyOtp just created. The
    // user logs in fresh with the new password; we don't auto-login here.
    if (data.session?.access_token) {
      const { error: signOutError } = await supabaseAdmin.auth.admin.signOut(
        data.session.access_token,
        'global'
      );
      if (signOutError) {
        console.error('resetPassword: failed to revoke sessions:', signOutError.message);
      }
    }

    await supabaseAdmin.from('audit_logs').insert({
      user_id: data.user.id,
      action: 'PASSWORD_RESET_COMPLETED',
    });

    res.json({ success: true, message: 'Password reset successfully. Please log in.' });
  } catch (err) {
    next(err);
  }
};
