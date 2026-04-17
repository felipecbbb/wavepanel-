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
  deposit_cents: number;
  early_bird_price_cents: number | null;
  early_bird_until: string | null;
  hero_image_url: string | null;
  status: string;
};

export default async function CampDetailPage({
  params,
}: {
  params: Promise<{ slug: string; campSlug: string }>;
}) {
  const { slug, campSlug } = await params;
  const supabase = await createClient();

  const { data: tenant } = await supabase
    .from('schools')
    .select('id, slug, name, primary_color')
    .eq('slug', slug)
    .maybeSingle<Tenant>();
  if (!tenant) notFound();

  const { data: camp } = await supabase
    .from('surf_camps')
    .select('id, slug, name, description, starts_on, ends_on, max_spots, spots_taken, base_price_cents, deposit_cents, early_bird_price_cents, early_bird_until, hero_image_url, status')
    .eq('school_id', tenant.id)
    .eq('slug', campSlug)
    .in('status', ['open', 'full'])
    .maybeSingle<Camp>();
  if (!camp) notFound();

  const earlyActive = camp.early_bird_price_cents && camp.early_bird_until && new Date(camp.early_bird_until) > new Date();
  const effectivePrice = earlyActive && camp.early_bird_price_cents ? camp.early_bird_price_cents : camp.base_price_cents;
  const full = camp.status === 'full' || camp.spots_taken >= camp.max_spots;
  const days = Math.round((new Date(camp.ends_on).getTime() - new Date(camp.starts_on).getTime()) / 86_400_000) + 1;

  return (
    <>
      <section className="pt-[72px] bg-navy text-white">
        {camp.hero_image_url && (
          <div
            className="h-80 md:h-[28rem]"
            style={{ backgroundImage: `linear-gradient(to bottom, rgba(15,47,57,0.4), rgba(15,47,57,0.9)), url(${camp.hero_image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
          />
        )}
        <div className={`mx-auto w-[min(1100px,92vw)] ${camp.hero_image_url ? '-mt-64 md:-mt-80 relative' : 'py-16'}`}>
          <nav className="text-xs text-white/70 mb-4">
            <Link href={`/${tenant.slug}/camps`} className="hover:text-white">Surf Camps</Link>
            <span className="mx-2">/</span>
            <span className="text-white">{camp.name}</span>
          </nav>
          <p className="kicker mb-3" style={{ color: tenant.primary_color }}>
            {new Date(camp.starts_on).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })} —{' '}
            {new Date(camp.ends_on).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })} · {days} días
          </p>
          <h1 className="font-display text-[clamp(2.4rem,6vw,4.5rem)] leading-none max-w-3xl">
            <em className="not-italic">{camp.name}</em>
          </h1>
          {camp.description && (
            <p className="mt-5 max-w-2xl text-lg text-white/80">{camp.description}</p>
          )}
        </div>
        <div className="h-12" />
      </section>

      <section className="bg-bg">
        <div className="mx-auto w-[min(1100px,92vw)] py-14 grid gap-8 md:grid-cols-[2fr_1fr]">
          <div>
            <p className="kicker mb-3">Plazas</p>
            <div className="rounded-md border border-line bg-paper p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="font-display text-xl text-navy">{camp.spots_taken} / {camp.max_spots}</span>
                {full ? (
                  <span className="font-label text-[0.66rem] bg-red-50 text-red-700 px-2 py-0.5 rounded-sm">COMPLETO</span>
                ) : (
                  <span className="font-label text-[0.66rem] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-sm">
                    Quedan {camp.max_spots - camp.spots_taken}
                  </span>
                )}
              </div>
              <div className="w-full h-2 bg-sand rounded-sm overflow-hidden">
                <div
                  className="h-full"
                  style={{
                    width: `${Math.min(100, (camp.spots_taken / camp.max_spots) * 100)}%`,
                    background: tenant.primary_color,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="rounded-md border border-line bg-paper p-5">
            <p className="kicker mb-2">Reserva tu plaza</p>
            <div className="mb-3">
              {earlyActive && camp.early_bird_price_cents ? (
                <>
                  <p className="font-display text-4xl text-navy">{centsToEuros(camp.early_bird_price_cents)}</p>
                  <p className="text-sm text-muted line-through">Precio normal: {centsToEuros(camp.base_price_cents)}</p>
                  <p className="text-xs text-emerald-800 mt-1">
                    Early bird hasta {new Date(camp.early_bird_until!).toLocaleDateString('es-ES')}
                  </p>
                </>
              ) : (
                <p className="font-display text-4xl text-navy">{centsToEuros(camp.base_price_cents)}</p>
              )}
              <p className="text-xs text-muted mt-1">
                Reserva con {centsToEuros(camp.deposit_cents)} de depósito, el resto antes del camp.
              </p>
            </div>
            {full ? (
              <button
                type="button"
                disabled
                className="w-full rounded-pill px-5 py-3 font-label text-[0.76rem] text-muted bg-sand cursor-not-allowed"
              >
                Camp completo
              </button>
            ) : (
              <Link
                href={`/${tenant.slug}/auth/signup?buy=camp&camp=${camp.id}`}
                className="block w-full rounded-pill text-center px-5 py-3 font-label text-[0.76rem] text-navy"
                style={{ background: tenant.primary_color }}
              >
                Reservar con depósito ({centsToEuros(effectivePrice)})
              </Link>
            )}
            <p className="mt-3 text-[0.66rem] text-muted">
              Las reservas online estarán disponibles pronto (Stripe). Por ahora contacta con la escuela.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
