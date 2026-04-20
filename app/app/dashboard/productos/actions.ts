'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { resolveActiveSchool } from '@/lib/tenant-server';
import { slugify } from '@/lib/slug';

export type ProductFormState =
  | { ok: true }
  | { ok: false; error: string }
  | null;

function toCents(raw: string): number {
  const n = parseFloat(raw.replace(',', '.'));
  if (!isFinite(n) || n < 0) return 0;
  return Math.round(n * 100);
}

function readFields(formData: FormData) {
  const name = String(formData.get('name') ?? '').trim();
  const rawSlug = String(formData.get('slug') ?? '').trim();
  const slug = rawSlug ? slugify(rawSlug) : slugify(name);
  return {
    name,
    slug,
    description: String(formData.get('description') ?? '').trim() || null,
    price_cents: toCents(String(formData.get('price_euros') ?? '0')),
    stock: Math.max(0, Math.round(Number(formData.get('stock')) || 0)),
    category: String(formData.get('category') ?? '').trim() || null,
    image_url: String(formData.get('image_url') ?? '').trim() || null,
    active: formData.get('active') !== 'off',
  };
}

export async function createProductAction(
  _prev: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const school = await resolveActiveSchool();
  const supabase = await createClient();

  const fields = readFields(formData);
  if (!fields.name) return { ok: false, error: 'El nombre es obligatorio.' };
  if (!fields.slug || fields.slug.length < 2) return { ok: false, error: 'Slug inválido.' };

  const { error, data } = await supabase
    .from('products')
    .insert({ school_id: school.id, ...fields })
    .select('id')
    .single();
  if (error) {
    if (error.code === '23505') return { ok: false, error: 'Ese slug ya existe en tu tienda.' };
    return { ok: false, error: error.message };
  }

  revalidatePath('/dashboard/productos');
  redirect(`/dashboard/productos/${data.id}`);
}

export async function updateProductAction(
  productId: string,
  _prev: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const supabase = await createClient();
  const fields = readFields(formData);
  if (!fields.name) return { ok: false, error: 'El nombre es obligatorio.' };

  const { error } = await supabase.from('products').update(fields).eq('id', productId);
  if (error) {
    if (error.code === '23505') return { ok: false, error: 'Ese slug ya existe en tu tienda.' };
    return { ok: false, error: error.message };
  }

  revalidatePath('/dashboard/productos');
  revalidatePath(`/dashboard/productos/${productId}`);
  return { ok: true };
}

export async function deleteProductAction(productId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from('products').delete().eq('id', productId);
  if (error) throw new Error(error.message);
  revalidatePath('/dashboard/productos');
  redirect('/dashboard/productos');
}
