/**
 * Scalable Recipe Generation System for Pet Meal-Prep Website
 *
 * Core generation + scoring that is pet-aware, condition-aware, and diversity-aware.
 */

import type { Recipe, Ingredient, RecipeNutritionInfo, Pet } from './types';
import { VETTED_PRODUCTS_RESEARCH, getResearchBackedProduct } from './data/vetted-products-new';
import { scoreRecipeImproved } from './scoreRecipe';
import { HEALTH_BENEFIT_MAP, HEALTH_CONTRAINDICATIONS, normalizeConcernKey } from './data/healthBenefitMap';
import { CONDITION_TEMPLATES, type ConditionTemplate } from './data/conditionTemplates';
import { calculateDiversityPenalty, getRecentIngredients, normalizeIngredientNames } from './utils/diversityTracker';
import { generateMealName } from './utils/mealNameGenerator';
import { getProductByIngredient, getProductPrice, getProductQualityScore, getProductOptions } from './data/product-prices';
import { GoalOrientedGenerator } from './utils/constraintRecipeGenerator';

// ============================================================================
// SCRAPED DATA INTEGRATION (lightweight stubs used by test scripts)
// ============================================================================

export interface ScrapedResearchData {
  ingredients: string[];
  nutritionalInfo: any[];
  healthRecommendations: Array<{
    text: string;
    category: string;
    source: string;
  }>;
  veterinaryInsights: Array<{
    text: string;
    type: string;
    credibility: number;
  }>;
  researchFindings: any[];
  source: string;
  type: string;
  category: string;
  credibility: number;
}

export interface ScrapedInsights {
  commonIngredients: Record<string, number>;
  healthFocusAreas: Record<string, number>;
  ingredientHealthMap: Record<string, string[]>;
}

export function integrateScrapedIngredients(scrapedData: ScrapedResearchData[], category: PetCategory): IngredientTemplate[] {
  const existingIngredients = INGREDIENT_TEMPLATES[category] || [];
  const scrapedIngredients = new Set<string>();
  scrapedData.forEach(data => {
    data.ingredients?.forEach(ing => scrapedIngredients.add(ing.toLowerCase()));
  });

  const newIngredients: IngredientTemplate[] = [];
  scrapedIngredients.forEach(name => {
    const exists = existingIngredients.some(i => i.name.toLowerCase() === name);
    if (!exists) {
      newIngredients.push({
        id: name.replace(/\s+/g, '-'),
        name: name.charAt(0).toUpperCase() + name.slice(1),
        category: 'supplement',
        nutritionalProfile: { protein: 5, fat: 2, fiber: 1, calories: 100 },
        safeFor: [category],
        notes: 'Auto-added from scraped data'
      });
    }
  });
  return [...existingIngredients, ...newIngredients];
}

export function enhanceHealthConcernsWithScrapedData(scrapedData: ScrapedResearchData[]): Record<string, HealthConcern[]> {
  const map: Record<string, HealthConcern[]> = {};
  scrapedData.forEach(data => {
    data.healthRecommendations?.forEach(rec => {
      const text = rec.text.toLowerCase();
      data.ingredients?.forEach(ing => {
        if (text.includes(ing.toLowerCase())) {
          map[ing] = map[ing] || [];
          const c = rec.category as HealthConcern;
          if (!map[ing].includes(c)) map[ing].push(c);
        }
      });
    });
  });
  return map;
}

export function validateRecipeWithScrapedData(
  recipe: GeneratedRecipe,
  scrapedInsights: ScrapedInsights,
  healthInsights: Record<string, HealthConcern[]>,
  category: PetCategory
): { score: number; recommendations: string[] } {
  let score = 5;
  const recs: string[] = [];
  const recipeIngredients = recipe.ingredients.map(i => i.name.toLowerCase());
  const common = Object.keys(scrapedInsights.commonIngredients || {});
  const commonCount = recipeIngredients.filter(ing => common.some(c => ing.includes(c) || c.includes(ing))).length;
  if (commonCount > 0) {
    score += 2;
    recs.push(`Uses ${commonCount} ingredients commonly recommended by veterinarians`);
  }
  const healthMatches = recipe.healthConcerns.filter(c => scrapedInsights.healthFocusAreas?.[c] > 0);
  if (healthMatches.length) {
    score += 2;
    recs.push(`Addresses ${healthMatches.length} research-backed health concerns`);
  }
  recipeIngredients.forEach(ing => {
    const benefits = healthInsights[ing];
    if (benefits?.length) recs.push(`${ing} is associated with: ${benefits.join(', ')}`);
  });
  return { score: Math.min(10, score), recommendations: recs };
}

// ============================================================================
// CORE TYPES
// ============================================================================

export type PetCategory = 'dogs' | 'cats' | 'birds' | 'reptiles' | 'pocket-pets';
export type AgeGroup = 'baby' | 'young' | 'adult' | 'senior';

export type HealthConcern =
  | 'allergy-support'
  | 'joint-health'
  | 'digestive-issues'
  | 'weight-management'
  | 'kidney-disease'
  | 'urinary-health'
  | 'dental-issues'
  | 'heart-disease'
  | 'diabetes'
  | 'respiratory'
  | 'pancreatitis'
  | 'skin-coat'
  | 'senior-support'
  | 'hairball'
  | 'dental-health'
  | 'immune-support';

export type RecipeStyle =
  | 'cooked'
  | 'raw'
  | 'dehydrated'
  | 'freeze-dried'
  | 'kibble-topper'
  | 'treat'
  | 'supplement'
  | 'seed-mix'
  | 'hay-based'
  | 'insect-based';

export interface IngredientTemplate {
  id: string;
  name: string;
  category: 'protein' | 'vegetable' | 'fruit' | 'grain' | 'dairy' | 'supplement' | 'fat' | 'seed' | 'hay' | 'insect';
  nutritionalProfile: {
    protein?: number;
    fat?: number;
    fiber?: number;
    moisture?: number;
    calories?: number;
    calcium?: number;
    phosphorus?: number;
  };
  safeFor: PetCategory[];
  avoidFor?: HealthConcern[];
  asinLink?: string;
  notes?: string;
}

export interface RecipeTemplate {
  id: string;
  name: string;
  category: PetCategory;
  style: RecipeStyle;
  baseIngredients: IngredientTemplate[];
  optionalIngredients: IngredientTemplate[];
  healthBenefits: HealthConcern[];
  ageGroups: AgeGroup[];
  breeds?: string[];
  defaultPrepTime: number;
  defaultCookTime?: number;
  servingSize: { min: number; max: number };
  nutritionalTargets: {
    protein: { min: number; max: number };
    fat: { min: number; max: number };
    fiber: { min: number; max: number };
  };
}

export interface RecipeGenerationOptions {
  template: RecipeTemplate;
  variations?: {
    ingredientSubstitutions?: IngredientTemplate[][];
    portionAdjustments?: number[];
    healthFocus?: HealthConcern[];
  };
  customizations?: {
    name?: string;
    additionalIngredients?: IngredientTemplate[];
    excludedIngredients?: string[];
    prepTimeMultiplier?: number;
  };
  pet?: Pet;
}

export interface GeneratedRecipe extends Omit<Recipe, 'id'> {
  templateId: string;
  generationTimestamp: Date;
  nutritionalCalculation: RecipeNutritionInfo;
  researchValidation?: {
    score: number;
    recommendations: string[];
  };
  ingredientBreakdown: {
    ingredient: Ingredient;
    contribution: {
      protein: number;
      fat: number;
      calories: number;
    };
  }[];
  _unsafeIngredients?: string[];
}

