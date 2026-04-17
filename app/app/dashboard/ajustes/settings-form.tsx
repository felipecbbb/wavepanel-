'use client';

import { useActionState, useState } from 'react';
import { Button } from '@/components/button';
import { updateSchoolSettingsAction, type SettingsFormState } from './actions';

type Initial = {
  name: string;
  description?: string | null;
  logo_url?: string | null;
  primary_color: string;
  contact_email?: string | null;
  contact_phone?: string | null;
  address?: string | null;
  city?: string | null;
  timezone: string;
};

export default function SettingsForm({ initial }: { initial: Initial }) {
  const [state, formAction, pending] = useActionState<SettingsFormState, FormData>(updateSchoolSettingsAction, null);
  const [color, setColor] = useState(initial.primary_color);

  return (
    <form action={formAction} className="space-y-6 max-w-3xl">
      <Section title="Identidad de la escuela">
        <Field label="Nombre público" name="name" defaultValue={initial.name} required />
        <Textarea label="Descripción breve" name="description" defaultValue={initial.description ?? ''} rows={3} />
        <Field label="URL del logo" name="logo_url" defaultValue={initial.logo_url ?? ''} hint="Imagen cuadrada. Se mostrará en la web pública y emails cuando se active." />
        <div>
          <span className="font-label text-[0.72rem] text-navy block mb-1.5">Color de marca</span>
          <div className="flex items-center gap-3">
            <input
              type="color"
              name="primary_color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="h-10 w-14 cursor-pointer rounded-sm border border-line"
            />
            <code className="text-xs text-muted">{color}</code>
          </div>
        </div>
      </Section>

      <Section title="Contacto">
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Email de contacto" name="contact_email" type="email" defaultValue={initial.contact_email ?? ''} />
          <Field label="Teléfono" name="contact_phone" defaultValue={initial.contact_phone ?? ''} />
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Dirección" name="address" defaultValue={initial.address ?? ''} />
          <Field label="Ciudad" name="city" defaultValue={initial.city ?? ''} />
        </div>
      </Section>

      <Section title="Regional">
        <label className="block">
          <span className="font-label text-[0.72rem] text-navy block mb-1.5">Zona horaria</span>
          <select
            name="timezone"
            defaultValue={initial.timezone}
            className="w-full rounded-sm border border-line bg-paper px-4 py-2.5 text-[15px] outline-none focus:border-navy"
          >
            <option value="Europe/Madrid">Europe/Madrid (España peninsular)</option>
            <option value="Atlantic/Canary">Atlantic/Canary (Canarias)</option>
            <option value="Europe/Lisbon">Europe/Lisbon (Portugal)</option>
            <option value="Europe/Paris">Europe/Paris (Francia)</option>
            <option value="Europe/London">Europe/London (UK)</option>
          </select>
        </label>
      </Section>

      {state && !state.ok && (
        <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-100">{state.error}</p>
      )}
      {state && state.ok && (
        <p className="rounded-md bg-emerald-50 px-4 py-3 text-sm text-emerald-800 border border-emerald-100">Guardado.</p>
      )}

      <Button type="submit" variant="dark" disabled={pending}>
        {pending ? 'Guardando…' : 'Guardar ajustes'}
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
        className="w-full rounded-sm border border-line bg-paper px-4 py-2.5 text-[15px] outline-none focus:border-navy focus:ring-2 focus:ring-yellow/30"
      />
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
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
