import type { NextConfig } from 'next';
import path from 'node:path';

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  async rewrites() {
    return {
      beforeFiles: [
        // La raíz sirve la landing HTML estática desde public/index.html.
        // El resto de .html (planes.html, etc.) los sirve Next.js automáticamente
        // porque viven en public/.
        { source: '/', destination: '/index.html' },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
