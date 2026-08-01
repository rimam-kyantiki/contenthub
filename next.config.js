/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.instagram.com' },
      { protocol: 'https', hostname: '*.fbcdn.net' },
      { protocol: 'https', hostname: '*.ngrok-free.app' },
      { protocol: 'https', hostname: '*.vercel.app' }
    ],
  },
};
module.exports = nextConfig;