import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig, interpolate } from 'remotion';
import { COLORS } from '../../constants';

export const PromoTitleCard = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const line1 = spring({ frame: frame - 0, fps, config: { damping: 18, stiffness: 90 } });
  const line2 = spring({ frame: frame - 25, fps, config: { damping: 18, stiffness: 90 } });
  const subtitle = spring({ frame: frame - 60, fps, config: { damping: 22 } });

  return (
    <AbsoluteFill
      style={{
        background: COLORS.navy,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(ellipse 70% 50% at 60% 45%, rgba(255,204,1,.15), transparent)',
        }}
      />
      <div style={{ textAlign: 'center', position: 'relative' }}>
        <div
          style={{
            fontFamily: '"Bebas Neue", sans-serif',
            fontSize: 200,
            color: '#fff',
            lineHeight: 1,
            letterSpacing: '.02em',
            opacity: line1,
            transform: `translateY(${(1 - line1) * 30}px)`,
          }}
        >
          Tu escuela.
        </div>
        <div
          style={{
            fontFamily: '"Bebas Neue", sans-serif',
            fontSize: 200,
            color: COLORS.yellow,
            lineHeight: 1,
            letterSpacing: '.02em',
            opacity: line2,
            transform: `translateY(${(1 - line2) * 30}px)`,
            marginTop: 10,
          }}
        >
          Digitalizada.
        </div>
        <div
          style={{
            fontFamily: '"Space Grotesk", sans-serif',
            fontSize: 28,
            color: 'rgba(255,255,255,.7)',
            letterSpacing: '.15em',
            textTransform: 'uppercase',
            marginTop: 40,
            opacity: subtitle,
          }}
        >
          WavePanel · El software vertical para escuelas de surf
        </div>
      </div>
    </AbsoluteFill>
  );
};
