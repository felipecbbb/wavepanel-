'use client';

import { useActionState, useMemo, useState } from 'react';
import { Button } from '@/components/button';
import { enrollClientAction, type EnrollFormState } from './actions';

type Client = { id: string; name: string };
type FamilyMember = { id: string; client_id: string; full_name: string };
type Bono = { id: string; client_id: string; activity_id: string; total_credits: number; used_credits: number };

export default function EnrollForm({
  classId,
  activityId,
  clients,
  family,
  bonos,
}: {
  classId: string;
  activityId: string;
  clients: Client[];
  family: FamilyMember[];
  bonos: Bono[];
}) {
  const action = enrollClientAction.bind(null, classId);
  const [state, formAction, pending] = useActionState<EnrollFormState, FormData>(action, null);
  const [open, setOpen] = useState(false);
  const [clientId, setClientId] = useState('');

  const eligibleFamily = useMemo(
    () => family.filter((f) => f.client_id === clientId),
    [family, clientId],
  );
  const eligibleBonos = useMemo(
    () =>
      bonos.filter(
        (b) => b.client_id === clientId && b.activity_id === activityId && b.used_credits < b.total_credits,
      ),
    [bonos, clientId, activityId],
  );

  if (state?.ok && open) setTimeout(() => setOpen(false), 50);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs text-navy font-label underline hover:text-navy-soft"
      >
        Inscribir
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-navy/40 z-40 flex items-start justify-center p-4 md:p-10 overflow-y-auto"
          onClick={() => setOpen(false)}
        >
          <div className="bg-paper rounded-md w-full max-w-md shadow-pop my-6" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-line flex items-center justify-between">
              <h3 className="font-display text-xl text-navy">Inscribir a clase</h3>
              <button type="button" onClick={() => setOpen(false)} className="text-muted hover:text-navy text-xl">×</button>
            </div>
            <form action={formAction} className="p-5 space-y-4">
              <label className="block">
                <span className="font-label text-[0.72rem] text-navy block mb-1.5">Cliente</span>
                <select
                  name="client_id"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  required
                  className="w-full rounded-sm border border-line bg-paper px-3 py-2 text-[15px] outline-none focus:border-navy"
                >
                  <option value="">— Selecciona —</option>
                  {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </label>

              {eligibleFamily.length > 0 && (
                <label className="block">
                  <span className="font-label text-[0.72rem] text-navy block mb-1.5">Miembro de familia (opcional)</span>
                  <select
                    name="family_member_id"
                    defaultValue=""
                    className="w-full rounded-sm border border-line bg-paper px-3 py-2 text-[15px] outline-none focus:border-navy"
                  >
                    <option value="">Cliente principal</option>
                    {eligibleFamily.map((f) => <option key={f.id} value={f.id}>{f.full_name}</option>)}
                  </select>
                </label>
              )}

              <label className="block">
                <span className="font-label text-[0.72rem] text-navy block mb-1.5">Usar bono</span>
                <select
                  name="bono_id"
                  defaultValue=""
                  disabled={!clientId}
                  className="w-full rounded-sm border border-line bg-paper px-3 py-2 text-[15px] outline-none focus:border-navy disabled:opacity-50"
                >
                  <option value="">— Pago directo (sin bono) —</option>
                  {eligibleBonos.map((b) => (
                    <option key={b.id} value={b.id}>
                      Bono {b.total_credits - b.used_credits}/{b.total_credits} restantes
                    </option>
                  ))}
                </select>
                {clientId && eligibleBonos.length === 0 && (
                  <span className="mt-1 block text-xs text-muted">Este cliente no tiene bonos activos de esta actividad.</span>
                )}
              </label>

              <label className="block">
                <span className="font-label text-[0.72rem] text-navy block mb-1.5">Precio (€) si es pago directo</span>
                <input
                  name="price_euros"
                  type="number"
                  step="0.01"
                  min={0}
                  defaultValue={0}
                  className="w-full rounded-sm border border-line bg-paper px-3 py-2 text-[15px] outline-none focus:border-navy"
                />
              </label>

              <label className="block">
                <span className="font-label text-[0.72rem] text-navy block mb-1.5">Notas</span>
                <input
                  name="notes"
                  className="w-full rounded-sm border border-line bg-paper px-3 py-2 text-[15px] outline-none focus:border-navy"
                />
              </label>

              {state && !state.ok && (
                <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 border border-red-100">{state.error}</p>
              )}

              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button type="submit" variant="dark" disabled={pending || !clientId}>
                  {pending ? 'Inscribiendo…' : 'Inscribir'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
