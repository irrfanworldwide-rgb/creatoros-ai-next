-- CreatorOS AI — reference schema
-- Matches the tables/columns that lib/supabase/data.ts and the Phase 5
-- payments routes read and write (profiles, daily_usage, generations,
-- payments).
-- Your production Supabase project already has working versions of these
-- tables (the original app is live) — this file exists so you can:
--   1. verify your existing schema matches what the migrated code expects
--   2. spin up a second (staging/dev) Supabase project with the same shape
-- Uses IF NOT EXISTS everywhere, so it's safe to run against an existing
-- database without dropping or overwriting anything.

-- ============================================================
-- profiles
-- ============================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  plan text not null default 'free' check (plan in ('free', 'pro')),
  created_at timestamptz not null default now()
);

-- Recurring subscription tracking (added for real auto-renewing
-- Razorpay Subscriptions, on top of the existing one-time-order flow).
-- IF NOT EXISTS makes this safe to run against your existing table.
alter table public.profiles add column if not exists razorpay_subscription_id text;
alter table public.profiles add column if not exists subscription_status text;
alter table public.profiles add column if not exists subscription_current_end timestamptz;

alter table public.profiles enable row level security;

drop policy if exists "profiles: select own" on public.profiles;
create policy "profiles: select own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles: insert own" on public.profiles;
create policy "profiles: insert own" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "profiles: update own" on public.profiles;
create policy "profiles: update own" on public.profiles
  for update using (auth.uid() = id);

-- ============================================================
-- daily_usage — powers the free-tier 3/day generation limit
-- ============================================================
create table if not exists public.daily_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  count integer not null default 0,
  unique (user_id, date)
);

create index if not exists daily_usage_user_date_idx on public.daily_usage (user_id, date);

alter table public.daily_usage enable row level security;

drop policy if exists "daily_usage: select own" on public.daily_usage;
create policy "daily_usage: select own" on public.daily_usage
  for select using (auth.uid() = user_id);

drop policy if exists "daily_usage: insert own" on public.daily_usage;
create policy "daily_usage: insert own" on public.daily_usage
  for insert with check (auth.uid() = user_id);

drop policy if exists "daily_usage: update own" on public.daily_usage;
create policy "daily_usage: update own" on public.daily_usage
  for update using (auth.uid() = user_id);

-- ============================================================
-- generations — Library / saved history
-- ============================================================
create table if not exists public.generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tool_id text not null,
  tool_name text not null,
  content text not null,
  created_at timestamptz not null default now()
);

-- FIX (confirmed via PGRST204 "Could not find the 'content' column of
-- 'generations' in the schema cache"): the CREATE TABLE IF NOT EXISTS
-- above does nothing on a project where this table already existed
-- before this file did — it does not add missing columns to a table
-- that's already there. This ALTER TABLE is what actually takes effect
-- in that case. Safe to run even if the column already exists
-- (IF NOT EXISTS) or if the table already has rows (DEFAULT '' avoids
-- a NOT NULL violation on existing rows).
alter table public.generations add column if not exists content text not null default '';

create index if not exists generations_user_created_idx
  on public.generations (user_id, created_at desc);

alter table public.generations enable row level security;

drop policy if exists "generations: select own" on public.generations;
create policy "generations: select own" on public.generations
  for select using (auth.uid() = user_id);

drop policy if exists "generations: insert own" on public.generations;
create policy "generations: insert own" on public.generations
  for insert with check (auth.uid() = user_id);

drop policy if exists "generations: delete own" on public.generations;
create policy "generations: delete own" on public.generations
  for delete using (auth.uid() = user_id);

-- ============================================================
-- payments — audit trail for Razorpay upgrades (Phase 5) +
-- recurring subscription charges (Phase 9)
-- ============================================================
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  razorpay_order_id text,
  razorpay_payment_id text not null unique,
  razorpay_subscription_id text,
  status text not null default 'paid',
  created_at timestamptz not null default now()
);

-- Existing production tables created before Phase 9 won't have these
-- columns yet, or may have razorpay_order_id as NOT NULL from Phase 5 —
-- these statements bring them up to date without dropping data.
alter table public.payments add column if not exists razorpay_subscription_id text;
alter table public.payments alter column razorpay_order_id drop not null;

