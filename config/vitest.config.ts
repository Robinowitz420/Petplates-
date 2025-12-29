import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '.{idea,git,cache,output,temp}/**',
      'lib/generator/RecipeBuilder.test.ts',
      'lib/generator/RecipeBuilder.integration.test.ts',
      'lib/generator/RecipeBuilder.smoke.test.ts',
      'lib/__tests__/recipe-generator-v2.test.ts',
      'tests/recipe-generation.test.ts',
    ],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '..'),
    },
  },
});