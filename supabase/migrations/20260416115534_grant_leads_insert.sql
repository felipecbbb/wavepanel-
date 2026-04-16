-- Conceder INSERT a roles anon y authenticated.
-- En Supabase, RLS necesita BOTH una policy permisiva Y un GRANT explícito al rol.

grant insert on public.leads to anon;
grant insert on public.leads to authenticated;

-- Por si acaso, recreamos la policy con explicit anon + authenticated (que cubre las nuevas API keys también)
drop policy if exists "anon insert leads" on public.leads;
drop policy if exists "public insert leads" on public.leads;

create policy "leads insert from web"
  on public.leads
  for insert
  to anon, authenticated
  with check (true);
