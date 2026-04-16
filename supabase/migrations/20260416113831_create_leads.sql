-- WavePanel · marketing leads
-- Captura todo lo que entra desde la web pública: contacto, demo, lista de espera.

create extension if not exists "pgcrypto";

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  -- Tipo de lead
  type text not null check (type in (
    'contact',          -- formulario de contacto general
    'demo_request',     -- pidió demo en vivo
    'waitlist_basic',   -- en espera del Plan Básico
    'waitlist_pro',     -- en espera del Plan Pro
    'custom_quote'      -- presupuesto Plan Personalizado
  )),

  -- Datos del lead
  name text not null,
  school text,
  email text not null,
  phone text,
  plan_interest text,            -- 'basico' | 'profesional' | 'personalizado' | 'demo' | null
  message text,

  -- Tracking comercial
  status text not null default 'new' check (status in (
    'new', 'contacted', 'qualified', 'demo_scheduled', 'won', 'lost', 'spam'
  )),
  notes text,                    -- notas internas Felipe

  -- Atribución
  source text not null default 'web',  -- 'web' | 'whatsapp' | 'referral' | 'manual' | 'instagram' | ...
  utm_source text,
  utm_medium text,
  utm_campaign text,
  referrer text,
  user_agent text,
  ip_country text                -- opcional, lo rellena Edge Function si activamos
);

create index if not exists idx_leads_created_at on public.leads (created_at desc);
create index if not exists idx_leads_status on public.leads (status);
create index if not exists idx_leads_type on public.leads (type);
create index if not exists idx_leads_email on public.leads (email);

-- RLS
alter table public.leads enable row level security;

-- Anon puede insertar (formularios públicos), pero no leer ni modificar
drop policy if exists "anon insert leads" on public.leads;
create policy "anon insert leads"
  on public.leads
  for insert
  to anon
  with check (true);

-- Authenticated NO puede hacer nada (de momento). El admin lo hacemos via service_role en Studio.
-- (Si en el futuro hacemos panel admin con auth, añadimos políticas aquí.)

comment on table public.leads is 'Leads que entran desde la web pública de WavePanel';
comment on column public.leads.type is 'contact | demo_request | waitlist_basic | waitlist_pro | custom_quote';
comment on column public.leads.status is 'new | contacted | qualified | demo_scheduled | won | lost | spam';