// Minimal curated templates to keep generator functional
export const INGREDIENT_TEMPLATES: Record<PetCategory, IngredientTemplate[]> = {
  dogs: [
    // Proteins (5 options for variety)
    { id: 'ground-chicken', name: 'ground chicken', category: 'protein', nutritionalProfile: { protein: 26, fat: 9 }, safeFor: ['dogs'] },
    { id: 'ground-beef', name: 'ground beef (lean)', category: 'protein', nutritionalProfile: { protein: 26, fat: 15 }, safeFor: ['dogs'] },
    { id: 'ground-turkey', name: 'ground turkey', category: 'protein', nutritionalProfile: { protein: 29, fat: 1 }, safeFor: ['dogs'] },
    { id: 'chicken', name: 'Chicken Breast', category: 'protein', nutritionalProfile: { protein: 31, fat: 3 }, safeFor: ['dogs'] },
    { id: 'salmon', name: 'Salmon', category: 'protein', nutritionalProfile: { protein: 25, fat: 14 }, safeFor: ['dogs'] },
    // Grains (4 options for variety)
    { id: 'brown-rice', name: 'Brown Rice', category: 'grain', nutritionalProfile: { protein: 2.6, fiber: 1.8 }, safeFor: ['dogs'] },
    { id: 'white-rice', name: 'White Rice', category: 'grain', nutritionalProfile: { protein: 2.7, fiber: 0.4 }, safeFor: ['dogs'] },
    { id: 'oats', name: 'Oats', category: 'grain', nutritionalProfile: { protein: 10, fiber: 10 }, safeFor: ['dogs'] },
    { id: 'sweet-potato', name: 'Sweet Potato', category: 'grain', nutritionalProfile: { fiber: 3, calories: 86 }, safeFor: ['dogs'] },
    // Vegetables (5 options for variety)
    { id: 'pumpkin', name: 'Pumpkin', category: 'vegetable', nutritionalProfile: { fiber: 2 }, safeFor: ['dogs'] },
    { id: 'spinach', name: 'Spinach', category: 'vegetable', nutritionalProfile: { protein: 3 }, safeFor: ['dogs'] },
    { id: 'carrots', name: 'Carrots', category: 'vegetable', nutritionalProfile: { fiber: 2.8 }, safeFor: ['dogs'] },
    { id: 'broccoli', name: 'Broccoli', category: 'vegetable', nutritionalProfile: { protein: 3.7, fiber: 2.4 }, safeFor: ['dogs'] },
    { id: 'green-beans', name: 'Green Beans', category: 'vegetable', nutritionalProfile: { fiber: 2.7 }, safeFor: ['dogs'] },
    // Fats (3 options)
    { id: 'fish-oil', name: 'Fish Oil', category: 'fat', nutritionalProfile: { fat: 99 }, safeFor: ['dogs'] },
    { id: 'coconut-oil', name: 'Coconut Oil', category: 'fat', nutritionalProfile: { fat: 99 }, safeFor: ['dogs'] },
    { id: 'olive-oil', name: 'Olive Oil', category: 'fat', nutritionalProfile: { fat: 99 }, safeFor: ['dogs'] },
  ],
  cats: [
    { id: 'chicken', name: 'Chicken Breast', category: 'protein', nutritionalProfile: { protein: 31, fat: 3 }, safeFor: ['cats'] },
    { id: 'salmon', name: 'Salmon', category: 'protein', nutritionalProfile: { protein: 25, fat: 14 }, safeFor: ['cats'] },
    { id: 'pumpkin', name: 'Pumpkin', category: 'vegetable', nutritionalProfile: { fiber: 2 }, safeFor: ['cats'] },
  ],
  birds: [
    { id: 'millet', name: 'Millet', category: 'seed', nutritionalProfile: { protein: 11, fat: 4 }, safeFor: ['birds'] },
    { id: 'sunflower', name: 'Sunflower Seed', category: 'seed', nutritionalProfile: { protein: 21, fat: 49 }, safeFor: ['birds'] },
    { id: 'walnuts', name: 'Walnuts', category: 'supplement', nutritionalProfile: { protein: 15, fat: 65 }, safeFor: ['birds'] }, // For Macaws/Greys
    { id: 'kale', name: 'Kale', category: 'vegetable', nutritionalProfile: { protein: 3 }, safeFor: ['birds'] },
    { id: 'apple', name: 'Apple', category: 'fruit', nutritionalProfile: { fiber: 2.4, calories: 52 }, safeFor: ['birds'] },
  ],
  reptiles: [
    { id: 'cricket', name: 'Crickets', category: 'insect', nutritionalProfile: { protein: 20, fat: 6 }, safeFor: ['reptiles'] },
    { id: 'mealworm', name: 'Mealworms', category: 'insect', nutritionalProfile: { protein: 19, fat: 13 }, safeFor: ['reptiles'] },
    { id: 'mouse', name: 'Frozen Mouse', category: 'protein', nutritionalProfile: { protein: 50, fat: 20 }, safeFor: ['reptiles'] }, // For Snakes
    { id: 'collard', name: 'Collard Greens', category: 'vegetable', nutritionalProfile: { fiber: 4 }, safeFor: ['reptiles'] },
    { id: 'squash', name: 'Butternut Squash', category: 'vegetable', nutritionalProfile: { fiber: 2 }, safeFor: ['reptiles'] },
    { id: 'mango', name: 'Mango', category: 'fruit', nutritionalProfile: { fiber: 1.6, calories: 60 }, safeFor: ['reptiles'] }, // For Geckos
  ],
  'pocket-pets': [
    { id: 'timothy-hay', name: 'Timothy Hay', category: 'hay', nutritionalProfile: { fiber: 30 }, safeFor: ['pocket-pets'] },
    { id: 'pellets', name: 'Fortified Pellets', category: 'grain', nutritionalProfile: { protein: 14 }, safeFor: ['pocket-pets'] },
    { id: 'parsley', name: 'Parsley', category: 'vegetable', nutritionalProfile: { fiber: 3 }, safeFor: ['pocket-pets'] },
    { id: 'apple', name: 'Apple', category: 'fruit', nutritionalProfile: { fiber: 2.4, calories: 52 }, safeFor: ['pocket-pets'] },
    { id: 'mealworm', name: 'Mealworms (Treat)', category: 'insect', nutritionalProfile: { protein: 19, fat: 13 }, safeFor: ['pocket-pets'] }, // For Sugar Gliders/Hamsters
  ],
};

