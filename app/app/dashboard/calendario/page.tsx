import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { resolveActiveSchool } from '@/lib/tenant-server';
import {
  toLocalIsoDate,
  startOfDay,
  addDays,
  formatSpanishDate,
  formatSpanishTime,
  startOfWeekIso,
  weekDays,
  formatShortDayLabel,
} from '@/lib/dates';
import { ButtonLink } from '@/components/button';
import NewClassForm from './new-class-form';
import EnrollForm from './enroll-form';
import EnrollmentActions from './enrollment-actions';
import EditClassButton from './edit-class-button';
import DuplicateClassButton from './duplicate-class-button';
import DeleteButton from '@/components/delete-button';
import DragLayer from './drag-layer';
import { deleteClassAction } from './actions';

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
  searchParams: Promise<{ date?: string; view?: string }>;
}) {
  await resolveActiveSchool();
  const supabase = await createClient();
  const sp = await searchParams;
  const date = sp.date ?? toLocalIsoDate(new Date());
  const view: 'day' | 'week' = sp.view === 'week' ? 'week' : 'day';

  const rangeStart = view === 'week' ? startOfWeekIso(date) : date;
  const rangeEndExclusive = view === 'week' ? addDays(rangeStart, 7) : addDays(date, 1);
  const dayStart = startOfDay(rangeStart).toISOString();
  const dayEnd = startOfDay(rangeEndExclusive).toISOString();

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
  const viewQS = view === 'week' ? '&view=week' : '';
  const prev = view === 'week' ? addDays(rangeStart, -7) : addDays(date, -1);
  const next = view === 'week' ? addDays(rangeStart, 7) : addDays(date, 1);

  const activeInstructorsForForm = instructors.filter((i) => i.active).map((i) => ({ id: i.id, name: i.name }));

  const headerTitle =
    view === 'week'
      ? `Semana del ${formatShortDayLabel(rangeStart)}`
      : formatSpanishDate(date);

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      {view === 'day' && <DragLayer />}
      <div className="flex items-end justify-between mb-8 gap-4 flex-wrap">
        <div>
          <p className="kicker mb-2">Calendario</p>
          <h1 className="font-display text-4xl text-navy capitalize">{headerTitle}</h1>
        </div>
        <NewClassForm activities={activities} instructors={activeInstructorsForForm} date={date} />
      </div>

      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <ButtonLink href={`/dashboard/calendario?date=${prev}${viewQS}`} variant="outline" size="md">← Anterior</ButtonLink>
        <ButtonLink href={`/dashboard/calendario?date=${today}${viewQS}`} variant="ghost" size="md">Hoy</ButtonLink>
        <ButtonLink href={`/dashboard/calendario?date=${next}${viewQS}`} variant="outline" size="md">Siguiente →</ButtonLink>
        <div className="ml-auto inline-flex rounded-sm border border-line overflow-hidden text-[0.76rem] font-label">
          <Link
            href={`/dashboard/calendario?date=${date}`}
            className={`px-3 py-1.5 ${view === 'day' ? 'bg-navy text-white' : 'bg-paper text-navy hover:bg-sand'}`}
          >
            Día
          </Link>
          <Link
            href={`/dashboard/calendario?date=${date}&view=week`}
            className={`px-3 py-1.5 ${view === 'week' ? 'bg-navy text-white' : 'bg-paper text-navy hover:bg-sand'}`}
          >
            Semana
          </Link>
        </div>
      </div>

      {view === 'week' ? (
        <WeekGrid
          weekStart={rangeStart}
          classes={classes}
          activityById={activityById}
          today={today}
        />
      ) : classes.length === 0 ? (
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
                  <div className="text-right shrink-0 flex flex-col items-end gap-1">
                    <p className={`font-label text-[0.72rem] ${full ? 'text-red-600' : 'text-navy'}`}>
                      {c.enrolled_count}/{c.max_students} {full ? 'COMPLETA' : 'plazas'}
                    </p>
                    <div className="flex items-center gap-3">
                      <EditClassButton
                        cls={{
                          id: c.id,
                          activity_id: c.activity_id,
                          instructor_id: c.instructor_id,
                          starts_at: c.starts_at,
                          ends_at: c.ends_at,
                          max_students: c.max_students,
                          level: c.level,
                          notes: c.notes,
                          published: c.published,
                        }}
                        activities={activities}
                        instructors={instructors}
                      />
                      <DuplicateClassButton classId={c.id} />
                      <DeleteButton
                        action={deleteClassAction.bind(null, c.id)}
                        confirmMessage={
                          c.enrolled_count > 0
                            ? `Esta clase tiene ${c.enrolled_count} inscripciones. ¿Borrar clase e inscripciones?`
                            : '¿Borrar esta clase?'
                        }
                        label="Borrar"
                        className="text-[0.72rem] font-label text-red-700 hover:text-red-900 underline"
                      />
                    </div>
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

                <ul
                  className="divide-y divide-line min-h-[2.5rem] transition-all rounded-sm"
                  data-drop-class-id={c.id}
                  data-drop-activity-id={c.activity_id}
                  data-drop-full={full ? 'true' : 'false'}
                >
                  {enrollments.length === 0 && (
                    <li className="px-5 py-2 text-xs text-muted italic">
                      Arrastra un alumno aquí o usa Inscribir.
                    </li>
                  )}
                  {enrollments.map((e) => {
                    const client = clientById.get(e.client_id);
                    const fam = e.family_member_id ? familyById.get(e.family_member_id) : null;
                    const who = fam?.full_name ?? client?.name ?? 'Sin cliente';
                    const draggable = e.status === 'confirmed' || e.status === 'paid' || e.status === 'partial';
                    return (
                      <li
                        key={e.id}
                        className={`px-5 py-2.5 flex items-center justify-between gap-3 ${
                          draggable ? 'cursor-grab active:cursor-grabbing hover:bg-sand/50' : ''
                        }`}
                        draggable={draggable}
                        data-enrollment-id={e.id}
                        data-source-class-id={c.id}
                        data-activity-id={c.activity_id}
                        data-client-name={who}
                      >
                        <div className="min-w-0 flex items-center gap-2 flex-wrap">
                          {draggable && (
                            <span className="text-muted select-none" aria-hidden title="Arrastrar a otra clase">⋮⋮</span>
                          )}
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
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function WeekGrid({
  weekStart,
  classes,
  activityById,
  today,
}: {
  weekStart: string;
  classes: SurfClass[];
  activityById: Map<string, Activity>;
  today: string;
}) {
  const days = weekDays(weekStart);
  const classesByDay: Record<string, SurfClass[]> = {};
  for (const c of classes) {
    const key = toLocalIsoDate(new Date(c.starts_at));
    (classesByDay[key] ||= []).push(c);
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
      {days.map((d) => {
        const dayClasses = classesByDay[d] ?? [];
        const isToday = d === today;
        return (
          <div
            key={d}
            className={`rounded-md border bg-paper p-2 flex flex-col gap-1.5 min-h-[180px] ${
              isToday ? 'border-navy' : 'border-line'
            }`}
          >
            <Link
              href={`/dashboard/calendario?date=${d}`}
              className="font-label text-[0.68rem] text-navy capitalize px-1 py-0.5 rounded-sm hover:bg-sand transition-colors"
            >
              {formatShortDayLabel(d)}
              {isToday && <span className="ml-1 text-yellow">·</span>}
            </Link>
            {dayClasses.length === 0 ? (
              <p className="text-[0.72rem] text-muted/70 italic px-1 pt-1">Sin clases</p>
            ) : (
              dayClasses.map((c) => {
                const activity = activityById.get(c.activity_id);
                const full = c.enrolled_count >= c.max_students;
                return (
                  <Link
                    key={c.id}
                    href={`/dashboard/calendario?date=${toLocalIsoDate(new Date(c.starts_at))}`}
                    className="block rounded-sm border-l-[4px] bg-sand/60 hover:bg-sand px-2 py-1.5 transition-colors"
                    style={{ borderLeftColor: activity?.color ?? '#214a57' }}
                  >
                    <div className="font-label text-[0.66rem] text-navy">
                      {formatSpanishTime(c.starts_at)}
                    </div>
                    <div className="text-[0.78rem] text-navy font-semibold truncate">
                      {activity?.name ?? '—'}
                    </div>
                    <div className={`text-[0.66rem] ${full ? 'text-red-600' : 'text-muted'}`}>
                      {c.enrolled_count}/{c.max_students}
                      {!c.published && <span className="ml-1">· oculta</span>}
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        );
      })}
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
