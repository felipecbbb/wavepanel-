-- Ajustes del tenant (branding mínimo) + tabla coupons para descuentos.

-- 1. Ajustes del tenant en schools
alter table public.schools
  add column if not exists description text,
  add column if not exists logo_url text,
  add column if not exists primary_color text not null default '#ffcc01'
    check (primary_color ~ '^#[0-9A-Fa-f]{6}$'),
  add column if not exists contact_email text,
  add column if not exists contact_phone text,
  add column if not exists address text,
  add column if not exists city text,
  add column if not exists timezone text not null default 'Europe/Madrid';

-- 2. Coupons — descuentos aplicables a distintas líneas de negocio
create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  code text not null check (length(code) between 2 and 40),
  name text,
  discount_type text not null default 'percentage'
    check (discount_type in ('percentage','fixed')),
  -- percentage: valor 0-100; fixed: céntimos
  discount_value integer not null check (discount_value >= 0),
  applies_to text not null default 'all'
    check (applies_to in ('all','class','camp','bono','product','rental')),
  activity_id uuid references public.activities(id) on delete set null,
  camp_id uuid references public.surf_camps(id) on delete set null,
  min_amount_cents integer not null default 0 check (min_amount_cents >= 0),
  max_uses integer,
  used_count integer not null default 0 check (used_count >= 0),
  max_uses_per_user integer,
  starts_at timestamptz,
  expires_at timestamptz,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (school_id, code)
);

create index if not exists coupons_school_idx on public.coupons (school_id);
create index if not exists coupons_active_idx on public.coupons (school_id, active) where active;

drop trigger if exists coupons_updated_at on public.coupons;
create trigger coupons_updated_at before update on public.coupons
  for each row execute function public.tg_set_updated_at();

-- 3. RLS en coupons
alter table public.coupons enable row level security;

drop policy if exists "members select coupons" on public.coupons;
create policy "members select coupons" on public.coupons for select
  to authenticated
  using (school_id in (select public.current_user_school_ids()));

drop policy if exists "members write coupons" on public.coupons;
create policy "members write coupons" on public.coupons for all
  to authenticated
  using (school_id in (select public.current_user_school_ids()))
  with check (school_id in (select public.current_user_school_ids()));
