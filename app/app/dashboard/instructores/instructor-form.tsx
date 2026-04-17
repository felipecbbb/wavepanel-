'use client';

import { useActionState, useState } from 'react';
import { Button } from '@/components/button';
import type { InstructorFormState } from './actions';

type FormAction = (prev: InstructorFormState, data: FormData) => Promise<InstructorFormState>;

type Initial = {
  name?: string;
  email?: string | null;
  phone?: string | null;
  color?: string;
  active?: boolean;
};

export default function InstructorForm({
  action,
  initial,
  submitLabel,
}: {
  action: FormAction;
  initial?: Initial;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState<InstructorFormState, FormData>(action, null);
  const [color, setColor] = useState(initial?.color ?? '#FFCC01');

  return (
    <form action={formAction} className="space-y-5 max-w-xl">
      <label className="block">
        <span className="font-label text-[0.72rem] text-navy block mb-1.5">Nombre</span>
        <input
          name="name"
          defaultValue={initial?.name ?? ''}
          required
          className="w-full rounded-sm border border-line bg-paper px-4 py-2.5 text-[15px] outline-none focus:border-navy focus:ring-2 focus:ring-yellow/30"
        />
      </label>

      <div className="grid gap-5 md:grid-cols-2">
        <label className="block">
          <span className="font-label text-[0.72rem] text-navy block mb-1.5">Email</span>
          <input
            name="email"
            type="email"
            defaultValue={initial?.email ?? ''}
            className="w-full rounded-sm border border-line bg-paper px-4 py-2.5 text-[15px] outline-none focus:border-navy focus:ring-2 focus:ring-yellow/30"
          />
        </label>
        <label className="block">
          <span className="font-label text-[0.72rem] text-navy block mb-1.5">Teléfono</span>
          <input
            name="phone"
            defaultValue={initial?.phone ?? ''}
            className="w-full rounded-sm border border-line bg-paper px-4 py-2.5 text-[15px] outline-none focus:border-navy focus:ring-2 focus:ring-yellow/30"
          />
        </label>
      </div>

      <div>
        <span className="font-label text-[0.72rem] text-navy block mb-1.5">Color en el calendario</span>
        <div className="flex items-center gap-3">
          <input
            type="color"
            name="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="h-10 w-14 cursor-pointer rounded-sm border border-line"
          />
          <code className="text-xs text-muted">{color}</code>
        </div>
      </div>

      <label className="inline-flex items-center gap-2 text-sm">
        <input type="checkbox" name="active" defaultChecked={initial?.active ?? true} className="h-4 w-4" />
        <span>Activo (disponible para asignar a clases)</span>
      </label>

      {state && !state.ok && (
        <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-100">
          {state.error}
        </p>
      )}
      {state && state.ok && (
        <p className="rounded-md bg-emerald-50 px-4 py-3 text-sm text-emerald-800 border border-emerald-100">
          Guardado.
        </p>
      )}

      <Button type="submit" variant="dark" disabled={pending}>
        {pending ? 'Guardando…' : submitLabel}
      </Button>
    </form>
  );
}
