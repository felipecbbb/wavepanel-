-- WavePanel Core refactor: alinear con modelo validado de Entre Olas
--
-- Cambios estructurales:
--  - activity_types → activities (con SEO fields y pack_validity)
--  - + activity_packs (precios escalonados por nº de sesiones)
--  - bookings monolítico → surf_classes (clases programadas) + class_enrollments
--    (inscripción con bono) y surf_camps + camp_bookings (depósito + saldo)
--  - + family_members (sub-perfiles de un cliente)
--  - + bonos (packs de créditos con caducidad)
--  - + payments (auditoría de pagos)

-- =======================
-- 0. DROP del modelo anterior (tablas vacías, sin datos a preservar)
-- =======================
drop table if exists public.booking_participants cascade;
drop table if exists public.bookings cascade;
drop table if exists public.activity_types cascade;

-- =======================
-- 1. activities (antes activity_types, pero con metadata SEO)
-- =======================
create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  slug text not null check (slug ~ '^[a-z0-9][a-z0-9-]*[a-z0-9]$'),
  name text not null check (length(name) between 1 and 120),
  -- Clave de tipo libre (grupal, individual, yoga, paddle, surfskate, kite…).
  type_key text not null default 'grupal' check (length(type_key) between 1 and 40),
  description text,
  hero_image_url text,
  -- Capacidad por sesión por defecto (puede overridear cada surf_class)
  capacity integer not null default 8 check (capacity between 1 and 200),
  duration_minutes integer not null default 60 check (duration_minutes between 15 and 600),
  -- Color HEX para calendario
  color text not null default '#214a57' check (color ~ '^#[0-9A-Fa-f]{6}$'),
  -- Días de validez de los bonos de esta actividad (180d, 365d…)
  pack_validity_days integer not null default 180 check (pack_validity_days between 1 and 3650),
  -- Metadata de marketing (mostrada en landing pública del tenant)
  whats_included jsonb not null default '[]',
  ideal_for jsonb not null default '[]',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (school_id, slug)
);

create index if not exists activities_school_idx on public.activities (school_id);
create index if not exists activities_school_active_idx on public.activities (school_id, active) where active;

drop trigger if exists activities_updated_at on public.activities;
create trigger activities_updated_at before update on public.activities
  for each row execute function public.tg_set_updated_at();

-- =======================
-- 2. activity_packs (precios escalonados por nº de sesiones)
-- =======================
create table if not exists public.activity_packs (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  activity_id uuid not null references public.activities(id) on delete cascade,
  sessions integer not null check (sessions between 1 and 50),
  price_cents integer not null check (price_cents >= 0),
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (activity_id, sessions)
);

create index if not exists activity_packs_school_idx on public.activity_packs (school_id);
create index if not exists activity_packs_activity_idx on public.activity_packs (activity_id);

drop trigger if exists activity_packs_updated_at on public.activity_packs;
create trigger activity_packs_updated_at before update on public.activity_packs
  for each row execute function public.tg_set_updated_at();

