'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export type AuthState =
  | { ok: true; needsEmailConfirm: true }
  | { ok: false; error: string }
  | null;

export async function signupStudentAction(
  schoolSlug: string,
  next: string,
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');
  const name = String(formData.get('name') ?? '').trim();
  const phone = String(formData.get('phone') ?? '').trim() || null;

  if (!email || !password || !name) return { ok: false, error: 'Completa nombre, email y contraseña.' };
  if (password.length < 8) return { ok: false, error: 'La contraseña debe tener al menos 8 caracteres.' };

  const supabase = await createClient();
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email, password });
  if (signUpError) return { ok: false, error: signUpError.message };

  if (!signUpData.session) {
    // Confirm email requerido — el cliente confirmará y luego se vincula en el login o al recuperar sesión.
    return { ok: true, needsEmailConfirm: true };
  }

  const { error: rpcError } = await supabase.rpc('register_client_for_school', {
    p_school_slug: schoolSlug,
    p_name: name,
    p_phone: phone,
  });

  if (rpcError) {
    const friendly: Record<string, string> = {
      school_not_found: 'Esta escuela no existe.',
    };
    return { ok: false, error: friendly[rpcError.message] ?? rpcError.message };
  }

  redirect(`/${schoolSlug}${next}`);
}

export async function loginStudentAction(
  schoolSlug: string,
  next: string,
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');
  if (!email || !password) return { ok: false, error: 'Completa email y contraseña.' };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, error: error.message };

  // Si el user no está aún vinculado como cliente en esta school (ej. creó cuenta
  // en otra escuela del mismo WavePanel), lo registramos silenciosamente.
  await supabase.rpc('register_client_for_school', {
    p_school_slug: schoolSlug,
    p_name: email.split('@')[0],
    p_phone: null,
  });

  redirect(`/${schoolSlug}${next}`);
}

export async function logoutStudentAction(schoolSlug: string): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect(`/${schoolSlug}`);
}
