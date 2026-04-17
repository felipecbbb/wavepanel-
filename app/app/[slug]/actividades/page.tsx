import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { centsToEuros } from '@/lib/slug';

type Tenant = { id: string; slug: string; name: string; primary_color: string };

type Activity = {
  id: string;
  slug: string;
  name: string;
  type_key: string;
  description: string | null;
  hero_image_url: string | null;
  color: string;
  duration_minutes: number;
  capacity: number;
};

type Pack = { activity_id: string; sessions: number; price_cents: number; featured: boolean };

export default async function ActividadesPublicPage({
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

  const [{ data: activitiesData }, { data: packsData }] = await Promise.all([
    supabase
      .from('activities')
      .select('id, slug, name, type_key, description, hero_image_url, color, duration_minutes, capacity')
      .eq('school_id', tenant.id)
      .eq('active', true)
      .order('created_at', { ascending: true }),
    supabase.from('activity_packs').select('activity_id, sessions, price_cents, featured').eq('school_id', tenant.id),
  ]);

  const activities = (activitiesData ?? []) as Activity[];
  const packs = (packsData ?? []) as Pack[];
  const minPackByActivity = new Map<string, Pack>();
  packs.forEach((p) => {
    const existing = minPackByActivity.get(p.activity_id);
    if (!existing || p.price_cents < existing.price_cents) minPackByActivity.set(p.activity_id, p);
  });

  return (
    <div className="pt-[72px]">
      <div className="mx-auto w-[min(1220px,92vw)] py-14">
        <p className="kicker mb-2" style={{ color: tenant.primary_color }}>Actividades</p>
        <h1 className="font-display text-5xl text-navy mb-10">¿Qué quieres probar?</h1>

        {activities.length === 0 ? (
          <p className="text-muted">Esta escuela aún no ha publicado actividades.</p>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {activities.map((a) => {
              const pack = minPackByActivity.get(a.id);
              return (
                <Link
                  key={a.id}
                  href={`/${tenant.slug}/actividades/${a.slug}`}
                  className="group rounded-md border border-line bg-paper overflow-hidden hover:shadow-card hover:border-navy transition block"
                >
                  {a.hero_image_url ? (
                    <div
                      className="h-44 bg-sand"
                      style={{ backgroundImage: `url(${a.hero_image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                    />
                  ) : (
                    <div className="h-44" style={{ background: a.color }} />
                  )}
                  <div className="p-5">
                    <p className="font-label text-[0.66rem] text-muted">
                      {a.type_key} · {a.duration_minutes} min · {a.capacity} plazas
                    </p>
                    <h2 className="font-display text-2xl text-navy mt-1 group-hover:text-navy-soft transition">{a.name}</h2>
                    {a.description && (
                      <p className="text-sm text-muted mt-2 line-clamp-3">{a.description}</p>
                    )}
                    {pack && (
                      <p className="mt-4 text-sm">
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
        )}
      </div>
    </div>
  );
}
