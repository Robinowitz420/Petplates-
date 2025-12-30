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
  SEARCH_DISCOVERY = 'search_discovery',
  DAILY_LOGIN = 'daily_login',
  PROFILE_SETUP = 'profile_setup',
  PREPARATION = 'preparation',
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
    | 'meal_created'
    | 'recipe_viewed'
    | 'meal_plan_completed'
    | 'purchase_confirmed'
    | 'search_discovery'
    | 'daily_login'
    | 'profile_setup';
  compatibilityScore?: number;
  mealPlanCount?: number;
  weeklyPlanCompleted?: boolean;
  completionCount?: number;
  purchaseCount?: number;
}

