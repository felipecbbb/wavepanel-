'use client';

import { useActionState, useMemo, useState } from 'react';
import { Button } from '@/components/button';
import { centsToEuros } from '@/lib/slug';
import { createOrderAction, type OrderFormState } from './actions';

type Product = { id: string; name: string; price_cents: number; stock: number };
type Client = { id: string; name: string };
type Line = { product_id: string; quantity: number };

export default function NewOrderForm({
  products,
  clients,
}: {
  products: Product[];
  clients: Client[];
}) {
  const [state, formAction, pending] = useActionState<OrderFormState, FormData>(createOrderAction, null);
  const [lines, setLines] = useState<Line[]>([]);
  const [clientMode, setClientMode] = useState<'existing' | 'snapshot'>('existing');

  const productById = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);
  const total = lines.reduce((s, l) => {
    const p = productById.get(l.product_id);
    return s + (p ? p.price_cents * l.quantity : 0);
  }, 0);

  function addLine() {
    const available = products.find((p) => p.stock > 0 && !lines.some((l) => l.product_id === p.id));
    if (!available) return;
    setLines([...lines, { product_id: available.id, quantity: 1 }]);
  }

  function removeLine(idx: number) {
    setLines(lines.filter((_, i) => i !== idx));
  }

  function updateLine(idx: number, patch: Partial<Line>) {
    setLines(lines.map((l, i) => (i === idx ? { ...l, ...patch } : l)));
  }

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="items" value={JSON.stringify(lines)} />

      <section>
        <h2 className="font-label text-[0.72rem] text-muted mb-3">Cliente</h2>
        <div className="inline-flex mb-3 rounded-sm border border-line overflow-hidden text-[0.72rem] font-label">
          <button type="button" onClick={() => setClientMode('existing')} className={`px-3 py-1 ${clientMode === 'existing' ? 'bg-navy text-white' : 'bg-paper text-navy hover:bg-sand'}`}>
            Cliente del fichero
          </button>
          <button type="button" onClick={() => setClientMode('snapshot')} className={`px-3 py-1 ${clientMode === 'snapshot' ? 'bg-navy text-white' : 'bg-paper text-navy hover:bg-sand'}`}>
            Nombre suelto
          </button>
        </div>
        {clientMode === 'existing' ? (
          <select name="client_id" className="w-full rounded-sm border border-line bg-paper px-3 py-2 text-[15px] outline-none focus:border-navy">
            <option value="">— selecciona cliente —</option>
            {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        ) : (
          <input type="text" name="client_name_snapshot" placeholder="Nombre del cliente"
            className="w-full rounded-sm border border-line bg-paper px-3 py-2 text-[15px] outline-none focus:border-navy" />
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-label text-[0.72rem] text-muted">Productos</h2>
          <button type="button" onClick={addLine} className="text-[0.76rem] text-navy hover:underline">+ Añadir línea</button>
        </div>

        {lines.length === 0 ? (
          <p className="text-sm text-muted italic">Aún sin líneas. Añade al menos una.</p>
        ) : (
          <ul className="space-y-2">
            {lines.map((l, i) => {
              const p = productById.get(l.product_id);
              const subtotal = p ? p.price_cents * l.quantity : 0;
              return (
                <li key={i} className="flex items-center gap-2 flex-wrap">
                  <select
                    value={l.product_id}
                    onChange={(e) => updateLine(i, { product_id: e.target.value })}
                    className="flex-1 min-w-[200px] rounded-sm border border-line bg-paper px-3 py-1.5 text-[14px] outline-none focus:border-navy"
                  >
                    {products.map((pp) => (
                      <option key={pp.id} value={pp.id} disabled={pp.stock === 0}>
                        {pp.name} — {centsToEuros(pp.price_cents)} (stock {pp.stock})
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min={1}
                    max={p?.stock ?? 1}
                    value={l.quantity}
                    onChange={(e) => updateLine(i, { quantity: Math.max(1, Number(e.target.value) || 1) })}
                    className="w-20 rounded-sm border border-line bg-paper px-2 py-1.5 text-[14px] outline-none focus:border-navy"
                  />
                  <span className="w-24 text-right font-semibold text-navy">{centsToEuros(subtotal)}</span>
                  <button type="button" onClick={() => removeLine(i)} className="text-red-700 hover:text-red-900 text-xs">Quitar</button>
                </li>
              );
            })}
          </ul>
        )}

        <div className="mt-4 flex items-baseline justify-between border-t border-line pt-3">
          <span className="font-label text-[0.72rem] text-muted">Total</span>
          <span className="font-display text-3xl text-navy">{centsToEuros(total)}</span>
        </div>
      </section>

      <label className="block">
        <span className="font-label text-[0.72rem] text-navy block mb-1.5">Notas</span>
        <textarea name="notes" rows={2}
          className="w-full rounded-sm border border-line bg-paper px-3 py-2 text-[15px] outline-none focus:border-navy resize-y" />
      </label>

      {state && !state.ok && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 border border-red-100">{state.error}</p>
      )}

      <div className="flex justify-end">
        <Button type="submit" variant="dark" disabled={pending || lines.length === 0}>
          {pending ? 'Creando…' : 'Crear pedido'}
        </Button>
      </div>
    </form>
  );
}
