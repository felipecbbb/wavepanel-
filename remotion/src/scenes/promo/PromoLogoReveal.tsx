import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig, interpolate } from 'remotion';
import { COLORS } from '../../constants';

export const PromoLogoReveal = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = spring({ frame, fps, config: { damping: 22 } });
  const scale = interpolate(frame, [0, 90], [0.92, 1.0], { extrapolateRight: 'clamp' });
  const glowOpacity = interpolate(frame, [0, 30, 90], [0, 1, 0.6], { extrapolateRight: 'clamp' });

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
          background: 'radial-gradient(ellipse 40% 30% at 50% 50%, rgba(255,204,1,.2), transparent)',
          opacity: glowOpacity,
        }}
      />
      <div
        style={{
          fontFamily: '"Space Grotesk", sans-serif',
          fontWeight: 700,
          fontSize: 120,
          letterSpacing: '.04em',
          color: '#fff',
          opacity,
          transform: `scale(${scale})`,
          position: 'relative',
        }}
      >
        wave<span style={{ color: COLORS.yellow }}>panel</span>
      </div>
    </AbsoluteFill>
  );
};
