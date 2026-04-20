import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { resolveActiveSchool } from '@/lib/tenant-server';
import { centsToEuros } from '@/lib/slug';
import PacksEditor from '../actividades/[id]/packs-editor';

type Activity = { id: string; name: string; slug: string; color: string; active: boolean };
type Pack = { id: string; activity_id: string; sessions: number; price_cents: number; featured: boolean };

export default async function TarifasPage() {
  await resolveActiveSchool();
  const supabase = await createClient();

  const [{ data: activitiesData }, { data: packsData }] = await Promise.all([
    supabase
      .from('activities')
      .select('id, name, slug, color, active')
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true }),
    supabase
      .from('activity_packs')
      .select('id, activity_id, sessions, price_cents, featured')
      .order('sessions', { ascending: true }),
  ]);

  const activities = (activitiesData ?? []) as Activity[];
  const packs = (packsData ?? []) as Pack[];
  const packsByActivity = packs.reduce<Record<string, Pack[]>>((acc, p) => {
    (acc[p.activity_id] ||= []).push(p);
    return acc;
  }, {});

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <header className="mb-8 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="kicker mb-2">Tarifas</p>
          <h1 className="font-display text-4xl text-navy">Packs por actividad.</h1>
          <p className="mt-2 text-muted text-sm max-w-xl">
            Cada actividad puede tener packs de distintas cantidades de sesiones con su precio.
            El destacado es el que se muestra por defecto en la web del tenant.
          </p>
        </div>
      </header>

      {activities.length === 0 ? (
        <div className="rounded-md border border-dashed border-line bg-paper p-10 text-center">
          <p className="text-sm text-muted mb-4">Aún no has creado ninguna actividad.</p>
          <Link href="/dashboard/actividades/nueva" className="text-navy underline font-label text-[0.78rem]">
            Crear la primera →
          </Link>
        </div>
      ) : (
        <div className="space-y-10">
          {activities.map((a) => {
            const rows = packsByActivity[a.id] ?? [];
            const avg = rows.length > 0 ? rows.reduce((s, p) => s + p.price_cents, 0) / rows.length : 0;
            return (
              <section
                key={a.id}
                className={`rounded-md border bg-paper p-5 ${a.active ? 'border-line' : 'border-line/60 opacity-70'}`}
              >
                <header className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="h-6 w-6 rounded-sm shrink-0" style={{ background: a.color }} />
                    <div className="min-w-0">
                      <h2 className="font-display text-2xl text-navy">{a.name}</h2>
                      <p className="text-xs text-muted">
                        {rows.length} pack{rows.length === 1 ? '' : 's'}
                        {rows.length > 0 && <> · precio medio {centsToEuros(avg)}</>}
                        {!a.active && <span className="ml-2 italic">· actividad inactiva</span>}
                      </p>
                    </div>
                  </div>
                  <Link
                    href={`/dashboard/actividades/${a.id}`}
                    className="font-label text-[0.72rem] text-muted hover:text-navy underline shrink-0"
                  >
                    Editar actividad →
                  </Link>
                </header>

                <PacksEditor activityId={a.id} packs={rows} />
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
