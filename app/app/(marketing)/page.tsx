import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { ButtonLink } from '@/components/button';

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const h = await headers();
    const slug = h.get('x-tenant-slug');
    if (slug) redirect('/dashboard');
  }

  return (
    <div className="bg-navy text-white">
      <section className="mx-auto w-[min(1220px,92vw)] py-24 md:py-32">
        <p className="kicker mb-4">WavePanel · panel del SaaS</p>
        <h1 className="font-display text-[clamp(2.8rem,7vw,5.2rem)] text-white">
          Entra a tu <em className="not-italic text-yellow">escuela.</em>
        </h1>
        <p className="mt-5 max-w-xl text-lg text-white/70">
          Aquí accedes a tu panel de reservas, clientes, tienda y surf camps.
          Si eres nuevo, crea tu cuenta y arranca 14 días gratis.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/signup" variant="yellow" size="lg">
            Crear cuenta
          </ButtonLink>
          <ButtonLink href="/login" variant="outline-light" size="lg">
            Entrar
          </ButtonLink>
        </div>
        <p className="mt-6 text-sm text-white/50">
          ¿Buscas información del producto?{' '}
          <a
            href={process.env.NEXT_PUBLIC_ROOT_DOMAIN === 'localhost:3000' ? '#' : 'https://wavepanel.app'}
            className="underline hover:text-yellow"
          >
            Ver planes y funcionalidades →
          </a>
        </p>
      </section>
    </div>
  );
}