create index if not exists payments_user_idx on public.payments (user_id, created_at desc);
create index if not exists payments_subscription_idx on public.payments (razorpay_subscription_id);

alter table public.payments enable row level security;

drop policy if exists "payments: select own" on public.payments;
create policy "payments: select own" on public.payments
  for select using (auth.uid() = user_id);

drop policy if exists "payments: insert own" on public.payments;
create policy "payments: insert own" on public.payments
  for insert with check (auth.uid() = user_id);

-- ============================================================
-- webhook_events — idempotency guard so a duplicate/retried Razorpay
-- webhook delivery (which Razorpay does on purpose for reliability) can
-- never be processed twice. No RLS needed — only the service-role
-- client (used exclusively by the webhook route) ever touches this
-- table; it holds no user-readable data of its own.
-- ============================================================
create table if not exists public.webhook_events (
  id uuid primary key default gen_random_uuid(),
  razorpay_event_id text not null unique,
  event_type text not null,
  processed_at timestamptz not null default now()
);

-- ============================================================
-- OPTIONAL: auto-create a profile row on signup via a DB trigger,
-- instead of relying on the app's client-side ensureProfile() call.
-- Not required — the app already handles this on first login — but
-- some teams prefer the trigger as a belt-and-suspenders backstop.
-- Uncomment to use:
-- ============================================================
-- create or replace function public.handle_new_user()
-- returns trigger as $$
-- begin
--   insert into public.profiles (id, email, plan)
--   values (new.id, new.email, 'free')
--   on conflict (id) do nothing;
--   return new;
-- end;
-- $$ language plpgsql security definer;
--
-- drop trigger if exists on_auth_user_created on auth.users;
-- create trigger on_auth_user_created
--   after insert on auth.users
--   for each row execute procedure public.handle_new_user();

-- ============================================================
-- PHASE 10 — Admin Panel foundation
--
-- SECURITY NOTE: none of the tables below have any RLS policies —
-- Row Level Security is ENABLED with zero policies, which means DEFAULT
-- DENY for every normal (anon/authenticated user) request. These tables
-- are only ever read/written by lib/supabase/serviceClient.ts (the
-- service-role client, which bypasses RLS entirely by design) from
-- admin API routes that have already verified an admin session via
-- middleware.ts + lib/admin/session.ts. A regular logged-in user's
-- Supabase client can NEVER see these tables, at any layer.
-- ============================================================

-- ---- profiles: add a suspension flag (admin-facing user management) ----
alter table public.profiles add column if not exists suspended boolean not null default false;

-- ---- admin_users ----
create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  password_hash text not null,
  password_salt text not null,
  role text not null default 'admin' check (role in ('admin', 'superadmin')),
  -- 2FA-ready: nullable TOTP secret. Not enforced yet (no verification
  -- step wired into login), but the column exists so a future phase can
  -- add TOTP verification without a schema migration.
  totp_secret text,
  created_at timestamptz not null default now(),
  last_login_at timestamptz
);
alter table public.admin_users enable row level security;
-- No policies — see SECURITY NOTE above.

-- ---- admin_login_attempts (security dashboard: failed logins) ----
create table if not exists public.admin_login_attempts (
  id uuid primary key default gen_random_uuid(),
  username text not null,
  success boolean not null,
  ip_address text,
  created_at timestamptz not null default now()
);
create index if not exists admin_login_attempts_created_idx on public.admin_login_attempts (created_at desc);
alter table public.admin_login_attempts enable row level security;

-- ---- admin_logs (audit trail: every admin action) ----
create table if not exists public.admin_logs (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references public.admin_users(id) on delete set null,
  admin_username text,
  action text not null,
  target_type text,
  target_id text,
  details jsonb,
  ip_address text,
  created_at timestamptz not null default now()
);
create index if not exists admin_logs_created_idx on public.admin_logs (created_at desc);
alter table public.admin_logs enable row level security;

-- ---- settings (single-row site config — Phase 10 ships Maintenance
-- Mode only; more settings land in Phase 11 without needing a new
-- migration, just a new key in this table) ----
create table if not exists public.settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);
insert into public.settings (key, value)
  values ('maintenance_mode', 'false'::jsonb)
  on conflict (key) do nothing;
alter table public.settings enable row level security;
