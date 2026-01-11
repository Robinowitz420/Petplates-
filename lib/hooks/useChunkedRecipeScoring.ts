// lib/hooks/useChunkedRecipeScoring.ts
// Chunked recipe scoring hook for non-blocking UI performance

import { useState, useEffect, useRef, useMemo } from 'react';
import type { Recipe, ModifiedRecipeResult } from '@/lib/types';
import { scoreWithSpeciesEngine } from '@/lib/utils/speciesScoringEngines';

type ScoringPet = {
  id: string;
  name: string;
  type: 'dog' | 'cat' | 'bird' | 'reptile' | 'pocket-pet';
  breed: string;
  age: number;
  weight: number;
  activityLevel?: 'sedentary' | 'moderate' | 'active' | 'very-active';
  healthConcerns: string[];
  dietaryRestrictions: string[];
  allergies?: string[];
};

interface ScoredMeal {
  meal: ModifiedRecipeResult | { recipe: Recipe; explanation: string };
  score: number;
  recipeId: string;
}

interface CacheEntry {
  scores: ScoredMeal[];
  timestamp: number;
  recipeIds: string[];
  petProfileHash: string;
  version?: string;
}

interface IndividualCacheEntry {
  score: number;
  timestamp: number;
  recipeId: string;
  petProfileHash: string;
  version?: string;
}

const SCORING_VERSION = 'v7';
const CACHE_KEY_PREFIX = `recipe_scores_${SCORING_VERSION}_`;
const INDIVIDUAL_CACHE_KEY_PREFIX = `recipe_score_${SCORING_VERSION}_`;
const CACHE_DURATION_MS = 30 * 60 * 1000; // 30 minutes
const CHUNK_SIZE = 20; // Recipes per frame
const MAX_CACHE_SIZE_MB = 5; // Maximum cache size in MB
const MAX_CACHE_ENTRIES = 50; // Maximum number of cache entries before LRU eviction
const SCORE_JITTER_STEP = 0;
const MAX_JITTER_TOTAL = 0;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

function applyScoreJitter(items: ScoredMeal[]): ScoredMeal[] {
  if (SCORE_JITTER_STEP <= 0 || MAX_JITTER_TOTAL <= 0) return items;
  const jittered = items.map((item) => ({ ...item }));
  let i = 0;

  while (i < jittered.length) {
    const baseScore = jittered[i].score;
    let j = i + 1;

    while (j < jittered.length && Math.abs(jittered[j].score - baseScore) < 0.001) {
      j++;
    }

    const groupSize = j - i;
    if (groupSize > 1) {
      const positiveOffset = Math.min(SCORE_JITTER_STEP, MAX_JITTER_TOTAL);
      jittered[i].score = Math.round(clamp(baseScore + positiveOffset, 0, 100));

      for (let idx = 1; idx < groupSize; idx++) {
        const negativeOffset = Math.min(SCORE_JITTER_STEP * idx, MAX_JITTER_TOTAL);
        jittered[i + idx].score = Math.round(clamp(baseScore - negativeOffset, 0, 100));
      }
    }

    i = j;
  }

  return jittered;
}

/**
 * Simple string hash function for stable hashing
 * Produces consistent hash regardless of object property order
 */
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Generate a stable hash from pet profile for caching
 * Uses sorted arrays to ensure consistent hash regardless of property order
 */
function generatePetProfileHash(
  pet: null, // Deprecated - using enhancedPet only
  enhancedPet: ScoringPet | null
): string {
  if (!enhancedPet) return 'no-pet';
  
  const petData = enhancedPet;
  
  // Create stable string representation with sorted arrays
  const healthConcerns = (petData.healthConcerns || []).slice().sort().join(',');
  const allergies = ((petData.allergies || petData.dietaryRestrictions || [])).slice().sort().join(',');
  
  const stableString = [
    petData.id || '',
    petData.type || '',
    petData.breed || '',
    typeof petData.age === 'string' ? parseFloat(petData.age) || 0 : petData.age || 0,
    petData.weight || 0,
    petData.activityLevel || 'moderate',
    healthConcerns,
    allergies,
  ].join('|');
  
  return simpleHash(stableString);
}

/**
 * Get individual recipe score from cache
 */
