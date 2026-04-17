'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { resolveActiveSchool } from '@/lib/tenant-server';
import { slugify, eurosToCents } from '@/lib/slug';

// ==========================================
// Tipos compartidos
// ==========================================
export type ActivityFormState =
  | { ok: true; id?: string }
  | { ok: false; error: string }
  | null;

export type PackFormState =
  | { ok: true }
  | { ok: false; error: string }
  | null;

// ==========================================
// Helpers
// ==========================================
function parseBulletList(raw: string): string[] {
  return raw
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .slice(0, 40);
}

function activityFieldsFromForm(formData: FormData, nameForSlug?: string) {
  const name = String(formData.get('name') ?? '').trim();
  const rawSlug = String(formData.get('slug') ?? '').trim();
  const slug = slugify(rawSlug || nameForSlug || name);

  return {
    name,
    slug,
    type_key: String(formData.get('type_key') ?? 'grupal').trim().toLowerCase(),
    description: String(formData.get('description') ?? '').trim() || null,
    duration_minutes: Math.max(15, Math.min(600, Number(formData.get('duration_minutes')) || 60)),
    capacity: Math.max(1, Math.min(200, Number(formData.get('capacity')) || 8)),
    color: String(formData.get('color') ?? '#214a57'),
    pack_validity_days: Math.max(1, Math.min(3650, Number(formData.get('pack_validity_days')) || 180)),
    hero_image_url: String(formData.get('hero_image_url') ?? '').trim() || null,
    whats_included: parseBulletList(String(formData.get('whats_included') ?? '')),
    ideal_for: parseBulletList(String(formData.get('ideal_for') ?? '')),
    active: formData.get('active') === 'on',
  };
}

// ==========================================
// Activities
// ==========================================
export async function createActivityAction(
  _prev: ActivityFormState,
  formData: FormData,
): Promise<ActivityFormState> {
  const school = await resolveActiveSchool();
  const supabase = await createClient();
  const fields = activityFieldsFromForm(formData);

  if (!fields.name) return { ok: false, error: 'El nombre es obligatorio.' };
  if (!fields.slug) return { ok: false, error: 'El slug es obligatorio.' };

  const { data, error } = await supabase
    .from('activities')
    .insert({ ...fields, school_id: school.id })
    .select('id')
    .single();

  if (error) {
    if (error.code === '23505') return { ok: false, error: 'Ya existe una actividad con ese slug.' };
    return { ok: false, error: error.message };
  }

  revalidatePath('/dashboard/actividades');
  redirect(`/dashboard/actividades/${data.id}`);
}

export async function updateActivityAction(
  id: string,
  _prev: ActivityFormState,
  formData: FormData,
): Promise<ActivityFormState> {
  const supabase = await createClient();
  const fields = activityFieldsFromForm(formData);

  if (!fields.name) return { ok: false, error: 'El nombre es obligatorio.' };
  if (!fields.slug) return { ok: false, error: 'El slug es obligatorio.' };

  const { error } = await supabase.from('activities').update(fields).eq('id', id);
  if (error) {
    if (error.code === '23505') return { ok: false, error: 'Ese slug ya lo usa otra actividad.' };
    return { ok: false, error: error.message };
  }

  revalidatePath('/dashboard/actividades');
  revalidatePath(`/dashboard/actividades/${id}`);
  return { ok: true, id };
}

export async function deleteActivityAction(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from('activities').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/dashboard/actividades');
  redirect('/dashboard/actividades');
}

// ==========================================
// Activity packs (sub-recurso)
// ==========================================
export async function upsertPackAction(
  activityId: string,
  packId: string | null,
  _prev: PackFormState,
  formData: FormData,
): Promise<PackFormState> {
  const school = await resolveActiveSchool();
  const supabase = await createClient();

  const sessions = Math.max(1, Math.min(50, Number(formData.get('sessions')) || 1));
  const priceEuros = String(formData.get('price') ?? '0');
  const price_cents = eurosToCents(priceEuros);
  const featured = formData.get('featured') === 'on';

  if (price_cents < 0) return { ok: false, error: 'Precio inválido.' };

  const row = {
    school_id: school.id,
    activity_id: activityId,
    sessions,
    price_cents,
    featured,
  };

  const { error } = packId
    ? await supabase.from('activity_packs').update(row).eq('id', packId)
    : await supabase.from('activity_packs').insert(row);

  if (error) {
    if (error.code === '23505') return { ok: false, error: `Ya hay un pack de ${sessions} sesiones en esta actividad.` };
    return { ok: false, error: error.message };
  }

  revalidatePath(`/dashboard/actividades/${activityId}`);
  return { ok: true };
}

export async function deletePackAction(activityId: string, packId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from('activity_packs').delete().eq('id', packId);
  if (error) throw new Error(error.message);
  revalidatePath(`/dashboard/actividades/${activityId}`);
}
