import { resolveActiveSchool } from '@/lib/tenant-server';
import CampForm from '../camp-form';
import { createCampAction } from '../actions';

export default async function NuevoCampPage() {
  await resolveActiveSchool();
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      <nav className="mb-6 text-sm text-muted">
        <a href="/dashboard/camps" className="hover:text-navy">Surf Camps</a>
        <span className="mx-2">/</span>
        <span className="text-navy">Nuevo</span>
      </nav>
      <p className="kicker mb-2">Crear camp</p>
      <h1 className="font-display text-4xl text-navy mb-8">Nueva edición.</h1>
      <CampForm action={createCampAction} submitLabel="Crear camp" />
    </div>
  );
}
