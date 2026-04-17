import type { NextRequest } from 'next/server';

/**
 * Extrae el slug de tenant desde el host o query string.
 *
 * Producción (NEXT_PUBLIC_ROOT_DOMAIN=wavepanel.app):
 *   escuela.wavepanel.app → 'escuela'
 *   wavepanel.app, www.wavepanel.app, app.wavepanel.app → null (landing / rutas globales)
 *
 * Desarrollo (NEXT_PUBLIC_ROOT_DOMAIN=localhost:3000):
 *   escuela.localhost:3000 → 'escuela' (requiere /etc/hosts o Next.js dev config)
 *   localhost:3000?tenant=escuela → 'escuela' (fallback sin /etc/hosts)
 *   localhost:3000 → null
 */

const RESERVED_SUBDOMAINS = new Set(['www', 'app', 'api', 'admin', 'auth']);

/**
 * Host-based tenancy vs path/query-based tenancy.
 *
 * Subdominios solo activables cuando el ROOT_DOMAIN sea un dominio propio
 * (ej. wavepanel.app). En *.vercel.app no hay wildcard gratis, así que
 * caemos a path-based con ?tenant= (o cookie futura).
 */
export function usesSubdomainTenancy(rootDomain: string): boolean {
  const root = rootDomain.toLowerCase();
  if (root.startsWith('localhost')) return false;
  if (root.endsWith('.vercel.app')) return false;
  return true;
}

export function buildTenantUrl(rootDomain: string, slug: string, path = '/dashboard'): string {
  if (usesSubdomainTenancy(rootDomain)) {
    return `https://${slug}.${rootDomain}${path}`;
  }
  const separator = path.includes('?') ? '&' : '?';
  return `${path}${separator}tenant=${encodeURIComponent(slug)}`;
}

export function getTenantSlug(req: NextRequest): string | null {
  const host = req.headers.get('host') ?? '';
  const rootDomain = (process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'localhost:3000').toLowerCase();
  const normalizedHost = host.toLowerCase();

  if (normalizedHost === rootDomain || normalizedHost === `www.${rootDomain}`) {
    return req.nextUrl.searchParams.get('tenant');
  }

  if (normalizedHost.endsWith(`.${rootDomain}`)) {
    const sub = normalizedHost.slice(0, normalizedHost.length - rootDomain.length - 1);
    if (!sub || RESERVED_SUBDOMAINS.has(sub)) return null;
    if (!/^[a-z0-9][a-z0-9-]{1,48}[a-z0-9]$/.test(sub)) return null;
    return sub;
  }

  return req.nextUrl.searchParams.get('tenant');
}
