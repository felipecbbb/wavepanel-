export function WaveLogo({ variant = 'dark' }: { variant?: 'dark' | 'light' }) {
  const base = variant === 'light' ? 'text-white' : 'text-navy';
  return (
    <span className={`font-label text-[1.45rem] tracking-[0.04em] ${base}`}>
      wave<span className="text-yellow">panel</span>
    </span>
  );
}
