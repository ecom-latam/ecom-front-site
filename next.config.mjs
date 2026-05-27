/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['zoui'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
};

export default nextConfig;
