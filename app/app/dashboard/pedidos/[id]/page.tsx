import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { resolveActiveSchool } from '@/lib/tenant-server';
import { centsToEuros } from '@/lib/slug';
import DeleteButton from '@/components/delete-button';
import { deleteOrderAction } from '../actions';
import { OrderStatusButtons, RecordOrderPaymentForm } from '../order-actions-client';

type Order = {
  id: string;
  client_id: string | null;
  client_name_snapshot: string | null;
  status: string;
  total_cents: number;
  paid_cents: number;
  notes: string | null;
  created_at: string;
};

type OrderItem = {
  id: string;
  product_id: string | null;
  name_snapshot: string;
  quantity: number;
  unit_price_cents: number;
  total_cents: number;
};

type Payment = {
  id: string;
  amount_cents: number;
  method: string;
  paid_at: string;
};

export default async function PedidoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await resolveActiveSchool();
  const supabase = await createClient();

  const [{ data: order }, { data: itemsData }, { data: paymentsData }] = await Promise.all([
    supabase
      .from('orders')
      .select('id, client_id, client_name_snapshot, status, total_cents, paid_cents, notes, created_at')
      .eq('id', id)
      .maybeSingle<Order>(),
    supabase
      .from('order_items')
      .select('id, product_id, name_snapshot, quantity, unit_price_cents, total_cents')
      .eq('order_id', id)
      .order('created_at', { ascending: true }),
    supabase
      .from('payments')
      .select('id, amount_cents, method, paid_at')
      .eq('reference_type', 'other')
      .eq('reference_id', id)
      .order('paid_at', { ascending: false }),
  ]);

  if (!order) notFound();

  let clientName = order.client_name_snapshot;
  if (order.client_id) {
    const { data: c } = await supabase.from('clients').select('name').eq('id', order.client_id).maybeSingle<{ name: string }>();
    if (c) clientName = c.name;
  }

  const items = (itemsData ?? []) as OrderItem[];
  const payments = (paymentsData ?? []) as Payment[];
  const pending = order.total_cents - order.paid_cents;

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      <nav className="mb-6 text-sm text-muted">
        <Link href="/dashboard/pedidos" className="hover:text-navy">Pedidos</Link>
        <span className="mx-2">/</span>
        <span className="text-navy">#{order.id.slice(0, 8)}</span>
      </nav>

      <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
        <div>
          <p className="kicker mb-1">Pedido</p>
          <h1 className="font-display text-4xl text-navy">{clientName ?? 'Cliente'}</h1>
          <p className="mt-1 text-sm text-muted">
            Creado {new Date(order.created_at).toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <DeleteButton
          action={deleteOrderAction.bind(null, order.id)}
          confirmMessage="¿Borrar este pedido y sus líneas?"
          label="Borrar pedido"
        />
      </div>

      <section className="rounded-md border border-line bg-paper p-6 mb-6">
        <h2 className="font-label text-[0.72rem] text-muted mb-3">Líneas</h2>
        <ul className="divide-y divide-line">
          {items.map((it) => (
            <li key={it.id} className="py-2.5 flex items-center gap-3">
              <span className="flex-1 min-w-0 text-sm text-navy truncate">{it.name_snapshot}</span>
              <span className="text-xs text-muted w-16 text-right">×{it.quantity}</span>
              <span className="text-xs text-muted w-20 text-right">{centsToEuros(it.unit_price_cents)}</span>
              <span className="font-semibold text-navy w-24 text-right">{centsToEuros(it.total_cents)}</span>
            </li>
          ))}
        </ul>
        <div className="border-t border-line mt-3 pt-3 flex items-baseline justify-between">
          <div className="text-xs text-muted">
            Pagado {centsToEuros(order.paid_cents)} de {centsToEuros(order.total_cents)}
          </div>
          <div className="text-right">
            <p className="font-display text-2xl text-navy">{centsToEuros(order.total_cents)}</p>
            {pending > 0 && <p className="text-xs text-red-600">pendiente {centsToEuros(pending)}</p>}
          </div>
        </div>
      </section>

      <section className="rounded-md border border-line bg-paper p-6 mb-6 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-label text-[0.72rem] text-muted">Estado y cobro</h2>
          <OrderStatusButtons orderId={order.id} status={order.status} pending={pending} />
        </div>
        <RecordOrderPaymentForm orderId={order.id} pending={pending} />
        {payments.length > 0 && (
          <ul className="divide-y divide-line text-sm">
            {payments.map((p) => (
              <li key={p.id} className="py-2 flex items-center justify-between">
                <span className="text-navy">
                  {centsToEuros(p.amount_cents)} · <span className="text-muted">{p.method}</span>
                </span>
                <span className="text-xs text-muted">
                  {new Date(p.paid_at).toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {order.notes && (
        <section className="rounded-md border border-line bg-paper p-6">
          <h2 className="font-label text-[0.72rem] text-muted mb-2">Notas</h2>
          <p className="text-sm text-navy whitespace-pre-wrap">{order.notes}</p>
        </section>
      )}
    </div>
  );
}
