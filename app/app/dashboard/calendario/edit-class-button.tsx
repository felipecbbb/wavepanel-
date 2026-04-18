'use client';

import { useActionState, useEffect, useState } from 'react';
import { Button } from '@/components/button';
import { updateClassAction, type ClassFormState } from './actions';

type Activity = { id: string; name: string };
type Instructor = { id: string; name: string };

export type ClassEditable = {
  id: string;
  activity_id: string;
  instructor_id: string | null;
  starts_at: string;
  ends_at: string;
  max_students: number;
  level: string | null;
  notes: string | null;
  published: boolean;
};

function toLocalDate(iso: string): string {
  const d = new Date(iso);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function toLocalTime(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function diffMinutes(startIso: string, endIso: string): number {
  return Math.max(15, Math.round((new Date(endIso).getTime() - new Date(startIso).getTime()) / 60000));
}

export default function EditClassButton({
  cls,
  activities,
  instructors,
}: {
  cls: ClassEditable;
  activities: Activity[];
  instructors: Instructor[];
}) {
  const boundAction = updateClassAction.bind(null, cls.id);
  const [state, formAction, pending] = useActionState<ClassFormState, FormData>(boundAction, null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (state?.ok && open) setOpen(false);
  }, [state, open]);

  const activity = activities.find((a) => a.id === cls.activity_id);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-[0.72rem] font-label text-muted hover:text-navy underline"
      >
        Editar
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-navy/40 z-40 flex items-start justify-center p-4 md:p-10 overflow-y-auto"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-paper rounded-md w-full max-w-lg shadow-pop my-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-line flex items-center justify-between">
              <h2 className="font-display text-2xl text-navy">Editar clase</h2>
              <button type="button" onClick={() => setOpen(false)} className="text-muted hover:text-navy text-xl">×</button>
            </div>
            <form action={formAction} className="p-6 space-y-4">
              <p className="font-label text-[0.66rem] text-muted">
                Actividad: <span className="text-navy">{activity?.name ?? '—'}</span>
                <span className="ml-2 opacity-70">(no se puede cambiar tras crear la clase)</span>
              </p>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="font-label text-[0.72rem] text-navy block mb-1.5">Fecha</span>
                  <input
                    name="date"
                    type="date"
                    defaultValue={toLocalDate(cls.starts_at)}
                    required
                    className="w-full rounded-sm border border-line bg-paper px-3 py-2 text-[15px] outline-none focus:border-navy"
                  />
                </label>
                <label className="block">
                  <span className="font-label text-[0.72rem] text-navy block mb-1.5">Hora inicio</span>
                  <input
                    name="time"
                    type="time"
                    defaultValue={toLocalTime(cls.starts_at)}
                    required
                    className="w-full rounded-sm border border-line bg-paper px-3 py-2 text-[15px] outline-none focus:border-navy"
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="font-label text-[0.72rem] text-navy block mb-1.5">Duración (min)</span>
                  <input
                    name="duration_minutes"
                    type="number"
                    defaultValue={diffMinutes(cls.starts_at, cls.ends_at)}
                    min={15}
                    max={600}
                    required
                    className="w-full rounded-sm border border-line bg-paper px-3 py-2 text-[15px] outline-none focus:border-navy"
                  />
                </label>
                <label className="block">
                  <span className="font-label text-[0.72rem] text-navy block mb-1.5">Plazas máx.</span>
                  <input
                    name="max_students"
                    type="number"
                    defaultValue={cls.max_students}
                    min={1}
                    max={200}
                    required
                    className="w-full rounded-sm border border-line bg-paper px-3 py-2 text-[15px] outline-none focus:border-navy"
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="font-label text-[0.72rem] text-navy block mb-1.5">Instructor</span>
                  <select
                    name="instructor_id"
                    defaultValue={cls.instructor_id ?? ''}
                    className="w-full rounded-sm border border-line bg-paper px-3 py-2 text-[15px] outline-none focus:border-navy"
                  >
                    <option value="">—</option>
                    {instructors.map((i) => (
                      <option key={i.id} value={i.id}>{i.name}</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="font-label text-[0.72rem] text-navy block mb-1.5">Nivel</span>
                  <select
                    name="level"
                    defaultValue={cls.level ?? ''}
                    className="w-full rounded-sm border border-line bg-paper px-3 py-2 text-[15px] outline-none focus:border-navy"
                  >
                    <option value="">—</option>
                    <option value="beginner">Principiante</option>
                    <option value="intermediate">Intermedio</option>
                    <option value="advanced">Avanzado</option>
                    <option value="mixed">Mixto</option>
                  </select>
                </label>
              </div>

              <label className="block">
                <span className="font-label text-[0.72rem] text-navy block mb-1.5">Notas</span>
                <textarea
                  name="notes"
                  defaultValue={cls.notes ?? ''}
                  rows={2}
                  className="w-full rounded-sm border border-line bg-paper px-3 py-2 text-[15px] outline-none focus:border-navy resize-y"
                />
              </label>

              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="published"
                  defaultChecked={cls.published}
                  className="h-4 w-4"
                />
                <span>Publicada (visible en web del tenant)</span>
              </label>

              {state && !state.ok && (
                <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 border border-red-100">{state.error}</p>
              )}

              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button type="submit" variant="dark" disabled={pending}>
                  {pending ? 'Guardando…' : 'Guardar cambios'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
