import { centsToEuros } from '@/lib/slug';

export type EnrollmentHistory = {
  id: string;
  class_id: string;
  status: string;
  price_cents: number;
  bono_id: string | null;
  family_member_id: string | null;
  class_starts_at: string;
  activity_name: string | null;
  activity_color: string | null;
  family_member_name: string | null;
};

export type BonoHistory = {
  id: string;
  activity_id: string;
  total_credits: number;
  used_credits: number;
  price_cents: number;
  status: string;
  expires_at: string | null;
  created_at: string;
  activity_name: string | null;
  activity_color: string | null;
};

export type CampBookingHistory = {
  id: string;
  camp_id: string;
  participants_count: number;
  total_cents: number;
  paid_cents: number;
  status: string;
  created_at: string;
  camp_name: string | null;
  camp_starts_on: string | null;
};

export type PaymentHistory = {
  id: string;
  amount_cents: number;
  method: string;
  concept: string | null;
  reference_type: string;
  paid_at: string;
};

const STATUS_CLASS: Record<string, string> = {
  confirmed: 'bg-sand text-navy',
  completed: 'bg-emerald-50 text-emerald-800',
  no_show: 'bg-red-50 text-red-700',
  cancelled: 'bg-sand text-muted',
  paid: 'bg-emerald-50 text-emerald-800',
  partial: 'bg-amber-50 text-amber-800',
  active: 'bg-emerald-50 text-emerald-800',
  exhausted: 'bg-sand text-muted',
  expired: 'bg-red-50 text-red-700',
  pending: 'bg-amber-50 text-amber-800',
  deposit_paid: 'bg-sand text-navy',
  fully_paid: 'bg-emerald-50 text-emerald-800',
  refunded: 'bg-sand text-muted',
};

function StatusBadge({ status, label }: { status: string; label?: string }) {
  return (
    <span className={`font-label text-[0.6rem] px-2 py-0.5 rounded-sm ${STATUS_CLASS[status] ?? 'bg-sand text-muted'}`}>
      {label ?? status}
    </span>
  );
}

function Empty({ label }: { label: string }) {
  return (
    <div className="rounded-md border border-dashed border-line bg-paper p-8 text-center">
      <p className="text-sm text-muted">{label}</p>
    </div>
  );
}

export function EnrollmentsList({ rows }: { rows: EnrollmentHistory[] }) {
  if (rows.length === 0) return <Empty label="Aún sin inscripciones a clases" />;
  return (
    <ul className="space-y-2">
      {rows.map((e) => (
        <li key={e.id} className="rounded-md border border-line bg-paper px-4 py-3 flex items-center gap-3">
          <span className="h-3 w-3 rounded-sm" style={{ background: e.activity_color ?? '#214a57' }} />
          <div className="flex-1 min-w-0">
            <p className="text-sm">
              <span className="font-semibold text-navy">{e.activity_name ?? '—'}</span>{' '}
              <span className="text-muted">
                · {new Date(e.class_starts_at).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                {' '}
                {new Date(e.class_starts_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false })}
              </span>
            </p>
            <p className="text-xs text-muted">
              {e.family_member_name ? `Para ${e.family_member_name}` : 'Cliente principal'}
              {e.bono_id ? ' · con bono' : e.price_cents > 0 ? ` · ${centsToEuros(e.price_cents)}` : ''}
            </p>
          </div>
          <StatusBadge
            status={e.status}
            label={{
              confirmed: 'Confirmada',
              completed: 'Asistió',
              no_show: 'No vino',
              cancelled: 'Cancelada',
              paid: 'Pagada',
              partial: 'Parcial',
            }[e.status] ?? e.status}
          />
        </li>
      ))}
    </ul>
  );
}

export function BonosList({ rows }: { rows: BonoHistory[] }) {
  if (rows.length === 0) return <Empty label="Aún sin bonos comprados" />;
  return (
    <ul className="space-y-2">
      {rows.map((b) => {
        const remaining = b.total_credits - b.used_credits;
        const pct = b.total_credits > 0 ? (b.used_credits / b.total_credits) * 100 : 0;
        return (
          <li key={b.id} className="rounded-md border border-line bg-paper px-4 py-3 flex items-center gap-3">
            <span className="h-3 w-3 rounded-sm" style={{ background: b.activity_color ?? '#214a57' }} />
            <div className="flex-1 min-w-0">
              <p className="text-sm">
                <span className="font-semibold text-navy">{b.activity_name ?? '—'}</span>{' '}
                <span className="text-muted">· {b.total_credits} sesiones · {centsToEuros(b.price_cents)}</span>
              </p>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-24 h-1.5 bg-sand rounded-sm overflow-hidden">
                  <div className="h-full bg-navy" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-xs text-muted">{remaining} restantes</span>
                {b.expires_at && (
                  <span className="text-xs text-muted">
                    · caduca {new Date(b.expires_at).toLocaleDateString('es-ES')}
                  </span>
                )}
              </div>
            </div>
            <StatusBadge
              status={b.status}
              label={{ active: 'Activo', exhausted: 'Agotado', expired: 'Caducado', cancelled: 'Cancelado' }[b.status] ?? b.status}
            />
          </li>
        );
      })}
    </ul>
  );
}

export function CampBookingsList({ rows }: { rows: CampBookingHistory[] }) {
  if (rows.length === 0) return <Empty label="Aún sin reservas de surf camps" />;
  return (
    <ul className="space-y-2">
      {rows.map((c) => {
        const pending = c.total_cents - c.paid_cents;
        return (
          <li key={c.id} className="rounded-md border border-line bg-paper px-4 py-3 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm">
                <a href={`/dashboard/camps/${c.camp_id}`} className="font-semibold text-navy hover:underline">
                  {c.camp_name ?? '—'}
                </a>
                {c.camp_starts_on && (
                  <span className="text-muted"> · {new Date(c.camp_starts_on).toLocaleDateString('es-ES')}</span>
                )}
                {c.participants_count > 1 && <span className="text-muted"> · {c.participants_count} personas</span>}
              </p>
              <p className="text-xs text-muted">
                {centsToEuros(c.paid_cents)} pagado de {centsToEuros(c.total_cents)}
                {pending > 0 && <span className="text-red-600"> · pendiente {centsToEuros(pending)}</span>}
              </p>
            </div>
            <StatusBadge
              status={c.status}
              label={{ pending: 'Pendiente', deposit_paid: 'Depósito', fully_paid: 'Pagado', cancelled: 'Cancelada', refunded: 'Reembolsada' }[c.status] ?? c.status}
            />
          </li>
        );
      })}
    </ul>
  );
}

const METHOD_LABEL: Record<string, string> = {
  cash: 'Efectivo',
  card: 'Tarjeta',
  transfer: 'Transferencia',
  voucher: 'Vale',
  credit: 'Crédito',
  online: 'Online',
};

export function PaymentsList({ rows }: { rows: PaymentHistory[] }) {
  if (rows.length === 0) return <Empty label="Aún sin pagos registrados" />;
  return (
    <ul className="space-y-2">
      {rows.map((p) => (
        <li key={p.id} className="rounded-md border border-line bg-paper px-4 py-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm text-navy">
              {p.concept ?? 'Pago'}
              <span className="text-muted"> · {METHOD_LABEL[p.method] ?? p.method}</span>
            </p>
            <p className="text-xs text-muted">
              {new Date(p.paid_at).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}
            </p>
          </div>
          <span className="font-display text-lg text-navy">{centsToEuros(p.amount_cents)}</span>
        </li>
      ))}
    </ul>
  );
}
