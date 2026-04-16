import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig } from 'remotion';
import { COLORS } from '../../constants';

const WORDS = [
  { t: 'WhatsApp saturado', f: 0 },
  { t: 'Excels perdidos', f: 40 },
  { t: 'Reservas duplicadas', f: 80 },
  { t: 'Pagos manuales', f: 120 },
  { t: 'Papel para check-in', f: 160 },
  { t: 'Sin datos reales', f: 200 },
];

export const PromoProblem = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        background: COLORS.navy,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{ textAlign: 'center', maxWidth: 1400, padding: '0 80px' }}>
        <div
          style={{
            fontFamily: '"Space Grotesk", sans-serif',
            fontSize: 24,
            color: COLORS.yellow,
            letterSpacing: '.2em',
            textTransform: 'uppercase',
            marginBottom: 40,
            opacity: spring({ frame, fps, config: { damping: 22 } }),
          }}
        >
          El problema
        </div>

        <div
          style={{
            fontFamily: '"Bebas Neue", sans-serif',
            fontSize: 110,
            color: '#fff',
            lineHeight: 1.05,
            letterSpacing: '.02em',
            opacity: spring({ frame: frame - 10, fps, config: { damping: 22 } }),
            transform: `translateY(${(1 - spring({ frame: frame - 10, fps, config: { damping: 22 } })) * 20}px)`,
          }}
        >
          Las escuelas gestionan<br />
          <span style={{ color: COLORS.yellow }}>con parches.</span>
        </div>

        <div
          style={{
            marginTop: 80,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 20,
            justifyContent: 'center',
          }}
        >
          {WORDS.map((w) => {
            const appear = spring({ frame: frame - w.f, fps, config: { damping: 20 } });
            return (
              <div
                key={w.t}
                style={{
                  background: 'rgba(255,255,255,.08)',
                  border: '1px solid rgba(255,255,255,.15)',
                  color: '#fff',
                  padding: '14px 28px',
                  borderRadius: 999,
                  fontFamily: '"Space Grotesk", sans-serif',
                  fontSize: 28,
                  fontWeight: 600,
                  opacity: appear,
                  transform: `translateY(${(1 - appear) * 20}px) scale(${0.85 + appear * 0.15})`,
                }}
              >
                {w.t}
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
