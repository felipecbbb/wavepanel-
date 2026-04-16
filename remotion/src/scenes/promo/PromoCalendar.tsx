import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig } from 'remotion';
import { COLORS } from '../../constants';
import { PanelChrome } from '../../components/PanelChrome';

type EventCell = { col: number; row: number; label: string; sub: string; color: 'yellow' | 'navy' | 'teal' };

const events: EventCell[] = [
  { col: 1, row: 0, label: 'Grupal · Surf', sub: '8/10 · Marcos', color: 'yellow' },
  { col: 3, row: 0, label: 'Privada · Kite', sub: '2/2 · Ana', color: 'navy' },
  { col: 5, row: 0, label: 'Yoga surf', sub: '6/8 · Lara', color: 'teal' },
  { col: 2, row: 1, label: 'Grupal · Surf', sub: '10/10 · Marcos', color: 'yellow' },
  { col: 4, row: 1, label: 'Privada · Surf', sub: '1/2 · Diego', color: 'navy' },
  { col: 1, row: 2, label: 'Niños · Surf', sub: '4/6 · Lara', color: 'teal' },
  { col: 2, row: 2, label: 'Grupal · SUP', sub: '5/8 · Diego', color: 'yellow' },
  { col: 4, row: 2, label: 'Grupal · Surf', sub: '9/10 · Marcos', color: 'yellow' },
];

const colorMap = {
  yellow: { bg: COLORS.yellow, fg: COLORS.navy },
  navy: { bg: COLORS.navy, fg: '#fff' },
  teal: { bg: '#26a69a', fg: '#fff' },
};

const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'];
const hours = ['10:00', '12:00', '16:00'];

export const PromoCalendar = () => {
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
      <div
        style={{
          textAlign: 'center',
          marginBottom: 24,
          opacity: captionOpacity,
        }}
      >
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
          Calendario
        </div>
        <div
          style={{
            fontFamily: '"Bebas Neue", sans-serif',
            fontSize: 64,
            color: '#fff',
            lineHeight: 1,
          }}
        >
          Toda tu semana en una pantalla.
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
          url="panel.tuescuela.com/calendario"
          active="calendar"
          title="Calendario · Semana 16 — 22 abril"
          cta={{ label: '+ Nueva reserva', yellow: true }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `80px repeat(${days.length}, 1fr)`,
              background: '#fff',
              border: `1px solid ${COLORS.line}`,
              borderRadius: 10,
              overflow: 'hidden',
            }}
          >
            <div style={{ background: '#f3f0e8', padding: '14px 8px', borderRight: `1px solid ${COLORS.line}`, borderBottom: `1px solid ${COLORS.line}` }} />
            {days.map((d) => (
              <div
                key={d}
                style={{
                  background: '#f3f0e8',
                  padding: '14px 8px',
                  fontFamily: '"Space Grotesk", sans-serif',
                  fontWeight: 700,
                  textAlign: 'center',
                  color: COLORS.navy,
                  fontSize: 16,
                  textTransform: 'uppercase',
                  letterSpacing: '.04em',
                  borderRight: `1px solid ${COLORS.line}`,
                  borderBottom: `1px solid ${COLORS.line}`,
                }}
              >
                {d}
              </div>
            ))}

            {hours.map((h, rowIdx) => (
              <>
                <div
                  key={`h-${h}`}
                  style={{
                    background: '#f3f0e8',
                    fontWeight: 700,
                    fontSize: 14,
                    textAlign: 'center',
                    padding: '36px 4px',
                    color: COLORS.navy,
                    borderRight: `1px solid ${COLORS.line}`,
                    borderBottom: `1px solid ${COLORS.line}`,
                    fontFamily: '"Space Grotesk", sans-serif',
                  }}
                >
                  {h}
                </div>
                {Array.from({ length: 5 }).map((_, colIdx) => {
                  const ev = events.find((e) => e.row === rowIdx && e.col === colIdx + 1);
                  const appearFrame = (rowIdx * 5 + colIdx) * 4 + 40;
                  const appear = ev
                    ? spring({ frame: frame - appearFrame, fps, config: { damping: 18 } })
                    : 0;
                  return (
                    <div
                      key={`c-${rowIdx}-${colIdx}`}
                      style={{
                        position: 'relative',
                        minHeight: 100,
                        borderRight: colIdx === 4 ? 'none' : `1px solid ${COLORS.line}`,
                        borderBottom: `1px solid ${COLORS.line}`,
                      }}
                    >
                      {ev && (
                        <div
                          style={{
                            position: 'absolute',
                            inset: '6px 8px',
                            background: colorMap[ev.color].bg,
                            color: colorMap[ev.color].fg,
                            borderRadius: 8,
                            padding: '10px 12px',
                            fontSize: 15,
                            fontWeight: 600,
                            fontFamily: '"Space Grotesk", sans-serif',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 3,
                            opacity: appear,
                            transform: `scale(${0.9 + appear * 0.1})`,
                          }}
                        >
                          {ev.label}
                          <span style={{ opacity: 0.75, fontWeight: 400, fontSize: 13 }}>
                            {ev.sub}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </>
            ))}
          </div>
        </PanelChrome>
      </div>
    </AbsoluteFill>
  );
};
