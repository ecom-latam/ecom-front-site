import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['zoui'],
  distDir: process.env.NEXT_DIST_DIR || '.next',
  // Next 16 por defecto frena el primer build/dev de cada sesión con un aviso de upgrade de
  // seguridad cuando detecta que corre bajo un agente (como Claude Code) y exige reintentar.
  // Lo desactivamos: acá el build lo corren personas o el propio agente, no tiene sentido
  // bloquear cada corrida — las actualizaciones de Next se deciden en EC-1522, no acá.
  experimental: { agentUpgrade: false },
  // zoui se enlaza desde fuera del proyecto: Turbopack necesita ver la carpeta que contiene a los dos.
  turbopack: { root: path.resolve(here, '../..') },
  async headers() {
    if (process.env.NOINDEX !== 'true') return [];
    return [{ source: '/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] }];
  },
  images: {
    remotePatterns: [
      // Imagenes del banco en Cloudflare R2: la url publica de desarrollo (r2.dev) y, en produccion, el dominio de imagenes.
      { protocol: 'https', hostname: '**.r2.dev' },
      ...(process.env.IMAGE_CDN_HOST ? [{ protocol: 'https', hostname: process.env.IMAGE_CDN_HOST }] : []),
    ],
  },
};

export default nextConfig;
