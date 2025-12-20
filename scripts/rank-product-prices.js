import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const pricesPath = path.join(root, 'data', 'product-prices.json');

function formatUsd(n) {
  return `$${n.toFixed(2)}`;
}

function csvEscape(v) {
  const s = String(v ?? '');
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function main() {
  const raw = fs.readFileSync(pricesPath, 'utf8');
  const rows = JSON.parse(raw);

  const ranked = rows
    .map((r) => {
      const amount = Number(r?.price?.amount);
      return {
        ingredient: r?.ingredient,
        asin: r?.asin,
        url: r?.url,
        amount: Number.isFinite(amount) ? amount : 0,
        lastUpdated: r?.price?.lastUpdated,
      };
    })
    .filter((r) => r.ingredient && r.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  // Console output (top N)
  const topN = 200;
  console.log(`=== Product Prices Ranked (Top ${Math.min(topN, ranked.length)} of ${ranked.length}) ===`);
  ranked.slice(0, topN).forEach((r, idx) => {
    console.log(`${String(idx + 1).padStart(4, ' ')}. ${formatUsd(r.amount).padStart(8, ' ')}  ${r.ingredient}`);
  });

  // Write full artifacts
  const outJson = path.join(root, 'data', 'price-rankings.json');
  const outCsv = path.join(root, 'data', 'price-rankings.csv');

  fs.writeFileSync(outJson, JSON.stringify({ generatedAt: new Date().toISOString(), ranked }, null, 2));

  const header = ['rank', 'ingredient', 'amount_usd', 'asin', 'url', 'lastUpdated'];
  const csvLines = [header.join(',')];
  ranked.forEach((r, i) => {
    csvLines.push(
      [
        i + 1,
        csvEscape(r.ingredient),
        r.amount.toFixed(2),
        csvEscape(r.asin),
        csvEscape(r.url),
        csvEscape(r.lastUpdated),
      ].join(',')
    );
  });
  fs.writeFileSync(outCsv, csvLines.join('\n'));

  console.log(`\nWrote:`);
  console.log(`- ${outJson}`);
  console.log(`- ${outCsv}`);
}

main();
