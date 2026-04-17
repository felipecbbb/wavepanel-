import Link from 'next/link';

type Tenant = {
  slug: string;
  name: string;
  contact_email: string | null;
  contact_phone: string | null;
  address: string | null;
  city: string | null;
};

export function TenantFooter({ tenant }: { tenant: Tenant }) {
  return (
    <footer className="bg-navy text-white/70 mt-auto">
      <div className="mx-auto w-[min(1220px,92vw)] py-10 grid gap-8 md:grid-cols-3">
        <div>
          <p className="font-label text-white mb-3 text-[0.72rem]">{tenant.name}</p>
          {(tenant.address || tenant.city) && (
            <p className="text-sm">
              {tenant.address}
              {tenant.address && tenant.city && ', '}
              {tenant.city}
            </p>
          )}
        </div>
        <div className="text-sm">
          <p className="font-label text-white mb-3 text-[0.72rem]">Explora</p>
          <ul className="space-y-1.5">
            <li><Link href={`/${tenant.slug}/actividades`} className="hover:text-yellow">Actividades</Link></li>
            <li><Link href={`/${tenant.slug}/camps`} className="hover:text-yellow">Surf Camps</Link></li>
            <li><Link href={`/${tenant.slug}/calendario`} className="hover:text-yellow">Calendario</Link></li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="font-label text-white mb-3 text-[0.72rem]">Contacto</p>
          <ul className="space-y-1.5">
            {tenant.contact_email && (
              <li><a href={`mailto:${tenant.contact_email}`} className="hover:text-yellow">{tenant.contact_email}</a></li>
            )}
            {tenant.contact_phone && (
              <li><a href={`tel:${tenant.contact_phone}`} className="hover:text-yellow">{tenant.contact_phone}</a></li>
            )}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto w-[min(1220px,92vw)] py-4 text-xs text-white/50 flex items-center justify-between flex-wrap gap-2">
          <span>© {new Date().getFullYear()} {tenant.name}</span>
          <span>
            Hecho con{' '}
            <a href="https://wavepanel.vercel.app" className="text-yellow/80 hover:text-yellow">
              WavePanel
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
