import { NextResponse } from 'next/server';
import type { Recipe } from '@/lib/types';
import { parseIngredientAmountG } from '@/lib/utils/recipeNutrition';
import { normalizeIngredientKey } from '@/lib/services/ingredientPricing/normalize';
import { getOrCreateSnapshotsForIngredients } from '@/lib/services/ingredientPricing/service';
import { CATEGORY_DEFAULTS, PACKAGE_SIZES } from '@/lib/data/packageSizes';

export const runtime = 'nodejs';

type RequestBody = {
  recipes: Recipe[];
};

function getEstimatedUnitPriceUsdPerGram(inputName: string, category?: string): number | null {
  const name = String(inputName || '').toLowerCase().replace(/\s+/g, '-').replace(/_/g, '-').trim();
  if (!name) return null;

  let pkg = PACKAGE_SIZES[name];
  if (!pkg) {
    for (const [key, value] of Object.entries(PACKAGE_SIZES)) {
      if (name.includes(key) || key.includes(name)) {
        pkg = value;
        break;
      }
    }
  }

  if (!pkg) {
    const cat = String(category || '').toLowerCase();
    pkg = (cat && (CATEGORY_DEFAULTS as any)[cat]) ? (CATEGORY_DEFAULTS as any)[cat] : undefined;
  }

  if (!pkg) {
    if (name.includes('seed')) pkg = CATEGORY_DEFAULTS.seed;
    else if (name.includes('rice') || name.includes('oat') || name.includes('grain') || name.includes('quinoa')) pkg = CATEGORY_DEFAULTS.grain;
    else if (name.includes('chicken') || name.includes('turkey') || name.includes('meat') || name.includes('beef') || name.includes('salmon') || name.includes('fish') || name.includes('egg')) pkg = CATEGORY_DEFAULTS.protein;
    else if (name.includes('carrot') || name.includes('broccoli') || name.includes('vegetable') || name.includes('pepper') || name.includes('bean') || name.includes('pea') || name.includes('spinach')) pkg = CATEGORY_DEFAULTS.vegetable;
    else if (name.includes('oil') || name.includes('fat')) pkg = CATEGORY_DEFAULTS.oil;
    else if (name.includes('powder') || name.includes('supplement') || name.includes('vitamin') || name.includes('calcium') || name.includes('joint')) pkg = CATEGORY_DEFAULTS.supplement;
    else pkg = CATEGORY_DEFAULTS.default;
  }

  const grams = Number((pkg as any)?.typicalSize);
  const cost = Number((pkg as any)?.estimatedCost);
  if (!Number.isFinite(grams) || grams <= 0) return null;
  if (!Number.isFinite(cost) || cost <= 0) return null;

  const unit = cost / grams;
  return Number.isFinite(unit) && unit > 0 ? unit : null;
}

export async function POST(req: Request): Promise<NextResponse> {
  let body: RequestBody | null = null;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    body = null;
  }

  const recipes = body?.recipes;
  if (!recipes || !Array.isArray(recipes) || recipes.length === 0) {
    return NextResponse.json({ error: 'Missing recipes[]' }, { status: 400 });
  }

  const allIngredientNames = Array.from(
    new Set(
      recipes
        .flatMap((r) => (Array.isArray(r.ingredients) ? r.ingredients : []))
        .map((ing) => String((ing as any)?.name || ''))
        .filter(Boolean)
        .map(normalizeIngredientKey)
        .filter(Boolean)
    )
  );

  const snapshots = await getOrCreateSnapshotsForIngredients({ ingredientNames: allIngredientNames, maxConcurrency: 2 });

  const results = recipes.map((recipe) => {
    const servings = typeof recipe.servings === 'number' && recipe.servings > 0 ? recipe.servings : 1;

    const ingredientKeys = (Array.isArray(recipe.ingredients) ? recipe.ingredients : [])
      .map((ing) => normalizeIngredientKey(String((ing as any)?.name || '')))
      .filter(Boolean);

    const uniqueKeys = Array.from(new Set(ingredientKeys));

    let totalCost = 0;
    let pricedCount = 0;
    const missing: string[] = [];
    let newestCapturedAt: string | null = null;
    let usedEstimate = false;
    let usedSnapshot = false;

    for (const ing of Array.isArray(recipe.ingredients) ? recipe.ingredients : []) {
      const key = normalizeIngredientKey(String((ing as any)?.name || ''));
      if (!key) continue;

      const grams = parseIngredientAmountG(ing as any);
      if (!Number.isFinite(grams) || grams <= 0) continue;

      const snapshot = snapshots[key];
      const snapshotUnit = snapshot?.unitPriceUsdPerGram;
      const unitPriceFromSnapshot =
        typeof snapshotUnit === 'number' && Number.isFinite(snapshotUnit) && snapshotUnit > 0 ? snapshotUnit : null;

      const unitPrice =
        unitPriceFromSnapshot ??
        getEstimatedUnitPriceUsdPerGram(String((ing as any)?.name || key), (ing as any)?.category);

      if (!unitPrice) {
        if (!missing.includes(key)) missing.push(key);
        continue;
      }

      if (unitPriceFromSnapshot) {
        usedSnapshot = true;
        if (snapshot?.capturedAt && (!newestCapturedAt || snapshot.capturedAt > newestCapturedAt)) {
          newestCapturedAt = snapshot.capturedAt;
        }
      } else {
        usedEstimate = true;
      }

      totalCost += grams * unitPrice;
      pricedCount += 1;
    }

    const totalIngredientCount = (Array.isArray(recipe.ingredients) ? recipe.ingredients : []).length;
    const hasAnyPricing = pricedCount > 0;
    const isComplete = missing.length === 0 && hasAnyPricing;

    const pricingSource = usedEstimate ? (usedSnapshot ? 'mixed' : 'estimate') : usedSnapshot ? 'snapshot' : 'none';

    return {
      recipeId: recipe.id,
      costPerMealUsd: hasAnyPricing ? totalCost / servings : null,
      asOf: hasAnyPricing && usedSnapshot && !usedEstimate ? newestCapturedAt : null,
      pricedIngredientCount: pricedCount,
      totalIngredientCount,
      missingIngredientKeys: missing,
      uniqueIngredientCount: uniqueKeys.length,
      isComplete,
      pricingSource,
    };
  });

  return NextResponse.json({ results });
}
