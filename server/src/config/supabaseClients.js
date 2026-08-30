const { createClient } = require('@supabase/supabase-js');
const env = require('./env');

// Used ONLY to verify incoming user JWTs (getClaims). Uses the anon key —
// deliberately the least-privileged key we have, since this client never
// touches data, only checks whether a token is authentically signed by
// Supabase and not expired.
const supabaseAuth = createClient(env.supabaseUrl, env.supabaseAnonKey, {
  auth: { persistSession: false },
});

// Used for backend-privileged reads/writes — bypasses Row Level Security
// entirely via the service role key. This is what lets us look up ANY
// user's profile (not just "your own row", which is all RLS would allow),
// which our own authenticateUser middleware and future admin endpoints
// both need. NEVER expose this client or its key to the frontend.
const supabaseAdmin = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
  auth: { persistSession: false },
});

module.exports = { supabaseAuth, supabaseAdmin };
