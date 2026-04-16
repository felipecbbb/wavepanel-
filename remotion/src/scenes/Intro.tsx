import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig } from 'remotion';
import { COLORS } from '../constants';

export const Intro = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleSpring = spring({ frame, fps, config: { damping: 16, stiffness: 90 } });
  const kickerOpacity = spring({
    frame: frame - 8,
    fps,
    config: { damping: 20 },
  });

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
            'radial-gradient(ellipse 80% 60% at 70% 40%, rgba(255,204,1,.12), transparent)',
        }}
      />
      <div
        style={{
          position: 'relative',
          textAlign: 'center',
          display: 'grid',
          gap: 24,
          transform: `translateY(${(1 - titleSpring) * 30}px)`,
          opacity: titleSpring,
        }}
      >
        <div
          style={{
            fontFamily: '"Space Grotesk", sans-serif',
            textTransform: 'uppercase',
            letterSpacing: '.25em',
            fontSize: 22,
            color: COLORS.yellow,
            opacity: kickerOpacity,
          }}
        >
          Demo WavePanel
        </div>
        <div
          style={{
            fontFamily: '"Bebas Neue", sans-serif',
            fontSize: 180,
            color: '#fff',
            lineHeight: 1,
            letterSpacing: '.02em',
          }}
        >
          El panel,
          <br />
          <span style={{ color: COLORS.yellow }}>por dentro.</span>
        </div>
        <div
          style={{
            fontFamily: '"Space Grotesk", sans-serif',
            fontSize: 26,
            color: 'rgba(255,255,255,.7)',
            marginTop: 20,
            opacity: kickerOpacity,
          }}
        >
          90 segundos · 0% aburrimiento
        </div>
      </div>
    </AbsoluteFill>
  );
};