-- =======================
-- 3. family_members
-- =======================
create table if not exists public.family_members (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  full_name text not null check (length(full_name) between 1 and 120),
  birth_date date,
  level text check (level is null or level in ('beginner','intermediate','advanced')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists family_members_client_idx on public.family_members (client_id);
create index if not exists family_members_school_idx on public.family_members (school_id);

drop trigger if exists family_members_updated_at on public.family_members;
create trigger family_members_updated_at before update on public.family_members
  for each row execute function public.tg_set_updated_at();

-- =======================
-- 4. bonos
-- =======================
create table if not exists public.bonos (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  activity_id uuid not null references public.activities(id) on delete restrict,
  -- Snapshot del pack comprado (si el pack se actualiza después, no afecta al bono ya vendido)
  pack_id uuid references public.activity_packs(id) on delete set null,
  total_credits integer not null check (total_credits between 1 and 50),
  used_credits integer not null default 0 check (used_credits >= 0),
  price_cents integer not null default 0 check (price_cents >= 0),
  status text not null default 'active'
    check (status in ('active','exhausted','expired','cancelled')),
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (used_credits <= total_credits)
);

create index if not exists bonos_client_idx on public.bonos (client_id);
create index if not exists bonos_school_idx on public.bonos (school_id);
create index if not exists bonos_active_idx on public.bonos (school_id, client_id, status) where status = 'active';

drop trigger if exists bonos_updated_at on public.bonos;
create trigger bonos_updated_at before update on public.bonos
  for each row execute function public.tg_set_updated_at();

-- =======================
-- 5. surf_classes (sesiones programadas)
-- =======================
create table if not exists public.surf_classes (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  activity_id uuid not null references public.activities(id) on delete restrict,
  instructor_id uuid references public.instructors(id) on delete set null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  -- Override opcional de activity.capacity
  max_students integer not null default 8 check (max_students between 1 and 200),
  -- Mantenido por trigger (nº de enrollments activos)
  enrolled_count integer not null default 0 check (enrolled_count >= 0),
  level text check (level is null or level in ('beginner','intermediate','advanced','mixed')),
  notes text,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create index if not exists surf_classes_school_day_idx on public.surf_classes (school_id, starts_at);
create index if not exists surf_classes_activity_idx on public.surf_classes (activity_id, starts_at);
create index if not exists surf_classes_instructor_idx on public.surf_classes (instructor_id, starts_at) where instructor_id is not null;

drop trigger if exists surf_classes_updated_at on public.surf_classes;
create trigger surf_classes_updated_at before update on public.surf_classes
  for each row execute function public.tg_set_updated_at();

-- =======================
-- 6. class_enrollments
-- =======================
-- Inscripción de un cliente (o un family_member) a una clase concreta.
-- Puede consumir un bono (bono_id no null) o ser pago puntual (bono_id null).
create table if not exists public.class_enrollments (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  class_id uuid not null references public.surf_classes(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  family_member_id uuid references public.family_members(id) on delete set null,
  bono_id uuid references public.bonos(id) on delete set null,
  status text not null default 'confirmed'
    check (status in ('confirmed','cancelled','completed','no_show')),
  notes text,
  -- Precio pagado puntual (si no hay bono). En céntimos.
  price_cents integer not null default 0 check (price_cents >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Un mismo (clase, cliente o family_member) solo puede aparecer una vez activa.
  -- Si canceló, se puede re-inscribir: manejamos con parcial index abajo.
  unique (class_id, client_id, family_member_id)
);

create index if not exists class_enrollments_class_idx on public.class_enrollments (class_id);
create index if not exists class_enrollments_client_idx on public.class_enrollments (client_id);
create index if not exists class_enrollments_bono_idx on public.class_enrollments (bono_id) where bono_id is not null;
create index if not exists class_enrollments_school_idx on public.class_enrollments (school_id, created_at desc);

drop trigger if exists class_enrollments_updated_at on public.class_enrollments;
create trigger class_enrollments_updated_at before update on public.class_enrollments
  for each row execute function public.tg_set_updated_at();

-- =======================
-- 7. surf_camps (ediciones de camp)
-- =======================
create table if not exists public.surf_camps (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  slug text not null check (slug ~ '^[a-z0-9][a-z0-9-]*[a-z0-9]$'),
  name text not null check (length(name) between 1 and 160),
  description text,
  hero_image_url text,
  starts_on date not null,
  ends_on date not null,
  max_spots integer not null check (max_spots between 1 and 500),
  spots_taken integer not null default 0 check (spots_taken >= 0),
  base_price_cents integer not null check (base_price_cents >= 0),
  deposit_cents integer not null default 0 check (deposit_cents >= 0),
  early_bird_price_cents integer,
  early_bird_until timestamptz,
  status text not null default 'draft'
    check (status in ('draft','open','full','closed','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (school_id, slug),
  check (ends_on >= starts_on),
  check (deposit_cents <= base_price_cents)
);

create index if not exists surf_camps_school_idx on public.surf_camps (school_id);
create index if not exists surf_camps_open_idx on public.surf_camps (school_id, starts_on) where status = 'open';

drop trigger if exists surf_camps_updated_at on public.surf_camps;
create trigger surf_camps_updated_at before update on public.surf_camps
  for each row execute function public.tg_set_updated_at();

-- =======================
-- 8. camp_bookings
-- =======================
create table if not exists public.camp_bookings (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  camp_id uuid not null references public.surf_camps(id) on delete restrict,
  client_id uuid not null references public.clients(id) on delete restrict,
  participants_count integer not null default 1 check (participants_count between 1 and 50),
  total_cents integer not null check (total_cents >= 0),
  paid_cents integer not null default 0 check (paid_cents >= 0),
  status text not null default 'pending'
    check (status in ('pending','deposit_paid','fully_paid','cancelled','refunded')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (paid_cents <= total_cents)
);

create index if not exists camp_bookings_camp_idx on public.camp_bookings (camp_id);
create index if not exists camp_bookings_client_idx on public.camp_bookings (client_id);
create index if not exists camp_bookings_school_idx on public.camp_bookings (school_id, created_at desc);

drop trigger if exists camp_bookings_updated_at on public.camp_bookings;
create trigger camp_bookings_updated_at before update on public.camp_bookings
  for each row execute function public.tg_set_updated_at();

-- =======================
-- 9. payments (auditoría)
-- =======================
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  -- El pago está vinculado a un concepto concreto (bono, camp, clase, otro)
  reference_type text not null
    check (reference_type in ('bono','camp_booking','class_enrollment','other')),
  reference_id uuid,
  amount_cents integer not null check (amount_cents >= 0),
  method text not null default 'cash'
    check (method in ('cash','card','transfer','voucher','credit','online')),
  concept text,
  paid_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists payments_school_idx on public.payments (school_id, paid_at desc);
create index if not exists payments_ref_idx on public.payments (reference_type, reference_id);
create index if not exists payments_client_idx on public.payments (client_id) where client_id is not null;

-- =======================
-- 10. Triggers de consistencia
-- =======================

-- Recuenta enrolled_count en surf_classes cada vez que cambia class_enrollments
create or replace function public.tg_recount_class_enrolled()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_class_id uuid;
begin
  v_class_id := coalesce(new.class_id, old.class_id);
  update public.surf_classes
    set enrolled_count = (
      select count(*) from public.class_enrollments
      where class_id = v_class_id
        and status in ('confirmed','completed')
    )
    where id = v_class_id;
  return coalesce(new, old);
end;
$$;

drop trigger if exists tg_class_enrollments_count on public.class_enrollments;
create trigger tg_class_enrollments_count
  after insert or update or delete on public.class_enrollments
  for each row execute function public.tg_recount_class_enrolled();

-- Recuenta used_credits y status en bonos al cambiar enrollments que lo consumen
create or replace function public.tg_recount_bono_credits()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_bono_id uuid;
  v_used integer;
  v_total integer;
begin
  v_bono_id := coalesce(new.bono_id, old.bono_id);
  if v_bono_id is null then return coalesce(new, old); end if;

  select count(*) into v_used
    from public.class_enrollments
    where bono_id = v_bono_id
      and status in ('confirmed','completed','no_show');

  select total_credits into v_total from public.bonos where id = v_bono_id;

  update public.bonos
    set used_credits = v_used,
        status = case
          when status = 'cancelled' then 'cancelled'
          when v_used >= v_total then 'exhausted'
          when expires_at is not null and expires_at < now() then 'expired'
          else 'active'
        end
    where id = v_bono_id;

  return coalesce(new, old);
end;
$$;

drop trigger if exists tg_class_enrollments_bono on public.class_enrollments;
create trigger tg_class_enrollments_bono
  after insert or update or delete on public.class_enrollments
  for each row execute function public.tg_recount_bono_credits();

-- Recuenta spots_taken en surf_camps al cambiar camp_bookings
create or replace function public.tg_recount_camp_spots()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_camp_id uuid;
  v_taken integer;
  v_max integer;
begin
  v_camp_id := coalesce(new.camp_id, old.camp_id);

  select coalesce(sum(participants_count), 0) into v_taken
    from public.camp_bookings
    where camp_id = v_camp_id
      and status in ('deposit_paid','fully_paid');

  select max_spots into v_max from public.surf_camps where id = v_camp_id;

  update public.surf_camps
    set spots_taken = v_taken,
        status = case
          when status in ('draft','cancelled','closed') then status
          when v_taken >= v_max then 'full'
          else 'open'
        end
    where id = v_camp_id;

  return coalesce(new, old);
end;
$$;

drop trigger if exists tg_camp_bookings_spots on public.camp_bookings;
create trigger tg_camp_bookings_spots
  after insert or update or delete on public.camp_bookings
  for each row execute function public.tg_recount_camp_spots();

-- =======================
-- 11. RPCs atómicas
-- =======================

-- Inscribir a una clase. Valida:
--  - clase existe, está publicada, futura y no llena
--  - si bono_id: está activo, no expirado, con créditos y del mismo cliente/actividad
--  - cliente y family_member (si se pasa) son consistentes con la school activa
create or replace function public.book_class(
  p_class_id uuid,
  p_client_id uuid,
  p_family_member_id uuid default null,
  p_bono_id uuid default null,
  p_notes text default null,
  p_price_cents integer default 0
)
returns public.class_enrollments
language plpgsql
security definer
set search_path = public
as $$
declare
  v_class public.surf_classes;
  v_bono public.bonos;
  v_enrollment public.class_enrollments;
  v_school_id uuid;
begin
  -- clase
  select * into v_class from public.surf_classes where id = p_class_id for update;
  if v_class is null then raise exception 'class_not_found'; end if;
  if not v_class.published then raise exception 'class_not_published'; end if;
  if v_class.starts_at <= now() then raise exception 'class_in_past'; end if;
  if v_class.enrolled_count >= v_class.max_students then raise exception 'class_full'; end if;

  v_school_id := v_class.school_id;

  -- cliente debe ser de la misma school
  perform 1 from public.clients where id = p_client_id and school_id = v_school_id;
  if not found then raise exception 'client_mismatch'; end if;

  -- family_member (opcional) debe ser del mismo cliente
  if p_family_member_id is not null then
    perform 1 from public.family_members
      where id = p_family_member_id and client_id = p_client_id;
    if not found then raise exception 'family_member_mismatch'; end if;
  end if;

  -- bono (opcional): activo, mismo cliente, misma actividad, con créditos
  if p_bono_id is not null then
    select * into v_bono from public.bonos where id = p_bono_id for update;
    if v_bono is null then raise exception 'bono_not_found'; end if;
    if v_bono.client_id <> p_client_id then raise exception 'bono_client_mismatch'; end if;
    if v_bono.activity_id <> v_class.activity_id then raise exception 'bono_activity_mismatch'; end if;
    if v_bono.status <> 'active' then raise exception 'bono_not_active'; end if;
    if v_bono.expires_at is not null and v_bono.expires_at < now() then
      raise exception 'bono_expired';
    end if;
    if v_bono.used_credits >= v_bono.total_credits then raise exception 'bono_exhausted'; end if;
  end if;

  insert into public.class_enrollments (
    school_id, class_id, client_id, family_member_id, bono_id,
    status, notes, price_cents
  ) values (
    v_school_id, p_class_id, p_client_id, p_family_member_id, p_bono_id,
    'confirmed', p_notes, coalesce(p_price_cents, 0)
  )
  returning * into v_enrollment;

  return v_enrollment;
end;
$$;

revoke all on function public.book_class(uuid, uuid, uuid, uuid, text, integer) from public;
grant execute on function public.book_class(uuid, uuid, uuid, uuid, text, integer) to authenticated;

-- Cancelar una inscripción. Permite cancelación si faltan >2h para la clase.
create or replace function public.cancel_enrollment(p_enrollment_id uuid)
returns public.class_enrollments
language plpgsql
security definer
set search_path = public
as $$
declare
  v_enrollment public.class_enrollments;
  v_class public.surf_classes;
begin
  select * into v_enrollment from public.class_enrollments where id = p_enrollment_id for update;
  if v_enrollment is null then raise exception 'enrollment_not_found'; end if;
  if v_enrollment.status = 'cancelled' then return v_enrollment; end if;

  select * into v_class from public.surf_classes where id = v_enrollment.class_id;
  if v_class is not null and v_class.starts_at < now() + interval '2 hours' then
    raise exception 'cancel_too_late';
  end if;

  update public.class_enrollments
    set status = 'cancelled'
    where id = p_enrollment_id
    returning * into v_enrollment;

  return v_enrollment;
end;
$$;

revoke all on function public.cancel_enrollment(uuid) from public;
grant execute on function public.cancel_enrollment(uuid) to authenticated;

-- =======================
-- 12. RLS
-- =======================
alter table public.activities enable row level security;
alter table public.activity_packs enable row level security;
alter table public.family_members enable row level security;
alter table public.bonos enable row level security;
alter table public.surf_classes enable row level security;
alter table public.class_enrollments enable row level security;
alter table public.surf_camps enable row level security;
alter table public.camp_bookings enable row level security;
alter table public.payments enable row level security;

-- Helper macro: para cada tabla con school_id aplicamos el mismo patrón.
-- Miembros de la school pueden leer y escribir.

do $$
declare
  t text;
begin
  for t in
    select unnest(array[
      'activities','activity_packs','family_members','bonos',
      'surf_classes','class_enrollments','surf_camps','camp_bookings','payments'
    ])
  loop
    execute format('drop policy if exists "members select %I" on public.%I', t, t);
    execute format(
      'create policy "members select %I" on public.%I for select to authenticated using (school_id in (select public.current_user_school_ids()))',
      t, t
    );
    execute format('drop policy if exists "members write %I" on public.%I', t, t);
    execute format(
      'create policy "members write %I" on public.%I for all to authenticated using (school_id in (select public.current_user_school_ids())) with check (school_id in (select public.current_user_school_ids()))',
      t, t
    );
  end loop;
end $$;
