-- WavePanel SaaS multi-tenant: tablas base (schools + school_members)
-- Compartido entre todos los tenants Básico/Pro. RLS aísla datos por school_id.
-- El Plan Personalizado NO usa estas tablas (cada cliente tiene su propio Supabase).

-- =======================
-- 1. schools
-- =======================
create table if not exists public.schools (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null
    check (slug ~ '^[a-z0-9][a-z0-9-]{1,48}[a-z0-9]$'),
  name text not null check (length(name) between 2 and 100),
  plan text not null default 'basico'
    check (plan in ('basico','pro','personalizado')),
  trial_ends_at timestamptz not null default (now() + interval '14 days'),
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  -- trialing | active | past_due | canceled | unpaid | incomplete | incomplete_expired
  stripe_status text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists schools_slug_idx on public.schools (slug);
create index if not exists schools_stripe_sub_idx
  on public.schools (stripe_subscription_id)
  where stripe_subscription_id is not null;

-- =======================
-- 2. school_members
-- =======================
create table if not exists public.school_members (
  school_id uuid not null references public.schools(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'staff' check (role in ('owner','admin','staff')),
  created_at timestamptz not null default now(),
  primary key (school_id, user_id)
);

create index if not exists school_members_user_idx on public.school_members (user_id);

-- =======================
-- 3. helpers
-- =======================

-- Schools del user autenticado. Se usa dentro de policies para evitar recursión.
create or replace function public.current_user_school_ids()
returns setof uuid
language sql
security definer
set search_path = public
stable
as $$
  select school_id from public.school_members where user_id = auth.uid();
$$;

grant execute on function public.current_user_school_ids() to authenticated;

-- updated_at automático
create or replace function public.tg_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists schools_updated_at on public.schools;
create trigger schools_updated_at
  before update on public.schools
  for each row execute function public.tg_set_updated_at();

-- =======================
-- 4. RLS
-- =======================
alter table public.schools enable row level security;
alter table public.school_members enable row level security;

-- Miembros pueden leer la info de su school
drop policy if exists "members read school" on public.schools;
create policy "members read school"
  on public.schools for select
  to authenticated
  using (id in (select public.current_user_school_ids()));

-- Owners/admins actualizan su school (no tocan billing/stripe_* directamente desde UI —
-- eso se hace vía service_role en webhooks de Stripe)
drop policy if exists "owners/admins update school" on public.schools;
create policy "owners/admins update school"
  on public.schools for update
  to authenticated
  using (
    id in (
      select school_id from public.school_members
      where user_id = auth.uid() and role in ('owner','admin')
    )
  );

-- Miembros pueden leer quién más es miembro de su school
drop policy if exists "members read members" on public.school_members;
create policy "members read members"
  on public.school_members for select
  to authenticated
  using (school_id in (select public.current_user_school_ids()));

-- Solo owners pueden invitar/expulsar miembros
drop policy if exists "owners manage members" on public.school_members;
create policy "owners manage members"
  on public.school_members for all
  to authenticated
  using (
    school_id in (
      select school_id from public.school_members
      where user_id = auth.uid() and role = 'owner'
    )
  )
  with check (
    school_id in (
      select school_id from public.school_members
      where user_id = auth.uid() and role = 'owner'
    )
  );

-- INSERT inicial de schools/members durante signup se hace via service_role
-- (route handler /api/signup), NO con estas policies. Por eso no hay policy de INSERT
-- permisiva para authenticated.

-- =======================
-- 5. Signup atómico (SECURITY DEFINER)
-- =======================
-- Llamado desde el route handler /api/signup después de auth.signUp.
-- Crea school + vincula al user como owner en una sola transacción.
create or replace function public.create_school_with_owner(
  p_slug text,
  p_name text
)
returns public.schools
language plpgsql
security definer
set search_path = public
as $$
declare
  v_school public.schools;
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'not authenticated';
  end if;

  insert into public.schools (slug, name)
  values (p_slug, p_name)
  returning * into v_school;

  insert into public.school_members (school_id, user_id, role)
  values (v_school.id, v_user_id, 'owner');

  return v_school;
end;
$$;

revoke all on function public.create_school_with_owner(text, text) from public;
grant execute on function public.create_school_with_owner(text, text) to authenticated;
