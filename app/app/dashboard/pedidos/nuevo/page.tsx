import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { resolveActiveSchool } from '@/lib/tenant-server';
import NewOrderForm from '../new-order-form';

type Product = { id: string; name: string; price_cents: number; stock: number };
type Client = { id: string; name: string };

export default async function NuevoPedidoPage() {
  await resolveActiveSchool();
  const supabase = await createClient();

  const [{ data: productsData }, { data: clientsData }] = await Promise.all([
    supabase
      .from('products')
      .select('id, name, price_cents, stock')
      .eq('active', true)
      .order('name'),
    supabase.from('clients').select('id, name').order('name'),
  ]);

  const products = (productsData ?? []) as Product[];
  const clients = (clientsData ?? []) as Client[];

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      <nav className="mb-6 text-sm text-muted">
        <Link href="/dashboard/pedidos" className="hover:text-navy">Pedidos</Link>
        <span className="mx-2">/</span>
        <span className="text-navy">Nuevo</span>
      </nav>
      <p className="kicker mb-2">Nuevo pedido</p>
      <h1 className="font-display text-4xl text-navy mb-8">Crear pedido.</h1>

      {products.length === 0 ? (
        <p className="text-sm text-muted">
          No hay productos activos. <Link href="/dashboard/productos/nuevo" className="underline">Crea el primero</Link>.
        </p>
      ) : (
        <NewOrderForm products={products} clients={clients} />
      )}
    </div>
  );
}
