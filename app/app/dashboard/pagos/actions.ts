'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { resolveActiveSchool } from '@/lib/tenant-server';
import { eurosToCents } from '@/lib/slug';

export type PaymentFormState =
  | { ok: true }
  | { ok: false; error: string }
  | null;

export async function createPaymentAction(
  clientId: string,
  _prev: PaymentFormState,
  formData: FormData,
): Promise<PaymentFormState> {
  const school = await resolveActiveSchool();
  const supabase = await createClient();

  const amount_cents = eurosToCents(String(formData.get('amount') ?? '0'));
  const method = String(formData.get('method') ?? 'cash');
  const concept = String(formData.get('concept') ?? '').trim() || null;

  if (amount_cents <= 0) return { ok: false, error: 'Importe inválido.' };

  const { error } = await supabase.from('payments').insert({
    school_id: school.id,
    client_id: clientId,
    reference_type: 'other',
    amount_cents,
    method,
    concept,
  });

  if (error) return { ok: false, error: error.message };

  revalidatePath('/dashboard/pagos');
  revalidatePath(`/dashboard/clientes/${clientId}`);
  return { ok: true };
}

export async function deletePaymentAction(paymentId: string, clientId: string | null): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from('payments').delete().eq('id', paymentId);
  if (error) throw new Error(error.message);
  revalidatePath('/dashboard/pagos');
  if (clientId) revalidatePath(`/dashboard/clientes/${clientId}`);
}
