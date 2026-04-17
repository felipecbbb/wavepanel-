import { createClient } from '@/lib/supabase/server';
import { resolveActiveSchool } from '@/lib/tenant-server';
import SettingsForm from './settings-form';

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

export default async function AjustesPage() {
  const school = await resolveActiveSchool();
  const supabase = await createClient();

  const { data } = await supabase
    .from('schools')
    .select('id, name, slug, plan, description, logo_url, primary_color, contact_email, contact_phone, address, city, timezone')
    .eq('id', school.id)
    .maybeSingle<SchoolSettings>();

  if (!data) return null;

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
    </div>
  );
}
