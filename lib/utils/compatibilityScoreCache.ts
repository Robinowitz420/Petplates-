type CachedScore = {
  overallScore: number;
  ts: number;
  breakdown?: Record<string, {
    score: number;
    weightedContribution?: number;
    weight: number;
    reason?: string;
    recommendations?: any[]
  }>;
  warnings?: string[];
  strengths?: string[];
  nutritionalGaps?: string[];
  supplementRecommendations?: any[];
  compatibility?: string;
  summaryReasoning?: string;
};

const SESSION_PREFIX = 'compatScore:v3:';

function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return String(Math.abs(hash));
}

export function getRecipeFingerprint(recipe: any): string {
  const ingredients = Array.isArray(recipe?.ingredients) ? recipe.ingredients : [];
  const supplements = Array.isArray(recipe?.supplements) ? recipe.supplements : [];

  const ingredientParts = ingredients
    .map((i: any) => {
      const idOrName = String(i?.id || i?.name || '').trim();
      const amount = String(i?.amount || '').trim();
      const category = String(i?.category || '').trim();
      if (!idOrName) return '';
      return `${idOrName}:${amount}:${category}`;
    })
    .filter(Boolean)
    .sort();

  const supplementParts = supplements
    .map((s: any) => {
      const name = String(s?.name || s?.productName || s?.id || '').trim();
      const amount = String(s?.amount || s?.defaultAmount || '').trim();
      if (!name) return '';
      return `${name}:${amount}`;
    })
    .filter(Boolean)
    .sort();

  const combined = `${ingredientParts.join('|')}||${supplementParts.join('|')}`;
  return combined ? hashString(combined) : '0';
}

function safeParseJSON<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function getCompatibilityScoreCacheKey(params: {
  userId: string;
  petId: string;
  recipeId: string;
  recipeFingerprint?: string;
}): string {
  const fp = String(params.recipeFingerprint || '').trim();
  return fp
    ? `${SESSION_PREFIX}${params.userId}::${params.petId}::${params.recipeId}::${fp}`
    : `${SESSION_PREFIX}${params.userId}::${params.petId}::${params.recipeId}`;
}

export function readCachedCompatibilityScore(params: {
  userId?: string | null;
  petId?: string | null;
  recipeId?: string | null;
  recipeFingerprint?: string | null;
  ttlMs?: number;
}): CachedScore | null {
  if (typeof window === 'undefined') return null;
  const userId = String(params.userId || '').trim();
  const petId = String(params.petId || '').trim();
  const recipeId = String(params.recipeId || '').trim();
  if (!userId || !petId || !recipeId) return null;

  const fingerprint = String(params.recipeFingerprint || '').trim();
  const key = getCompatibilityScoreCacheKey({ userId, petId, recipeId, recipeFingerprint: fingerprint || undefined });
  const parsed = safeParseJSON<CachedScore>(window.sessionStorage.getItem(key));
  if (!parsed || typeof parsed.overallScore !== 'number' || typeof parsed.ts !== 'number') {
    if (fingerprint) {
      return null;
    }

    const v2Key = `compatScore:v2:${userId}::${petId}::${recipeId}`;
    const v2Parsed = safeParseJSON<CachedScore>(window.sessionStorage.getItem(v2Key));
    if (v2Parsed && typeof v2Parsed.overallScore === 'number' && typeof v2Parsed.ts === 'number') {
      return v2Parsed;
    }

    const legacyKey = `compatScore:v1:${userId}::${petId}::${recipeId}`;
    const legacyParsed = safeParseJSON<{ overallScore: number; ts: number }>(window.sessionStorage.getItem(legacyKey));
    if (legacyParsed?.overallScore) return { ...legacyParsed, breakdown: undefined };
    return null;
  }

  const ttlMs = typeof params.ttlMs === 'number' && Number.isFinite(params.ttlMs) && params.ttlMs > 0 ? params.ttlMs : 30 * 60 * 1000;
  if (Date.now() - parsed.ts > ttlMs) return null;

  return parsed;
}

export function writeCachedCompatibilityScore(params: {
  userId?: string | null;
  petId?: string | null;
  recipeId?: string | null;
  recipeFingerprint?: string | null;
  overallScore: number;
  breakdown?: Record<string, any>;
  warnings?: string[];
  strengths?: string[];
  nutritionalGaps?: string[];
  supplementRecommendations?: any[];
  compatibility?: string;
  summaryReasoning?: string;
}): void {
  if (typeof window === 'undefined') return;
  const userId = String(params.userId || '').trim();
  const petId = String(params.petId || '').trim();
  const recipeId = String(params.recipeId || '').trim();
  if (!userId || !petId || !recipeId) return;

  const overallScore = params.overallScore;
  if (typeof overallScore !== 'number' || !Number.isFinite(overallScore)) return;

  const fingerprint = String(params.recipeFingerprint || '').trim();
  const key = getCompatibilityScoreCacheKey({ userId, petId, recipeId, recipeFingerprint: fingerprint || undefined });
  const value: CachedScore = {
    overallScore,
    ts: Date.now(),
    breakdown: params.breakdown,
    warnings: params.warnings,
    strengths: params.strengths,
    nutritionalGaps: params.nutritionalGaps,
    supplementRecommendations: params.supplementRecommendations,
    compatibility: params.compatibility,
    summaryReasoning: params.summaryReasoning,
  };
  try {
    window.sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}
