-- WavePanel Core: clients, instructors, activity_types, bookings
-- Todas las tablas están aisladas por school_id con RLS.

-- =======================
-- 1. clients
-- =======================
create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  -- vínculo opcional a un auth.users si el cliente se autoregistró en el futuro portal público
  auth_user_id uuid references auth.users(id) on delete set null,
  name text not null check (length(name) between 1 and 120),
  email text,
  phone text,
  notes text,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists clients_school_idx on public.clients (school_id);
create index if not exists clients_school_name_idx on public.clients (school_id, name);
create index if not exists clients_school_email_idx on public.clients (school_id, email) where email is not null;

drop trigger if exists clients_updated_at on public.clients;
create trigger clients_updated_at before update on public.clients
  for each row execute function public.tg_set_updated_at();

-- =======================
-- 2. instructors
-- =======================
create table if not exists public.instructors (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  auth_user_id uuid references auth.users(id) on delete set null,
  name text not null check (length(name) between 1 and 120),
  email text,
  phone text,
  -- Color HEX para pintar sus reservas en el calendario
  color text not null default '#ffcc01' check (color ~ '^#[0-9A-Fa-f]{6}$'),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists instructors_school_idx on public.instructors (school_id);
create index if not exists instructors_school_active_idx on public.instructors (school_id, active) where active;

drop trigger if exists instructors_updated_at on public.instructors;
create trigger instructors_updated_at before update on public.instructors
  for each row execute function public.tg_set_updated_at();

-- =======================
-- 3. activity_types
-- =======================
-- Tipos de actividad que vende la escuela (Surf grupal, Kite, Yoga, etc.)
create table if not exists public.activity_types (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  name text not null check (length(name) between 1 and 80),
  slug text not null check (slug ~ '^[a-z0-9][a-z0-9-]*[a-z0-9]$'),
  description text,
  -- Duración en minutos
  duration_minutes integer not null default 60 check (duration_minutes between 15 and 600),
  -- Capacidad máxima por sesión
  capacity integer not null default 8 check (capacity between 1 and 200),
  -- Precio en céntimos (evita floats)
  price_cents integer not null default 0 check (price_cents >= 0),
  -- Color HEX para el calendario
  color text not null default '#214a57' check (color ~ '^#[0-9A-Fa-f]{6}$'),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (school_id, slug)
);

create index if not exists activity_types_school_idx on public.activity_types (school_id);

drop trigger if exists activity_types_updated_at on public.activity_types;
create trigger activity_types_updated_at before update on public.activity_types
  for each row execute function public.tg_set_updated_at();

-- =======================
-- 4. bookings
-- =======================
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  activity_type_id uuid not null references public.activity_types(id) on delete restrict,
  instructor_id uuid references public.instructors(id) on delete set null,
  -- Cliente principal de la reserva (si es grupal, los demás van en booking_participants)
  client_id uuid references public.clients(id) on delete set null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'confirmed'
    check (status in ('pending','confirmed','cancelled','no_show','completed')),
  -- Cantidad total de participantes (incluyendo client_id si está puesto)
  participants_count integer not null default 1 check (participants_count between 1 and 200),
  notes text,
  -- Total cobrado en céntimos, para histórico (opcional; puede venir del activity_type)
  total_cents integer not null default 0 check (total_cents >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create index if not exists bookings_school_idx on public.bookings (school_id);
create index if not exists bookings_school_day_idx on public.bookings (school_id, starts_at);
create index if not exists bookings_instructor_day_idx on public.bookings (school_id, instructor_id, starts_at)
  where instructor_id is not null;

drop trigger if exists bookings_updated_at on public.bookings;
create trigger bookings_updated_at before update on public.bookings
  for each row execute function public.tg_set_updated_at();

-- =======================
-- 5. booking_participants
-- =======================
-- Permite que una reserva tenga varios clientes (clase grupal).
create table if not exists public.booking_participants (
  booking_id uuid not null references public.bookings(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (booking_id, client_id)
);

create index if not exists booking_participants_client_idx on public.booking_participants (client_id);

-- =======================
-- 6. RLS
-- =======================
alter table public.clients enable row level security;
alter table public.instructors enable row level security;
alter table public.activity_types enable row level security;
alter table public.bookings enable row level security;
alter table public.booking_participants enable row level security;

-- Regla genérica para las 4 primeras: solo miembros de la school pueden ver/crear/modificar
-- (a futuro podríamos restringir role 'staff' a menos permisos; de momento todos los miembros
-- son staff o superiores y pueden gestionar)

-- Macro para recorte
-- clients ------------------------------------------------------------
drop policy if exists "members select clients" on public.clients;
create policy "members select clients" on public.clients for select
  to authenticated
  using (school_id in (select public.current_user_school_ids()));

drop policy if exists "members write clients" on public.clients;
create policy "members write clients" on public.clients for all
  to authenticated
  using (school_id in (select public.current_user_school_ids()))
  with check (school_id in (select public.current_user_school_ids()));

-- instructors --------------------------------------------------------
drop policy if exists "members select instructors" on public.instructors;
create policy "members select instructors" on public.instructors for select
  to authenticated
  using (school_id in (select public.current_user_school_ids()));

drop policy if exists "members write instructors" on public.instructors;
create policy "members write instructors" on public.instructors for all
  to authenticated
  using (school_id in (select public.current_user_school_ids()))
  with check (school_id in (select public.current_user_school_ids()));

-- activity_types -----------------------------------------------------
drop policy if exists "members select activity_types" on public.activity_types;
create policy "members select activity_types" on public.activity_types for select
  to authenticated
  using (school_id in (select public.current_user_school_ids()));

drop policy if exists "members write activity_types" on public.activity_types;
create policy "members write activity_types" on public.activity_types for all
  to authenticated
  using (school_id in (select public.current_user_school_ids()))
  with check (school_id in (select public.current_user_school_ids()));

-- bookings -----------------------------------------------------------
drop policy if exists "members select bookings" on public.bookings;
create policy "members select bookings" on public.bookings for select
  to authenticated
  using (school_id in (select public.current_user_school_ids()));

drop policy if exists "members write bookings" on public.bookings;
create policy "members write bookings" on public.bookings for all
  to authenticated
  using (school_id in (select public.current_user_school_ids()))
  with check (school_id in (select public.current_user_school_ids()));

-- booking_participants (se valida a través de bookings.school_id) -----
drop policy if exists "members select booking_participants" on public.booking_participants;
create policy "members select booking_participants" on public.booking_participants for select
  to authenticated
  using (
    booking_id in (
      select id from public.bookings
      where school_id in (select public.current_user_school_ids())
    )
  );

drop policy if exists "members write booking_participants" on public.booking_participants;
create policy "members write booking_participants" on public.booking_participants for all
  to authenticated
  using (
    booking_id in (
      select id from public.bookings
      where school_id in (select public.current_user_school_ids())
    )
  )
  with check (
    booking_id in (
      select id from public.bookings
      where school_id in (select public.current_user_school_ids())
    )
  );
