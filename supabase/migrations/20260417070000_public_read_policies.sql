-- Policies de lectura pública (anon) para la parte de la web que ven los
-- alumnos sin haber iniciado sesión: home del tenant, actividades, camps,
-- clases publicadas. Los datos operativos (reservas, pagos, bonos, clientes)
-- siguen siendo privados — solo miembros de la school.

-- schools: se lee por slug (anon) para resolver el tenant en el layout público.
drop policy if exists "public read schools" on public.schools;
create policy "public read schools"
  on public.schools for select
  to anon, authenticated
  using (true);
-- Nota: esto expone nombre, slug, logo, color, contacto, plan, trial_ends_at
-- y stripe_status de todas las schools. Para MVP es aceptable (es info que
-- un cliente pondría en su web pública). Si hiciera falta ocultar más tarde,
-- creamos una vista pública con sólo campos visibles.

-- activities (solo activas)
drop policy if exists "public read active activities" on public.activities;
create policy "public read active activities"
  on public.activities for select
  to anon, authenticated
  using (active = true);

-- activity_packs (todos)
drop policy if exists "public read activity_packs" on public.activity_packs;
create policy "public read activity_packs"
  on public.activity_packs for select
  to anon, authenticated
  using (true);

-- surf_classes (solo publicadas y futuras — el admin ve el resto vía su policy de members)
drop policy if exists "public read published future classes" on public.surf_classes;
create policy "public read published future classes"
  on public.surf_classes for select
  to anon, authenticated
  using (published = true and starts_at > now() - interval '2 hours');

-- surf_camps (solo open o full — los borradores/cerrados/cancelados no)
drop policy if exists "public read open camps" on public.surf_camps;
create policy "public read open camps"
  on public.surf_camps for select
  to anon, authenticated
  using (status in ('open','full'));

-- instructors (solo activos — por si se muestran en algún listado público)
drop policy if exists "public read active instructors" on public.instructors;
create policy "public read active instructors"
  on public.instructors for select
  to anon, authenticated
  using (active = true);