// Simple template set
export const TEMPLATE_LIBRARY: RecipeTemplate[] = [
  {
    id: 'dog-budget',
    name: 'Budget Ground Chicken Mix',
    category: 'dogs',
    style: 'cooked',
    baseIngredients: [
      INGREDIENT_TEMPLATES.dogs[0], // ground chicken (cheap)
      INGREDIENT_TEMPLATES.dogs[7], // white rice (cheap)
      INGREDIENT_TEMPLATES.dogs[9], // spinach (cheap)
    ],
    optionalIngredients: [INGREDIENT_TEMPLATES.dogs[12], INGREDIENT_TEMPLATES.dogs[10]], // coconut oil, carrots
    healthBenefits: ['digestive-issues', 'weight-management'],
    ageGroups: ['adult'],
    defaultPrepTime: 10,
    defaultCookTime: 20,
    servingSize: { min: 180, max: 240 },
    nutritionalTargets: { protein: { min: 20, max: 35 }, fat: { min: 8, max: 18 }, fiber: { min: 2, max: 6 } },
  },
  {
    id: 'dog-balanced',
    name: 'Balanced Ground Beef Mix',
    category: 'dogs',
    style: 'cooked',
    baseIngredients: [
      INGREDIENT_TEMPLATES.dogs[1], // ground beef (cheap)
      INGREDIENT_TEMPLATES.dogs[6], // brown rice
      INGREDIENT_TEMPLATES.dogs[8], // pumpkin
    ],
    optionalIngredients: [INGREDIENT_TEMPLATES.dogs[10], INGREDIENT_TEMPLATES.dogs[12]], // carrots, coconut oil
    healthBenefits: ['digestive-issues', 'weight-management'],
    ageGroups: ['adult'],
    defaultPrepTime: 10,
    defaultCookTime: 20,
    servingSize: { min: 180, max: 240 },
    nutritionalTargets: { protein: { min: 20, max: 35 }, fat: { min: 8, max: 18 }, fiber: { min: 2, max: 6 } },
  },
  {
    id: 'cat-salmon',
    name: 'Omega Salmon Delight',
    category: 'cats',
    style: 'cooked',
    baseIngredients: [INGREDIENT_TEMPLATES.cats[1], INGREDIENT_TEMPLATES.cats[2]],
    optionalIngredients: [INGREDIENT_TEMPLATES.cats[0]],
    healthBenefits: ['skin-coat', 'kidney-disease'],
    ageGroups: ['adult'],
    defaultPrepTime: 8,
    defaultCookTime: 15,
    servingSize: { min: 120, max: 180 },
    nutritionalTargets: { protein: { min: 30, max: 45 }, fat: { min: 10, max: 20 }, fiber: { min: 1, max: 4 } },
  },
  {
    id: 'bird-parrot-mix',
    name: 'Tropical Nut & Veggie Mix',
    category: 'birds',
    style: 'seed-mix',
    baseIngredients: [INGREDIENT_TEMPLATES.birds[1], INGREDIENT_TEMPLATES.birds[2], INGREDIENT_TEMPLATES.birds[3]], // Sunflower, Walnut, Kale
    optionalIngredients: [INGREDIENT_TEMPLATES.birds[4]], // Apple
    healthBenefits: ['skin-coat', 'immune-support'],
    ageGroups: ['adult'],
    defaultPrepTime: 5,
    servingSize: { min: 30, max: 60 },
    nutritionalTargets: { protein: { min: 12, max: 18 }, fat: { min: 15, max: 30 }, fiber: { min: 5, max: 12 } },
  },
  {
    id: 'reptile-carnivore',
    name: 'Whole Prey Feast',
    category: 'reptiles',
    style: 'raw',
    baseIngredients: [INGREDIENT_TEMPLATES.reptiles[2]], // Mouse
    optionalIngredients: [],
    healthBenefits: ['weight-management'],
    ageGroups: ['adult'],
    defaultPrepTime: 2,
    servingSize: { min: 50, max: 150 },
    nutritionalTargets: { protein: { min: 40, max: 60 }, fat: { min: 15, max: 25 }, fiber: { min: 0, max: 2 } },
  },
  {
    id: 'reptile-omnivore',
    name: 'Dragon Salad & Bugs',
    category: 'reptiles',
    style: 'cooked', // Mixed
    baseIngredients: [INGREDIENT_TEMPLATES.reptiles[3], INGREDIENT_TEMPLATES.reptiles[4], INGREDIENT_TEMPLATES.reptiles[0]], // Collard, Squash, Cricket
    optionalIngredients: [INGREDIENT_TEMPLATES.reptiles[5]], // Mango
    healthBenefits: ['digestive-issues'],
    ageGroups: ['adult'],
    defaultPrepTime: 10,
    servingSize: { min: 40, max: 80 },
    nutritionalTargets: { protein: { min: 20, max: 30 }, fat: { min: 4, max: 8 }, fiber: { min: 5, max: 10 } },
  },
  {
    id: 'sugar-glider-fresh',
    name: 'Nectar & Fruit Bowl',
    category: 'pocket-pets',
    style: 'raw',
    baseIngredients: [INGREDIENT_TEMPLATES['pocket-pets'][3], INGREDIENT_TEMPLATES['pocket-pets'][4]], // Apple, Mealworm
    optionalIngredients: [INGREDIENT_TEMPLATES['pocket-pets'][1]], // Pellets
    healthBenefits: ['energy'],
    ageGroups: ['adult'],
    defaultPrepTime: 5,
    servingSize: { min: 20, max: 40 },
    nutritionalTargets: { protein: { min: 15, max: 25 }, fat: { min: 5, max: 10 }, fiber: { min: 2, max: 5 } },
  },
  {
    id: 'pocket-fresh',
    name: 'Greens & Hay Medley',
    category: 'pocket-pets',
    style: 'hay-based',
    baseIngredients: [INGREDIENT_TEMPLATES['pocket-pets'][0], INGREDIENT_TEMPLATES['pocket-pets'][2]],
    optionalIngredients: [INGREDIENT_TEMPLATES['pocket-pets'][1]],
    healthBenefits: ['dental-health', 'digestive-issues'],
    ageGroups: ['adult'],
    defaultPrepTime: 2,
    servingSize: { min: 50, max: 80 },
    nutritionalTargets: { protein: { min: 10, max: 18 }, fat: { min: 2, max: 6 }, fiber: { min: 15, max: 30 } },
  },
];

// ============================================================================
// HELPERS
// ============================================================================

const SYNERGY_MAP: Record<string, string[]> = {
  turmeric: ['black pepper', 'fish oil', 'salmon'],
  'fish oil': ['salmon', 'sardines', 'mackerel'],
  salmon: ['sweet potato', 'pumpkin', 'spinach'],
  'white fish': ['pumpkin', 'sweet potato', 'rice'],
};

function clamp(num: number, min: number, max: number) {
  return Math.min(Math.max(num, min), max);
}

function computeMacroTotals(recipe: GeneratedRecipe) {
  const parseAmount = (amt?: string) => {
    if (!amt) return 0;
    const match = amt.match(/([\d.]+)/);
    return match ? parseFloat(match[1]) : 0;
  };
  const totalWeight = (recipe.ingredients || []).reduce((sum, ing) => sum + parseAmount(ing.amount), 0);
  const protein = recipe.ingredientBreakdown?.reduce((sum, b) => sum + b.contribution.protein, 0) ?? 0;
  const fat = recipe.ingredientBreakdown?.reduce((sum, b) => sum + b.contribution.fat, 0) ?? 0;
  return { totalWeight, protein, fat };
}

function applyNutrientTargets(recipe: GeneratedRecipe, pet?: Pet): number {
  if (!pet) return 0;
  const { protein, fat } = computeMacroTotals(recipe);
  const weight = recipe.ingredients.length ? computeMacroTotals(recipe).totalWeight || 1 : 1;
  const proteinPct = weight ? (protein / weight) * 100 : 0;
  const fatPct = weight ? (fat / weight) * 100 : 0;

  const speciesTargets: Record<string, { protein: [number, number]; fat: [number, number] }> = {
    dog: { protein: [18, 35], fat: [8, 22] },
    cat: { protein: [28, 45], fat: [9, 25] },
    bird: { protein: [12, 22], fat: [4, 12] },
    reptile: { protein: [15, 28], fat: [4, 12] },
    'pocket-pet': { protein: [12, 20], fat: [2, 8] },
  };

  const key = normalizeSpecies(pet.species);
  const t = speciesTargets[key] || speciesTargets.dog;
  let bonus = 0;
  if (proteinPct >= t.protein[0] && proteinPct <= t.protein[1]) bonus += 6;
  else bonus -= 4;
  if (fatPct >= t.fat[0] && fatPct <= t.fat[1]) bonus += 4;
  else bonus -= 3;
  return bonus;
}

function applyConditionTemplateBias(recipe: GeneratedRecipe, pet?: Pet): number {
  if (!pet?.healthConcerns?.length) return 0;
  const template = CONDITION_TEMPLATES.find(t => t.concerns.some(c => pet.healthConcerns?.includes(c)));
  if (!template) return 0;
  const ingNames = recipe.ingredients.map(i => i.name.toLowerCase());
  let delta = 0;
  template.preferredIngredients?.forEach(pref => {
    if (ingNames.includes(pref.toLowerCase())) delta += 3;
  });
  template.avoidedIngredients?.forEach(avoid => {
    if (ingNames.includes(avoid.toLowerCase())) delta -= 5;
  });
  return delta;
}

function applySynergyBonus(recipe: GeneratedRecipe): number {
  const ingNames = recipe.ingredients.map(i => i.name.toLowerCase());
  let bonus = 0;
  Object.entries(SYNERGY_MAP).forEach(([a, partners]) => {
    if (ingNames.includes(a)) {
      partners.forEach(p => {
        if (ingNames.includes(p)) bonus += 2;
      });
    }
  });
  return bonus;
}

/**
 * Apply quality score bonus for using high-quality, research-backed products
 */
function applyQualityBonus(recipe: GeneratedRecipe): number {
  let qualityBonus = 0;
  const avgQualityScore = recipe.ingredients.reduce((sum, ing) => {
    const score = getProductQualityScore(ing.name);
    return sum + score;
  }, 0) / (recipe.ingredients.length || 1);
  
  // Normalize quality score (0-10) to bonus points (0-8)
  // High quality (8+) = +8 bonus, Medium (5-7) = +3 bonus, Low (<5) = 0 bonus
  if (avgQualityScore >= 8) qualityBonus = 8;
  else if (avgQualityScore >= 6) qualityBonus = 4;
  else if (avgQualityScore >= 5) qualityBonus = 2;
  
  return qualityBonus;
}

function normalizeSpecies(species?: string): string {
  const s = (species || '').toLowerCase();
  if (['hamster', 'guinea pig', 'pocket', 'pocket-pet', 'pocket pet'].includes(s)) return 'pocket-pet';
  if (s.includes('cat')) return 'cat';
  if (s.includes('bird')) return 'bird';
  if (s.includes('reptile') || s.includes('dragon') || s.includes('gecko')) return 'reptile';
  return 'dog';
}

function quickPrecheckFails(recipe: GeneratedRecipe, pet?: Pet): string[] {
  if (!pet) return [];
  const allergens = (pet.allergies || []).map(a => a.toLowerCase());
  const ingNames = recipe.ingredients.map(i => i.name.toLowerCase());
  return ingNames.filter(n => allergens.includes(n));
}

