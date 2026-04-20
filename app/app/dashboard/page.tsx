import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { resolveActiveSchool, daysUntil } from '@/lib/tenant-server';
import { centsToEuros } from '@/lib/slug';
import { formatSpanishTime } from '@/lib/dates';

function startOfMonth(offsetMonths = 0): string {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() + offsetMonths);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function startOfWeek(): string {
  const d = new Date();
  const day = d.getDay() || 7; // lunes=1, domingo=7
  d.setDate(d.getDate() - (day - 1));
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function endOfWeek(): string {
  const d = new Date(startOfWeek());
  d.setDate(d.getDate() + 7);
  return d.toISOString();
}

function pctDelta(current: number, previous: number): { label: string; positive: boolean | null } {
  if (previous === 0) return { label: current > 0 ? '+100%' : '—', positive: current > 0 };
  const delta = ((current - previous) / previous) * 100;
  const sign = delta > 0 ? '+' : '';
  return {
    label: `${sign}${delta.toFixed(0)}%`,
    positive: delta > 0 ? true : delta < 0 ? false : null,
  };
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ tenant?: string }>;
}) {
  const sp = await searchParams;
  const school = await resolveActiveSchool(sp.tenant);
  const supabase = await createClient();

  const monthStart = startOfMonth();
  const prevMonthStart = startOfMonth(-1);
  const weekStart = startOfWeek();
  const weekEnd = endOfWeek();
  const today = new Date().toISOString().slice(0, 10);
  const nowIso = new Date().toISOString();

  const [
    { data: payments },
    { data: prevPayments },
    { count: clientsCount },
    { count: newClientsCount },
    { data: weekClasses },
    { count: openCampsCount },
    { count: activeBonosCount },
    { data: recentEnrollments },
    { data: monthEnrollments },
    { data: activitiesForJoin },
    { data: clientsForJoin },
    { data: classesForJoin },
  ] = await Promise.all([
    supabase.from('payments').select('amount_cents, method, paid_at').gte('paid_at', monthStart),
    supabase.from('payments').select('amount_cents').gte('paid_at', prevMonthStart).lt('paid_at', monthStart),
    supabase.from('clients').select('*', { count: 'exact', head: true }),
    supabase.from('clients').select('*', { count: 'exact', head: true }).gte('created_at', monthStart),
    supabase.from('surf_classes').select('id, starts_at, enrolled_count, max_students, activity_id').gte('starts_at', weekStart).lt('starts_at', weekEnd).order('starts_at', { ascending: true }),
    supabase.from('surf_camps').select('*', { count: 'exact', head: true }).eq('status', 'open').gte('starts_on', today),
    supabase.from('bonos').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('class_enrollments').select('id, class_id, client_id, status, created_at').order('created_at', { ascending: false }).limit(5),
    supabase
      .from('class_enrollments')
      .select('class_id, status, created_at')
      .gte('created_at', monthStart)
      .in('status', ['confirmed', 'completed', 'paid', 'partial']),
    supabase.from('activities').select('id, name, color'),
    supabase.from('clients').select('id, name'),
    supabase.from('surf_classes').select('id, starts_at, activity_id'),
  ]);

  type PaymentRow = { amount_cents: number; method: string; paid_at: string };
  const monthRevenue = ((payments ?? []) as PaymentRow[]).reduce((s, p) => s + p.amount_cents, 0);
  const prevMonthRevenue = ((prevPayments ?? []) as { amount_cents: number }[]).reduce((s, p) => s + p.amount_cents, 0);
  const revenueDelta = pctDelta(monthRevenue, prevMonthRevenue);
  const cashRevenue = ((payments ?? []) as PaymentRow[]).filter((p) => p.method === 'cash').reduce((s, p) => s + p.amount_cents, 0);
  const cardRevenue = ((payments ?? []) as PaymentRow[]).filter((p) => p.method === 'card').reduce((s, p) => s + p.amount_cents, 0);

  type WeekClass = { id: string; starts_at: string; enrolled_count: number; max_students: number; activity_id: string };
  const weekClassList = (weekClasses ?? []) as WeekClass[];

  const activityById = new Map(((activitiesForJoin ?? []) as { id: string; name: string; color: string }[]).map((a) => [a.id, a]));
  const clientById = new Map(((clientsForJoin ?? []) as { id: string; name: string }[]).map((c) => [c.id, c]));
  const classById = new Map(((classesForJoin ?? []) as { id: string; starts_at: string; activity_id: string }[]).map((c) => [c.id, c]));

  // Occupancy: clases de la semana → total enrolled / total capacidad
  const weekCapacity = weekClassList.reduce((s, c) => s + c.max_students, 0);
  const weekEnrolled = weekClassList.reduce((s, c) => s + c.enrolled_count, 0);
  const occupancyPct = weekCapacity > 0 ? Math.round((weekEnrolled / weekCapacity) * 100) : 0;

  // Top actividades del mes por nº de inscripciones
  const enrollmentsByActivity: Record<string, number> = {};
  for (const e of (monthEnrollments ?? []) as { class_id: string }[]) {
    const cls = classById.get(e.class_id);
    if (!cls) continue;
    enrollmentsByActivity[cls.activity_id] = (enrollmentsByActivity[cls.activity_id] ?? 0) + 1;
  }
  const topActivities = Object.entries(enrollmentsByActivity)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([activityId, count]) => ({
      activity: activityById.get(activityId),
      count,
    }))
    .filter((x) => x.activity);
  const totalMonthEnrollments = Object.values(enrollmentsByActivity).reduce((s, n) => s + n, 0);

  const daysLeft = daysUntil(school.trial_ends_at);
  const expired = daysLeft === 0 && (!school.stripe_status || school.stripe_status === 'trialing');

  const upcomingToday = weekClassList.filter((c) => c.starts_at > nowIso).slice(0, 5);

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <header className="mb-10">
        <p className="kicker mb-2">Panel</p>
        <h1 className="font-display text-5xl text-navy">
          Hola, <em className="not-italic text-yellow">{school.name}</em>
        </h1>
        <p className="mt-2 text-muted text-[0.95rem]">
          Plan <strong className="text-navy">{school.plan}</strong> · {school.slug}
        </p>
      </header>

      {expired && (
        <section className="mb-8 rounded-md border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-900">
          <strong className="font-label text-[0.72rem] block mb-1">Trial expirado</strong>
          El sistema de pagos con Stripe todavía no está activo. Por ahora puedes seguir usando el panel sin cobro.
        </section>
      )}

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-10">
        <Kpi
          kicker="Ingresos este mes"
          value={centsToEuros(monthRevenue)}
          sub={`${(payments ?? []).length} cobros`}
          delta={revenueDelta}
          deltaLabel="vs mes anterior"
        />
        <Kpi
          kicker="Clientes"
          value={String(clientsCount ?? 0)}
          sub={`+${newClientsCount ?? 0} este mes`}
        />
        <Kpi
          kicker="Ocupación esta semana"
          value={`${occupancyPct}%`}
          sub={`${weekEnrolled}/${weekCapacity} plazas · ${weekClassList.length} clases`}
        />
        <Kpi
          kicker="Camps abiertos"
          value={String(openCampsCount ?? 0)}
          sub={`${activeBonosCount ?? 0} bonos activos`}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-[2fr_1fr] mb-10">
        <div className="rounded-md border border-line bg-paper p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-label text-[0.72rem] text-muted">Próximas clases</h2>
            <Link href="/dashboard/calendario" className="text-xs text-navy underline">Ver calendario →</Link>
          </div>
          {upcomingToday.length === 0 ? (
            <p className="text-sm text-muted">No hay clases próximas en los próximos días.</p>
          ) : (
            <ul className="space-y-2">
              {upcomingToday.map((c) => {
                const act = activityById.get(c.activity_id);
                return (
                  <li key={c.id} className="flex items-center gap-3">
                    <span className="h-8 w-8 rounded-sm shrink-0" style={{ background: act?.color ?? '#214a57' }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-navy">{act?.name ?? 'Actividad'}</p>
                      <p className="text-xs text-muted">
                        {new Date(c.starts_at).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' })} · {formatSpanishTime(c.starts_at)}
                      </p>
                    </div>
                    <span className="text-xs text-muted">{c.enrolled_count}/{c.max_students}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="rounded-md border border-line bg-paper p-6">
          <h2 className="font-label text-[0.72rem] text-muted mb-4">Ingresos por método (mes)</h2>
          <ul className="space-y-3 text-sm">
            <li className="flex justify-between"><span>Efectivo</span><span className="font-semibold">{centsToEuros(cashRevenue)}</span></li>
            <li className="flex justify-between"><span>Tarjeta</span><span className="font-semibold">{centsToEuros(cardRevenue)}</span></li>
            <li className="flex justify-between border-t border-line pt-2 mt-2 text-navy">
              <span className="font-label text-[0.72rem]">Otros</span>
              <span className="font-semibold">{centsToEuros(monthRevenue - cashRevenue - cardRevenue)}</span>
            </li>
          </ul>
        </div>
      </section>

      <section className="rounded-md border border-line bg-paper p-6 mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-label text-[0.72rem] text-muted">Top actividades del mes</h2>
          <span className="text-xs text-muted">{totalMonthEnrollments} inscripciones</span>
        </div>
        {topActivities.length === 0 ? (
          <p className="text-sm text-muted">Aún sin inscripciones este mes.</p>
        ) : (
          <ul className="space-y-2.5">
            {topActivities.map(({ activity, count }) => {
              const pct = totalMonthEnrollments > 0 ? (count / totalMonthEnrollments) * 100 : 0;
              return (
                <li key={activity!.id} className="flex items-center gap-3 text-sm">
                  <span className="h-3 w-3 rounded-sm shrink-0" style={{ background: activity!.color }} />
                  <span className="w-32 truncate text-navy">{activity!.name}</span>
                  <div className="flex-1 h-2 bg-sand rounded-sm overflow-hidden">
                    <div className="h-full" style={{ width: `${pct}%`, background: activity!.color, opacity: 0.6 }} />
                  </div>
                  <span className="text-xs text-muted w-16 text-right">{count} ({pct.toFixed(0)}%)</span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="rounded-md border border-line bg-paper p-6 mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-label text-[0.72rem] text-muted">Últimas inscripciones</h2>
          <Link href="/dashboard/calendario" className="text-xs text-navy underline">Al calendario →</Link>
        </div>
        {(recentEnrollments ?? []).length === 0 ? (
          <p className="text-sm text-muted">Aún sin inscripciones registradas.</p>
        ) : (
          <ul className="divide-y divide-line">
            {((recentEnrollments ?? []) as { id: string; class_id: string; client_id: string; status: string; created_at: string }[]).map((e) => {
              const client = clientById.get(e.client_id);
              const cls = classById.get(e.class_id);
              const act = cls ? activityById.get(cls.activity_id) : null;
              return (
                <li key={e.id} className="py-2.5 flex items-center gap-3">
                  <span className="h-3 w-3 rounded-sm shrink-0" style={{ background: act?.color ?? '#214a57' }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <Link href={`/dashboard/clientes/${client?.id}`} className="font-semibold text-navy hover:underline">
                        {client?.name ?? 'Cliente'}
                      </Link>{' '}
                      <span className="text-muted">en {act?.name ?? 'clase'}</span>
                    </p>
                    <p className="text-xs text-muted">
                      {cls && `${new Date(cls.starts_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })} ${formatSpanishTime(cls.starts_at)} · `}
                      inscrita {new Date(e.created_at).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                  <span className="font-label text-[0.6rem] text-muted bg-sand px-2 py-0.5 rounded-sm">{e.status}</span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section>
        <h2 className="font-label text-[0.72rem] text-muted mb-3">Accesos rápidos</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <QuickLink href="/dashboard/clientes" title="Clientes" desc="Fichas con familia, salud, bonos, historial." />
          <QuickLink href="/dashboard/actividades" title="Actividades" desc="Tipos y packs de precios escalonados." />
          <QuickLink href="/dashboard/calendario" title="Calendario" desc="Clases programadas + inscripciones." />
          <QuickLink href="/dashboard/camps" title="Surf Camps" desc="Ediciones con plazas y depósitos." />
          <QuickLink href="/dashboard/bonos" title="Bonos" desc="Packs vendidos, consumo, caducidad." />
          <QuickLink href="/dashboard/pagos" title="Pagos" desc="Auditoría de todos los cobros." />
        </div>
      </section>
    </div>
  );
}

function Kpi({
  kicker,
  value,
  sub,
  delta,
  deltaLabel,
}: {
  kicker: string;
  value: string;
  sub?: string;
  delta?: { label: string; positive: boolean | null };
  deltaLabel?: string;
}) {
  const deltaColor =
    delta?.positive === true
      ? 'text-emerald-700 bg-emerald-50'
      : delta?.positive === false
      ? 'text-red-700 bg-red-50'
      : 'text-muted bg-sand';
  return (
    <div className="rounded-md border border-line bg-paper p-5">
      <p className="font-label text-[0.66rem] text-muted mb-2">{kicker}</p>
      <div className="flex items-baseline gap-2">
        <p className="font-display text-3xl text-navy">{value}</p>
        {delta && (
          <span className={`text-[0.68rem] font-label px-1.5 py-0.5 rounded-sm ${deltaColor}`}>
            {delta.label}
          </span>
        )}
      </div>
      {sub && <p className="text-xs text-muted mt-1">{sub}{deltaLabel && delta && ` · ${deltaLabel}`}</p>}
    </div>
  );
}

function QuickLink({ href, title, desc }: { href: string; title: string; desc: string }) {
  return (
    <Link
      href={href}
      className="block rounded-md border border-line bg-paper p-5 hover:shadow-card hover:border-navy transition"
    >
      <h3 className="font-display text-xl text-navy mb-1">{title}</h3>
      <p className="text-sm text-muted">{desc}</p>
    </Link>
  );
}
