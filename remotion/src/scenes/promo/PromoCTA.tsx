import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig } from 'remotion';
import { COLORS } from '../../constants';

export const PromoCTA = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({ frame, fps, config: { damping: 16 } });
  const url = spring({ frame: frame - 40, fps, config: { damping: 22 } });
  const tagline = spring({ frame: frame - 80, fps, config: { damping: 22 } });

  return (
    <AbsoluteFill
      style={{
        background: COLORS.yellow,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          textAlign: 'center',
          opacity: enter,
          transform: `scale(${0.9 + enter * 0.1})`,
        }}
      >
        <div
          style={{
            fontFamily: '"Space Grotesk", sans-serif',
            fontSize: 26,
            color: COLORS.navy,
            letterSpacing: '.2em',
            textTransform: 'uppercase',
            marginBottom: 30,
            opacity: 0.7,
          }}
        >
          WavePanel
        </div>
        <div
          style={{
            fontFamily: '"Bebas Neue", sans-serif',
            fontSize: 170,
            color: COLORS.navy,
            lineHeight: 1,
            letterSpacing: '.02em',
          }}
        >
          Tu escuela.
        </div>
        <div
          style={{
            fontFamily: '"Bebas Neue", sans-serif',
            fontSize: 170,
            color: COLORS.navy,
            lineHeight: 1,
            letterSpacing: '.02em',
          }}
        >
          Digitalizada.
        </div>

        <div
          style={{
            fontFamily: '"Space Grotesk", sans-serif',
            fontSize: 44,
            color: COLORS.navy,
            fontWeight: 700,
            marginTop: 60,
            opacity: url,
          }}
        >
          wavepanel.com
        </div>
        <div
          style={{
            fontFamily: '"Space Grotesk", sans-serif',
            fontSize: 24,
            color: COLORS.navySoft,
            marginTop: 14,
            opacity: tagline,
          }}
        >
          14 días gratis · sin tarjeta · sin permanencia
        </div>
      </div>
    </AbsoluteFill>
  );
};