export function computeFinalGenerationScore(
  recipe: GeneratedRecipe, 
  pet?: Pet, 
  recentIngredients?: string[]
): { score: number; explain: string[]; estimatedCostPerMeal?: number } {
  const explain: string[] = [];
  
  // Base compatibility score from improved system (0-100)
  // Convert GeneratedRecipe to Recipe format for scoring (add temporary id if missing)
  const recipeForScoring: Recipe = {
    ...recipe,
    id: recipe.templateId || 'generated-recipe',
  } as unknown as Recipe;
  
  const improvedScore = pet 
    ? (scoreRecipeImproved(recipeForScoring, pet).compatibilityScore || scoreRecipeImproved(recipeForScoring, pet).matchScore)
    : 60; // Default if no pet
  
  // Generator-specific modifiers (normalized to small adjustments)
  const synergyBonus = applySynergyBonus(recipe);
  const qualityBonus = applyQualityBonus(recipe);
  const conditionBias = applyConditionTemplateBias(recipe, pet);
  const nutrientAdjustment = applyNutrientTargets(recipe, pet);
  const diversityPenalty = calculateDiversityPenalty(
    normalizeIngredientNames(recipe.ingredients.map(i => i.name.toLowerCase())),
    recentIngredients || []
  );
  
  // NEW: Cost optimization bonus/penalty (matched to commercial pet food pricing)
  const estimatedCost = estimateRecipeCost(recipe.ingredients);
  const MAX_TARGET_COST = 4.00; // Allow up to $4/meal for better ingredient variety and quality
  let costAdjustment = 0;
  
  if (estimatedCost <= MAX_TARGET_COST) {
    // Bonus for being under budget
    const costSavings = MAX_TARGET_COST - estimatedCost;
    costAdjustment = Math.min(10, costSavings * 2); // Up to +10 bonus
    explain.push(`✓ Cost-competitive: $${estimatedCost.toFixed(2)}/meal (target: $${MAX_TARGET_COST})`);
  } else {
    // Penalty for exceeding budget
    const costOverage = estimatedCost - MAX_TARGET_COST;
    costAdjustment = -Math.min(15, costOverage * 1.5); // Up to -15 penalty
    explain.push(`⚠️ Cost premium: $${estimatedCost.toFixed(2)}/meal (target: $${MAX_TARGET_COST})`);
  }
  
  // Normalize legacy modifiers to ±10 range so they don't dominate
  const normalizedSynergy = clamp(synergyBonus * 0.5, 0, 5); // Max +5
  const normalizedQuality = clamp(qualityBonus * 0.5, 0, 5); // Max +5 for quality
  const normalizedCondition = clamp(conditionBias * 0.3, -5, 5); // ±5 max
  const normalizedNutrient = clamp(nutrientAdjustment * 0.5, -5, 5); // ±5 max
  const normalizedDiversity = clamp(diversityPenalty.penalty, 0, 10); // Max -10
  
  // Combine: improved score (base) + small generator adjustments + quality + cost optimization
  let finalScore = improvedScore 
    + normalizedSynergy 
    + normalizedQuality
    + normalizedCondition 
    + normalizedNutrient 
    + costAdjustment
    - normalizedDiversity;
  
  // Safety floor: if improved score is high but we have diversity issues, don't tank completely
  if (improvedScore >= 80 && normalizedDiversity > 0) {
    finalScore = Math.max(finalScore, improvedScore - 8); // Cap diversity penalty
  }
  
  // Explain array for debugging
  if (normalizedSynergy > 0) explain.push(`Synergy bonus: +${normalizedSynergy.toFixed(1)}`);
  if (normalizedCondition !== 0) explain.push(`Condition bias: ${normalizedCondition > 0 ? '+' : ''}${normalizedCondition.toFixed(1)}`);
  if (normalizedNutrient !== 0) explain.push(`Nutrient adjustment: ${normalizedNutrient > 0 ? '+' : ''}${normalizedNutrient.toFixed(1)}`);
  if (normalizedDiversity > 0) explain.push(`Diversity overlap: -${normalizedDiversity.toFixed(1)}`);
  
  return { 
    score: clamp(finalScore, 0, 100), 
    explain,
    estimatedCostPerMeal: estimatedCost
  };
}

// ============================================================================
// GENERATION
// ============================================================================

/**
 * Calculate estimated cost per meal for a recipe
 * Uses product-prices.json data when available
 * Converts amount to grams and calculates proportional cost
 */
function estimateRecipeCost(ingredients: Array<{ name: string; amount: string }>): number {
  let totalCost = 0;
  
  for (const ing of ingredients) {
    const pricePerPound = getProductPrice(ing.name.toLowerCase());
    if (typeof pricePerPound === 'number' && pricePerPound > 0) {
      // Parse amount to grams
      let grams = 0;
      const amountStr = ing.amount.toLowerCase();
      
      // Try to extract numeric value and unit
      const match = amountStr.match(/(\d+(?:\.\d+)?)\s*([a-z]+)?/);
      if (match) {
        const value = parseFloat(match[1]);
        const unit = match[2] || 'g';
        
        // Convert to grams
        if (unit === 'g' || unit === 'gram' || unit === 'grams') grams = value;
        else if (unit === 'kg' || unit === 'kilogram') grams = value * 1000;
        else if (unit === 'lb' || unit === 'lbs' || unit === 'pound') grams = value * 453.592;
        else if (unit === 'oz' || unit === 'ounce') grams = value * 28.3495;
        else grams = value; // Default to grams
      }
      
      // Calculate cost: (grams / grams_per_pound) * price_per_pound
      if (grams > 0) {
        const cost = (grams / 453.592) * pricePerPound;
        totalCost += cost;
      }
    }
  }
  
  return totalCost;
}

/**
 * Pick ingredients with cost optimization
 * Prefers cheaper options when multiple ingredients can serve the same role
 */
function pickIngredients(template: RecipeTemplate, pet?: Pet, excluded: string[] = [], optimizeForCost: boolean = true) {
  const safeList = [...template.baseIngredients, ...template.optionalIngredients].filter(
    ing => ing.safeFor.includes(template.category) && !excluded.includes(ing.id) && !excluded.includes(ing.name)
  );
  const chosen: IngredientTemplate[] = [];
  
  // Always include base ingredients (required for nutrition)
  template.baseIngredients.forEach(ing => {
    if (!excluded.includes(ing.id)) chosen.push(ing);
  });
  
  // Add optional ingredients, preferring cheaper ones if optimizing for cost
  if (safeList.length > chosen.length && optimizeForCost) {
    const optionals = safeList.filter(i => !chosen.includes(i) && template.optionalIngredients.includes(i));
    
    if (optionals.length > 0) {
      // Sort by price (cheapest first)
      const optionalsWithPrice = optionals.map(opt => ({
        ingredient: opt,
        price: getProductPrice(opt.name.toLowerCase()) || 999, // High default for missing prices
      })).sort((a, b) => a.price - b.price);
      
      // Pick the cheapest optional
      if (optionalsWithPrice[0]) {
        chosen.push(optionalsWithPrice[0].ingredient);
      }
    }
  } else if (safeList.length > chosen.length) {
    // Original behavior: just add first available optional
    const optional = safeList.find(i => !chosen.includes(i));
    if (optional) chosen.push(optional);
  }

  return chosen.map(ing => ({
    id: ing.id,
    name: ing.name,
    amount: ing.category === 'protein' ? '120g' : ing.category === 'fat' ? '5g' : '60g',
    amazonLink: getResearchBackedProduct ? getResearchBackedProduct(ing.id)?.amazonLink : undefined,
  }));
}

