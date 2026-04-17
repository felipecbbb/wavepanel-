'use client';

import { useActionState } from 'react';
import { Button } from '@/components/button';
import type { ClientFormState } from './actions';

type FormAction = (prev: ClientFormState, data: FormData) => Promise<ClientFormState>;

type Props = {
  action: FormAction;
  initial?: {
    name?: string;
    email?: string | null;
    phone?: string | null;
    notes?: string | null;
    tags?: string[];
  };
  submitLabel: string;
};

export default function ClientForm({ action, initial, submitLabel }: Props) {
  const [state, formAction, pending] = useActionState<ClientFormState, FormData>(action, null);

  return (
    <form action={formAction} className="space-y-5 max-w-xl">
      <Field label="Nombre" name="name" defaultValue={initial?.name} required />

      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Email" name="email" type="email" defaultValue={initial?.email ?? ''} />
        <Field label="Teléfono" name="phone" defaultValue={initial?.phone ?? ''} />
      </div>

      <Field
        label="Etiquetas"
        name="tags"
        defaultValue={initial?.tags?.join(', ') ?? ''}
        hint="Separadas por comas. P.ej. principiante, asiduo, peque"
      />

      <Textarea label="Notas" name="notes" defaultValue={initial?.notes ?? ''} rows={4} />

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

function Field({
  label,
  name,
  type = 'text',
  defaultValue,
  required,
  hint,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  required?: boolean;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="font-label text-[0.72rem] text-navy block mb-1.5">{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue ?? ''}
        required={required}
        className="w-full rounded-sm border border-line bg-paper px-4 py-2.5 text-[15px] outline-none focus:border-navy focus:ring-2 focus:ring-yellow/30"
      />
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  );
}

function Textarea({
  label,
  name,
  defaultValue,
  rows = 3,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  rows?: number;
}) {
  return (
    <label className="block">
      <span className="font-label text-[0.72rem] text-navy block mb-1.5">{label}</span>
      <textarea
        name={name}
        defaultValue={defaultValue ?? ''}
        rows={rows}
        className="w-full rounded-sm border border-line bg-paper px-4 py-2.5 text-[15px] outline-none focus:border-navy focus:ring-2 focus:ring-yellow/30 resize-y"
      />
    </label>
  );
}
