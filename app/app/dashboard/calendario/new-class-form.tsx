'use client';

import { useActionState, useState } from 'react';
import { Button } from '@/components/button';
import { createClassAction, type ClassFormState } from './actions';

type Activity = { id: string; name: string; duration_minutes: number; capacity: number; color: string };
type Instructor = { id: string; name: string };

export default function NewClassForm({
  activities,
  instructors,
  date,
}: {
  activities: Activity[];
  instructors: Instructor[];
  date: string;
}) {
  const [state, formAction, pending] = useActionState<ClassFormState, FormData>(createClassAction, null);
  const [open, setOpen] = useState(false);
  const [selectedActivityId, setSelectedActivityId] = useState(activities[0]?.id ?? '');

  const selectedActivity = activities.find((a) => a.id === selectedActivityId);

  if (state?.ok && open) setTimeout(() => setOpen(false), 50);

  return (
    <>
      <Button type="button" variant="yellow" onClick={() => setOpen(true)} disabled={activities.length === 0}>
        {activities.length === 0 ? 'Crea una actividad primero' : 'Nueva clase'}
      </Button>

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
              <h2 className="font-display text-2xl text-navy">Nueva clase</h2>
              <button type="button" onClick={() => setOpen(false)} className="text-muted hover:text-navy text-xl">×</button>
            </div>
            <form action={formAction} className="p-6 space-y-4">
              <label className="block">
                <span className="font-label text-[0.72rem] text-navy block mb-1.5">Actividad</span>
                <select
                  name="activity_id"
                  value={selectedActivityId}
                  onChange={(e) => setSelectedActivityId(e.target.value)}
                  required
                  className="w-full rounded-sm border border-line bg-paper px-3 py-2 text-[15px] outline-none focus:border-navy"
                >
                  {activities.map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="font-label text-[0.72rem] text-navy block mb-1.5">Fecha</span>
                  <input
                    name="date"
                    type="date"
                    defaultValue={date}
                    required
                    className="w-full rounded-sm border border-line bg-paper px-3 py-2 text-[15px] outline-none focus:border-navy"
                  />
                </label>
                <label className="block">
                  <span className="font-label text-[0.72rem] text-navy block mb-1.5">Hora inicio</span>
                  <input
                    name="time"
                    type="time"
                    defaultValue="10:00"
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
                    defaultValue={selectedActivity?.duration_minutes ?? 60}
                    key={selectedActivity?.id}
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
                    defaultValue={selectedActivity?.capacity ?? 8}
                    key={`cap-${selectedActivity?.id}`}
                    min={1}
                    max={200}
                    required
                    className="w-full rounded-sm border border-line bg-paper px-3 py-2 text-[15px] outline-none focus:border-navy"
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="font-label text-[0.72rem] text-navy block mb-1.5">Instructor (opcional)</span>
                  <select
                    name="instructor_id"
                    defaultValue=""
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
                    defaultValue=""
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
                <span className="font-label text-[0.72rem] text-navy block mb-1.5">Notas (opcional)</span>
                <textarea
                  name="notes"
                  rows={2}
                  className="w-full rounded-sm border border-line bg-paper px-3 py-2 text-[15px] outline-none focus:border-navy resize-y"
                />
              </label>

              <label className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" name="published" defaultChecked className="h-4 w-4" />
                <span>Publicada (visible en web del tenant)</span>
              </label>

              {state && !state.ok && (
                <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 border border-red-100">{state.error}</p>
              )}

              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button type="submit" variant="dark" disabled={pending}>
                  {pending ? 'Creando…' : 'Crear clase'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
