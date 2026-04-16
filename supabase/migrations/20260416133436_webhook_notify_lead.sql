-- Trigger que invoca la Edge Function notify-lead cada vez que se inserta un lead.
-- Usa pg_net (extensión activa por defecto en Supabase) para hacer la llamada HTTP.

-- Asegurar pg_net
create extension if not exists pg_net with schema extensions;

-- Guardar el service_role JWT en Vault para no exponerlo en SQL
-- (Usamos el JWT legacy porque pg_net necesita un Bearer token completo, no las nuevas keys)
do $$
begin
  if not exists (select 1 from vault.secrets where name = 'edge_function_token') then
    perform vault.create_secret(
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsb3hidHRreXB2a2NyZXRod2V4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjMyODg4OCwiZXhwIjoyMDkxOTA0ODg4fQ.m6Vgr4kNO_13hARZ6Seya4psQbUOAflh-jVgVs9AcG0',
      'edge_function_token',
      'Service role JWT used by triggers to invoke Edge Functions'
    );
  end if;
end $$;

-- Función trigger
create or replace function public.trigger_notify_lead()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  service_token text;
  request_id bigint;
begin
  -- leer el token desde Vault
  select decrypted_secret into service_token
  from vault.decrypted_secrets
  where name = 'edge_function_token'
  limit 1;

  -- llamada async a la Edge Function (no bloquea el insert)
  select net.http_post(
    url := 'https://aloxbttkypvkcrethwex.supabase.co/functions/v1/notify-lead',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || service_token
    ),
    body := jsonb_build_object(
      'type', 'INSERT',
      'table', 'leads',
      'schema', 'public',
      'record', row_to_json(NEW),
      'old_record', null
    )
  ) into request_id;

  return NEW;
end;
$$;

-- Crear trigger
drop trigger if exists notify_lead_on_insert on public.leads;
create trigger notify_lead_on_insert
  after insert on public.leads
  for each row
  execute function public.trigger_notify_lead();
