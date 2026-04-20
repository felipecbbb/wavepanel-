'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { duplicateClassAction } from './actions';

export default function DuplicateClassButton({ classId }: { classId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function duplicate(daysOffset: number) {
    setError(null);
    startTransition(async () => {
      const res = await duplicateClassAction(classId, daysOffset);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setOpen(false);
      router.push(`/dashboard/calendario?date=${res.date}`);
      router.refresh();
    });
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="text-[0.72rem] font-label text-muted hover:text-navy underline"
        disabled={pending}
      >
        Duplicar
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-40 min-w-[180px] rounded-md bg-paper border border-line shadow-pop p-2 text-sm">
            <p className="px-2 pt-1 pb-2 text-[0.66rem] text-muted font-label">Duplicar esta clase</p>
            <button type="button" className="w-full text-left px-2 py-1.5 rounded-sm hover:bg-sand" onClick={() => duplicate(1)}>
              Mañana
            </button>
            <button type="button" className="w-full text-left px-2 py-1.5 rounded-sm hover:bg-sand" onClick={() => duplicate(7)}>
              Próxima semana (+7d)
            </button>
            <button type="button" className="w-full text-left px-2 py-1.5 rounded-sm hover:bg-sand" onClick={() => duplicate(14)}>
              En 2 semanas (+14d)
            </button>
            {pending && <p className="px-2 py-1 text-xs text-muted">Duplicando…</p>}
            {error && <p className="px-2 py-1 text-xs text-red-700">{error}</p>}
          </div>
        </>
      )}
    </div>
  );
}
