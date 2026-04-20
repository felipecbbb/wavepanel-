'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { resolveActiveSchool } from '@/lib/tenant-server';
import { combineDateAndTime } from '@/lib/dates';

export type ClassFormState =
  | { ok: true }
  | { ok: false; error: string }
  | null;

export type EnrollFormState =
  | { ok: true }
  | { ok: false; error: string }
  | null;

function computeEndsAt(startsAt: string, durationMinutes: number): string {
  const d = new Date(startsAt);
  d.setMinutes(d.getMinutes() + durationMinutes);
  return d.toISOString();
}

export async function createClassAction(
  _prev: ClassFormState,
  formData: FormData,
): Promise<ClassFormState> {
  const school = await resolveActiveSchool();
  const supabase = await createClient();

  const activity_id = String(formData.get('activity_id') ?? '').trim();
  const instructor_id = String(formData.get('instructor_id') ?? '').trim() || null;
  const date = String(formData.get('date') ?? '').trim();
  const time = String(formData.get('time') ?? '').trim();
  const duration = Number(formData.get('duration_minutes')) || 60;
  const max_students = Number(formData.get('max_students')) || 8;
  const level = String(formData.get('level') ?? '').trim() || null;
  const notes = String(formData.get('notes') ?? '').trim() || null;
  const published = formData.get('published') !== 'off';

  if (!activity_id) return { ok: false, error: 'Selecciona una actividad.' };
  if (!date || !time) return { ok: false, error: 'Indica fecha y hora.' };

  const starts_at = new Date(combineDateAndTime(date, time)).toISOString();
  const ends_at = computeEndsAt(starts_at, duration);

  const { error } = await supabase.from('surf_classes').insert({
    school_id: school.id,
    activity_id,
    instructor_id,
    starts_at,
    ends_at,
    max_students,
    level,
    notes,
    published,
  });

  if (error) return { ok: false, error: error.message };

  revalidatePath('/dashboard/calendario');
  return { ok: true };
}

export async function updateClassAction(
  classId: string,
  _prev: ClassFormState,
  formData: FormData,
): Promise<ClassFormState> {
  const supabase = await createClient();

  const date = String(formData.get('date') ?? '').trim();
  const time = String(formData.get('time') ?? '').trim();
  const duration = Number(formData.get('duration_minutes')) || 60;
  const max_students = Number(formData.get('max_students')) || 8;
  const instructor_id = String(formData.get('instructor_id') ?? '').trim() || null;
  const level = String(formData.get('level') ?? '').trim() || null;
  const notes = String(formData.get('notes') ?? '').trim() || null;
  const published = formData.get('published') !== 'off';

  if (!date || !time) return { ok: false, error: 'Indica fecha y hora.' };

  const starts_at = new Date(combineDateAndTime(date, time)).toISOString();
  const ends_at = computeEndsAt(starts_at, duration);

  const { error } = await supabase
    .from('surf_classes')
    .update({ starts_at, ends_at, max_students, instructor_id, level, notes, published })
    .eq('id', classId);

  if (error) return { ok: false, error: error.message };

  revalidatePath('/dashboard/calendario');
  return { ok: true };
}

export async function deleteClassAction(classId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from('surf_classes').delete().eq('id', classId);
  if (error) throw new Error(error.message);
  revalidatePath('/dashboard/calendario');
}

