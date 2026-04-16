import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig, interpolate } from 'remotion';
import { COLORS } from '../constants';
import { PanelChrome } from '../components/PanelChrome';

const stats = [
  { label: 'Revenue', value: 8420, prefix: '', suffix: '€', trend: '↑ 18% vs marzo' },
  { label: 'Reservas', value: 142, prefix: '', suffix: '', trend: '↑ 12%' },
  { label: 'Clientes nuevos', value: 38, prefix: '', suffix: '', trend: '↑ 24%' },
  { label: 'Ocupación', value: 78, prefix: '', suffix: '%', trend: '↑ 6 pts' },
];

const barHeights = [42, 55, 68, 38, 72, 85, 92, 48, 60, 75, 80, 52, 88, 95];
const barColors = [0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 1, 0, 1, 1];

export const DashboardScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 20 } });

  return (
    <AbsoluteFill
      style={{
        background: COLORS.bg,
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 0',
      }}
    >
      <div style={{ width: '100%', opacity: enter, transform: `translateY(${(1 - enter) * 40}px)` }}>
        <div
          style={{
            textAlign: 'center',
            fontFamily: '"Space Grotesk", sans-serif',
            fontSize: 22,
            color: COLORS.navy,
            fontWeight: 600,
            marginBottom: 30,
          }}
        >
          Dashboard · revenue, reservas y métricas en tiempo real
        </div>

        <PanelChrome
          url="panel.tuescuela.com/dashboard"
          active="dashboard"
          title="Dashboard · Abril 2026"
          cta={{ label: 'Abril 2026 ▾' }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
            {stats.map((s, i) => {
              const p = spring({ frame: frame - 15 - i * 8, fps, config: { damping: 24 } });
              const animatedValue = Math.floor(s.value * p);
              return (
                <div
                  key={s.label}
                  style={{
                    background: '#fff',
                    border: `1px solid ${COLORS.line}`,
                    borderRadius: 10,
                    padding: '18px 20px',
                    opacity: p,
                    transform: `translateY(${(1 - p) * 20}px)`,
                  }}
                >
                  <div
                    style={{
                      fontFamily: '"Space Grotesk", sans-serif',
                      fontSize: 12,
                      textTransform: 'uppercase',
                      letterSpacing: '.06em',
                      color: COLORS.muted,
                      marginBottom: 6,
                    }}
                  >
                    {s.label}
                  </div>
                  <div
                    style={{
                      fontFamily: '"Bebas Neue", sans-serif',
                      fontSize: 52,
                      color: COLORS.navy,
                      lineHeight: 1,
                    }}
                  >
                    {s.prefix}
                    {animatedValue.toLocaleString('es-ES')}
                    {s.suffix}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#166534', marginTop: 6 }}>
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
              height: 300,
            }}
          >
            <div
              style={{
                fontFamily: '"Space Grotesk", sans-serif',
                fontSize: 14,
                fontWeight: 700,
                color: COLORS.navy,
                marginBottom: 14,
              }}
            >
              Revenue por día · últimos 14 días
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 230 }}>
              {barHeights.map((h, i) => {
                const p = spring({ frame: frame - 45 - i * 3, fps, config: { damping: 18, stiffness: 120 } });
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
