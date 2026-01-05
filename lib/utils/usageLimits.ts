export type PlanTier = 'free' | 'pro';

export type UsageLimits = {
  pets: number;
  savedMeals: number;
  customMeals: number;
  recipeGenMonthly: number;
};

export const PLAN_LIMITS: Record<PlanTier, UsageLimits> = {
  free: {
    pets: 2,
    savedMeals: 20,
    customMeals: 5,
    recipeGenMonthly: 50,
  },
  pro: {
    pets: 500,
    savedMeals: 10000,
    customMeals: 5000,
    recipeGenMonthly: 1500,
  },
} as const;

export function getUsageLimitsForPlan(plan: PlanTier): UsageLimits {
  return PLAN_LIMITS[plan] || PLAN_LIMITS.free;
}