export function generateRecipe(options: RecipeGenerationOptions): GeneratedRecipe {
  const { template, customizations, pet } = options;
  const excluded = customizations?.excludedIngredients || [];
  const ingredients = pickIngredients(template, pet, excluded);

  const ingredientBreakdown = ingredients.map((ing) => ({
    ingredient: ing as unknown as Ingredient,
    contribution: {
      protein: ing.name.toLowerCase().includes('chicken') || ing.name.toLowerCase().includes('salmon') ? 20 : 2,
      fat: ing.name.toLowerCase().includes('oil') || ing.name.toLowerCase().includes('salmon') ? 8 : 1,
      calories: 50,
    },
  }));

  // Generate recipe name using enhanced naming system
  const ingredientKeys = ingredients.map(ing => ing.name || ing.id);
  const totalCalories = ingredientBreakdown.reduce((s, b) => s + b.contribution.calories, 0);
  const totalProtein = ingredientBreakdown.reduce((s, b) => s + b.contribution.protein, 0);
  const totalFat = ingredientBreakdown.reduce((s, b) => s + b.contribution.fat, 0);
  
  const nutritionalProfile = totalCalories > 0 ? {
    protein: (totalProtein / totalCalories) * 100,
    fat: (totalFat / totalCalories) * 100,
  } : undefined;
  
  const recipeForNaming: Recipe = {
    id: `generated-${template.id}-${Date.now()}`,
    name: template.name,
    category: template.category,
    ingredients: ingredients.map(ing => ({ id: ing.id, name: ing.name, amount: ing.amount })),
    instructions: ['Combine ingredients', 'Cook as needed', 'Cool and serve'],
    healthConcerns: [...template.healthBenefits, ...(pet?.healthConcerns || [])],
    ageGroup: template.ageGroups,
  };
  
  const nameResult = customizations?.name 
    ? { fullName: customizations.name, shortName: customizations.name }
    : generateMealName(ingredientKeys, {
        petName: pet?.name || undefined,
        petBreed: pet?.breed || undefined,
        petSpecies: pet?.type || undefined,
        healthConcerns: recipeForNaming.healthConcerns,
        nutritionalProfile,
        mealType: 'complete',
        recipeId: recipeForNaming.id,
        recipe: recipeForNaming,
        isCustomMeal: false,
      });

  const recipe: GeneratedRecipe = {
    templateId: template.id,
    generationTimestamp: new Date(),
    name: nameResult.fullName,
    description: `${nameResult.fullName} tailored for ${pet?.name || 'your pet'}`,
    category: template.category,
    healthConcerns: [...template.healthBenefits, ...(pet?.healthConcerns || [])],
    ageGroup: template.ageGroups,
    ingredients,
    instructions: ['Combine ingredients', 'Cook as needed', 'Cool and serve'],
    prepTime: `${template.defaultPrepTime} min`,
    cookTime: template.defaultCookTime ? `${template.defaultCookTime} min` : 'No cook',
    servings: 1,
    tags: template.healthBenefits,
    imageUrl: `/images/generated/${template.category}-${template.id}.png`,
    nutritionalCalculation: {
      calories: totalCalories,
      protein: totalProtein,
      fat: totalFat,
      carbs: 0,
      fiber: 0,
      moisture: 0,
    },
    ingredientBreakdown,
  };

  const recent = pet?.id ? getRecentIngredients(pet.id, 7) : [];
  const { score } = computeFinalGenerationScore(recipe, pet, recent);
  recipe.score = score;
  recipe._unsafeIngredients = quickPrecheckFails(recipe, pet);

  return recipe;
}

/**
 * Generate a recipe dynamically based on pet profile
 * Ignores templates - builds recipe from scratch based on pet needs
 */
export function generateBestRecipeForPet(templates: RecipeTemplate[] = TEMPLATE_LIBRARY, pet?: Pet, seed?: number) {
  if (!pet) {
    // Fallback to template-based if no pet provided
    const template = templates[seed ? seed % templates.length : 0];
    return generateRecipe({ template, pet });
  }

  // Build recipe from scratch based on pet profile
  const recipe = generateDynamicRecipe(pet, seed);
  const recent = pet.id ? getRecentIngredients(pet.id, 7) : [];
  const { score } = computeFinalGenerationScore(recipe, pet, recent);
  recipe.score = score;
  return recipe;
}

/**
 * Generate a recipe dynamically based on pet's specific needs
 * Uses constraint-based generation with AAFCO standards and quality scoring
 */
function generateDynamicRecipe(pet: Pet, seed?: number): GeneratedRecipe {
  try {
    const petType = pet.type || 'dogs';
    const lifeStage = 'adult';
    const healthConcerns = pet.healthConcerns || [];
    const targetCalories = 500;
    const budgetPerMeal = 4.00;
    
    console.log(`Generating recipe for ${pet.name} (${petType}), budget=$${budgetPerMeal}`);
    
    const generator = new GoalOrientedGenerator(
      petType,
      lifeStage,
      healthConcerns,
      targetCalories,
      budgetPerMeal
    );
    
    const result = generator.generate();
    
    if (!result) {
      console.warn(`Constraint generator failed for ${pet.name}, using fallback`);
      return createFallbackRecipe(pet, seed);
    }
    
    const ingredients: Ingredient[] = result.ingredients.map(ing => ({
      id: ing.name.replace(/\s+/g, '-').toLowerCase(),
      name: ing.name,
      amount: `${ing.amount}g`,
    }));
    
    const recipe: GeneratedRecipe = {
      templateId: 'constraint-generated',
      generationTimestamp: new Date(),
      name: `${pet.name}'s Balanced Meal`,
      description: result.description,
      category: petType as PetCategory,
      healthConcerns: healthConcerns,
      ageGroup: ['adult'],
      ingredients,
      instructions: result.instructions,
      prepTime: '10 min',
      cookTime: '15 min',
      servings: 1,
      tags: healthConcerns,
      imageUrl: `/images/generated/${petType}-meal.png`,
      nutritionalCalculation: {
        calories: result.nutritionalInfo.totalCalories,
        protein: result.nutritionalInfo.protein,
        fat: result.nutritionalInfo.fat,
        carbs: result.nutritionalInfo.carbs,
        fiber: result.nutritionalInfo.fiber,
        moisture: 0,
      },
      ingredientBreakdown: ingredients.map(ing => ({
        ingredient: ing,
        contribution: {
          protein: 0,
          fat: 0,
          calories: 0,
        },
      })),
    };
    
    const recent = pet.id ? getRecentIngredients(pet.id, 7) : [];
    const { score } = computeFinalGenerationScore(recipe, pet, recent);
    recipe.score = score;
    recipe._unsafeIngredients = quickPrecheckFails(recipe, pet);
    
    console.log(`Generated recipe: ${recipe.name} with score ${score.toFixed(1)}`);
    
    return recipe;
  } catch (error) {
    console.error(`Error generating dynamic recipe for ${pet.name}:`, error);
    return createFallbackRecipe(pet, seed);
  }
}

/**
 * Infer ingredient category from ID and composition data
 */
function inferCategory(id: string, composition?: any): string {
  const lower = id.toLowerCase();
  
  // Check composition data first for more accurate categorization
  if (composition) {
    // High protein = protein source
    if (composition.protein && composition.protein > 15) return 'protein';
    // High fat, low protein = fat/oil
    if (composition.fat && composition.fat > 50) return 'fat';
    // Fiber-rich = vegetable/hay
    if (composition.fiber && composition.fiber > 5) return composition.fiber > 15 ? 'hay' : 'vegetable';
  }
  
  // Fallback to ID-based categorization
  if (lower.includes('protein') || lower.includes('meat') || lower.includes('fish') || lower.includes('chicken') || lower.includes('beef') || lower.includes('turkey') || lower.includes('lamb') || lower.includes('mouse') || lower.includes('rat') || lower.includes('chick') || lower.includes('liver') || lower.includes('heart') || lower.includes('kidney')) return 'protein';
  if (lower.includes('rice') || lower.includes('grain') || lower.includes('oat') || lower.includes('barley') || lower.includes('millet') || lower.includes('quinoa') || lower.includes('pasta') || lower.includes('bread')) return 'grain';
  if (lower.includes('vegetable') || lower.includes('carrot') || lower.includes('spinach') || lower.includes('broccoli') || lower.includes('pumpkin') || lower.includes('sweet_potato') || lower.includes('squash') || lower.includes('greens') || lower.includes('lettuce') || lower.includes('kale') || lower.includes('celery') || lower.includes('zucchini')) return 'vegetable';
  if (lower.includes('fruit') || lower.includes('apple') || lower.includes('berry') || lower.includes('banana') || lower.includes('papaya') || lower.includes('mango') || lower.includes('blueberry')) return 'fruit';
  if (lower.includes('oil') || lower.includes('fat') || lower.includes('coconut') || lower.includes('salmon_oil') || lower.includes('fish_oil')) return 'fat';
  if (lower.includes('seed') || lower.includes('nut') || lower.includes('flax') || lower.includes('hemp') || lower.includes('chia') || lower.includes('sunflower')) return 'seed';
  if (lower.includes('hay') || lower.includes('timothy') || lower.includes('alfalfa')) return 'hay';
  if (lower.includes('insect') || lower.includes('cricket') || lower.includes('mealworm') || lower.includes('roach') || lower.includes('dubia')) return 'insect';
  return 'other';
}

/**
 * Build a nutritionally sound recipe using comprehensive ingredient data
 * REFACTORED: Constraint-first approach (health + cost drive selection, not scoring)
 */
