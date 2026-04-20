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

// =======================================================
// Integraciones: Stripe + Resend
// =======================================================

export type IntegrationsFormState =
  | { ok: true }
  | { ok: false; error: string }
  | null;

function optional(value: FormDataEntryValue | null): string | null {
  const v = String(value ?? '').trim();
  return v.length === 0 ? null : v;
}

// Si el usuario envía la máscara de lectura (••••••••) respetamos el valor ya
// guardado en BD. Evita tener que repegar las keys cada vez que el admin toca
// otro campo del formulario.
const MASK = '••••••••';

export async function updateStripeIntegrationAction(
  _prev: IntegrationsFormState,
  formData: FormData,
): Promise<IntegrationsFormState> {
  const school = await resolveActiveSchool();
  const supabase = await createClient();

  const publishable = optional(formData.get('stripe_publishable_key'));
  const secret = optional(formData.get('stripe_secret_key'));
  const webhook = optional(formData.get('stripe_webhook_secret'));

  const { data: existing } = await supabase
    .from('school_integrations')
    .select('stripe_publishable_key, stripe_secret_key, stripe_webhook_secret')
    .eq('school_id', school.id)
    .maybeSingle();

  const payload = {
    school_id: school.id,
    stripe_publishable_key:
      publishable === MASK ? existing?.stripe_publishable_key ?? null : publishable,
    stripe_secret_key: secret === MASK ? existing?.stripe_secret_key ?? null : secret,
    stripe_webhook_secret:
      webhook === MASK ? existing?.stripe_webhook_secret ?? null : webhook,
  };

  if ((payload.stripe_publishable_key && !payload.stripe_secret_key) ||
      (!payload.stripe_publishable_key && payload.stripe_secret_key)) {
    return { ok: false, error: 'Rellena pk_ y sk_ juntas o déjalas ambas vacías.' };
  }
  if (payload.stripe_publishable_key && !payload.stripe_publishable_key.startsWith('pk_')) {
    return { ok: false, error: 'La publishable key debe empezar por pk_live_ o pk_test_.' };
  }
  if (payload.stripe_secret_key && !payload.stripe_secret_key.startsWith('sk_')) {
    return { ok: false, error: 'La secret key debe empezar por sk_live_ o sk_test_.' };
  }

  const { error } = await supabase.from('school_integrations').upsert(payload);
  if (error) return { ok: false, error: error.message };

  revalidatePath('/dashboard/ajustes');
  return { ok: true };
}

export async function updateResendIntegrationAction(
  _prev: IntegrationsFormState,
  formData: FormData,
): Promise<IntegrationsFormState> {
  const school = await resolveActiveSchool();
  const supabase = await createClient();

  const apiKey = optional(formData.get('resend_api_key'));
  const fromAddress = optional(formData.get('email_from_address'));
  const fromName = optional(formData.get('email_from_name'));
  const replyTo = optional(formData.get('email_reply_to'));

  const { data: existing } = await supabase
    .from('school_integrations')
    .select('resend_api_key')
    .eq('school_id', school.id)
    .maybeSingle();

  const effectiveApiKey = apiKey === MASK ? existing?.resend_api_key ?? null : apiKey;

  if (effectiveApiKey && !effectiveApiKey.startsWith('re_')) {
    return { ok: false, error: 'La API key de Resend empieza por re_.' };
  }
  if (fromAddress && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fromAddress)) {
    return { ok: false, error: 'Email "from" no parece válido.' };
  }
  if (replyTo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(replyTo)) {
    return { ok: false, error: 'Email "reply-to" no parece válido.' };
  }

  const { error } = await supabase.from('school_integrations').upsert({
    school_id: school.id,
    resend_api_key: effectiveApiKey,
    email_from_address: fromAddress,
    email_from_name: fromName,
    email_reply_to: replyTo,
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath('/dashboard/ajustes');
  return { ok: true };
}
