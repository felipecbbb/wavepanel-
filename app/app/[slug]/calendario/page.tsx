import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { formatSpanishTime } from '@/lib/dates';

type Tenant = { id: string; slug: string; name: string; primary_color: string };

type ClassRow = {
  id: string;
  starts_at: string;
  ends_at: string;
  activity_id: string;
  instructor_id: string | null;
  max_students: number;
  enrolled_count: number;
  level: string | null;
};

type Activity = { id: string; slug: string; name: string; color: string };
type Instructor = { id: string; name: string };

export default async function CalendarioPublicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: tenant } = await supabase
    .from('schools')
    .select('id, slug, name, primary_color')
    .eq('slug', slug)
    .maybeSingle<Tenant>();
  if (!tenant) notFound();

  const { data: { user } } = await supabase.auth.getUser();
  const isLoggedIn = !!user;

  const from = new Date();
  const to = new Date();
  to.setDate(to.getDate() + 30);

  const [{ data: classesData }, { data: activitiesData }, { data: instructorsData }] = await Promise.all([
    supabase
      .from('surf_classes')
      .select('id, starts_at, ends_at, activity_id, instructor_id, max_students, enrolled_count, level')
      .eq('school_id', tenant.id)
      .eq('published', true)
      .gte('starts_at', from.toISOString())
      .lte('starts_at', to.toISOString())
      .order('starts_at', { ascending: true }),
    supabase.from('activities').select('id, slug, name, color').eq('school_id', tenant.id).eq('active', true),
    supabase.from('instructors').select('id, name').eq('school_id', tenant.id).eq('active', true),
  ]);

  const classes = (classesData ?? []) as ClassRow[];
  const activityById = new Map(((activitiesData ?? []) as Activity[]).map((a) => [a.id, a]));
  const instructorById = new Map(((instructorsData ?? []) as Instructor[]).map((i) => [i.id, i]));

  // Agrupa por día
  const byDay = new Map<string, ClassRow[]>();
  classes.forEach((c) => {
    const day = c.starts_at.slice(0, 10);
    (byDay.get(day) ?? byDay.set(day, []).get(day)!).push(c);
  });

  return (
    <div className="pt-[72px]">
      <div className="mx-auto w-[min(1100px,92vw)] py-14">
        <p className="kicker mb-2" style={{ color: tenant.primary_color }}>Calendario</p>
        <h1 className="font-display text-5xl text-navy mb-3">Próximas clases.</h1>
        <p className="text-muted text-sm mb-10 max-w-xl">
          Clases publicadas para los próximos 30 días. Elige la actividad en el catálogo para reservar con un bono.
        </p>

        {classes.length === 0 ? (
          <p className="text-muted">No hay clases publicadas en los próximos 30 días.</p>
        ) : (
          <div className="space-y-8">
            {Array.from(byDay.entries()).map(([day, list]) => (
              <section key={day}>
                <h2 className="font-label text-[0.72rem] text-muted mb-3 capitalize">
                  {new Date(day).toLocaleDateString('es-ES', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                  })}
                </h2>
                <ul className="space-y-2">
                  {list.map((c) => {
                    const act = activityById.get(c.activity_id);
                    const instr = c.instructor_id ? instructorById.get(c.instructor_id) : null;
                    const full = c.enrolled_count >= c.max_students;
                    const remaining = c.max_students - c.enrolled_count;
                    return (
                      <li key={c.id} className="rounded-md border border-line bg-paper">
                        <div
                          className="flex items-center gap-4 px-5 py-3 border-l-[6px]"
                          style={{ borderLeftColor: act?.color ?? '#214a57' }}
                        >
                          <div className="text-right shrink-0 w-20">
                            <p className="font-display text-2xl text-navy leading-none">{formatSpanishTime(c.starts_at)}</p>
                            <p className="text-xs text-muted">{formatSpanishTime(c.ends_at)}</p>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-display text-xl text-navy">
                              {act ? (
                                <Link href={`/${tenant.slug}/actividades/${act.slug}`} className="hover:text-navy-soft">
                                  {act.name}
                                </Link>
                              ) : (
                                'Actividad'
                              )}
                            </p>
                            <p className="text-xs text-muted">
                              {instr ? `Con ${instr.name}` : 'Sin instructor asignado'}
                              {c.level && <> · {c.level}</>}
                            </p>
                          </div>
                          <div className="text-right shrink-0 flex items-center gap-3">
                            {full ? (
                              <span className="font-label text-[0.66rem] bg-red-50 text-red-700 px-2 py-0.5 rounded-sm">
                                COMPLETA
                              </span>
                            ) : (
                              <>
                                <p className="font-label text-[0.66rem] text-muted">{remaining} plazas</p>
                                <Link
                                  href={isLoggedIn ? `/${tenant.slug}/mi-cuenta/reservar?class=${c.id}` : `/${tenant.slug}/auth/signup?class=${c.id}`}
                                  className="rounded-pill px-4 py-1.5 font-label text-[0.66rem] text-navy"
                                  style={{ background: tenant.primary_color }}
                                >
                                  Reservar
                                </Link>
                              </>
                            )}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
