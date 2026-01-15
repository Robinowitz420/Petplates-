// lib/utils/badgeChecker.ts
// Badge checking logic for pet achievements

import { BadgeType, BadgeCheckContext } from '@/lib/types/badges';
import { getPetBadges, unlockBadge, hasBadge } from './badgeStorage';
import { getPetPurchaseCount } from './petPurchaseTracking';
import { getPets } from './petStorage';
import { logger } from './logger';
import { safeGetItem, safeSetItem, safeParseJSON } from './localStorageSafe';

/**
 * Check The Nutrient Navigator badge (>=95% compatibility score)
 */
export async function checkPerfectMatchBadge(
  userId: string,
  petId: string,
  compatibilityScore: number
): Promise<boolean> {
  if (compatibilityScore < 95) {
    return false;
  }

  const badges = getPetBadges(userId, petId);
  if (hasBadge(badges, BadgeType.PERFECT_MATCH)) {
    return false; // Already unlocked
  }

  return unlockBadge(userId, petId, BadgeType.PERFECT_MATCH);
}

/**
 * Check The Master Meal Planner badge (requires ALL THREE conditions)
 */
export async function checkFeastArchitectBadge(
  userId: string,
  petId: string,
  weeklyPlanCompleted: boolean
): Promise<boolean> {
  if (!weeklyPlanCompleted) return false;

  const badges = getPetBadges(userId, petId);
  if (hasBadge(badges, BadgeType.FEAST_ARCHITECT)) {
    return false; // Already unlocked
  }

  return unlockBadge(userId, petId, BadgeType.FEAST_ARCHITECT);
}

function getMetricKey(userId: string, petId: string, metric: string): string {
  return `pet_badge_metric_${metric}_${userId}_${petId}`;
}

function incrementMetric(userId: string, petId: string, metric: string, delta: number = 1): number {
  if (!userId || !petId) return 0;
  const key = getMetricKey(userId, petId, metric);
  const current = safeParseJSON<number>(safeGetItem(key), 0);
  const next = (Number(current) || 0) + delta;
  safeSetItem(key, JSON.stringify(next));
  return next;
}

/**
 * Main function to check all relevant badges based on action context
 */
export async function checkAllBadges(
  userId: string,
  petId: string,
  context: BadgeCheckContext
): Promise<{ unlocked: BadgeType[]; updated: BadgeType[] }> {
  const unlocked: BadgeType[] = [];
  const updated: BadgeType[] = [];

  try {
    // Load pet data for context
    const pets = await getPets(userId);
    const pet = pets.find(p => p.id === petId);
    
    if (!pet) {
      logger.warn('Pet not found for badge checking', { userId, petId });
      return { unlocked, updated };
    }

    // Perfect Match (>=95% compatibility)
    if (typeof context.compatibilityScore === 'number' && context.compatibilityScore >= 95) {
      const wasUnlocked = await checkPerfectMatchBadge(userId, petId, context.compatibilityScore);
      if (wasUnlocked) unlocked.push(BadgeType.PERFECT_MATCH);
    }

    // Preparation (meal created)
    if (context.action === 'meal_created') {
      const wasUnlocked = unlockBadge(userId, petId, BadgeType.PREPARATION);
      if (wasUnlocked) unlocked.push(BadgeType.PREPARATION);
    }

    // Sherlock Hat (3 custom meals saved)
    if (context.action === 'custom_meal_saved') {
      const count = typeof context.customMealCount === 'number' ? context.customMealCount : 0;
      if (count >= 3) {
        const wasUnlocked = unlockBadge(userId, petId, BadgeType.SHERLOCK_HAT);
        if (wasUnlocked) unlocked.push(BadgeType.SHERLOCK_HAT);
      }
    }

    // Feast Architect (weekly plan completion)
    if (context.action === 'meal_plan_completed') {
      const weeklyPlanCompleted = context.weeklyPlanCompleted ?? false;
      const wasUnlocked = await checkFeastArchitectBadge(userId, petId, weeklyPlanCompleted);
      if (wasUnlocked) unlocked.push(BadgeType.FEAST_ARCHITECT);
    }

    // Week Whisker (start building a plan)
    if (context.action === 'meal_plan_updated') {
      const mealPlanCount = typeof context.mealPlanCount === 'number' ? context.mealPlanCount : 0;
      if (mealPlanCount >= 1) {
        const wasUnlocked = unlockBadge(userId, petId, BadgeType.WEEK_WHISKER);
        if (wasUnlocked) unlocked.push(BadgeType.WEEK_WHISKER);
      }
    }

    // Purchases (standalone tiers)
    if (context.action === 'purchase_confirmed') {
      const purchaseCount = context.purchaseCount ?? getPetPurchaseCount(userId, petId);

      if (purchaseCount >= 1) {
        const wasUnlocked = unlockBadge(userId, petId, BadgeType.PURCHASE_CHAMPION);
        if (wasUnlocked) unlocked.push(BadgeType.PURCHASE_CHAMPION);
      }
      if (purchaseCount >= 5) {
        const wasUnlocked = unlockBadge(userId, petId, BadgeType.PURCHASE_BASKET);
        if (wasUnlocked) unlocked.push(BadgeType.PURCHASE_BASKET);
      }
      if (purchaseCount >= 10) {
        const wasUnlocked = unlockBadge(userId, petId, BadgeType.PURCHASE_HOE);
        if (wasUnlocked) unlocked.push(BadgeType.PURCHASE_HOE);
      }
      if (purchaseCount >= 15) {
        const wasUnlocked = unlockBadge(userId, petId, BadgeType.PURCHASE_BOWL);
        if (wasUnlocked) unlocked.push(BadgeType.PURCHASE_BOWL);
      }
      if (purchaseCount >= 20) {
        const wasUnlocked = unlockBadge(userId, petId, BadgeType.PURCHASE_GOGGLES);
        if (wasUnlocked) unlocked.push(BadgeType.PURCHASE_GOGGLES);
      }
      if (purchaseCount >= 30) {
        const wasUnlocked = unlockBadge(userId, petId, BadgeType.PURCHASE_MONOCLE);
        if (wasUnlocked) unlocked.push(BadgeType.PURCHASE_MONOCLE);
      }
    }

    // Utility badges
    if (context.action === 'search_discovery') {
      const wasUnlocked = unlockBadge(userId, petId, BadgeType.SEARCH_DISCOVERY);
      if (wasUnlocked) unlocked.push(BadgeType.SEARCH_DISCOVERY);
    }
    if (context.action === 'pet_photo_uploaded') {
      const wasUnlocked = unlockBadge(userId, petId, BadgeType.PROFILE_SETUP);
      if (wasUnlocked) unlocked.push(BadgeType.PROFILE_SETUP);
    }

    // Bird Hat (view 5 recipe pages)
    if (context.action === 'recipe_viewed') {
      const total = incrementMetric(userId, petId, 'recipe_views', 1);
      if (total >= 5) {
        const wasUnlocked = unlockBadge(userId, petId, BadgeType.BIRD_HAT);
        if (wasUnlocked) unlocked.push(BadgeType.BIRD_HAT);
      }
    }

  } catch (error) {
    logger.error('Error checking badges', error as Error, { userId, petId, context });
  }

  return { unlocked, updated };
}

