-- Eliminar funciones de debug usadas para diagnosticar RLS
drop function if exists public.whoami();
drop function if exists public.inspect_leads_policies();
drop function if exists public.inspect_leads_grants();
