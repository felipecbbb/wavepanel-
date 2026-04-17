import { createClient } from '@/lib/supabase/server';
import { resolveActiveSchool } from '@/lib/tenant-server';
import { centsToEuros } from '@/lib/slug';

type Bono = {
  id: string;
  client_id: string;
  activity_id: string;
  total_credits: number;
  used_credits: number;
  price_cents: number;
  status: string;
  expires_at: string | null;
  created_at: string;
};

type Client = { id: string; name: string };
type Activity = { id: string; name: string; color: string };

export default async function BonosPage() {
  await resolveActiveSchool();
  const supabase = await createClient();

  const [{ data: bonosData }, { data: clientsData }, { data: activitiesData }] = await Promise.all([
    supabase.from('bonos').select('id, client_id, activity_id, total_credits, used_credits, price_cents, status, expires_at, created_at').order('created_at', { ascending: false }),
    supabase.from('clients').select('id, name'),
    supabase.from('activities').select('id, name, color'),
  ]);

  const bonos = (bonosData ?? []) as Bono[];
  const clientById = new Map(((clientsData ?? []) as Client[]).map((c) => [c.id, c]));
  const activityById = new Map(((activitiesData ?? []) as Activity[]).map((a) => [a.id, a]));

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <header className="mb-8">
        <p className="kicker mb-2">Bonos</p>
        <h1 className="font-display text-4xl text-navy">Packs vendidos.</h1>
        <p className="mt-2 text-muted text-sm">
          Los bonos se venden desde la ficha de cliente. Al caducar o agotarse pasan a inactivos automáticamente.
        </p>
      </header>

      {bonos.length === 0 ? (
        <div className="rounded-md border border-dashed border-line bg-paper p-10 text-center">
          <p className="text-sm text-muted">
            Todavía no hay bonos vendidos. Vende el primero desde la ficha de un cliente.
          </p>
        </div>
      ) : (
        <div className="rounded-md border border-line bg-paper overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-sand/50">
              <tr className="text-left">
                <th className="px-4 py-2.5 font-label text-[0.66rem] text-muted">Cliente</th>
                <th className="px-4 py-2.5 font-label text-[0.66rem] text-muted">Actividad</th>
                <th className="px-4 py-2.5 font-label text-[0.66rem] text-muted">Créditos</th>
                <th className="px-4 py-2.5 font-label text-[0.66rem] text-muted">Precio</th>
                <th className="px-4 py-2.5 font-label text-[0.66rem] text-muted">Estado</th>
                <th className="px-4 py-2.5 font-label text-[0.66rem] text-muted">Caduca</th>
              </tr>
            </thead>
            <tbody>
              {bonos.map((b, i) => {
                const client = clientById.get(b.client_id);
                const activity = activityById.get(b.activity_id);
                const remaining = b.total_credits - b.used_credits;
                const pct = b.total_credits > 0 ? (b.used_credits / b.total_credits) * 100 : 0;
                return (
                  <tr key={b.id} className={i !== 0 ? 'border-t border-line' : ''}>
                    <td className="px-4 py-3">
                      {client ? (
                        <a href={`/dashboard/clientes/${client.id}`} className="text-navy font-semibold hover:underline">
                          {client.name}
                        </a>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-2">
                        {activity && (
                          <span className="h-3 w-3 rounded-sm" style={{ background: activity.color }} />
                        )}
                        {activity?.name ?? '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 min-w-[120px]">
                        <div className="w-16 h-1.5 bg-sand rounded-sm overflow-hidden">
                          <div
                            className="h-full bg-navy"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs">{remaining}/{b.total_credits}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">{centsToEuros(b.price_cents)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={b.status} />
                    </td>
                    <td className="px-4 py-3 text-xs text-muted">
                      {b.expires_at ? new Date(b.expires_at).toLocaleDateString('es-ES') : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const label: Record<string, string> = {
    active: 'Activo',
    exhausted: 'Agotado',
    expired: 'Caducado',
    cancelled: 'Cancelado',
  };
  const cls: Record<string, string> = {
    active: 'bg-emerald-50 text-emerald-800',
    exhausted: 'bg-sand text-muted',
    expired: 'bg-red-50 text-red-700',
    cancelled: 'bg-sand text-muted',
  };
  return (
    <span className={`font-label text-[0.6rem] px-2 py-0.5 rounded-sm ${cls[status] ?? 'bg-sand text-muted'}`}>
      {label[status] ?? status}
    </span>
  );
}
