-- Fix: recursion infinita en la policy de school_members.
--
-- El fallo: la policy hacia SELECT school_id FROM public.current_user_school_ids(),
-- y la funcion hacia SELECT de school_members. Postgres inlineaba la funcion SQL
-- dentro de la policy y entraba en loop antes de que SECURITY DEFINER cortara.
--
-- Dos cambios:
--   1. current_user_school_ids ahora es PLPGSQL (no inlineable por el planner).
--   2. La policy de SELECT sobre school_members deja de llamar a esa funcion;
--      simplemente permite ver tu propia membership (user_id = auth.uid()).
--      Listar miembros de la MISMA escuela (para ver colegas) se hara por RPC
--      dedicada mas adelante.

-- 1. Reemplazar la funcion con PLPGSQL
create or replace function public.current_user_school_ids()
returns setof uuid
language plpgsql
security definer
set search_path = public
stable
as $$
begin
  return query
    select school_id from public.school_members where user_id = auth.uid();
end;
$$;

-- 2. Simplificar la policy de SELECT en school_members
drop policy if exists "members read members" on public.school_members;
create policy "members read own membership"
  on public.school_members for select
  to authenticated
  using (user_id = auth.uid());

-- 3. La policy de "owners manage members" tambien se apoyaba en sub-select
--    sobre school_members y podia disparar recursion. La reescribimos para
--    MVP: cada user puede gestionar sus propias filas de school_members.
--    (Invitar a un tercero se hara via RPC security definer cuando toque.)
drop policy if exists "owners manage members" on public.school_members;
create policy "self write membership"
  on public.school_members for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
