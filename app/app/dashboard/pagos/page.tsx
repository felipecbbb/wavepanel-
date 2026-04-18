import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { resolveActiveSchool } from '@/lib/tenant-server';
import { centsToEuros } from '@/lib/slug';

type Payment = {
  id: string;
  client_id: string | null;
  reference_type: string;
  reference_id: string | null;
  amount_cents: number;
  method: string;
  concept: string | null;
  paid_at: string;
};
type Client = { id: string; name: string };

const METHOD_LABEL: Record<string, string> = {
  cash: 'Efectivo',
  card: 'Tarjeta',
  transfer: 'Transferencia',
  voucher: 'Vale',
  credit: 'Crédito',
  online: 'Online',
};

const REF_LABEL: Record<string, string> = {
  bono: 'Bono',
  camp_booking: 'Camp',
  class_enrollment: 'Clase',
  other: 'Otro',
};

export default async function PagosPage() {
  await resolveActiveSchool();
  const supabase = await createClient();

  const [{ data: paymentsData }, { data: clientsData }] = await Promise.all([
    supabase
      .from('payments')
      .select('id, client_id, reference_type, reference_id, amount_cents, method, concept, paid_at')
      .order('paid_at', { ascending: false })
      .limit(500),
    supabase.from('clients').select('id, name'),
  ]);

  const payments = (paymentsData ?? []) as Payment[];
  const clientById = new Map(((clientsData ?? []) as Client[]).map((c) => [c.id, c]));

  const totalCents = payments.reduce((s, p) => s + p.amount_cents, 0);

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <header className="mb-8 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="kicker mb-2">Pagos</p>
          <h1 className="font-display text-4xl text-navy">Auditoría de cobros.</h1>
          <p className="mt-2 text-muted text-sm">
            Cada bono, reserva de camp o pago manual aparece aquí. Se puede registrar un pago libre desde la ficha del cliente.
          </p>
        </div>
        <div className="text-right">
          <p className="font-label text-[0.72rem] text-muted">Total registrado</p>
          <p className="font-display text-3xl text-navy">{centsToEuros(totalCents)}</p>
        </div>
      </header>

      {payments.length === 0 ? (
        <div className="rounded-md border border-dashed border-line bg-paper p-10 text-center">
          <p className="text-sm text-muted">Aún no hay pagos registrados.</p>
        </div>
      ) : (
        <div className="rounded-md border border-line bg-paper overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-sand/50">
              <tr className="text-left">
                <th className="px-4 py-2.5 font-label text-[0.66rem] text-muted">Fecha</th>
                <th className="px-4 py-2.5 font-label text-[0.66rem] text-muted">Cliente</th>
                <th className="px-4 py-2.5 font-label text-[0.66rem] text-muted">Concepto</th>
                <th className="px-4 py-2.5 font-label text-[0.66rem] text-muted">Método</th>
                <th className="px-4 py-2.5 font-label text-[0.66rem] text-muted text-right">Importe</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p, i) => {
                const c = p.client_id ? clientById.get(p.client_id) : null;
                return (
                  <tr key={p.id} className={i !== 0 ? 'border-t border-line' : ''}>
                    <td className="px-4 py-3 text-xs text-muted whitespace-nowrap">
                      {new Date(p.paid_at).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3">
                      {c ? (
                        <Link href={`/dashboard/clientes/${c.id}`} className="text-navy hover:underline">{c.name}</Link>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-label text-[0.6rem] bg-sand text-muted px-2 py-0.5 rounded-sm mr-2">
                        {REF_LABEL[p.reference_type] ?? p.reference_type}
                      </span>
                      {p.concept ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-xs">{METHOD_LABEL[p.method] ?? p.method}</td>
                    <td className="px-4 py-3 text-right font-semibold">{centsToEuros(p.amount_cents)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
