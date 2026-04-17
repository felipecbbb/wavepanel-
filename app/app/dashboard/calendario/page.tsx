import { createClient } from '@/lib/supabase/server';
import { resolveActiveSchool } from '@/lib/tenant-server';
import { toLocalIsoDate, startOfDay, endOfDay, addDays, formatSpanishDate, formatSpanishTime } from '@/lib/dates';
import { ButtonLink } from '@/components/button';
import NewClassForm from './new-class-form';
import EnrollForm from './enroll-form';
import EnrollmentActions from './enrollment-actions';

type Activity = { id: string; name: string; duration_minutes: number; capacity: number; color: string };
type Instructor = { id: string; name: string; color: string; active: boolean };
type Client = { id: string; name: string };
type FamilyMember = { id: string; client_id: string; full_name: string };
type Bono = { id: string; client_id: string; activity_id: string; total_credits: number; used_credits: number };

type SurfClass = {
  id: string;
  starts_at: string;
  ends_at: string;
  activity_id: string;
  instructor_id: string | null;
  max_students: number;
  enrolled_count: number;
  level: string | null;
  notes: string | null;
  published: boolean;
};

type Enrollment = {
  id: string;
  class_id: string;
  client_id: string;
  family_member_id: string | null;
  bono_id: string | null;
  status: string;
  price_cents: number;
};

