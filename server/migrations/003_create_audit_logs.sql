CREATE TYPE audit_action AS ENUM (
    'LOGIN_SUCCESS',
    'LOGIN_FAILED',
    'LOGOUT',
    'PASSWORD_CHANGED',
    'PASSWORD_RESET_REQUESTED',
    'PASSWORD_RESET_COMPLETED',
    'EMAIL_VERIFIED',
    'ROLE_CHANGED',
    'ACCOUNT_DISABLED',
    'ACCOUNT_ENABLED'
);

CREATE TABLE public.audit_logs (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action      audit_action NOT NULL,
    metadata    JSONB,
    ip_address  TEXT,
    user_agent  TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX audit_logs_user_id_idx ON public.audit_logs (user_id);
CREATE INDEX audit_logs_action_created_idx ON public.audit_logs (action, created_at DESC);

-- Same reasoning as login_attempts: admin-only, backend-only access.
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
