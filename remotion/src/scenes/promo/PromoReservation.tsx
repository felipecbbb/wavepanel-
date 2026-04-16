import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig } from 'remotion';
import { COLORS } from '../../constants';
import { PanelChrome } from '../../components/PanelChrome';

const fields: { label: string; full: string }[] = [
  { label: 'Cliente', full: 'Javi Martín · javi@ejemplo.com' },
  { label: 'Actividad', full: 'Privada · Kite (80€ · 1h)' },
  { label: 'Fecha', full: 'Jueves 19 abril 2026' },
  { label: 'Hora', full: '10:00' },
  { label: 'Instructor', full: 'Ana Pereira' },
  { label: 'Personas', full: '2' },
  { label: 'Método de pago', full: 'Tarjeta (Stripe)' },
  { label: 'Total', full: '130,00 €' },
];

const typewriter = (text: string, startFrame: number, fps: number) => {
  if (startFrame <= 0) return '';
  const charsPerSecond = 40;
  const chars = Math.floor((startFrame / fps) * charsPerSecond);
  return text.slice(0, chars);
};

export const PromoReservation = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const captionOpacity = spring({ frame, fps, config: { damping: 22 } });
  const panelAppear = spring({ frame: frame - 20, fps, config: { damping: 22 } });

  return (
    <AbsoluteFill
      style={{
        background: COLORS.navy,
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 60px',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: 24, opacity: captionOpacity }}>
        <div
          style={{
            fontFamily: '"Space Grotesk", sans-serif',
            fontSize: 20,
            color: COLORS.yellow,
            letterSpacing: '.2em',
            textTransform: 'uppercase',
            marginBottom: 8,
          }}
        >
          Reservas en 30 segundos
        </div>
        <div
          style={{
            fontFamily: '"Bebas Neue", sans-serif',
            fontSize: 64,
            color: '#fff',
            lineHeight: 1,
          }}
        >
          Del cliente al cobro, sin fricción.
        </div>
      </div>

      <div
        style={{
          width: '100%',
          opacity: panelAppear,
          transform: `translateY(${(1 - panelAppear) * 40}px) scale(${0.95 + panelAppear * 0.05})`,
        }}
      >
        <PanelChrome
          url="panel.tuescuela.com/reservas/nueva"
          active="reservations"
          title="Nueva reserva"
          cta={{ label: 'Guardar reserva', yellow: true }}
        >
          <div
            style={{
              background: '#fff',
              border: `1px solid ${COLORS.line}`,
              borderRadius: 12,
              padding: 24,
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 16,
            }}
          >
            {fields.map((f, i) => {
              const typed = typewriter(f.full, frame - 30 - i * 8, fps);
              return (
                <div key={f.label} style={{ display: 'grid', gap: 6 }}>
                  <label
                    style={{
                      fontFamily: '"Space Grotesk", sans-serif',
                      fontSize: 11,
                      textTransform: 'uppercase',
                      letterSpacing: '.06em',
                      color: COLORS.muted,
                      fontWeight: 600,
                    }}
                  >
                    {f.label}
                  </label>
                  <div
                    style={{
                      background: '#fafaf5',
                      border: `1px solid ${COLORS.line}`,
                      borderRadius: 8,
                      padding: '12px 14px',
                      fontSize: 15,
                      color: f.label === 'Total' ? COLORS.navy : COLORS.text,
                      fontWeight: f.label === 'Total' ? 700 : 400,
                      minHeight: 44,
                    }}
                  >
                    {typed}
                    {typed.length < f.full.length && typed.length > 0 && (
                      <span style={{ opacity: Math.floor(frame / 10) % 2 }}>|</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </PanelChrome>
      </div>
    </AbsoluteFill>
  );
};
