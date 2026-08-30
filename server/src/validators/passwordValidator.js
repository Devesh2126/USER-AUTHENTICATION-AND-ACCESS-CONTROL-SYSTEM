const MIN_LENGTH = 8;

// Server-side enforcement — the frontend already checks this for UX, but
// that's trivially bypassable (anyone can call the API directly). This is
// the check that actually matters.
function validatePasswordStrength(password) {
  if (typeof password !== 'string' || password.length < MIN_LENGTH) {
    return { valid: false, message: `Password must be at least ${MIN_LENGTH} characters.` };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter.' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number.' };
  }
  return { valid: true };
}

module.exports = { validatePasswordStrength };
