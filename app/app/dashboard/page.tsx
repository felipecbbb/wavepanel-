import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

type School = {
  id: string;
  slug: string;
  name: string;
  plan: string;
  trial_ends_at: string;
  stripe_status: string | null;
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ tenant?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const h = await headers();
  const sp = await searchParams;
  const slug = h.get('x-tenant-slug') ?? sp.tenant ?? null;

  if (!slug) {
    return (
      <EmptyState
        title="No encuentro tu escuela"
        body={
          <>
            Entra por <code className="rounded bg-sand px-1.5 py-0.5 text-sm">subdominio.wavepanel.app/dashboard</code>{' '}
            o añade <code className="rounded bg-sand px-1.5 py-0.5 text-sm">?tenant=slug</code> en local.
          </>
        }
      />
    );
  }

  const { data: school, error } = await supabase
    .from('schools')
    .select('id, slug, name, plan, trial_ends_at, stripe_status')
    .eq('slug', slug)
    .maybeSingle<School>();

  if (error || !school) {
    return (
      <EmptyState
        title="Sin acceso"
        body={<>No perteneces a <strong>{slug}</strong> o esta escuela no existe.</>}
      />
    );
  }

  const daysLeft = Math.max(
    0,
    Math.ceil((new Date(school.trial_ends_at).getTime() - Date.now()) / 86_400_000),
  );

  return (
    <div className="mx-auto w-[min(1220px,92vw)] py-10">
      <header className="mb-8">
        <p className="kicker mb-2">Panel</p>
        <h1 className="font-display text-5xl text-navy">
          Hola, <em className="not-italic text-yellow">{school.name}</em>
        </h1>
        <p className="mt-2 text-muted">
          {school.slug}.wavepanel.app · Plan <strong className="text-navy">{school.plan}</strong>
        </p>
      </header>

      <TrialBanner stripeStatus={school.stripe_status} daysLeft={daysLeft} />

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        <ComingSoonCard title="Clientes" description="Fichero de clientes, historial, notas y etiquetas." />
        <ComingSoonCard title="Calendario" description="Vista semanal con drag-drop para reprogramar." />
        <ComingSoonCard title="Reservas" description="Confirmación automática, pagos online y check-in con firma." />
        <ComingSoonCard title="Actividades" description="Surf, kite, yoga, SUP. Precios, capacidad y instructores." />
        <ComingSoonCard title="Tienda" description="Catálogo con stock, bonos, cupones y links de pago." />
        <ComingSoonCard title="Surf Camps" description="Ediciones con plazas, early bird y habitaciones." />
      </section>
    </div>
  );
}

function EmptyState({ title, body }: { title: string; body: React.ReactNode }) {
  return (
    <div className="mx-auto w-[min(560px,92vw)] py-20">
      <p className="kicker mb-3">Dashboard</p>
      <h1 className="font-display text-4xl text-navy">{title}</h1>
      <p className="mt-3 text-muted">{body}</p>
    </div>
  );
}

function TrialBanner({ stripeStatus, daysLeft }: { stripeStatus: string | null; daysLeft: number }) {
  if (stripeStatus === 'active') {
    return (
      <section className="rounded-md border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-900">
        <strong className="font-label text-[0.72rem] block mb-1">Plan activo</strong>
        Tu suscripción está al día.
      </section>
    );
  }
  const expired = daysLeft === 0 && (!stripeStatus || stripeStatus === 'trialing');
  return (
    <section
      className={`rounded-md border px-5 py-4 text-sm ${
        expired ? 'border-red-200 bg-red-50 text-red-900' : 'border-yellow/40 bg-yellow/10 text-navy'
      }`}
    >
      <strong className="font-label text-[0.72rem] block mb-1">
        {expired ? 'Trial expirado' : 'Trial gratis'}
      </strong>
      {expired
        ? 'Añade un método de pago para continuar usando WavePanel.'
        : `${daysLeft} días restantes. Sin tarjeta hasta que decidas.`}
    </section>
  );
}

function ComingSoonCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-md border border-line bg-paper p-5 hover:shadow-card transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-display text-2xl text-navy">{title}</h3>
        <span className="font-label text-[0.6rem] text-muted bg-sand px-2 py-1 rounded-sm">Próximamente</span>
      </div>
      <p className="text-sm text-muted">{description}</p>
    </div>
  );
}
