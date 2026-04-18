import Link from 'next/link';
import { resolveActiveSchool } from '@/lib/tenant-server';
import InstructorForm from '../instructor-form';
import { createInstructorAction } from '../actions';

export default async function NuevoInstructorPage() {
  await resolveActiveSchool();
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      <nav className="mb-6 text-sm text-muted">
        <Link href="/dashboard/instructores" className="hover:text-navy">Instructores</Link>
        <span className="mx-2">/</span>
        <span className="text-navy">Nuevo</span>
      </nav>
      <p className="kicker mb-2">Crear instructor</p>
      <h1 className="font-display text-4xl text-navy mb-8">Nuevo instructor.</h1>
      <InstructorForm action={createInstructorAction} submitLabel="Crear instructor" />
    </div>
  );
}
