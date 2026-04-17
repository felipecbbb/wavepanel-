'use client';

import { useActionState, useState } from 'react';
import { Button } from '@/components/button';
import type { CouponFormState } from './actions';

type FormAction = (prev: CouponFormState, data: FormData) => Promise<CouponFormState>;

type Activity = { id: string; name: string };
type Camp = { id: string; name: string };

type Initial = {
  code?: string;
  name?: string | null;
  discount_type?: string;
  discount_value?: number;
  applies_to?: string;
  activity_id?: string | null;
  camp_id?: string | null;
  min_amount_cents?: number;
  max_uses?: number | null;
  max_uses_per_user?: number | null;
  starts_at?: string | null;
  expires_at?: string | null;
  active?: boolean;
};

export default function CouponForm({
  action,
  initial,
  activities,
  camps,
  submitLabel,
}: {
  action: FormAction;
  initial?: Initial;
  activities: Activity[];
  camps: Camp[];
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState<CouponFormState, FormData>(action, null);
  const [discountType, setDiscountType] = useState(initial?.discount_type ?? 'percentage');
  const [appliesTo, setAppliesTo] = useState(initial?.applies_to ?? 'all');

  const initialDiscountDisplay = initial
    ? discountType === 'percentage'
      ? String(initial.discount_value ?? 0)
      : ((initial.discount_value ?? 0) / 100).toFixed(2)
    : '';

  return (
    <form action={formAction} className="space-y-6 max-w-2xl">
      <section className="rounded-md border border-line bg-paper p-6 space-y-4">
        <h2 className="font-label text-[0.72rem] text-muted">Código y descuento</h2>
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Código" name="code" defaultValue={initial?.code?.toUpperCase()} placeholder="VERANO25" required />
          <Field label="Nombre interno" name="name" defaultValue={initial?.name ?? ''} placeholder="Descuento verano" />
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <label className="block">
            <span className="font-label text-[0.72rem] text-navy block mb-1.5">Tipo</span>
            <select
              name="discount_type"
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value)}
              className="w-full rounded-sm border border-line bg-paper px-4 py-2.5 text-[15px] outline-none focus:border-navy"
            >
              <option value="percentage">Porcentaje (%)</option>
              <option value="fixed">Fijo (€)</option>
            </select>
          </label>
          <label className="block">
            <span className="font-label text-[0.72rem] text-navy block mb-1.5">
              Valor del descuento {discountType === 'percentage' ? '(%)' : '(€)'}
            </span>
            <input
              name="discount_value"
              type="number"
              step={discountType === 'percentage' ? '1' : '0.01'}
              min={0}
              max={discountType === 'percentage' ? 100 : undefined}
              defaultValue={initialDiscountDisplay}
              required
              key={discountType}
              className="w-full rounded-sm border border-line bg-paper px-4 py-2.5 text-[15px] outline-none focus:border-navy"
            />
          </label>
        </div>
      </section>

      <section className="rounded-md border border-line bg-paper p-6 space-y-4">
        <h2 className="font-label text-[0.72rem] text-muted">Aplicación</h2>
        <label className="block">
          <span className="font-label text-[0.72rem] text-navy block mb-1.5">Aplica a</span>
          <select
            name="applies_to"
            value={appliesTo}
            onChange={(e) => setAppliesTo(e.target.value)}
            className="w-full rounded-sm border border-line bg-paper px-4 py-2.5 text-[15px] outline-none focus:border-navy"
          >
            <option value="all">Todo</option>
            <option value="class">Clases (bonos)</option>
            <option value="camp">Surf camps</option>
            <option value="bono">Bonos</option>
            <option value="product">Productos (tienda)</option>
            <option value="rental">Alquileres</option>
          </select>
        </label>

        {(appliesTo === 'class' || appliesTo === 'bono') && (
          <label className="block">
            <span className="font-label text-[0.72rem] text-navy block mb-1.5">Limitar a actividad (opcional)</span>
            <select
              name="activity_id"
              defaultValue={initial?.activity_id ?? ''}
              className="w-full rounded-sm border border-line bg-paper px-4 py-2.5 text-[15px] outline-none focus:border-navy"
            >
              <option value="">Cualquier actividad</option>
              {activities.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </label>
        )}

        {appliesTo === 'camp' && (
          <label className="block">
            <span className="font-label text-[0.72rem] text-navy block mb-1.5">Limitar a camp (opcional)</span>
            <select
              name="camp_id"
              defaultValue={initial?.camp_id ?? ''}
              className="w-full rounded-sm border border-line bg-paper px-4 py-2.5 text-[15px] outline-none focus:border-navy"
            >
              <option value="">Cualquier camp</option>
              {camps.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
        )}

        <Field
          label="Importe mínimo (€)"
          name="min_amount"
          type="number"
          defaultValue={initial?.min_amount_cents != null ? (initial.min_amount_cents / 100).toFixed(2) : '0'}
          hint="El cupón solo aplica si el pedido supera este importe."
        />
      </section>

      <section className="rounded-md border border-line bg-paper p-6 space-y-4">
        <h2 className="font-label text-[0.72rem] text-muted">Usos y vigencia</h2>
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Usos máximos totales" name="max_uses" type="number" defaultValue={initial?.max_uses?.toString() ?? ''} hint="Dejar vacío = ilimitado" />
          <Field label="Usos por cliente" name="max_uses_per_user" type="number" defaultValue={initial?.max_uses_per_user?.toString() ?? ''} hint="Dejar vacío = ilimitado" />
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Vigente desde" name="starts_at" type="datetime-local" defaultValue={initial?.starts_at ? initial.starts_at.slice(0, 16) : ''} />
          <Field label="Vigente hasta" name="expires_at" type="datetime-local" defaultValue={initial?.expires_at ? initial.expires_at.slice(0, 16) : ''} />
        </div>
        <label className="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" name="active" defaultChecked={initial?.active ?? true} className="h-4 w-4" />
          <span>Cupón activo</span>
        </label>
      </section>

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
        step={type === 'number' ? '0.01' : undefined}
        className="w-full rounded-sm border border-line bg-paper px-4 py-2.5 text-[15px] outline-none focus:border-navy focus:ring-2 focus:ring-yellow/30"
      />
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  );
}
