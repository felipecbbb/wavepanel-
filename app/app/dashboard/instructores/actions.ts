'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { resolveActiveSchool } from '@/lib/tenant-server';

export type InstructorFormState =
  | { ok: true }
  | { ok: false; error: string }
  | null;

function fieldsFrom(formData: FormData) {
  return {
    name: String(formData.get('name') ?? '').trim(),
    email: String(formData.get('email') ?? '').trim().toLowerCase() || null,
    phone: String(formData.get('phone') ?? '').trim() || null,
    color: String(formData.get('color') ?? '#FFCC01'),
    active: formData.get('active') === 'on',
  };
}

export async function createInstructorAction(
  _prev: InstructorFormState,
  formData: FormData,
): Promise<InstructorFormState> {
  const school = await resolveActiveSchool();
  const supabase = await createClient();
  const f = fieldsFrom(formData);

  if (!f.name) return { ok: false, error: 'El nombre es obligatorio.' };

  const { data, error } = await supabase
    .from('instructors')
    .insert({ ...f, school_id: school.id })
    .select('id')
    .single();

  if (error) return { ok: false, error: error.message };

  revalidatePath('/dashboard/instructores');
  redirect(`/dashboard/instructores/${data.id}`);
}

export async function updateInstructorAction(
  id: string,
  _prev: InstructorFormState,
  formData: FormData,
): Promise<InstructorFormState> {
  const supabase = await createClient();
  const f = fieldsFrom(formData);

  if (!f.name) return { ok: false, error: 'El nombre es obligatorio.' };

  const { error } = await supabase.from('instructors').update(f).eq('id', id);
  if (error) return { ok: false, error: error.message };

  revalidatePath('/dashboard/instructores');
  revalidatePath(`/dashboard/instructores/${id}`);
  return { ok: true };
}

export async function deleteInstructorAction(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from('instructors').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/dashboard/instructores');
  redirect('/dashboard/instructores');
}
