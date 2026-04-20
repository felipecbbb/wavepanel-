'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { resolveActiveSchool } from '@/lib/tenant-server';

export type EquipmentFormState =
  | { ok: true }
  | { ok: false; error: string }
  | null;

export type RentalFormState =
  | { ok: true }
  | { ok: false; error: string }
  | null;

function toCents(raw: string): number {
  const n = parseFloat(raw.replace(',', '.'));
  if (!isFinite(n) || n < 0) return 0;
  return Math.round(n * 100);
}

function readEquipmentFields(formData: FormData) {
  return {
    name: String(formData.get('name') ?? '').trim(),
    category: String(formData.get('category') ?? 'other'),
    size: String(formData.get('size') ?? '').trim() || null,
    stock: Math.max(0, Math.round(Number(formData.get('stock')) || 0)),
    price_per_day_cents: toCents(String(formData.get('price_per_day_euros') ?? '0')),
    notes: String(formData.get('notes') ?? '').trim() || null,
    active: formData.get('active') !== 'off',
  };
}

export async function createEquipmentAction(
  _prev: EquipmentFormState,
  formData: FormData,
): Promise<EquipmentFormState> {
  const school = await resolveActiveSchool();
  const supabase = await createClient();

  const fields = readEquipmentFields(formData);
  if (!fields.name) return { ok: false, error: 'El nombre es obligatorio.' };

  const { error } = await supabase.from('rental_equipment').insert({
    school_id: school.id,
    ...fields,
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath('/dashboard/material');
  return { ok: true };
}

export async function updateEquipmentAction(
  equipmentId: string,
  _prev: EquipmentFormState,
  formData: FormData,
): Promise<EquipmentFormState> {
  const supabase = await createClient();
  const fields = readEquipmentFields(formData);
  if (!fields.name) return { ok: false, error: 'El nombre es obligatorio.' };

  const { error } = await supabase.from('rental_equipment').update(fields).eq('id', equipmentId);
  if (error) return { ok: false, error: error.message };

  revalidatePath('/dashboard/material');
  return { ok: true };
}

export async function deleteEquipmentAction(equipmentId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from('rental_equipment').delete().eq('id', equipmentId);
  if (error) throw new Error(error.message);
  revalidatePath('/dashboard/material');
}

export async function createRentalAction(
  _prev: RentalFormState,
  formData: FormData,
): Promise<RentalFormState> {
  const school = await resolveActiveSchool();
  const supabase = await createClient();

  const equipment_id = String(formData.get('equipment_id') ?? '').trim();
  const client_id = String(formData.get('client_id') ?? '').trim() || null;
  const client_name_snapshot = String(formData.get('client_name_snapshot') ?? '').trim() || null;
  const starts_on = String(formData.get('starts_on') ?? '').trim();
  const ends_on = String(formData.get('ends_on') ?? '').trim();
  const quantity = Math.max(1, Math.round(Number(formData.get('quantity')) || 1));
  const paid_euros = String(formData.get('paid_euros') ?? '0');
  const paid_cents = toCents(paid_euros);

  if (!equipment_id) return { ok: false, error: 'Selecciona un material.' };
  if (!starts_on || !ends_on) return { ok: false, error: 'Indica fechas de inicio y fin.' };
  if (ends_on < starts_on) return { ok: false, error: 'La fecha de fin debe ser igual o posterior a la de inicio.' };
  if (!client_id && !client_name_snapshot) {
    return { ok: false, error: 'Selecciona un cliente o escribe un nombre.' };
  }

  const { data: eq } = await supabase
    .from('rental_equipment')
    .select('price_per_day_cents')
    .eq('id', equipment_id)
    .maybeSingle<{ price_per_day_cents: number }>();
  if (!eq) return { ok: false, error: 'Material no encontrado.' };

  const days = Math.max(1, Math.round((new Date(ends_on).getTime() - new Date(starts_on).getTime()) / 86_400_000) + 1);
  const total_cents = eq.price_per_day_cents * days * quantity;

  const { error } = await supabase.from('rentals').insert({
    school_id: school.id,
    client_id,
    client_name_snapshot,
    equipment_id,
    starts_on,
    ends_on,
    quantity,
    total_cents,
    paid_cents,
    status: 'reserved',
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath('/dashboard/material');
  return { ok: true };
}

export async function setRentalStatusAction(
  rentalId: string,
  status: 'reserved' | 'active' | 'returned' | 'cancelled',
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from('rentals').update({ status }).eq('id', rentalId);
  if (error) throw new Error(error.message);
  revalidatePath('/dashboard/material');
}

export async function deleteRentalAction(rentalId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from('rentals').delete().eq('id', rentalId);
  if (error) throw new Error(error.message);
  revalidatePath('/dashboard/material');
  redirect('/dashboard/material');
}
