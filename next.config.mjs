/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['zoui'],
  images: {
    remotePatterns: [
      // Imagenes del banco en Cloudflare R2: la url publica de desarrollo (r2.dev) y, en produccion, el dominio de imagenes.
      { protocol: 'https', hostname: '**.r2.dev' },
      ...(process.env.IMAGE_CDN_HOST ? [{ protocol: 'https', hostname: process.env.IMAGE_CDN_HOST }] : []),
    ],
  },
};

export default nextConfig;
