# SecureAuth — Progress README

A full-stack authentication & access control system, built incrementally with Supabase Auth + Express + React.

---

## Stack

- **Frontend**: React + Vite + Tailwind v4 + React Router + Axios
- **Backend**: Node.js + Express (layered: Route → Controller → Service)
- **Database/Auth**: Supabase (Postgres + Supabase Auth)
- **Session model**: HTTP-only cookies, backend-managed (not localStorage)

---

## Phases completed

### Phase 1 — Architecture
- Feature list, ER diagram, API endpoint list, folder structure, security architecture defined upfront.

### Phase 2 — Database schema (Supabase)
- `public.profiles` — extends `auth.users` 1:1 (role, is_active, name)
- Trigger: `auth.users` insert → auto-creates matching `profiles` row
- `public.login_attempts`, `public.audit_logs` — admin-only, RLS enabled with zero policies
- RLS on `profiles`: users can `SELECT` their own row only
- Verified locally: trigger fires correctly, cascade delete works, RLS blocks cross-user reads

### Phase 3 — Express backend setup
- `app.js` / `server.js` split, Helmet, CORS (single allowed origin, credentials enabled)
- Centralized error handler (`{success, message, code}` shape, no stack traces to client)
- Env var validation at startup (fails loudly if `.env` is incomplete)

### Phase 4 — Authentication
- `authenticateUser` — verifies Supabase JWT via `getClaims()` (local verification, no per-request network call), checks `profiles.is_active`
- `requireRole()` — RBAC middleware, reuses `req.user.role`, no extra DB query
- `register`, `login`, `logout`, `refresh` — cookies set `HttpOnly`, `Secure` (prod), `SameSite=Strict`
- **`logout` actually revokes the session server-side** via `supabaseAdmin.auth.admin.signOut()` — proven with a real test (old cookie fails to refresh after logout)
- Rate limiting on `register` / `login` / `refresh` (10 attempts / 15 min, shared bucket)
- `GET /api/users/me` — first protected route, working end-to-end against live Supabase

### Phase 5 — Frontend
- `AuthContext` (user, isAuthenticated, loading, login/register/logout/refreshUser)
- Axios client: `withCredentials: true`, auto-refresh-on-401 interceptor
- `ProtectedRoute` / `AdminRoute` (UX convenience only — backend is the real enforcement)
- Pages: Landing, Login, Register, Dashboard, 404
- Confirmed working end-to-end in a real browser: register → session persists across refresh → logout redirects correctly
- **Fixes after initial build**: email-confirmation-required state handled properly (was silently failing before), resend-confirmation flow added, password show/hide toggle, logo links back to home, `login` no longer leaks raw Supabase/network error text

### Phase 6 — Admin dashboard + RBAC in practice
- `GET /api/admin/users` — paginated, searchable by name, merges `profiles` + Supabase auth emails
- `GET /api/admin/users/:id`, `PATCH /api/admin/users/:id/role`, `PATCH /api/admin/users/:id/status`
- `GET /api/admin/audit-logs`, `GET /api/admin/login-attempts` — first time these (Phase 2) tables became readable
- Router-level guard: `router.use(authenticateUser, requireRole('ADMIN'))` — every admin route protected by default, can't add a new one and forget the guard
- Self-modification guards: an admin can't change their own role or disable their own account
- **Closed a real gap**: `login_attempts` existed since Phase 2 but nothing ever wrote to it — every login attempt (success/failure) is now recorded
- Frontend: searchable/paginated `AdminUsers` table, inline role dropdown, status toggle
- Verified: every admin route confirmed to reject with no auth; self-modification guards confirmed to fire before any DB call; full flow confirmed working end-to-end after resolving a Supabase permissions issue

---

## Known open items (not yet fixed)

- Centralized error handler leaks raw JSON-parse error text on malformed request bodies
- No password-strength validation enforced server-side (frontend-only currently)
- `adminService.listUsers` fetches up to 1000 auth accounts per call to build the email lookup — fine at current scale, would need a smarter per-ID lookup for a large user base

---

## Not yet built

- Profile editing / change password
- Forgot / reset password flow
- Automated tests
- Deployment

---

## Lessons from today's debugging session (worth remembering)

- **Local project folders can silently diverge from what's actually running.** A folder move (OneDrive → `C:\SecureAuth`) plus multiple partial merges caused a long debugging chase for a bug that didn't actually exist in the code. When something behaves inexplicably and the code looks right, verify *which* files are actually being served/run before assuming the code is wrong.
- **The rate limiter works — including on you.** Repeated manual testing across a long debugging session can trip the same 10-attempts/15-min limit built for brute-force protection. `RateLimit-Reset` header tells you exactly how long to wait.
- **`curl` is the fastest way to isolate frontend vs. backend issues.** When browser behavior is confusing, testing the same request directly against the API skips the browser entirely and tells you immediately which half of the stack the problem is actually in.

---

## How we're moving forward

Each phase follows the same loop:
1. Explain the concept before building it
2. Build the smallest working version
3. **Test it for real** (locally, then against live Supabase) — not just read the code
4. Fix what breaks, verify the fix
5. Package + hand off, only then move to the next phase

Next up (pick one): **Profile/password management**, **Forgot password flow**, or **security hardening pass** on the known open items above.