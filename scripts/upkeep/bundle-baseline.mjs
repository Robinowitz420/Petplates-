import fs from 'node:fs/promises';
import path from 'node:path';

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
  const baselinePath = path.join(process.cwd(), '.upkeep', 'bundle-baseline.json');
  const nextStaticDir = path.join(process.cwd(), '.next', 'static');

  if (!(await fileExists(nextStaticDir))) {
    console.log(`[bundle:baseline] No .next/static directory found at ${nextStaticDir}. Run a build first.`);
    process.exit(1);
    return;
  }

  const current = await computeJsBytes(nextStaticDir);
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

  console.log(`[bundle:baseline] Wrote baseline to ${baselinePath}`);
  process.exit(0);
}

main().catch((err) => {
  console.error('[bundle:baseline] ERROR:', err);
  process.exit(1);
});
