import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

type AuditRow = {
  name: string;
  packagePrice: number;
  quantity?: string;
  effectivePricePerPound?: number | null;
  priceSource: 'override' | 'package' | 'product' | 'fallback';
};

type AuditFile = {
  generatedAt: string;
  count: number;
  rows: AuditRow[];
};

const threshold = 10;

const auditPath = join(process.cwd(), 'scripts', 'price-audit.json');
const raw = readFileSync(auditPath, 'utf-8');
const data = JSON.parse(raw) as AuditFile;

const rows = (data.rows || [])
  .filter((r) => Number(r.packagePrice) > threshold)
  .sort((a, b) => {
    const pa = Number(a.packagePrice) || 0;
    const pb = Number(b.packagePrice) || 0;
    if (pb !== pa) return pb - pa;
    const pppa = typeof a.effectivePricePerPound === 'number' ? a.effectivePricePerPound : -1;
    const pppb = typeof b.effectivePricePerPound === 'number' ? b.effectivePricePerPound : -1;
    return pppb - pppa;
  });

const lines = rows.map((r) => {
  const qty = r.quantity ? ` [${r.quantity}]` : '';
  const ppp = typeof r.effectivePricePerPound === 'number' && Number.isFinite(r.effectivePricePerPound)
    ? ` ($${r.effectivePricePerPound.toFixed(2)}/lb)`
    : '';
  return `${r.name} — $${Number(r.packagePrice).toFixed(2)}${qty}${ppp} — ${r.priceSource}`;
});

const outPath = join(process.cwd(), 'scripts', 'price-over-10.txt');
writeFileSync(outPath, lines.join('\n') + '\n', 'utf-8');

console.log(`COUNT ${lines.length}`);
console.log(outPath);
