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
  startOfMonthIso,
  startOfMonthGrid,
  formatSpanishMonth,
  addMonths,
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
  searchParams: Promise<{ date?: string; view?: string; activity?: string; instructor?: string }>;
}) {
  await resolveActiveSchool();
  const supabase = await createClient();
  const sp = await searchParams;
  const date = sp.date ?? toLocalIsoDate(new Date());
  const view: 'day' | 'week' | 'month' =
    sp.view === 'week' ? 'week' : sp.view === 'month' ? 'month' : 'day';
  const activityFilter = sp.activity ?? '';
  const instructorFilter = sp.instructor ?? '';

  let rangeStart: string;
  let rangeEndExclusive: string;
  if (view === 'week') {
    rangeStart = startOfWeekIso(date);
    rangeEndExclusive = addDays(rangeStart, 7);
  } else if (view === 'month') {
    rangeStart = startOfMonthGrid(date);
    rangeEndExclusive = addDays(rangeStart, 42); // 6 semanas de grid
  } else {
    rangeStart = date;
    rangeEndExclusive = addDays(date, 1);
  }
  const dayStart = startOfDay(rangeStart).toISOString();
  const dayEnd = startOfDay(rangeEndExclusive).toISOString();

  // Queries flat (sin embeds) — evitamos issues de alias de relación en runtime.
  let classesQuery = supabase
    .from('surf_classes')
    .select('id, starts_at, ends_at, activity_id, instructor_id, max_students, enrolled_count, level, notes, published')
    .gte('starts_at', dayStart)
    .lt('starts_at', dayEnd)
    .order('starts_at', { ascending: true });
  if (activityFilter) classesQuery = classesQuery.eq('activity_id', activityFilter);
  if (instructorFilter) classesQuery = classesQuery.eq('instructor_id', instructorFilter);

  const [
    { data: classesData },
    { data: activitiesData },
    { data: instructorsData },
    { data: clientsData },
    { data: familyData },
    { data: bonosData },
  ] = await Promise.all([
    classesQuery,
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
  const filterQS =
    (view === 'week' ? '&view=week' : view === 'month' ? '&view=month' : '') +
    (activityFilter ? `&activity=${activityFilter}` : '') +
    (instructorFilter ? `&instructor=${instructorFilter}` : '');
  let prev: string;
  let next: string;
  if (view === 'week') {
    prev = addDays(rangeStart, -7);
    next = addDays(rangeStart, 7);
  } else if (view === 'month') {
    prev = addMonths(startOfMonthIso(date), -1);
    next = addMonths(startOfMonthIso(date), 1);
  } else {
    prev = addDays(date, -1);
    next = addDays(date, 1);
  }

  const activeInstructorsForForm = instructors.filter((i) => i.active).map((i) => ({ id: i.id, name: i.name }));

  const headerTitle =
    view === 'week'
      ? `Semana del ${formatShortDayLabel(rangeStart)}`
      : view === 'month'
      ? formatSpanishMonth(date)
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

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <ButtonLink href={`/dashboard/calendario?date=${prev}${filterQS}`} variant="outline" size="md">← Anterior</ButtonLink>
        <ButtonLink href={`/dashboard/calendario?date=${today}${filterQS}`} variant="ghost" size="md">Hoy</ButtonLink>
        <ButtonLink href={`/dashboard/calendario?date=${next}${filterQS}`} variant="outline" size="md">Siguiente →</ButtonLink>
        <div className="ml-auto inline-flex rounded-sm border border-line overflow-hidden text-[0.76rem] font-label">
          {(['day', 'week', 'month'] as const).map((v) => {
            const qs =
              (v === 'week' ? '&view=week' : v === 'month' ? '&view=month' : '') +
              (activityFilter ? `&activity=${activityFilter}` : '') +
              (instructorFilter ? `&instructor=${instructorFilter}` : '');
            return (
              <Link
                key={v}
                href={`/dashboard/calendario?date=${date}${qs}`}
                className={`px-3 py-1.5 ${view === v ? 'bg-navy text-white' : 'bg-paper text-navy hover:bg-sand'}`}
              >
                {v === 'day' ? 'Día' : v === 'week' ? 'Semana' : 'Mes'}
              </Link>
            );
          })}
        </div>
      </div>

      <form className="flex items-center gap-2 mb-6 flex-wrap text-sm">
        <span className="font-label text-[0.68rem] text-muted mr-1">Filtrar:</span>
        <input type="hidden" name="date" value={date} />
        {view !== 'day' && <input type="hidden" name="view" value={view} />}
        <select
          name="activity"
          defaultValue={activityFilter}
          className="rounded-sm border border-line bg-paper px-2 py-1 text-[0.82rem]"
        >
          <option value="">Todas las actividades</option>
          {activities.map((a) => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>
        <select
          name="instructor"
          defaultValue={instructorFilter}
          className="rounded-sm border border-line bg-paper px-2 py-1 text-[0.82rem]"
        >
          <option value="">Cualquier instructor</option>
          {instructors.map((i) => (
            <option key={i.id} value={i.id}>{i.name}</option>
          ))}
        </select>
        <button type="submit" className="rounded-sm bg-navy text-white px-3 py-1 font-label text-[0.72rem] hover:bg-navy-soft">
          Aplicar
        </button>
        {(activityFilter || instructorFilter) && (
          <Link
            href={`/dashboard/calendario?date=${date}${view === 'week' ? '&view=week' : view === 'month' ? '&view=month' : ''}`}
            className="font-label text-[0.72rem] text-muted hover:text-navy underline"
          >
            Limpiar
          </Link>
        )}
      </form>

      {view === 'week' ? (
        <WeekGrid
          weekStart={rangeStart}
          classes={classes}
          activityById={activityById}
          today={today}
        />
      ) : view === 'month' ? (
        <MonthGrid
          gridStart={rangeStart}
          monthAnchor={date}
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

function MonthGrid({
  gridStart,
  monthAnchor,
  classes,
  activityById,
  today,
}: {
  gridStart: string;
  monthAnchor: string;
  classes: SurfClass[];
  activityById: Map<string, Activity>;
  today: string;
}) {
  const anchorMonth = new Date(monthAnchor).getMonth();
  const days: string[] = Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
  const classesByDay: Record<string, SurfClass[]> = {};
  for (const c of classes) {
    const key = toLocalIsoDate(new Date(c.starts_at));
    (classesByDay[key] ||= []).push(c);
  }
  const weekdayLabels = ['lun', 'mar', 'mié', 'jue', 'vie', 'sáb', 'dom'];

  return (
    <div>
      <div className="grid grid-cols-7 gap-1 mb-1 font-label text-[0.6rem] text-muted">
        {weekdayLabels.map((w) => (
          <div key={w} className="px-1">{w}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((d) => {
          const dayClasses = classesByDay[d] ?? [];
          const outOfMonth = new Date(d).getMonth() !== anchorMonth;
          const isToday = d === today;
          return (
            <Link
              key={d}
              href={`/dashboard/calendario?date=${d}`}
              className={`rounded-sm border p-1.5 min-h-[90px] flex flex-col gap-0.5 hover:border-navy transition-colors ${
                outOfMonth ? 'bg-sand/30 text-muted/60' : 'bg-paper text-navy'
              } ${isToday ? 'border-navy' : 'border-line'}`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[0.72rem] font-label ${isToday ? 'text-yellow' : ''}`}>
                  {new Date(d).getDate()}
                </span>
                {dayClasses.length > 0 && (
                  <span className="text-[0.6rem] font-label bg-navy/10 text-navy px-1 rounded-sm">
                    {dayClasses.length}
                  </span>
                )}
              </div>
              {dayClasses.slice(0, 3).map((c) => {
                const activity = activityById.get(c.activity_id);
                return (
                  <div
                    key={c.id}
                    className="text-[0.66rem] truncate rounded-sm px-1 py-0.5 border-l-[3px]"
                    style={{
                      borderLeftColor: activity?.color ?? '#214a57',
                      background: 'rgba(14,47,57,0.04)',
                    }}
                  >
                    {formatSpanishTime(c.starts_at)} · {activity?.name ?? '—'}
                  </div>
                );
              })}
              {dayClasses.length > 3 && (
                <div className="text-[0.6rem] text-muted italic">+ {dayClasses.length - 3} más</div>
              )}
            </Link>
          );
        })}
      </div>
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
