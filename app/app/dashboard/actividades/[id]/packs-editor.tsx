'use client';

import { useActionState, useEffect, useState } from 'react';
import { Button } from '@/components/button';
import { upsertPackAction, deletePackAction, type PackFormState } from '../actions';
import { centsToEuros } from '@/lib/slug';

type Pack = {
  id: string;
  sessions: number;
  price_cents: number;
  featured: boolean;
};

export default function PacksEditor({ activityId, packs }: { activityId: string; packs: Pack[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const sorted = [...packs].sort((a, b) => a.sessions - b.sessions);

  return (
    <div className="space-y-3">
      {sorted.length === 0 && !creating ? (
        <p className="text-sm text-muted italic">Sin packs. Añade el primero: 1 sesión, 3 sesiones, etc.</p>
      ) : (
        <ul className="divide-y divide-line rounded-md border border-line bg-paper overflow-hidden">
          {sorted.map((p) =>
            editingId === p.id ? (
              <li key={p.id} className="p-4 bg-sand/30">
                <PackForm
                  activityId={activityId}
                  pack={p}
                  onDone={() => setEditingId(null)}
                />
              </li>
            ) : (
              <li key={p.id} className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-label text-[0.72rem] text-muted w-16">
                    {p.sessions} {p.sessions === 1 ? 'sesión' : 'sesiones'}
                  </span>
                  <span className="font-display text-xl text-navy">{centsToEuros(p.price_cents)}</span>
                  {p.featured && (
                    <span className="inline-flex rounded-pill bg-yellow text-navy px-2 py-0.5 text-[0.66rem] font-label">
                      Destacado
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setEditingId(p.id)}
                    className="text-xs text-muted hover:text-navy underline"
                  >
                    Editar
                  </button>
                  <DeleteButton activityId={activityId} packId={p.id} />
                </div>
              </li>
            ),
          )}
        </ul>
      )}

      {creating ? (
        <div className="p-4 rounded-md border border-line bg-sand/30">
          <PackForm activityId={activityId} onDone={() => setCreating(false)} />
        </div>
      ) : (
        <Button type="button" variant="outline" onClick={() => setCreating(true)}>
          Añadir pack
        </Button>
      )}
    </div>
  );
}

function PackForm({
  activityId,
  pack,
  onDone,
}: {
  activityId: string;
  pack?: Pack;
  onDone: () => void;
}) {
  const action = upsertPackAction.bind(null, activityId, pack?.id ?? null);
  const [state, formAction, pending] = useActionState<PackFormState, FormData>(action, null);

  useEffect(() => {
    if (state?.ok) onDone();
  }, [state, onDone]);

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <label className="block">
        <span className="font-label text-[0.66rem] text-muted block mb-1">Sesiones</span>
        <input
          name="sessions"
          type="number"
          defaultValue={pack?.sessions ?? 1}
          min={1}
          max={50}
          required
          className="w-24 rounded-sm border border-line bg-paper px-3 py-2 text-[15px] outline-none focus:border-navy"
        />
      </label>
      <label className="block">
        <span className="font-label text-[0.66rem] text-muted block mb-1">Precio (€)</span>
        <input
          name="price"
          type="number"
          step="0.01"
          min={0}
          defaultValue={pack ? (pack.price_cents / 100).toFixed(2) : ''}
          required
          className="w-32 rounded-sm border border-line bg-paper px-3 py-2 text-[15px] outline-none focus:border-navy"
        />
      </label>
      <label className="inline-flex items-center gap-2 text-sm h-[42px]">
        <input type="checkbox" name="featured" defaultChecked={pack?.featured ?? false} className="h-4 w-4" />
        <span>Destacado</span>
      </label>
      <div className="flex gap-2 ml-auto">
        <Button type="button" variant="ghost" onClick={onDone}>
          Cancelar
        </Button>
        <Button type="submit" variant="dark" disabled={pending}>
          {pending ? 'Guardando…' : pack ? 'Guardar' : 'Añadir'}
        </Button>
      </div>
      {state && !state.ok && (
        <p className="w-full rounded-md bg-red-50 px-3 py-2 text-xs text-red-700 border border-red-100">
          {state.error}
        </p>
      )}
    </form>
  );
}

function DeleteButton({ activityId, packId }: { activityId: string; packId: string }) {
  const action = deletePackAction.bind(null, activityId, packId);
  return (
    <form action={action}>
      <button
        type="submit"
        className="text-xs text-red-700 hover:text-red-900 underline"
        onClick={(e) => {
          if (!confirm('¿Borrar este pack?')) e.preventDefault();
        }}
      >
        Borrar
      </button>
    </form>
  );
}
