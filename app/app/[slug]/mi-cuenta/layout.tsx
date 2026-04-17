import { redirect } from 'next/navigation';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

type Tenant = { id: string; slug: string; name: string; primary_color: string };

export default async function MiCuentaLayout({
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
    .select('id, slug, name, primary_color')
    .eq('slug', slug)
    .maybeSingle<Tenant>();
  if (!tenant) notFound();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${slug}/auth/login`);

  // Asegurar que existe ficha de cliente para este user en esta school. Si el
  // user hizo signup en OTRA school, register_client_for_school vinculará/creará
  // una ficha nueva para este tenant.
  await supabase.rpc('register_client_for_school', {
    p_school_slug: slug,
    p_name: user.email?.split('@')[0] ?? 'Cliente',
    p_phone: null,
  });

  return <>{children}</>;
}
