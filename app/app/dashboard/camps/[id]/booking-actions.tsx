'use client';

import { useActionState, useEffect, useState } from 'react';
import { Button } from '@/components/button';
import {
  setCampBookingStatusAction,
  recordCampBookingPaymentAction,
  type CampBookingFormState,
} from '../actions';

export function BookingStatusMenu({ bookingId, status }: { bookingId: string; status: string }) {
  const options: { value: 'pending' | 'deposit_paid' | 'fully_paid' | 'cancelled' | 'refunded'; label: string }[] = [
    { value: 'pending', label: 'Pendiente' },
    { value: 'deposit_paid', label: 'Depósito pagado' },
    { value: 'fully_paid', label: 'Pago completo' },
    { value: 'cancelled', label: 'Cancelada' },
    { value: 'refunded', label: 'Reembolsada' },
  ];
  return (
    <select
      value={status}
      onChange={async (e) => {
        await setCampBookingStatusAction(bookingId, e.target.value as 'pending' | 'deposit_paid' | 'fully_paid' | 'cancelled' | 'refunded');
      }}
      className="rounded-sm border border-line bg-paper px-2 py-1 text-[0.76rem] outline-none focus:border-navy"
    >
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

export function RecordPaymentButton({ bookingId, pending_cents }: { bookingId: string; pending_cents: number }) {
  const action = recordCampBookingPaymentAction.bind(null, bookingId);
  const [state, formAction, submitting] = useActionState<CampBookingFormState, FormData>(action, null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (state?.ok && open) setOpen(false);
  }, [state, open]);

  if (pending_cents <= 0) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs text-navy font-label underline hover:text-navy-soft"
      >
        Registrar pago
      </button>
      {open && (
        <div className="fixed inset-0 bg-navy/40 z-40 flex items-start justify-center p-4 md:p-10" onClick={() => setOpen(false)}>
          <div className="bg-paper rounded-md w-full max-w-sm shadow-pop my-6" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-line flex items-center justify-between">
              <h3 className="font-display text-lg text-navy">Registrar pago</h3>
              <button type="button" onClick={() => setOpen(false)} className="text-muted hover:text-navy text-xl">×</button>
            </div>
            <form action={formAction} className="p-5 space-y-4">
              <label className="block">
                <span className="font-label text-[0.72rem] text-navy block mb-1.5">Importe (€)</span>
                <input
                  name="amount"
                  type="number"
                  step="0.01"
                  min={0.01}
                  defaultValue={(pending_cents / 100).toFixed(2)}
                  required
                  className="w-full rounded-sm border border-line bg-paper px-3 py-2 text-[15px] outline-none focus:border-navy"
                />
                <span className="text-xs text-muted mt-1 block">Pendiente: {(pending_cents / 100).toFixed(2)}€</span>
              </label>
              <label className="block">
                <span className="font-label text-[0.72rem] text-navy block mb-1.5">Método</span>
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
              {state && !state.ok && (
                <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 border border-red-100">{state.error}</p>
              )}
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button type="submit" variant="dark" disabled={submitting}>
                  {submitting ? 'Registrando…' : 'Registrar'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
