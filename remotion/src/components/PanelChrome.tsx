import { COLORS } from '../constants';
import { ReactNode } from 'react';

type Props = {
  url: string;
  active: 'dashboard' | 'calendar' | 'reservations' | 'clients';
  children: ReactNode;
  title: string;
  cta?: { label: string; yellow?: boolean };
  secondaryCta?: string;
};

const navItems = [
  { group: 'General' },
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'calendar', label: 'Calendario', icon: '📅' },
  { id: 'reservations', label: 'Reservas', icon: '📋' },
  { id: 'clients', label: 'Clientes', icon: '👥' },
  { group: 'Surf Camps' },
  { id: 'camps', label: 'Ediciones', icon: '🏕️' },
  { id: 'rooms', label: 'Habitaciones', icon: '🏨' },
  { group: 'Tienda' },
  { id: 'products', label: 'Productos', icon: '🛒' },
  { id: 'orders', label: 'Pedidos', icon: '📦' },
];

export const PanelChrome = ({ url, active, children, title, cta, secondaryCta }: Props) => {
  return (
    <div
      style={{
        width: '88%',
        margin: '0 auto',
        background: '#f3f0e8',
        borderRadius: 20,
        overflow: 'hidden',
        boxShadow: '0 50px 120px rgba(15,47,57,.30)',
        border: `1px solid ${COLORS.line}`,
      }}
    >
      {/* browser bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          background: '#ebe5d5',
          padding: '16px 22px',
          borderBottom: `1px solid ${COLORS.line}`,
        }}
      >
        <div style={{ display: 'flex', gap: 10 }}>
          <span style={{ width: 16, height: 16, borderRadius: '50%', background: '#ff5f57' }} />
          <span style={{ width: 16, height: 16, borderRadius: '50%', background: '#febc2e' }} />
          <span style={{ width: 16, height: 16, borderRadius: '50%', background: '#28c840' }} />
        </div>
        <div
          style={{
            flex: 1,
            background: '#fff',
            borderRadius: 10,
            padding: '10px 20px',
            fontFamily: '"Space Grotesk", sans-serif',
            fontSize: 16,
            color: COLORS.muted,
            textAlign: 'center',
            border: `1px solid #dcd4c1`,
          }}
        >
          {url}
        </div>
      </div>

      {/* panel */}
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', minHeight: 720 }}>
        {/* sidebar */}
        <aside
          style={{
            background: COLORS.navy,
            color: 'rgba(255,255,255,.85)',
            padding: '24px 0',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          <div
            style={{
              fontFamily: '"Space Grotesk", sans-serif',
              fontWeight: 700,
              fontSize: 20,
              padding: '0 24px 20px',
              borderBottom: '1px solid rgba(255,255,255,.08)',
              marginBottom: 14,
              color: '#fff',
            }}
          >
            wave<span style={{ color: COLORS.yellow }}>panel</span>
          </div>
          {navItems.map((item, i) =>
            'group' in item ? (
              <div
                key={i}
                style={{
                  padding: '10px 20px 4px',
                  fontFamily: '"Space Grotesk", sans-serif',
                  fontSize: 12,
                  textTransform: 'uppercase',
                  letterSpacing: '.1em',
                  color: 'rgba(255,255,255,.4)',
                  marginTop: 8,
                }}
              >
                {item.group}
              </div>
            ) : (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '11px 24px',
                  fontSize: 16,
                  color: item.id === active ? COLORS.yellow : 'rgba(255,255,255,.75)',
                  background: item.id === active ? 'rgba(255,204,1,.12)' : 'transparent',
                  boxShadow: item.id === active ? `inset 4px 0 0 ${COLORS.yellow}` : 'none',
                  fontWeight: item.id === active ? 600 : 400,
                }}
              >
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                <span>{item.label}</span>
              </div>
            )
          )}
        </aside>

        {/* main */}
        <main style={{ padding: '28px 36px', background: '#fafaf5', overflow: 'hidden' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 22,
              gap: 12,
            }}
          >
            <div
              style={{
                fontFamily: '"Space Grotesk", sans-serif',
                fontWeight: 700,
                color: COLORS.navy,
                fontSize: 22,
              }}
            >
              {title}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              {secondaryCta && (
                <button
                  style={{
                    background: '#fff',
                    color: COLORS.navy,
                    border: `1px solid ${COLORS.line}`,
                    borderRadius: 10,
                    padding: '9px 16px',
                    fontSize: 14,
                    fontWeight: 600,
                    fontFamily: '"Space Grotesk", sans-serif',
                  }}
                >
                  {secondaryCta}
                </button>
              )}
              {cta && (
                <button
                  style={{
                    background: cta.yellow ? COLORS.yellow : COLORS.navy,
                    color: cta.yellow ? COLORS.navy : '#fff',
                    border: 'none',
                    borderRadius: 10,
                    padding: '9px 18px',
                    fontSize: 14,
                    fontWeight: 600,
                    fontFamily: '"Space Grotesk", sans-serif',
                  }}
                >
                  {cta.label}
                </button>
              )}
            </div>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
};