function getCachedRecipeScore(
  recipeId: string,
  petProfileHash: string
): number | null {
  if (typeof window === 'undefined') return null;

  try {
    const cacheKey = `${INDIVIDUAL_CACHE_KEY_PREFIX}${recipeId}_${petProfileHash}`;
    const cached = localStorage.getItem(cacheKey);
    
    if (!cached) return null;

    const entry: IndividualCacheEntry = JSON.parse(cached);
    
    // Validate cache
    const now = Date.now();
    const isExpired = now - entry.timestamp > CACHE_DURATION_MS;
    const versionMatch = entry.version === SCORING_VERSION;
    const hashMatch = entry.petProfileHash === petProfileHash;
    const recipeMatch = entry.recipeId === recipeId;

    if (!isExpired && versionMatch && hashMatch && recipeMatch) {
      return entry.score;
    }
  } catch (error) {
    // Silently fail for individual cache misses
  }

  return null;
}

/**
 * Cache individual recipe score
 */
function cacheRecipeScore(
  recipeId: string,
  score: number,
  petProfileHash: string
): void {
  if (typeof window === 'undefined') return;

  const cacheKey = `${INDIVIDUAL_CACHE_KEY_PREFIX}${recipeId}_${petProfileHash}`;
  const entry: IndividualCacheEntry = {
    score,
    timestamp: Date.now(),
    recipeId,
    petProfileHash,
    version: SCORING_VERSION,
  };

  try {
    localStorage.setItem(cacheKey, JSON.stringify(entry));
  } catch (error) {
    // Silently fail for individual cache writes (batch cache will handle quota)
  }
}

/**
 * Get cached scores if available and valid
 */
function getCachedScores(
  meals: (ModifiedRecipeResult | { recipe: Recipe; explanation: string })[],
  petProfileHash: string
): ScoredMeal[] | null {
  if (typeof window === 'undefined') return null;

  try {
    const cacheKey = `${CACHE_KEY_PREFIX}${petProfileHash}`;
    const cached = localStorage.getItem(cacheKey);
    
    if (!cached) return null;

    const entry: CacheEntry = JSON.parse(cached);
    
    // Validate cache
    const now = Date.now();
    const isExpired = now - entry.timestamp > CACHE_DURATION_MS;
    const versionMatch = (entry.version || 'v1') === SCORING_VERSION; // Default to v1 for old caches
    const recipeIdsMatch = 
      entry.recipeIds.length === meals.length &&
      entry.recipeIds.every((id, i) => id === (meals[i]?.recipe?.id || ''));
    const hashMatch = entry.petProfileHash === petProfileHash;

    if (!isExpired && versionMatch && recipeIdsMatch && hashMatch) {
      console.log('Using cached recipe scores');
      return entry.scores;
    }
  } catch (error) {
    console.warn('Failed to read score cache:', error);
  }

  return null;
}

/**
 * Get cache size in bytes (approximate)
 */
function getCacheSize(): number {
  if (typeof window === 'undefined') return 0;
  
  let size = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.startsWith(CACHE_KEY_PREFIX) || key.startsWith(INDIVIDUAL_CACHE_KEY_PREFIX))) {
      const value = localStorage.getItem(key);
      if (value) {
        size += key.length + value.length;
      }
    }
  }
  return size;
}

/**
 * Get all cache entries with timestamps for LRU eviction
 */
function getCacheEntriesWithTimestamps(): Array<{ key: string; timestamp: number; size: number }> {
  if (typeof window === 'undefined') return [];
  
  const entries: Array<{ key: string; timestamp: number; size: number }> = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.startsWith(CACHE_KEY_PREFIX) || key.startsWith(INDIVIDUAL_CACHE_KEY_PREFIX))) {
      try {
        const value = localStorage.getItem(key);
        if (value) {
          const parsed = JSON.parse(value);
          entries.push({
            key,
            timestamp: parsed.timestamp || 0,
            size: key.length + value.length,
          });
        }
      } catch {
        // Skip invalid entries
      }
    }
  }
  
  return entries.sort((a, b) => a.timestamp - b.timestamp); // Oldest first
}

/**
 * Evict old cache entries using LRU strategy
 */
