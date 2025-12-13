// lib/utils/badgeChecker.ts
// Badge checking logic for pet achievements

import { BadgeType, BadgeTier, BadgeCheckContext } from '@/lib/types/badges';
import { getPetBadges, unlockBadge, updateBadgeProgress, hasBadge } from './badgeStorage';
import { getTierForProgress, getNextTierThreshold } from '@/lib/data/badgeDefinitions';
import { getPetPurchaseCount } from './petPurchaseTracking';
import { getPets } from './petStorage';
import { logger } from './logger';

/**
 * Check The Nutrient Navigator badge (100% compatibility score)
 */
export async function checkNutrientNavigatorBadge(
  userId: string,
  petId: string,
  compatibilityScore: number
): Promise<boolean> {
  if (compatibilityScore !== 100) {
    return false;
  }

  const badges = getPetBadges(userId, petId);
  if (hasBadge(badges, BadgeType.NUTRIENT_NAVIGATOR)) {
    return false; // Already unlocked
  }

  return unlockBadge(userId, petId, BadgeType.NUTRIENT_NAVIGATOR);
}

/**
 * Check The Master Meal Planner badge (requires ALL THREE conditions)
 */
export async function checkMasterMealPlannerBadge(
  userId: string,
  petId: string,
  mealPlanCount: number,
  savedRecipesCount: number,
  weeklyPlanCompleted: boolean
): Promise<boolean> {
  // Check if ALL THREE conditions are met
  const has4PlusMeals = mealPlanCount >= 4;
  const has10PlusSaved = savedRecipesCount >= 10;
  const hasCompletedWeek = weeklyPlanCompleted;

  if (!has4PlusMeals || !has10PlusSaved || !hasCompletedWeek) {
    return false; // Not all conditions met
  }

  const badges = getPetBadges(userId, petId);
  if (hasBadge(badges, BadgeType.MASTER_MEAL_PLANNER)) {
    return false; // Already unlocked
  }

  return unlockBadge(userId, petId, BadgeType.MASTER_MEAL_PLANNER);
}

/**
 * Check Planning Volume badge (progressive: 1, 10, 50)
 */
export async function checkPlanningVolumeBadge(
  userId: string,
  petId: string,
  completionCount: number
): Promise<boolean> {
  if (completionCount < 1) {
    return false;
  }

  const tier = getTierForProgress(BadgeType.PLANNING_VOLUME, completionCount);
  if (!tier) {
    return false;
  }

  const nextThreshold = getNextTierThreshold(BadgeType.PLANNING_VOLUME, tier);
  
  updateBadgeProgress(
    userId,
    petId,
    BadgeType.PLANNING_VOLUME,
    completionCount,
    tier
  );

  // Also unlock if this is a new tier
  const badges = getPetBadges(userId, petId);
  const existingBadge = badges.badges.find(b => b.type === BadgeType.PLANNING_VOLUME);
  
  if (!existingBadge || existingBadge.tier !== tier) {
    // New tier unlocked
    unlockBadge(userId, petId, BadgeType.PLANNING_VOLUME, tier);
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
export async function checkPurchaseCommitmentBadge(
  userId: string,
  petId: string,
  purchaseCount: number
): Promise<boolean> {
  if (purchaseCount < 1) {
    return false;
  }

  const tier = getTierForProgress(BadgeType.PURCHASE_COMMITMENT, purchaseCount);
  if (!tier) {
    return false;
  }

  const nextThreshold = getNextTierThreshold(BadgeType.PURCHASE_COMMITMENT, tier);
  
  updateBadgeProgress(
    userId,
    petId,
    BadgeType.PURCHASE_COMMITMENT,
    purchaseCount,
    tier
  );

  // Also unlock if this is a new tier
  const badges = getPetBadges(userId, petId);
  const existingBadge = badges.badges.find(b => b.type === BadgeType.PURCHASE_COMMITMENT);
  
  if (!existingBadge || existingBadge.tier !== tier) {
    // New tier unlocked
    unlockBadge(userId, petId, BadgeType.PURCHASE_COMMITMENT, tier);
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

    // Check Nutrient Navigator (100% compatibility)
    if (context.compatibilityScore === 100) {
      const wasUnlocked = await checkNutrientNavigatorBadge(
        userId,
        petId,
        context.compatibilityScore
      );
      if (wasUnlocked) {
        unlocked.push(BadgeType.NUTRIENT_NAVIGATOR);
      }
    }

    // Check Master Meal Planner (requires all conditions)
    if (context.action === 'meal_plan_created' || 
        context.action === 'recipe_saved' || 
        context.action === 'recipe_removed' ||
        context.action === 'meal_plan_completed') {
      
      const mealPlanCount = context.mealPlanCount ?? 0;
      const savedRecipesCount = context.savedRecipesCount ?? (pet.savedRecipes?.length || 0);
      const weeklyPlanCompleted = context.weeklyPlanCompleted ?? false;

      const wasUnlocked = await checkMasterMealPlannerBadge(
        userId,
        petId,
        mealPlanCount,
        savedRecipesCount,
        weeklyPlanCompleted
      );
      if (wasUnlocked) {
        unlocked.push(BadgeType.MASTER_MEAL_PLANNER);
      }
    }

    // Check Planning Volume (progressive)
    if (context.action === 'meal_plan_completed' && context.completionCount !== undefined) {
      const wasUnlocked = await checkPlanningVolumeBadge(
        userId,
        petId,
        context.completionCount
      );
      if (wasUnlocked) {
        unlocked.push(BadgeType.PLANNING_VOLUME);
      } else {
        updated.push(BadgeType.PLANNING_VOLUME);
      }
    }

    // Check Purchase Commitment (progressive)
    if (context.action === 'purchase_confirmed') {
      const purchaseCount = context.purchaseCount ?? getPetPurchaseCount(userId, petId);
      
      const wasUnlocked = await checkPurchaseCommitmentBadge(
        userId,
        petId,
        purchaseCount
      );
      if (wasUnlocked) {
        unlocked.push(BadgeType.PURCHASE_COMMITMENT);
      } else {
        updated.push(BadgeType.PURCHASE_COMMITMENT);
      }
    }

  } catch (error) {
    logger.error('Error checking badges', error as Error, { userId, petId, context });
  }

  return { unlocked, updated };
}

