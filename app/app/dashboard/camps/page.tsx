import { createClient } from '@/lib/supabase/server';
import { resolveActiveSchool } from '@/lib/tenant-server';
import { ButtonLink } from '@/components/button';
import { centsToEuros } from '@/lib/slug';

type Camp = {
  id: string;
  slug: string;
  name: string;
  starts_on: string;
  ends_on: string;
  max_spots: number;
  spots_taken: number;
  base_price_cents: number;
  deposit_cents: number;
  early_bird_price_cents: number | null;
  status: string;
  hero_image_url: string | null;
};

export default async function CampsPage() {
  await resolveActiveSchool();
  const supabase = await createClient();

  const { data: campsData } = await supabase
    .from('surf_camps')
    .select('id, slug, name, starts_on, ends_on, max_spots, spots_taken, base_price_cents, deposit_cents, early_bird_price_cents, status, hero_image_url')
    .order('starts_on', { ascending: true });

  const camps = (campsData ?? []) as Camp[];

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="kicker mb-2">Surf Camps</p>
          <h1 className="font-display text-4xl text-navy">Ediciones.</h1>
          <p className="mt-2 text-muted text-sm max-w-xl">
            Cada edición tiene sus propias fechas, plazas y precios. Los clientes reservan con depósito y pagan el resto antes del camp.
          </p>
        </div>
        <ButtonLink href="/dashboard/camps/nuevo" variant="dark">Nuevo camp</ButtonLink>
      </div>

      {camps.length === 0 ? (
        <div className="rounded-md border border-dashed border-line bg-paper p-10 text-center">
          <h3 className="font-display text-2xl text-navy mb-2">Aún no hay camps</h3>
          <p className="text-sm text-muted mb-6">Crea la primera edición con sus fechas, plazas y precio.</p>
          <ButtonLink href="/dashboard/camps/nuevo" variant="yellow">Crear el primero</ButtonLink>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {camps.map((c) => <CampCard key={c.id} camp={c} />)}
        </div>
      )}
    </div>
  );
}

function CampCard({ camp }: { camp: Camp }) {
  const pct = camp.max_spots > 0 ? (camp.spots_taken / camp.max_spots) * 100 : 0;
  const barColor = pct >= 90 ? 'bg-red-500' : pct >= 60 ? 'bg-amber-500' : 'bg-emerald-500';
  return (
    <a
      href={`/dashboard/camps/${camp.id}`}
      className="rounded-md border border-line bg-paper hover:shadow-card hover:border-navy transition block overflow-hidden"
    >
      {camp.hero_image_url ? (
        <div
          className="h-32 bg-sand"
          style={{ backgroundImage: `url(${camp.hero_image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        />
      ) : (
        <div className="h-32 bg-sand flex items-center justify-center text-muted text-xs">Sin imagen</div>
      )}
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-display text-xl text-navy">{camp.name}</h3>
          <StatusBadge status={camp.status} />
        </div>
        <p className="text-xs text-muted mb-3">
          {new Date(camp.starts_on).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} —{' '}
          {new Date(camp.ends_on).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
        </p>

        <div className="mb-3">
          <div className="flex justify-between text-[0.72rem] text-muted mb-1">
            <span>{camp.spots_taken} / {camp.max_spots} plazas</span>
            <span>{pct.toFixed(0)}%</span>
          </div>
          <div className="w-full h-1.5 bg-sand rounded-sm overflow-hidden">
            <div className={`h-full ${barColor}`} style={{ width: `${pct}%` }} />
          </div>
        </div>

        <div className="flex items-baseline gap-2">
          {camp.early_bird_price_cents ? (
            <>
              <span className="font-display text-2xl text-navy">{centsToEuros(camp.early_bird_price_cents)}</span>
              <span className="text-sm text-muted line-through">{centsToEuros(camp.base_price_cents)}</span>
            </>
          ) : (
            <span className="font-display text-2xl text-navy">{centsToEuros(camp.base_price_cents)}</span>
          )}
          <span className="text-xs text-muted">· depósito {centsToEuros(camp.deposit_cents)}</span>
        </div>
      </div>
    </a>
  );
}

function StatusBadge({ status }: { status: string }) {
  const label: Record<string, string> = {
    draft: 'Borrador',
    open: 'Abierto',
    full: 'Lleno',
    closed: 'Cerrado',
    cancelled: 'Cancelado',
  };
  const cls: Record<string, string> = {
    draft: 'bg-sand text-muted',
    open: 'bg-emerald-50 text-emerald-800',
    full: 'bg-red-50 text-red-700',
    closed: 'bg-sand text-muted',
    cancelled: 'bg-sand text-muted',
  };
  return (
    <span className={`font-label text-[0.6rem] px-2 py-0.5 rounded-sm shrink-0 ${cls[status] ?? 'bg-sand text-muted'}`}>
      {label[status] ?? status}
    </span>
  );
}
