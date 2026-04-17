'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { resolveActiveSchool } from '@/lib/tenant-server';

export type SellBonoState =
  | { ok: true; bonoId: string }
  | { ok: false; error: string }
  | null;

export async function sellBonoAction(
  clientId: string,
  _prev: SellBonoState,
  formData: FormData,
): Promise<SellBonoState> {
  const school = await resolveActiveSchool();
  const supabase = await createClient();

  const pack_id = String(formData.get('pack_id') ?? '').trim();
  if (!pack_id) return { ok: false, error: 'Selecciona un pack.' };

  // Snapshot del pack (precio y sesiones) + validez de la actividad
  const { data: pack, error: packErr } = await supabase
    .from('activity_packs')
    .select('id, activity_id, sessions, price_cents')
    .eq('id', pack_id)
    .maybeSingle<{ id: string; activity_id: string; sessions: number; price_cents: number }>();
  if (packErr || !pack) return { ok: false, error: 'Pack no encontrado.' };

  const { data: activity, error: actErr } = await supabase
    .from('activities')
    .select('pack_validity_days')
    .eq('id', pack.activity_id)
    .maybeSingle<{ pack_validity_days: number }>();
  if (actErr || !activity) return { ok: false, error: 'Actividad no encontrada.' };

  const expires_at = new Date(
    Date.now() + activity.pack_validity_days * 86_400_000,
  ).toISOString();

  const { data: bono, error } = await supabase
    .from('bonos')
    .insert({
      school_id: school.id,
      client_id: clientId,
      activity_id: pack.activity_id,
      pack_id: pack.id,
      total_credits: pack.sessions,
      price_cents: pack.price_cents,
      expires_at,
      status: 'active',
    })
    .select('id')
    .single();

  if (error) return { ok: false, error: error.message };

  // Crear pago asociado (método por defecto 'cash'; se puede editar luego)
  await supabase.from('payments').insert({
    school_id: school.id,
    client_id: clientId,
    reference_type: 'bono',
    reference_id: bono.id,
    amount_cents: pack.price_cents,
    method: String(formData.get('method') ?? 'cash'),
    concept: `Bono de ${pack.sessions} sesiones`,
  });

  revalidatePath(`/dashboard/clientes/${clientId}`);
  revalidatePath('/dashboard/bonos');
  return { ok: true, bonoId: bono.id };
}

export async function cancelBonoAction(bonoId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from('bonos').update({ status: 'cancelled' }).eq('id', bonoId);
  if (error) throw new Error(error.message);
  revalidatePath('/dashboard/bonos');
}
