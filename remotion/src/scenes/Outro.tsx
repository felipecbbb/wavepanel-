import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig } from 'remotion';
import { COLORS } from '../constants';

export const Outro = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 18 } });

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
          display: 'grid',
          gap: 30,
          opacity: enter,
          transform: `scale(${0.9 + enter * 0.1})`,
        }}
      >
        <div
          style={{
            fontFamily: '"Space Grotesk", sans-serif',
            textTransform: 'uppercase',
            letterSpacing: '.25em',
            fontSize: 22,
            color: COLORS.navy,
            opacity: 0.6,
          }}
        >
          WavePanel
        </div>
        <div
          style={{
            fontFamily: '"Bebas Neue", sans-serif',
            fontSize: 140,
            color: COLORS.navy,
            lineHeight: 1,
            letterSpacing: '.02em',
          }}
        >
          Tu escuela.
          <br />
          Digitalizada.
        </div>
        <div
          style={{
            fontFamily: '"Space Grotesk", sans-serif',
            fontSize: 28,
            color: COLORS.navy,
            fontWeight: 600,
            marginTop: 20,
          }}
        >
          wavepanel.com · 14 días gratis
        </div>
      </div>
    </AbsoluteFill>
  );
};
