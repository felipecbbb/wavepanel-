'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export type ReserveState =
  | { ok: true }
  | { ok: false; error: string }
  | null;

export async function reserveClassAction(
  schoolSlug: string,
  classId: string,
  _prev: ReserveState,
  formData: FormData,
): Promise<ReserveState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'Inicia sesión.' };

  const { data: school } = await supabase.from('schools').select('id').eq('slug', schoolSlug).maybeSingle<{ id: string }>();
  if (!school) return { ok: false, error: 'Escuela no encontrada.' };

  const { data: client } = await supabase
    .from('clients')
    .select('id')
    .eq('school_id', school.id)
    .eq('auth_user_id', user.id)
    .maybeSingle<{ id: string }>();
  if (!client) return { ok: false, error: 'Ficha de cliente no encontrada.' };

  const bono_id = String(formData.get('bono_id') ?? '').trim() || null;
  const family_member_id = String(formData.get('family_member_id') ?? '').trim() || null;

  const { error } = await supabase.rpc('book_class', {
    p_class_id: classId,
    p_client_id: client.id,
    p_family_member_id: family_member_id,
    p_bono_id: bono_id,
    p_notes: null,
    p_price_cents: 0,
  });

  if (error) {
    const friendly: Record<string, string> = {
      class_not_found: 'La clase ya no existe.',
      class_not_published: 'La clase no está publicada.',
      class_in_past: 'La clase ya ha empezado.',
      class_full: 'La clase está completa.',
      bono_not_found: 'Ese bono no existe.',
      bono_client_mismatch: 'Ese bono no es tuyo.',
      bono_activity_mismatch: 'El bono no sirve para esta actividad.',
      bono_not_active: 'El bono no está activo.',
      bono_expired: 'El bono ha caducado.',
      bono_exhausted: 'El bono no tiene sesiones disponibles.',
      family_member_mismatch: 'Ese miembro no está en tu familia.',
    };
    return { ok: false, error: friendly[error.message] ?? error.message };
  }

  revalidatePath(`/${schoolSlug}/mi-cuenta`);
  revalidatePath(`/${schoolSlug}/calendario`);
  redirect(`/${schoolSlug}/mi-cuenta?reservada=1`);
}
