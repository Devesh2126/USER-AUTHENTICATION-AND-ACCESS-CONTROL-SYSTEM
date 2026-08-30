-- ============================================================================
-- LOCAL TESTING ONLY — DO NOT RUN THIS AGAINST YOUR REAL SUPABASE PROJECT.
--
-- Supabase creates and owns the real auth.users table automatically. This
-- file exists only so we can test 001_create_profiles.sql's trigger logic
-- against a local Postgres instance that doesn't have Supabase installed.
-- It's a deliberately trimmed-down stand-in with just the columns our
-- trigger touches (id, raw_user_meta_data).
-- ============================================================================

CREATE SCHEMA IF NOT EXISTS auth;

CREATE TABLE auth.users (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email              TEXT UNIQUE,
    raw_user_meta_data JSONB,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Supabase provides auth.uid() for free, reading the caller's id out of
-- their verified JWT. Vanilla Postgres has no such function, so our RLS
-- policy (which calls auth.uid()) can't even be created without a stand-in.
-- For local testing we fake it with a session variable we can set manually.
CREATE OR REPLACE FUNCTION auth.uid() RETURNS UUID AS $$
    SELECT NULLIF(current_setting('test.current_user_id', true), '')::UUID;
$$ LANGUAGE sql STABLE;
