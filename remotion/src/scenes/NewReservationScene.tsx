import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig } from 'remotion';
import { COLORS } from '../constants';
import { PanelChrome } from '../components/PanelChrome';

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

export const NewReservationScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 20 } });

  return (
    <AbsoluteFill
      style={{
        background: COLORS.bg,
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 0',
      }}
    >
      <div
        style={{
          width: '100%',
          opacity: enter,
          transform: `translateY(${(1 - enter) * 40}px)`,
        }}
      >
        <div
          style={{
            textAlign: 'center',
            fontFamily: '"Space Grotesk", sans-serif',
            fontSize: 22,
            color: COLORS.navy,
            fontWeight: 600,
            marginBottom: 30,
          }}
        >
          Crear una reserva en 30 segundos
        </div>

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
              const typed = typewriter(f.full, frame - 20 - i * 6, fps);
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
                    {typed.length < f.full.length && (
                      <span style={{ opacity: Math.floor(frame / 12) % 2 }}>|</span>
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

const typewriter = (text: string, startFrame: number, fps: number) => {
  if (startFrame <= 0) return '';
  const charsPerSecond = 28;
  const chars = Math.floor((startFrame / fps) * charsPerSecond);
  return text.slice(0, chars);
};
