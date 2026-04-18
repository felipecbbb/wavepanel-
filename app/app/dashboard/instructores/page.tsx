import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { resolveActiveSchool } from '@/lib/tenant-server';
import { ButtonLink } from '@/components/button';

type Row = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  color: string;
  active: boolean;
};

export default async function InstructoresPage() {
  await resolveActiveSchool();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('instructors')
    .select('id, name, email, phone, color, active')
    .order('created_at', { ascending: false });

  const instructors = (data ?? []) as Row[];

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="kicker mb-2">Instructores</p>
          <h1 className="font-display text-4xl text-navy">Tu equipo.</h1>
        </div>
        <ButtonLink href="/dashboard/instructores/nuevo" variant="dark">
          Nuevo instructor
        </ButtonLink>
      </div>

      {error && (
        <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-100">
          {error.message}
        </p>
      )}

      {instructors.length === 0 && !error ? (
        <div className="rounded-md border border-dashed border-line bg-paper p-10 text-center">
          <h3 className="font-display text-2xl text-navy mb-2">Aún no hay instructores</h3>
          <p className="text-sm text-muted mb-6">
            Añade los miembros del equipo que imparten clases. Cada uno tiene un color para distinguir sus sesiones en el calendario.
          </p>
          <ButtonLink href="/dashboard/instructores/nuevo" variant="yellow">
            Añadir el primero
          </ButtonLink>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {instructors.map((i) => (
            <Link
              key={i.id}
              href={`/dashboard/instructores/${i.id}`}
              className="rounded-md border border-line bg-paper p-5 hover:shadow-card hover:border-navy transition block"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="h-10 w-10 rounded-pill shrink-0 flex items-center justify-center font-display text-lg" style={{ background: i.color, color: '#0f2f39' }}>
                  {i.name.charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <h3 className="font-display text-xl text-navy truncate">{i.name}</h3>
                  {!i.active && (
                    <span className="font-label text-[0.6rem] text-muted bg-sand px-2 py-0.5 rounded-sm">Inactivo</span>
                  )}
                </div>
              </div>
              <div className="text-sm text-muted space-y-0.5">
                {i.email && <div className="truncate">{i.email}</div>}
                {i.phone && <div>{i.phone}</div>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
