'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { resolveActiveSchool } from '@/lib/tenant-server';

export type OrderFormState =
  | { ok: true }
  | { ok: false; error: string }
  | null;

type IncomingItem = {
  product_id: string;
  quantity: number;
};

function parseItems(raw: FormDataEntryValue | null): IncomingItem[] {
  if (!raw) return [];
  try {
    const arr = JSON.parse(String(raw));
    if (!Array.isArray(arr)) return [];
    return arr
      .map((i) => ({
        product_id: String(i.product_id ?? '').trim(),
        quantity: Math.max(1, Math.round(Number(i.quantity) || 1)),
      }))
      .filter((i) => i.product_id);
  } catch {
    return [];
  }
}

export async function createOrderAction(
  _prev: OrderFormState,
  formData: FormData,
): Promise<OrderFormState> {
  const school = await resolveActiveSchool();
  const supabase = await createClient();

  const client_id = String(formData.get('client_id') ?? '').trim() || null;
  const client_name_snapshot = String(formData.get('client_name_snapshot') ?? '').trim() || null;
  const notes = String(formData.get('notes') ?? '').trim() || null;
  const items = parseItems(formData.get('items'));

  if (!client_id && !client_name_snapshot) {
    return { ok: false, error: 'Selecciona cliente o escribe un nombre.' };
  }
  if (items.length === 0) return { ok: false, error: 'Añade al menos un producto.' };

  // Fetch products to snapshot name and price.
  const productIds = items.map((i) => i.product_id);
  const { data: products } = await supabase
    .from('products')
    .select('id, name, price_cents, stock')
    .in('id', productIds);

  const byId = new Map((products ?? []).map((p) => [p.id, p]));
  for (const it of items) {
    const p = byId.get(it.product_id);
    if (!p) return { ok: false, error: 'Producto no encontrado.' };
    if (it.quantity > p.stock) {
      return { ok: false, error: `Stock insuficiente para "${p.name}" (hay ${p.stock}).` };
    }
  }

  // Insert order first, then items (trigger recalcula total_cents).
  const { data: order, error } = await supabase
    .from('orders')
    .insert({ school_id: school.id, client_id, client_name_snapshot, status: 'pending', notes })
    .select('id')
    .single();
  if (error || !order) return { ok: false, error: error?.message ?? 'No se pudo crear el pedido.' };

  const insertItems = items.map((it) => {
    const p = byId.get(it.product_id)!;
    return {
      order_id: order.id,
      product_id: it.product_id,
      name_snapshot: p.name,
      quantity: it.quantity,
      unit_price_cents: p.price_cents,
      total_cents: p.price_cents * it.quantity,
    };
  });
  const { error: itemsErr } = await supabase.from('order_items').insert(insertItems);
  if (itemsErr) return { ok: false, error: itemsErr.message };

  // Decrementa stock.
  for (const it of items) {
    const p = byId.get(it.product_id)!;
    await supabase.from('products').update({ stock: p.stock - it.quantity }).eq('id', it.product_id);
  }

  revalidatePath('/dashboard/productos');
  revalidatePath('/dashboard/pedidos');
  redirect(`/dashboard/pedidos/${order.id}`);
}

export async function setOrderStatusAction(
  orderId: string,
  status: 'pending' | 'paid' | 'cancelled' | 'refunded' | 'completed',
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);
  if (error) throw new Error(error.message);
  revalidatePath('/dashboard/pedidos');
  revalidatePath(`/dashboard/pedidos/${orderId}`);
}

export async function recordOrderPaymentAction(
  orderId: string,
  _prev: OrderFormState,
  formData: FormData,
): Promise<OrderFormState> {
  const school = await resolveActiveSchool();
  const supabase = await createClient();

  const amount_euros = parseFloat(String(formData.get('amount_euros') ?? '0').replace(',', '.'));
  const method = String(formData.get('method') ?? 'cash');
  const paid_at = String(formData.get('paid_at') ?? '').trim() || new Date().toISOString();

  if (!isFinite(amount_euros) || amount_euros <= 0) {
    return { ok: false, error: 'Importe inválido.' };
  }
  const amount_cents = Math.round(amount_euros * 100);

  const { data: order } = await supabase
    .from('orders')
    .select('id, client_id, total_cents, paid_cents')
    .eq('id', orderId)
    .maybeSingle();
  if (!order) return { ok: false, error: 'Pedido no encontrado.' };

  const { error: payErr } = await supabase.from('payments').insert({
    school_id: school.id,
    client_id: order.client_id,
    reference_type: 'other',
    reference_id: orderId,
    amount_cents,
    method,
    concept: 'pedido',
    paid_at,
  });
  if (payErr) return { ok: false, error: payErr.message };

  const newPaid = (order.paid_cents ?? 0) + amount_cents;
  const newStatus = newPaid >= order.total_cents ? 'paid' : 'pending';
  await supabase.from('orders').update({ paid_cents: newPaid, status: newStatus }).eq('id', orderId);

  revalidatePath(`/dashboard/pedidos/${orderId}`);
  revalidatePath('/dashboard/pedidos');
  return { ok: true };
}

export async function deleteOrderAction(orderId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from('orders').delete().eq('id', orderId);
  if (error) throw new Error(error.message);
  revalidatePath('/dashboard/pedidos');
  redirect('/dashboard/pedidos');
}
