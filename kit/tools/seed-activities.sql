-- seed-activities.sql
-- Plantilla SQL para crear las actividades base de un cliente nuevo.
-- Ejecutar tras aplicar el schema:
--   psql "$DB_URL" -f seed-activities.sql
--
-- IMPORTANTE: rellena los valores marcados con TODO antes de ejecutar.
-- El schema de Entre Olas asume tablas: actividades, instructores, productos.
-- Adapta los inserts si los nombres de campos difieren.

begin;

-- ─── ACTIVIDADES ───
insert into actividades (nombre, slug, categoria, duracion_min, precio_eur, plazas_max, descripcion, activa)
values
  ('Clase grupal de surf',         'surf-grupal',         'surf',       120, 35,  10, 'Clase de 2h en grupo. Material incluido.', true),
  ('Clase privada de surf',        'surf-privada',        'surf',        90, 80,   2, 'Clase 1-on-1 con instructor.', true),
  ('Clase de surfskate',           'surfskate',           'surfskate',   60, 30,   8, 'Iniciación al surfskate en parking.', true),
  ('Yoga + surf',                  'yoga-surf',           'yoga',        90, 25,   8, 'Sesión combinada de yoga y agua.', true),
  ('Paddle surf (SUP)',            'sup',                 'paddle',     120, 40,   8, 'Paseo en SUP con instructor.', true)
on conflict (slug) do nothing;

-- ─── INSTRUCTORES ───
-- TODO: rellenar con los del cuestionario del cliente
insert into instructores (nombre, especialidad, foto_url, bio, activo)
values
  ('TODO Nombre 1', '{surf}',           '/uploads/instructor1.jpg', 'TODO bio',  true),
  ('TODO Nombre 2', '{surf,paddle}',    '/uploads/instructor2.jpg', 'TODO bio',  true)
on conflict (nombre) do nothing;

-- ─── PRODUCTOS BÁSICOS DE TIENDA (opcional) ───
-- Solo si el cliente activa el módulo Tienda
insert into productos (nombre, slug, categoria, precio_eur, stock, descripcion, activo)
values
  ('Camiseta logo escuela',  'camiseta-logo',  'ropa',     20,  50, 'Algodón orgánico, unisex.',  true),
  ('Sudadera logo escuela',  'sudadera-logo',  'ropa',     45,  20, 'Sudadera con capucha.',     true),
  ('Wax (parafina)',         'wax',            'material',  4, 100, 'Cool/warm water wax.',      true)
on conflict (slug) do nothing;

-- ─── BONOS / PACKS DE CLASES (opcional) ───
insert into bonos (nombre, slug, sesiones_total, precio_eur, validez_dias, descripcion, activo)
values
  ('Bono 5 clases grupales',  'bono-5-grupal',   5, 150, 180, 'Ahorra 25€ vs precio individual.',  true),
  ('Bono 10 clases grupales', 'bono-10-grupal', 10, 280, 365, 'Ahorra 70€. Caducidad 1 año.',     true)
on conflict (slug) do nothing;

commit;

-- Verificar
select 'actividades' as tabla, count(*) from actividades
union all select 'instructores', count(*) from instructores
union all select 'productos', count(*) from productos
union all select 'bonos', count(*) from bonos;
