import type { Recipe } from '@/lib/types';

import { getIngredientComposition, INGREDIENT_COMPOSITIONS } from '@/lib/data/ingredientCompositions';
import { getFallbackNutrition } from './nutritionFallbacks';

const UNICODE_FRACTIONS: Record<string, number> = {
  '¼': 0.25,
  '½': 0.5,
  '¾': 0.75,
  '⅐': 0.142857,
  '⅑': 0.111111,
  '⅒': 0.1,
  '⅓': 0.333333,
  '⅔': 0.666667,
  '⅕': 0.2,
  '⅖': 0.4,
  '⅗': 0.6,
  '⅘': 0.8,
  '⅙': 0.166667,
  '⅚': 0.833333,
  '⅛': 0.125,
  '⅜': 0.375,
  '⅝': 0.625,
  '⅞': 0.875,
};

type AmountParseOpts = {
  category?: string;
};

const VOLUME_G = {
  generic: { tsp: 5, tbsp: 15, cup: 240 },
  fat: { tsp: 4.5, tbsp: 13.5, cup: 218 },
  supplement: { tsp: 3, tbsp: 9, cup: 120 },
};

function getVolumeGrams(unit: 'tsp' | 'tbsp' | 'cup', category?: string): number {
  const key = String(category || '').toLowerCase();
  const table = (key === 'fat' ? VOLUME_G.fat : key === 'supplement' ? VOLUME_G.supplement : VOLUME_G.generic);
  return table[unit];
}

const UNIT_TO_GRAMS: Record<string, number> = {
  kg: 1000,
  g: 1,
  mg: 0.001,
  oz: 28.3495,
  lb: 453.592,
  lbs: 453.592,
  pound: 453.592,
  pounds: 453.592,
};

function parseSingleNumber(str: string): number | null {
  const s = (str || '').trim();
  if (!s) return null;

  const fractionMatch = s.match(/^(\d+)\s*\/\s*(\d+)$/);
  if (fractionMatch) {
    const numerator = parseInt(fractionMatch[1], 10);
    const denominator = parseInt(fractionMatch[2], 10);
    if (denominator !== 0) return numerator / denominator;
    return null;
  }

  if (/^\d+(\.\d+)?$/.test(s)) {
    const decimal = parseFloat(s);
    return Number.isFinite(decimal) ? decimal : null;
  }

  return null;
}

