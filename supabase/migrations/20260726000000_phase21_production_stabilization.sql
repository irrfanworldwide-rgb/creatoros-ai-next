-- Phase 21: production stabilization
-- Apply this file to existing projects after the reference schema. It is
-- deliberately idempotent so production and staging can converge safely.

alter table public.profiles add column if not exists suspended boolean not null default false;
alter table public.profiles enable row level security;
alter table public.daily_usage enable row level security;
alter table public.generations enable row level security;
alter table public.payments enable row level security;
alter table public.webhook_events enable row level security;

-- Browser clients may create and read only their own profile. Entitlement,
-- suspension, subscription, usage, and payment fields are server controlled.
drop policy if exists "profiles: select own" on public.profiles;
drop policy if exists "profiles: insert own" on public.profiles;
drop policy if exists "profiles: update own" on public.profiles;
create policy "profiles: select own" on public.profiles
  for select to authenticated using ((select auth.uid()) = id);
create policy "profiles: insert own" on public.profiles
  for insert to authenticated with check (
    (select auth.uid()) = id
    and plan = 'free'
    and suspended = false
    and razorpay_subscription_id is null
    and subscription_status is null
    and subscription_current_end is null
  );

-- The server-side reservation function below is the sole writer for usage.
drop policy if exists "daily_usage: select own" on public.daily_usage;
drop policy if exists "daily_usage: insert own" on public.daily_usage;
drop policy if exists "daily_usage: update own" on public.daily_usage;
create policy "daily_usage: select own" on public.daily_usage
  for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "generations: select own" on public.generations;
drop policy if exists "generations: insert own" on public.generations;
drop policy if exists "generations: delete own" on public.generations;
create policy "generations: select own" on public.generations
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "generations: insert own" on public.generations
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "generations: delete own" on public.generations
  for delete to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "payments: select own" on public.payments;
drop policy if exists "payments: insert own" on public.payments;
create policy "payments: select own" on public.payments
  for select to authenticated using ((select auth.uid()) = user_id);

create or replace function public.reserve_generation(p_user_id uuid)
returns table (
  allowed boolean,
  usage_today integer,
  plan text,
  free_daily_limit integer,
  reason text
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_plan text;
  v_suspended boolean;
  v_maintenance boolean := false;
  v_limit integer := 3;
  v_usage integer := 0;
  v_today date := (now() at time zone 'utc')::date;
begin
  if p_user_id is null then
    raise exception 'A user id is required.';
  end if;

  select p.plan, p.suspended
    into v_plan, v_suspended
    from public.profiles p
    where p.id = p_user_id
    for update;

  if not found then
    return query select false, 0, 'free'::text, v_limit, 'profile_missing'::text;
    return;
  end if;

  select case
    when jsonb_typeof(value) = 'boolean' then (value #>> '{}')::boolean
    else false
  end
  into v_maintenance
  from public.settings
  where key = 'maintenance_mode';

  select case
    when jsonb_typeof(value) = 'number' then greatest(1, least(1000, (value #>> '{}')::integer))
    else 3
  end
  into v_limit
  from public.settings
  where key = 'free_daily_limit';

  v_maintenance := coalesce(v_maintenance, false);
  v_limit := coalesce(v_limit, 3);

  if v_maintenance then
    return query select false, 0, coalesce(v_plan, 'free'), v_limit, 'maintenance'::text;
    return;
  end if;

  if coalesce(v_suspended, false) then
    return query select false, 0, coalesce(v_plan, 'free'), v_limit, 'suspended'::text;
    return;
  end if;

  if v_plan = 'pro' then
    insert into public.daily_usage (user_id, date, count)
    values (p_user_id, v_today, 1)
    on conflict (user_id, date) do update
      set count = public.daily_usage.count + 1
    returning count into v_usage;

    return query select true, v_usage, v_plan, v_limit, null::text;
    return;
  end if;

  insert into public.daily_usage (user_id, date, count)
  values (p_user_id, v_today, 1)
  on conflict (user_id, date) do update
    set count = public.daily_usage.count + 1
    where public.daily_usage.count < v_limit
  returning count into v_usage;

  if found then
    return query select true, v_usage, coalesce(v_plan, 'free'), v_limit, null::text;
    return;
  end if;

  select count into v_usage
  from public.daily_usage
  where user_id = p_user_id and date = v_today;

  return query select false, coalesce(v_usage, 0), coalesce(v_plan, 'free'), v_limit, 'limit'::text;
end;
$$;

create or replace function public.release_generation_reservation(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_today date := (now() at time zone 'utc')::date;
begin
  if p_user_id is null then
    raise exception 'A user id is required.';
  end if;

  update public.daily_usage
  set count = greatest(count - 1, 0)
  where user_id = p_user_id and date = v_today;
end;
$$;

revoke all on function public.reserve_generation(uuid) from public;
revoke all on function public.release_generation_reservation(uuid) from public;
grant execute on function public.reserve_generation(uuid) to service_role;
grant execute on function public.release_generation_reservation(uuid) to service_role;
