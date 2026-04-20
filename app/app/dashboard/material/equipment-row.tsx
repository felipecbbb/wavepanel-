'use client';

import { useState } from 'react';
import EquipmentForm, { type EquipmentInitial } from './equipment-form';
import DeleteButton from '@/components/delete-button';
import { deleteEquipmentAction } from './actions';
import { centsToEuros } from '@/lib/slug';

export default function EquipmentRow({
  id,
  name,
  category,
  size,
  stock,
  price_per_day_cents,
  notes,
  active,
}: {
  id: string;
  name: string;
  category: string;
  size: string | null;
  stock: number;
  price_per_day_cents: number;
  notes: string | null;
  active: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const initial: EquipmentInitial = { name, category, size, stock, price_per_day_cents, notes, active };

  if (editing) {
    return (
      <li className="p-4 bg-sand/30 border-t border-line">
        <EquipmentForm id={id} initial={initial} onDone={() => setEditing(false)} />
      </li>
    );
  }

  return (
    <li className={`p-4 flex items-center justify-between gap-4 border-t border-line ${!active ? 'opacity-60' : ''}`}>
      <div className="min-w-0 flex items-center gap-3">
        <span className="font-label text-[0.6rem] bg-navy/5 text-navy px-2 py-0.5 rounded-sm uppercase">{category}</span>
        <div className="min-w-0">
          <p className="font-display text-lg text-navy truncate">
            {name}{size && <span className="text-muted text-sm"> · {size}</span>}
          </p>
          <p className="text-xs text-muted">
            Stock {stock} · {centsToEuros(price_per_day_cents)} / día
            {!active && <span className="ml-2 italic">· inactivo</span>}
            {notes && <span className="ml-2">· {notes}</span>}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="text-[0.72rem] font-label text-muted hover:text-navy underline"
        >
          Editar
        </button>
        <DeleteButton
          action={deleteEquipmentAction.bind(null, id)}
          confirmMessage={`¿Borrar "${name}"? Los alquileres activos impedirán el borrado.`}
          label="Borrar"
          className="text-[0.72rem] font-label text-red-700 hover:text-red-900 underline"
        />
      </div>
    </li>
  );
}
