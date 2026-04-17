import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { centsToEuros } from '@/lib/slug';
import { formatSpanishTime } from '@/lib/dates';
import LogoutButton from './logout-button';

type Tenant = { id: string; slug: string; name: string; primary_color: string };

type Client = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
};

type Bono = {
  id: string;
  activity_id: string;
  total_credits: number;
  used_credits: number;
  status: string;
  expires_at: string | null;
};

type Enrollment = {
  id: string;
  class_id: string;
  status: string;
  bono_id: string | null;
  family_member_id: string | null;
};

type SurfClassRow = { id: string; starts_at: string; ends_at: string; activity_id: string };
type ActivityRow = { id: string; slug: string; name: string; color: string };
type FamilyMember = { id: string; full_name: string; level: string | null };
type CampBooking = { id: string; camp_id: string; total_cents: number; paid_cents: number; status: string };
type Camp = { id: string; name: string; starts_on: string; slug: string };

export default async function MiCuentaPage({
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

  const { data: { user } } = await supabase.auth.getUser();
  // layout ya redirigió si no hay user; paranoia
  if (!user) notFound();

  const { data: client } = await supabase
    .from('clients')
    .select('id, name, email, phone')
    .eq('school_id', tenant.id)
    .eq('auth_user_id', user.id)
    .maybeSingle<Client>();
  if (!client) notFound();

  const [
    { data: bonosData },
    { data: enrollmentsData },
    { data: familyData },
    { data: campBookingsData },
    { data: activitiesData },
    { data: surfClassesData },
    { data: campsData },
  ] = await Promise.all([
    supabase
      .from('bonos')
      .select('id, activity_id, total_credits, used_credits, status, expires_at')
      .eq('client_id', client.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('class_enrollments')
      .select('id, class_id, status, bono_id, family_member_id')
      .eq('client_id', client.id)
      .in('status', ['confirmed', 'completed'])
      .order('created_at', { ascending: false })
      .limit(50),
    supabase
      .from('family_members')
      .select('id, full_name, level')
      .eq('client_id', client.id),
    supabase
      .from('camp_bookings')
      .select('id, camp_id, total_cents, paid_cents, status')
      .eq('client_id', client.id)
      .order('created_at', { ascending: false }),
    supabase.from('activities').select('id, slug, name, color').eq('school_id', tenant.id),
    supabase.from('surf_classes').select('id, starts_at, ends_at, activity_id').eq('school_id', tenant.id),
    supabase.from('surf_camps').select('id, slug, name, starts_on').eq('school_id', tenant.id),
  ]);

  const bonos = (bonosData ?? []) as Bono[];
  const enrollments = (enrollmentsData ?? []) as Enrollment[];
  const family = (familyData ?? []) as FamilyMember[];
  const campBookings = (campBookingsData ?? []) as CampBooking[];
  const activityById = new Map(((activitiesData ?? []) as ActivityRow[]).map((a) => [a.id, a]));
  const classById = new Map(((surfClassesData ?? []) as SurfClassRow[]).map((c) => [c.id, c]));
  const campById = new Map(((campsData ?? []) as Camp[]).map((c) => [c.id, c]));

  const now = new Date().toISOString();
  const upcoming = enrollments
    .map((e) => ({ enrollment: e, cls: classById.get(e.class_id) }))
    .filter((x) => x.cls && x.cls.starts_at > now)
    .sort((a, b) => a.cls!.starts_at.localeCompare(b.cls!.starts_at))
    .slice(0, 5);

  const activeBonos = bonos.filter((b) => b.status === 'active');

  return (
    <div className="pt-[72px]">
      <div className="mx-auto w-[min(1100px,92vw)] py-10">
        <div className="flex items-start justify-between mb-10 gap-4">
          <div>
            <p className="kicker mb-2" style={{ color: tenant.primary_color }}>Mi cuenta</p>
            <h1 className="font-display text-5xl text-navy">Hola, {client.name.split(' ')[0]}.</h1>
            <p className="mt-2 text-muted text-sm">{client.email}</p>
          </div>
          <LogoutButton schoolSlug={tenant.slug} />
        </div>

        <section className="grid gap-6 md:grid-cols-2 mb-10">
          <div className="rounded-md border border-line bg-paper p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-label text-[0.72rem] text-muted">Mis bonos</h2>
              <Link href={`/${tenant.slug}/actividades`} className="text-xs text-navy underline">Comprar pack →</Link>
            </div>
            {activeBonos.length === 0 ? (
              <p className="text-sm text-muted">Todavía no tienes bonos activos.</p>
            ) : (
              <ul className="space-y-3">
                {activeBonos.map((b) => {
                  const act = activityById.get(b.activity_id);
                  const remaining = b.total_credits - b.used_credits;
                  const pct = b.total_credits > 0 ? (b.used_credits / b.total_credits) * 100 : 0;
                  return (
                    <li key={b.id} className="flex items-center gap-3">
                      <span className="h-8 w-8 rounded-sm shrink-0" style={{ background: act?.color ?? '#214a57' }} />
                      <div className="flex-1 min-w-0">
                        <p className="font-display text-lg text-navy">{act?.name ?? '—'}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <div className="w-24 h-1.5 bg-sand rounded-sm overflow-hidden">
                            <div className="h-full bg-navy" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs text-muted">{remaining}/{b.total_credits}</span>
                        </div>
                      </div>
                      {b.expires_at && (
                        <span className="text-[0.66rem] text-muted shrink-0">
                          caduca {new Date(b.expires_at).toLocaleDateString('es-ES')}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="rounded-md border border-line bg-paper p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-label text-[0.72rem] text-muted">Próximas clases</h2>
              <Link href={`/${tenant.slug}/calendario`} className="text-xs text-navy underline">Ver calendario →</Link>
            </div>
            {upcoming.length === 0 ? (
              <p className="text-sm text-muted">No tienes clases próximas. Reserva una desde el calendario.</p>
            ) : (
              <ul className="space-y-2">
                {upcoming.map(({ enrollment, cls }) => {
                  const act = activityById.get(cls!.activity_id);
                  return (
                    <li key={enrollment.id} className="flex items-center gap-3">
                      <span className="h-8 w-8 rounded-sm shrink-0" style={{ background: act?.color ?? '#214a57' }} />
                      <div className="flex-1 min-w-0">
                        <p className="font-display text-lg text-navy">{act?.name ?? '—'}</p>
                        <p className="text-xs text-muted">
                          {new Date(cls!.starts_at).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}{' '}
                          · {formatSpanishTime(cls!.starts_at)}
                        </p>
                      </div>
                      {enrollment.bono_id && (
                        <span className="font-label text-[0.6rem] bg-yellow/20 text-navy px-2 py-0.5 rounded-sm shrink-0">Bono</span>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>

        {campBookings.length > 0 && (
          <section className="mb-10">
            <h2 className="font-label text-[0.72rem] text-muted mb-3">Mis surf camps</h2>
            <ul className="space-y-2">
              {campBookings.map((cb) => {
                const camp = campById.get(cb.camp_id);
                const pending = cb.total_cents - cb.paid_cents;
                return (
                  <li key={cb.id} className="rounded-md border border-line bg-paper px-4 py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-display text-lg text-navy">
                        {camp ? (
                          <Link href={`/${tenant.slug}/camps/${camp.slug}`} className="hover:underline">{camp.name}</Link>
                        ) : 'Camp'}
                      </p>
                      <p className="text-xs text-muted">
                        {centsToEuros(cb.paid_cents)} pagado de {centsToEuros(cb.total_cents)}
                        {pending > 0 && <span className="text-red-600"> · pendiente {centsToEuros(pending)}</span>}
                      </p>
                    </div>
                    <span className="font-label text-[0.6rem] bg-sand text-navy px-2 py-0.5 rounded-sm">
                      {cb.status === 'pending' ? 'Pendiente' : cb.status === 'deposit_paid' ? 'Depósito pagado' : cb.status === 'fully_paid' ? 'Pagado' : cb.status}
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {family.length > 0 && (
          <section>
            <h2 className="font-label text-[0.72rem] text-muted mb-3">Mi familia</h2>
            <ul className="flex flex-wrap gap-2">
              {family.map((m) => (
                <li key={m.id} className="rounded-pill bg-sand text-navy px-4 py-1.5 text-sm">
                  {m.full_name}
                  {m.level && <span className="text-muted text-xs ml-2">· {m.level}</span>}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
