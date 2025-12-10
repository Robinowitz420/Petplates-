/**
 * Scalable Recipe Generation System for Pet Meal-Prep Website
 *
 * Core generation + scoring that is pet-aware, condition-aware, and diversity-aware.
 */

import type { Recipe, Ingredient, RecipeNutritionInfo, Pet } from './types';
import { VETTED_PRODUCTS_RESEARCH, getResearchBackedProduct } from './data/vetted-products-new.js';
import { scoreRecipeImproved } from './scoreRecipe';
import { HEALTH_BENEFIT_MAP, HEALTH_CONTRAINDICATIONS, normalizeConcernKey } from './data/healthBenefitMap';
import { CONDITION_TEMPLATES, type ConditionTemplate } from './data/conditionTemplates';
import { calculateDiversityPenalty, getRecentIngredients, normalizeIngredientNames } from './utils/diversityTracker';

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
    { id: 'chicken', name: 'Chicken Breast', category: 'protein', nutritionalProfile: { protein: 31, fat: 3 }, safeFor: ['dogs'] },
    { id: 'salmon', name: 'Salmon', category: 'protein', nutritionalProfile: { protein: 25, fat: 14 }, safeFor: ['dogs'] },
    { id: 'sweet-potato', name: 'Sweet Potato', category: 'vegetable', nutritionalProfile: { fiber: 3, calories: 86 }, safeFor: ['dogs'] },
    { id: 'pumpkin', name: 'Pumpkin', category: 'vegetable', nutritionalProfile: { fiber: 2 }, safeFor: ['dogs'] },
    { id: 'brown-rice', name: 'Brown Rice', category: 'grain', nutritionalProfile: { protein: 2.6, fiber: 1.8 }, safeFor: ['dogs'] },
    { id: 'fish-oil', name: 'Fish Oil', category: 'fat', nutritionalProfile: { fat: 99 }, safeFor: ['dogs'] },
    { id: 'spinach', name: 'Spinach', category: 'vegetable', nutritionalProfile: { protein: 3 }, safeFor: ['dogs'] },
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
const TEMPLATE_LIBRARY: RecipeTemplate[] = [
  {
    id: 'dog-balanced',
    name: 'Balanced Chicken & Pumpkin',
    category: 'dogs',
    style: 'cooked',
    baseIngredients: [
      INGREDIENT_TEMPLATES.dogs[0],
      INGREDIENT_TEMPLATES.dogs[2],
      INGREDIENT_TEMPLATES.dogs[4],
    ],
    optionalIngredients: [INGREDIENT_TEMPLATES.dogs[5], INGREDIENT_TEMPLATES.dogs[6]],
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
): { score: number; explain: string[] } {
  const explain: string[] = [];
  
  // Base compatibility score from improved system (0-100)
  // Convert GeneratedRecipe to Recipe format for scoring (add temporary id if missing)
  const recipeForScoring: Recipe = {
    ...recipe,
    id: recipe.templateId || 'generated-recipe',
  } as unknown as Recipe;
  
  const improvedScore = pet 
    ? scoreRecipeImproved(recipeForScoring, pet).matchScore 
    : 60; // Default if no pet
  
  // Generator-specific modifiers (normalized to small adjustments)
  const synergyBonus = applySynergyBonus(recipe);
  const conditionBias = applyConditionTemplateBias(recipe, pet);
  const nutrientAdjustment = applyNutrientTargets(recipe, pet);
  const diversityPenalty = calculateDiversityPenalty(
    normalizeIngredientNames(recipe.ingredients.map(i => i.name.toLowerCase())),
    recentIngredients || []
  );
  
  // Normalize legacy modifiers to ±10 range so they don't dominate
  const normalizedSynergy = clamp(synergyBonus * 0.5, 0, 5); // Max +5
  const normalizedCondition = clamp(conditionBias * 0.3, -5, 5); // ±5 max
  const normalizedNutrient = clamp(nutrientAdjustment * 0.5, -5, 5); // ±5 max
  const normalizedDiversity = clamp(diversityPenalty.penalty, 0, 10); // Max -10
  
  // Combine: improved score (base) + small generator adjustments
  let finalScore = improvedScore 
    + normalizedSynergy 
    + normalizedCondition 
    + normalizedNutrient 
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
    explain 
  };
}

// ============================================================================
// GENERATION
// ============================================================================

function pickIngredients(template: RecipeTemplate, pet?: Pet, excluded: string[] = []) {
  const safeList = [...template.baseIngredients, ...template.optionalIngredients].filter(
    ing => ing.safeFor.includes(template.category) && !excluded.includes(ing.id) && !excluded.includes(ing.name)
  );
  const chosen: IngredientTemplate[] = [];
  template.baseIngredients.forEach(ing => {
    if (!excluded.includes(ing.id)) chosen.push(ing);
  });
  // Add one optional if available
  if (safeList.length > chosen.length) {
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

  const recipe: GeneratedRecipe = {
    templateId: template.id,
    generationTimestamp: new Date(),
    name: customizations?.name || template.name,
    description: `${template.name} tailored for ${pet?.name || 'your pet'}`,
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
      calories: ingredientBreakdown.reduce((s, b) => s + b.contribution.calories, 0),
      protein: ingredientBreakdown.reduce((s, b) => s + b.contribution.protein, 0),
      fat: ingredientBreakdown.reduce((s, b) => s + b.contribution.fat, 0),
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

export function generateBestRecipeForPet(templates: RecipeTemplate[] = TEMPLATE_LIBRARY, pet?: Pet, seed?: number) {
  const recent = pet?.id ? getRecentIngredients(pet.id, 7) : [];
  let best: GeneratedRecipe | null = null;
  templates.forEach((t, idx) => {
    if (seed !== undefined && idx % 2 === seed % 2) {
      // simple deterministic skip to vary
    }
    const recipe = generateRecipe({ template: t, pet });
    const { score } = computeFinalGenerationScore(recipe, pet, recent);
    recipe.score = score;
    if (!best || (recipe.score ?? 0) > (best.score ?? 0)) best = recipe;
  });
  return best;
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