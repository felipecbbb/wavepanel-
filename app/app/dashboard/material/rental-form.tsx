'use client';

import { useActionState, useEffect, useState } from 'react';
import { Button } from '@/components/button';
import { createRentalAction, type RentalFormState } from './actions';
import { centsToEuros } from '@/lib/slug';

type Equipment = { id: string; name: string; size: string | null; price_per_day_cents: number; stock: number };
type Client = { id: string; name: string };

export default function RentalForm({
  equipment,
  clients,
}: {
  equipment: Equipment[];
  clients: Client[];
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<RentalFormState, FormData>(createRentalAction, null);
  const [equipmentId, setEquipmentId] = useState(equipment[0]?.id ?? '');
  const [starts, setStarts] = useState(() => new Date().toISOString().slice(0, 10));
  const [ends, setEnds] = useState(() => new Date().toISOString().slice(0, 10));
  const [qty, setQty] = useState(1);
  const [clientMode, setClientMode] = useState<'existing' | 'snapshot'>('existing');

  useEffect(() => {
    if (state?.ok) setOpen(false);
  }, [state]);

  const sel = equipment.find((e) => e.id === equipmentId);
  const days = Math.max(1, Math.round((new Date(ends).getTime() - new Date(starts).getTime()) / 86_400_000) + 1);
  const total = sel ? sel.price_per_day_cents * days * qty : 0;

  return (
    <>
      <Button type="button" variant="yellow" onClick={() => setOpen(true)} disabled={equipment.length === 0}>
        {equipment.length === 0 ? 'Añade material primero' : 'Nuevo alquiler'}
      </Button>

      {open && (
        <div
          className="fixed inset-0 bg-navy/40 z-40 flex items-start justify-center p-4 md:p-10 overflow-y-auto"
          onClick={() => setOpen(false)}
        >
          <div className="bg-paper rounded-md w-full max-w-lg shadow-pop my-6" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-line flex items-center justify-between">
              <h2 className="font-display text-2xl text-navy">Nuevo alquiler</h2>
              <button type="button" onClick={() => setOpen(false)} className="text-muted hover:text-navy text-xl">×</button>
            </div>
            <form action={formAction} className="p-6 space-y-4">
              <label className="block">
                <span className="font-label text-[0.72rem] text-navy block mb-1.5">Material</span>
                <select
                  name="equipment_id"
                  value={equipmentId}
                  onChange={(e) => setEquipmentId(e.target.value)}
                  required
                  className="w-full rounded-sm border border-line bg-paper px-3 py-2 text-[15px] outline-none focus:border-navy"
                >
                  {equipment.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name}{e.size ? ` · ${e.size}` : ''} — {centsToEuros(e.price_per_day_cents)}/día · stock {e.stock}
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="font-label text-[0.72rem] text-navy block mb-1.5">Desde</span>
                  <input type="date" name="starts_on" value={starts} onChange={(e) => setStarts(e.target.value)} required
                    className="w-full rounded-sm border border-line bg-paper px-3 py-2 text-[15px] outline-none focus:border-navy" />
                </label>
                <label className="block">
                  <span className="font-label text-[0.72rem] text-navy block mb-1.5">Hasta</span>
                  <input type="date" name="ends_on" value={ends} onChange={(e) => setEnds(e.target.value)} required
                    className="w-full rounded-sm border border-line bg-paper px-3 py-2 text-[15px] outline-none focus:border-navy" />
                </label>
              </div>

              <label className="block">
                <span className="font-label text-[0.72rem] text-navy block mb-1.5">Cantidad</span>
                <input type="number" name="quantity" min={1} value={qty} onChange={(e) => setQty(Number(e.target.value) || 1)} required
                  className="w-full rounded-sm border border-line bg-paper px-3 py-2 text-[15px] outline-none focus:border-navy" />
              </label>

              <div>
                <div className="inline-flex mb-2 rounded-sm border border-line overflow-hidden text-[0.72rem] font-label">
                  <button type="button" onClick={() => setClientMode('existing')} className={`px-3 py-1 ${clientMode === 'existing' ? 'bg-navy text-white' : 'bg-paper text-navy hover:bg-sand'}`}>
                    Cliente del fichero
                  </button>
                  <button type="button" onClick={() => setClientMode('snapshot')} className={`px-3 py-1 ${clientMode === 'snapshot' ? 'bg-navy text-white' : 'bg-paper text-navy hover:bg-sand'}`}>
                    Nombre suelto
                  </button>
                </div>
                {clientMode === 'existing' ? (
                  <select
                    name="client_id"
                    className="w-full rounded-sm border border-line bg-paper px-3 py-2 text-[15px] outline-none focus:border-navy"
                  >
                    <option value="">— selecciona cliente —</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    name="client_name_snapshot"
                    placeholder="Nombre del cliente"
                    className="w-full rounded-sm border border-line bg-paper px-3 py-2 text-[15px] outline-none focus:border-navy"
                  />
                )}
              </div>

              <label className="block">
                <span className="font-label text-[0.72rem] text-navy block mb-1.5">Pagado ya (€)</span>
                <input type="number" name="paid_euros" min={0} step="0.50" defaultValue="0"
                  className="w-full rounded-sm border border-line bg-paper px-3 py-2 text-[15px] outline-none focus:border-navy" />
              </label>

              <div className="rounded-sm bg-sand/60 p-3 text-sm">
                {sel ? (
                  <p>
                    {days} día{days === 1 ? '' : 's'} × {qty} ud × {centsToEuros(sel.price_per_day_cents)}/día ={' '}
                    <strong className="font-display text-lg text-navy">{centsToEuros(total)}</strong>
                  </p>
                ) : (
                  <p className="text-muted">Selecciona material para calcular.</p>
                )}
              </div>

              {state && !state.ok && (
                <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 border border-red-100">{state.error}</p>
              )}

              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button type="submit" variant="dark" disabled={pending}>
                  {pending ? 'Guardando…' : 'Crear alquiler'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
