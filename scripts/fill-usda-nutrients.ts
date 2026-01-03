import fs from 'fs/promises';
import path from 'path';

 import { INGREDIENT_COMPOSITIONS, type IngredientComposition } from '../lib/data/ingredientCompositions';

/**
 * CLI utility to enrich ingredient_nutrients.json with additional micronutrients
 * Usage:
 *   # PowerShell:
 *   $env:USDA_API_KEY='XXXX'
 *   npx tsx scripts/fill-usda-nutrients.ts --limit 50
 */

interface CLIOptions {
  limit?: number;
  saveEvery?: number;
  delayMs?: number;
  timeoutMs?: number;
  retryFailed?: boolean;
}

function parseArgs(): CLIOptions {
  const opts: CLIOptions = {};
  const args = process.argv.slice(2);
  for (let i = 0; i < args.length; i++) {
    if ((args[i] === '--limit' || args[i] === '-n') && args[i + 1]) {
      opts.limit = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === '--save-every' && args[i + 1]) {
      opts.saveEvery = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === '--delay-ms' && args[i + 1]) {
      opts.delayMs = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === '--timeout-ms' && args[i + 1]) {
      opts.timeoutMs = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === '--retry-failed') {
      opts.retryFailed = true;
    }
  }
  return opts;
}

// USDA nutrient ID to our field mapping
const USDA_TO_FIELD: Record<number, keyof NutrientUpdate> = {
  // Tier-1
  675: 'omega6_g_100g',          // 18:2 n-6 c,c (linoleic) – grams
  328: 'vitaminD_mcg_100g',      // Vitamin D (D2 + D3) – µg
  323: 'vitaminE_mg_100g',       // Vitamin E (alpha-tocopherol) – mg
  418: 'vitaminB12_mcg_100g',    // Vitamin B-12 – µg
  309: 'zinc_mg_100g',           // Zinc – mg
  303: 'iron_mg_100g',           // Iron – mg
  // Tier-2
  304: 'magnesium_mg_100g',      // Magnesium – mg
  306: 'potassium_mg_100g',      // Potassium – mg
  317: 'selenium_mcg_100g',      // Selenium – µg
  435: 'folate_mcg_100g',        // Folate, total – µg
  415: 'vitaminB6_mg_100g',      // Vitamin B-6 – mg
  406: 'niacin_mg_100g',         // Niacin – mg
  // Tier-3
  315: 'manganese_mg_100g',      // Manganese – mg
  430: 'vitaminK_mcg_100g',      // Vitamin K (phylloquinone) – µg
  307: 'sodium_mg_100g',         // Sodium – mg
  312: 'chloride_mg_100g',       // Chloride – mg (USDA uses 312)
};

interface IngredientEntry {
  name: string;
  [key: string]: any;
}

 type IngredientTarget = {
   id: string;
   name: string;
   fdcId: number | null;
   composition: IngredientComposition;
 };

// Only the new fields, optional
interface NutrientUpdate {
  omega6_g_100g?: number;
  vitaminD_mcg_100g?: number;
  vitaminE_mg_100g?: number;
  vitaminB12_mcg_100g?: number;
  zinc_mg_100g?: number;
  iron_mg_100g?: number;
  magnesium_mg_100g?: number;
  potassium_mg_100g?: number;
  selenium_mcg_100g?: number;
  folate_mcg_100g?: number;
  vitaminB6_mg_100g?: number;
  niacin_mg_100g?: number;
  manganese_mg_100g?: number;
  vitaminK_mcg_100g?: number;
  sodium_mg_100g?: number;
  chloride_mg_100g?: number;
}

type USDAFoodSearchResponse = {
  foods?: Array<{
    fdcId: number;
    description?: string;
    dataType?: string;
    score?: number;
  }>;
};

