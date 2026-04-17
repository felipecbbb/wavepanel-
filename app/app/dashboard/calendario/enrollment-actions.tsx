'use client';

import { cancelEnrollmentAction, setEnrollmentStatusAction } from './actions';

export default function EnrollmentActions({ enrollmentId, status }: { enrollmentId: string; status: string }) {
  return (
    <div className="flex gap-2 text-xs shrink-0">
      {status === 'confirmed' && (
        <>
          <button
            type="button"
            onClick={async () => { await setEnrollmentStatusAction(enrollmentId, 'completed'); }}
            className="text-emerald-700 hover:text-emerald-900 underline"
          >
            Asistió
          </button>
          <button
            type="button"
            onClick={async () => { await setEnrollmentStatusAction(enrollmentId, 'no_show'); }}
            className="text-red-700 hover:text-red-900 underline"
          >
            No vino
          </button>
          <button
            type="button"
            onClick={async () => {
              if (confirm('¿Cancelar inscripción?')) await cancelEnrollmentAction(enrollmentId);
            }}
            className="text-muted hover:text-navy underline"
          >
            Cancelar
          </button>
        </>
      )}
      {(status === 'completed' || status === 'no_show') && (
        <button
          type="button"
          onClick={async () => { await setEnrollmentStatusAction(enrollmentId, 'confirmed'); }}
          className="text-muted hover:text-navy underline"
        >
          Deshacer
        </button>
      )}
    </div>
  );
}
