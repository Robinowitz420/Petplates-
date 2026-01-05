import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = process.cwd();
const INPUT_DIR = path.join(ROOT, 'public', 'images', 'Buttons', 'Alphabet');
const BACKUP_DIR = path.join(INPUT_DIR, '__backup__');
const TARGET_SIZE = 256;

async function main() {
  await fs.mkdir(BACKUP_DIR, { recursive: true });

  const files = (await fs.readdir(INPUT_DIR))
    .filter((f) => /^[a-z]\.png$/i.test(f))
    .sort((a, b) => a.localeCompare(b));

  if (files.length === 0) {
    throw new Error(`No alphabet pngs found in ${INPUT_DIR}`);
  }

  for (const file of files) {
    const inputPath = path.join(INPUT_DIR, file);
    const backupPath = path.join(BACKUP_DIR, file);

    // Backup once
    try {
      await fs.access(backupPath);
    } catch {
      await fs.copyFile(inputPath, backupPath);
    }

    const out = await sharp(inputPath)
      .resize(TARGET_SIZE, TARGET_SIZE, {
        fit: 'contain',
        position: 'center',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toBuffer();

    await fs.writeFile(inputPath, out);
  }

  console.log(`✅ Normalized ${files.length} images to ${TARGET_SIZE}x${TARGET_SIZE}`);
  console.log(`📦 Backup saved to: ${BACKUP_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});