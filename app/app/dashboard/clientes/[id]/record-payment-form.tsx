'use client';

import { useActionState, useEffect, useState } from 'react';
import { Button } from '@/components/button';
import { createPaymentAction, type PaymentFormState } from '@/app/dashboard/pagos/actions';

export default function RecordPaymentForm({ clientId }: { clientId: string }) {
  const action = createPaymentAction.bind(null, clientId);
  const [state, formAction, pending] = useActionState<PaymentFormState, FormData>(action, null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (state?.ok && open) setOpen(false);
  }, [state, open]);

  return (
    <>
      <Button type="button" variant="outline" onClick={() => setOpen(true)}>
        Registrar pago libre
      </Button>
      {open && (
        <div className="fixed inset-0 bg-navy/40 z-40 flex items-start justify-center p-4 md:p-10" onClick={() => setOpen(false)}>
          <div className="bg-paper rounded-md w-full max-w-sm shadow-pop my-6" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-line flex items-center justify-between">
              <h3 className="font-display text-lg text-navy">Nuevo pago</h3>
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
                  required
                  className="w-full rounded-sm border border-line bg-paper px-3 py-2 text-[15px] outline-none focus:border-navy"
                />
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
                  <option value="credit">Crédito</option>
                  <option value="online">Online</option>
                </select>
              </label>
              <label className="block">
                <span className="font-label text-[0.72rem] text-navy block mb-1.5">Concepto</span>
                <input
                  name="concept"
                  placeholder="P.ej. Clase suelta, neopreno…"
                  className="w-full rounded-sm border border-line bg-paper px-3 py-2 text-[15px] outline-none focus:border-navy"
                />
              </label>
              {state && !state.ok && (
                <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 border border-red-100">{state.error}</p>
              )}
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button type="submit" variant="dark" disabled={pending}>
                  {pending ? 'Guardando…' : 'Registrar pago'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
