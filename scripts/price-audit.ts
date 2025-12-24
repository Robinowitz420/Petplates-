import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { getAllIngredients, type UnifiedIngredient } from '../lib/data/unifiedIngredientRegistry';
import { getIngredientDisplayPricing } from '../lib/data/product-prices';
import { getPackageSize } from '../lib/data/packageSizes';

function normalizeForPricing(name: string): string {
  return String(name || '')
    .toLowerCase()
    .replace(/freeze[- ]dried/gi, '')
    .replace(/fresh is best/gi, '')
    .replace(/organic/gi, '')
    .replace(/premium/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeCsv(value: unknown): string {
  const s = String(value ?? '');
  if (/[\n\r,\"]/g.test(s)) return `\"${s.replace(/"/g, '""')}\"`;
  return s;
}

type AuditRow = {
  id: string;
  name: string;
  category: string;
  priceSource: 'override' | 'package' | 'product' | 'fallback';
  packagePrice: number;
  quantity: string;
  pricePerPound: number | null;
  effectivePricePerPound: number | null;
  asin: string;
  productIngredientKey: string;
  productQuantity: string;
  productName: string;
  productUrl: string;
};

const ingredients: UnifiedIngredient[] = getAllIngredients();

const rows: AuditRow[] = ingredients.map((ing: UnifiedIngredient) => {
  const name = ing.primaryDisplayName;
  const normalizedName = normalizeForPricing(name);

  const pricing = getIngredientDisplayPricing(normalizedName);
  const pricingSource = pricing.priceSource;

  const packageEstimate = getPackageSize(normalizedName);
  const fallbackPackagePrice = Number(packageEstimate?.estimatedCost) || 0;
  const fallbackPounds = (Number(packageEstimate?.typicalSize) || 0) / 453.592;
  const fallbackPricePerPound = fallbackPounds > 0 ? fallbackPackagePrice / fallbackPounds : null;

  const isFallback = pricingSource === 'none' || !(pricing?.packagePrice && pricing.packagePrice > 0);

  const packagePrice = isFallback ? fallbackPackagePrice : (pricing.packagePrice as number);
  const pricePerPound = isFallback ? fallbackPricePerPound : (pricing.pricePerPound || null);

  const effectivePricePerPound = pricePerPound;

  return {
    id: ing.id,
    name,
    category: ing.category,
    priceSource: isFallback ? 'fallback' : (pricingSource as 'override' | 'package' | 'product'),
    packagePrice,
    quantity: String(pricing.quantity || (packageEstimate?.typicalSize ? `${packageEstimate.typicalSize}g` : '') || ''),
    pricePerPound,
    effectivePricePerPound,
    asin: String(pricing.product?.asin || ''),
    productIngredientKey: String(pricing.product?.ingredient || ''),
    productQuantity: String(pricing.product?.quantity || ''),
    productName: String(pricing.product?.productName || ''),
    productUrl: String(pricing.product?.url || ''),
  };
});

rows.sort((a, b) => {
  const ap = a.effectivePricePerPound;
  const bp = b.effectivePricePerPound;
  if (typeof ap === 'number' && typeof bp === 'number') return bp - ap;
  if (typeof ap === 'number') return -1;
  if (typeof bp === 'number') return 1;
  return (b.packagePrice || 0) - (a.packagePrice || 0);
});

const outJson = join(process.cwd(), 'scripts', 'price-audit.json');
const outCsv = join(process.cwd(), 'scripts', 'price-audit.csv');

writeFileSync(outJson, JSON.stringify({ generatedAt: new Date().toISOString(), count: rows.length, rows }, null, 2), 'utf-8');

const header = [
  'id',
  'name',
  'category',
  'priceSource',
  'packagePrice',
  'quantity',
  'pricePerPound',
  'effectivePricePerPound',
  'asin',
  'productIngredientKey',
  'productQuantity',
  'productName',
  'productUrl',
];

const lines = [header.join(',')].concat(
  rows.map((r) =>
    [
      r.id,
      r.name,
      r.category,
      r.priceSource,
      r.packagePrice,
      r.quantity,
      r.pricePerPound ?? '',
      r.effectivePricePerPound ?? '',
      r.asin,
      r.productIngredientKey,
      r.productQuantity,
      r.productName,
      r.productUrl,
    ]
      .map(escapeCsv)
      .join(',')
  )
);

writeFileSync(outCsv, lines.join('\n'), 'utf-8');

const top = rows.slice(0, 20);
console.log(`Wrote ${rows.length} rows:`);
console.log(`- ${outCsv}`);
console.log(`- ${outJson}`);
console.log('Top 20 by effective $/lb (or fallback package price if missing $/lb):');
for (const r of top) {
  const ppp = typeof r.effectivePricePerPound === 'number' ? `$${r.effectivePricePerPound.toFixed(2)}/lb` : '';
  console.log(`- ${r.name} | ${r.priceSource} | $${r.packagePrice.toFixed(2)} ${r.quantity ? `(${r.quantity})` : ''} ${ppp}`);
}
