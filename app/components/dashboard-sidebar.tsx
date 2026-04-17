'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import { WaveLogo } from './wave-logo';

const sections = [
  { href: '/dashboard', label: 'Panel', exact: true },
  { href: '/dashboard/clientes', label: 'Clientes' },
  { href: '/dashboard/actividades', label: 'Actividades' },
  { href: '/dashboard/calendario', label: 'Calendario' },
  { href: '/dashboard/camps', label: 'Surf Camps' },
  { href: '/dashboard/bonos', label: 'Bonos' },
  { href: '/dashboard/instructores', label: 'Instructores' },
];

const footer = [
  { href: '/dashboard/ajustes', label: 'Ajustes' },
];

export function DashboardSidebar({ schoolName, schoolSlug }: { schoolName: string; schoolSlug: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tenant = searchParams.get('tenant');

  // Si estamos en path-based tenancy (vercel.app), preservamos el ?tenant= en los links
  const suffix = useMemo(() => (tenant ? `?tenant=${encodeURIComponent(tenant)}` : ''), [tenant]);

  return (
    <aside className="hidden md:flex md:w-60 lg:w-64 shrink-0 flex-col bg-navy text-white/80 min-h-screen sticky top-0">
      <div className="px-6 py-6 border-b border-white/10">
        <WaveLogo variant="light" />
        <p className="mt-2 text-[0.72rem] text-white/50 font-label">{schoolSlug}</p>
      </div>

      <nav className="flex-1 px-3 py-5 overflow-y-auto">
        <SidebarLinks items={sections} pathname={pathname} suffix={suffix} />
        <div className="my-4 border-t border-white/10" />
        <SidebarLinks items={footer} pathname={pathname} suffix={suffix} />
      </nav>

      <div className="px-6 py-5 border-t border-white/10 text-[0.76rem] text-white/70">
        <div className="font-label text-[0.66rem] text-white/40 mb-1">Escuela</div>
        <div className="truncate">{schoolName}</div>
      </div>
    </aside>
  );
}

function SidebarLinks({
  items,
  pathname,
  suffix,
}: {
  items: { href: string; label: string; exact?: boolean }[];
  pathname: string;
  suffix: string;
}) {
  return (
    <ul className="space-y-1">
      {items.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <li key={item.href}>
            <a
              href={item.href + suffix}
              className={`block rounded-md px-3 py-2 text-[0.88rem] transition-colors ${
                active
                  ? 'bg-yellow text-navy font-semibold'
                  : 'hover:bg-white/5 hover:text-white'
              }`}
            >
              {item.label}
            </a>
          </li>
        );
      })}
    </ul>
  );
}
