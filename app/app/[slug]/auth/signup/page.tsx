import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import SignupForm from './signup-form';

type Tenant = { id: string; slug: string; name: string; primary_color: string };

export default async function StudentSignupPage({
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

  // Construye la URL de "siguiente paso": si venía a comprar un pack o reservar
  // un camp, después del signup volvemos al portal con el intento guardado.
  const queryParts: string[] = [];
  if (sp.buy) queryParts.push(`buy=${encodeURIComponent(sp.buy)}`);
  if (sp.pack) queryParts.push(`pack=${encodeURIComponent(sp.pack)}`);
  if (sp.camp) queryParts.push(`camp=${encodeURIComponent(sp.camp)}`);
  if (sp.class) queryParts.push(`class=${encodeURIComponent(sp.class)}`);
  const next = queryParts.length ? `/mi-cuenta?${queryParts.join('&')}` : '/mi-cuenta';

  return (
    <div className="pt-[72px]">
      <div className="mx-auto w-[min(460px,92vw)] py-16">
        <p className="kicker mb-3" style={{ color: tenant.primary_color }}>Crear cuenta</p>
        <h1 className="font-display text-5xl text-navy">Bienvenido a {tenant.name}.</h1>
        <p className="mt-3 text-muted text-sm">
          Crea tu cuenta para reservar clases, comprar bonos y gestionar tu familia.
        </p>

        <SignupForm schoolSlug={tenant.slug} next={next} primaryColor={tenant.primary_color} />

        <p className="mt-8 text-sm text-muted">
          ¿Ya tienes cuenta?{' '}
          <a href={`/${tenant.slug}/auth/login${queryParts.length ? `?${queryParts.join('&')}` : ''}`} className="underline hover:text-navy">
            Iniciar sesión
          </a>
        </p>
      </div>
    </div>
  );
}
