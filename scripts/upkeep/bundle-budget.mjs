import fs from 'node:fs/promises';
import path from 'node:path';

function formatBytes(bytes) {
  const KB = 1024;
  const MB = 1024 * KB;
  if (bytes >= MB) return `${(bytes / MB).toFixed(2)} MB`;
  if (bytes >= KB) return `${(bytes / KB).toFixed(1)} KB`;
  return `${bytes} B`;
}

async function fileExists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function walkFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const results = [];

  await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        results.push(...(await walkFiles(fullPath)));
      } else if (entry.isFile()) {
        results.push(fullPath);
      }
    })
  );

  return results;
}

async function computeJsBytes(nextStaticDir) {
  const files = await walkFiles(nextStaticDir);
  const jsFiles = files.filter((p) => p.endsWith('.js'));

  let total = 0;
  for (const p of jsFiles) {
    const stat = await fs.stat(p);
    total += stat.size;
  }

  return { totalJsBytes: total, jsFileCount: jsFiles.length };
}

async function main() {
  const args = new Set(process.argv.slice(2));
  const strict = args.has('--strict');

  const baselinePath = path.join(process.cwd(), '.upkeep', 'bundle-baseline.json');
  const nextStaticDir = path.join(process.cwd(), '.next', 'static');
  const maxIncreaseRatio = 0.15;

  if (!(await fileExists(nextStaticDir))) {
    console.log(`[bundle:check] No .next/static directory found at ${nextStaticDir}. Run a build first.`);
    process.exit(0);
    return;
  }

  const current = await computeJsBytes(nextStaticDir);
  console.log(`[bundle:check] Current .next/static JS total: ${formatBytes(current.totalJsBytes)} (${current.jsFileCount} files)`);

  if (!(await fileExists(baselinePath))) {
    await fs.mkdir(path.dirname(baselinePath), { recursive: true });
    await fs.writeFile(
      baselinePath,
      JSON.stringify(
        {
          createdAt: new Date().toISOString(),
          nextStatic: current,
        },
        null,
        2
      )
    );
    console.log(`[bundle:check] Baseline did not exist; wrote baseline to ${baselinePath}`);
    process.exit(0);
    return;
  }

  const baseline = JSON.parse(await fs.readFile(baselinePath, 'utf8'));
  const baselineTotal = baseline?.nextStatic?.totalJsBytes;
  if (typeof baselineTotal !== 'number' || baselineTotal <= 0) {
    console.log(`[bundle:check] Baseline file exists but is invalid; rewriting baseline at ${baselinePath}`);
    await fs.writeFile(
      baselinePath,
      JSON.stringify(
        {
          createdAt: new Date().toISOString(),
          nextStatic: current,
        },
        null,
        2
      )
    );
    process.exit(0);
    return;
  }

  const ratio = (current.totalJsBytes - baselineTotal) / baselineTotal;
  const pct = (ratio * 100).toFixed(1);

  if (ratio <= maxIncreaseRatio) {
    console.log(`[bundle:check] OK: bundle delta ${pct}% (<= ${(maxIncreaseRatio * 100).toFixed(0)}%)`);
    process.exit(0);
    return;
  }

  console.log(
    `[bundle:check] WARN: bundle increased by ${pct}% (baseline ${formatBytes(baselineTotal)} -> current ${formatBytes(
      current.totalJsBytes
    )})`
  );
  console.log(`[bundle:check] To update baseline intentionally, run: npm run bundle:baseline`);

  process.exit(strict ? 1 : 0);
}

main().catch((err) => {
  console.error('[bundle:check] ERROR:', err);
  process.exit(1);
});
