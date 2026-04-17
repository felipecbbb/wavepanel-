import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { resolveActiveSchool } from '@/lib/tenant-server';
import InstructorForm from '../instructor-form';
import { updateInstructorAction, deleteInstructorAction } from '../actions';

type Instructor = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  color: string;
  active: boolean;
};

export default async function EditarInstructorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await resolveActiveSchool();
  const supabase = await createClient();

  const { data: instructor } = await supabase
    .from('instructors')
    .select('id, name, email, phone, color, active')
    .eq('id', id)
    .maybeSingle<Instructor>();

  if (!instructor) notFound();

  const boundUpdate = updateInstructorAction.bind(null, instructor.id);
  const boundDelete = deleteInstructorAction.bind(null, instructor.id);

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      <nav className="mb-6 text-sm text-muted">
        <a href="/dashboard/instructores" className="hover:text-navy">Instructores</a>
        <span className="mx-2">/</span>
        <span className="text-navy">{instructor.name}</span>
      </nav>

      <div className="flex items-start justify-between mb-8 gap-4">
        <div className="flex items-center gap-3">
          <span
            className="h-12 w-12 rounded-pill flex items-center justify-center font-display text-2xl"
            style={{ background: instructor.color, color: '#0f2f39' }}
          >
            {instructor.name.charAt(0).toUpperCase()}
          </span>
          <div>
            <p className="kicker">Instructor</p>
            <h1 className="font-display text-4xl text-navy">{instructor.name}</h1>
          </div>
        </div>
        <form action={boundDelete}>
          <button
            type="submit"
            className="rounded-sm border border-red-200 text-red-700 px-3 py-1.5 text-[0.76rem] font-label hover:bg-red-50 shrink-0"
            onClick={(e) => {
              if (!confirm(`¿Borrar a "${instructor.name}"? Sus clases asignadas pasarán a sin instructor.`)) e.preventDefault();
            }}
          >
            Borrar instructor
          </button>
        </form>
      </div>

      <InstructorForm
        action={boundUpdate}
        submitLabel="Guardar cambios"
        initial={{
          name: instructor.name,
          email: instructor.email,
          phone: instructor.phone,
          color: instructor.color,
          active: instructor.active,
        }}
      />
    </div>
  );
}
