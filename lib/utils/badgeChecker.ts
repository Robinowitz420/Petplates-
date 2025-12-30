// lib/utils/badgeChecker.ts
// Badge checking logic for pet achievements

import { BadgeType, BadgeCheckContext } from '@/lib/types/badges';
import { getPetBadges, unlockBadge, updateBadgeProgress, hasBadge } from './badgeStorage';
import { getTierForProgress, getNextTierThreshold } from '@/lib/data/badgeDefinitions';
import { getPetPurchaseCount } from './petPurchaseTracking';
import { getPets } from './petStorage';
import { logger } from './logger';

/**
 * Check The Nutrient Navigator badge (100% compatibility score)
 */
export async function checkPerfectMatchBadge(
  userId: string,
  petId: string,
  compatibilityScore: number
): Promise<boolean> {
  if (compatibilityScore !== 100) {
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

/**
 * Check Planning Volume badge (progressive: 1, 10, 50)
 */
export async function checkWeekWhiskerBadge(
  userId: string,
  petId: string,
  completionCount: number
): Promise<boolean> {
  if (completionCount < 1) {
    return false;
  }

  const tier = getTierForProgress(BadgeType.WEEK_WHISKER, completionCount);
  if (!tier) {
    return false;
  }

  const nextThreshold = getNextTierThreshold(BadgeType.WEEK_WHISKER, tier);
  
  updateBadgeProgress(
    userId,
    petId,
    BadgeType.WEEK_WHISKER,
    completionCount,
    tier
  );

  // Also unlock if this is a new tier
  const badges = getPetBadges(userId, petId);
  const existingBadge = badges.badges.find(b => b.type === BadgeType.WEEK_WHISKER);
  
  if (!existingBadge || existingBadge.tier !== tier) {
    // New tier unlocked
    unlockBadge(userId, petId, BadgeType.WEEK_WHISKER, tier);
    return true;
  }

  // Update progress
  if (existingBadge) {
    existingBadge.progress = completionCount;
    existingBadge.nextTierThreshold = nextThreshold || undefined;
  }

  return false; // No new unlock, just progress update
}

/**
 * Check Purchase Commitment badge (progressive: 1, 10, 20, 30, 40, 50+)
 */
export async function checkPurchaseChampionBadge(
  userId: string,
  petId: string,
  purchaseCount: number
): Promise<boolean> {
  if (purchaseCount < 1) {
    return false;
  }

  const tier = getTierForProgress(BadgeType.PURCHASE_CHAMPION, purchaseCount);
  if (!tier) {
    return false;
  }

  const nextThreshold = getNextTierThreshold(BadgeType.PURCHASE_CHAMPION, tier);
  
  updateBadgeProgress(
    userId,
    petId,
    BadgeType.PURCHASE_CHAMPION,
    purchaseCount,
    tier
  );

  // Also unlock if this is a new tier
  const badges = getPetBadges(userId, petId);
  const existingBadge = badges.badges.find(b => b.type === BadgeType.PURCHASE_CHAMPION);
  
  if (!existingBadge || existingBadge.tier !== tier) {
    // New tier unlocked
    unlockBadge(userId, petId, BadgeType.PURCHASE_CHAMPION, tier);
    return true;
  }

  // Update progress
  if (existingBadge) {
    existingBadge.progress = purchaseCount;
    existingBadge.nextTierThreshold = nextThreshold || undefined;
  }

  return false; // No new unlock, just progress update
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

    // Perfect Match (100% compatibility)
    if (context.compatibilityScore === 100) {
      const wasUnlocked = await checkPerfectMatchBadge(userId, petId, context.compatibilityScore);
      if (wasUnlocked) unlocked.push(BadgeType.PERFECT_MATCH);
    }

    // Preparation (meal created)
    if (context.action === 'meal_created') {
      const wasUnlocked = unlockBadge(userId, petId, BadgeType.PREPARATION);
      if (wasUnlocked) unlocked.push(BadgeType.PREPARATION);
    }

    // Feast Architect (weekly plan completion)
    if (context.action === 'meal_plan_completed') {
      const weeklyPlanCompleted = context.weeklyPlanCompleted ?? false;
      const wasUnlocked = await checkFeastArchitectBadge(userId, petId, weeklyPlanCompleted);
      if (wasUnlocked) unlocked.push(BadgeType.FEAST_ARCHITECT);
    }

    // Week Whisker (progressive)
    if (context.action === 'meal_plan_completed' && context.completionCount !== undefined) {
      const wasUnlocked = await checkWeekWhiskerBadge(userId, petId, context.completionCount);
      if (wasUnlocked) {
        unlocked.push(BadgeType.WEEK_WHISKER);
      } else {
        updated.push(BadgeType.WEEK_WHISKER);
      }
    }

    // Purchase Champion (progressive)
    if (context.action === 'purchase_confirmed') {
      const purchaseCount = context.purchaseCount ?? getPetPurchaseCount(userId, petId);
      const wasUnlocked = await checkPurchaseChampionBadge(userId, petId, purchaseCount);
      if (wasUnlocked) {
        unlocked.push(BadgeType.PURCHASE_CHAMPION);
      } else {
        updated.push(BadgeType.PURCHASE_CHAMPION);
      }
    }

    // Utility badges
    if (context.action === 'search_discovery') {
      const wasUnlocked = unlockBadge(userId, petId, BadgeType.SEARCH_DISCOVERY);
      if (wasUnlocked) unlocked.push(BadgeType.SEARCH_DISCOVERY);
    }
    if (context.action === 'daily_login') {
      const wasUnlocked = unlockBadge(userId, petId, BadgeType.DAILY_LOGIN);
      if (wasUnlocked) unlocked.push(BadgeType.DAILY_LOGIN);
    }
    if (context.action === 'profile_setup') {
      const wasUnlocked = unlockBadge(userId, petId, BadgeType.PROFILE_SETUP);
      if (wasUnlocked) unlocked.push(BadgeType.PROFILE_SETUP);
    }

  } catch (error) {
    logger.error('Error checking badges', error as Error, { userId, petId, context });
  }

  return { unlocked, updated };
}

