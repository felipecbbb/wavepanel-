import { WaveLogo } from '@/components/wave-logo';
import { logoutAction } from '@/lib/auth-actions';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <header className="border-b border-line bg-paper">
        <div className="mx-auto w-[min(1220px,92vw)] flex items-center justify-between h-16">
          <WaveLogo variant="dark" />
          <form action={logoutAction}>
            <button className="font-label text-[0.72rem] text-muted hover:text-navy transition-colors">
              Cerrar sesión
            </button>
          </form>
        </div>
      </header>
      <div className="flex-1">{children}</div>
    </div>
  );
}
