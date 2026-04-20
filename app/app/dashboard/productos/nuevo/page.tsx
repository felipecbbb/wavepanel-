import Link from 'next/link';
import { resolveActiveSchool } from '@/lib/tenant-server';
import ProductForm from '../product-form';

export default async function NuevoProductoPage() {
  await resolveActiveSchool();
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      <nav className="mb-6 text-sm text-muted">
        <Link href="/dashboard/productos" className="hover:text-navy">Productos</Link>
        <span className="mx-2">/</span>
        <span className="text-navy">Nuevo</span>
      </nav>
      <p className="kicker mb-2">Nuevo producto</p>
      <h1 className="font-display text-4xl text-navy mb-8">Añade un producto.</h1>
      <ProductForm />
    </div>
  );
}
