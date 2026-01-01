import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      'prefer-const': 'warn',
      'react-hooks/purity': 'warn',
      'react/no-unescaped-entities': 'off',
      'react-hooks/set-state-in-effect': 'off',
    },
  },
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'node_modules/**',
    '.vercel/**',
    'next-env.d.ts',
    'pet-ingredient-scraper/**',
    'pet-recipe-scraper/**',
    'scraping/**',
    'SEO/**',
    'scripts/**',
    '**/*.xml',
    '**/*.md',
    '**/*.csv',
    '**/*.txt',
    'validation-report.json',
    'data-context.xml',
    'ui-context.xml',
    'repomix-output.xml',
    'lean-*.xml',
    'logic-*.xml',
    'final-clean-code.xml',
    'mini-code.xml',
    'genius-upgrade.xml',
  ]),
]);

export default eslintConfig;
