import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { getTenantSlug } from './lib/tenant';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Refresca la sesión para que los Server Components la lean fresca.
  const { data: { user } } = await supabase.auth.getUser();

  const slug = getTenantSlug(request);
  if (slug) {
    response.headers.set('x-tenant-slug', slug);
  }

  const { pathname } = request.nextUrl;

  // Rutas protegidas: /dashboard/* requiere sesión y tenant válido.
  if (pathname.startsWith('/dashboard')) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('next', pathname);
      return NextResponse.redirect(url);
    }
    if (!slug) {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const runtime = 'nodejs';

export const config = {
  matcher: [
    /*
     * Excluye assets estáticos, HTML estático de la landing (public/*.html)
     * y favicons. El middleware SÍ corre en rutas dinámicas de Next.js
     * (signup, login, dashboard, api).
     */
    '/((?!_next/static|_next/image|favicon.ico|assets/|.*\\.(?:html|css|js|mjs|svg|png|jpg|jpeg|gif|webp|ico|mp4|woff|woff2|xml|txt|json)$).*)',
  ],
};
