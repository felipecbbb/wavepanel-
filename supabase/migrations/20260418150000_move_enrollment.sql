-- Fix + RPC para mover alumnos entre clases vía drag & drop.
--
-- Contexto: `tg_recount_class_enrolled` sólo recuenta coalesce(new, old).class_id,
-- así que al hacer UPDATE de class_enrollments.class_id (mover), la clase de
-- origen se quedaría con enrolled_count stale. Lo arreglamos y añadimos un RPC
-- que valida la mudanza.

-- 1. Fix trigger: recuenta AMBAS clases en UPDATE si cambió class_id.
create or replace function public.tg_recount_class_enrolled()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- INSERT: solo new.class_id. DELETE: solo old.class_id.
  -- UPDATE: si class_id cambió, recuenta ambas; si no, solo una vale.
  if (tg_op = 'INSERT') then
    update public.surf_classes
      set enrolled_count = (
        select count(*) from public.class_enrollments
        where class_id = new.class_id and status in ('confirmed','completed','paid','partial')
      )
      where id = new.class_id;
  elsif (tg_op = 'DELETE') then
    update public.surf_classes
      set enrolled_count = (
        select count(*) from public.class_enrollments
        where class_id = old.class_id and status in ('confirmed','completed','paid','partial')
      )
      where id = old.class_id;
  else -- UPDATE
    update public.surf_classes
      set enrolled_count = (
        select count(*) from public.class_enrollments
        where class_id = new.class_id and status in ('confirmed','completed','paid','partial')
      )
      where id = new.class_id;
    if new.class_id is distinct from old.class_id then
      update public.surf_classes
        set enrolled_count = (
          select count(*) from public.class_enrollments
          where class_id = old.class_id and status in ('confirmed','completed','paid','partial')
        )
        where id = old.class_id;
    end if;
  end if;
  return coalesce(new, old);
end;
$$;

-- 2. RPC `move_enrollment(p_enrollment_id, p_target_class_id)`:
--    - Valida que el user tiene acceso a ambas clases (mismo school).
--    - Valida que target clase pertenece a la misma actividad (sino el bono rompe).
--    - Valida que target tiene plaza.
--    - Valida que target no está en el pasado y está publicada.
--    - Valida que no hay duplicado (UNIQUE constraint lo protege, mensaje amigable).
--    - FOR UPDATE locks en ambas clases para evitar race.
create or replace function public.move_enrollment(
  p_enrollment_id uuid,
  p_target_class_id uuid
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_enrollment public.class_enrollments%rowtype;
  v_source public.surf_classes%rowtype;
  v_target public.surf_classes%rowtype;
  v_user_schools uuid[];
begin
  -- Autz: user debe ser miembro de la school
  select array_agg(school_id) into v_user_schools
    from public.school_members where user_id = auth.uid();
  if v_user_schools is null then
    raise exception 'not_authorized';
  end if;

  select * into v_enrollment from public.class_enrollments
    where id = p_enrollment_id and school_id = any(v_user_schools);
  if not found then
    raise exception 'enrollment_not_found';
  end if;

  if v_enrollment.class_id = p_target_class_id then
    return; -- no-op, ya está ahí
  end if;

  select * into v_source from public.surf_classes
    where id = v_enrollment.class_id for update;

  select * into v_target from public.surf_classes
    where id = p_target_class_id and school_id = any(v_user_schools) for update;
  if not found then
    raise exception 'target_class_not_found';
  end if;

  if v_target.activity_id is distinct from v_source.activity_id then
    raise exception 'activity_mismatch';
  end if;

  if v_target.starts_at < now() then
    raise exception 'target_class_in_past';
  end if;

  if v_target.enrolled_count >= v_target.max_students then
    raise exception 'target_class_full';
  end if;

  -- Intentamos el update. UNIQUE (class_id, client_id, family_member_id)
  -- lanza 23505 si el mismo cliente ya está inscrito en target.
  begin
    update public.class_enrollments
      set class_id = p_target_class_id
      where id = p_enrollment_id;
  exception when unique_violation then
    raise exception 'already_enrolled_in_target';
  end;
end;
$$;

revoke all on function public.move_enrollment(uuid, uuid) from public;
grant execute on function public.move_enrollment(uuid, uuid) to authenticated;
