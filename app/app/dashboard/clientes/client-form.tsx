'use client';

import { useActionState, useState } from 'react';
import { Button } from '@/components/button';
import type { ClientFormState } from './actions';

type FormAction = (prev: ClientFormState, data: FormData) => Promise<ClientFormState>;

type Initial = {
  name?: string;
  email?: string | null;
  phone?: string | null;
  notes?: string | null;
  tags?: string[];
  birth_date?: string | null;
  can_swim?: boolean | null;
  has_injury?: boolean;
  injury_detail?: string | null;
  wetsuit_size?: string | null;
  address?: string | null;
  city?: string | null;
  postal_code?: string | null;
  country?: string | null;
};

export default function ClientForm({
  action,
  initial,
  submitLabel,
}: {
  action: FormAction;
  initial?: Initial;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState<ClientFormState, FormData>(action, null);
  const [hasInjury, setHasInjury] = useState(initial?.has_injury ?? false);

  return (
    <form action={formAction} className="space-y-6 max-w-3xl">
      <Section title="Datos personales">
        <Field label="Nombre" name="name" defaultValue={initial?.name} required />
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Email" name="email" type="email" defaultValue={initial?.email ?? ''} />
          <Field label="Teléfono" name="phone" defaultValue={initial?.phone ?? ''} />
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Fecha de nacimiento" name="birth_date" type="date" defaultValue={initial?.birth_date ?? ''} />
          <Field
            label="Etiquetas"
            name="tags"
            defaultValue={initial?.tags?.join(', ') ?? ''}
            hint="Separadas por comas"
          />
        </div>
      </Section>

      <Section title="Salud y equipamiento">
        <div className="grid gap-5 md:grid-cols-2">
          <SelectField
            label="¿Sabe nadar?"
            name="can_swim"
            defaultValue={initial?.can_swim === true ? 'yes' : initial?.can_swim === false ? 'no' : ''}
            options={[
              { value: '', label: '—' },
              { value: 'yes', label: 'Sí, sabe nadar' },
              { value: 'no', label: 'No sabe nadar' },
            ]}
          />
          <Field label="Talla de neopreno" name="wetsuit_size" defaultValue={initial?.wetsuit_size ?? ''} placeholder="S / M / L / XL / 10 / 12…" />
        </div>
        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="has_injury"
            checked={hasInjury}
            onChange={(e) => setHasInjury(e.target.checked)}
            className="h-4 w-4"
          />
          <span>Tiene alguna lesión o condición médica relevante</span>
        </label>
        {hasInjury && (
          <Textarea
            label="Detalle de la lesión / condición"
            name="injury_detail"
            defaultValue={initial?.injury_detail ?? ''}
            rows={3}
          />
        )}
      </Section>

      <Section title="Dirección">
        <Field label="Calle y número" name="address" defaultValue={initial?.address ?? ''} />
        <div className="grid gap-5 md:grid-cols-3">
          <Field label="Ciudad" name="city" defaultValue={initial?.city ?? ''} />
          <Field label="Código postal" name="postal_code" defaultValue={initial?.postal_code ?? ''} />
          <Field label="País" name="country" defaultValue={initial?.country ?? ''} />
        </div>
      </Section>

      <Section title="Notas internas">
        <Textarea label="Notas" name="notes" defaultValue={initial?.notes ?? ''} rows={4} />
      </Section>

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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-md border border-line bg-paper p-6 space-y-4">
      <h2 className="font-label text-[0.72rem] text-muted">{title}</h2>
      {children}
    </section>
  );
}

function Field({
  label, name, type = 'text', defaultValue, required, hint, placeholder,
}: {
  label: string; name: string; type?: string; defaultValue?: string;
  required?: boolean; hint?: string; placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="font-label text-[0.72rem] text-navy block mb-1.5">{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue ?? ''}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-sm border border-line bg-paper px-4 py-2.5 text-[15px] outline-none focus:border-navy focus:ring-2 focus:ring-yellow/30"
      />
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  );
}

function SelectField({
  label, name, defaultValue, options,
}: {
  label: string; name: string; defaultValue?: string; options: { value: string; label: string }[];
}) {
  return (
    <label className="block">
      <span className="font-label text-[0.72rem] text-navy block mb-1.5">{label}</span>
      <select
        name={name}
        defaultValue={defaultValue}
        className="w-full rounded-sm border border-line bg-paper px-4 py-2.5 text-[15px] outline-none focus:border-navy focus:ring-2 focus:ring-yellow/30"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </label>
  );
}

function Textarea({
  label, name, defaultValue, rows = 3,
}: {
  label: string; name: string; defaultValue?: string; rows?: number;
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
