'use client';

import { useActionState } from 'react';
import { Button } from '@/components/button';
import type { CampFormState } from './actions';

type FormAction = (prev: CampFormState, data: FormData) => Promise<CampFormState>;

type Initial = {
  name?: string;
  slug?: string;
  description?: string | null;
  hero_image_url?: string | null;
  starts_on?: string;
  ends_on?: string;
  max_spots?: number;
  base_price_cents?: number;
  deposit_cents?: number;
  early_bird_price_cents?: number | null;
  early_bird_until?: string | null;
  status?: string;
};

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Borrador' },
  { value: 'open', label: 'Abierto' },
  { value: 'full', label: 'Lleno' },
  { value: 'closed', label: 'Cerrado' },
  { value: 'cancelled', label: 'Cancelado' },
];

export default function CampForm({
  action,
  initial,
  submitLabel,
}: {
  action: FormAction;
  initial?: Initial;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState<CampFormState, FormData>(action, null);

  return (
    <form action={formAction} className="space-y-6 max-w-3xl">
      <Section title="Datos generales">
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Nombre" name="name" defaultValue={initial?.name} required />
          <Field label="Slug (URL)" name="slug" defaultValue={initial?.slug} hint="Si lo dejas vacío, se genera del nombre." />
        </div>
        <Textarea label="Descripción" name="description" defaultValue={initial?.description ?? ''} rows={3} />
        <Field label="URL imagen hero" name="hero_image_url" defaultValue={initial?.hero_image_url ?? ''} />
      </Section>

      <Section title="Fechas y plazas">
        <div className="grid gap-5 md:grid-cols-3">
          <Field label="Inicio" name="starts_on" type="date" defaultValue={initial?.starts_on ?? ''} required />
          <Field label="Fin" name="ends_on" type="date" defaultValue={initial?.ends_on ?? ''} required />
          <NumberField label="Plazas máx." name="max_spots" defaultValue={initial?.max_spots ?? 10} min={1} max={500} />
        </div>
      </Section>

      <Section title="Precios">
        <div className="grid gap-5 md:grid-cols-2">
          <Field
            label="Precio base (€)"
            name="base_price"
            type="number"
            defaultValue={initial?.base_price_cents != null ? (initial.base_price_cents / 100).toFixed(2) : ''}
            required
          />
          <Field
            label="Depósito (€)"
            name="deposit"
            type="number"
            defaultValue={initial?.deposit_cents != null ? (initial.deposit_cents / 100).toFixed(2) : '180'}
            hint="Lo que se cobra para reservar. El resto queda pendiente."
          />
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <Field
            label="Precio early bird (€)"
            name="early_bird_price"
            type="number"
            defaultValue={initial?.early_bird_price_cents != null ? (initial.early_bird_price_cents / 100).toFixed(2) : ''}
            hint="Opcional"
          />
          <Field
            label="Válido hasta"
            name="early_bird_until"
            type="datetime-local"
            defaultValue={initial?.early_bird_until ? initial.early_bird_until.slice(0, 16) : ''}
            hint="Opcional"
          />
        </div>
      </Section>

      <Section title="Estado">
        <SelectField label="Estado" name="status" defaultValue={initial?.status ?? 'draft'} options={STATUS_OPTIONS} />
      </Section>

      {state && !state.ok && (
        <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-100">{state.error}</p>
      )}
      {state && state.ok && (
        <p className="rounded-md bg-emerald-50 px-4 py-3 text-sm text-emerald-800 border border-emerald-100">Guardado.</p>
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
  label, name, type = 'text', defaultValue, required, hint,
}: {
  label: string; name: string; type?: string; defaultValue?: string; required?: boolean; hint?: string;
}) {
  return (
    <label className="block">
      <span className="font-label text-[0.72rem] text-navy block mb-1.5">{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue ?? ''}
        required={required}
        step={type === 'number' ? '0.01' : undefined}
        className="w-full rounded-sm border border-line bg-paper px-4 py-2.5 text-[15px] outline-none focus:border-navy focus:ring-2 focus:ring-yellow/30"
      />
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  );
}

function NumberField({
  label, name, defaultValue, min, max,
}: {
  label: string; name: string; defaultValue?: number; min?: number; max?: number;
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
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
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
