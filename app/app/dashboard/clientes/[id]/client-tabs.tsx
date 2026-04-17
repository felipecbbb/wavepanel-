'use client';

import { useState, type ReactNode } from 'react';

type TabKey = 'datos' | 'familia' | 'clases' | 'bonos' | 'camps' | 'pagos';

type Counts = {
  familia: number;
  clases: number;
  bonos: number;
  camps: number;
  pagos: number;
};

export default function ClientTabs({
  counts,
  datos,
  familia,
  clases,
  bonos,
  camps,
  pagos,
}: {
  counts: Counts;
  datos: ReactNode;
  familia: ReactNode;
  clases: ReactNode;
  bonos: ReactNode;
  camps: ReactNode;
  pagos: ReactNode;
}) {
  const [active, setActive] = useState<TabKey>('datos');

  return (
    <div className="grid gap-8 md:grid-cols-[200px_1fr]">
      <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-visible">
        <TabButton label="Datos personales" active={active === 'datos'} onClick={() => setActive('datos')} />
        <TabButton label="Familia" active={active === 'familia'} onClick={() => setActive('familia')} count={counts.familia} />
        <TabButton label="Clases" active={active === 'clases'} onClick={() => setActive('clases')} count={counts.clases} />
        <TabButton label="Bonos" active={active === 'bonos'} onClick={() => setActive('bonos')} count={counts.bonos} />
        <TabButton label="Surf Camps" active={active === 'camps'} onClick={() => setActive('camps')} count={counts.camps} />
        <TabButton label="Pagos" active={active === 'pagos'} onClick={() => setActive('pagos')} count={counts.pagos} />
      </nav>

      <div className="min-w-0">
        {active === 'datos' && datos}
        {active === 'familia' && familia}
        {active === 'clases' && clases}
        {active === 'bonos' && bonos}
        {active === 'camps' && camps}
        {active === 'pagos' && pagos}
      </div>
    </div>
  );
}

function TabButton({
  label,
  active,
  onClick,
  count,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  count?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-between gap-2 px-3 py-2 rounded-sm text-[0.88rem] text-left transition whitespace-nowrap ${
        active
          ? 'bg-navy text-white font-semibold'
          : 'text-muted hover:bg-sand hover:text-navy'
      }`}
    >
      <span>{label}</span>
      {count !== undefined && count > 0 && (
        <span
          className={`text-[0.66rem] font-label px-1.5 py-0.5 rounded-sm ${
            active ? 'bg-white/20 text-white' : 'bg-sand text-muted'
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}
