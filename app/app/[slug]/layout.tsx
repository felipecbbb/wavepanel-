import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { TenantHeader } from './tenant-header';
import { TenantFooter } from './tenant-footer';

type Tenant = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  primary_color: string;
  contact_email: string | null;
  contact_phone: string | null;
  address: string | null;
  city: string | null;
};

export default async function TenantLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: tenant } = await supabase
    .from('schools')
    .select('id, slug, name, description, logo_url, primary_color, contact_email, contact_phone, address, city')
    .eq('slug', slug)
    .maybeSingle<Tenant>();

  if (!tenant) notFound();

  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div
      className="min-h-screen flex flex-col bg-bg"
      style={{ ['--tenant-color' as string]: tenant.primary_color }}
    >
      <TenantHeader tenant={tenant} isLoggedIn={!!user} />
      <main className="flex-1">{children}</main>
      <TenantFooter tenant={tenant} />
    </div>
  );
}
