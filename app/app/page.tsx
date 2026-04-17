import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const h = await headers();
    const slug = h.get('x-tenant-slug');
    if (slug) redirect('/dashboard');
  }

  return (
    <main className="mx-auto max-w-xl p-8">
      <h1 className="mb-2 text-3xl font-bold">WavePanel</h1>
      <p className="mb-6 text-gray-600">
        Software de gestión para escuelas de surf, kite y deportes acuáticos.
      </p>
      <div className="flex gap-3">
        <a href="/signup" className="rounded-md bg-black px-4 py-2.5 text-white">
          Empezar 14 días gratis
        </a>
        <a href="/login" className="rounded-md border border-gray-300 px-4 py-2.5">
          Entrar
        </a>
      </div>
    </main>
  );
}
