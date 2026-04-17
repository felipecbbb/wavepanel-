import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { logoutAction } from '../(auth)/login/actions';

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
      <main className="mx-auto max-w-xl p-8">
        <h1 className="mb-2 text-2xl font-bold">No encuentro tu escuela</h1>
        <p className="text-sm text-gray-600">
          Entra por <code>subdominio.wavepanel.app/dashboard</code> o añade <code>?tenant=slug</code> en local.
        </p>
      </main>
    );
  }

  const { data: school, error } = await supabase
    .from('schools')
    .select('id, slug, name, plan, trial_ends_at, stripe_status')
    .eq('slug', slug)
    .maybeSingle<School>();

  if (error || !school) {
    return (
      <main className="mx-auto max-w-xl p-8">
        <h1 className="mb-2 text-2xl font-bold">Sin acceso</h1>
        <p className="text-sm text-gray-600">
          No perteneces a <strong>{slug}</strong> o esta escuela no existe.
        </p>
        <form action={logoutAction} className="mt-4">
          <button className="text-sm underline">Cerrar sesión</button>
        </form>
      </main>
    );
  }

  const daysLeft = Math.max(
    0,
    Math.ceil((new Date(school.trial_ends_at).getTime() - Date.now()) / 86_400_000),
  );

  return (
    <main className="mx-auto max-w-3xl p-8">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Hola, {school.name}</h1>
          <p className="text-sm text-gray-600">
            {school.slug}.wavepanel.app · Plan {school.plan}
          </p>
        </div>
        <form action={logoutAction}>
          <button className="text-sm text-gray-600 underline">Salir</button>
        </form>
      </header>

      <section className="rounded-lg border border-amber-200 bg-amber-50 p-4">
        <p className="text-sm">
          <strong>Trial:</strong>{' '}
          {school.stripe_status
            ? school.stripe_status
            : daysLeft > 0
              ? `${daysLeft} días restantes`
              : 'trial expirado — añade método de pago para continuar'}
        </p>
      </section>

      <section className="mt-6 rounded-lg border border-gray-200 p-6">
        <h2 className="mb-2 text-lg font-semibold">Próximos pasos</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700">
          <li>Reservas, clientes y calendario — próximamente.</li>
          <li>Configurar método de pago (Stripe) — próximamente.</li>
          <li>Invitar equipo — próximamente.</li>
        </ul>
      </section>
    </main>
  );
}
