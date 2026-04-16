-- RPC para ver las últimas llamadas HTTP que ha hecho el trigger.
-- Útil para debug. Borrar cuando el flujo esté validado.
create or replace function public.recent_webhook_calls()
returns table(id bigint, status_code int, error_msg text, called_at timestamptz, content_short text)
language sql
security definer
set search_path = public, net
as $$
  select
    r.id,
    r.status_code,
    r.error_msg,
    r.created,
    substring(coalesce(r.content::text, ''), 1, 200) as content_short
  from net._http_response r
  order by r.id desc
  limit 5;
$$;

grant execute on function public.recent_webhook_calls() to anon, authenticated, public;
