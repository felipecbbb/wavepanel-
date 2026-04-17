import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import LoginForm from './login-form';

type Tenant = { id: string; slug: string; name: string; primary_color: string };

export default async function StudentLoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string>>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const supabase = await createClient();

  const { data: tenant } = await supabase
    .from('schools')
    .select('id, slug, name, primary_color')
    .eq('slug', slug)
    .maybeSingle<Tenant>();
  if (!tenant) notFound();

  const queryParts: string[] = [];
  if (sp.buy) queryParts.push(`buy=${encodeURIComponent(sp.buy)}`);
  if (sp.pack) queryParts.push(`pack=${encodeURIComponent(sp.pack)}`);
  if (sp.camp) queryParts.push(`camp=${encodeURIComponent(sp.camp)}`);
  if (sp.class) queryParts.push(`class=${encodeURIComponent(sp.class)}`);
  const next = queryParts.length ? `/mi-cuenta?${queryParts.join('&')}` : '/mi-cuenta';

  return (
    <div className="pt-[72px]">
      <div className="mx-auto w-[min(420px,92vw)] py-16">
        <p className="kicker mb-3" style={{ color: tenant.primary_color }}>Iniciar sesión</p>
        <h1 className="font-display text-5xl text-navy">Hola otra vez.</h1>

        <LoginForm schoolSlug={tenant.slug} next={next} primaryColor={tenant.primary_color} />

        <p className="mt-8 text-sm text-muted">
          ¿No tienes cuenta?{' '}
          <a
            href={`/${tenant.slug}/auth/signup${queryParts.length ? `?${queryParts.join('&')}` : ''}`}
            className="underline hover:text-navy"
          >
            Crear una
          </a>
        </p>
      </div>
    </div>
  );
}