function parseNumberExpression(str: string): number | null {
  const parts = (str || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return null;

  let total = 0;
  let found = false;
  for (const part of parts) {
    const n = parseSingleNumber(part);
    if (typeof n === 'number') {
      total += n;
      found = true;
    }
  }
  return found ? total : null;
}

function parseAmountToGrams(value: unknown, opts?: AmountParseOpts): number {
  if (typeof value === 'number') return value > 0 && Number.isFinite(value) ? value : 0;
  if (typeof value !== 'string') return 0;

  let str = value.toLowerCase().trim();
  if (!str) return 0;

  const vagueTerms = ['to taste', 'pinch', 'dash', 'some', 'handful', 'few', 'several', 'as needed'];
  if (vagueTerms.some((t) => str.includes(t))) return 0;

  for (const [unicode, decimal] of Object.entries(UNICODE_FRACTIONS)) {
    str = str.replaceAll(unicode, ` ${decimal} `);
  }

  str = str.replace(/\s+/g, ' ').trim();

  str = str.replace(/(\d)\s*-\s*(\d+\s*\/\s*\d+)/g, '$1 $2');
  str = str.replace(/\s+/g, ' ').trim();

  let multiplier = 1;
  if (/\d/.test(str)) {
    const volumeUnitMatch = str.match(/\b(tsp|teaspoon|teaspoons|tbsp|tablespoon|tablespoons|cup|cups)\b/i);
    if (volumeUnitMatch) {
      const unitRaw = volumeUnitMatch[1].toLowerCase();
      const unit = unitRaw.startsWith('ts') ? 'tsp' : unitRaw.startsWith('tb') ? 'tbsp' : 'cup';
      multiplier = getVolumeGrams(unit, opts?.category);
      str = str.replace(new RegExp(`\
        \\b${unitRaw}\\b
      `.trim().replace(/\s+/g, ''), 'i'), ' ').replace(/\s+/g, ' ').trim();
    } else {
      const unitEntries = Object.entries(UNIT_TO_GRAMS).sort((a, b) => b[0].length - a[0].length);
      for (const [unitKey, factor] of unitEntries) {
        const re = new RegExp(`\\d[^a-zA-Z]*${unitKey}\\b`, 'i');
        if (re.test(str)) {
          multiplier = factor;
          str = str.replace(new RegExp(`${unitKey}\\b`, 'i'), ' ').replace(/\s+/g, ' ').trim();
          break;
        }
      }
    }
  }

  const rangeMatch = str.match(/^\s*(.+?)\s*(?:to|\-|–)\s*(.+?)\s*$/i);
  if (rangeMatch) {
    const min = parseNumberExpression(rangeMatch[1]);
    const max = parseNumberExpression(rangeMatch[2]);
    if (typeof min === 'number' && typeof max === 'number' && Number.isFinite(min) && Number.isFinite(max)) {
      return ((min + max) / 2) * multiplier;
    }
  }

  const amount = parseNumberExpression(str);
  return typeof amount === 'number' && amount > 0 ? amount * multiplier : 0;
}

export function parseIngredientAmountG(value: unknown): number {
  if (!value) return 0;
  if (typeof value === 'number' || typeof value === 'string') return parseAmountToGrams(value);
  if (typeof value === 'object' && value !== null && 'amount' in (value as any)) {
    return parseAmountToGrams((value as any).amount, { category: (value as any).category });
  }
  return 0;
}

function applyIngredientAliases(value: string): string {
  const v = (value || '').toLowerCase();
  if (!v) return '';

  const aliases: Array<{ test: (x: string) => boolean; value: string }> = [
    { test: (x) => x === 'egg', value: 'eggs_whole' },
    { test: (x) => x.startsWith('egg '), value: 'eggs_whole' },
    { test: (x) => x.startsWith('eggs '), value: 'eggs_whole' },
    { test: (x) => x.startsWith('egg-'), value: 'eggs_whole' },
    { test: (x) => x.startsWith('egg_'), value: 'eggs_whole' },
    { test: (x) => x.startsWith('ground beef'), value: 'ground_beef' },
    { test: (x) => x.startsWith('ground turkey'), value: 'ground_turkey' },
    { test: (x) => x === 'turkey neck', value: 'turkey_necks' },
    { test: (x) => x === 'chicken neck', value: 'chicken_necks' },
    { test: (x) => x === 'chicken thigh', value: 'chicken_thighs' },
    { test: (x) => x === 'sardine', value: 'sardines_water' },
    { test: (x) => x === 'sardines', value: 'sardines_water' },
    { test: (x) => x.startsWith('ground pork'), value: 'ground_pork_lean' },
    { test: (x) => (x.includes('salmon') && (x.includes('boneless') || x.includes('fillet') || x.includes('filet'))) && !x.includes('oil'), value: 'salmon_boneless' },
    { test: (x) => x.startsWith('salmon') && !x.includes('oil'), value: 'salmon_atlantic' },
    { test: (x) => x === 'chicken liver', value: 'chicken_liver' },
    { test: (x) => x === 'beef liver', value: 'beef_liver' },
    { test: (x) => x === 'green bean' || x === 'green beans', value: 'green_beans' },
    { test: (x) => x === 'brussel sprout' || x === 'brussels sprout' || x === 'brussels sprouts' || x === 'brussel sprouts', value: 'brussels_sprouts' },
    { test: (x) => x.startsWith('bell pepper') || x.startsWith('bell peppers'), value: 'bell_pepper' },
    { test: (x) => x === 'kale raw', value: 'kale' },
    { test: (x) => x === 'carrot raw', value: 'carrot' },
  ];

  for (const a of aliases) {
    if (a.test(v)) return a.value;
  }
  return v;
}

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

export function normalizeIngredientKey(name: string): string {
  let s = (name || '').toLowerCase().trim();
  if (!s) return '';

  s = s.replace(/[()]/g, ' ');
  s = s.replace(/[\/.,]/g, ' ');
  s = s.replace(/[^a-z0-9\s-]+/g, ' ');
  s = s.replace(/\s+/g, ' ').trim();

  const words = s
    .split(' ')
    .filter(Boolean)
    .map((w) => {
      if (w.length > 4 && w.endsWith('ies')) return `${w.slice(0, -3)}y`;
      if (w.length > 4 && w.endsWith('oes')) return w.slice(0, -2);
      if (w.length > 3 && w.endsWith('s') && !w.endsWith('ss')) return w.slice(0, -1);
      return w;
    });

  s = words.join(' ');
  s = applyIngredientAliases(s);

  return s.replace(/\s+/g, '_');
}

export function calculateRecipeNutrition(
  recipe: Recipe,
  options?: { includeBreakdown?: boolean }
): {
  protein: number;
  fat: number;
  fiber: number;
  calcium: number;
  phosphorus: number;
  calories: number;
  source: 'real' | 'estimated';
  usesFallbackNutrition?: boolean;
  fallbackIngredients?: string[];
  breakdown?: Array<{
    name: string;
    amountG: number;
    ingKey: string;
    used: 'composition' | 'fallback' | 'forced_calcium';
    calciumMg: number;
    phosphorusMg: number;
  }>;
} {
  const nutritionalCalc = (recipe as any).nutritionalCalculation;
  if (nutritionalCalc) {
    const clamp01 = (n: number): number => Math.max(0, Math.min(1, n));

    const inferMoistureFraction = (ingKey: string, displayName: string, compositionMoistureGPer100?: number): number => {
      if (typeof compositionMoistureGPer100 === 'number' && Number.isFinite(compositionMoistureGPer100)) {
        return clamp01(compositionMoistureGPer100 / 100);
      }

      const key = (ingKey || '').toLowerCase();
      const name = (displayName || '').toLowerCase();

      if (key.includes('oil') || name.includes(' oil')) return 0;
      if (key.includes('calcium_carbonate') || name.includes('calcium carbonate')) return 0;

      if (key.includes('pellet') || name.includes('pellet') || name.includes('kibble')) return 0.10;
      if (key.includes('hay') || name.includes('hay') || name.includes('timothy') || name.includes('orchard grass')) return 0.12;
      if (name.includes('powder') || name.includes('flour') || name.includes('dry')) return 0.10;

      if (
        name.includes('cooked') &&
        (name.includes('rice') || name.includes('quinoa') || name.includes('barley') || name.includes('oat') || name.includes('lentil') || name.includes('bean'))
      ) {
        return 0.70;
      }

      if (
        key.includes('watermelon') ||
        name.includes('watermelon') ||
        name.includes('cucumber') ||
        name.includes('zucchini')
      ) {
        return 0.92;
      }
      if (
        name.includes('lettuce') ||
        name.includes('spinach') ||
        name.includes('kale') ||
        name.includes('greens') ||
        name.includes('broccoli') ||
        name.includes('carrot') ||
        name.includes('pepper') ||
        name.includes('pumpkin') ||
        name.includes('sweet potato') ||
        name.includes('peas') ||
        name.includes('green bean')
      ) {
        return 0.90;
      }
      if (
        name.includes('apple') ||
        name.includes('berry') ||
        name.includes('mango') ||
        name.includes('papaya') ||
        name.includes('banana')
      ) {
        return 0.88;
      }

      if (
        name.includes('chicken') ||
        name.includes('turkey') ||
        name.includes('beef') ||
        name.includes('pork') ||
        name.includes('lamb') ||
        name.includes('venison') ||
        name.includes('rabbit') ||
        name.includes('duck') ||
        name.includes('salmon') ||
        name.includes('tuna') ||
        name.includes('sardine') ||
        name.includes('fish')
      ) {
        return 0.70;
      }
      if (name.includes('egg')) return 0.75;

      return 0.75;
    };

    const totalGrams = nutritionalCalc.totalGrams || 100;
    const ingredients = recipe.ingredients || [];
    const computedDryMatterGrams = ingredients.reduce((sum: number, ing: any) => {
      const name = typeof ing === 'string' ? ing : ing.name;
      const amountG = typeof ing === 'string' ? 0 : parseIngredientAmountG(ing);
      if (!name || !amountG) return sum;
      const ingKey = normalizeIngredientKey(name);
      const resolvedKey = resolveIngredientCompositionKey(ingKey);
      const comp = getIngredientComposition(resolvedKey);
      const moistureFrac = inferMoistureFraction(resolvedKey, name, (comp as any)?.moisture);
      return sum + (amountG * (1 - moistureFrac));
    }, 0);

    const dryMatterGrams =
      typeof (nutritionalCalc as any).dryMatterGrams === 'number' && Number.isFinite((nutritionalCalc as any).dryMatterGrams)
        ? (nutritionalCalc as any).dryMatterGrams
        : (computedDryMatterGrams > 0 ? computedDryMatterGrams : totalGrams * 0.25);

    return {
      protein: dryMatterGrams > 0 ? ((nutritionalCalc.protein_g || 0) / dryMatterGrams) * 100 : 0,
      fat: dryMatterGrams > 0 ? ((nutritionalCalc.fat_g || 0) / dryMatterGrams) * 100 : 0,
      fiber: dryMatterGrams > 0 ? ((nutritionalCalc.fiber_g || 0) / dryMatterGrams) * 100 : 0,
      calcium: dryMatterGrams > 0 ? (((nutritionalCalc.ca_mg || 0) / 1000) / dryMatterGrams) * 100 : 0,
      phosphorus: dryMatterGrams > 0 ? (((nutritionalCalc.p_mg || 0) / 1000) / dryMatterGrams) * 100 : 0,
      calories: totalGrams > 0 ? ((nutritionalCalc.calories_kcal || nutritionalCalc.kcal || 0) / totalGrams) * 100 : 0,
      source: 'real',
    };
  }

  const ingredients = recipe.ingredients || [];
  const supplements = (recipe as any).supplements || [];

  let totalCalcium = 0;
  let totalPhosphorus = 0;
  let totalCalories = 0;
  let totalWeight = 0;
  let totalDryMatter = 0;
  let realDataCount = 0;
  const fallbackIngredients: string[] = [];
  const breakdown: Array<{
    name: string;
    amountG: number;
    ingKey: string;
    used: 'composition' | 'fallback' | 'forced_calcium';
    calciumMg: number;
    phosphorusMg: number;
  }> = [];

  const mapSupplementToCompositionKey = (supplementName: string): string | null => {
    const lower = supplementName.toLowerCase();
    if (lower.includes('taurine')) return 'taurine_powder';
    if (lower.includes('eggshell') || lower.includes('egg shell') || lower.includes('egg shells')) return 'calcium_carbonate';
    if (lower.includes('calcium') && (lower.includes('carbonate') || lower.includes('supplement'))) return 'calcium_carbonate';
    if (lower.includes('omega') || lower.includes('fish oil') || lower.includes('krill') || lower.includes('salmon oil')) return 'fish_oil';
    return null;
  };

  const clamp01 = (n: number): number => Math.max(0, Math.min(1, n));

  const inferMoistureFraction = (
    ingKey: string,
    displayName: string,
    compositionMoistureGPer100?: number,
    fallbackMoistureGPer100?: number
  ): number => {
    if (typeof compositionMoistureGPer100 === 'number' && Number.isFinite(compositionMoistureGPer100)) {
      return clamp01(compositionMoistureGPer100 / 100);
    }
    if (typeof fallbackMoistureGPer100 === 'number' && Number.isFinite(fallbackMoistureGPer100)) {
      return clamp01(fallbackMoistureGPer100 / 100);
    }

    const key = (ingKey || '').toLowerCase();
    const name = (displayName || '').toLowerCase();

    if (key.includes('oil') || name.includes(' oil')) return 0;
    if (key.includes('calcium_carbonate') || name.includes('calcium carbonate')) return 0;

    if (key.includes('pellet') || name.includes('pellet') || name.includes('kibble')) return 0.10;
    if (key.includes('hay') || name.includes('hay') || name.includes('timothy') || name.includes('orchard grass')) return 0.12;
    if (name.includes('powder') || name.includes('flour') || name.includes('dry')) return 0.10;

    if (
      name.includes('cooked') &&
      (name.includes('rice') || name.includes('quinoa') || name.includes('barley') || name.includes('oat') || name.includes('lentil') || name.includes('bean'))
    ) {
      return 0.70;
    }

    if (key.includes('watermelon') || name.includes('watermelon') || name.includes('cucumber') || name.includes('zucchini')) return 0.92;

    if (
      name.includes('lettuce') ||
      name.includes('spinach') ||
      name.includes('kale') ||
      name.includes('greens') ||
      name.includes('broccoli') ||
      name.includes('carrot') ||
      name.includes('pepper') ||
      name.includes('pumpkin') ||
      name.includes('sweet potato') ||
      name.includes('peas') ||
      name.includes('green bean')
    ) {
      return 0.90;
    }
    if (
      name.includes('apple') ||
      name.includes('berry') ||
      name.includes('mango') ||
      name.includes('papaya') ||
      name.includes('banana')
    ) {
      return 0.88;
    }

    if (
      name.includes('chicken') ||
      name.includes('turkey') ||
      name.includes('beef') ||
      name.includes('pork') ||
      name.includes('lamb') ||
      name.includes('venison') ||
      name.includes('rabbit') ||
      name.includes('duck') ||
      name.includes('salmon') ||
      name.includes('tuna') ||
      name.includes('sardine') ||
      name.includes('fish')
    ) {
      return 0.70;
    }
    if (name.includes('egg')) return 0.75;

    return 0.75;
  };

  let totalProteinG = 0;
  let totalFatG = 0;
  let totalFiberG = 0;

  const pushBreakdown = (row: any) => {
    if (options?.includeBreakdown) breakdown.push(row);
  };

  for (const ing of ingredients) {
    const name = typeof ing === 'string' ? ing : (ing?.name || '');
    const amountG = typeof ing === 'string' ? 0 : parseIngredientAmountG(ing);
    if (!name || !amountG) continue;

    const ingKey = normalizeIngredientKey(name);
    const resolvedKey = resolveIngredientCompositionKey(ingKey);
    const composition = getIngredientComposition(resolvedKey);

    if (composition) {
      realDataCount++;
      const moistureFrac = inferMoistureFraction(resolvedKey, name, (composition as any).moisture);
      const dryMatterG = amountG * (1 - moistureFrac);

      totalProteinG += (amountG * (composition.protein || 0)) / 100;
      totalFatG += (amountG * (composition.fat || 0)) / 100;
      totalFiberG += (amountG * (composition.fiber || 0)) / 100;
      totalCalories += (composition.kcal || 0) / 100 * amountG;

      totalCalcium += (composition.calcium || 0) / 100 * amountG;
      totalPhosphorus += (composition.phosphorus || 0) / 100 * amountG;

      totalWeight += amountG;
      totalDryMatter += dryMatterG;

      pushBreakdown({
        name,
        amountG,
        ingKey: resolvedKey,
        used: 'composition',
        calciumMg: ((composition.calcium || 0) / 100) * amountG,
        phosphorusMg: ((composition.phosphorus || 0) / 100) * amountG,
      });
    } else {
      const fallback = getFallbackNutrition(resolvedKey) as any;
      if (!fallback) continue;
      fallbackIngredients.push(resolvedKey);
      const moistureFrac = inferMoistureFraction(resolvedKey, name, undefined, fallback.moisture);
      const dryMatterG = amountG * (1 - moistureFrac);

      totalProteinG += (amountG * (fallback.protein || 0)) / 100;
      totalFatG += (amountG * (fallback.fat || 0)) / 100;
      totalFiberG += (amountG * (fallback.fiber || 0)) / 100;
      totalCalories += (fallback.kcal || 0) / 100 * amountG;

      totalCalcium += (fallback.calcium || 0) / 100 * amountG;
      totalPhosphorus += (fallback.phosphorus || 0) / 100 * amountG;

      totalWeight += amountG;
      totalDryMatter += dryMatterG;

      pushBreakdown({
        name,
        amountG,
        ingKey: resolvedKey,
        used: 'fallback',
        calciumMg: ((fallback.calcium || 0) / 100) * amountG,
        phosphorusMg: ((fallback.phosphorus || 0) / 100) * amountG,
      });
    }
  }

  for (const supp of supplements) {
    const name = String((supp as any)?.name || (supp as any)?.productName || '').trim();
    if (!name) continue;
    const amountG = parseIngredientAmountG(supp);
    if (!amountG) continue;

    const mappedKey = mapSupplementToCompositionKey(name);
    if (!mappedKey) continue;

    const composition = getIngredientComposition(mappedKey);
    if (!composition) continue;

    const moistureFrac = inferMoistureFraction(mappedKey, name, (composition as any).moisture);
    const dryMatterG = amountG * (1 - moistureFrac);

    totalProteinG += (amountG * (composition.protein || 0)) / 100;
    totalFatG += (amountG * (composition.fat || 0)) / 100;
    totalFiberG += (amountG * (composition.fiber || 0)) / 100;
    totalCalories += (composition.kcal || 0) / 100 * amountG;

    totalCalcium += (composition.calcium || 0) / 100 * amountG;
    totalPhosphorus += (composition.phosphorus || 0) / 100 * amountG;

    totalWeight += amountG;
    totalDryMatter += dryMatterG;

    pushBreakdown({
      name,
      amountG,
      ingKey: mappedKey,
      used: 'composition',
      calciumMg: ((composition.calcium || 0) / 100) * amountG,
      phosphorusMg: ((composition.phosphorus || 0) / 100) * amountG,
    });
  }

  const dm = totalDryMatter > 0 ? totalDryMatter : (totalWeight > 0 ? totalWeight * 0.25 : 1);

  const proteinPct = dm > 0 ? (totalProteinG / dm) * 100 : 0;
  const fatPct = dm > 0 ? (totalFatG / dm) * 100 : 0;
  const fiberPct = dm > 0 ? (totalFiberG / dm) * 100 : 0;
  const calciumPct = dm > 0 ? ((totalCalcium / 1000) / dm) * 100 : 0;
  const phosphorusPct = dm > 0 ? ((totalPhosphorus / 1000) / dm) * 100 : 0;

  const source: 'real' | 'estimated' = realDataCount > 0 ? 'real' : 'estimated';

  return {
    protein: proteinPct,
    fat: fatPct,
    fiber: fiberPct,
    calcium: calciumPct,
    phosphorus: phosphorusPct,
    calories: totalWeight > 0 ? (totalCalories / totalWeight) * 100 : 0,
    source,
    usesFallbackNutrition: fallbackIngredients.length > 0,
    fallbackIngredients: fallbackIngredients.length > 0 ? fallbackIngredients : undefined,
    ...(options?.includeBreakdown ? { breakdown } : {}),
  };
}
