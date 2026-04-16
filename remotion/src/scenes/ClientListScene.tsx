import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig } from 'remotion';
import { COLORS } from '../constants';
import { PanelChrome } from '../components/PanelChrome';

type Row = {
  initials: string;
  name: string;
  activity: string;
  time: string;
  pax: string;
  status: 'confirmada' | 'pendiente' | 'bono' | 'cancelada';
  payment: string;
  avatarColor: 'yellow' | 'blue' | 'rose' | 'navy';
};

const rows: Row[] = [
  { initials: 'AG', name: 'Alba García', activity: 'Grupal · Surf', time: '10:00', pax: '1', status: 'confirmada', payment: '45 €', avatarColor: 'yellow' },
  { initials: 'JM', name: 'Javi Martín', activity: 'Privada · Kite', time: '10:00', pax: '2', status: 'confirmada', payment: '130 €', avatarColor: 'blue' },
  { initials: 'NS', name: 'Nuria Sánchez', activity: 'Yoga surf', time: '10:00', pax: '1', status: 'pendiente', payment: '25 €', avatarColor: 'rose' },
  { initials: 'PR', name: 'Pablo Ruiz', activity: 'Grupal · SUP', time: '16:00', pax: '2', status: 'confirmada', payment: '70 €', avatarColor: 'navy' },
  { initials: 'LC', name: 'Lucía Costa', activity: 'Niños · Surf', time: '16:00', pax: '1', status: 'bono', payment: 'Bono 5', avatarColor: 'blue' },
  { initials: 'MF', name: 'Marta Freire', activity: 'Grupal · Surf', time: '18:00', pax: '3', status: 'confirmada', payment: '105 €', avatarColor: 'yellow' },
  { initials: 'IT', name: 'Iria Torres', activity: 'Surfskate', time: '18:00', pax: '1', status: 'cancelada', payment: '—', avatarColor: 'rose' },
];

const statusStyles: Record<Row['status'], { bg: string; color: string; label: string }> = {
  confirmada: { bg: '#d4f5dd', color: '#166534', label: 'Confirmada' },
  pendiente: { bg: '#fef3c7', color: '#92400e', label: 'Pendiente' },
  bono: { bg: '#dce7ea', color: COLORS.navy, label: 'Bono' },
  cancelada: { bg: '#eae4d4', color: COLORS.muted, label: 'Cancelada' },
};

const avatarColors = {
  yellow: 'linear-gradient(135deg,#ffd54f,#ff9800)',
  blue: 'linear-gradient(135deg,#26a69a,#00796b)',
  rose: 'linear-gradient(135deg,#f06292,#c2185b)',
  navy: 'linear-gradient(135deg,#214a57,#0f2f39)',
};

export const ClientListScene = () => {
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
          Listado de reservas del día · con estado y método de pago
        </div>

        <PanelChrome
          url="panel.tuescuela.com/reservas"
          active="reservations"
          title="Reservas · 16 abril 2026"
          cta={{ label: '⤓ Exportar CSV' }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', border: `1px solid ${COLORS.line}`, borderRadius: 10, overflow: 'hidden', fontSize: 15 }}>
            <thead>
              <tr>
                {['Cliente', 'Actividad', 'Hora', 'Pax', 'Estado', 'Pago'].map((h) => (
                  <th
                    key={h}
                    style={{
                      background: '#f3f0e8',
                      padding: '14px 18px',
                      textAlign: 'left',
                      fontFamily: '"Space Grotesk", sans-serif',
                      fontSize: 11,
                      textTransform: 'uppercase',
                      letterSpacing: '.06em',
                      color: COLORS.navy,
                      fontWeight: 700,
                      borderBottom: `1px solid ${COLORS.line}`,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => {
                const rowFrame = frame - 20 - i * 6;
                const op = spring({ frame: rowFrame, fps, config: { damping: 22 } });
                return (
                  <tr key={r.initials + r.time} style={{ opacity: op, transform: `translateX(${(1 - op) * -30}px)` }}>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: '50%',
                            background: avatarColors[r.avatarColor],
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: 13,
                            fontFamily: '"Space Grotesk", sans-serif',
                          }}
                        >
                          {r.initials}
                        </div>
                        {r.name}
                      </div>
                    </td>
                    <td style={tdStyle}>{r.activity}</td>
                    <td style={tdStyle}>{r.time}</td>
                    <td style={tdStyle}>{r.pax}</td>
                    <td style={tdStyle}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '5px 12px',
                          borderRadius: 999,
                          fontSize: 12,
                          fontWeight: 700,
                          fontFamily: '"Space Grotesk", sans-serif',
                          textTransform: 'uppercase',
                          letterSpacing: '.04em',
                          background: statusStyles[r.status].bg,
                          color: statusStyles[r.status].color,
                        }}
                      >
                        {statusStyles[r.status].label}
                      </span>
                    </td>
                    <td style={tdStyle}>{r.payment}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </PanelChrome>
      </div>
    </AbsoluteFill>
  );
};

const tdStyle: React.CSSProperties = {
  padding: '14px 18px',
  borderBottom: `1px solid #ece6d4`,
  color: COLORS.text,
};
