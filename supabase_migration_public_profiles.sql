-- Run this in Supabase SQL Editor
-- Public profile usernames for shareable builder pages.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS username text,
  ADD COLUMN IF NOT EXISTS public_profile_enabled boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_unique_idx
  ON public.profiles (lower(username))
  WHERE username IS NOT NULL;

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_username_format;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_username_format
  CHECK (
    username IS NULL
    OR username ~ '^[a-zA-Z0-9_][a-zA-Z0-9_-]{2,29}$'
  );
