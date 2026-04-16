import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig } from 'remotion';
import { COLORS } from '../../constants';

const BENEFITS = [
  { title: '0%', subtitle: 'Comisión por reserva', detail: 'Todo el dinero, directo a tu cuenta' },
  { title: 'Web', subtitle: 'Pública incluida', detail: 'Dominio propio + SEO + reservas directas' },
  { title: '3', subtitle: 'Pasarelas de pago', detail: 'Stripe · PayPal · Redsys' },
  { title: '100%', subtitle: 'Vertical surf', detail: 'Camps, alojamiento y check-in digital' },
];

export const PromoBenefits = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const kicker = spring({ frame, fps, config: { damping: 22 } });
  const title = spring({ frame: frame - 15, fps, config: { damping: 18 } });

  return (
    <AbsoluteFill
      style={{
        background: COLORS.navy,
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 80px',
      }}
    >
      <div style={{ maxWidth: 1400, width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <div
            style={{
              fontFamily: '"Space Grotesk", sans-serif',
              fontSize: 24,
              color: COLORS.yellow,
              letterSpacing: '.2em',
              textTransform: 'uppercase',
              marginBottom: 20,
              opacity: kicker,
            }}
          >
            Por qué WavePanel
          </div>
          <div
            style={{
              fontFamily: '"Bebas Neue", sans-serif',
              fontSize: 110,
              color: '#fff',
              lineHeight: 1,
              letterSpacing: '.02em',
              opacity: title,
              transform: `translateY(${(1 - title) * 20}px)`,
            }}
          >
            Lo que los demás <span style={{ color: COLORS.yellow }}>no dan.</span>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 24,
          }}
        >
          {BENEFITS.map((b, i) => {
            const appear = spring({ frame: frame - 60 - i * 25, fps, config: { damping: 20 } });
            return (
              <div
                key={b.subtitle}
                style={{
                  background: 'rgba(255,255,255,.06)',
                  border: '1px solid rgba(255,255,255,.12)',
                  borderRadius: 20,
                  padding: '40px 30px',
                  textAlign: 'center',
                  opacity: appear,
                  transform: `translateY(${(1 - appear) * 30}px) scale(${0.92 + appear * 0.08})`,
                }}
              >
                <div
                  style={{
                    fontFamily: '"Bebas Neue", sans-serif',
                    fontSize: 100,
                    color: COLORS.yellow,
                    lineHeight: 1,
                    marginBottom: 16,
                    letterSpacing: '.02em',
                  }}
                >
                  {b.title}
                </div>
                <div
                  style={{
                    fontFamily: '"Space Grotesk", sans-serif',
                    fontSize: 20,
                    color: '#fff',
                    fontWeight: 700,
                    marginBottom: 10,
                  }}
                >
                  {b.subtitle}
                </div>
                <div
                  style={{
                    fontFamily: '"Manrope", sans-serif',
                    fontSize: 15,
                    color: 'rgba(255,255,255,.65)',
                    lineHeight: 1.5,
                  }}
                >
                  {b.detail}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