// Duplicar clase: crea una copia idéntica desplazada N días (default +7 para
// hacer clases semanales). No copia las inscripciones. Devuelve la nueva fecha
// para que el caller pueda redirigir al día correspondiente.
export async function duplicateClassAction(
  classId: string,
  daysOffset: number = 7,
): Promise<{ ok: true; date: string } | { ok: false; error: string }> {
  const school = await resolveActiveSchool();
  const supabase = await createClient();

  const { data: original, error: readErr } = await supabase
    .from('surf_classes')
    .select('activity_id, instructor_id, starts_at, ends_at, max_students, level, notes, published')
    .eq('id', classId)
    .eq('school_id', school.id)
    .maybeSingle();
  if (readErr) return { ok: false, error: readErr.message };
  if (!original) return { ok: false, error: 'Clase no encontrada.' };

  const shift = daysOffset * 86_400_000;
  const newStartsAt = new Date(new Date(original.starts_at).getTime() + shift).toISOString();
  const newEndsAt = new Date(new Date(original.ends_at).getTime() + shift).toISOString();

  const { error } = await supabase.from('surf_classes').insert({
    school_id: school.id,
    activity_id: original.activity_id,
    instructor_id: original.instructor_id,
    starts_at: newStartsAt,
    ends_at: newEndsAt,
    max_students: original.max_students,
    level: original.level,
    notes: original.notes,
    published: original.published,
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath('/dashboard/calendario');
  return { ok: true, date: newStartsAt.slice(0, 10) };
}

// ==========================================
// Inscripciones (class_enrollments)
// ==========================================

export async function enrollClientAction(
  classId: string,
  _prev: EnrollFormState,
  formData: FormData,
): Promise<EnrollFormState> {
  const supabase = await createClient();
  const client_id = String(formData.get('client_id') ?? '').trim();
  const family_member_id = String(formData.get('family_member_id') ?? '').trim() || null;
  const bono_id = String(formData.get('bono_id') ?? '').trim() || null;
  const price_euros = String(formData.get('price_euros') ?? '0').trim();
  const price_cents = Math.max(0, Math.round(parseFloat(price_euros || '0') * 100));
  const notes = String(formData.get('notes') ?? '').trim() || null;

  if (!client_id) return { ok: false, error: 'Selecciona un cliente.' };

  const { error } = await supabase.rpc('book_class', {
    p_class_id: classId,
    p_client_id: client_id,
    p_family_member_id: family_member_id,
    p_bono_id: bono_id,
    p_notes: notes,
    p_price_cents: price_cents,
  });

  if (error) {
    const friendly: Record<string, string> = {
      class_not_found: 'La clase ya no existe.',
      class_not_published: 'La clase no está publicada.',
      class_in_past: 'La clase ya ha pasado.',
      class_full: 'La clase está llena.',
      client_mismatch: 'El cliente no pertenece a esta escuela.',
      family_member_mismatch: 'Ese miembro no es de la familia del cliente.',
      already_enrolled: 'Ese cliente ya está inscrito en esta clase.',
      bono_not_found: 'El bono no existe.',
      bono_client_mismatch: 'El bono no es de este cliente.',
      bono_activity_mismatch: 'El bono es de otra actividad.',
      bono_not_active: 'El bono no está activo.',
      bono_expired: 'El bono ha caducado.',
      bono_exhausted: 'El bono no tiene créditos disponibles.',
    };
    const msg = friendly[error.message] ?? error.message;
    return { ok: false, error: msg };
  }

  revalidatePath('/dashboard/calendario');
  return { ok: true };
}

export async function cancelEnrollmentAction(enrollmentId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.rpc('cancel_enrollment', { p_enrollment_id: enrollmentId });
  if (error) throw new Error(error.message === 'cancel_too_late' ? 'Sólo puedes cancelar con más de 2h de antelación.' : error.message);
  revalidatePath('/dashboard/calendario');
}

export async function setEnrollmentStatusAction(enrollmentId: string, status: 'confirmed' | 'completed' | 'no_show'): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from('class_enrollments').update({ status }).eq('id', enrollmentId);
  if (error) throw new Error(error.message);
  revalidatePath('/dashboard/calendario');
}

export async function moveEnrollmentAction(
  enrollmentId: string,
  targetClassId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();
  const { error } = await supabase.rpc('move_enrollment', {
    p_enrollment_id: enrollmentId,
    p_target_class_id: targetClassId,
  });
  if (error) {
    const friendly: Record<string, string> = {
      not_authorized: 'No tienes acceso a esta escuela.',
      enrollment_not_found: 'La inscripción ya no existe.',
      target_class_not_found: 'La clase destino no existe.',
      activity_mismatch: 'No se puede mover: la clase destino es de otra actividad.',
      target_class_in_past: 'La clase destino ya ha pasado.',
      target_class_full: 'La clase destino está llena.',
      already_enrolled_in_target: 'El alumno ya estaba en la clase destino.',
    };
    return { ok: false, error: friendly[error.message] ?? error.message };
  }
  revalidatePath('/dashboard/calendario');
  return { ok: true };
}
