import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { centsToEuros } from '@/lib/slug';

type Tenant = { id: string; slug: string; name: string; primary_color: string };

type Camp = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  starts_on: string;
  ends_on: string;
  max_spots: number;
  spots_taken: number;
  base_price_cents: number;
  early_bird_price_cents: number | null;
  early_bird_until: string | null;
  hero_image_url: string | null;
  status: string;
};

export default async function CampsPublicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: tenant } = await supabase
    .from('schools')
    .select('id, slug, name, primary_color')
    .eq('slug', slug)
    .maybeSingle<Tenant>();
  if (!tenant) notFound();

  const { data } = await supabase
    .from('surf_camps')
    .select('id, slug, name, description, starts_on, ends_on, max_spots, spots_taken, base_price_cents, early_bird_price_cents, early_bird_until, hero_image_url, status')
    .eq('school_id', tenant.id)
    .in('status', ['open', 'full'])
    .order('starts_on', { ascending: true });

  const camps = (data ?? []) as Camp[];

  return (
    <div className="pt-[72px]">
      <div className="mx-auto w-[min(1220px,92vw)] py-14">
        <p className="kicker mb-2" style={{ color: tenant.primary_color }}>Surf Camps</p>
        <h1 className="font-display text-5xl text-navy mb-10">Vive varios días.</h1>

        {camps.length === 0 ? (
          <p className="text-muted">Ahora mismo no hay camps abiertos. Vuelve pronto.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {camps.map((c) => {
              const pct = c.max_spots > 0 ? (c.spots_taken / c.max_spots) * 100 : 0;
              const full = c.status === 'full' || pct >= 100;
              const earlyActive = c.early_bird_price_cents && c.early_bird_until && new Date(c.early_bird_until) > new Date();
              return (
                <Link
                  key={c.id}
                  href={`/${tenant.slug}/camps/${c.slug}`}
                  className="group rounded-md border border-line bg-paper overflow-hidden hover:shadow-card hover:border-navy transition block"
                >
                  {c.hero_image_url ? (
                    <div
                      className="h-44 bg-sand"
                      style={{ backgroundImage: `url(${c.hero_image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                    />
                  ) : (
                    <div className="h-44 bg-navy" />
                  )}
                  <div className="p-5">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="font-label text-[0.66rem] text-muted">
                        {new Date(c.starts_on).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} —{' '}
                        {new Date(c.ends_on).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                      {full && (
                        <span className="font-label text-[0.6rem] bg-red-50 text-red-700 px-2 py-0.5 rounded-sm">COMPLETO</span>
                      )}
                    </div>
                    <h2 className="font-display text-2xl text-navy group-hover:text-navy-soft transition">{c.name}</h2>
                    {c.description && <p className="text-sm text-muted mt-2 line-clamp-2">{c.description}</p>}

                    <div className="mt-4 flex items-baseline gap-2">
                      {earlyActive && c.early_bird_price_cents ? (
                        <>
                          <span className="font-display text-xl text-navy">{centsToEuros(c.early_bird_price_cents)}</span>
                          <span className="text-sm text-muted line-through">{centsToEuros(c.base_price_cents)}</span>
                          <span className="font-label text-[0.6rem] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-sm">
                            Early bird
                          </span>
                        </>
                      ) : (
                        <span className="font-display text-xl text-navy">{centsToEuros(c.base_price_cents)}</span>
                      )}
                    </div>

                    <div className="mt-3">
                      <div className="w-full h-1.5 bg-sand rounded-sm overflow-hidden">
                        <div
                          className={`h-full ${pct >= 90 ? 'bg-red-500' : pct >= 60 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                          style={{ width: `${Math.min(100, pct)}%` }}
                        />
                      </div>
                      <p className="mt-1 text-xs text-muted">{c.spots_taken} de {c.max_spots} plazas ocupadas</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
