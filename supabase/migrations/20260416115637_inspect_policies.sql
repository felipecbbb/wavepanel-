-- RPC para inspeccionar políticas y permisos
create or replace function public.inspect_leads_policies()
returns table(policy_name text, roles text, cmd text, qual text, with_check text)
language sql
security definer
set search_path = public
as $$
  select policyname::text, array_to_string(roles, ',')::text, cmd::text, coalesce(qual::text, ''), coalesce(with_check::text, '')
  from pg_policies
  where tablename = 'leads' and schemaname = 'public';
$$;

create or replace function public.inspect_leads_grants()
returns table(grantee text, privilege text)
language sql
security definer
set search_path = public
as $$
  select grantee::text, privilege_type::text
  from information_schema.role_table_grants
  where table_schema = 'public' and table_name = 'leads'
  order by grantee, privilege_type;
$$;

grant execute on function public.inspect_leads_policies() to anon, authenticated, public;
grant execute on function public.inspect_leads_grants() to anon, authenticated, public;
