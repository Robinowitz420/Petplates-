import { execSync } from 'child_process';

const isCI =
  process.env.CI ||
  process.env.VERCEL ||
  process.env.GITHUB_ACTIONS ||
  process.env.BUILDKITE;

if (isCI) {
  console.log('Skipping husky install in CI');
  process.exit(0);
}

try {
  execSync('husky install', { stdio: 'inherit' });
} catch (error) {
  console.log('Husky install skipped/failed:', error?.message || error);
}
