import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async rewrites() {
    return {
      beforeFiles: [
        // La raíz sirve la landing HTML estática desde public/index.html.
        // El resto de .html (planes.html, etc.) los sirve Next.js automáticamente
        // porque viven en public/.
        { source: '/', destination: '/index.html' },
        // URLs limpias (sin .html) para páginas estáticas concretas.
        { source: '/docs/pitch-deck', destination: '/docs/pitch-deck.html' },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
