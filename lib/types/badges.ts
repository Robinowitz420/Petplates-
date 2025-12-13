// lib/types/badges.ts
// Badge type definitions for pet achievement system

/**
 * Badge types - one-time and progressive badges
 */
export enum BadgeType {
  // Category 1: The Quality Match (Single Tier)
  NUTRIENT_NAVIGATOR = 'nutrient_navigator',
  
  // Category 2: Plan Variety & Engagement (Single Tier)
  MASTER_MEAL_PLANNER = 'master_meal_planner',
  
  // Category 3: Planning Volume (Tiered)
  PLANNING_VOLUME = 'planning_volume',
  
  // Category 4: Purchase Commitment (Tiered)
  PURCHASE_COMMITMENT = 'purchase_commitment',
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
  action: 'meal_created' | 'recipe_viewed' | 'meal_plan_created' | 'recipe_saved' | 'recipe_removed' | 'meal_plan_completed' | 'purchase_confirmed';
  compatibilityScore?: number; // For Nutrient Navigator
  mealPlanCount?: number; // Unique meals in plan
  savedRecipesCount?: number; // Number of saved recipes
  weeklyPlanCompleted?: boolean; // Whether weekly plan is completed
  completionCount?: number; // Number of completed meal plans
  purchaseCount?: number; // Number of purchases
}