function buildNutritionallySoundRecipe(ingredients: any[], pet: Pet, seed: number): GeneratedRecipe {
  const petType = pet.type as string;
  const isCarnivore = petType === 'cats' || petType === 'birds' || petType === 'reptiles';
  
  // STEP 1: CONSTRAINT FILTER - Remove ingredients that violate hard rules
  let constrainedIngredients = ingredients;
  
  // Filter out health contraindications (hard exclusions, not soft penalties)
  if (pet.healthConcerns && pet.healthConcerns.length > 0) {
    constrainedIngredients = constrainedIngredients.filter(ing => {
      // Exclude ingredients that are contraindicated for this health concern
      // (This would use HEALTH_CONTRAINDICATIONS if available)
      return true; // Placeholder - would check contraindications
    });
  }
  
  console.log(`After constraint filter: ${constrainedIngredients.length} ingredients remain`);
  
  // STEP 2: CATEGORIZE INTO FUNCTIONAL POOLS (not just ingredient type)
  const pools = {
    primaryProtein: constrainedIngredients.filter(i => 
      i.category === 'protein' && (i.composition.protein || 0) > 20
    ),
    secondaryProtein: constrainedIngredients.filter(i => 
      i.category === 'protein' && (i.composition.protein || 0) > 10 && (i.composition.protein || 0) <= 20
    ),
    carb: constrainedIngredients.filter(i => i.category === 'grain'),
    fiberVeg: constrainedIngredients.filter(i => i.category === 'vegetable'),
    fat: constrainedIngredients.filter(i => i.category === 'fat'),
    fruit: constrainedIngredients.filter(i => i.category === 'fruit'),
    seed: constrainedIngredients.filter(i => i.category === 'seed'),
    insect: constrainedIngredients.filter(i => i.category === 'insect'),
    hay: constrainedIngredients.filter(i => i.category === 'hay'),
  };
  
  // STEP 3: INGREDIENT OPTIMIZER - Score each ingredient by fitness (not final score)
  const ingredientFitness = (ing: any): number => {
    let fitness = 0;
    
    // Species safety (0-1)
    const speciesSafety = ing.composition.speciesCompatibility?.[petType === 'pocket-pets' ? 'pocket-pet' : petType];
    if (speciesSafety === 'ok') fitness += 1.0;
    else if (speciesSafety === 'limit') fitness += 0.5;
    else if (speciesSafety === 'caution') fitness += 0.2;
    
    // Health alignment (0-2)
    if (pet.healthConcerns && pet.healthConcerns.length > 0) {
      // Bonus for ingredients that support health concerns
      if (ing.composition.protein && pet.healthConcerns.includes('muscle-loss')) fitness += 0.5;
      if (ing.composition.omega3 && pet.healthConcerns.includes('joint-health')) fitness += 0.5;
      if (ing.composition.fiber && pet.healthConcerns.includes('digestion')) fitness += 0.5;
    }
    
    // Cost penalty (0-2, lower is better)
    const price = getProductPrice(ing.name);
    if (price !== null) {
      if (price < 2) fitness += 1.5;
      else if (price < 5) fitness += 1.0;
      else if (price < 10) fitness += 0.5;
      else fitness -= 1.0;
    }
    
    // Overuse penalty (0-1)
    const recentIngredients = getRecentIngredients(ing.id) || [];
    if (Array.isArray(recentIngredients) && recentIngredients.length > 3) fitness -= 0.5;
    
    return fitness;
  };
  
  // STEP 4: SELECT TOP INGREDIENTS FROM EACH POOL
  const selectTopFromPool = (pool: any[], count: number = 1): any[] => {
    return pool
      .map(ing => ({ ing, fitness: ingredientFitness(ing) }))
      .sort((a, b) => b.fitness - a.fitness)
      .slice(0, count)
      .map(x => x.ing);
  };
  
  const selected: any[] = [];
  
  // MANDATORY: Primary protein for carnivores/omnivores only
  // Herbivores (rabbits, guinea pigs, some reptiles) should NOT get meat
  const isHerbivore = petType === 'pocket-pets' && (pet.breed?.toLowerCase().includes('rabbit') || pet.breed?.toLowerCase().includes('guinea'));
  const isOmnivore = !isCarnivore && !isHerbivore;
  
  if (isCarnivore || isOmnivore) {
    const selectedProtein = selectTopFromPool(pools.primaryProtein, 1);
    if (selectedProtein.length > 0) {
      selected.push(selectedProtein[0]);
    } else if (pools.secondaryProtein.length > 0) {
      const secondary = selectTopFromPool(pools.secondaryProtein, 1);
      if (secondary.length > 0) selected.push(secondary[0]);
    } else if (isCarnivore) {
      console.warn(`No suitable protein found for carnivorous pet ${pet.name}`);
    }
    
    // OPTIONAL: Secondary protein (variety)
    if (seed % 2 === 0 && pools.secondaryProtein.length > 0) {
      const secondary = selectTopFromPool(pools.secondaryProtein, 1);
      if (secondary.length > 0 && secondary[0].id !== selected[0]?.id) {
        selected.push(secondary[0]);
      }
    }
  }
  
  // CARB: Choose based on health concerns
  if (pools.carb.length > 0) {
    const carbs = selectTopFromPool(pools.carb, 1);
    if (carbs.length > 0) selected.push(carbs[0]);
  }
  
  // FIBER/VEG: Always include for herbivores, optional for carnivores
  if (pools.fiberVeg.length > 0) {
    const isHerbivore = petType === 'pocket-pets' || petType === 'reptiles';
    if (isHerbivore || seed % 2 === 0) {
      const veg = selectTopFromPool(pools.fiberVeg, 1);
      if (veg.length > 0) selected.push(veg[0]);
    }
  }
  
  // FAT: Include for omega-3 and energy
  if (pools.fat.length > 0 && seed % 3 !== 0) {
    const fat = selectTopFromPool(pools.fat, 1);
    if (fat.length > 0) selected.push(fat[0]);
  }
  
  // FRUIT: Optional, low priority
  if (pools.fruit.length > 0 && seed % 4 === 0) {
    const fruit = selectTopFromPool(pools.fruit, 1);
    if (fruit.length > 0) selected.push(fruit[0]);
  }
  
  // Calculate portions to meet nutritional targets
  const weightKg = pet.weightKg || parseFloat(pet.weight || '10');
  const portionedIngredients = selected.map((ing) => {
    let amount = 100; // grams
    
    if (ing.category === 'protein') {
      amount = Math.round(weightKg * 8);
    } else if (ing.category === 'grain') {
      amount = Math.round(weightKg * 6);
    } else if (ing.category === 'vegetable') {
      amount = Math.round(weightKg * 3);
    } else if (ing.category === 'fruit') {
      amount = Math.round(weightKg * 2);
    } else if (ing.category === 'fat') {
      amount = Math.round(weightKg * 0.5);
    } else if (ing.category === 'seed') {
      amount = Math.round(weightKg * 1);
    } else if (ing.category === 'insect') {
      amount = Math.round(weightKg * 4);
    } else if (ing.category === 'hay') {
      amount = Math.round(weightKg * 5);
    }
    
    return { ingredient: ing, amount };
  });
  
  // Build recipe
  const recipeIngredients = portionedIngredients.map(p => ({
    id: p.ingredient.id,
    name: p.ingredient.name,
    amount: `${p.amount}g`,
  }));
  
  const ingredientNames = recipeIngredients.map(i => i.name).join(' & ');
  const recipeName = `${pet.name || 'Pet'}'s ${ingredientNames}`;
  
  // Calculate nutrition from composition data
  let totalProtein = 0;
  let totalFat = 0;
  let totalCalories = 0;
  let totalFiber = 0;
  
  for (const p of portionedIngredients) {
    const comp = p.ingredient.composition;
    const grams = p.amount;
    
    totalProtein += ((comp.protein || 0) * grams) / 100;
    totalFat += ((comp.fat || 0) * grams) / 100;
    totalCalories += ((comp.kcal || 50) * grams) / 100;
    totalFiber += ((comp.fiber || 0) * grams) / 100;
  }
  
  const ingredientBreakdown = portionedIngredients.map(p => ({
    ingredient: p.ingredient as unknown as Ingredient,
    contribution: {
      protein: ((p.ingredient.composition.protein || 0) * p.amount) / 100,
      fat: ((p.ingredient.composition.fat || 0) * p.amount) / 100,
      calories: ((p.ingredient.composition.kcal || 50) * p.amount) / 100,
    },
  }));
  
  return {
    templateId: 'dynamic',
    generationTimestamp: new Date(),
    name: recipeName,
    description: `Nutritionally balanced recipe for ${pet.name} using ${recipeIngredients.length} ingredients`,
    category: pet.type as PetCategory,
    healthConcerns: pet.healthConcerns || [],
    ageGroup: [pet.age || 'adult'],
    ingredients: recipeIngredients,
    instructions: [
      'Combine all ingredients',
      'Cook protein thoroughly if needed',
      'Mix with other ingredients',
      'Cool to room temperature before serving',
    ],
    prepTime: '10 min',
    cookTime: '20 min',
    servings: 1,
    tags: pet.healthConcerns || [],
    imageUrl: `/images/generated/${pet.type}-custom.png`,
    nutritionalCalculation: {
      calories: totalCalories,
      protein: totalProtein,
      fat: totalFat,
      fiber: totalFiber,
    },
    ingredientBreakdown,
  } as any;
}

