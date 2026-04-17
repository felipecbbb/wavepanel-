'use client';

import { useActionState, useEffect, useState } from 'react';
import { Button } from '@/components/button';
import { createCampBookingAction, type CampBookingFormState } from '../actions';

type Client = { id: string; name: string };

export default function NewBookingForm({
  campId,
  basePriceCents,
  depositCents,
  clients,
}: {
  campId: string;
  basePriceCents: number;
  depositCents: number;
  clients: Client[];
}) {
  const action = createCampBookingAction.bind(null, campId);
  const [state, formAction, pending] = useActionState<CampBookingFormState, FormData>(action, null);
  const [open, setOpen] = useState(false);
  const [participants, setParticipants] = useState(1);

  useEffect(() => {
    if (state?.ok && open) setOpen(false);
  }, [state, open]);

  const total = ((basePriceCents * participants) / 100).toFixed(2);
  const deposit = ((depositCents * participants) / 100).toFixed(2);

  return (
    <>
      <Button type="button" variant="yellow" onClick={() => setOpen(true)} disabled={clients.length === 0}>
        {clients.length === 0 ? 'Crea un cliente primero' : 'Nueva reserva'}
      </Button>

      {open && (
        <div className="fixed inset-0 bg-navy/40 z-40 flex items-start justify-center p-4 md:p-10 overflow-y-auto" onClick={() => setOpen(false)}>
          <div className="bg-paper rounded-md w-full max-w-md shadow-pop my-6" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-line flex items-center justify-between">
              <h3 className="font-display text-xl text-navy">Nueva reserva de camp</h3>
              <button type="button" onClick={() => setOpen(false)} className="text-muted hover:text-navy text-xl">×</button>
            </div>
            <form action={formAction} className="p-5 space-y-4">
              <label className="block">
                <span className="font-label text-[0.72rem] text-navy block mb-1.5">Cliente</span>
                <select
                  name="client_id"
                  required
                  className="w-full rounded-sm border border-line bg-paper px-3 py-2 text-[15px] outline-none focus:border-navy"
                >
                  <option value="">— Selecciona —</option>
                  {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </label>

              <label className="block">
                <span className="font-label text-[0.72rem] text-navy block mb-1.5">Participantes</span>
                <input
                  name="participants_count"
                  type="number"
                  min={1}
                  max={50}
                  value={participants}
                  onChange={(e) => setParticipants(Math.max(1, Number(e.target.value)))}
                  className="w-full rounded-sm border border-line bg-paper px-3 py-2 text-[15px] outline-none focus:border-navy"
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="font-label text-[0.72rem] text-navy block mb-1.5">Total (€)</span>
                  <input
                    name="total"
                    type="number"
                    step="0.01"
                    min={0}
                    defaultValue={total}
                    key={`total-${participants}`}
                    className="w-full rounded-sm border border-line bg-paper px-3 py-2 text-[15px] outline-none focus:border-navy"
                  />
                </label>
                <label className="block">
                  <span className="font-label text-[0.72rem] text-navy block mb-1.5">Ya pagado (€)</span>
                  <input
                    name="paid"
                    type="number"
                    step="0.01"
                    min={0}
                    defaultValue={deposit}
                    key={`paid-${participants}`}
                    className="w-full rounded-sm border border-line bg-paper px-3 py-2 text-[15px] outline-none focus:border-navy"
                  />
                </label>
              </div>

              <label className="block">
                <span className="font-label text-[0.72rem] text-navy block mb-1.5">Método de pago</span>
                <select
                  name="method"
                  defaultValue="cash"
                  className="w-full rounded-sm border border-line bg-paper px-3 py-2 text-[15px] outline-none focus:border-navy"
                >
                  <option value="cash">Efectivo</option>
                  <option value="card">Tarjeta</option>
                  <option value="transfer">Transferencia</option>
                  <option value="voucher">Vale</option>
                  <option value="online">Pasarela online</option>
                </select>
              </label>

              <label className="block">
                <span className="font-label text-[0.72rem] text-navy block mb-1.5">Notas</span>
                <textarea
                  name="notes"
                  rows={2}
                  className="w-full rounded-sm border border-line bg-paper px-3 py-2 text-[15px] outline-none focus:border-navy resize-y"
                />
              </label>

              {state && !state.ok && (
                <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 border border-red-100">{state.error}</p>
              )}

              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button type="submit" variant="dark" disabled={pending}>
                  {pending ? 'Creando…' : 'Crear reserva'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
