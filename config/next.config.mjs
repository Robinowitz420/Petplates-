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
  experimental: process.platform === 'win32' ? { cpus: 4 } : {},
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
      {
        protocol: 'https',
        hostname: 'unavatar.io',
      },
      {
        protocol: 'https',
        hostname: 'avatar.vercel.sh',
      },
    ],
  },
  async headers() {
    const isPreview = process.env.VERCEL_ENV === 'preview';

    const corsHeaders = [
      {
        key: 'Access-Control-Allow-Origin',
        value: 'http://localhost:3000',
      },
      {
        key: 'Access-Control-Allow-Credentials',
        value: 'true',
      },
      {
        key: 'Access-Control-Allow-Methods',
        value: 'GET, POST, PUT, DELETE, OPTIONS',
      },
      {
        key: 'Access-Control-Allow-Headers',
        value: 'Content-Type, Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version',
      },
    ];

    const swHeaders = [
      {
        key: 'Content-Type',
        value: 'application/javascript; charset=utf-8',
      },
      {
        key: 'Cache-Control',
        value: 'no-cache, no-store, must-revalidate',
      },
    ];

    const noindexHeaders = [
      {
        key: 'X-Robots-Tag',
        value: 'noindex, nofollow',
      },
    ];

    if (isPreview) {
      return [
        {
          source: '/sw.js',
          headers: swHeaders,
        },
        {
          source: '/api/:path*',
          headers: corsHeaders,
        },
        {
          source: '/:path*',
          headers: noindexHeaders,
        },
      ];
    }

    return [
      {
        source: '/sw.js',
        headers: swHeaders,
      },
      {
        source: '/api/:path*',
        headers: [...corsHeaders, ...noindexHeaders],
      },
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
        source: '/diagnostics/:path*',
        headers: noindexHeaders,
      },
    ];
  },
};

export default withBundleAnalyzer(nextConfig);
