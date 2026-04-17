'use server';

import { createClient } from '@/lib/supabase/server';

export type SignupState =
  | { ok: true; slug: string; needsEmailConfirm: boolean }
  | { ok: false; error: string };

function slugify(raw: string): string {
  return raw
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50);
}

export async function signupAction(_prev: SignupState | null, formData: FormData): Promise<SignupState> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');
  const schoolName = String(formData.get('schoolName') ?? '').trim();
  const rawSlug = String(formData.get('slug') ?? '').trim() || schoolName;
  const slug = slugify(rawSlug);

  if (!email || !password || !schoolName) {
    return { ok: false, error: 'Completa todos los campos.' };
  }
  if (password.length < 8) {
    return { ok: false, error: 'La contraseña debe tener al menos 8 caracteres.' };
  }
  if (slug.length < 3) {
    return { ok: false, error: 'El slug debe tener al menos 3 caracteres.' };
  }

  const supabase = await createClient();

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { school_name: schoolName, school_slug: slug } },
  });

  if (signUpError) {
    return { ok: false, error: signUpError.message };
  }

  const needsEmailConfirm = !signUpData.session;

  if (!needsEmailConfirm) {
    const { error: rpcError } = await supabase.rpc('create_school_with_owner', {
      p_slug: slug,
      p_name: schoolName,
    });
    if (rpcError) {
      return {
        ok: false,
        error:
          rpcError.code === '23505'
            ? 'Ese subdominio ya está ocupado. Prueba otro.'
            : rpcError.message,
      };
    }
  }

  return { ok: true, slug, needsEmailConfirm };
}
