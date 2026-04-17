-- Fix: evitar doble inscripción a la misma clase.
-- La constraint `unique (class_id, client_id, family_member_id)` de
-- class_enrollments no protege en Postgres cuando family_member_id es NULL
-- (NULL != NULL en UNIQUE), así que un cliente podía reservarse dos veces.
--
-- Dos cambios:
--  1. Índices únicos parciales que SÍ cubren el caso NULL.
--  2. Validación adicional en book_class: rechazar si ya existe
--     enrollment activo (confirmed/completed) para el par.

-- 1. Índices únicos parciales
--    a) para cuando family_member_id IS NULL (cliente principal)
create unique index if not exists class_enrollments_unique_client_no_family
  on public.class_enrollments (class_id, client_id)
  where family_member_id is null
    and status in ('confirmed','completed');

--    b) para cuando family_member_id es non-null (miembro de familia)
create unique index if not exists class_enrollments_unique_family
  on public.class_enrollments (class_id, family_member_id)
  where family_member_id is not null
    and status in ('confirmed','completed');

-- 2. Validación extra en el RPC book_class (antes del insert)
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
  select * into v_class from public.surf_classes where id = p_class_id for update;
  if v_class is null then raise exception 'class_not_found'; end if;
  if not v_class.published then raise exception 'class_not_published'; end if;
  if v_class.starts_at <= now() then raise exception 'class_in_past'; end if;
  if v_class.enrolled_count >= v_class.max_students then raise exception 'class_full'; end if;

  v_school_id := v_class.school_id;

  perform 1 from public.clients where id = p_client_id and school_id = v_school_id;
  if not found then raise exception 'client_mismatch'; end if;

  if p_family_member_id is not null then
    perform 1 from public.family_members
      where id = p_family_member_id and client_id = p_client_id;
    if not found then raise exception 'family_member_mismatch'; end if;
  end if;

  -- Ya inscrito? Rechazar.
  if exists (
    select 1 from public.class_enrollments
    where class_id = p_class_id
      and client_id = p_client_id
      and (
        (family_member_id is null and p_family_member_id is null) or
        (family_member_id = p_family_member_id)
      )
      and status in ('confirmed','completed')
  ) then
    raise exception 'already_enrolled';
  end if;

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
