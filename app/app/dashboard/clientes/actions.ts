'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { resolveActiveSchool } from '@/lib/tenant-server';

export type ClientFormState =
  | { ok: true }
  | { ok: false; error: string }
  | null;

export type FamilyFormState =
  | { ok: true }
  | { ok: false; error: string }
  | null;

function parseTags(raw: string): string[] {
  return raw
    .split(',')
    .map((t) => t.trim().toLowerCase())
    .filter((t) => t.length > 0 && t.length <= 40)
    .slice(0, 20);
}

function parseOptionalDate(raw: string): string | null {
  const v = raw.trim();
  return v ? v : null;
}

function parseOptionalBool(raw: string | null): boolean | null {
  if (raw === 'yes') return true;
  if (raw === 'no') return false;
  return null;
}

function clientFields(formData: FormData) {
  return {
    name: String(formData.get('name') ?? '').trim(),
    email: String(formData.get('email') ?? '').trim().toLowerCase() || null,
    phone: String(formData.get('phone') ?? '').trim() || null,
    notes: String(formData.get('notes') ?? '').trim() || null,
    tags: parseTags(String(formData.get('tags') ?? '')),
    birth_date: parseOptionalDate(String(formData.get('birth_date') ?? '')),
    can_swim: parseOptionalBool(String(formData.get('can_swim') ?? '') || null),
    has_injury: formData.get('has_injury') === 'on',
    injury_detail: String(formData.get('injury_detail') ?? '').trim() || null,
    wetsuit_size: String(formData.get('wetsuit_size') ?? '').trim() || null,
    address: String(formData.get('address') ?? '').trim() || null,
    city: String(formData.get('city') ?? '').trim() || null,
    postal_code: String(formData.get('postal_code') ?? '').trim() || null,
    country: String(formData.get('country') ?? '').trim() || null,
  };
}

export async function createClientAction(_prev: ClientFormState, formData: FormData): Promise<ClientFormState> {
  const school = await resolveActiveSchool();
  const supabase = await createClient();
  const fields = clientFields(formData);

  if (!fields.name) return { ok: false, error: 'El nombre es obligatorio.' };

  const { error, data } = await supabase
    .from('clients')
    .insert({ ...fields, school_id: school.id })
    .select('id')
    .single();

  if (error) return { ok: false, error: error.message };

  revalidatePath('/dashboard/clientes');
  redirect(`/dashboard/clientes/${data.id}`);
}

export async function updateClientAction(id: string, _prev: ClientFormState, formData: FormData): Promise<ClientFormState> {
  const supabase = await createClient();
  const fields = clientFields(formData);

  if (!fields.name) return { ok: false, error: 'El nombre es obligatorio.' };

  const { error } = await supabase.from('clients').update(fields).eq('id', id);
  if (error) return { ok: false, error: error.message };

  revalidatePath('/dashboard/clientes');
  revalidatePath(`/dashboard/clientes/${id}`);
  return { ok: true };
}

export async function deleteClientAction(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from('clients').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/dashboard/clientes');
  redirect('/dashboard/clientes');
}

// ========================================
// Family members (sub-perfiles del cliente)
// ========================================
function familyFields(clientId: string, schoolId: string, formData: FormData) {
  return {
    client_id: clientId,
    school_id: schoolId,
    full_name: String(formData.get('full_name') ?? '').trim(),
    birth_date: parseOptionalDate(String(formData.get('birth_date') ?? '')),
    level: String(formData.get('level') ?? '').trim() || null,
    notes: String(formData.get('notes') ?? '').trim() || null,
    can_swim: parseOptionalBool(String(formData.get('can_swim') ?? '') || null),
    has_injury: formData.get('has_injury') === 'on',
    injury_detail: String(formData.get('injury_detail') ?? '').trim() || null,
    wetsuit_size: String(formData.get('wetsuit_size') ?? '').trim() || null,
  };
}

export async function upsertFamilyMemberAction(
  clientId: string,
  memberId: string | null,
  _prev: FamilyFormState,
  formData: FormData,
): Promise<FamilyFormState> {
  const school = await resolveActiveSchool();
  const supabase = await createClient();
  const fields = familyFields(clientId, school.id, formData);

  if (!fields.full_name) return { ok: false, error: 'El nombre es obligatorio.' };

  const { error } = memberId
    ? await supabase.from('family_members').update(fields).eq('id', memberId)
    : await supabase.from('family_members').insert(fields);

  if (error) return { ok: false, error: error.message };
  revalidatePath(`/dashboard/clientes/${clientId}`);
  return { ok: true };
}

export async function deleteFamilyMemberAction(clientId: string, memberId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from('family_members').delete().eq('id', memberId);
  if (error) throw new Error(error.message);
  revalidatePath(`/dashboard/clientes/${clientId}`);
}
