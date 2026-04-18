'use client';
import Link from 'next/link';

import { useMemo, useState } from 'react';

type Row = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  tags: string[];
  created_at: string;
};

export default function ClientesSearch({ rows }: { rows: Row[] }) {
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter((r) => {
      if (r.name.toLowerCase().includes(needle)) return true;
      if (r.email?.toLowerCase().includes(needle)) return true;
      if (r.phone?.toLowerCase().includes(needle)) return true;
      if (r.tags.some((t) => t.includes(needle))) return true;
      return false;
    });
  }, [rows, q]);

  return (
    <>
      <div className="mb-4">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nombre, email, teléfono o etiqueta…"
          className="w-full rounded-sm border border-line bg-paper px-4 py-2.5 text-[15px] outline-none focus:border-navy focus:ring-2 focus:ring-yellow/30"
        />
        <p className="mt-1.5 text-xs text-muted">
          {filtered.length} de {rows.length} clientes
        </p>
      </div>

      <div className="rounded-md border border-line bg-paper overflow-hidden">
        <table className="w-full">
          <thead className="bg-sand/50">
            <tr className="text-left">
              <Th>Nombre</Th>
              <Th>Contacto</Th>
              <Th>Etiquetas</Th>
              <Th className="w-24" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => (
              <tr key={r.id} className={i !== 0 ? 'border-t border-line' : ''}>
                <Td>
                  <Link href={`/dashboard/clientes/${r.id}`} className="font-semibold text-navy hover:underline">
                    {r.name}
                  </Link>
                </Td>
                <Td>
                  <div className="text-sm">
                    {r.email && <div className="text-navy">{r.email}</div>}
                    {r.phone && <div className="text-muted">{r.phone}</div>}
                    {!r.email && !r.phone && <span className="text-muted text-xs">—</span>}
                  </div>
                </Td>
                <Td>
                  <div className="flex flex-wrap gap-1">
                    {r.tags.map((t) => (
                      <span key={t} className="inline-flex rounded-pill bg-sand text-navy px-2 py-0.5 text-[0.7rem] font-label">
                        {t}
                      </span>
                    ))}
                  </div>
                </Td>
                <Td>
                  <Link href={`/dashboard/clientes/${r.id}`} className="text-xs text-muted hover:text-navy underline">
                    Editar
                  </Link>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function Th({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <th className={`px-4 py-2.5 font-label text-[0.66rem] text-muted ${className ?? ''}`}>{children}</th>
  );
}
function Td({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 align-middle ${className ?? ''}`}>{children}</td>;
}
