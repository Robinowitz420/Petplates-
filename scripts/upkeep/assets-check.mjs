import fs from 'node:fs/promises';
import path from 'node:path';

const KB = 1024;
const MB = 1024 * KB;

function formatBytes(bytes) {
  if (bytes >= MB) return `${(bytes / MB).toFixed(2)} MB`;
  if (bytes >= KB) return `${(bytes / KB).toFixed(1)} KB`;
  return `${bytes} B`;
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

function isImageFile(p) {
  const ext = path.extname(p).toLowerCase();
  return ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg', '.avif', '.ico'].includes(ext);
}

async function main() {
  const args = new Set(process.argv.slice(2));
  const strict = args.has('--strict');

  const publicDir = path.join(process.cwd(), 'public');
  const imageWarnThreshold = 500 * KB;
  const anyWarnThreshold = 1 * MB;

  let files;
  try {
    files = await walkFiles(publicDir);
  } catch (err) {
    console.log(`[assets:check] No /public directory found at ${publicDir}`);
    process.exit(0);
    return;
  }

  const fileStats = await Promise.all(
    files.map(async (p) => {
      const stat = await fs.stat(p);
      return {
        path: p,
        rel: path.relative(process.cwd(), p).replaceAll('\\', '/'),
        size: stat.size,
      };
    })
  );

  fileStats.sort((a, b) => b.size - a.size);

  console.log('[assets:check] Top 20 largest /public files');
  fileStats.slice(0, 20).forEach((f, i) => {
    console.log(`${String(i + 1).padStart(2, '0')}. ${formatBytes(f.size)}  ${f.rel}`);
  });

  const warnings = [];
  for (const f of fileStats) {
    if (f.size > anyWarnThreshold) {
      warnings.push({
        rel: f.rel,
        size: f.size,
        reason: `> ${formatBytes(anyWarnThreshold)} (any file)`,
      });
      continue;
    }

    if (isImageFile(f.path) && f.size > imageWarnThreshold) {
      warnings.push({
        rel: f.rel,
        size: f.size,
        reason: `> ${formatBytes(imageWarnThreshold)} (image)`,
      });
    }
  }

  if (warnings.length === 0) {
    console.log('[assets:check] OK: no files exceed warning thresholds.');
    process.exit(0);
    return;
  }

  console.log('');
  console.log(`[assets:check] WARN: ${warnings.length} files exceed thresholds`);
  warnings.slice(0, 50).forEach((w) => {
    console.log(`- ${formatBytes(w.size)}  ${w.rel}  (${w.reason})`);
  });

  if (warnings.length > 50) {
    console.log(`...and ${warnings.length - 50} more`);
  }

  process.exit(strict ? 1 : 0);
}

main().catch((err) => {
  console.error('[assets:check] ERROR:', err);
  process.exit(1);
});