export default async function CalendarioPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  await resolveActiveSchool();
  const supabase = await createClient();
  const sp = await searchParams;
  const date = sp.date ?? toLocalIsoDate(new Date());

  const dayStart = startOfDay(date).toISOString();
  const dayEnd = endOfDay(date).toISOString();

  // Queries flat (sin embeds) — evitamos issues de alias de relación en runtime.
  const [
    { data: classesData },
    { data: activitiesData },
    { data: instructorsData },
    { data: clientsData },
    { data: familyData },
    { data: bonosData },
  ] = await Promise.all([
    supabase
      .from('surf_classes')
      .select('id, starts_at, ends_at, activity_id, instructor_id, max_students, enrolled_count, level, notes, published')
      .gte('starts_at', dayStart)
      .lt('starts_at', dayEnd)
      .order('starts_at', { ascending: true }),
    supabase
      .from('activities')
      .select('id, name, duration_minutes, capacity, color')
      .eq('active', true)
      .order('name'),
    supabase
      .from('instructors')
      .select('id, name, color, active')
      .order('name'),
    supabase.from('clients').select('id, name').order('name'),
    supabase.from('family_members').select('id, client_id, full_name'),
    supabase
      .from('bonos')
      .select('id, client_id, activity_id, total_credits, used_credits')
      .eq('status', 'active'),
  ]);

  const classes = (classesData ?? []) as SurfClass[];
  const activities = (activitiesData ?? []) as Activity[];
  const instructors = (instructorsData ?? []) as Instructor[];
  const clients = (clientsData ?? []) as Client[];
  const family = (familyData ?? []) as FamilyMember[];
  const bonos = (bonosData ?? []) as Bono[];

  const activityById = new Map(activities.map((a) => [a.id, a]));
  const instructorById = new Map(instructors.map((i) => [i.id, i]));
  const clientById = new Map(clients.map((c) => [c.id, c]));
  const familyById = new Map(family.map((f) => [f.id, f]));

  const classIds = classes.map((c) => c.id);
  let enrollmentsByClass: Record<string, Enrollment[]> = {};
  if (classIds.length > 0) {
    const { data: enrollmentsData } = await supabase
      .from('class_enrollments')
      .select('id, class_id, client_id, family_member_id, bono_id, status, price_cents')
      .in('class_id', classIds)
      .neq('status', 'cancelled');
    const arr = (enrollmentsData ?? []) as Enrollment[];
    enrollmentsByClass = arr.reduce<Record<string, Enrollment[]>>((acc, e) => {
      (acc[e.class_id] ||= []).push(e);
      return acc;
    }, {});
  }

  const today = toLocalIsoDate(new Date());
  const prev = addDays(date, -1);
  const next = addDays(date, 1);

  const activeInstructorsForForm = instructors.filter((i) => i.active).map((i) => ({ id: i.id, name: i.name }));

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <div className="flex items-end justify-between mb-8 gap-4 flex-wrap">
        <div>
          <p className="kicker mb-2">Calendario</p>
          <h1 className="font-display text-4xl text-navy capitalize">{formatSpanishDate(date)}</h1>
        </div>
        <NewClassForm activities={activities} instructors={activeInstructorsForForm} date={date} />
      </div>

      <div className="flex items-center gap-2 mb-6">
        <ButtonLink href={`/dashboard/calendario?date=${prev}`} variant="outline" size="md">← Anterior</ButtonLink>
        <ButtonLink href={`/dashboard/calendario?date=${today}`} variant="ghost" size="md">Hoy</ButtonLink>
        <ButtonLink href={`/dashboard/calendario?date=${next}`} variant="outline" size="md">Siguiente →</ButtonLink>
      </div>

      {classes.length === 0 ? (
        <div className="rounded-md border border-dashed border-line bg-paper p-10 text-center">
          <p className="text-sm text-muted">No hay clases programadas para este día.</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {classes.map((c) => {
            const activity = activityById.get(c.activity_id);
            const instructor = c.instructor_id ? instructorById.get(c.instructor_id) : null;
            const enrollments = enrollmentsByClass[c.id] ?? [];
            const full = c.enrolled_count >= c.max_students;
            return (
              <li key={c.id} className="rounded-md border border-line bg-paper overflow-hidden">
                <div
                  className="flex items-center gap-3 px-5 py-3 border-l-[6px]"
                  style={{ borderLeftColor: activity?.color ?? '#214a57' }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-display text-xl text-navy">{activity?.name ?? 'Actividad eliminada'}</span>
                      {!c.published && (
                        <span className="font-label text-[0.6rem] bg-sand text-muted px-2 py-0.5 rounded-sm">Sin publicar</span>
                      )}
                      {c.level && (
                        <span className="font-label text-[0.6rem] bg-sand text-navy px-2 py-0.5 rounded-sm">{c.level}</span>
                      )}
                    </div>
                    <p className="text-sm text-muted">
                      {formatSpanishTime(c.starts_at)}–{formatSpanishTime(c.ends_at)}
                      {instructor && <> · {instructor.name}</>}
                      {c.notes && <> · {c.notes}</>}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`font-label text-[0.72rem] ${full ? 'text-red-600' : 'text-navy'}`}>
                      {c.enrolled_count}/{c.max_students} {full ? 'COMPLETA' : 'plazas'}
                    </p>
                    {activity && (
                      <EnrollForm
                        classId={c.id}
                        activityId={activity.id}
                        clients={clients}
                        family={family}
                        bonos={bonos}
                      />
                    )}
                  </div>
                </div>

                {enrollments.length > 0 && (
                  <ul className="divide-y divide-line">
                    {enrollments.map((e) => {
                      const client = clientById.get(e.client_id);
                      const fam = e.family_member_id ? familyById.get(e.family_member_id) : null;
                      const who = fam?.full_name ?? client?.name ?? 'Sin cliente';
                      return (
                        <li key={e.id} className="px-5 py-2.5 flex items-center justify-between gap-3">
                          <div className="min-w-0 flex items-center gap-2 flex-wrap">
                            <span className="text-[0.92rem] text-navy">{who}</span>
                            {fam && client && (
                              <span className="text-xs text-muted">({client.name})</span>
                            )}
                            {e.bono_id && (
                              <span className="font-label text-[0.6rem] bg-yellow/20 text-navy px-2 py-0.5 rounded-sm">Bono</span>
                            )}
                            {!e.bono_id && e.price_cents > 0 && (
                              <span className="font-label text-[0.6rem] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-sm">
                                {(e.price_cents / 100).toFixed(0)}€
                              </span>
                            )}
                            <EnrollmentStatusBadge status={e.status} />
                          </div>
                          <EnrollmentActions enrollmentId={e.id} status={e.status} />
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function EnrollmentStatusBadge({ status }: { status: string }) {
  const label: Record<string, string> = {
    confirmed: 'Confirmado',
    completed: 'Asistió',
    no_show: 'No vino',
    cancelled: 'Cancelado',
    paid: 'Pagado',
    partial: 'Parcial',
  };
  const classes: Record<string, string> = {
    confirmed: 'bg-sand text-navy',
    completed: 'bg-emerald-50 text-emerald-800',
    no_show: 'bg-red-50 text-red-700',
    cancelled: 'bg-sand text-muted',
    paid: 'bg-emerald-50 text-emerald-800',
    partial: 'bg-amber-50 text-amber-800',
  };
  return (
    <span className={`font-label text-[0.6rem] px-2 py-0.5 rounded-sm ${classes[status] ?? 'bg-sand text-muted'}`}>
      {label[status] ?? status}
    </span>
  );
}
