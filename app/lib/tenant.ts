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
