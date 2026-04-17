-- Capa 2: policies que permiten al alumno autenticado ver y gestionar SUS PROPIOS
-- datos (ficha clients, family_members, bonos, class_enrollments, camp_bookings,
-- payments). Los miembros de la school siguen viendo todo a nivel tenant
-- (esas policies ya existen y coexisten con las nuevas).
--
-- + RPC register_client_for_school: crea fila en clients al hacer signup del
--   alumno sin ser school_member.

-- 1. clients: alumno lee/edita SU fila (auth_user_id = auth.uid())
drop policy if exists "self read client" on public.clients;
create policy "self read client"
  on public.clients for select
  to authenticated
  using (auth_user_id = auth.uid());

drop policy if exists "self update client" on public.clients;
create policy "self update client"
  on public.clients for update
  to authenticated
  using (auth_user_id = auth.uid())
  with check (auth_user_id = auth.uid());

-- 2. family_members: el alumno gestiona la familia de SU cliente
drop policy if exists "self read family" on public.family_members;
create policy "self read family"
  on public.family_members for select
  to authenticated
  using (
    client_id in (select id from public.clients where auth_user_id = auth.uid())
  );

drop policy if exists "self write family" on public.family_members;
create policy "self write family"
  on public.family_members for all
  to authenticated
  using (
    client_id in (select id from public.clients where auth_user_id = auth.uid())
  )
  with check (
    client_id in (select id from public.clients where auth_user_id = auth.uid())
  );

-- 3. bonos: el alumno ve SOLO sus bonos (escritura privada al admin)
drop policy if exists "self read bonos" on public.bonos;
create policy "self read bonos"
  on public.bonos for select
  to authenticated
  using (
    client_id in (select id from public.clients where auth_user_id = auth.uid())
  );

-- 4. class_enrollments: lectura de las SUYAS (y las de su familia).
--    El INSERT se hace via RPC book_class (security definer), no directo.
drop policy if exists "self read enrollments" on public.class_enrollments;
create policy "self read enrollments"
  on public.class_enrollments for select
  to authenticated
  using (
    client_id in (select id from public.clients where auth_user_id = auth.uid())
  );

-- 5. camp_bookings: lectura de las SUYAS
drop policy if exists "self read camp bookings" on public.camp_bookings;
create policy "self read camp bookings"
  on public.camp_bookings for select
  to authenticated
  using (
    client_id in (select id from public.clients where auth_user_id = auth.uid())
  );

-- 6. payments: lectura de los SUYOS
drop policy if exists "self read payments" on public.payments;
create policy "self read payments"
  on public.payments for select
  to authenticated
  using (
    client_id in (select id from public.clients where auth_user_id = auth.uid())
  );

-- =======================
-- RPC: register_client_for_school
-- =======================
-- Llamado tras auth.signUp() del alumno en /{slug}/auth/signup.
-- Si ya existe una fila en clients con ese email + school Y sin auth_user_id,
-- la vincula (el admin puede haberlo creado a mano antes).
-- Si no, crea una nueva fila. Un mismo auth.uid() puede tener varias filas en
-- clients, una por school (cliente multi-escuela).
create or replace function public.register_client_for_school(
  p_school_slug text,
  p_name text,
  p_phone text default null
)
returns public.clients
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_user_email text;
  v_school_id uuid;
  v_client public.clients;
begin
  if v_user_id is null then
    raise exception 'not authenticated';
  end if;

  select id into v_school_id from public.schools where slug = p_school_slug;
  if v_school_id is null then
    raise exception 'school_not_found';
  end if;

  select email into v_user_email from auth.users where id = v_user_id;

  -- ¿Ya existe ficha con ese auth_user_id para esta school?
  select * into v_client from public.clients
    where auth_user_id = v_user_id and school_id = v_school_id
    limit 1;
  if v_client.id is not null then
    return v_client;
  end if;

  -- ¿El admin ya creó una ficha con el mismo email, sin vincular? La vinculamos.
  if v_user_email is not null then
    update public.clients
      set auth_user_id = v_user_id,
          name = coalesce(nullif(name, ''), p_name),
          phone = coalesce(phone, p_phone)
      where school_id = v_school_id
        and auth_user_id is null
        and lower(email) = lower(v_user_email)
      returning * into v_client;
    if v_client.id is not null then
      return v_client;
    end if;
  end if;

  -- Crear ficha nueva
  insert into public.clients (school_id, auth_user_id, name, email, phone)
  values (v_school_id, v_user_id, coalesce(p_name, 'Sin nombre'), v_user_email, p_phone)
  returning * into v_client;

  return v_client;
end;
$$;

revoke all on function public.register_client_for_school(text, text, text) from public;
grant execute on function public.register_client_for_school(text, text, text) to authenticated;
