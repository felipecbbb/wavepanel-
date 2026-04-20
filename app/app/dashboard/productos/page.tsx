import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { resolveActiveSchool } from '@/lib/tenant-server';
import { centsToEuros } from '@/lib/slug';
import { ButtonLink } from '@/components/button';

type Product = {
  id: string;
  name: string;
  slug: string;
  price_cents: number;
  stock: number;
  category: string | null;
  image_url: string | null;
  active: boolean;
};

export default async function ProductosPage() {
  await resolveActiveSchool();
  const supabase = await createClient();

  const { data } = await supabase
    .from('products')
    .select('id, name, slug, price_cents, stock, category, image_url, active')
    .order('created_at', { ascending: false });

  const products = (data ?? []) as Product[];

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <header className="mb-8 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="kicker mb-2">Tienda</p>
          <h1 className="font-display text-4xl text-navy">Productos.</h1>
          <p className="mt-2 text-muted text-sm max-w-xl">
            Catálogo de merchandising y material. Los activos se muestran en la web pública.
          </p>
        </div>
        <ButtonLink href="/dashboard/productos/nuevo" variant="dark">Nuevo producto</ButtonLink>
      </header>

      {products.length === 0 ? (
        <div className="rounded-md border border-dashed border-line bg-paper p-10 text-center">
          <h3 className="font-display text-2xl text-navy mb-2">Aún no hay productos</h3>
          <p className="text-sm text-muted mb-6">Crea el primero con su precio y stock.</p>
          <ButtonLink href="/dashboard/productos/nuevo" variant="yellow">Crear el primero</ButtonLink>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <Link
              key={p.id}
              href={`/dashboard/productos/${p.id}`}
              className={`rounded-md border bg-paper overflow-hidden hover:shadow-card hover:border-navy transition block ${
                p.active ? 'border-line' : 'border-line/60 opacity-70'
              }`}
            >
              {p.image_url ? (
                <div
                  className="h-36 bg-sand"
                  style={{ backgroundImage: `url(${p.image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                />
              ) : (
                <div className="h-36 bg-sand flex items-center justify-center text-muted text-xs">Sin imagen</div>
              )}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-display text-xl text-navy truncate">{p.name}</h3>
                  {!p.active && (
                    <span className="font-label text-[0.6rem] bg-sand text-muted px-2 py-0.5 rounded-sm shrink-0">Oculto</span>
                  )}
                </div>
                <p className="text-xs text-muted mb-2">
                  {p.category && <>{p.category} · </>}<span className="font-mono">{p.slug}</span>
                </p>
                <div className="flex items-baseline justify-between">
                  <span className="font-display text-2xl text-navy">{centsToEuros(p.price_cents)}</span>
                  <span className={`text-xs ${p.stock === 0 ? 'text-red-600' : 'text-muted'}`}>
                    Stock {p.stock}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
