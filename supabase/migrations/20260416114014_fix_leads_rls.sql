-- Fix RLS para que las nuevas publishable keys (sb_publishable_*) puedan insertar.
-- Las nuevas keys de Supabase pueden autenticarse como 'public' en lugar de 'anon'
-- según la configuración del proyecto.

drop policy if exists "anon insert leads" on public.leads;

create policy "public insert leads"
  on public.leads
  for insert
  to public
  with check (true);
