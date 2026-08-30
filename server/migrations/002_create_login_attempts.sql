CREATE TABLE public.login_attempts (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    email       TEXT NOT NULL,
    ip_address  TEXT NOT NULL,
    user_agent  TEXT,
    success     BOOLEAN NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX login_attempts_email_created_idx ON public.login_attempts (email, created_at DESC);
CREATE INDEX login_attempts_ip_created_idx ON public.login_attempts (ip_address, created_at DESC);

-- No SELECT policy for regular users — this table is for admin eyes only,
-- read exclusively through our backend's service role key, which bypasses
-- RLS. Enabling RLS with zero policies means even a logged-in user querying
-- this table directly via the Supabase client gets nothing back.
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;
