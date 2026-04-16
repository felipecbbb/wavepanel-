import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig } from 'remotion';
import { COLORS } from '../../constants';

export const PromoSolution = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const kicker = spring({ frame, fps, config: { damping: 22 } });
  const title = spring({ frame: frame - 15, fps, config: { damping: 18 } });
  const subtitle = spring({ frame: frame - 50, fps, config: { damping: 22 } });

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(135deg, ${COLORS.navy} 0%, #1a3d47 100%)`,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(255,204,1,.18), transparent)',
        }}
      />

      <div style={{ textAlign: 'center', position: 'relative', maxWidth: 1400, padding: '0 80px' }}>
        <div
          style={{
            fontFamily: '"Space Grotesk", sans-serif',
            fontSize: 24,
            color: COLORS.yellow,
            letterSpacing: '.2em',
            textTransform: 'uppercase',
            marginBottom: 40,
            opacity: kicker,
          }}
        >
          La solución
        </div>
        <div
          style={{
            fontFamily: '"Bebas Neue", sans-serif',
            fontSize: 150,
            color: '#fff',
            lineHeight: 1,
            letterSpacing: '.02em',
            opacity: title,
            transform: `translateY(${(1 - title) * 30}px)`,
          }}
        >
          Un panel.
        </div>
        <div
          style={{
            fontFamily: '"Bebas Neue", sans-serif',
            fontSize: 150,
            color: COLORS.yellow,
            lineHeight: 1,
            letterSpacing: '.02em',
            opacity: spring({ frame: frame - 30, fps, config: { damping: 18 } }),
            transform: `translateY(${(1 - spring({ frame: frame - 30, fps, config: { damping: 18 } })) * 30}px)`,
            marginTop: 10,
          }}
        >
          Todo dentro.
        </div>
        <div
          style={{
            fontFamily: '"Space Grotesk", sans-serif',
            fontSize: 26,
            color: 'rgba(255,255,255,.7)',
            marginTop: 40,
            opacity: subtitle,
          }}
        >
          Web pública · Reservas · Pagos · Tienda · Camps · Emails
        </div>
      </div>
    </AbsoluteFill>
  );
};
