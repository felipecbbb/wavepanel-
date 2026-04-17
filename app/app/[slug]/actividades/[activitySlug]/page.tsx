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
  pack_validity_days: number;
  whats_included: string[];
  ideal_for: string[];
};

type Pack = {
  id: string;
  sessions: number;
  price_cents: number;
  featured: boolean;
};

export default async function ActividadDetailPage({
  params,
}: {
  params: Promise<{ slug: string; activitySlug: string }>;
}) {
  const { slug, activitySlug } = await params;
  const supabase = await createClient();

  const { data: tenant } = await supabase
    .from('schools')
    .select('id, slug, name, primary_color')
    .eq('slug', slug)
    .maybeSingle<Tenant>();
  if (!tenant) notFound();

  const { data: activity } = await supabase
    .from('activities')
    .select('id, slug, name, type_key, description, hero_image_url, color, duration_minutes, capacity, pack_validity_days, whats_included, ideal_for')
    .eq('school_id', tenant.id)
    .eq('slug', activitySlug)
    .eq('active', true)
    .maybeSingle<Activity>();
  if (!activity) notFound();

  const { data: packsData } = await supabase
    .from('activity_packs')
    .select('id, sessions, price_cents, featured')
    .eq('activity_id', activity.id)
    .order('sessions', { ascending: true });

  const packs = (packsData ?? []) as Pack[];
  const minPrice = packs.length > 0 ? Math.min(...packs.map((p) => p.price_cents)) : null;

  return (
    <>
      <section
        className="pt-[72px] text-white"
        style={{ background: activity.hero_image_url ? undefined : activity.color }}
      >
        {activity.hero_image_url && (
          <div
            className="h-72 md:h-96"
            style={{ backgroundImage: `linear-gradient(to bottom, rgba(15,47,57,0.5), rgba(15,47,57,0.85)), url(${activity.hero_image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
          />
        )}
        <div className={`mx-auto w-[min(1100px,92vw)] ${activity.hero_image_url ? '-mt-56 md:-mt-72 relative' : 'py-16'}`}>
          <div className="max-w-3xl">
            <nav className="text-xs text-white/70 mb-4">
              <Link href={`/${tenant.slug}/actividades`} className="hover:text-white">Actividades</Link>
              <span className="mx-2">/</span>
              <span className="text-white">{activity.name}</span>
            </nav>
            <p className="kicker mb-3" style={{ color: tenant.primary_color }}>{activity.type_key}</p>
            <h1 className="font-display text-[clamp(2.4rem,6vw,4.5rem)] leading-none">
              <em className="not-italic">{activity.name}</em>
            </h1>
            {activity.description && (
              <p className="mt-5 text-lg text-white/80">{activity.description}</p>
            )}
            <p className="mt-4 text-sm text-white/60">
              {activity.duration_minutes} min · hasta {activity.capacity} alumnos
              {minPrice !== null && <> · desde {centsToEuros(minPrice)}</>}
            </p>
          </div>
        </div>
        <div className="h-12" />
      </section>

      {(activity.whats_included.length > 0 || activity.ideal_for.length > 0) && (
        <section className="bg-bg">
          <div className="mx-auto w-[min(1100px,92vw)] py-14 grid gap-10 md:grid-cols-2">
            {activity.whats_included.length > 0 && (
              <div>
                <p className="kicker mb-3">Qué incluye</p>
                <ul className="space-y-2">
                  {activity.whats_included.map((it, i) => (
                    <li key={i} className="flex items-start gap-2 text-[0.95rem]">
                      <span className="h-1.5 w-1.5 rounded-full mt-2 shrink-0" style={{ background: tenant.primary_color }} />
                      {it}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {activity.ideal_for.length > 0 && (
              <div>
                <p className="kicker mb-3">Ideal para</p>
                <ul className="space-y-2">
                  {activity.ideal_for.map((it, i) => (
                    <li key={i} className="flex items-start gap-2 text-[0.95rem]">
                      <span className="h-1.5 w-1.5 rounded-full mt-2 shrink-0" style={{ background: tenant.primary_color }} />
                      {it}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}

      {packs.length > 0 && (
        <section className="bg-sand">
          <div className="mx-auto w-[min(1100px,92vw)] py-14">
            <p className="kicker mb-2">Packs</p>
            <h2 className="font-display text-4xl text-navy mb-8">Elige tu pack.</h2>

            <div className="grid gap-5 md:grid-cols-3">
              {packs.map((p) => {
                const perSession = p.sessions > 0 ? p.price_cents / p.sessions : 0;
                return (
                  <div
                    key={p.id}
                    className={`rounded-md bg-paper p-6 border ${p.featured ? 'border-navy shadow-pop' : 'border-line'}`}
                  >
                    {p.featured && (
                      <p className="kicker mb-2" style={{ color: tenant.primary_color }}>Recomendado</p>
                    )}
                    <p className="font-label text-[0.66rem] text-muted">
                      {p.sessions} {p.sessions === 1 ? 'sesión' : 'sesiones'}
                    </p>
                    <p className="font-display text-5xl text-navy mt-2">{centsToEuros(p.price_cents)}</p>
                    <p className="text-sm text-muted mt-1">{centsToEuros(perSession)} por sesión</p>
                    <p className="text-xs text-muted mt-3">
                      Caduca a los {activity.pack_validity_days} días desde la compra.
                    </p>
                    <Link
                      href={`/${tenant.slug}/auth/signup?buy=pack&pack=${p.id}`}
                      className="block mt-5 rounded-pill text-center px-5 py-3 font-label text-[0.76rem] text-navy"
                      style={{ background: tenant.primary_color }}
                    >
                      Comprar este pack
                    </Link>
                  </div>
                );
              })}
            </div>
            <p className="mt-6 text-xs text-muted">
              Las compras todavía requieren contactar con la escuela — próximamente checkout online con Stripe.
            </p>
          </div>
        </section>
      )}
    </>
  );
}