async function fetchJson<T>(url: string, timeoutMs = 20000): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} for ${url}`);
    }
    return (await res.json()) as T;
  } finally {
    clearTimeout(timeoutId);
  }
}

function getNutrientNumber(n: any): number | null {
  const raw = n?.nutrient?.number ?? n?.nutrientNumber ?? n?.nutrientId;
  if (raw === undefined || raw === null) return null;
  const asNumber = typeof raw === 'number' ? raw : parseInt(String(raw), 10);
  return Number.isFinite(asNumber) ? asNumber : null;
}

function pickBestFdcId(resp: USDAFoodSearchResponse): number | null {
  const foods = resp.foods || [];
  if (foods.length === 0) return null;

  // Prefer Foundation/SR Legacy if present; otherwise take top result.
  const preferred = foods.find(f => (f.dataType || '').toLowerCase().includes('foundation'))
    || foods.find(f => (f.dataType || '').toLowerCase().includes('sr legacy'))
    || foods[0];

  return preferred?.fdcId ?? null;
}

function rankFoodDataType(dataType?: string): number {
  const dt = (dataType || '').toLowerCase();
  if (dt.includes('foundation')) return 0;
  if (dt.includes('sr legacy')) return 1;
  if (dt.includes('survey')) return 2;
  if (dt.includes('experimental')) return 3;
  if (dt.includes('branded')) return 4;
  return 5;
}

async function searchFdcCandidates(query: string, apiKey: string): Promise<number[]> {
  const url = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(query)}&pageSize=10&api_key=${apiKey}`;
  const data = await fetchJson<USDAFoodSearchResponse>(url);
  const foods = data.foods || [];
  const ranked = foods
    .map((f, idx) => ({
      id: f.fdcId,
      rank: rankFoodDataType(f.dataType),
      score: typeof f.score === 'number' ? f.score : 0,
      idx,
    }))
    .sort((a, b) => a.rank - b.rank || b.score - a.score || a.idx - b.idx);

  const seen = new Set<number>();
  const ids: number[] = [];
  for (const r of ranked) {
    if (!Number.isFinite(r.id)) continue;
    if (seen.has(r.id)) continue;
    seen.add(r.id);
    ids.push(r.id);
  }
  return ids;
}

async function searchFDC(query: string, apiKey: string): Promise<number | null> {
  const url = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(query)}&pageSize=5&api_key=${apiKey}`;
  const data = await fetchJson<USDAFoodSearchResponse>(url);
  return pickBestFdcId(data);
}

async function getFood(fdcId: number, apiKey: string, timeoutMs?: number): Promise<any> {
  const url = `https://api.nal.usda.gov/fdc/v1/food/${fdcId}?api_key=${apiKey}`;
  return fetchJson<any>(url, timeoutMs);
}

type FoodFetchResult =
  | { ok: true; food: any; usedFdcId: number; method: 'preferred' | 'search' }
  | { ok: false; error: string };

async function getFoodWithFallback(
  preferredFdcId: number | null,
  query: string,
  apiKey: string,
  timeoutMs?: number
): Promise<FoodFetchResult> {
  if (preferredFdcId) {
    try {
      const food = await getFood(preferredFdcId, apiKey, timeoutMs);
      return { ok: true, food, usedFdcId: preferredFdcId, method: 'preferred' };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      // Stale/invalid FDC IDs are common in older datasets; fall back to search.
      console.warn(`  • Preferred FDC ID failed (${msg}); retrying via search…`);
    }
  }

  let lastErr: string | null = null;
  try {
    const ids = await searchFdcCandidates(query, apiKey);
    if (ids.length === 0) {
      return { ok: false, error: `USDA search returned no results for query: ${query}` };
    }

    for (const fdcId of ids) {
      try {
        const food = await getFood(fdcId, apiKey, timeoutMs);
        return { ok: true, food, usedFdcId: fdcId, method: 'search' };
      } catch (err) {
        lastErr = err instanceof Error ? err.message : String(err);
        continue;
      }
    }
    return {
      ok: false,
      error: `USDA fetch failed for query: ${query} (tried ${ids.length} candidates; last error: ${lastErr || 'unknown'})`,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, error: `USDA fetch failed for query: ${query} (${msg})` };
  }
 }

 function getFdcIdFromSource(source?: string): number | null {
   const s = String(source || '');
   const m = s.match(/\bFDC\s*ID\s*:\s*(\d+)\b/i);
   if (!m) return null;
   const n = parseInt(m[1], 10);
   return Number.isFinite(n) ? n : null;
 }

 function prettifyId(id: string): string {
   return id
     .replace(/_/g, ' ')
     .replace(/\b\w/g, (c) => c.toUpperCase());
 }

 function seedEntryFromComposition(composition: IngredientComposition, fallbackName: string): IngredientEntry {
   return {
     name: composition.name || fallbackName,
     moisture_percent: composition.moisture,
     protein_g_100g: composition.protein,
     fat_g_100g: composition.fat,
     fiber_g_100g: composition.fiber,
     calcium_mg_100g: composition.calcium,
     phosphorus_mg_100g: composition.phosphorus,
     calories_kcal_100g: composition.kcal,
     copper_mg_per_100g: composition.copper_mg_per_100g,
     iodine_mcg_per_100g: composition.iodine_mcg_per_100g,
     vitaminA: composition.vitaminA,
     vitaminC: composition.vitaminC,
     omega3: composition.omega3,
     taurine: composition.taurine,
     CaP_ratio: composition.CaP_ratio,
     carbs_g_100g: composition.carbs,
   };
 }

 function hasAnyNewMicronutrients(entry: IngredientEntry): boolean {
   const keys = Object.values(USDA_TO_FIELD);
   return keys.some((k) => entry[k] !== undefined);
 }

