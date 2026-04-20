'use client';

import { useActionState, useEffect, useState } from 'react';
import { Button } from '@/components/button';
import {
  createEquipmentAction,
  updateEquipmentAction,
  type EquipmentFormState,
} from './actions';

export type EquipmentInitial = {
  name: string;
  category: string;
  size: string | null;
  stock: number;
  price_per_day_cents: number;
  notes: string | null;
  active: boolean;
};

const CATEGORIES: { value: string; label: string }[] = [
  { value: 'board', label: 'Tabla' },
  { value: 'softboard', label: 'Soft' },
  { value: 'longboard', label: 'Longboard' },
  { value: 'wetsuit', label: 'Neopreno' },
  { value: 'leash', label: 'Invento' },
  { value: 'fin', label: 'Quillas' },
  { value: 'other', label: 'Otro' },
];

export default function EquipmentForm({
  id,
  initial,
  onDone,
}: {
  id?: string;
  initial?: EquipmentInitial;
  onDone?: () => void;
}) {
  const action = id ? updateEquipmentAction.bind(null, id) : createEquipmentAction;
  const [state, formAction, pending] = useActionState<EquipmentFormState, FormData>(action, null);

  useEffect(() => {
    if (state?.ok && onDone) onDone();
  }, [state, onDone]);

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <label className="block">
          <span className="font-label text-[0.72rem] text-navy block mb-1.5">Nombre</span>
          <input
            name="name"
            type="text"
            defaultValue={initial?.name ?? ''}
            placeholder="Softboard 7'0"
            required
            className="w-full rounded-sm border border-line bg-paper px-3 py-2 text-[15px] outline-none focus:border-navy"
          />
        </label>
        <label className="block">
          <span className="font-label text-[0.72rem] text-navy block mb-1.5">Categoría</span>
          <select
            name="category"
            defaultValue={initial?.category ?? 'softboard'}
            className="w-full rounded-sm border border-line bg-paper px-3 py-2 text-[15px] outline-none focus:border-navy"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <label className="block">
          <span className="font-label text-[0.72rem] text-navy block mb-1.5">Talla / Longitud</span>
          <input
            name="size"
            type="text"
            defaultValue={initial?.size ?? ''}
            placeholder="7'0, M, L…"
            className="w-full rounded-sm border border-line bg-paper px-3 py-2 text-[15px] outline-none focus:border-navy"
          />
        </label>
        <label className="block">
          <span className="font-label text-[0.72rem] text-navy block mb-1.5">Stock</span>
          <input
            name="stock"
            type="number"
            min={0}
            defaultValue={initial?.stock ?? 1}
            required
            className="w-full rounded-sm border border-line bg-paper px-3 py-2 text-[15px] outline-none focus:border-navy"
          />
        </label>
        <label className="block">
          <span className="font-label text-[0.72rem] text-navy block mb-1.5">€ / día</span>
          <input
            name="price_per_day_euros"
            type="number"
            step="0.50"
            min={0}
            defaultValue={initial ? (initial.price_per_day_cents / 100).toFixed(2) : '15'}
            required
            className="w-full rounded-sm border border-line bg-paper px-3 py-2 text-[15px] outline-none focus:border-navy"
          />
        </label>
      </div>

      <label className="block">
        <span className="font-label text-[0.72rem] text-navy block mb-1.5">Notas</span>
        <textarea
          name="notes"
          rows={2}
          defaultValue={initial?.notes ?? ''}
          className="w-full rounded-sm border border-line bg-paper px-3 py-2 text-[15px] outline-none focus:border-navy resize-y"
        />
      </label>

      <label className="inline-flex items-center gap-2 text-sm">
        <input type="checkbox" name="active" defaultChecked={initial?.active ?? true} className="h-4 w-4" />
        <span>Disponible para alquilar</span>
      </label>

      {state && !state.ok && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 border border-red-100">{state.error}</p>
      )}

      <div className="flex justify-end gap-2">
        {onDone && (
          <Button type="button" variant="ghost" onClick={onDone}>Cancelar</Button>
        )}
        <Button type="submit" variant="dark" disabled={pending}>
          {pending ? 'Guardando…' : id ? 'Guardar cambios' : 'Añadir material'}
        </Button>
      </div>
    </form>
  );
}
