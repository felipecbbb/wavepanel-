import { WaveLogo } from './wave-logo';
import { ButtonLink } from './button';

export function SiteHeader({ showAuthLinks = true }: { showAuthLinks?: boolean }) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-navy/90 backdrop-blur-md border-b border-white/10">
      <div className="mx-auto w-[min(1220px,92vw)]">
        <div className="flex min-h-[72px] items-center justify-between gap-5">
          <a href="/" className="flex items-baseline">
            <WaveLogo variant="light" />
          </a>

          {showAuthLinks && (
            <nav className="flex items-center gap-4">
              <ButtonLink href="/login" variant="outline-light">
                Entrar
              </ButtonLink>
              <ButtonLink href="/signup" variant="yellow">
                Empezar gratis
              </ButtonLink>
            </nav>
          )}
        </div>
      </div>
    </header>
  );
}