function extractNutrients(foodJson: any): NutrientUpdate {
  const update: NutrientUpdate = {};
  if (!foodJson.foodNutrients) return update;
  for (const n of foodJson.foodNutrients) {
    const nutrientNumber = getNutrientNumber(n);
    if (!nutrientNumber) continue;
    const field = USDA_TO_FIELD[nutrientNumber];
    if (field) {
      // value assumed per 100 g basis
      update[field] = n.amount;
    }
  }
  return update;
}

async function main() {
  const apiKey = process.env.USDA_API_KEY;
  if (!apiKey) {
    console.error('USDA_API_KEY env var is required.');
    process.exit(1);
  }

  const { limit, saveEvery = 10, delayMs = 350, timeoutMs = 20000, retryFailed = false } = parseArgs();
  const nutrientsPath = path.resolve('lib/data/ingredient_nutrients.json');
  const raw = await fs.readFile(nutrientsPath, 'utf-8');
  const json: Record<string, IngredientEntry> = JSON.parse(raw);

  const targets: IngredientTarget[] = Object.entries(INGREDIENT_COMPOSITIONS).map(([id, composition]) => {
    const fallbackName = prettifyId(id);
    return {
      id,
      name: composition.name || fallbackName,
      fdcId: getFdcIdFromSource(composition.source),
      composition,
    };
  });

  for (const t of targets) {
    if (!json[t.id]) {
      json[t.id] = seedEntryFromComposition(t.composition, t.name);
    } else if (!json[t.id].name) {
      json[t.id].name = t.name;
    }

    // If we already have any new micronutrients, treat this entry as enriched.
    if (json[t.id].usda_enriched === undefined && hasAnyNewMicronutrients(json[t.id])) {
      json[t.id].usda_enriched = true;
    }
  }

  // Some legacy entries may not exist in INGREDIENT_COMPOSITIONS (e.g. *_raw keys),
  // but can still already have the new micronutrient fields populated.
  // Mark them enriched so repeated runs and sanity checks reflect reality.
  for (const entry of Object.values(json)) {
    if (entry?.usda_enriched !== true && hasAnyNewMicronutrients(entry)) {
      entry.usda_enriched = true;
    }
  }

  const candidates = targets.filter((t) => {
    const entry = json[t.id];
    if (!entry) return true;
    if (entry.usda_enriched === true) return false;
    if (!retryFailed && entry.usda_error !== undefined) return false;
    return true;
  });
  const work = typeof limit === 'number' ? candidates.slice(0, limit) : candidates;

  let processed = 0;
  let saved = 0;

  for (const t of work) {
    const entry = json[t.id]!;
    console.log(`[${processed + 1}/${work.length}] Enriching ${t.id} (${entry.name}) …`);

    try {
      const result = await getFoodWithFallback(t.fdcId, entry.name, apiKey, timeoutMs);
      if (!result.ok) {
        console.warn(`  • ${result.error}`);
        entry.usda_error = result.error;
        continue;
      }

      const update = extractNutrients(result.food);
      Object.assign(entry, update);
      entry.usda_enriched = true;
      entry.usda_fdcId = result.usedFdcId;
      delete entry.usda_error;
    } catch (err) {
      console.warn(`  • Error: ${err instanceof Error ? err.message : String(err)}`);
      entry.usda_error = err instanceof Error ? err.message : String(err);
      continue;
    }

    processed++;

    if (processed % saveEvery === 0) {
      await fs.writeFile(nutrientsPath, JSON.stringify(json, null, 2));
      saved++;
      console.log(`  ✓ checkpoint saved (${processed} updated, ${saved} saves)`);
    }

    await new Promise(r => setTimeout(r, delayMs));
  }

  await fs.writeFile(nutrientsPath, JSON.stringify(json, null, 2));
  console.log(`Done. Updated ${processed} items.`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
