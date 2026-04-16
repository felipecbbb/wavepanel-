-- Función debug para ver qué rol está usando la conexión
create or replace function public.whoami()
returns json
language sql
security definer
set search_path = public
as $$
  select json_build_object(
    'current_user', current_user,
    'session_user', session_user,
    'current_role', current_role,
    'role_setting', current_setting('role', true)
  );
$$;

grant execute on function public.whoami() to anon, authenticated, public;
