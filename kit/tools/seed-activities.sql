-- seed-activities.sql
-- Plantilla SQL para poblar las actividades base, packs y productos iniciales
-- en el Supabase de un cliente nuevo.
--
-- Ejecutar tras aplicar el schema del template:
--   psql "$DB_URL" -f seed-activities.sql
--
-- Ajusta nombres, descripciones y precios antes de ejecutar — estos son
-- defaults pensados para una escuela de surf genérica.
--
-- Schema relevante (ver wavepanel-template/supabase/migration-activities.sql
-- y wavepanel-template/supabase/schema.sql):
--   activities      (slug, type_key, nombre, descripcion, duracion, capacidad_max, activo, ...)
--   activity_packs  (activity_id, sessions, price, featured, sort_order)
--   products        (name, slug, description, price, category, status, stock)
--   bonos, profiles, etc. — no se seedean aquí (son por usuario o transaccionales).

begin;

-- ─── ACTIVIDADES BASE ───
-- slug debe coincidir con las páginas estáticas del template
-- (/clases-de-surf-grupales/, /clases-de-yoga/, etc.).
-- type_key es UNIQUE; úsalo como identificador interno estable.
insert into public.activities
  (slug, type_key, nombre, descripcion, duracion, capacidad_max, activo, sort_order, color, deposit)
values
  ('clases-de-surf-grupales',     'surf-grupal',  'Clases de surf grupales',
   'Clase de 2h en grupo. Material incluido.',           120, 10, true, 1, '#0f2f39', 15),
  ('clases-de-surf-individuales', 'surf-privada', 'Clases de surf individuales',
   'Clase 1-on-1 con instructor.',                        90,  2, true, 2, '#0f2f39', 20),
  ('clases-de-surfskate',         'surfskate',    'Clases de surfskate',
   'Iniciación al surfskate en parking.',                 60,  8, true, 3, '#0f2f39', 10),
  ('clases-de-yoga',              'yoga',         'Clases de yoga',
   'Sesión de yoga enfocada a surfistas.',                90,  8, true, 4, '#0f2f39', 10),
  ('paddle-surf',                 'paddle',       'Paddle surf (SUP)',
   'Paseo en SUP con instructor.',                       120,  8, true, 5, '#0f2f39', 15)
on conflict (slug) do nothing;

-- ─── PACKS POR ACTIVIDAD ───
-- Un pack mínimo por actividad; el cliente añade más desde admin.
-- TODO: ajustar precios a los del cliente antes de ejecutar.
insert into public.activity_packs (activity_id, sessions, price, featured, sort_order)
select id, 1,  35, true,  1 from public.activities where slug = 'clases-de-surf-grupales'     on conflict do nothing;
insert into public.activity_packs (activity_id, sessions, price, featured, sort_order)
select id, 5, 150, false, 2 from public.activities where slug = 'clases-de-surf-grupales'     on conflict do nothing;

insert into public.activity_packs (activity_id, sessions, price, featured, sort_order)
select id, 1,  80, true,  1 from public.activities where slug = 'clases-de-surf-individuales' on conflict do nothing;

insert into public.activity_packs (activity_id, sessions, price, featured, sort_order)
select id, 1,  30, true,  1 from public.activities where slug = 'clases-de-surfskate'         on conflict do nothing;

insert into public.activity_packs (activity_id, sessions, price, featured, sort_order)
select id, 1,  25, true,  1 from public.activities where slug = 'clases-de-yoga'              on conflict do nothing;

insert into public.activity_packs (activity_id, sessions, price, featured, sort_order)
select id, 1,  40, true,  1 from public.activities where slug = 'paddle-surf'                 on conflict do nothing;

-- ─── PRODUCTOS DE TIENDA (opcional) ───
-- Solo si el cliente activa el módulo Tienda (school.config.js → modules.tienda = true).
-- Borra este bloque si no aplica.
insert into public.products (name, slug, description, price, stock, category, status)
values
  ('Camiseta logo escuela', 'camiseta-logo', 'Algodón orgánico, unisex.',  20,  50, 'ropa',     'active'),
  ('Sudadera logo escuela', 'sudadera-logo', 'Sudadera con capucha.',      45,  20, 'ropa',     'active'),
  ('Wax (parafina)',        'wax',           'Cool/warm water wax.',        4, 100, 'material', 'active')
on conflict (slug) do nothing;

commit;

-- ─── VERIFICACIÓN ───
select 'activities'     as tabla, count(*) from public.activities
union all select 'activity_packs', count(*) from public.activity_packs
union all select 'products',       count(*) from public.products;

-- NOTA: no hay tabla `instructores` — el equipo es contenido estático en
-- el template (página /nosotros/ o similar). Si necesitas gestionar staff,
-- usa public.profiles con role='admin'.
