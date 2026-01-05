import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const PRODUCT_DATA = require('../data/product-prices-UPDATED.json') as Array<{
  ingredient: string;
  price?: { amount?: number | null };
  quantity?: string | null;
}>;

function normalizePounds(quantityRaw: string | null | undefined): number | null {
  if (!quantityRaw) return null;
  const quantity = quantityRaw.toLowerCase();

  const lbMatch = quantity.match(/(\d+(?:\.\d+)?)\s*(?:lb|lbs|pound|pounds)/);
  if (lbMatch) return parseFloat(lbMatch[1]);

  const ozMatch = quantity.match(/(\d+(?:\.\d+)?)\s*(?:oz|ounce|ounces)/);
  if (ozMatch) return parseFloat(ozMatch[1]) / 16;

  const kgMatch = quantity.match(/(\d+(?:\.\d+)?)\s*(?:kg|kilogram|kilograms)/);
  if (kgMatch) return parseFloat(kgMatch[1]) * 2.20462;

  const gMatch = quantity.match(/(\d+(?:\.\d+)?)\s*(?:g|gram|grams)/);
  if (gMatch) return parseFloat(gMatch[1]) / 453.592;

  const countMatch = quantity.match(/(\d+)\s*(?:count|piece|pieces|egg|eggs|can|cans|jar|jars|box|boxes|bag|bags|head|heads|bunch|bunches)/);
  if (countMatch) {
    const count = parseInt(countMatch[1], 10);
    if (quantity.includes('egg')) return (count * 50) / 453.592; // eggs ~50g each
    if (quantity.includes('can')) return (count * 400) / 453.592;
    if (quantity.includes('jar')) return (count * 500) / 453.592;
    if (quantity.includes('box')) return (count * 300) / 453.592;
    if (quantity.includes('bag')) return (count * 500) / 453.592;
    if (quantity.includes('head')) return (count * 500) / 453.592;
    if (quantity.includes('bunch')) return (count * 200) / 453.592;
    return (count * 100) / 453.592;
  }

  return null;
}

function computePricePerPound(amount: number | null | undefined, quantity: string | null | undefined): number | null {
  if (typeof amount !== 'number' || Number.isNaN(amount) || amount <= 0) return null;
  const pounds = normalizePounds(quantity);
  if (!pounds || Number.isNaN(pounds) || pounds <= 0) return null;
  return amount / pounds;
}

const rows = PRODUCT_DATA.map((entry) => {
  const packagePrice = typeof entry.price?.amount === 'number' ? entry.price.amount : null;
  const quantity = entry.quantity ?? null;
  const pricePerPound = computePricePerPound(packagePrice, quantity);

  return {
    ingredient: entry.ingredient,
    packagePrice,
    quantity,
    pricePerPound,
  };
}).filter((row) => typeof row.pricePerPound === 'number' && Number.isFinite(row.pricePerPound ?? NaN));

rows.sort((a, b) => (b.pricePerPound ?? 0) - (a.pricePerPound ?? 0));

const topN = rows.slice(0, 50);

console.log('Top 50 ingredients by price per pound (descending):');
console.log('--------------------------------------------------');
for (const item of topN) {
  const pricePerLb = item.pricePerPound?.toFixed(2) ?? 'N/A';
  const packagePrice = item.packagePrice != null ? item.packagePrice.toFixed(2) : 'N/A';
  console.log(
    `${item.ingredient.padEnd(35)} | $${pricePerLb}/lb | package: $${packagePrice} (${item.quantity ?? 'unknown qty'})`
  );
}

const missingPrice = PRODUCT_DATA.filter((entry) => {
  const pricePerPound = computePricePerPound(entry.price?.amount ?? null, entry.quantity);
  return pricePerPound === null;
});

console.log('\nIngredients with missing price data:', missingPrice.length);
if (missingPrice.length > 0) {
  console.log(missingPrice.slice(0, 10).map((entry) => entry.ingredient).join(', '));
  if (missingPrice.length > 10) {
    console.log('...');
  }
}
