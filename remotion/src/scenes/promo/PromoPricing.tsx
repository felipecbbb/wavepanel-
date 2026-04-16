import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig } from 'remotion';
import { COLORS } from '../../constants';

export const PromoPricing = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const kicker = spring({ frame, fps, config: { damping: 22 } });
  const price = spring({ frame: frame - 20, fps, config: { damping: 14, stiffness: 90 } });
  const subtitle = spring({ frame: frame - 60, fps, config: { damping: 22 } });
  const compare = spring({ frame: frame - 110, fps, config: { damping: 22 } });

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
          background: 'radial-gradient(ellipse 60% 50% at 50% 45%, rgba(255,204,1,.20), transparent)',
        }}
      />

      <div style={{ textAlign: 'center', position: 'relative', maxWidth: 1200, padding: '0 80px' }}>
        <div
          style={{
            fontFamily: '"Space Grotesk", sans-serif',
            fontSize: 26,
            color: COLORS.yellow,
            letterSpacing: '.2em',
            textTransform: 'uppercase',
            marginBottom: 40,
            opacity: kicker,
          }}
        >
          Desde
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'center',
            gap: 12,
            opacity: price,
            transform: `scale(${0.7 + price * 0.3})`,
          }}
        >
          <span
            style={{
              fontFamily: '"Bebas Neue", sans-serif',
              fontSize: 380,
              color: '#fff',
              lineHeight: 1,
              letterSpacing: '-.02em',
            }}
          >
            29€
          </span>
          <span
            style={{
              fontFamily: '"Space Grotesk", sans-serif',
              fontSize: 40,
              color: 'rgba(255,255,255,.6)',
              fontWeight: 500,
            }}
          >
            / mes
          </span>
        </div>

        <div
          style={{
            fontFamily: '"Space Grotesk", sans-serif',
            fontSize: 28,
            color: 'rgba(255,255,255,.8)',
            marginTop: 30,
            opacity: subtitle,
          }}
        >
          con plan anual · 14 días gratis · sin tarjeta
        </div>

        <div
          style={{
            marginTop: 60,
            padding: '20px 40px',
            background: 'rgba(255,204,1,.1)',
            border: '1px solid rgba(255,204,1,.25)',
            borderRadius: 999,
            display: 'inline-block',
            opacity: compare,
          }}
        >
          <span
            style={{
              fontFamily: '"Space Grotesk", sans-serif',
              fontSize: 22,
              color: COLORS.yellow,
              fontWeight: 700,
            }}
          >
            La opción más barata del mercado vertical surf.
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
