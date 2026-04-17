'use client';

import { useActionState, useEffect, useState } from 'react';
import { Button } from '@/components/button';
import { sellBonoAction, type SellBonoState } from '@/app/dashboard/bonos/actions';
import { centsToEuros } from '@/lib/slug';

type Pack = { id: string; sessions: number; price_cents: number };
type Activity = { id: string; name: string; color: string; pack_validity_days: number; packs: Pack[] };

export default function SellBonoForm({ clientId, activities }: { clientId: string; activities: Activity[] }) {
  const action = sellBonoAction.bind(null, clientId);
  const [state, formAction, pending] = useActionState<SellBonoState, FormData>(action, null);
  const [open, setOpen] = useState(false);
  const [activityId, setActivityId] = useState(activities[0]?.id ?? '');

  useEffect(() => {
    if (state?.ok && open) setOpen(false);
  }, [state, open]);

  const activity = activities.find((a) => a.id === activityId);

  return (
    <>
      <Button
        type="button"
        variant="yellow"
        onClick={() => setOpen(true)}
        disabled={activities.length === 0 || activities.every((a) => a.packs.length === 0)}
      >
        {activities.length === 0
          ? 'Crea una actividad primero'
          : activities.every((a) => a.packs.length === 0)
            ? 'Crea packs primero'
            : 'Vender bono'}
      </Button>

      {open && (
        <div className="fixed inset-0 bg-navy/40 z-40 flex items-start justify-center p-4 md:p-10 overflow-y-auto" onClick={() => setOpen(false)}>
          <div className="bg-paper rounded-md w-full max-w-md shadow-pop my-6" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-line flex items-center justify-between">
              <h3 className="font-display text-xl text-navy">Vender bono</h3>
              <button type="button" onClick={() => setOpen(false)} className="text-muted hover:text-navy text-xl">×</button>
            </div>
            <form action={formAction} className="p-5 space-y-4">
              <label className="block">
                <span className="font-label text-[0.72rem] text-navy block mb-1.5">Actividad</span>
                <select
                  value={activityId}
                  onChange={(e) => setActivityId(e.target.value)}
                  className="w-full rounded-sm border border-line bg-paper px-3 py-2 text-[15px] outline-none focus:border-navy"
                >
                  {activities.filter((a) => a.packs.length > 0).map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="font-label text-[0.72rem] text-navy block mb-1.5">Pack</span>
                <select
                  name="pack_id"
                  required
                  className="w-full rounded-sm border border-line bg-paper px-3 py-2 text-[15px] outline-none focus:border-navy"
                >
                  {activity?.packs.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.sessions} {p.sessions === 1 ? 'sesión' : 'sesiones'} · {centsToEuros(p.price_cents)}
                    </option>
                  ))}
                </select>
              </label>

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
                  <option value="credit">Crédito/saldo</option>
                  <option value="online">Pasarela online</option>
                </select>
              </label>

              <p className="text-xs text-muted">
                Caducidad: {activity?.pack_validity_days ?? 180} días desde hoy.
              </p>

              {state && !state.ok && (
                <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 border border-red-100">{state.error}</p>
              )}

              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button type="submit" variant="dark" disabled={pending}>
                  {pending ? 'Vendiendo…' : 'Vender bono'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
