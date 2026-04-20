-- Tabla `school_integrations` — credenciales por escuela para Stripe y Resend.
-- Una fila por school. Se crea on-demand al primer save desde /ajustes.
-- RLS: solo owner/admin pueden leer/escribir su propia fila. Nada es público.

create table if not exists public.school_integrations (
  school_id uuid primary key references public.schools(id) on delete cascade,
  -- Stripe: admin pega las claves desde su dashboard (pk_live_..., sk_live_...).
  -- Cuando hagamos Stripe Connect (Fase 3), esto se reemplaza por `stripe_account_id` OAuth.
  stripe_publishable_key text,
  stripe_secret_key text,
  stripe_webhook_secret text,
  -- Resend: una API key por escuela; from_address debe estar verificado en Resend.
  resend_api_key text,
  email_from_address text,
  email_from_name text,
  email_reply_to text,
  updated_at timestamptz not null default now()
);

drop trigger if exists school_integrations_updated_at on public.school_integrations;
create trigger school_integrations_updated_at
  before update on public.school_integrations
  for each row execute function public.tg_set_updated_at();

alter table public.school_integrations enable row level security;

-- Solo owners/admins de esa school pueden leer las credenciales.
drop policy if exists "owners/admins read integrations" on public.school_integrations;
create policy "owners/admins read integrations"
  on public.school_integrations for select
  to authenticated
  using (
    school_id in (
      select school_id from public.school_members
      where user_id = auth.uid() and role in ('owner','admin')
    )
  );

drop policy if exists "owners/admins write integrations" on public.school_integrations;
create policy "owners/admins write integrations"
  on public.school_integrations for all
  to authenticated
  using (
    school_id in (
      select school_id from public.school_members
      where user_id = auth.uid() and role in ('owner','admin')
    )
  )
  with check (
    school_id in (
      select school_id from public.school_members
      where user_id = auth.uid() and role in ('owner','admin')
    )
  );
