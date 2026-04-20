-- Módulos: alquiler de material + tienda (productos y pedidos).
-- Todo con RLS por school_id: miembros leen/escriben solo su escuela.

-- =======================================================
-- 1. ALQUILER DE MATERIAL
-- =======================================================

create table if not exists public.rental_equipment (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  name text not null check (length(name) between 1 and 120),
  category text not null check (category in ('board','wetsuit','leash','softboard','longboard','fin','other')),
  size text,
  stock integer not null default 1 check (stock >= 0),
  price_per_day_cents integer not null default 0 check (price_per_day_cents >= 0),
  notes text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists rental_equipment_school_idx on public.rental_equipment (school_id);

drop trigger if exists rental_equipment_updated_at on public.rental_equipment;
create trigger rental_equipment_updated_at before update on public.rental_equipment
  for each row execute function public.tg_set_updated_at();

create table if not exists public.rentals (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  client_name_snapshot text, -- Por si el client_id se nulifica
  equipment_id uuid not null references public.rental_equipment(id) on delete restrict,
  starts_on date not null,
  ends_on date not null,
  quantity integer not null default 1 check (quantity >= 1),
  total_cents integer not null default 0 check (total_cents >= 0),
  paid_cents integer not null default 0 check (paid_cents >= 0),
  status text not null default 'reserved'
    check (status in ('reserved','active','returned','cancelled')),
  notes text,
  created_at timestamptz not null default now(),
  check (ends_on >= starts_on)
);
create index if not exists rentals_school_idx on public.rentals (school_id, starts_on desc);
create index if not exists rentals_equipment_idx on public.rentals (equipment_id);

alter table public.rental_equipment enable row level security;
alter table public.rentals enable row level security;

drop policy if exists "members rw rental_equipment" on public.rental_equipment;
create policy "members rw rental_equipment" on public.rental_equipment for all
  to authenticated
  using (school_id in (select public.current_user_school_ids()))
  with check (school_id in (select public.current_user_school_ids()));

drop policy if exists "members rw rentals" on public.rentals;
create policy "members rw rentals" on public.rentals for all
  to authenticated
  using (school_id in (select public.current_user_school_ids()))
  with check (school_id in (select public.current_user_school_ids()));

-- =======================================================
-- 2. TIENDA (productos + pedidos)
-- =======================================================

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  name text not null check (length(name) between 1 and 160),
  slug text not null check (slug ~ '^[a-z0-9][a-z0-9-]*[a-z0-9]$'),
  description text,
  price_cents integer not null default 0 check (price_cents >= 0),
  stock integer not null default 0 check (stock >= 0),
  category text,
  image_url text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (school_id, slug)
);
create index if not exists products_school_idx on public.products (school_id);
create index if not exists products_school_active_idx on public.products (school_id, active) where active;

drop trigger if exists products_updated_at on public.products;
create trigger products_updated_at before update on public.products
  for each row execute function public.tg_set_updated_at();

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  client_name_snapshot text,
  status text not null default 'pending'
    check (status in ('pending','paid','cancelled','refunded','completed')),
  total_cents integer not null default 0 check (total_cents >= 0),
  paid_cents integer not null default 0 check (paid_cents >= 0),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists orders_school_idx on public.orders (school_id, created_at desc);

drop trigger if exists orders_updated_at on public.orders;
create trigger orders_updated_at before update on public.orders
  for each row execute function public.tg_set_updated_at();

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  name_snapshot text not null,
  quantity integer not null default 1 check (quantity >= 1),
  unit_price_cents integer not null default 0 check (unit_price_cents >= 0),
  total_cents integer not null default 0 check (total_cents >= 0),
  created_at timestamptz not null default now()
);
create index if not exists order_items_order_idx on public.order_items (order_id);

alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

drop policy if exists "members rw products" on public.products;
create policy "members rw products" on public.products for all
  to authenticated
  using (school_id in (select public.current_user_school_ids()))
  with check (school_id in (select public.current_user_school_ids()));

-- Lectura pública de productos activos para la landing del tenant
drop policy if exists "public read active products" on public.products;
create policy "public read active products" on public.products for select
  to anon, authenticated
  using (active = true);

drop policy if exists "members rw orders" on public.orders;
create policy "members rw orders" on public.orders for all
  to authenticated
  using (school_id in (select public.current_user_school_ids()))
  with check (school_id in (select public.current_user_school_ids()));

-- order_items: acceso via el order al que pertenecen.
drop policy if exists "members rw order_items" on public.order_items;
create policy "members rw order_items" on public.order_items for all
  to authenticated
  using (
    order_id in (
      select id from public.orders
      where school_id in (select public.current_user_school_ids())
    )
  )
  with check (
    order_id in (
      select id from public.orders
      where school_id in (select public.current_user_school_ids())
    )
  );

-- =======================================================
-- 3. TRIGGER: recuenta total_cents en orders según items
-- =======================================================

create or replace function public.tg_recount_order_total()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id uuid;
begin
  v_order_id := coalesce(new.order_id, old.order_id);
  update public.orders
    set total_cents = coalesce((
      select sum(total_cents) from public.order_items where order_id = v_order_id
    ), 0)
    where id = v_order_id;
  return coalesce(new, old);
end;
$$;

drop trigger if exists tg_order_items_total on public.order_items;
create trigger tg_order_items_total
  after insert or update or delete on public.order_items
  for each row execute function public.tg_recount_order_total();
