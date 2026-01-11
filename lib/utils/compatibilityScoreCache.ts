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

const SESSION_PREFIX = 'compatScore:v2:';

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
}): string {
  return `${SESSION_PREFIX}${params.userId}::${params.petId}::${params.recipeId}`;
}

export function readCachedCompatibilityScore(params: {
  userId?: string | null;
  petId?: string | null;
  recipeId?: string | null;
  ttlMs?: number;
}): CachedScore | null {
  if (typeof window === 'undefined') return null;
  const userId = String(params.userId || '').trim();
  const petId = String(params.petId || '').trim();
  const recipeId = String(params.recipeId || '').trim();
  if (!userId || !petId || !recipeId) return null;

  const key = getCompatibilityScoreCacheKey({ userId, petId, recipeId });
  const parsed = safeParseJSON<CachedScore>(window.sessionStorage.getItem(key));
  if (!parsed || typeof parsed.overallScore !== 'number' || typeof parsed.ts !== 'number') {
    // Fallback to legacy v1 format
    const legacyKey = `compatScore:v1:${userId}::${petId}::${recipeId}`;
    const legacyParsed = safeParseJSON<{ overallScore: number; ts: number }>(
      window.sessionStorage.getItem(legacyKey)
    );
    if (legacyParsed?.overallScore) {
      return { ...legacyParsed, breakdown: undefined };
    }
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

  const key = getCompatibilityScoreCacheKey({ userId, petId, recipeId });
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
