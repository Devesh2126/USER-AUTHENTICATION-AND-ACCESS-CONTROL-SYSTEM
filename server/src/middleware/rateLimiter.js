const rateLimit = require('express-rate-limit');

// Tighter than a general API limit, on purpose: login/register are exactly
// what a brute-force or credential-stuffing script would hammer. 10
// attempts per 15 minutes per IP is generous for a real user (who
// mistypes a password a handful of times) but slow enough to make
// automated guessing impractical.
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many attempts. Please try again later.',
    code: 'RATE_LIMITED',
  },
});

module.exports = authRateLimiter;
