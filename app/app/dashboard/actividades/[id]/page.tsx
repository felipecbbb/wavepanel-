import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { resolveActiveSchool } from '@/lib/tenant-server';
import ActivityForm from '../activity-form';
import PacksEditor from './packs-editor';
import { updateActivityAction, deleteActivityAction } from '../actions';

type Activity = {
  id: string;
  name: string;
  slug: string;
  type_key: string;
  description: string | null;
  duration_minutes: number;
  capacity: number;
  color: string;
  pack_validity_days: number;
  hero_image_url: string | null;
  whats_included: string[];
  ideal_for: string[];
  active: boolean;
};

type Pack = {
  id: string;
  sessions: number;
  price_cents: number;
  featured: boolean;
};

export default async function EditarActividadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await resolveActiveSchool();
  const supabase = await createClient();

  const [{ data: activity }, { data: packs }] = await Promise.all([
    supabase
      .from('activities')
      .select('id, name, slug, type_key, description, duration_minutes, capacity, color, pack_validity_days, hero_image_url, whats_included, ideal_for, active')
      .eq('id', id)
      .maybeSingle<Activity>(),
    supabase
      .from('activity_packs')
      .select('id, sessions, price_cents, featured')
      .eq('activity_id', id)
      .order('sessions', { ascending: true }),
  ]);

  if (!activity) notFound();

  const boundUpdate = updateActivityAction.bind(null, activity.id);
  const boundDelete = deleteActivityAction.bind(null, activity.id);

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      <nav className="mb-6 text-sm text-muted">
        <a href="/dashboard/actividades" className="hover:text-navy">Actividades</a>
        <span className="mx-2">/</span>
        <span className="text-navy">{activity.name}</span>
      </nav>

      <div className="flex items-start justify-between mb-8 gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="h-3 w-3 rounded-sm" style={{ background: activity.color }} />
            <p className="kicker">{activity.type_key}</p>
          </div>
          <h1 className="font-display text-4xl text-navy truncate">{activity.name}</h1>
        </div>
        <form action={boundDelete}>
          <button
            type="submit"
            className="rounded-sm border border-red-200 text-red-700 px-3 py-1.5 text-[0.76rem] font-label hover:bg-red-50 shrink-0"
            onClick={(e) => {
              if (!confirm(`¿Borrar "${activity.name}"? Esto también borra sus packs.`)) e.preventDefault();
            }}
          >
            Borrar actividad
          </button>
        </form>
      </div>

      <div className="mb-10">
        <h2 className="font-label text-[0.72rem] text-muted mb-3">Packs de precios</h2>
        <PacksEditor activityId={activity.id} packs={(packs ?? []) as Pack[]} />
        <p className="mt-2 text-xs text-muted">
          Los bonos que se vendan de estos packs caducarán a los {activity.pack_validity_days} días.
        </p>
      </div>

      <h2 className="font-label text-[0.72rem] text-muted mb-3">Datos de la actividad</h2>
      <ActivityForm
        action={boundUpdate}
        submitLabel="Guardar cambios"
        initial={{
          name: activity.name,
          slug: activity.slug,
          type_key: activity.type_key,
          description: activity.description,
          duration_minutes: activity.duration_minutes,
          capacity: activity.capacity,
          color: activity.color,
          pack_validity_days: activity.pack_validity_days,
          hero_image_url: activity.hero_image_url,
          whats_included: activity.whats_included,
          ideal_for: activity.ideal_for,
          active: activity.active,
        }}
      />
    </div>
  );
}
