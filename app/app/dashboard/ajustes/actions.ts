'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { resolveActiveSchool } from '@/lib/tenant-server';

export type SettingsFormState =
  | { ok: true }
  | { ok: false; error: string }
  | null;

export async function updateSchoolSettingsAction(
  _prev: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  const school = await resolveActiveSchool();
  const supabase = await createClient();

  const name = String(formData.get('name') ?? '').trim();
  if (!name) return { ok: false, error: 'El nombre es obligatorio.' };

  const update = {
    name,
    description: String(formData.get('description') ?? '').trim() || null,
    logo_url: String(formData.get('logo_url') ?? '').trim() || null,
    primary_color: String(formData.get('primary_color') ?? '#ffcc01'),
    contact_email: String(formData.get('contact_email') ?? '').trim() || null,
    contact_phone: String(formData.get('contact_phone') ?? '').trim() || null,
    address: String(formData.get('address') ?? '').trim() || null,
    city: String(formData.get('city') ?? '').trim() || null,
    timezone: String(formData.get('timezone') ?? 'Europe/Madrid'),
  };

  const { error } = await supabase.from('schools').update(update).eq('id', school.id);
  if (error) return { ok: false, error: error.message };

  revalidatePath('/dashboard/ajustes');
  revalidatePath('/dashboard');
  return { ok: true };
}
