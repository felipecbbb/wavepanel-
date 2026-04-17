'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { resolveActiveSchool } from '@/lib/tenant-server';
import { eurosToCents } from '@/lib/slug';

export type CouponFormState =
  | { ok: true }
  | { ok: false; error: string }
  | null;

function couponFieldsFrom(formData: FormData) {
  const discount_type = String(formData.get('discount_type') ?? 'percentage');
  let discount_value = 0;
  if (discount_type === 'percentage') {
    discount_value = Math.max(0, Math.min(100, Number(formData.get('discount_value')) || 0));
  } else {
    discount_value = eurosToCents(String(formData.get('discount_value') ?? '0'));
  }

  return {
    code: String(formData.get('code') ?? '').trim().toUpperCase(),
    name: String(formData.get('name') ?? '').trim() || null,
    discount_type,
    discount_value,
    applies_to: String(formData.get('applies_to') ?? 'all'),
    activity_id: String(formData.get('activity_id') ?? '').trim() || null,
    camp_id: String(formData.get('camp_id') ?? '').trim() || null,
    min_amount_cents: eurosToCents(String(formData.get('min_amount') ?? '0')),
    max_uses: formData.get('max_uses') ? Number(formData.get('max_uses')) : null,
    max_uses_per_user: formData.get('max_uses_per_user') ? Number(formData.get('max_uses_per_user')) : null,
    starts_at: String(formData.get('starts_at') ?? '').trim() || null,
    expires_at: String(formData.get('expires_at') ?? '').trim() || null,
    active: formData.get('active') === 'on',
  };
}

export async function createCouponAction(_prev: CouponFormState, formData: FormData): Promise<CouponFormState> {
  const school = await resolveActiveSchool();
  const supabase = await createClient();
  const f = couponFieldsFrom(formData);

  if (!f.code) return { ok: false, error: 'El código es obligatorio.' };

  const { data, error } = await supabase
    .from('coupons')
    .insert({ ...f, school_id: school.id })
    .select('id')
    .single();

  if (error) {
    if (error.code === '23505') return { ok: false, error: 'Ya existe un cupón con ese código.' };
    return { ok: false, error: error.message };
  }

  revalidatePath('/dashboard/cupones');
  redirect(`/dashboard/cupones/${data.id}`);
}

export async function updateCouponAction(id: string, _prev: CouponFormState, formData: FormData): Promise<CouponFormState> {
  const supabase = await createClient();
  const f = couponFieldsFrom(formData);

  if (!f.code) return { ok: false, error: 'El código es obligatorio.' };

  const { error } = await supabase.from('coupons').update(f).eq('id', id);
  if (error) {
    if (error.code === '23505') return { ok: false, error: 'Ya existe un cupón con ese código.' };
    return { ok: false, error: error.message };
  }

  revalidatePath('/dashboard/cupones');
  revalidatePath(`/dashboard/cupones/${id}`);
  return { ok: true };
}

export async function deleteCouponAction(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from('coupons').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/dashboard/cupones');
  redirect('/dashboard/cupones');
}
