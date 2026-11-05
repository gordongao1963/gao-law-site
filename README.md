# gao.law

IP litigation practice site for Gordon Gao — "IP Litigation | Protecting Innovation Across Borders."

- **Stack:** Next.js (App Router, Node 24.x), Supabase (cases, articles, messages, visitor logs), Vercel Blob.
- **Hosting:** Vercel project `v0-ai-first-website`; production domains `gao.law` and `www.gao.law`.
- **Deploys:** every push to `main` deploys automatically from this repository.
- **Source:** recovered 2026-11-05 from the live May 16, 2026 v0 deployment; this repo is the source of truth.
- **Admin:** site content is managed through the `/admin` panel (backed by Supabase).

## Admin password reset

- Forgot the admin password? Use **Forgot password?** on the sign-in page. A reset link is emailed to `gao@gao.law` (or `ADMIN_RESET_EMAIL` if set). The link works once and expires in 30 minutes; at most 5 reset emails per hour.
- Reset passwords are stored scrypt-hashed in Supabase (`admin_credentials`, one row). Once a reset password exists, it is the only password — the `ADMIN_PASSWORD` env var stops working.
- Login sessions are random tokens stored in `admin_sessions` (24h expiry), checked by `lib/admin-auth.ts`. All `/api/admin/*` routes require a valid session.
- **One-time setup:** run `scripts/014_create_admin_security.sql` in the Supabase SQL Editor. It creates `admin_credentials`, `admin_password_resets` and `admin_sessions` with Row Level Security on and no public policies (service-role key only). Until it is run, login keeps working with the old `ADMIN_PASSWORD` env var and the reset flow reports "not set up yet".

