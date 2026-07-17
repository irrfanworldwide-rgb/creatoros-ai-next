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
-- payments — audit trail for Razorpay upgrades (Phase 5)
-- ============================================================
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  razorpay_order_id text not null,
  razorpay_payment_id text not null unique,
  status text not null default 'paid',
  created_at timestamptz not null default now()
);

create index if not exists payments_user_idx on public.payments (user_id, created_at desc);

alter table public.payments enable row level security;

drop policy if exists "payments: select own" on public.payments;
create policy "payments: select own" on public.payments
  for select using (auth.uid() = user_id);

drop policy if exists "payments: insert own" on public.payments;
create policy "payments: insert own" on public.payments
  for insert with check (auth.uid() = user_id);

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
