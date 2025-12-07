/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  // Ensure Turbopack resolves the correct project root when running in
  // environments where `node_modules` may be hoisted to a parent folder.
  turbopack: {
    root: path.resolve(__dirname),
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'source.unsplash.com',
      },
    ],
  },
};

module.exports = nextConfig;