/**
 * Infer ingredient category from ID or composition
 */
function getIngredientCategory(id: string, comp: any): string {
  if (comp.category) return comp.category;
  if (id.includes('protein') || id.includes('meat') || id.includes('fish') || id.includes('chicken') || id.includes('beef')) return 'protein';
  if (id.includes('rice') || id.includes('grain') || id.includes('oat') || id.includes('barley')) return 'grain';
  if (id.includes('vegetable') || id.includes('carrot') || id.includes('spinach') || id.includes('broccoli')) return 'vegetable';
  if (id.includes('fruit') || id.includes('apple') || id.includes('berry')) return 'fruit';
  if (id.includes('oil') || id.includes('fat')) return 'fat';
  return 'other';
}

/**
 * Prioritize ingredients based on health concerns
 */
function prioritizeIngredientsForHealth(ingredients: any[], pet: Pet): any[] {
  const concerns = pet.healthConcerns || [];
  if (concerns.length === 0) return ingredients;
  
  // Score each ingredient based on health benefits
  return ingredients.sort((a, b) => {
    const aScore = scoreIngredientForHealth(a, concerns);
    const bScore = scoreIngredientForHealth(b, concerns);
    return bScore - aScore;
  });
}

/**
 * Score ingredient for health benefits
 */
function scoreIngredientForHealth(ingredient: any, concerns: string[]): number {
  let score = 0;
  const comp = ingredient.composition;
  
  for (const concern of concerns) {
    if (concern.includes('digestive') && (comp.fiber || 0) > 2) score += 2;
    if (concern.includes('joint') && (comp.omega3 || 0) > 0.5) score += 2;
    if (concern.includes('weight') && (comp.protein || 0) > 20) score += 2;
    if (concern.includes('skin') && (comp.omega3 || 0) > 0.5) score += 2;
    if (concern.includes('allergy') && ingredient.category === 'protein') score += 1;
  }
  
  return score;
}

/**
 * Select diverse ingredients from the full pool
 */
function selectDiverseIngredientsFromPool(ingredients: any[], seed?: number): any[] {
  const categories = {
    protein: ingredients.filter(i => i.category === 'protein'),
    grain: ingredients.filter(i => i.category === 'grain'),
    vegetable: ingredients.filter(i => i.category === 'vegetable'),
    fruit: ingredients.filter(i => i.category === 'fruit'),
    fat: ingredients.filter(i => i.category === 'fat'),
  };
  
  const selected: any[] = [];
  const s = seed || 0;
  
  // Pick one from each category, cycling through all available
  if (categories.protein.length > 0) {
    selected.push(categories.protein[s % categories.protein.length]);
  }
  if (categories.grain.length > 0) {
    selected.push(categories.grain[(s + 1) % categories.grain.length]);
  }
  if (categories.vegetable.length > 0) {
    selected.push(categories.vegetable[(s + 2) % categories.vegetable.length]);
  }
  if (categories.fruit.length > 0 && s % 3 !== 0) {
    selected.push(categories.fruit[(s + 3) % categories.fruit.length]);
  }
  if (categories.fat.length > 0 && s % 2 === 0) {
    selected.push(categories.fat[(s + 4) % categories.fat.length]);
  }
  
  return selected;
}

/**
 * Calculate portions based on composition data
 */
function calculatePortionsFromComposition(ingredients: any[], pet: Pet): any[] {
  const weightKg = pet.weightKg || parseFloat(pet.weight || '10');
  
  return ingredients.map(ing => {
    let amount = '100g';
    const comp = ing.composition;
    
    if (ing.category === 'protein') {
      amount = `${Math.round(weightKg * 8)}g`;
    } else if (ing.category === 'grain') {
      amount = `${Math.round(weightKg * 6)}g`;
    } else if (ing.category === 'vegetable') {
      amount = `${Math.round(weightKg * 3)}g`;
    } else if (ing.category === 'fruit') {
      amount = `${Math.round(weightKg * 2)}g`;
    } else if (ing.category === 'fat') {
      amount = `${Math.round(weightKg * 0.5)}g`;
    }
    
    return { ingredient: ing, amount };
  });
}

/**
 * Build recipe from composition data
 */
function buildRecipeFromCompositions(portionedIngredients: any[], pet: Pet, seed?: number): GeneratedRecipe {
  const ingredients = portionedIngredients.map(p => ({
    id: p.ingredient.id,
    name: p.ingredient.name,
    amount: p.amount,
  }));
  
  const ingredientBreakdown = portionedIngredients.map(p => {
    const comp = p.ingredient.composition;
    const grams = parseFloat(p.amount);
    return {
      ingredient: p.ingredient as unknown as Ingredient,
      contribution: {
        protein: ((comp.protein || 0) * grams) / 100,
        fat: ((comp.fat || 0) * grams) / 100,
        calories: ((comp.kcal || 50) * grams) / 100,
      },
    };
  });
  
  const totalProtein = ingredientBreakdown.reduce((s, b) => s + b.contribution.protein, 0);
  const totalFat = ingredientBreakdown.reduce((s, b) => s + b.contribution.fat, 0);
  const totalCalories = ingredientBreakdown.reduce((s, b) => s + b.contribution.calories, 0);
  
  const ingredientNames = ingredients.map(i => i.name).join(' & ');
  const recipeName = `${pet.name || 'Pet'}'s ${ingredientNames}`;
  
  return {
    templateId: 'dynamic',
    generationTimestamp: new Date(),
    id: `generated-${Date.now()}-${seed || Math.random()}`,
    name: recipeName,
    description: `Customized recipe for ${pet.name} using real ingredient data`,
    category: pet.type as PetCategory,
    healthConcerns: pet.healthConcerns || [],
    ageGroup: [pet.age || 'adult'],
    ingredients,
    instructions: [
      'Combine all ingredients',
      'Cook protein thoroughly if needed',
      'Mix with other ingredients',
      'Cool to room temperature before serving',
    ],
    prepTime: '10 min',
    cookTime: '20 min',
    servings: 1,
    tags: pet.healthConcerns || [],
    imageUrl: `/images/generated/${pet.type}-custom.png`,
    nutritionalCalculation: {
      calories: totalCalories,
      protein: totalProtein,
      fat: totalFat,
      fiber: ingredientBreakdown.reduce((s, b) => s + ((b.ingredient.composition?.fiber || 0) * parseFloat(ingredients[ingredientBreakdown.indexOf(b)].amount)) / 100, 0),
    },
    ingredientBreakdown,
  };
}

/**
 * Create a fallback recipe when dynamic generation fails
 */
function createFallbackRecipe(pet: Pet, seed?: number): GeneratedRecipe {
  const petType = pet.type as PetCategory;
  const allIngredients = INGREDIENT_TEMPLATES[petType] || [];
  
  // Pick first 3 ingredients as fallback
  const ingredients = allIngredients.slice(0, 3);
  
  if (ingredients.length === 0) {
    // Ultimate fallback - create a minimal recipe
    return {
      templateId: 'fallback',
      generationTimestamp: new Date(),
      id: `fallback-${Date.now()}-${seed || 0}`,
      name: `${pet.name || 'Pet'}'s Basic Meal`,
      description: 'Basic meal recipe',
      category: petType,
      healthConcerns: [],
      ageGroup: ['adult'],
      ingredients: [
        { id: 'protein', name: 'Protein', amount: '100g' },
        { id: 'carbs', name: 'Carbohydrates', amount: '100g' },
        { id: 'veggies', name: 'Vegetables', amount: '50g' },
      ],
      instructions: ['Mix ingredients', 'Cook if needed', 'Serve'],
      prepTime: '10 min',
      cookTime: '20 min',
      servings: 1,
      tags: [],
      imageUrl: `/images/generated/${petType}-basic.png`,
      nutritionalCalculation: {
        calories: 300,
        protein: 30,
        fat: 10,
        fiber: 3,
      },
      ingredientBreakdown: [],
    };
  }
  
  const portionedIngredients = calculatePortions(ingredients, pet);
  return buildRecipeFromIngredients(portionedIngredients, pet, seed);
}

