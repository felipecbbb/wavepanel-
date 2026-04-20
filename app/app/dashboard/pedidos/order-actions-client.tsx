'use client';

import { useActionState, useState } from 'react';
import { Button } from '@/components/button';
import { setOrderStatusAction, recordOrderPaymentAction, type OrderFormState } from './actions';

export function OrderStatusButtons({ orderId, status, pending }: { orderId: string; status: string; pending: number }) {
  return (
    <div className="flex items-center gap-3 text-xs flex-wrap">
      {status === 'pending' && pending <= 0 && (
        <button type="button" onClick={async () => { await setOrderStatusAction(orderId, 'paid'); }} className="text-emerald-700 hover:underline">
          Marcar pagado
        </button>
      )}
      {status !== 'completed' && status !== 'cancelled' && (
        <button type="button" onClick={async () => { await setOrderStatusAction(orderId, 'completed'); }} className="text-navy hover:underline">
          Marcar entregado
        </button>
      )}
      {status !== 'cancelled' && status !== 'refunded' && (
        <button
          type="button"
          onClick={async () => { if (confirm('¿Cancelar pedido?')) await setOrderStatusAction(orderId, 'cancelled'); }}
          className="text-muted hover:text-navy hover:underline"
        >
          Cancelar
        </button>
      )}
      {(status === 'paid' || status === 'completed') && (
        <button
          type="button"
          onClick={async () => { if (confirm('¿Marcar como reembolsado?')) await setOrderStatusAction(orderId, 'refunded'); }}
          className="text-amber-700 hover:underline"
        >
          Reembolso
        </button>
      )}
    </div>
  );
}

export function RecordOrderPaymentForm({ orderId, pending }: { orderId: string; pending: number }) {
  const [open, setOpen] = useState(false);
  const action = recordOrderPaymentAction.bind(null, orderId);
  const [state, formAction, submitting] = useActionState<OrderFormState, FormData>(action, null);

  if (pending <= 0) return null;

  if (!open) {
    return (
      <Button type="button" variant="outline" onClick={() => setOpen(true)}>
        Registrar pago ({(pending / 100).toFixed(2)}€ pendiente)
      </Button>
    );
  }

  return (
    <form action={formAction} className="rounded-md border border-line bg-sand/30 p-4 space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <label className="block">
          <span className="font-label text-[0.72rem] text-navy block mb-1.5">Importe (€)</span>
          <input name="amount_euros" type="number" step="0.50" min={0}
            defaultValue={(pending / 100).toFixed(2)} required
            className="w-full rounded-sm border border-line bg-paper px-3 py-2 text-[15px] outline-none focus:border-navy" />
        </label>
        <label className="block">
          <span className="font-label text-[0.72rem] text-navy block mb-1.5">Método</span>
          <select name="method" defaultValue="cash"
            className="w-full rounded-sm border border-line bg-paper px-3 py-2 text-[15px] outline-none focus:border-navy">
            <option value="cash">Efectivo</option>
            <option value="card">Tarjeta</option>
            <option value="transfer">Transferencia</option>
            <option value="online">Online</option>
            <option value="voucher">Vale</option>
            <option value="credit">Crédito escuela</option>
          </select>
        </label>
        <label className="block">
          <span className="font-label text-[0.72rem] text-navy block mb-1.5">Fecha</span>
          <input name="paid_at" type="datetime-local" defaultValue={new Date().toISOString().slice(0, 16)}
            className="w-full rounded-sm border border-line bg-paper px-3 py-2 text-[15px] outline-none focus:border-navy" />
        </label>
      </div>
      {state && !state.ok && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 border border-red-100">{state.error}</p>}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
        <Button type="submit" variant="dark" disabled={submitting}>
          {submitting ? 'Guardando…' : 'Registrar pago'}
        </Button>
      </div>
    </form>
  );
}
