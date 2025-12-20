// next.config.js
const nextConfig = {
  output: 'export',
  basePath: '/ROBINOWITZ420.GITHUB.IO',
  assetPrefix: '/ROBINOWITZ420.GITHUB.IO/',
  env: {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  },
};

module.exports = nextConfig;
