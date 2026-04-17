import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { centsToEuros } from '@/lib/slug';

type Tenant = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  primary_color: string;
};

type Activity = {
  id: string;
  slug: string;
  name: string;
  type_key: string;
  description: string | null;
  hero_image_url: string | null;
  color: string;
};

type Pack = { activity_id: string; sessions: number; price_cents: number; featured: boolean };

type Camp = {
  id: string;
  slug: string;
  name: string;
  starts_on: string;
  ends_on: string;
  base_price_cents: number;
  early_bird_price_cents: number | null;
  hero_image_url: string | null;
  status: string;
};

export default async function TenantHomePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: tenant } = await supabase
    .from('schools')
    .select('id, slug, name, description, primary_color')
    .eq('slug', slug)
    .maybeSingle<Tenant>();
  if (!tenant) notFound();

  const [{ data: activitiesData }, { data: packsData }, { data: campsData }] = await Promise.all([
    supabase
      .from('activities')
      .select('id, slug, name, type_key, description, hero_image_url, color')
      .eq('school_id', tenant.id)
      .eq('active', true)
      .order('created_at', { ascending: true }),
    supabase
      .from('activity_packs')
      .select('activity_id, sessions, price_cents, featured')
      .eq('school_id', tenant.id),
    supabase
      .from('surf_camps')
      .select('id, slug, name, starts_on, ends_on, base_price_cents, early_bird_price_cents, hero_image_url, status')
      .eq('school_id', tenant.id)
      .in('status', ['open', 'full'])
      .order('starts_on', { ascending: true })
      .limit(6),
  ]);

  const activities = (activitiesData ?? []) as Activity[];
  const packs = (packsData ?? []) as Pack[];
  const camps = (campsData ?? []) as Camp[];

  const featuredPackByActivity = new Map<string, Pack>();
  packs.forEach((p) => {
    const existing = featuredPackByActivity.get(p.activity_id);
    if (!existing) featuredPackByActivity.set(p.activity_id, p);
    else if (!existing.featured && p.featured) featuredPackByActivity.set(p.activity_id, p);
  });

  return (
    <>
      <section className="pt-[72px] bg-navy text-white">
        <div className="mx-auto w-[min(1100px,92vw)] py-20 md:py-28">
          <p className="kicker mb-4" style={{ color: tenant.primary_color }}>
            Escuela
          </p>
          <h1 className="font-display text-[clamp(2.8rem,8vw,6rem)] leading-none">
            <em className="not-italic">{tenant.name}</em>
          </h1>
          {tenant.description && (
            <p className="mt-5 max-w-2xl text-lg text-white/70">{tenant.description}</p>
          )}
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={`/${tenant.slug}/actividades`}
              className="rounded-pill px-6 py-3 text-navy font-label text-[0.78rem]"
              style={{ background: tenant.primary_color }}
            >
              Ver actividades
            </Link>
            <Link
              href={`/${tenant.slug}/calendario`}
              className="rounded-pill px-6 py-3 border border-white/50 text-white font-label text-[0.78rem] hover:bg-white/10"
            >
              Calendario de clases
            </Link>
          </div>
        </div>
      </section>

      {activities.length > 0 && (
        <section className="bg-bg">
          <div className="mx-auto w-[min(1220px,92vw)] py-16">
            <div className="mb-8">
              <p className="kicker mb-2">Qué ofrecemos</p>
              <h2 className="font-display text-4xl text-navy">Actividades.</h2>
            </div>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {activities.slice(0, 6).map((a) => {
                const pack = featuredPackByActivity.get(a.id);
                return (
                  <Link
                    key={a.id}
                    href={`/${tenant.slug}/actividades/${a.slug}`}
                    className="group rounded-md border border-line bg-paper overflow-hidden hover:shadow-card hover:border-navy transition block"
                  >
                    {a.hero_image_url ? (
                      <div
                        className="h-40 bg-sand"
                        style={{ backgroundImage: `url(${a.hero_image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                      />
                    ) : (
                      <div className="h-40" style={{ background: a.color }} />
                    )}
                    <div className="p-5">
                      <p className="font-label text-[0.66rem] text-muted">{a.type_key}</p>
                      <h3 className="font-display text-2xl text-navy mt-1 group-hover:text-navy-soft transition">{a.name}</h3>
                      {a.description && (
                        <p className="text-sm text-muted mt-2 line-clamp-2">{a.description}</p>
                      )}
                      {pack && (
                        <p className="mt-3 text-sm">
                          <span className="font-label text-[0.66rem] text-muted">Desde</span>{' '}
                          <span className="font-display text-xl text-navy">{centsToEuros(pack.price_cents)}</span>{' '}
                          <span className="text-muted text-xs">· {pack.sessions} {pack.sessions === 1 ? 'sesión' : 'sesiones'}</span>
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {camps.length > 0 && (
        <section className="bg-sand">
          <div className="mx-auto w-[min(1220px,92vw)] py-16">
            <div className="mb-8">
              <p className="kicker mb-2">Eventos</p>
              <h2 className="font-display text-4xl text-navy">Próximos Surf Camps.</h2>
            </div>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {camps.map((c) => (
                <Link
                  key={c.id}
                  href={`/${tenant.slug}/camps/${c.slug}`}
                  className="rounded-md border border-line bg-paper overflow-hidden hover:shadow-card hover:border-navy transition block"
                >
                  {c.hero_image_url ? (
                    <div
                      className="h-40 bg-sand"
                      style={{ backgroundImage: `url(${c.hero_image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                    />
                  ) : (
                    <div className="h-40 bg-navy" />
                  )}
                  <div className="p-5">
                    <p className="font-label text-[0.66rem] text-muted">
                      {new Date(c.starts_on).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} —{' '}
                      {new Date(c.ends_on).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                    <h3 className="font-display text-2xl text-navy mt-1">{c.name}</h3>
                    <div className="mt-3 flex items-baseline gap-2">
                      {c.early_bird_price_cents ? (
                        <>
                          <span className="font-display text-xl text-navy">{centsToEuros(c.early_bird_price_cents)}</span>
                          <span className="text-sm text-muted line-through">{centsToEuros(c.base_price_cents)}</span>
                        </>
                      ) : (
                        <span className="font-display text-xl text-navy">{centsToEuros(c.base_price_cents)}</span>
                      )}
                      {c.status === 'full' && (
                        <span className="ml-auto font-label text-[0.6rem] bg-red-50 text-red-700 px-2 py-0.5 rounded-sm">COMPLETO</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
