import { getAllIngredients } from '../lib/data/unifiedIngredientRegistry';
import { INGREDIENT_COMPOSITIONS } from '../lib/data/ingredientCompositions';
import { getFallbackNutrition } from '../lib/utils/nutritionFallbacks';
import { normalizeIngredientKey } from '../lib/utils/recipeNutrition';

const COMPOSITION_KEYS = new Set(Object.keys(INGREDIENT_COMPOSITIONS));

function resolveIngredientCompositionKey(ingKey: string): string {
  const key = (ingKey || '').toLowerCase();
  if (!key) return '';
  if (COMPOSITION_KEYS.has(key)) return key;

  const baseCandidates: string[] = [];
  baseCandidates.push(key);

  if (!key.endsWith('s')) baseCandidates.push(`${key}s`);
  if (key.endsWith('y') && key.length > 1) baseCandidates.push(`${key.slice(0, -1)}ies`);

  if (key.startsWith('lean_')) {
    const rest = key.slice('lean_'.length);
    baseCandidates.push(rest);
    baseCandidates.push(`${rest}_lean`);
  }

  const candidates: string[] = [];
  const suffixes = ['', '_raw', '_cooked', '_fresh', '_water', '_in_water', '_lean'];

  for (const b of baseCandidates) {
    for (const s of suffixes) {
      candidates.push(`${b}${s}`);
    }
  }

  for (const c of candidates) {
    if (COMPOSITION_KEYS.has(c)) return c;
  }

  return key;
}

type Miss = {
  ingredientId: string;
  displayName: string;
  normalizedKey: string;
  resolvedKey: string;
  hasFallback: boolean;
};

type ResolvedButChanged = {
  ingredientId: string;
  displayName: string;
  normalizedKey: string;
  resolvedKey: string;
};

const all = getAllIngredients();
const misses: Miss[] = [];
const resolvedButChanged: ResolvedButChanged[] = [];

let checked = 0;

for (const ing of all) {
  const names = Array.from(
    new Set([String(ing.primaryDisplayName || '').trim(), ...(ing.displayNames || []).map((n) => String(n || '').trim())])
  ).filter(Boolean);

  for (const displayName of names) {
    checked++;
    const normalizedKey = normalizeIngredientKey(displayName);
    const resolvedKey = resolveIngredientCompositionKey(normalizedKey);
    const hasComposition = COMPOSITION_KEYS.has(resolvedKey);
    const hasFallback = Boolean(getFallbackNutrition(resolvedKey));

    if (!hasComposition) {
      misses.push({
        ingredientId: ing.id,
        displayName,
        normalizedKey,
        resolvedKey,
        hasFallback,
      });
      continue;
    }

    if (resolvedKey !== normalizedKey) {
      resolvedButChanged.push({
        ingredientId: ing.id,
        displayName,
        normalizedKey,
        resolvedKey,
      });
    }
  }
}

console.log('='.repeat(90));
console.log('INGREDIENT KEY RESOLUTION AUDIT');
console.log('='.repeat(90));
console.log();
console.log(`Unified ingredients: ${all.length}`);
console.log(`Names checked: ${checked}`);
console.log(`Composition keys: ${COMPOSITION_KEYS.size}`);
console.log();

console.log(`Resolved-but-changed (normalization needed): ${resolvedButChanged.length}`);
resolvedButChanged.slice(0, 40).forEach((r) => {
  console.log(`  [${r.ingredientId}] "${r.displayName}" -> ${r.normalizedKey} -> ${r.resolvedKey}`);
});
if (resolvedButChanged.length > 40) {
  console.log(`  ... ${resolvedButChanged.length - 40} more`);
}
console.log();

const missesNoFallback = misses.filter((m) => !m.hasFallback);
const missesWithFallback = misses.filter((m) => m.hasFallback);

console.log(`Unresolved (no composition): ${misses.length}`);
console.log(`  With fallback: ${missesWithFallback.length}`);
console.log(`  No fallback: ${missesNoFallback.length}`);
console.log();

console.log('Top unresolved (no fallback):');
missesNoFallback.slice(0, 60).forEach((m) => {
  console.log(`  [${m.ingredientId}] "${m.displayName}" -> ${m.normalizedKey} -> ${m.resolvedKey}`);
});
if (missesNoFallback.length > 60) {
  console.log(`  ... ${missesNoFallback.length - 60} more`);
}
console.log();

console.log('Top unresolved (has fallback):');
missesWithFallback.slice(0, 60).forEach((m) => {
  console.log(`  [${m.ingredientId}] "${m.displayName}" -> ${m.normalizedKey} -> ${m.resolvedKey}`);
});
if (missesWithFallback.length > 60) {
  console.log(`  ... ${missesWithFallback.length - 60} more`);
}
console.log();

process.exit(missesNoFallback.length > 0 ? 1 : 0);
