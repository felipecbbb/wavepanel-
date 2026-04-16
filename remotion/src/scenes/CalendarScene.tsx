import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig } from 'remotion';
import { COLORS } from '../constants';
import { PanelChrome } from '../components/PanelChrome';

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
  { col: 5, row: 2, label: 'Privada · Kite', sub: '2/2 · Ana', color: 'navy' },
  { col: 2, row: 3, label: 'Grupal · Surf', sub: '7/10 · Marcos', color: 'yellow' },
  { col: 3, row: 3, label: 'Surfskate', sub: '3/6 · Diego', color: 'teal' },
];

const colorMap = {
  yellow: { bg: COLORS.yellow, fg: COLORS.navy },
  navy: { bg: COLORS.navy, fg: '#fff' },
  teal: { bg: '#26a69a', fg: '#fff' },
};

const days = ['Lun 16', 'Mar 17', 'Mié 18', 'Jue 19', 'Vie 20'];
const hours = ['10:00', '12:00', '16:00', '18:00'];

export const CalendarScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 20 } });

  return (
    <AbsoluteFill
      style={{
        background: COLORS.sand,
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 0',
      }}
    >
      <div
        style={{
          width: '100%',
          opacity: enter,
          transform: `translateY(${(1 - enter) * 40}px)`,
        }}
      >
        <Caption text="Calendario visual · sesiones y asignación de instructores" />
        <PanelChrome
          url="panel.tuescuela.com/calendario"
          active="calendar"
          title="Calendario · Semana 16 — 22 abril"
          cta={{ label: '+ Nueva reserva', yellow: true }}
          secondaryCta="Hoy"
        >
          <div
            style={{
              display: 'flex',
              gap: 6,
              borderBottom: `1px solid ${COLORS.line}`,
              marginBottom: 16,
            }}
          >
            {['Día', 'Semana', 'Mes'].map((t, i) => (
              <div
                key={t}
                style={{
                  padding: '10px 20px',
                  fontSize: 15,
                  fontWeight: 500,
                  color: i === 1 ? COLORS.navy : COLORS.muted,
                  borderBottom: i === 1 ? `2px solid ${COLORS.yellow}` : '2px solid transparent',
                  marginBottom: -1,
                  fontFamily: '"Space Grotesk", sans-serif',
                }}
              >
                {t}
              </div>
            ))}
          </div>

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
            <HeaderCell />
            {days.map((d) => (
              <HeaderCell key={d} text={d} />
            ))}

            {hours.map((h, rowIdx) => (
              <Row key={h} hour={h} rowIdx={rowIdx} frame={frame} fps={fps} />
            ))}
          </div>
        </PanelChrome>
      </div>
    </AbsoluteFill>
  );
};

const HeaderCell = ({ text }: { text?: string }) => (
  <div
    style={{
      background: '#f3f0e8',
      padding: '12px 8px',
      fontFamily: '"Space Grotesk", sans-serif',
      fontWeight: 700,
      textAlign: 'center',
      color: COLORS.navy,
      fontSize: 13,
      textTransform: 'uppercase',
      letterSpacing: '.04em',
      borderRight: `1px solid ${COLORS.line}`,
      borderBottom: `1px solid ${COLORS.line}`,
    }}
  >
    {text || ''}
  </div>
);

const Row = ({
  hour,
  rowIdx,
  frame,
  fps,
}: {
  hour: string;
  rowIdx: number;
  frame: number;
  fps: number;
}) => {
  const cols = 5;
  return (
    <>
      <div
        style={{
          background: '#f3f0e8',
          fontWeight: 700,
          fontSize: 12,
          textAlign: 'center',
          padding: '22px 4px',
          color: COLORS.navy,
          borderRight: `1px solid ${COLORS.line}`,
          borderBottom: `1px solid ${COLORS.line}`,
          fontFamily: '"Space Grotesk", sans-serif',
        }}
      >
        {hour}
      </div>
      {Array.from({ length: cols }).map((_, colIdx) => {
        const ev = events.find((e) => e.row === rowIdx && e.col === colIdx + 1);
        const appearFrame = (rowIdx * cols + colIdx) * 3 + 15;
        const appear = ev
          ? spring({ frame: frame - appearFrame, fps, config: { damping: 18 } })
          : 0;
        return (
          <div
            key={colIdx}
            style={{
              position: 'relative',
              minHeight: 80,
              borderRight: colIdx === cols - 1 ? 'none' : `1px solid ${COLORS.line}`,
              borderBottom: `1px solid ${COLORS.line}`,
            }}
          >
            {ev && (
              <div
                style={{
                  position: 'absolute',
                  inset: '4px 6px',
                  background: colorMap[ev.color].bg,
                  color: colorMap[ev.color].fg,
                  borderRadius: 6,
                  padding: '8px 10px',
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: '"Space Grotesk", sans-serif',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                  opacity: appear,
                  transform: `scale(${0.9 + appear * 0.1})`,
                }}
              >
                {ev.label}
                <span style={{ opacity: 0.75, fontWeight: 400, fontSize: 11 }}>{ev.sub}</span>
              </div>
            )}
          </div>
        );
      })}
    </>
  );
};

const Caption = ({ text }: { text: string }) => (
  <div
    style={{
      textAlign: 'center',
      fontFamily: '"Space Grotesk", sans-serif',
      fontSize: 22,
      color: COLORS.navy,
      fontWeight: 600,
      marginBottom: 30,
      letterSpacing: '.02em',
    }}
  >
    {text}
  </div>
);
