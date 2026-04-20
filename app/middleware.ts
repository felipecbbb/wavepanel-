import { NextRequest, NextResponse } from 'next/server';
import { getTenantSlug, usesSubdomainTenancy } from '@/lib/tenant';

/**
 * Middleware: resuelve tenants por subdominio cuando el ROOT_DOMAIN es un
 * dominio propio (ej. wavepanel.app).
 *
 * Reglas:
 *   - `wavepanel.app`, `www.wavepanel.app`, `app.wavepanel.app` → sin rewrite.
 *     Ven la landing estática, /signup, /login, /dashboard, /docs/*.
 *   - `escuela.wavepanel.app/<ruta>` → rewrite interno a `/<slug>/<ruta>`
 *     que resuelve la página pública del tenant.
 *   - En *.vercel.app y localhost, no hay wildcard DNS barato; caemos a
 *     path-based con `?tenant=slug` (ya usado por /dashboard).
 *
 * El middleware NO aplica a rutas que empiecen por /_next, /api, /dashboard,
 * /signup, /login ni a archivos estáticos — están excluidas vía `matcher`.
 */

// Rutas que viven sólo en el dominio raíz y no se tenant-rewritean.
// Si el user está en un subdominio de tenant y pide una de estas rutas,
// redirigimos al dominio raíz para evitar colisiones.
const ROOT_ONLY_PATHS = ['/dashboard', '/signup', '/login', '/api'];

export async function middleware(req: NextRequest) {
  const host = (req.headers.get('host') ?? '').toLowerCase();
  const rootDomain = (process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? '').toLowerCase();
  const { pathname, search } = req.nextUrl;

  if (!rootDomain || !usesSubdomainTenancy(rootDomain)) {
    return NextResponse.next();
  }

  const slug = getTenantSlug(req);
  if (!slug) return NextResponse.next();

  // Si alguien intenta ir a /dashboard desde escuela.wavepanel.app, lo
  // mandamos a la raíz para que se loguee como admin allí.
  if (ROOT_ONLY_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    const url = req.nextUrl.clone();
    url.host = rootDomain;
    url.hostname = rootDomain;
    url.port = '';
    url.protocol = 'https:';
    return NextResponse.redirect(url);
  }

  // Evita doble rewrite si el path ya empieza por el slug.
  if (pathname === `/${slug}` || pathname.startsWith(`/${slug}/`)) {
    return NextResponse.next();
  }

  // Rewrite a /[slug]/<pathname>
  const url = req.nextUrl.clone();
  url.pathname = `/${slug}${pathname === '/' ? '' : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: [
    /*
     * Excluye:
     * - /_next/ (bundles, image opt, etc.)
     * - /api/ (route handlers — siempre en root domain)
     * - archivos con extensión (.html, .jpg, .svg, etc.)
     * - favicon/robots/sitemap
     */
    '/((?!_next/|api/|.*\\.[a-zA-Z0-9]+$|favicon\\.ico|robots\\.txt|sitemap\\.xml).*)',
  ],
};