/**
 * Get all safe ingredients for a pet (exclude allergies)
 */
function getSafeIngredientsForPet(pet: Pet): IngredientTemplate[] {
  const allergies = (pet.allergies || []).map(a => a.toLowerCase());
  const petType = pet.type as PetCategory;
  const templates = INGREDIENT_TEMPLATES[petType] || [];
  
  return templates.filter((ing: any) => {
    const ingName = ing.name.toLowerCase();
    const ingId = ing.id.toLowerCase();
    return !allergies.some(allergy => 
      ingName.includes(allergy) || ingId.includes(allergy)
    );
  });
}

/**
 * Prioritize ingredients based on health concerns
 */
function prioritizeForHealthConcerns(ingredients: IngredientTemplate[], pet: Pet): IngredientTemplate[] {
  const concerns = pet.healthConcerns || [];
  if (concerns.length === 0) return ingredients;
  
  // Map health concerns to beneficial ingredients
  const healthBenefits: Record<string, string[]> = {
    'digestive-issues': ['pumpkin', 'sweet potato', 'brown rice', 'chicken'],
    'joint-health': ['salmon', 'fish oil', 'sweet potato'],
    'weight-management': ['chicken', 'turkey', 'lean beef', 'spinach', 'carrots'],
    'skin-coat': ['salmon', 'fish oil', 'sweet potato'],
    'allergy-support': ['chicken', 'turkey', 'sweet potato', 'pumpkin'],
    'kidney-disease': ['chicken', 'white fish', 'white rice'],
  };
  
  // Sort ingredients: beneficial ones first
  return ingredients.sort((a, b) => {
    const aIsBeneficial = concerns.some(c => 
      healthBenefits[c]?.some(benefit => a.name.toLowerCase().includes(benefit))
    );
    const bIsBeneficial = concerns.some(c => 
      healthBenefits[c]?.some(benefit => b.name.toLowerCase().includes(benefit))
    );
    return aIsBeneficial === bIsBeneficial ? 0 : aIsBeneficial ? -1 : 1;
  });
}

/**
 * Select diverse ingredients (protein, carbs, veggies, fats)
 * Uses seed to create deterministic but varied selections
 * Ensures all ingredients are used across 50 recipes
 */
function selectDiverseIngredients(ingredients: IngredientTemplate[], pet: Pet, seed: number): IngredientTemplate[] {
  const categories = {
    protein: ingredients.filter(i => i.category === 'protein'),
    carbs: ingredients.filter(i => i.category === 'grain'),
    veggies: ingredients.filter(i => i.category === 'vegetable'),
    fats: ingredients.filter(i => i.category === 'fat'),
  };
  
  const selected: IngredientTemplate[] = [];
  
  // Use seed to cycle through ALL ingredients deterministically
  // With 50 seeds, we'll use each ingredient multiple times in different combinations
  
  // Pick a protein - cycle through all proteins
  if (categories.protein.length > 0) {
    const idx = seed % categories.protein.length;
    selected.push(categories.protein[idx]);
  }
  
  // Pick a carb - offset seed so it doesn't match protein selection
  if (categories.carbs.length > 0) {
    const idx = (seed + Math.floor(seed / categories.protein.length)) % categories.carbs.length;
    selected.push(categories.carbs[idx]);
  }
  
  // Pick a veggie - different offset
  if (categories.veggies.length > 0) {
    const idx = (seed + Math.floor(seed / (categories.protein.length * categories.carbs.length))) % categories.veggies.length;
    selected.push(categories.veggies[idx]);
  }
  
  // Pick a fat - different offset, optional
  if (categories.fats.length > 0) {
    const idx = (seed * 2) % categories.fats.length;
    // Include fat ~60% of the time
    if (seed % 5 !== 0) {
      selected.push(categories.fats[idx]);
    }
  }
  
  return selected;
}

/**
 * Calculate portions based on pet weight and ingredient type
 */
function calculatePortions(ingredients: IngredientTemplate[], pet: Pet): Array<{ ingredient: IngredientTemplate; amount: string }> {
  const weightKg = pet.weightKg || parseFloat(pet.weight || '10');
  const dailyCalories = weightKg < 5 ? 200 : weightKg < 15 ? 400 : weightKg < 30 ? 800 : 1200;
  
  return ingredients.map(ing => {
    let amount = '100g'; // default
    
    if (ing.category === 'protein') {
      // ~40% of calories from protein
      amount = `${Math.round(weightKg * 8)}g`;
    } else if (ing.category === 'grain') {
      // ~40% of calories from carbs
      amount = `${Math.round(weightKg * 6)}g`;
    } else if (ing.category === 'vegetable') {
      // ~15% of calories from veggies
      amount = `${Math.round(weightKg * 3)}g`;
    } else if (ing.category === 'fat') {
      // ~5% of calories from fats
      amount = `${Math.round(weightKg * 0.5)}g`;
    }
    
    return { ingredient: ing, amount };
  });
}

/**
 * Build a complete recipe from selected ingredients
 */
function buildRecipeFromIngredients(
  portionedIngredients: Array<{ ingredient: IngredientTemplate; amount: string }>,
  pet: Pet,
  seed?: number
): GeneratedRecipe {
  const ingredients = portionedIngredients.map(p => ({
    id: p.ingredient.id,
    name: p.ingredient.name,
    amount: p.amount,
  }));
  
  const ingredientBreakdown = portionedIngredients.map(p => ({
    ingredient: p.ingredient as unknown as Ingredient,
    contribution: {
      protein: (p.ingredient.nutritionalProfile.protein || 0) * (parseFloat(p.amount) / 100),
      fat: (p.ingredient.nutritionalProfile.fat || 0) * (parseFloat(p.amount) / 100),
      calories: (p.ingredient.nutritionalProfile.calories || 50) * (parseFloat(p.amount) / 100),
    },
  }));
  
  const totalProtein = ingredientBreakdown.reduce((s, b) => s + b.contribution.protein, 0);
  const totalFat = ingredientBreakdown.reduce((s, b) => s + b.contribution.fat, 0);
  const totalCalories = ingredientBreakdown.reduce((s, b) => s + b.contribution.calories, 0);
  
  const ingredientNames = ingredients.map(i => i.name).join(' & ');
  const recipeName = `${pet.name || 'Pet'}'s Custom ${ingredientNames}`;
  
  return {
    templateId: 'dynamic',
    generationTimestamp: new Date(),
    id: `generated-${Date.now()}-${seed || Math.random()}`,
    name: recipeName,
    description: `Customized recipe for ${pet.name} based on their allergies, health concerns, and weight`,
    category: pet.type,
    healthConcerns: pet.healthConcerns || [],
    ageGroup: [pet.age || 'adult'],
    ingredients,
    instructions: [
      'Combine all ingredients',
      'Cook protein thoroughly',
      'Mix with vegetables and grains',
      'Cool to room temperature before serving',
      `Serve ${Math.round(totalCalories / 100)}g portions daily`,
    ],
    prepTime: '10 min',
    cookTime: '20 min',
    servings: 1,
    tags: pet.healthConcerns || [],
    imageUrl: `/images/generated/${pet.type}-custom.png`,
    nutritionalCalculation: {
      calories: totalCalories,
      protein: totalProtein,
      fat: totalFat,
      fiber: ingredientBreakdown.reduce((s, b) => s + ((b.ingredient as any).nutritionalProfile.fiber || 0), 0),
    },
    ingredientBreakdown,
  };
}

export function getRecipeTemplates(category?: PetCategory, style?: RecipeStyle): RecipeTemplate[] {
  return TEMPLATE_LIBRARY.filter(t => (!category || t.category === category) && (!style || t.style === style));
}

export async function loadAndIntegrateScrapedData() {
  // Stubbed: in real use we would fetch and merge scraped veterinary data.
  const insights: ScrapedInsights = { commonIngredients: {}, healthFocusAreas: {}, ingredientHealthMap: {} };
  const enhancedIngredients = TEMPLATE_LIBRARY.flatMap(t => t.baseIngredients);
  const healthInsights = enhanceHealthConcernsWithScrapedData([]);
  return { enhancedIngredients, healthInsights, insights };
}