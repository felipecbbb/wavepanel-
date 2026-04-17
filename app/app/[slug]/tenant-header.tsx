import Link from 'next/link';

type Tenant = {
  slug: string;
  name: string;
  logo_url: string | null;
  primary_color: string;
};

export function TenantHeader({ tenant }: { tenant: Tenant }) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-navy/90 backdrop-blur-md border-b border-white/10">
      <div className="mx-auto w-[min(1220px,92vw)]">
        <div className="flex min-h-[72px] items-center justify-between gap-5">
          <Link href={`/${tenant.slug}`} className="flex items-center gap-3">
            {tenant.logo_url ? (
              <img src={tenant.logo_url} alt={tenant.name} className="h-8 w-8 rounded-sm object-cover" />
            ) : (
              <span
                className="h-8 w-8 rounded-sm inline-flex items-center justify-center font-display text-sm text-navy"
                style={{ background: tenant.primary_color }}
              >
                {tenant.name.charAt(0).toUpperCase()}
              </span>
            )}
            <span className="font-label text-white text-[1.1rem] tracking-[0.04em]">{tenant.name}</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 font-label text-[0.72rem] text-white/80">
            <Link href={`/${tenant.slug}/actividades`} className="hover:text-white">Actividades</Link>
            <Link href={`/${tenant.slug}/camps`} className="hover:text-white">Surf Camps</Link>
            <Link href={`/${tenant.slug}/calendario`} className="hover:text-white">Calendario</Link>
            <Link
              href={`/${tenant.slug}/auth/signup`}
              className="rounded-pill px-4 py-2 text-navy"
              style={{ background: tenant.primary_color }}
            >
              Reservar
            </Link>
          </nav>

          <Link
            href={`/${tenant.slug}/auth/signup`}
            className="md:hidden rounded-pill px-3 py-1.5 text-[0.72rem] font-label text-navy"
            style={{ background: tenant.primary_color }}
          >
            Reservar
          </Link>
        </div>
      </div>
    </header>
  );
}
