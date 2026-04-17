-- Alinear `clients` y `family_members` con la ficha real de Entre Olas.
-- Añade: campos de salud (nadar, lesión, talla neopreno), dirección y birth_date
-- en clients. Mismo paquete de salud en family_members. Y extiende el listado
-- de estados de `class_enrollments` para cubrir 'paid' y 'partial' (como Entre Olas).

-- 1. clients: campos demográficos/salud/dirección
alter table public.clients
  add column if not exists birth_date date,
  add column if not exists can_swim boolean,
  add column if not exists has_injury boolean not null default false,
  add column if not exists injury_detail text,
  add column if not exists wetsuit_size text,
  add column if not exists address text,
  add column if not exists city text,
  add column if not exists postal_code text,
  add column if not exists country text;

-- 2. family_members: añadir campos de salud (igual que clients)
alter table public.family_members
  add column if not exists can_swim boolean,
  add column if not exists has_injury boolean not null default false,
  add column if not exists injury_detail text,
  add column if not exists wetsuit_size text;

-- 3. Alinear valores de 'level' con Entre Olas (principiante/intermedio/avanzado).
--    Reemplazamos el constraint para aceptar tanto los antiguos (en/legacy) como
--    los nuevos en castellano; esto evita romper datos ya creados.
alter table public.family_members drop constraint if exists family_members_level_check;
alter table public.family_members add constraint family_members_level_check
  check (level is null or level in (
    'principiante','intermedio','avanzado',
    'beginner','intermediate','advanced'
  ));

-- 4. class_enrollments: añadir 'paid' y 'partial' como estados válidos
alter table public.class_enrollments drop constraint if exists class_enrollments_status_check;
alter table public.class_enrollments add constraint class_enrollments_status_check
  check (status in ('confirmed','cancelled','completed','no_show','paid','partial'));
