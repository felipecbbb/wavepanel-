import { createClient } from '@/lib/supabase/server';
import { resolveActiveSchool } from '@/lib/tenant-server';
import SettingsForm from './settings-form';
import { StripeSettingsForm, ResendSettingsForm } from './integrations-forms';

type SchoolSettings = {
  id: string;
  name: string;
  slug: string;
  plan: string;
  description: string | null;
  logo_url: string | null;
  primary_color: string;
  contact_email: string | null;
  contact_phone: string | null;
  address: string | null;
  city: string | null;
  timezone: string;
};

type Integrations = {
  stripe_publishable_key: string | null;
  stripe_secret_key: string | null;
  stripe_webhook_secret: string | null;
  resend_api_key: string | null;
  email_from_address: string | null;
  email_from_name: string | null;
  email_reply_to: string | null;
};

const EMPTY_INTEGRATIONS: Integrations = {
  stripe_publishable_key: null,
  stripe_secret_key: null,
  stripe_webhook_secret: null,
  resend_api_key: null,
  email_from_address: null,
  email_from_name: null,
  email_reply_to: null,
};

export default async function AjustesPage() {
  const school = await resolveActiveSchool();
  const supabase = await createClient();

  const [{ data }, { data: integrations }] = await Promise.all([
    supabase
      .from('schools')
      .select('id, name, slug, plan, description, logo_url, primary_color, contact_email, contact_phone, address, city, timezone')
      .eq('id', school.id)
      .maybeSingle<SchoolSettings>(),
    supabase
      .from('school_integrations')
      .select('stripe_publishable_key, stripe_secret_key, stripe_webhook_secret, resend_api_key, email_from_address, email_from_name, email_reply_to')
      .eq('school_id', school.id)
      .maybeSingle<Integrations>(),
  ]);

  if (!data) return null;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const stripeWebhookUrl = supabaseUrl
    ? `${supabaseUrl}/functions/v1/stripe-webhook?school=${school.slug}`
    : `https://TU-SUPABASE.supabase.co/functions/v1/stripe-webhook?school=${school.slug}`;

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-10">
      <header className="mb-8">
        <p className="kicker mb-2">Ajustes</p>
        <h1 className="font-display text-4xl text-navy">Tu escuela.</h1>
        <p className="mt-2 text-muted text-sm">
          Plan <strong className="text-navy">{data.plan}</strong> · Subdominio{' '}
          <code className="text-xs bg-sand px-1.5 py-0.5 rounded-sm">{data.slug}.wavepanel.app</code>
        </p>
      </header>

      <section className="mb-12">
        <SettingsForm
          initial={{
            name: data.name,
            description: data.description,
            logo_url: data.logo_url,
            primary_color: data.primary_color,
            contact_email: data.contact_email,
            contact_phone: data.contact_phone,
            address: data.address,
            city: data.city,
            timezone: data.timezone,
          }}
        />
      </section>

      <section className="mb-12 rounded-md border border-line bg-paper p-6">
        <StripeSettingsForm initial={integrations ?? EMPTY_INTEGRATIONS} webhookUrl={stripeWebhookUrl} />
      </section>

      <section className="rounded-md border border-line bg-paper p-6">
        <ResendSettingsForm initial={integrations ?? EMPTY_INTEGRATIONS} />
      </section>
    </div>
  );
}
