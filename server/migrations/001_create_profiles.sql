-- This migration assumes auth.users already exists — Supabase creates and
-- manages that table for you. We only ever add to the public schema.

CREATE TYPE user_role AS ENUM ('USER', 'ADMIN', 'MODERATOR');

CREATE TABLE public.profiles (
    -- Same id as the auth.users row it extends — a true 1:1 extension,
    -- not a separate identity. Deleting the auth user deletes the profile.
    id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name        TEXT NOT NULL DEFAULT '',
    role        user_role NOT NULL DEFAULT 'USER',
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_set_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

-- The sync trigger: fires the instant Supabase inserts a new auth.users row
-- (i.e. right after someone signs up), and creates the matching profile.
-- SECURITY DEFINER: runs with the privileges of the function owner, not the
-- caller — required because Supabase's own internal signup process is what
-- triggers this, and it doesn't have direct INSERT rights on public.profiles.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, name)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', ''));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Row Level Security: profiles can be read directly by the owning user via
-- Supabase's client SDK (using the user's own JWT), but writes to role and
-- is_active only ever happen through our backend using the service role
-- key, which bypasses RLS entirely. So we add a SELECT policy for the
-- owner and deliberately add no INSERT/UPDATE/DELETE policy — those stay
-- backend-only until we explicitly decide otherwise.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);
