import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = process.cwd();
const INPUT_DIR = path.join(ROOT, 'public', 'images', 'Buttons', 'Alphabet');
const BACKUP_DIR = path.join(INPUT_DIR, '__backup__');
const NUMBERS_DIR = path.join(INPUT_DIR, 'NUMBERS');
const NUMBERS_BACKUP_DIR = path.join(NUMBERS_DIR, '__backup__');
const TARGET_SIZE = 256;

function shouldProcessAlphabetFile(fileName: string): boolean {
  if (fileName === '__backup__') return false;
  if (!fileName.toLowerCase().endsWith('.png')) return false;
  return /^[a-z]\.png$/i.test(fileName) || fileName === 'AND.png' || fileName === 'Dash.png';
}

function shouldProcessNumberFile(fileName: string): boolean {
  if (fileName === '__backup__') return false;
  const lower = fileName.toLowerCase();
  if (!lower.endsWith('.png')) return false;
  if (lower === 'numbersandsymbols.png') return false;
  return true;
}

async function backupOnce(inputPath: string, backupPath: string) {
  try {
    await fs.access(backupPath);
  } catch {
    await fs.copyFile(inputPath, backupPath);
  }
}

async function normalizePngInPlace(inputPath: string) {
  const out = await sharp(inputPath)
    .trim()
    .resize(TARGET_SIZE, TARGET_SIZE, {
      fit: 'contain',
      position: 'center',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  await fs.writeFile(inputPath, out);
}

async function main() {
  await fs.mkdir(BACKUP_DIR, { recursive: true });
  await fs.mkdir(NUMBERS_BACKUP_DIR, { recursive: true });

  const alphabetFiles = (await fs.readdir(INPUT_DIR))
    .filter(shouldProcessAlphabetFile)
    .sort((a, b) => a.localeCompare(b));

  const numberFiles = (await fs.readdir(NUMBERS_DIR))
    .filter(shouldProcessNumberFile)
    .sort((a, b) => a.localeCompare(b));

  if (alphabetFiles.length === 0) {
    throw new Error(`No alphabet pngs found in ${INPUT_DIR}`);
  }

  if (numberFiles.length === 0) {
    throw new Error(`No numbers pngs found in ${NUMBERS_DIR}`);
  }

  for (const file of alphabetFiles) {
    const inputPath = path.join(INPUT_DIR, file);
    const backupPath = path.join(BACKUP_DIR, file);

    await backupOnce(inputPath, backupPath);
    await normalizePngInPlace(inputPath);
  }

  for (const file of numberFiles) {
    const inputPath = path.join(NUMBERS_DIR, file);
    const backupPath = path.join(NUMBERS_BACKUP_DIR, file);

    await backupOnce(inputPath, backupPath);
    await normalizePngInPlace(inputPath);
  }

  console.log(
    `✅ Normalized ${alphabetFiles.length + numberFiles.length} images to ${TARGET_SIZE}x${TARGET_SIZE} ` +
      `(${alphabetFiles.length} alphabet, ${numberFiles.length} numbers)`
  );
  console.log(`📦 Backup saved to: ${BACKUP_DIR}`);
  console.log(`📦 Backup saved to: ${NUMBERS_BACKUP_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});