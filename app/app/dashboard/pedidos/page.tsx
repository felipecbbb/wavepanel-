import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { resolveActiveSchool } from '@/lib/tenant-server';
import { centsToEuros } from '@/lib/slug';
import { ButtonLink } from '@/components/button';

type Order = {
  id: string;
  client_id: string | null;
  client_name_snapshot: string | null;
  status: string;
  total_cents: number;
  paid_cents: number;
  created_at: string;
};

type ClientRow = { id: string; name: string };

export default async function PedidosPage() {
  await resolveActiveSchool();
  const supabase = await createClient();

  const [{ data: ordersData }, { data: clientsData }] = await Promise.all([
    supabase
      .from('orders')
      .select('id, client_id, client_name_snapshot, status, total_cents, paid_cents, created_at')
      .order('created_at', { ascending: false })
      .limit(200),
    supabase.from('clients').select('id, name'),
  ]);

  const orders = (ordersData ?? []) as Order[];
  const clientById = new Map(((clientsData ?? []) as ClientRow[]).map((c) => [c.id, c]));

  const pendingRevenue = orders
    .filter((o) => o.status === 'pending')
    .reduce((s, o) => s + (o.total_cents - o.paid_cents), 0);
  const monthRevenue = orders
    .filter((o) => {
      const d = new Date(o.created_at);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((s, o) => s + o.paid_cents, 0);

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <header className="mb-8 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="kicker mb-2">Tienda</p>
          <h1 className="font-display text-4xl text-navy">Pedidos.</h1>
          <p className="mt-2 text-muted text-sm">
            {orders.length} pedido{orders.length === 1 ? '' : 's'} · {centsToEuros(monthRevenue)} cobrado este mes ·{' '}
            <span className={pendingRevenue > 0 ? 'text-red-600' : ''}>
              {centsToEuros(pendingRevenue)} pendiente
            </span>
          </p>
        </div>
        <ButtonLink href="/dashboard/pedidos/nuevo" variant="dark">Nuevo pedido</ButtonLink>
      </header>

      {orders.length === 0 ? (
        <div className="rounded-md border border-dashed border-line bg-paper p-10 text-center">
          <h3 className="font-display text-2xl text-navy mb-2">Aún no hay pedidos</h3>
          <p className="text-sm text-muted mb-6">Crea el primero con productos y cliente.</p>
          <ButtonLink href="/dashboard/pedidos/nuevo" variant="yellow">Crear el primero</ButtonLink>
        </div>
      ) : (
        <ul className="rounded-md border border-line bg-paper overflow-hidden">
          {orders.map((o) => {
            const clientName = o.client_id ? clientById.get(o.client_id)?.name : o.client_name_snapshot;
            const pending = o.total_cents - o.paid_cents;
            return (
              <li key={o.id} className="border-t border-line first:border-t-0">
                <Link href={`/dashboard/pedidos/${o.id}`} className="block p-4 hover:bg-sand/40 transition-colors">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="min-w-0 flex-1">
                      <p className="font-display text-lg text-navy">
                        {clientName ?? 'Cliente'}
                      </p>
                      <p className="text-xs text-muted">
                        {new Date(o.created_at).toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div className="text-right shrink-0 flex items-center gap-3">
                      <div>
                        <p className="font-display text-xl text-navy">{centsToEuros(o.total_cents)}</p>
                        {pending > 0 && (
                          <p className="text-xs text-red-600">pendiente {centsToEuros(pending)}</p>
                        )}
                      </div>
                      <OrderStatusPill status={o.status} />
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function OrderStatusPill({ status }: { status: string }) {
  const label: Record<string, string> = {
    pending: 'Pendiente',
    paid: 'Pagado',
    cancelled: 'Cancelado',
    refunded: 'Reembolsado',
    completed: 'Entregado',
  };
  const cls: Record<string, string> = {
    pending: 'bg-amber-50 text-amber-800',
    paid: 'bg-emerald-50 text-emerald-800',
    cancelled: 'bg-red-50 text-red-700',
    refunded: 'bg-sand text-muted',
    completed: 'bg-emerald-50 text-emerald-800',
  };
  return (
    <span className={`font-label text-[0.6rem] px-2 py-0.5 rounded-sm ${cls[status] ?? 'bg-sand text-muted'}`}>
      {label[status] ?? status}
    </span>
  );
}
