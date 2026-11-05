-- 014: Admin password reset + server-side sessions
--
-- Run once in the Supabase SQL Editor (project supabase-rose-elephant).
-- These tables hold credentials and one-time tokens, so they are locked down:
-- Row Level Security is ON and there are deliberately NO public policies.
-- Only the service-role key (used server-side by the Next.js app) can
-- read/write them. The anon key gets nothing.
--
-- Tables:
--   admin_credentials     - the current admin password, scrypt-hashed
--                           (one row, id = 'default'). Takes precedence over
--                           the ADMIN_PASSWORD env var once a row exists.
--   admin_password_resets - one-time reset tokens (stored as SHA-256 hashes,
--                           30-minute expiry, single use).
--   admin_sessions        - login session tokens (stored as SHA-256 hashes,
--                           24-hour expiry). Replaces the old static
--                           "authenticated" cookie value.

CREATE TABLE IF NOT EXISTS public.admin_credentials (
  id TEXT PRIMARY KEY DEFAULT 'default',
  password_hash TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.admin_password_resets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.admin_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.admin_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_password_resets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;

-- No policies are created on purpose: with RLS enabled and zero policies,
-- the anon/public role cannot SELECT, INSERT, UPDATE or DELETE anything.
-- The service-role key bypasses RLS and is the only way the app touches
-- these tables.
