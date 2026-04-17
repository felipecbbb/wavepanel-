'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { resolveActiveSchool } from '@/lib/tenant-server';

export type ClientFormState =
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

function sharedFields(formData: FormData) {
  return {
    name: String(formData.get('name') ?? '').trim(),
    email: String(formData.get('email') ?? '').trim().toLowerCase() || null,
    phone: String(formData.get('phone') ?? '').trim() || null,
    notes: String(formData.get('notes') ?? '').trim() || null,
    tags: parseTags(String(formData.get('tags') ?? '')),
  };
}

export async function createClientAction(_prev: ClientFormState, formData: FormData): Promise<ClientFormState> {
  const school = await resolveActiveSchool();
  const supabase = await createClient();
  const fields = sharedFields(formData);

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
  const fields = sharedFields(formData);

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
