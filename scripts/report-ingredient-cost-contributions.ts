import { getAllRecipes } from '../lib/data/baseRecipes';
import { getIngredientDisplayPricing } from '../lib/data/product-prices';

const GRAMS_PER_POUND = 453.592;
const GRAMS_PER_OUNCE = 28.3495;

function quantityTextToGrams(quantityRaw: string | null | undefined): number {
  if (!quantityRaw) return 0;
  const q = String(quantityRaw).toLowerCase().trim();

  const lb = q.match(/(\d+(?:\.\d+)?)\s*(?:lb|lbs|pound|pounds)/);
  if (lb) return parseFloat(lb[1]) * GRAMS_PER_POUND;

  const oz = q.match(/(\d+(?:\.\d+)?)\s*(?:fl\s*)?(?:oz|ounce|ounces)/);
  if (oz) return parseFloat(oz[1]) * GRAMS_PER_OUNCE;

  const kg = q.match(/(\d+(?:\.\d+)?)\s*(?:kg|kilogram|kilograms)/);
  if (kg) return parseFloat(kg[1]) * 1000;

  const g = q.match(/(\d+(?:\.\d+)?)\s*(?:g|gram|grams)/);
  if (g) return parseFloat(g[1]);

  return 0;
}

function amountToGrams(amount: number, unit: string): number {
  const u = String(unit || '').toLowerCase().trim();
  if (!Number.isFinite(amount) || amount <= 0) return 0;

  if (u === 'g' || u === 'gram' || u === 'grams') return amount;
  if (u === 'mg' || u === 'milligram' || u === 'milligrams') return amount / 1000;
  if (u === 'kg' || u === 'kilogram' || u === 'kilograms') return amount * 1000;
  if (u === 'oz' || u === 'ounce' || u === 'ounces') return amount * GRAMS_PER_OUNCE;
  if (u === 'lb' || u === 'lbs' || u === 'pound' || u === 'pounds') return amount * GRAMS_PER_POUND;

  // Volume approximations (water-ish density). Good enough for contribution ranking.
  if (u === 'tsp' || u === 'teaspoon' || u === 'teaspoons') return amount * 5;
  if (u === 'tbsp' || u === 'tablespoon' || u === 'tablespoons') return amount * 15;
  if (u === 'cup' || u === 'cups') return amount * 240;
  if (u === 'ml') return amount;

  // Count/unit fallback
  if (u === 'count') return amount * 50;

  return 0;
}

function getUnitPriceUsdPerGram(ingredientName: string): { unitPrice: number; source: string } | null {
  const p = getIngredientDisplayPricing(ingredientName);

  if (typeof p.pricePerPound === 'number' && Number.isFinite(p.pricePerPound) && p.pricePerPound > 0) {
    return { unitPrice: p.pricePerPound / GRAMS_PER_POUND, source: `${p.priceSource}:ppp` };
  }

  const packagePrice = p.packagePrice;
  const quantity = p.quantity;
  if (typeof packagePrice === 'number' && Number.isFinite(packagePrice) && packagePrice > 0) {
    const grams = quantityTextToGrams(quantity);
    if (grams > 0) {
      return { unitPrice: packagePrice / grams, source: `${p.priceSource}:package` };
    }
  }

  return null;
}

function normalizeKey(name: string): string {
  return String(name || '').toLowerCase().trim().replace(/\s+/g, ' ');
}

type Contribution = {
  totalUsd: number;
  occurrences: number;
  pricedOccurrences: number;
  exampleSource?: string;
};

const recipes = getAllRecipes();

const totals = new Map<string, Contribution>();
const missing = new Map<string, number>();

for (const recipe of recipes) {
  const servingGrams = amountToGrams(recipe.servingSize.amount, recipe.servingSize.unit);

  const ingredientRows: Array<{ name: string; grams: number }> = [];

  for (const ing of recipe.ingredients || []) {
    const grams = amountToGrams(ing.amount, ing.unit);
    if (grams > 0) ingredientRows.push({ name: ing.name, grams });
  }

  for (const supp of recipe.supplements || []) {
    if (supp.unit === 'IU') continue;
    const grams = amountToGrams(supp.amount, supp.unit);
    if (grams > 0) ingredientRows.push({ name: supp.name, grams });
  }

  const totalBatchGrams = ingredientRows.reduce((sum, row) => sum + row.grams, 0);
  const meals = servingGrams > 0 && totalBatchGrams > 0 ? Math.max(1, totalBatchGrams / servingGrams) : 1;

  for (const row of ingredientRows) {
    const key = normalizeKey(row.name);
    if (!key) continue;

    const existing = totals.get(key) || { totalUsd: 0, occurrences: 0, pricedOccurrences: 0 };
    existing.occurrences += 1;

    const unit = getUnitPriceUsdPerGram(row.name);
    if (!unit) {
      missing.set(key, (missing.get(key) || 0) + 1);
      totals.set(key, existing);
      continue;
    }

    const costPerMeal = (row.grams * unit.unitPrice) / meals;
    existing.totalUsd += costPerMeal;
    existing.pricedOccurrences += 1;
    if (!existing.exampleSource) existing.exampleSource = unit.source;
    totals.set(key, existing);
  }
}

const top = Array.from(totals.entries())
  .map(([ingredient, c]) => ({ ingredient, ...c }))
  .filter((x) => Number.isFinite(x.totalUsd) && x.totalUsd > 0)
  .sort((a, b) => b.totalUsd - a.totalUsd)
  .slice(0, 50);

console.log('Top 50 ingredients by total $ contribution per meal (summed across base recipes):');
console.log('-------------------------------------------------------------------------------');
for (const item of top) {
  const avg = item.pricedOccurrences > 0 ? item.totalUsd / item.pricedOccurrences : 0;
  console.log(
    `${item.ingredient.padEnd(35)} | total: $${item.totalUsd.toFixed(2)} | avg-occ: $${avg.toFixed(3)} | priced: ${item.pricedOccurrences}/${item.occurrences} | ${item.exampleSource ?? ''}`
  );
}

const missingTop = Array.from(missing.entries())
  .sort((a, b) => b[1] - a[1])
  .slice(0, 30);

console.log('\nMost-missing pricing keys (top 30):');
for (const [k, n] of missingTop) {
  console.log(`${k.padEnd(35)} | missing occurrences: ${n}`);
}
