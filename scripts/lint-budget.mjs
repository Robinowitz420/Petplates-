import { readFile } from 'node:fs/promises';
import { rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';

const REPO_ROOT = process.cwd();
const BUDGET_PATH = path.join(REPO_ROOT, '.upkeep', 'lint-budget.json');

function getEslintJsPath() {
  return path.join(REPO_ROOT, 'node_modules', 'eslint', 'bin', 'eslint.js');
}

async function getLintTargetsFromPackageJson() {
  const pkgRaw = await readFile(path.join(REPO_ROOT, 'package.json'), 'utf8');
  const pkg = JSON.parse(pkgRaw);
  const lintScript = String(pkg?.scripts?.lint || '');

  if (!lintScript.startsWith('eslint ')) {
    throw new Error('package.json scripts.lint must start with "eslint" for lint-budget to reuse the same targets');
  }

  const targets = [];
  const re = /"([^"]+)"/g;
  let match;
  while ((match = re.exec(lintScript)) !== null) {
    targets.push(match[1]);
  }

  if (targets.length === 0) {
    throw new Error('Could not extract lint targets from package.json scripts.lint');
  }

  return targets;
}

async function main() {
  const budgetRaw = await readFile(BUDGET_PATH, 'utf8');
  const budgetJson = JSON.parse(budgetRaw);

  const budget = Number(budgetJson?.maxWarnings);
  if (!Number.isFinite(budget) || budget < 0) {
    throw new Error(`Invalid budget in ${BUDGET_PATH}: expected { "maxWarnings": <number> }`);
  }

  const eslintTargets = await getLintTargetsFromPackageJson();

  const reportPath = path.join(
    os.tmpdir(),
    `eslint-report-${process.pid}-${Date.now()}.json`,
  );

  const eslintJsPath = getEslintJsPath();
  const result = spawnSync(
    process.execPath,
    [eslintJsPath, ...eslintTargets, '--format', 'json', '--output-file', reportPath],
    {
      cwd: REPO_ROOT,
      encoding: 'utf8',
      maxBuffer: 1024 * 1024 * 50,
    },
  );

  const stdout = (result.stdout || '').trim();
  const stderr = (result.stderr || '').trim();

  if (result.error) {
    console.error(result.error);
    if (stderr) console.error(stderr);
    if (stdout) console.error(stdout);
    process.exit(1);
  }

  let report;
  try {
    const reportRaw = await readFile(reportPath, 'utf8');
    report = reportRaw ? JSON.parse(reportRaw) : [];
  } catch {
    if (stderr) {
      console.error(stderr);
    }
    console.error(stdout);
    process.exit(result.status ?? 1);
  } finally {
    await rm(reportPath, { force: true });
  }

  const warnings = report.reduce((acc, file) => acc + (file.warningCount || 0), 0);
  const errors = report.reduce((acc, file) => acc + (file.errorCount || 0), 0);

  console.log(`warnings: ${warnings} (budget: ${budget})`);

  if (errors > 0) {
    process.exit(result.status ?? 1);
  }

  if (warnings > budget) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
