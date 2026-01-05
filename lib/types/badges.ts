// lib/types/badges.ts
// Badge type definitions for pet achievement system

/**
 * Badge types - one-time and progressive badges
 */
export enum BadgeType {
  PERFECT_MATCH = 'perfect_match',
  FEAST_ARCHITECT = 'feast_architect',
  WEEK_WHISKER = 'week_whisker',
  PURCHASE_CHAMPION = 'purchase_champion',
  PURCHASE_BASKET = 'purchase_basket',
  PURCHASE_HOE = 'purchase_hoe',
  PURCHASE_BOWL = 'purchase_bowl',
  PURCHASE_GOGGLES = 'purchase_goggles',
  PURCHASE_MONOCLE = 'purchase_monocle',
  SEARCH_DISCOVERY = 'search_discovery',
  BIRD_HAT = 'bird_hat',
  PROFILE_SETUP = 'profile_setup',
  PREPARATION = 'preparation',
  LAB_COAT = 'lab_coat',
  SHERLOCK_HAT = 'sherlock_hat',
}

/**
 * Badge tiers for progressive badges
 */
export type BadgeTier = 
  | 'bronze'
  | 'silver'
  | 'gold'
  | 'platinum'
  | 'diamond'
  | 'sultan'; // For Subscription Sultan

/**
 * Individual badge data
 */
export interface PetBadge {
  type: BadgeType;
  tier?: BadgeTier; // For progressive badges only
  unlockedAt: string; // ISO timestamp
  progress?: number; // Current progress count for progressive badges
  nextTierThreshold?: number; // Next tier threshold for progress display
}

/**
 * All badges for a pet
 */
export interface PetBadges {
  badges: PetBadge[];
  lastChecked?: string; // ISO timestamp of last badge check
}

/**
 * Badge unlock context for checking eligibility
 */
export interface BadgeCheckContext {
  action:
    | 'daily_login'
    | 'meal_created'
    | 'custom_meal_saved'
    | 'recipe_viewed'
    | 'meal_plan_completed'
    | 'purchase_confirmed'
    | 'search_discovery'
    | 'profile_setup'
    | 'pet_photo_uploaded'
    | 'score_details_viewed'
    | 'meal_plan_updated';
  compatibilityScore?: number;
  mealPlanCount?: number;
  weeklyPlanCompleted?: boolean;
  completionCount?: number;
  purchaseCount?: number;
  customMealCount?: number;
}

