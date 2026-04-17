import { createClient } from '@/lib/supabase/server';
import { resolveActiveSchool } from '@/lib/tenant-server';
import { ButtonLink } from '@/components/button';
import { centsToEuros } from '@/lib/slug';

type Row = {
  id: string;
  name: string;
  slug: string;
  type_key: string;
  duration_minutes: number;
  capacity: number;
  color: string;
  active: boolean;
  activity_packs: { sessions: number; price_cents: number; featured: boolean }[];
};

export default async function ActividadesPage() {
  await resolveActiveSchool();
  const supabase = await createClient();

  const { data: activities, error } = await supabase
    .from('activities')
    .select('id, name, slug, type_key, duration_minutes, capacity, color, active, activity_packs(sessions, price_cents, featured)')
    .order('created_at', { ascending: false });

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="kicker mb-2">Actividades</p>
          <h1 className="font-display text-4xl text-navy">Tu catálogo.</h1>
          <p className="mt-2 text-muted text-sm max-w-xl">
            Tipos de actividad (surf grupal, kite, yoga…) con su duración, capacidad y packs de precios escalonados.
          </p>
        </div>
        <ButtonLink href="/dashboard/actividades/nueva" variant="dark">
          Nueva actividad
        </ButtonLink>
      </div>

      {error && (
        <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-100">
          {error.message}
        </p>
      )}

      {(!activities || activities.length === 0) && !error ? (
        <Empty />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {(activities as Row[]).map((a) => (
            <ActivityCard key={a.id} a={a} />
          ))}
        </div>
      )}
    </div>
  );
}

function Empty() {
  return (
    <div className="rounded-md border border-dashed border-line bg-paper p-10 text-center">
      <h3 className="font-display text-2xl text-navy mb-2">Aún no hay actividades</h3>
      <p className="text-sm text-muted mb-6">Crea la primera (p. ej. “Surf grupal”) y añade los precios por pack.</p>
      <ButtonLink href="/dashboard/actividades/nueva" variant="yellow">
        Crear la primera
      </ButtonLink>
    </div>
  );
}

function ActivityCard({ a }: { a: Row }) {
  const packs = [...(a.activity_packs ?? [])].sort((x, y) => x.sessions - y.sessions);
  return (
    <a
      href={`/dashboard/actividades/${a.id}`}
      className="rounded-md border border-line bg-paper p-5 hover:shadow-card hover:border-navy transition block"
    >
      <div className="flex items-start gap-3 mb-3">
        <span className="h-6 w-6 rounded-sm shrink-0 mt-0.5" style={{ background: a.color }} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-display text-xl text-navy truncate">{a.name}</h3>
            {!a.active && (
              <span className="font-label text-[0.6rem] text-muted bg-sand px-2 py-0.5 rounded-sm">Pausada</span>
            )}
          </div>
          <p className="text-xs text-muted">
            {a.type_key} · {a.duration_minutes} min · {a.capacity} plazas
          </p>
        </div>
      </div>
      {packs.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {packs.slice(0, 5).map((p) => (
            <span
              key={p.sessions}
              className={`inline-flex rounded-pill px-2.5 py-0.5 text-[0.72rem] font-label ${
                p.featured ? 'bg-yellow text-navy' : 'bg-sand text-navy'
              }`}
            >
              {p.sessions}× · {centsToEuros(p.price_cents)}
            </span>
          ))}
          {packs.length > 5 && (
            <span className="inline-flex text-[0.72rem] text-muted">+{packs.length - 5}</span>
          )}
        </div>
      ) : (
        <p className="text-xs text-muted italic">Sin packs configurados todavía</p>
      )}
    </a>
  );
}
