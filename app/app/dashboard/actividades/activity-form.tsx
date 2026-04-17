'use client';

import { useActionState, useState } from 'react';
import { Button } from '@/components/button';
import type { ActivityFormState } from './actions';

type FormAction = (prev: ActivityFormState, data: FormData) => Promise<ActivityFormState>;

const TYPE_OPTIONS = [
  { value: 'grupal', label: 'Grupal' },
  { value: 'individual', label: 'Individual' },
  { value: 'yoga', label: 'Yoga' },
  { value: 'paddle', label: 'Paddle / SUP' },
  { value: 'surfskate', label: 'Surfskate' },
  { value: 'kite', label: 'Kite' },
  { value: 'otro', label: 'Otro' },
];

type Initial = {
  name?: string;
  slug?: string;
  type_key?: string;
  description?: string | null;
  duration_minutes?: number;
  capacity?: number;
  color?: string;
  pack_validity_days?: number;
  hero_image_url?: string | null;
  whats_included?: string[];
  ideal_for?: string[];
  active?: boolean;
};

export default function ActivityForm({
  action,
  initial,
  submitLabel,
}: {
  action: FormAction;
  initial?: Initial;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState<ActivityFormState, FormData>(action, null);
  const [color, setColor] = useState(initial?.color ?? '#214a57');

  return (
    <form action={formAction} className="space-y-6 max-w-3xl">
      <Section title="Datos básicos">
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Nombre" name="name" defaultValue={initial?.name} required />
          <Field
            label="Slug (URL)"
            name="slug"
            defaultValue={initial?.slug}
            hint="Si lo dejas vacío al crear, lo generamos del nombre."
          />
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          <SelectField label="Tipo" name="type_key" defaultValue={initial?.type_key ?? 'grupal'} options={TYPE_OPTIONS} />
          <NumberField
            label="Duración (min)"
            name="duration_minutes"
            defaultValue={initial?.duration_minutes ?? 60}
            min={15}
            max={600}
          />
          <NumberField
            label="Capacidad (alumnos)"
            name="capacity"
            defaultValue={initial?.capacity ?? 8}
            min={1}
            max={200}
          />
        </div>
        <Textarea label="Descripción" name="description" defaultValue={initial?.description ?? ''} rows={3} />
      </Section>

      <Section title="Presentación">
        <Field
          label="URL de imagen hero"
          name="hero_image_url"
          defaultValue={initial?.hero_image_url ?? ''}
          hint="Opcional. Se usará en la landing pública y en las tarjetas del panel."
        />
        <div className="grid gap-5 md:grid-cols-[1fr_auto] items-end">
          <div>
            <span className="font-label text-[0.72rem] text-navy block mb-1.5">Color (calendario)</span>
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
        </div>
        <Textarea
          label="Qué incluye (una línea por bullet)"
          name="whats_included"
          defaultValue={(initial?.whats_included ?? []).join('\n')}
          rows={4}
          hint="Ej: Tabla y neopreno / Seguro incluido / Grupo reducido"
        />
        <Textarea
          label="Ideal para (una línea por bullet)"
          name="ideal_for"
          defaultValue={(initial?.ideal_for ?? []).join('\n')}
          rows={3}
          hint="Ej: Principiantes / Adultos / Grupos de hasta 8 personas"
        />
      </Section>

      <Section title="Bonos">
        <NumberField
          label="Validez de los bonos (días)"
          name="pack_validity_days"
          defaultValue={initial?.pack_validity_days ?? 180}
          min={1}
          max={3650}
          hint="Cuánto dura un bono desde la fecha de compra. Entre Olas usa 180 días."
        />
      </Section>

      <Section title="Estado">
        <label className="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" name="active" defaultChecked={initial?.active ?? true} className="h-4 w-4" />
          <span>Actividad activa (visible en el catálogo)</span>
        </label>
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

function NumberField({
  label,
  name,
  defaultValue,
  min,
  max,
  hint,
}: {
  label: string;
  name: string;
  defaultValue?: number;
  min?: number;
  max?: number;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="font-label text-[0.72rem] text-navy block mb-1.5">{label}</span>
      <input
        name={name}
        type="number"
        defaultValue={defaultValue}
        min={min}
        max={max}
        className="w-full rounded-sm border border-line bg-paper px-4 py-2.5 text-[15px] outline-none focus:border-navy focus:ring-2 focus:ring-yellow/30"
      />
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  );
}

function SelectField({
  label,
  name,
  defaultValue,
  options,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  options: { value: string; label: string }[];
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
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function Textarea({
  label,
  name,
  defaultValue,
  rows = 3,
  hint,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  rows?: number;
  hint?: string;
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
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  );
}
