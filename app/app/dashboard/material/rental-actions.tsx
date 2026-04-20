'use client';

import { setRentalStatusAction, deleteRentalAction } from './actions';

export function RentalStatusMenu({ rentalId, status }: { rentalId: string; status: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      {status !== 'active' && status !== 'returned' && (
        <button
          type="button"
          onClick={async () => { await setRentalStatusAction(rentalId, 'active'); }}
          className="text-navy hover:underline"
        >
          Entregado
        </button>
      )}
      {status === 'active' && (
        <button
          type="button"
          onClick={async () => { await setRentalStatusAction(rentalId, 'returned'); }}
          className="text-emerald-700 hover:underline"
        >
          Devuelto
        </button>
      )}
      {status !== 'cancelled' && status !== 'returned' && (
        <button
          type="button"
          onClick={async () => {
            if (confirm('¿Cancelar alquiler?')) await setRentalStatusAction(rentalId, 'cancelled');
          }}
          className="text-muted hover:text-navy hover:underline"
        >
          Cancelar
        </button>
      )}
      <button
        type="button"
        onClick={async () => {
          if (confirm('¿Borrar este alquiler? Esta acción no se puede deshacer.')) {
            await deleteRentalAction(rentalId);
          }
        }}
        className="text-red-700 hover:underline"
      >
        Borrar
      </button>
    </div>
  );
}

export function StatusPill({ status }: { status: string }) {
  const label: Record<string, string> = {
    reserved: 'Reservado',
    active: 'En uso',
    returned: 'Devuelto',
    cancelled: 'Cancelado',
  };
  const cls: Record<string, string> = {
    reserved: 'bg-sand text-navy',
    active: 'bg-amber-50 text-amber-800',
    returned: 'bg-emerald-50 text-emerald-800',
    cancelled: 'bg-red-50 text-red-700',
  };
  return (
    <span className={`font-label text-[0.6rem] px-2 py-0.5 rounded-sm ${cls[status] ?? 'bg-sand text-muted'}`}>
      {label[status] ?? status}
    </span>
  );
}
