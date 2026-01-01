/** @type {import('next').NextConfig} */
import path from 'path';
import { fileURLToPath } from 'url';
import bundleAnalyzer from '@next/bundle-analyzer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig = {
  // Ensure Turbopack resolves the correct project root when running in
  // environments where `node_modules` may be hoisted to a parent folder.
  turbopack: {
    root: path.resolve(__dirname, '..'),
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    localPatterns: [
      {
        pathname: '/images/**',
        search: '',
      },
      {
        pathname: '/images/**',
        search: '?v=2025-12-30',
      },
    ],
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
  async headers() {
    const isPreview = process.env.VERCEL_ENV === 'preview';

    const noindexHeaders = [
      {
        key: 'X-Robots-Tag',
        value: 'noindex, nofollow',
      },
    ];

    if (isPreview) {
      return [
        {
          source: '/:path*',
          headers: noindexHeaders,
        },
      ];
    }

    return [
      {
        source: '/profile/:path*',
        headers: noindexHeaders,
      },
      {
        source: '/category/:path*',
        headers: noindexHeaders,
      },
      {
        source: '/dashboard/:path*',
        headers: noindexHeaders,
      },
      {
        source: '/pets/:path*',
        headers: noindexHeaders,
      },
      {
        source: '/recipe/:path*',
        headers: noindexHeaders,
      },
      {
        source: '/recipes/:path*',
        headers: noindexHeaders,
      },
      {
        source: '/sign-in/:path*',
        headers: noindexHeaders,
      },
      {
        source: '/sign-up/:path*',
        headers: noindexHeaders,
      },
      {
        source: '/api/:path*',
        headers: noindexHeaders,
      },
      {
        source: '/diagnostics/:path*',
        headers: noindexHeaders,
      },
    ];
  },
};

export default withBundleAnalyzer(nextConfig);
