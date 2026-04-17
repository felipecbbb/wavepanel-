import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from './supabase/server';

export type ActiveSchool = {
  id: string;
  slug: string;
  name: string;
  plan: string;
  trial_ends_at: string;
  stripe_status: string | null;
};

/**
 * Resuelve la school activa para este request.
 *
 * 1. Si el host es un subdominio del ROOT_DOMAIN (y no es vercel.app/localhost),
 *    usa el subdominio como slug.
 * 2. Si el request incluye `?tenant=slug` (path-based en vercel.app/localhost), usa eso.
 * 3. Si ninguno aplica, usa la primera school donde el user es miembro (default).
 *
 * Redirige a /login si no hay sesión.
 */
export async function resolveActiveSchool(searchTenant?: string | null): Promise<ActiveSchool> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const h = await headers();
  const host = (h.get('host') ?? '').toLowerCase();
  const rootDomain = (process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? '').toLowerCase();

  let slug: string | null = null;
  if (
    host &&
    rootDomain &&
    host.endsWith(`.${rootDomain}`) &&
    !rootDomain.endsWith('.vercel.app') &&
    !rootDomain.startsWith('localhost')
  ) {
    const sub = host.slice(0, host.length - rootDomain.length - 1);
    if (/^[a-z0-9][a-z0-9-]{1,48}[a-z0-9]$/.test(sub)) slug = sub;
  }
  slug = slug ?? searchTenant ?? null;

  if (slug) {
    const { data } = await supabase
      .from('schools')
      .select('id, slug, name, plan, trial_ends_at, stripe_status')
      .eq('slug', slug)
      .maybeSingle<ActiveSchool>();
    if (data) return data;
  }

  // Fallback: primera school del user
  const { data: firstMembership } = await supabase
    .from('school_members')
    .select('schools(id, slug, name, plan, trial_ends_at, stripe_status)')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle();

  const school = (firstMembership?.schools as unknown) as ActiveSchool | null;
  if (!school) redirect('/signup');
  return school;
}

export function daysUntil(date: string): number {
  return Math.max(0, Math.ceil((new Date(date).getTime() - Date.now()) / 86_400_000));
}
