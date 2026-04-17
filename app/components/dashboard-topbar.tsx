import { logoutAction } from '@/lib/auth-actions';

type Props = {
  trial: { daysLeft: number; stripeStatus: string | null };
  schoolName: string;
};

export function DashboardTopbar({ trial, schoolName }: Props) {
  return (
    <header className="h-14 border-b border-line bg-paper flex items-center justify-between px-6 gap-4">
      <div className="flex items-center gap-3">
        <span className="md:hidden font-label text-[0.72rem] text-navy">{schoolName}</span>
        <TrialPill {...trial} />
      </div>
      <form action={logoutAction}>
        <button className="font-label text-[0.72rem] text-muted hover:text-navy transition-colors">
          Cerrar sesión
        </button>
      </form>
    </header>
  );
}

function TrialPill({ daysLeft, stripeStatus }: { daysLeft: number; stripeStatus: string | null }) {
  if (stripeStatus === 'active') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-pill bg-emerald-50 px-3 py-1 text-[0.72rem] text-emerald-800 font-label">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Activo
      </span>
    );
  }
  const expired = daysLeft === 0;
  const color = expired ? 'bg-red-50 text-red-800' : 'bg-yellow/20 text-navy';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-pill px-3 py-1 text-[0.72rem] font-label ${color}`}>
      {expired ? 'Trial expirado' : `Trial · ${daysLeft}d`}
    </span>
  );
}
