import Link from 'next/link';
import { resolveActiveSchool } from '@/lib/tenant-server';
import ActivityForm from '../activity-form';
import { createActivityAction } from '../actions';

export default async function NuevaActividadPage() {
  await resolveActiveSchool();
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      <nav className="mb-6 text-sm text-muted">
        <Link href="/dashboard/actividades" className="hover:text-navy">Actividades</Link>
        <span className="mx-2">/</span>
        <span className="text-navy">Nueva</span>
      </nav>
      <p className="kicker mb-2">Crear actividad</p>
      <h1 className="font-display text-4xl text-navy mb-8">Nueva actividad.</h1>
      <ActivityForm action={createActivityAction} submitLabel="Crear actividad" />
      <p className="mt-4 text-xs text-muted">Los packs de precios se añaden después de crearla.</p>
    </div>
  );
}
