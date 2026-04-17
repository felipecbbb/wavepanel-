import { resolveActiveSchool, daysUntil } from '@/lib/tenant-server';

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ tenant?: string }>;
}) {
  const sp = await searchParams;
  const school = await resolveActiveSchool(sp.tenant);
  const daysLeft = daysUntil(school.trial_ends_at);
  const expired = daysLeft === 0 && (!school.stripe_status || school.stripe_status === 'trialing');

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
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

      <section>
        <h2 className="font-label text-[0.72rem] text-muted mb-3">Accesos rápidos</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <QuickLink href="/dashboard/clientes" title="Clientes" desc="Fichero con historial, notas y etiquetas." />
          <QuickLink href="/dashboard/actividades" title="Actividades" desc="Tipos con precio, duración y capacidad." soon />
          <QuickLink href="/dashboard/calendario" title="Calendario" desc="Semana con drag-drop para reprogramar." soon />
          <QuickLink href="/dashboard/reservas" title="Reservas" desc="Confirmación, check-in y pagos." soon />
          <QuickLink href="/dashboard/instructores" title="Instructores" desc="Fichas, colores y disponibilidad." soon />
          <QuickLink href="/dashboard/ajustes" title="Ajustes" desc="Datos de la escuela, facturación, equipo." soon />
        </div>
      </section>
    </div>
  );
}

function QuickLink({ href, title, desc, soon }: { href: string; title: string; desc: string; soon?: boolean }) {
  return (
    <a
      href={href}
      className="block rounded-md border border-line bg-paper p-5 hover:shadow-card hover:border-navy transition"
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-display text-2xl text-navy">{title}</h3>
        {soon && (
          <span className="font-label text-[0.6rem] text-muted bg-sand px-2 py-1 rounded-sm">Próximamente</span>
        )}
      </div>
      <p className="text-sm text-muted">{desc}</p>
    </a>
  );
}