function evictOldCacheEntries(): void {
  if (typeof window === 'undefined') return;
  
  const maxSizeBytes = MAX_CACHE_SIZE_MB * 1024 * 1024;
  const currentSize = getCacheSize();
  
  if (currentSize <= maxSizeBytes) return;
  
  // Get entries sorted by timestamp (oldest first)
  const entries = getCacheEntriesWithTimestamps();
  
  // Remove oldest entries until we're under the limit
  let sizeToRemove = currentSize - maxSizeBytes;
  for (const entry of entries) {
    if (sizeToRemove <= 0) break;
    
    try {
      localStorage.removeItem(entry.key);
      sizeToRemove -= entry.size;
    } catch {
      // Continue if removal fails
    }
  }
  
  // Also limit by entry count
  const remainingEntries = getCacheEntriesWithTimestamps();
  if (remainingEntries.length > MAX_CACHE_ENTRIES) {
    const toRemove = remainingEntries.slice(0, remainingEntries.length - MAX_CACHE_ENTRIES);
    for (const entry of toRemove) {
      try {
        localStorage.removeItem(entry.key);
      } catch {
        // Continue if removal fails
      }
    }
  }
}

/**
 * Clear all caches for a specific version (useful when version changes)
 */
export function clearCacheForVersion(version: string): void {
  if (typeof window === 'undefined') return;
  
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.includes(`_${version}_`) || key.startsWith(`recipe_scores_${version}_`) || key.startsWith(`recipe_score_${version}_`))) {
      keysToRemove.push(key);
    }
  }
  
  keysToRemove.forEach(key => {
    try {
      localStorage.removeItem(key);
    } catch {
      // Continue if removal fails
    }
  });
}

/**
 * Cache scored results
 */
function cacheScores(
  scores: ScoredMeal[],
  meals: (ModifiedRecipeResult | { recipe: Recipe; explanation: string })[],
  petProfileHash: string
): void {
  if (typeof window === 'undefined') return;

  // Evict old entries before caching new ones
  evictOldCacheEntries();

  const cacheKey = `${CACHE_KEY_PREFIX}${petProfileHash}`;
  const entry: CacheEntry = {
    scores,
    timestamp: Date.now(),
    recipeIds: meals.map(m => m.recipe?.id || ''),
    petProfileHash,
    version: SCORING_VERSION,
  };

  try {
    localStorage.setItem(cacheKey, JSON.stringify(entry));
    
    // Also cache individual scores for future use
    scores.forEach(scored => {
      cacheRecipeScore(scored.recipeId, scored.score, petProfileHash);
    });
  } catch (error) {
    console.warn('Failed to cache scores:', error);
    // Handle quota exceeded errors gracefully
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      // Evict more aggressively
      evictOldCacheEntries();
      try {
        // Retry caching
        localStorage.setItem(cacheKey, JSON.stringify(entry));
      } catch (retryError) {
        console.warn('Failed to cache scores after cleanup:', retryError);
      }
    }
  }
}

/**
 * Compute score for a single meal
 * Checks individual recipe cache before computing
 */
function computeMealScore(
  meal: ModifiedRecipeResult | { recipe: Recipe; explanation: string },
  ratingPet: null, // Deprecated - kept for type compatibility but always null
  enhancedPet: ScoringPet | null,
  petProfileHash: string
): number {
  // If meal already has a score, use it
  if ('score' in meal && typeof (meal as ModifiedRecipeResult).score === 'number') {
    return Number((meal as ModifiedRecipeResult).score);
  }
  
  const recipeId = meal.recipe?.id || '';
  
  // Check individual recipe cache first
  if (recipeId) {
    const cachedScore = getCachedRecipeScore(recipeId, petProfileHash);
    if (cachedScore !== null) {
      return cachedScore;
    }
  }
  
  if (!enhancedPet) return 0;
  
  let score = 0;
  
  try {
    // Use enhanced compatibility scoring for breakdown, but species engine for final score
    const scored = scoreWithSpeciesEngine(meal.recipe, enhancedPet);
    score = Number(scored.overallScore);
  } catch (error) {
    console.warn('Error scoring meal:', error);
    score = 0;
  }
  
  // Cache the computed score for future use
  if (recipeId && score > 0) {
    cacheRecipeScore(recipeId, score, petProfileHash);
  }
  
  return score;
}

