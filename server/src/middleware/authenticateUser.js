const { supabaseAuth, supabaseAdmin } = require('../config/supabaseClients');

async function authenticateUser(req, res, next) {
  try {
    // Cookie-based now, not Bearer header: our backend owns the session via
    // HTTP-only cookies (set by authController on login/register/refresh),
    // so JavaScript on the frontend never touches the token directly.
    const token = req.cookies?.access_token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'MISSING_TOKEN',
      });
    }

    // getClaims verifies the token's signature and expiry. For newer
    // Supabase projects this happens locally against a cached public key
    // (no network call); for older HS256 projects, the SDK transparently
    // falls back to a server-side check. Either way, we don't need to know
    // which — we just trust the result.
    const { data, error } = await supabaseAuth.auth.getClaims(token);

    if (error || !data?.claims?.sub) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired session',
        code: 'INVALID_TOKEN',
      });
    }

    const userId = data.claims.sub;

    // The JWT alone doesn't reflect account status changes made after it was
    // issued (e.g. an admin disabling the account minutes ago). We check our
    // own source of truth on every request rather than trusting the token.
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, name, role, is_active')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired session',
        code: 'INVALID_TOKEN',
      });
    }

    if (!profile.is_active) {
      return res.status(403).json({
        success: false,
        message: 'This account has been disabled',
        code: 'ACCOUNT_DISABLED',
      });
    }

    // Deliberately minimal: only what downstream code actually needs.
    // Never attach the raw token or full claims object here.
    req.user = {
      id: profile.id,
      name: profile.name,
      role: profile.role,
      email: data.claims.email,
    };

    next();
  } catch (err) {
    // Belt-and-suspenders: nothing observed in testing actually throws
    // here, but if a future SDK version or edge case ever does, this
    // guarantees next(err) runs instead of the request hanging forever.
    next(err);
  }
}

// MUST run after authenticateUser — relies on req.user already being set.
// Accepts either a single role string or an array, so both
// requireRole('ADMIN') and requireRole(['ADMIN', 'MODERATOR']) work.
function requireRole(allowedRoles) {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return (req, res, next) => {
    if (!req.user) {
      // Programmer error if this fires — means requireRole was used
      // without authenticateUser running first. Fail closed regardless.
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'MISSING_TOKEN',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action',
        code: 'FORBIDDEN',
      });
    }

    next();
  };
}

module.exports = { authenticateUser, requireRole };
