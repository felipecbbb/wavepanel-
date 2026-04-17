'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { resolveActiveSchool } from '@/lib/tenant-server';
import { slugify, eurosToCents } from '@/lib/slug';

export type CampFormState =
  | { ok: true }
  | { ok: false; error: string }
  | null;

export type CampBookingFormState =
  | { ok: true }
  | { ok: false; error: string }
  | null;

function campFieldsFrom(formData: FormData, fallbackName = '') {
  const name = String(formData.get('name') ?? '').trim();
  const rawSlug = String(formData.get('slug') ?? '').trim() || fallbackName || name;
  return {
    name,
    slug: slugify(rawSlug),
    description: String(formData.get('description') ?? '').trim() || null,
    hero_image_url: String(formData.get('hero_image_url') ?? '').trim() || null,
    starts_on: String(formData.get('starts_on') ?? '').trim(),
    ends_on: String(formData.get('ends_on') ?? '').trim(),
    max_spots: Math.max(1, Math.min(500, Number(formData.get('max_spots')) || 10)),
    base_price_cents: eurosToCents(String(formData.get('base_price') ?? '0')),
    deposit_cents: eurosToCents(String(formData.get('deposit') ?? '0')),
    early_bird_price_cents: formData.get('early_bird_price')
      ? eurosToCents(String(formData.get('early_bird_price')))
      : null,
    early_bird_until: String(formData.get('early_bird_until') ?? '').trim() || null,
    status: String(formData.get('status') ?? 'draft'),
  };
}

export async function createCampAction(
  _prev: CampFormState,
  formData: FormData,
): Promise<CampFormState> {
  const school = await resolveActiveSchool();
  const supabase = await createClient();
  const f = campFieldsFrom(formData);

  if (!f.name) return { ok: false, error: 'El nombre es obligatorio.' };
  if (!f.starts_on || !f.ends_on) return { ok: false, error: 'Indica fecha de inicio y fin.' };
  if (new Date(f.ends_on) < new Date(f.starts_on)) return { ok: false, error: 'La fecha fin debe ser posterior al inicio.' };

  const { data, error } = await supabase
    .from('surf_camps')
    .insert({ ...f, school_id: school.id })
    .select('id')
    .single();

  if (error) {
    if (error.code === '23505') return { ok: false, error: 'Ese slug ya está usado.' };
    return { ok: false, error: error.message };
  }

  revalidatePath('/dashboard/camps');
  redirect(`/dashboard/camps/${data.id}`);
}

export async function updateCampAction(
  id: string,
  _prev: CampFormState,
  formData: FormData,
): Promise<CampFormState> {
  const supabase = await createClient();
  const f = campFieldsFrom(formData);

  if (!f.name) return { ok: false, error: 'El nombre es obligatorio.' };
  if (!f.starts_on || !f.ends_on) return { ok: false, error: 'Indica fecha de inicio y fin.' };
  if (new Date(f.ends_on) < new Date(f.starts_on)) return { ok: false, error: 'La fecha fin debe ser posterior al inicio.' };

  const { error } = await supabase.from('surf_camps').update(f).eq('id', id);
  if (error) {
    if (error.code === '23505') return { ok: false, error: 'Ese slug ya está usado.' };
    return { ok: false, error: error.message };
  }

  revalidatePath('/dashboard/camps');
  revalidatePath(`/dashboard/camps/${id}`);
  return { ok: true };
}

export async function deleteCampAction(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from('surf_camps').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/dashboard/camps');
  redirect('/dashboard/camps');
}

// ===================================
// Camp bookings
// ===================================
export async function createCampBookingAction(
  campId: string,
  _prev: CampBookingFormState,
  formData: FormData,
): Promise<CampBookingFormState> {
  const school = await resolveActiveSchool();
  const supabase = await createClient();

  const client_id = String(formData.get('client_id') ?? '').trim();
  const participants_count = Math.max(1, Math.min(50, Number(formData.get('participants_count')) || 1));
  const total_cents = eurosToCents(String(formData.get('total') ?? '0'));
  const paid_cents = eurosToCents(String(formData.get('paid') ?? '0'));
  const method = String(formData.get('method') ?? 'cash');
  const notes = String(formData.get('notes') ?? '').trim() || null;

  if (!client_id) return { ok: false, error: 'Selecciona un cliente.' };
  if (paid_cents > total_cents) return { ok: false, error: 'El importe pagado supera el total.' };

  // Decidir status inicial según lo pagado
  let status: 'pending' | 'deposit_paid' | 'fully_paid' = 'pending';
  if (paid_cents > 0 && paid_cents < total_cents) status = 'deposit_paid';
  else if (paid_cents === total_cents && total_cents > 0) status = 'fully_paid';

  const { data, error } = await supabase
    .from('camp_bookings')
    .insert({
      school_id: school.id,
      camp_id: campId,
      client_id,
      participants_count,
      total_cents,
      paid_cents,
      status,
      notes,
    })
    .select('id')
    .single();

  if (error) return { ok: false, error: error.message };

  if (paid_cents > 0) {
    await supabase.from('payments').insert({
      school_id: school.id,
      client_id,
      reference_type: 'camp_booking',
      reference_id: data.id,
      amount_cents: paid_cents,
      method,
      concept: 'Surf camp — pago inicial',
    });
  }

  revalidatePath(`/dashboard/camps/${campId}`);
  return { ok: true };
}

export async function setCampBookingStatusAction(
  bookingId: string,
  status: 'pending' | 'deposit_paid' | 'fully_paid' | 'cancelled' | 'refunded',
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from('camp_bookings').update({ status }).eq('id', bookingId);
  if (error) throw new Error(error.message);
  revalidatePath('/dashboard/camps');
}

export async function recordCampBookingPaymentAction(
  bookingId: string,
  _prev: CampBookingFormState,
  formData: FormData,
): Promise<CampBookingFormState> {
  const school = await resolveActiveSchool();
  const supabase = await createClient();

  const amount_cents = eurosToCents(String(formData.get('amount') ?? '0'));
  const method = String(formData.get('method') ?? 'cash');

  if (amount_cents <= 0) return { ok: false, error: 'Importe inválido.' };

  const { data: booking, error: fetchErr } = await supabase
    .from('camp_bookings')
    .select('id, client_id, paid_cents, total_cents')
    .eq('id', bookingId)
    .maybeSingle<{ id: string; client_id: string; paid_cents: number; total_cents: number }>();
  if (fetchErr || !booking) return { ok: false, error: 'Reserva no encontrada.' };

  const new_paid = booking.paid_cents + amount_cents;
  if (new_paid > booking.total_cents) return { ok: false, error: 'El nuevo total pagado supera el total de la reserva.' };

  const new_status = new_paid === booking.total_cents ? 'fully_paid' : 'deposit_paid';

  const { error: updErr } = await supabase
    .from('camp_bookings')
    .update({ paid_cents: new_paid, status: new_status })
    .eq('id', bookingId);
  if (updErr) return { ok: false, error: updErr.message };

  await supabase.from('payments').insert({
    school_id: school.id,
    client_id: booking.client_id,
    reference_type: 'camp_booking',
    reference_id: bookingId,
    amount_cents,
    method,
    concept: 'Surf camp — pago adicional',
  });

  revalidatePath('/dashboard/camps');
  return { ok: true };
}