/**
 * Hook for chunked recipe scoring
 * 
 * Processes meals in chunks using requestAnimationFrame to keep UI responsive
 */
export function useChunkedRecipeScoring(
  meals: (ModifiedRecipeResult | { recipe: Recipe; explanation: string })[],
  ratingPet: null, // Deprecated - using enhancedPet only
  enhancedPet: ScoringPet | null
) {
  const [scoredMeals, setScoredMeals] = useState<ScoredMeal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  
  const chunkIndexRef = useRef(0);
  const frameIdRef = useRef<number | null>(null);
  const isMountedRef = useRef(true);

  // Generate pet profile hash for caching
  const petProfileHash = generatePetProfileHash(ratingPet, enhancedPet);

  // Check cache first
  useEffect(() => {
    if (meals.length === 0) {
      setScoredMeals([]);
      setIsLoading(false);
      setProgress(100);
      return;
    }

    const cached = getCachedScores(meals, petProfileHash);
    if (cached) {
      setScoredMeals(cached);
      setIsLoading(false);
      setProgress(100);
      return;
    }

    // Start chunked scoring
    setIsLoading(true);
    setProgress(0);
    setScoredMeals([]);
    chunkIndexRef.current = 0;
    isMountedRef.current = true;

    const processChunk = () => {
      if (!isMountedRef.current) return;

      const startIndex = chunkIndexRef.current;
      const endIndex = Math.min(startIndex + CHUNK_SIZE, meals.length);

      if (startIndex >= meals.length) {
        // All done - apply calibration before marking as complete
        setIsLoading(false);
        setProgress(100);
        return;
      }

      // Process current chunk
      const chunk = meals.slice(startIndex, endIndex);
      const newScores: ScoredMeal[] = chunk.map((meal, idx) => {
        const recipeId = meal.recipe?.id || `unknown-${startIndex + idx}`;
        const score = computeMealScore(meal, ratingPet, enhancedPet, petProfileHash);
        return {
          meal,
          score,
          recipeId,
        };
      });

      // Update state with new scores
      setScoredMeals(prev => {
        const updated = [...prev, ...newScores];
        // Sort as we go (optional - can defer to final sort)
        return updated;
      });

      // Update progress
      const newProgress = Math.floor((endIndex / meals.length) * 100);
      setProgress(newProgress);

      // Move to next chunk
      chunkIndexRef.current = endIndex;

      // Schedule next chunk
      frameIdRef.current = requestAnimationFrame(processChunk);
    };

    // Start processing
    frameIdRef.current = requestAnimationFrame(processChunk);

    return () => {
      isMountedRef.current = false;
      if (frameIdRef.current !== null) {
        cancelAnimationFrame(frameIdRef.current);
      }
    };
  }, [meals, petProfileHash, enhancedPet]);

  // Cache results when scoring completes
  useEffect(() => {
    if (!isLoading && scoredMeals.length > 0 && scoredMeals.length === meals.length) {
      cacheScores(scoredMeals, meals, petProfileHash);
    }
  }, [isLoading, scoredMeals, meals, petProfileHash]);

  // Sort final results by score (descending) and format for rendering
  const scoredMealsToRender = useMemo(() => {
    const mealsToSort = scoredMeals;
    const sorted = [...mealsToSort].sort((a, b) => {
      const scoreDiff = b.score - a.score;
      if (Math.abs(scoreDiff) > 0.001) {
        return scoreDiff;
      }
      // Tiebreaker: recipe ID
      return a.recipeId.localeCompare(b.recipeId);
    });

    const jittered = applyScoreJitter(sorted);

    return jittered.map(item => {
      if ('score' in item.meal && typeof (item.meal as ModifiedRecipeResult).score === 'number') {
        return { ...(item.meal as ModifiedRecipeResult), score: item.score };
      }
      return { ...item.meal, score: item.score };
    });
  }, [scoredMeals]);

  return {
    scoredMeals: scoredMealsToRender,
    isLoading,
    progress,
    totalMeals: meals.length,
    scoredCount: scoredMeals.length,
  };
}


