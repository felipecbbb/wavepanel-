import type { Metadata } from 'next';
import { Manrope, Bebas_Neue, Space_Grotesk } from 'next/font/google';
import './globals.css';

const manrope = Manrope({
  variable: '--font-manrope',
  subsets: ['latin'],
  display: 'swap',
});

const bebas = Bebas_Neue({
  weight: '400',
  variable: '--font-bebas',
  subsets: ['latin'],
  display: 'swap',
});

const space = Space_Grotesk({
  variable: '--font-space',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'WavePanel — Software de gestión para escuelas de surf, kite y deportes acuáticos',
  description:
    'Reservas, clientes, tienda, surf camps y pagos. Sin comisión por reserva. 14 días gratis.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es"
      className={`${manrope.variable} ${bebas.variable} ${space.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg text-ink">{children}</body>
    </html>
  );
}
