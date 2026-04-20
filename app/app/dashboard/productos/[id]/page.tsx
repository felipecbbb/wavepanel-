import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { resolveActiveSchool } from '@/lib/tenant-server';
import ProductForm from '../product-form';
import { deleteProductAction } from '../actions';
import DeleteButton from '@/components/delete-button';

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price_cents: number;
  stock: number;
  category: string | null;
  image_url: string | null;
  active: boolean;
};

export default async function EditarProductoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await resolveActiveSchool();
  const supabase = await createClient();

  const { data: product } = await supabase
    .from('products')
    .select('id, name, slug, description, price_cents, stock, category, image_url, active')
    .eq('id', id)
    .maybeSingle<Product>();

  if (!product) notFound();

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      <nav className="mb-6 text-sm text-muted">
        <Link href="/dashboard/productos" className="hover:text-navy">Productos</Link>
        <span className="mx-2">/</span>
        <span className="text-navy">{product.name}</span>
      </nav>

      <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
        <div>
          <p className="kicker mb-1">Producto</p>
          <h1 className="font-display text-4xl text-navy">{product.name}</h1>
        </div>
        <DeleteButton
          action={deleteProductAction.bind(null, product.id)}
          confirmMessage={`¿Borrar "${product.name}"?`}
          label="Borrar producto"
        />
      </div>

      <ProductForm id={product.id} initial={product} />
    </div>
  );
}
