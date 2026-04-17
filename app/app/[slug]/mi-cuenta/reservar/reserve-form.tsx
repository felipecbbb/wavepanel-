'use client';

import { useActionState } from 'react';
import { reserveClassAction, type ReserveState } from './actions';
import { centsToEuros } from '@/lib/slug';

type Bono = { id: string; total_credits: number; used_credits: number; expires_at: string | null };
type FamilyMember = { id: string; full_name: string };

export default function ReserveForm({
  schoolSlug,
  classId,
  primaryColor,
  bonos,
  family,
  minPackPriceCents,
  minPackSessions,
}: {
  schoolSlug: string;
  classId: string;
  primaryColor: string;
  bonos: Bono[];
  family: FamilyMember[];
  minPackPriceCents: number | null;
  minPackSessions: number | null;
}) {
  const action = reserveClassAction.bind(null, schoolSlug, classId);
  const [state, formAction, pending] = useActionState<ReserveState, FormData>(action, null);

  const hasBono = bonos.length > 0;

  return (
    <form action={formAction} className="space-y-5">
      {hasBono ? (
        <div className="rounded-md border border-line bg-paper p-5">
          <p className="kicker mb-3">Usa tu bono</p>
          <div className="space-y-3">
            {bonos.map((b) => {
              const remaining = b.total_credits - b.used_credits;
              return (
                <label key={b.id} className="flex items-center gap-3 p-3 rounded-md border border-line hover:border-navy cursor-pointer">
                  <input type="radio" name="bono_id" value={b.id} defaultChecked={b === bonos[0]} className="h-4 w-4" />
                  <div className="flex-1">
                    <p className="font-label text-[0.72rem] text-navy">
                      {remaining} {remaining === 1 ? 'sesión' : 'sesiones'} restantes de {b.total_credits}
                    </p>
                    {b.expires_at && (
                      <p className="text-xs text-muted">
                        Caduca {new Date(b.expires_at).toLocaleDateString('es-ES')}
                      </p>
                    )}
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
          <strong className="font-label text-[0.72rem] block mb-1">Sin bono disponible</strong>
          No tienes bonos activos para esta actividad. Puedes comprar un pack o ponerte en contacto con la escuela para pagar en persona.
          {minPackPriceCents !== null && minPackSessions !== null && (
            <p className="mt-2 text-xs">
              Pack desde {centsToEuros(minPackPriceCents)} · {minPackSessions} {minPackSessions === 1 ? 'sesión' : 'sesiones'}.
            </p>
          )}
        </div>
      )}

      {family.length > 0 && (
        <label className="block">
          <span className="font-label text-[0.72rem] text-navy block mb-1.5">¿La reserva es para ti o para alguien de tu familia?</span>
          <select
            name="family_member_id"
            defaultValue=""
            className="w-full rounded-sm border border-line bg-paper px-4 py-2.5 text-[15px] outline-none focus:border-navy"
          >
            <option value="">Para mí</option>
            {family.map((f) => (
              <option key={f.id} value={f.id}>{f.full_name}</option>
            ))}
          </select>
        </label>
      )}

      {state && !state.ok && (
        <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-100">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending || !hasBono}
        className="w-full rounded-pill px-6 py-3 font-label text-[0.76rem] text-navy disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ background: primaryColor }}
      >
        {pending ? 'Reservando…' : hasBono ? 'Confirmar reserva' : 'Necesitas un bono para reservar'}
      </button>
    </form>
  );
}
