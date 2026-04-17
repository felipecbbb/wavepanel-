import { resolveActiveSchool } from '@/lib/tenant-server';
import ClientForm from '../client-form';
import { createClientAction } from '../actions';

export default async function NuevoClientePage() {
  await resolveActiveSchool();
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      <nav className="mb-6 text-sm text-muted">
        <a href="/dashboard/clientes" className="hover:text-navy">Clientes</a>
        <span className="mx-2">/</span>
        <span className="text-navy">Nuevo</span>
      </nav>
      <p className="kicker mb-2">Crear cliente</p>
      <h1 className="font-display text-4xl text-navy mb-8">Añade un cliente.</h1>
      <ClientForm action={createClientAction} submitLabel="Crear cliente" />
    </div>
  );
}
