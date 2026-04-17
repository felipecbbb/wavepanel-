'use client';

import { useActionState, useEffect, useState } from 'react';
import { Button } from '@/components/button';
import {
  upsertFamilyMemberAction,
  deleteFamilyMemberAction,
  type FamilyFormState,
} from '../actions';

type Member = {
  id: string;
  full_name: string;
  birth_date: string | null;
  level: string | null;
  notes: string | null;
  can_swim: boolean | null;
  has_injury: boolean;
  injury_detail: string | null;
  wetsuit_size: string | null;
};

const LEVELS = [
  { value: '', label: '—' },
  { value: 'principiante', label: 'Principiante' },
  { value: 'intermedio', label: 'Intermedio' },
  { value: 'avanzado', label: 'Avanzado' },
];

function ageOf(birth?: string | null): number | null {
  if (!birth) return null;
  const d = new Date(birth);
  if (Number.isNaN(d.getTime())) return null;
  const diff = Date.now() - d.getTime();
  return Math.floor(diff / (365.25 * 86400000));
}

export default function FamilyEditor({ clientId, members }: { clientId: string; members: Member[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  return (
    <div className="space-y-3">
      {members.length === 0 && !creating ? (
        <p className="text-sm text-muted italic">
          Sin miembros de familia. Añade hijos u otros perfiles que gestione este cliente.
        </p>
      ) : (
        <ul className="space-y-3">
          {members.map((m) =>
            editingId === m.id ? (
              <li key={m.id} className="rounded-md border border-line bg-sand/30 p-4">
                <MemberForm clientId={clientId} member={m} onDone={() => setEditingId(null)} />
              </li>
            ) : (
              <li key={m.id} className="rounded-md border border-line bg-paper p-4 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-display text-lg text-navy">{m.full_name}</span>
                    {m.level && (
                      <span className="font-label text-[0.64rem] bg-sand px-2 py-0.5 rounded-sm">{m.level}</span>
                    )}
                    {m.has_injury && (
                      <span className="font-label text-[0.64rem] bg-red-50 text-red-700 px-2 py-0.5 rounded-sm">
                        Lesión
                      </span>
                    )}
                    {m.can_swim === false && (
                      <span className="font-label text-[0.64rem] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-sm">
                        No nada
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-muted space-x-2">
                    {m.birth_date && (
                      <>
                        <span>{m.birth_date}</span>
                        {ageOf(m.birth_date) !== null && <span>· {ageOf(m.birth_date)} años</span>}
                      </>
                    )}
                    {m.wetsuit_size && <span>· Neopreno {m.wetsuit_size}</span>}
                  </p>
                  {m.notes && <p className="mt-2 text-xs text-muted whitespace-pre-line">{m.notes}</p>}
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setEditingId(m.id)}
                    className="text-xs text-muted hover:text-navy underline"
                  >
                    Editar
                  </button>
                  <DeleteButton clientId={clientId} memberId={m.id} name={m.full_name} />
                </div>
              </li>
            ),
          )}
        </ul>
      )}

      {creating ? (
        <div className="rounded-md border border-line bg-sand/30 p-4">
          <MemberForm clientId={clientId} onDone={() => setCreating(false)} />
        </div>
      ) : (
        <Button type="button" variant="outline" onClick={() => setCreating(true)}>
          Añadir miembro de familia
        </Button>
      )}
    </div>
  );
}

function MemberForm({
  clientId,
  member,
  onDone,
}: {
  clientId: string;
  member?: Member;
  onDone: () => void;
}) {
  const action = upsertFamilyMemberAction.bind(null, clientId, member?.id ?? null);
  const [state, formAction, pending] = useActionState<FamilyFormState, FormData>(action, null);
  const [hasInjury, setHasInjury] = useState(member?.has_injury ?? false);

  useEffect(() => {
    if (state?.ok) onDone();
  }, [state, onDone]);

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2">
        <label className="block">
          <span className="font-label text-[0.66rem] text-muted block mb-1">Nombre completo</span>
          <input
            name="full_name"
            defaultValue={member?.full_name ?? ''}
            required
            className="w-full rounded-sm border border-line bg-paper px-3 py-2 text-[14px] outline-none focus:border-navy"
          />
        </label>
        <label className="block">
          <span className="font-label text-[0.66rem] text-muted block mb-1">Fecha de nacimiento</span>
          <input
            name="birth_date"
            type="date"
            defaultValue={member?.birth_date ?? ''}
            className="w-full rounded-sm border border-line bg-paper px-3 py-2 text-[14px] outline-none focus:border-navy"
          />
        </label>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <label className="block">
          <span className="font-label text-[0.66rem] text-muted block mb-1">Nivel</span>
          <select
            name="level"
            defaultValue={member?.level ?? ''}
            className="w-full rounded-sm border border-line bg-paper px-3 py-2 text-[14px] outline-none focus:border-navy"
          >
            {LEVELS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="font-label text-[0.66rem] text-muted block mb-1">¿Sabe nadar?</span>
          <select
            name="can_swim"
            defaultValue={member?.can_swim === true ? 'yes' : member?.can_swim === false ? 'no' : ''}
            className="w-full rounded-sm border border-line bg-paper px-3 py-2 text-[14px] outline-none focus:border-navy"
          >
            <option value="">—</option>
            <option value="yes">Sí</option>
            <option value="no">No</option>
          </select>
        </label>
        <label className="block">
          <span className="font-label text-[0.66rem] text-muted block mb-1">Talla neopreno</span>
          <input
            name="wetsuit_size"
            defaultValue={member?.wetsuit_size ?? ''}
            placeholder="S / M / L / 10 / 12…"
            className="w-full rounded-sm border border-line bg-paper px-3 py-2 text-[14px] outline-none focus:border-navy"
          />
        </label>
      </div>

      <label className="inline-flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="has_injury"
          checked={hasInjury}
          onChange={(e) => setHasInjury(e.target.checked)}
          className="h-4 w-4"
        />
        <span>Tiene lesión o condición médica</span>
      </label>
      {hasInjury && (
        <label className="block">
          <span className="font-label text-[0.66rem] text-muted block mb-1">Detalle de la lesión</span>
          <textarea
            name="injury_detail"
            defaultValue={member?.injury_detail ?? ''}
            rows={2}
            className="w-full rounded-sm border border-line bg-paper px-3 py-2 text-[14px] outline-none focus:border-navy resize-y"
          />
        </label>
      )}

      <label className="block">
        <span className="font-label text-[0.66rem] text-muted block mb-1">Notas</span>
        <textarea
          name="notes"
          defaultValue={member?.notes ?? ''}
          rows={2}
          className="w-full rounded-sm border border-line bg-paper px-3 py-2 text-[14px] outline-none focus:border-navy resize-y"
        />
      </label>

      {state && !state.ok && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700 border border-red-100">
          {state.error}
        </p>
      )}

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="ghost" onClick={onDone}>Cancelar</Button>
        <Button type="submit" variant="dark" disabled={pending}>
          {pending ? 'Guardando…' : member ? 'Guardar' : 'Añadir'}
        </Button>
      </div>
    </form>
  );
}

function DeleteButton({ clientId, memberId, name }: { clientId: string; memberId: string; name: string }) {
  const action = deleteFamilyMemberAction.bind(null, clientId, memberId);
  return (
    <form action={action}>
      <button
        type="submit"
        className="text-xs text-red-700 hover:text-red-900 underline"
        onClick={(e) => {
          if (!confirm(`¿Borrar a "${name}" de la familia?`)) e.preventDefault();
        }}
      >
        Borrar
      </button>
    </form>
  );
}
