const GRAMS_PER_POUND = 453.592;
const GRAMS_PER_OUNCE = 28.3495;
const GRAMS_PER_FL_OUNCE = 29.5735;

function normalizeTitleText(title: string): string {
  return String(title || '')
    .toLowerCase()
    .replace(/fl\.\s*oz\b/g, 'fl oz')
    .replace(/fluid\s+ounces?\b/g, 'fl oz')
    .replace(/fluid\s+oz\b/g, 'fl oz')
    .replace(/\s+/g, ' ')
    .trim();
}

function getGramsPerFluidOunce(category?: string): number {
  const c = String(category || '').toLowerCase();
  if (c === 'oil' || c === 'fat') return GRAMS_PER_FL_OUNCE * 0.92;
  return GRAMS_PER_FL_OUNCE;
}

export function parseWeightToGrams(title: string, category?: string): number {
  if (!title) return 0;
  const t = normalizeTitleText(title);

  // Multi-pack: "2 x 8 oz", "2×8 oz", with optional fl oz
  const multi = t.match(
    /(\d+)\s*(?:x|×)\s*(\d+(?:\.\d+)?)\s*(fl\s*oz|oz|ounce|ounces|lb|lbs|pound|pounds|kg|kilogram|kilograms|g|gram|grams|mg|milligram|milligrams)\b/
  );
  if (multi) {
    const count = parseFloat(multi[1]);
    const each = parseFloat(multi[2]);
    const unit = multi[3];

    if (unit.startsWith('lb') || unit.startsWith('pound')) return count * each * GRAMS_PER_POUND;
    if (unit.startsWith('kg')) return count * each * 1000;
    if (unit === 'g' || unit.startsWith('gram')) return count * each;
    if (unit === 'mg' || unit.startsWith('milligram')) return (count * each) / 1000;

    const isFl = unit.startsWith('fl');
    const gramsPerOz = isFl ? getGramsPerFluidOunce(category) : GRAMS_PER_OUNCE;
    return count * each * gramsPerOz;
  }

  // Multi-pack: "8 oz (2 pack)", "8oz 2 pack"
  const packParen = t.match(
    /(\d+(?:\.\d+)?)\s*(fl\s*oz|oz|ounce|ounces|lb|lbs|pound|pounds|kg|kilogram|kilograms|g|gram|grams|mg|milligram|milligrams)\b[^\d]{0,20}\(\s*(\d+)\s*(?:pack|pk)\s*\)/
  );
  if (packParen) {
    const each = parseFloat(packParen[1]);
    const unit = packParen[2];
    const count = parseFloat(packParen[3]);
    const synthesized = `${count} x ${each} ${unit}`;
    return parseWeightToGrams(synthesized, category);
  }

  // Multi-pack: "Pack of 3, 4 oz each"
  const packOfEach = t.match(
    /pack\s+of\s+(\d+)[^\d]{0,40}(\d+(?:\.\d+)?)\s*(fl\s*oz|oz|ounce|ounces|lb|lbs|pound|pounds|kg|kilogram|kilograms|g|gram|grams|mg|milligram|milligrams)\b\s*(?:each)?/
  );
  if (packOfEach) {
    const count = parseFloat(packOfEach[1]);
    const each = parseFloat(packOfEach[2]);
    const unit = packOfEach[3];
    const synthesized = `${count} x ${each} ${unit}`;
    return parseWeightToGrams(synthesized, category);
  }

  // Weight: lb
  const lb = t.match(/(\d+(?:\.\d+)?)\s*(?:lb|lbs|pound|pounds)\b/);
  if (lb) return parseFloat(lb[1]) * GRAMS_PER_POUND;

  // Weight/volume: oz / fl oz
  const oz = t.match(/(\d+(?:\.\d+)?)\s*(fl\s*oz|oz|ounce|ounces)\b/);
  if (oz) {
    const val = parseFloat(oz[1]);
    const isFl = oz[2].startsWith('fl');
    const gramsPerOz = isFl ? getGramsPerFluidOunce(category) : GRAMS_PER_OUNCE;
    return val * gramsPerOz;
  }

  // Weight: kg
  const kg = t.match(/(\d+(?:\.\d+)?)\s*(?:kg|kilogram|kilograms)\b/);
  if (kg) return parseFloat(kg[1]) * 1000;

  // Weight: g
  const g = t.match(/(\d+(?:\.\d+)?)\s*(?:g|gram|grams)\b/);
  if (g) return parseFloat(g[1]);

  // Weight: mg
  const mg = t.match(/(\d+(?:\.\d+)?)\s*(?:mg|milligram|milligrams)\b/);
  if (mg) return parseFloat(mg[1]) / 1000;

  // Volume: ml (approx)
  const ml = t.match(/(\d+(?:\.\d+)?)\s*(?:ml|milliliter|milliliters)\b/);
  if (ml) return parseFloat(ml[1]);

  return 0;
}

export function parseWeightToGramsFromText(text: string): number {
  return parseWeightToGrams(text);
}

export function computeUnitPriceUsdPerGram(priceUsd: number, weightGrams: number): number {
  if (!Number.isFinite(priceUsd) || priceUsd <= 0) return 0;
  if (!Number.isFinite(weightGrams) || weightGrams <= 0) return 0;
  return priceUsd / weightGrams;
}
