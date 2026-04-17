import { WaveLogo } from './wave-logo';

export function SiteFooter() {
  return (
    <footer className="bg-navy text-white/70 mt-auto">
      <div className="mx-auto w-[min(1220px,92vw)] py-12 grid gap-8 md:grid-cols-3">
        <div>
          <WaveLogo variant="light" />
          <p className="mt-3 text-sm max-w-xs">
            Software de gestión para escuelas de surf, kite y deportes acuáticos.
          </p>
        </div>
        <div className="text-sm">
          <p className="font-label text-white mb-3 text-[0.72rem]">Producto</p>
          <ul className="space-y-2">
            <li><a href="/signup" className="hover:text-yellow">Crear cuenta</a></li>
            <li><a href="/login" className="hover:text-yellow">Entrar</a></li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="font-label text-white mb-3 text-[0.72rem]">Legal</p>
          <ul className="space-y-2">
            <li><a href="/legal/aviso-legal.html" className="hover:text-yellow">Aviso legal</a></li>
            <li><a href="/legal/privacidad.html" className="hover:text-yellow">Privacidad</a></li>
            <li><a href="/legal/cookies.html" className="hover:text-yellow">Cookies</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto w-[min(1220px,92vw)] py-5 text-xs text-white/50 flex justify-between">
          <span>© {new Date().getFullYear()} WavePanel</span>
          <span>Hecho con 🌊 en España</span>
        </div>
      </div>
    </footer>
  );
}
