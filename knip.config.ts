import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  entry: [
    'app/**/*.{ts,tsx}',
    'pages/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    'hooks/**/*.{ts,tsx}',
    'lib/**/*.{ts,tsx}',
  ],
  project: ['**/*.{ts,tsx}'],
  ignore: [
    '**/*.test.{ts,tsx}',
    '**/*.spec.{ts,tsx}',
    'scripts/**',
    'pet-ingredient-scraper/**',
    'pet-recipe-scraper/**',
    'scraping/**',
    'SEO/**',
  ],
};

export default config;
