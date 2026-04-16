import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig, interpolate } from 'remotion';
import { COLORS } from '../../constants';
import { PanelChrome } from '../../components/PanelChrome';

const stats = [
  { label: 'Revenue', value: 8420, suffix: '€', trend: '↑ 18% vs marzo' },
  { label: 'Reservas', value: 142, suffix: '', trend: '↑ 12%' },
  { label: 'Clientes nuevos', value: 38, suffix: '', trend: '↑ 24%' },
  { label: 'Ocupación', value: 78, suffix: '%', trend: '↑ 6 pts' },
];

const barHeights = [42, 55, 68, 38, 72, 85, 92, 48, 60, 75, 80, 52, 88, 95];
const barColors = [0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 1, 0, 1, 1];

export const PromoDashboard = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const captionOpacity = spring({ frame, fps, config: { damping: 22 } });
  const panelAppear = spring({ frame: frame - 20, fps, config: { damping: 22 } });

  return (
    <AbsoluteFill
      style={{
        background: COLORS.navy,
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 60px',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: 24, opacity: captionOpacity }}>
        <div
          style={{
            fontFamily: '"Space Grotesk", sans-serif',
            fontSize: 20,
            color: COLORS.yellow,
            letterSpacing: '.2em',
            textTransform: 'uppercase',
            marginBottom: 8,
          }}
        >
          Dashboard
        </div>
        <div
          style={{
            fontFamily: '"Bebas Neue", sans-serif',
            fontSize: 64,
            color: '#fff',
            lineHeight: 1,
          }}
        >
          Todo tu negocio, en datos.
        </div>
      </div>

      <div
        style={{
          width: '100%',
          opacity: panelAppear,
          transform: `translateY(${(1 - panelAppear) * 40}px) scale(${0.95 + panelAppear * 0.05})`,
        }}
      >
        <PanelChrome
          url="panel.tuescuela.com/dashboard"
          active="dashboard"
          title="Dashboard · Abril 2026"
          cta={{ label: 'Abril 2026 ▾' }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
            {stats.map((s, i) => {
              const p = spring({ frame: frame - 30 - i * 8, fps, config: { damping: 24 } });
              const animatedValue = Math.floor(s.value * p);
              return (
                <div
                  key={s.label}
                  style={{
                    background: '#fff',
                    border: `1px solid ${COLORS.line}`,
                    borderRadius: 10,
                    padding: '20px 22px',
                    opacity: p,
                    transform: `translateY(${(1 - p) * 20}px)`,
                  }}
                >
                  <div
                    style={{
                      fontFamily: '"Space Grotesk", sans-serif',
                      fontSize: 13,
                      textTransform: 'uppercase',
                      letterSpacing: '.06em',
                      color: COLORS.muted,
                      marginBottom: 8,
                    }}
                  >
                    {s.label}
                  </div>
                  <div
                    style={{
                      fontFamily: '"Bebas Neue", sans-serif',
                      fontSize: 56,
                      color: COLORS.navy,
                      lineHeight: 1,
                    }}
                  >
                    {animatedValue.toLocaleString('es-ES')}
                    {s.suffix}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#166534', marginTop: 8 }}>
                    {s.trend}
                  </div>
                </div>
              );
            })}
          </div>

          <div
            style={{
              background: '#fff',
              border: `1px solid ${COLORS.line}`,
              borderRadius: 10,
              padding: 24,
              height: 260,
            }}
          >
            <div
              style={{
                fontFamily: '"Space Grotesk", sans-serif',
                fontSize: 15,
                fontWeight: 700,
                color: COLORS.navy,
                marginBottom: 14,
              }}
            >
              Revenue por día · últimos 14 días
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 200 }}>
              {barHeights.map((h, i) => {
                const p = spring({ frame: frame - 60 - i * 4, fps, config: { damping: 18, stiffness: 120 } });
                const height = interpolate(p, [0, 1], [0, h]);
                return (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      height: `${height}%`,
                      background: barColors[i] ? COLORS.navy : COLORS.yellow,
                      borderRadius: '6px 6px 0 0',
                      minHeight: 4,
                    }}
                  />
                );
              })}
            </div>
          </div>
        </PanelChrome>
      </div>
    </AbsoluteFill>
  );
};
