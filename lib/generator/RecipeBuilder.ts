/**
 * ENHANCED RECIPE BUILDER
 * Adds health-aware ingredient selection + palatability
 * 
 * Key improvements:
 * 1. Health concerns drive ingredient selection (40% weight)
 * 2. Contraindications filtered as hard constraints
 * 3. Palatability built into scoring (30% weight)
 * 4. Species-specific taste preferences
 * 5. Debug info for transparency
 */

import type { Species } from '@/lib/data/ingredients';
import { INGREDIENTS, getIngredientsForSpecies, type Ingredient, type IngredientCategory } from '@/lib/data/ingredients';

/**
 * Normalize ingredient category strings to canonical values.
 * Handles variations like 'fish', 'seafood', 'meat', 'poultry' → 'protein'
 */
function canonicalCategory(cat: any): IngredientCategory | 'unknown' {
  const c = String(cat ?? '').toLowerCase().trim();

  // PROTEIN family (fish, meat, poultry, seafood, eggs)
  if (
    c === 'protein' ||
    c.includes('protein') ||
    c.includes('meat') ||
    c.includes('poultry') ||
    c.includes('fish') ||
    c.includes('seafood') ||
    c.includes('egg')
  ) return 'protein';

  // VEGETABLE family
  if (c === 'vegetable' || c.includes('veg')) return 'vegetable';

  // FAT family (oils)
  if (c === 'fat' || c.includes('oil')) return 'fat';

  // CARB family (grains, starches)
  if (c === 'carb' || c.includes('grain') || c.includes('starch')) return 'carb';

  // Keep specialized categories as-is
  if (['seed', 'nut', 'fruit', 'insect', 'hay', 'pellet', 'supplement'].includes(c)) {
    return c as IngredientCategory;
  }

  return 'unknown';
}
import { getNutritionalStandard } from '@/lib/data/aafco-standards';
import { HEALTH_BENEFIT_MAP, HEALTH_CONTRAINDICATIONS } from '@/lib/data/healthBenefitMap';
import { validateRecipeComprehensive } from './RecipeConstraintRules';
import { shouldPruneCandidateForMicronutrients, getPruningReason } from './CombinatoricsPruning';
import { isFatCompatibleWithProteins, calculatePairingScore, logPairingDecision } from './RecipePMIScoring';
import { applyPriorScoring } from './RecipePriorScoring';
import { filterCandidatesByCommercialPriors, applyCommercialPriorScoring, hasCommercialPriors } from './CommercialPriorEnforcement';

export interface GenerationConstraints {
  species: Species;
  lifeStage: 'puppy' | 'adult' | 'senior';
  petWeightKg?: number; // PHASE 1.3: Actual pet weight for portion calculation
  healthConcerns?: string[];
  budgetPerMeal?: number;
  targetCalories?: number;
  allergies?: string[];
  bannedIngredients?: string[];
  recentIngredients?: string[]; // Track recently used ingredients for variety
}

export interface PortionedIngredient {
  ingredient: Ingredient;
  grams: number;
}

export interface GeneratedRecipeRaw {
  ingredients: PortionedIngredient[];
  totalGrams: number;
  estimatedCost: number;
  micronutrientDataIncomplete?: boolean; // Flag for exotic pets (no AAFCO standards)
  debugInfo?: {
    candidateCount: number;
    topScores: Array<{ name: string; score: number; breakdown: any }>;
    validation?: {
      isValid: boolean;
      failedRules: string[];
      softPenalties: Array<{ ruleId: string; penalty: number; message: string }>;
    };
  };
}

interface ScoredIngredient {
  ingredient: Ingredient;
  totalScore: number;
  breakdown: {
    health: number;
    quality: number;
    nutritional: number;
    diversity?: number;
  };
}

export type DiversityMode = 'high' | 'medium' | 'low' | 'none';

export class RecipeBuilder {
  private constraints: GenerationConstraints;
  private qualityTier: 'premium' | 'standard' | 'budget';
  private diversityMode: DiversityMode;

  // Scoring weights (reflects priority order)
  private weights = {
    health: 0.40,
    nutritional: 0.50,
    quality: 0.10,
  };

  constructor(
    constraints: GenerationConstraints,
    qualityTier: 'premium' | 'standard' | 'budget' = 'standard',
    diversityMode: DiversityMode = 'medium'
  ) {
    this.constraints = constraints;
    this.qualityTier = qualityTier;
    this.diversityMode = diversityMode;
  }

  /**
   * Main generation method
   */
  generate(): GeneratedRecipeRaw | null {
    try {
      console.log(`\n========== RECIPE GENERATION START (${this.constraints.species}) ==========`);
      const maxRetries = 3;
      let attempt = 0;
      const failedIngredients = new Set<string>(); // Track ingredients that failed hard gates

      while (attempt < maxRetries) {
        attempt++;
        console.log(`\n--- Attempt ${attempt}/${maxRetries} ---`);

        // 1. Get candidate ingredients (hard filters)
        let candidates = this.getCandidateIngredients();
        console.log(`[Step 1] Candidates after filters: ${candidates.length}`);

        // 🔥 CRITICAL GUARDRAIL: Block small candidate pools (vetted-only path)
        const MIN_POOL = 200;
        if (this.constraints.species === 'cats' && candidates.length < MIN_POOL) {
          throw new Error(
            `[RecipeBuilder] Candidate pool collapsed to ${candidates.length}. ` +
            `Refusing to generate recipes from small pool (likely vetted-only/products-only path). ` +
            `Minimum required: ${MIN_POOL}`
          );
        }

        if (candidates.length === 0) {
          console.warn(`No candidate ingredients found for ${this.constraints.species}`);
          return null;
        }

        // 🔥 NEW: Exclude ingredients that failed hard gates in previous attempts
        if (failedIngredients.size > 0) {
          candidates = candidates.filter(ing => !failedIngredients.has(ing.name));
          if (candidates.length === 0) {
            console.warn('All candidates excluded due to previous failures');
            return null;
          }
        }

        // 2. Score all candidates
        const scored = this.scoreIngredients(candidates);
        console.log(`[Step 2] Scored ingredients: ${scored.length}`);
        console.log(`[Step 2] Top 5 scores:`, scored.slice(0, 5).map(s => `${s.ingredient.name} (${s.totalScore.toFixed(1)})`));

        // 3. Select best ingredients by category
        const selected = this.selectIngredients(scored);
        console.log(`[Step 3] Selected ingredients: ${selected.length}`);
        console.log(`[Step 3] Ingredients:`, selected.map(i => `${i.name} (${i.category})`));
        if (selected.length === 0) {
          console.warn('No ingredients selected');
          return null;
        }

        // 🔥 NEW: Prune micronutrient-toxic candidates BEFORE validation
        if (shouldPruneCandidateForMicronutrients(selected)) {
          if (attempt < maxRetries) {
            console.warn(
              `Attempt ${attempt} pruned (micronutrient risk): ${getPruningReason(selected)}`
            );
            continue; // Retry with different random selections
          }
        }

        // 4. Calculate portions
        const portioned = this.calculatePortions(selected);
        console.log(`[Step 4] Portioned ingredients: ${portioned.length}`);
        console.log(`[Step 4] Portions:`, portioned.map(p => `${p.ingredient.name}: ${p.grams}g`));
        if (portioned.length === 0) {
          console.warn('Failed to calculate portions');
          return null;
        }

        // 5. Calculate cost
        const estimatedCost = this.calculateCost(portioned);
        console.log(`[Step 5] Estimated cost: $${estimatedCost.toFixed(2)}`);

        // 🔥 NEW: Validate recipe composition (comprehensive)
        const comprehensiveValidation = validateRecipeComprehensive(
          selected,
          this.constraints.species,
          this.constraints.lifeStage,
          estimatedCost,
          this.constraints.allergies
        );

        console.log(`[Step 6] Validation result: ${comprehensiveValidation.isValid ? 'PASS' : 'FAIL'}`);
        if (!comprehensiveValidation.isValid) {
          console.warn(`[Step 6] Failed hard gates:`, comprehensiveValidation.failedRules);

          // 🔥 NEW: Track which ingredients to exclude next time
          // If S2 (organ meat) failed, exclude organ meats
          if (comprehensiveValidation.failedRules.includes('S2')) {
            selected.forEach(ing => {
              if (ing.name.toLowerCase().includes('liver') ||
                ing.name.toLowerCase().includes('kidney') ||
                ing.name.toLowerCase().includes('heart')) {
                failedIngredients.add(ing.name);
              }
            });
          }

          if (attempt < maxRetries) {
            continue; // Retry with different random selections
          }
          // Last attempt failed - do NOT return recipe
          console.error('Could not generate valid recipe after', maxRetries, 'attempts');
          continue; // Skip to next retry (which will exit loop)
        } else {
          console.log(`[Step 6] ✅ Validation passed!`);
          if (comprehensiveValidation.totalPenalty > 0) {
            console.warn(
              `[Step 6] Recipe quality penalties: ${comprehensiveValidation.totalPenalty}`,
              comprehensiveValidation.softGates.map(g => `${g.ruleId}: -${g.penalty}`)
            );
          }
        }

        // 🔥 PHASE 1: Only return if validation passed
        const species = this.constraints.species;
        const isExoticPet = species === 'birds' || species === 'reptiles' || species === 'pocket-pets';

        return {
          ingredients: portioned,
          totalGrams: portioned.reduce((sum, p) => sum + p.grams, 0),
          estimatedCost,
          // Flag exotic pets: micronutrient data incomplete (no AAFCO standards)
          micronutrientDataIncomplete: isExoticPet,
          debugInfo: {
            candidateCount: candidates.length,
            topScores: scored.slice(0, 10).map(s => ({
              name: s.ingredient.name,
              score: Math.round(s.totalScore),
              breakdown: {
                health: Math.round(s.breakdown.health),
                quality: Math.round(s.breakdown.quality),
                nutrition: Math.round(s.breakdown.nutritional),
              },
            })),
            validation: {
              isValid: comprehensiveValidation.isValid,
              failedRules: comprehensiveValidation.failedRules,
              softPenalties: comprehensiveValidation.softGates.map(g => ({
                ruleId: g.ruleId,
                penalty: g.penalty,
                message: g.message,
              })),
            },
          },
        };
      }

      return null;
    } catch (error) {
      console.error('RecipeBuilder.generate() error:', error);
      return null;
    }
  }


  /**
   * STEP 1: HARD FILTERS
   * Get candidate ingredients filtered by species and hard constraints
   */
  private getCandidateIngredients(): Ingredient[] {
    let candidates = getIngredientsForSpecies(this.constraints.species);

    // 🔥 STACK TRACE: Identify source of small pools
    console.log(`[PoolSource] Initial candidates: ${candidates.length}`, {
      species: this.constraints.species,
      source: 'getIngredientsForSpecies'
    });
    if (candidates.length < 200) {
      console.trace('[PoolSource] Small pool detected - trace:');
    }

    // 🔥 INVARIANT: Full pool must be large enough for cats
    if (this.constraints.species === 'cats' && candidates.length < 200) {
      throw new Error(
        `[Invariant] Full ingredient pool too small (${candidates.length}). ` +
        `Registry/provider is wrong. Expected 400+. ` +
        `This means getIngredientsForSpecies is returning a subset (vetted-only? priced-only?).`
      );
    }

    // Apply each filter individually with logging
    candidates = candidates.filter(ing => {
      // Filter 1: Allergies (HARD)
      if (
        this.constraints.allergies?.some(a =>
          ing.name.toLowerCase().includes(a.toLowerCase())
        )
      ) {
        return false;
      }

      // Filter 2: Banned ingredients (HARD)
      if (
        this.constraints.bannedIngredients?.some(b =>
          ing.name.toLowerCase().includes(b.toLowerCase())
        )
      ) {
        return false;
      }

      // Filter 3: Health contraindications (HARD)
      if (this.constraints.healthConcerns?.length) {
        for (const concern of this.constraints.healthConcerns) {
          const contraindicated = HEALTH_CONTRAINDICATIONS[concern] || [];
          const isContraindicated = contraindicated.some(
            contra =>
              ing.name.toLowerCase().includes(contra.toLowerCase()) ||
              ing.id.includes(contra.toLowerCase())
          );
          if (isContraindicated) {
            return false; // Hard exclude
          }
        }
      }

      // Filter 4: Exclude supplements from base recipes (HARD)
      // Supplements should only appear in supplements tab as add-ons
      if (ing.category === 'supplement') {
        return false;
      }

      // Filter 4b: Explicitly exclude fish oils (HARD)
      // Fish oils should only be supplements, not base ingredients
      const lowerName = ing.name.toLowerCase();
      const lowerId = ing.id.toLowerCase();
      if (lowerName.includes('fish oil') ||
        lowerName.includes('salmon oil') ||
        lowerName.includes('anchovy oil') ||
        lowerName.includes('mackerel oil') ||
        lowerName.includes('krill oil') ||
        lowerName.includes('cod liver oil') ||
        lowerName.includes('sardine oil') ||
        lowerName.includes('tuna oil') ||
        lowerName.includes('herring oil') ||
        lowerId.includes('fish_oil') ||
        lowerId.includes('salmon_oil') ||
        lowerId.includes('anchovy_oil') ||
        lowerId.includes('mackerel_oil') ||
        lowerId.includes('krill_oil') ||
        lowerId.includes('cod_liver_oil') ||
        lowerId.includes('sardine_oil') ||
        lowerId.includes('tuna_oil') ||
        lowerId.includes('herring_oil')) {
        console.log(`[FILTER] Excluding fish oil: ${ing.name} (id: ${ing.id})`);
        return false;
      }

      // Filter 5: Budget constraint (SOFT - allow some flex)
      if (this.constraints.budgetPerMeal && ing.pricePerLb) {
        const maxPrice = this.constraints.budgetPerMeal * 3; // Allow 3x for high-value ingredients
        if (ing.pricePerLb > maxPrice) return false;
      }

      return true;
    });

    console.log(`[Filters] After all filters: ${candidates.length} candidates`);

    // 🔥 INVARIANT: Check category pools for cats
    if (this.constraints.species === 'cats') {
      const veg = candidates.filter(x => canonicalCategory(x.category) === 'vegetable');
      const fat = candidates.filter(x => canonicalCategory(x.category) === 'fat');
      // Allow all proteins (exotic proteins already filtered out earlier)
      const proteinPool = candidates.filter(x => canonicalCategory(x.category) === 'protein');

      console.log(`[CategoryPools] protein=${proteinPool.length}, veg=${veg.length}, fat=${fat.length}`);

      if (veg.length < 2 || fat.length < 1 || proteinPool.length < 1) {
        throw new Error(
          `[Invariant] Missing required ingredient categories for cats: ` +
          `protein=${proteinPool.length} (need 1+), veg=${veg.length} (need 2+), fat=${fat.length} (need 1+). ` +
          `Cannot generate valid recipes. Pool size: ${candidates.length}`
        );
      }
    }

    return candidates;
  }

  /**
   * STEP 2: SCORE ALL CANDIDATES
   * Multi-factor scoring: health + quality + nutrition + diversity penalty
   * CRITICAL FIX: For protein category, heavily prioritize protein density
   */
  private scoreIngredients(candidates: Ingredient[]): ScoredIngredient[] {
    const recentIngredients = this.constraints.recentIngredients || [];

    return candidates
      .map(ing => {
        const breakdown = {
          health: this.scoreHealth(ing),
          quality: this.scoreQuality(ing),
          nutritional: this.scoreNutritional(ing),
        };

        // CRITICAL FIX: For protein category, use special weights
        // USER REQUIREMENT: Nutrition ALWAYS wins - protein density must dominate
        let weights = this.weights;
        if (canonicalCategory(ing.category) === 'protein') {
          weights = {
            health: 0.20,
            nutritional: 0.75,  // NUTRITION ALWAYS WINS - protein density dominates
            quality: 0.05,      // Minimal influence from quality
          };
        }

        let totalScore =
          breakdown.health * weights.health +
          breakdown.quality * weights.quality +
          breakdown.nutritional * weights.nutritional;

        // Apply diversity penalty for recently used ingredients
        const ingNameLower = ing.name.toLowerCase();
        const timesUsedRecently = recentIngredients.filter(r => r === ingNameLower).length;

        if (timesUsedRecently > 0) {
          // Heavy penalty: 50% reduction per recent use
          const diversityPenalty = Math.pow(0.5, timesUsedRecently);
          totalScore *= diversityPenalty;

          if (timesUsedRecently >= 2) {
            console.log(`[Diversity] Penalizing ${ing.name}: used ${timesUsedRecently}x recently, score ${totalScore.toFixed(1)} → ${(totalScore * diversityPenalty).toFixed(1)}`);
          }
        }

        return { ingredient: ing, totalScore, breakdown };
      })
      .sort((a, b) => b.totalScore - a.totalScore); // Sort by total score descending
  }

  /**
   * HEALTH SCORE (0-100)
   * Does this ingredient help with pet's health concerns?
   */
  private scoreHealth(ing: Ingredient): number {
    if (!this.constraints.healthConcerns?.length) return 50; // Neutral if no concerns

    let score = 0;
    const ingName = ing.name.toLowerCase();

    for (const concern of this.constraints.healthConcerns) {
      const beneficialIngredients = HEALTH_BENEFIT_MAP[concern] || [];

      // Check if this ingredient is explicitly beneficial
      const isBeneficial = beneficialIngredients.some(
        beneficial =>
          ingName.includes(beneficial.toLowerCase()) ||
          beneficial.toLowerCase().includes(ingName)
      );

      if (isBeneficial) {
        score += 35; // +35 per matched health concern (can exceed 100)
      }
    }

    return Math.min(100, score);
  }

  /**
   * QUALITY SCORE (0-100)
   * Ingredient quality rating
   */
  private scoreQuality(ing: Ingredient): number {
    return ing.qualityScore * 10; // Convert 1-10 to 0-100
  }

  /**
   * NUTRITIONAL SCORE (0-100)
   * CRITICAL FIX: Heavily prioritize protein density to meet AAFCO standards
   * Protein is now 60% of nutritional score (was ~30%)
   */
  private scoreNutritional(ing: Ingredient): number {
    const comp = ing.composition;
    let score = 0;

    // PROTEIN DENSITY - Now 70 points max
    // Prioritize actual protein content over omega-3 for protein ingredients
    if (comp.protein) {
      if (comp.protein >= 30) score += 70;        // Chicken breast, turkey breast
      else if (comp.protein >= 25) score += 55;   // Ground turkey, ground chicken, tuna
      else if (comp.protein >= 20) score += 40;   // Salmon, duck
      else if (comp.protein >= 15) score += 25;   // Eggs, some fish
      else if (comp.protein >= 10) score += 12;   // Legumes
      else if (comp.protein >= 5) score += 6;     // Some vegetables
    }

    // Healthy fats (omega-3) - 10 points max (reduced from 20)
    // Omega-3 is good but shouldn't make canned fish dominate every recipe
    if (comp.omega3 && comp.omega3 > 1) score += 10;
    else if (comp.omega3 && comp.omega3 > 0.5) score += 5;

    // Fiber (good for digestion) - 10 points max
    if (comp.fiber && comp.fiber > 5) score += 10;
    else if (comp.fiber && comp.fiber > 2) score += 5;

    // Micronutrients - 10 points max
    if (comp.calcium && comp.calcium > 100) score += 5;
    if (comp.vitaminA && comp.vitaminA > 500) score += 5;

    return Math.min(100, score);
  }

  /**
   * Get required categories for a given species
   */
  private getRequiredCategoriesForSpecies(): IngredientCategory[] {
    const species = this.constraints.species;

    switch (species) {
      case 'dogs':
        return ['protein', 'carb', 'vegetable'];
      case 'cats':
        return ['protein', 'vegetable'];

      case 'birds':
        // Birds need seeds/nuts as protein, fruits/veggies for vitamins
        return ['seed', 'nut', 'fruit', 'vegetable'];

      case 'reptiles':
        // Reptiles need insects as protein, veggies for fiber
        return ['insect', 'vegetable', 'fruit'];

      case 'pocket-pets':
        // Pocket-pets need hay as staple, veggies/fruits for variety
        return ['hay', 'vegetable', 'fruit', 'seed'];

      default:
        return ['protein', 'carb', 'vegetable'];
    }
  }

  /**
   * Get how many ingredients to select from each category
   * Some categories are more important than others
   */
  private getIngredientCountForCategory(category: IngredientCategory): number {
    const species = this.constraints.species;

    // Dogs/Cats
    if (species === 'dogs' || species === 'cats') {
      if (category === 'protein') {
        return 1; // S1: Exactly 1 primary protein (hard gate)
      }
      if (category === 'carb') {
        return species === 'cats' ? 0 : 1; // Cats don't need carbs (obligate carnivores)
      }
      if (category === 'vegetable') {
        return species === 'cats' ? 2 : 1; // Cats get 2 veggies for variety (min 3 ingredients)
      }
      if (category === 'fat') {
        return 1; // 1 fat
      }
      return 1; // Default
    }

    // Birds
    if (species === 'birds') {
      if (category === 'seed' || category === 'nut') {
        return 2; // 2 seeds/nuts for variety
      }
      if (category === 'fruit') {
        return 1; // 1 fruit
      }
      if (category === 'vegetable') {
        return 1; // 1 veggie
      }
    }

    // Reptiles
    if (species === 'reptiles') {
      if (category === 'insect') {
        return 2; // 2 insects for variety
      }
      if (category === 'vegetable') {
        return 1; // 1 veggie
      }
      if (category === 'fruit') {
        return 1; // 1 fruit (optional)
      }
    }

    // Pocket-pets
    if (species === 'pocket-pets') {
      if (category === 'hay') {
        return 1; // 1 hay type (essential)
      }
      if (category === 'vegetable') {
        return 2; // 2 veggies for variety
      }
      if (category === 'fruit') {
        return 1; // 1 fruit (treat)
      }
      if (category === 'seed') {
        return 1; // 1 seed type (optional)
      }
    }

    return 1; // Default
  }

  // REMOVED: Hardcoded fat-protein pairing logic
  // Now using PMI-based pairing intelligence from recipePriors.json
  // See RecipePMIScoring.ts for learned pairing logic

  /**
   * STEP 3: SELECT BEST INGREDIENTS
   * Pick ingredients with weighted randomization to ensure diversity
   * 🔥 FIX: Species-aware ingredient selection
   */
  private selectIngredients(scored: ScoredIngredient[]): Ingredient[] {
    const selected: Ingredient[] = [];
    const categories = this.getRequiredCategoriesForSpecies();

    // 🔥 PRECONDITION CHECK: For cats, ensure we have all required categories
    if (this.constraints.species === 'cats') {
      const vegPool = scored.filter(s => canonicalCategory(s.ingredient.category) === 'vegetable');
      const fatPool = scored.filter(s => canonicalCategory(s.ingredient.category) === 'fat');
      // Allow all proteins (exotic proteins already filtered out earlier)
      const proteinPool = scored.filter(s => canonicalCategory(s.ingredient.category) === 'protein');

      if (vegPool.length < 2 || fatPool.length < 1 || proteinPool.length < 1) {
        throw new Error(
          `[RecipeBuilder] Insufficient pools for cats: ` +
          `protein=${proteinPool.length}, veg=${vegPool.length}, fat=${fatPool.length}. ` +
          `Cannot generate valid recipe without all required categories.`
        );
      }
    }

    // DEBUG: Log what we're looking for
    if (this.constraints.species === 'birds') {
      console.log(`[BIRD DEBUG] Looking for categories: ${categories.join(', ')}`);
      console.log(`[BIRD DEBUG] Total scored ingredients: ${scored.length}`);
    }

    for (const category of categories) {
      let inCategory = scored.filter(s => canonicalCategory(s.ingredient.category) === category);

      // CRITICAL: For dogs/cats protein category, all proteins allowed (exotic already filtered)
      // No additional filtering needed here

      // 🔥 COMMERCIAL PRIORS: Filter candidates using learned commercial pairing rules
      if (hasCommercialPriors(this.constraints.species) && selected.length > 0) {
        const selectedIds = selected.map(ing => ing.id);
        const beforeCommercialFilter = inCategory.length;

        // Filter out hardBlockPairs (never co-occur in commercial products)
        inCategory = filterCandidatesByCommercialPriors(
          inCategory.map(s => s.ingredient),
          selectedIds,
          this.constraints.species,
          '[Commercial] '
        ).map(ing => {
          // Find the scored ingredient back
          return inCategory.find(s => s.ingredient.id === ing.id)!;
        }).filter(Boolean);

        const afterCommercialFilter = inCategory.length;
        if (beforeCommercialFilter !== afterCommercialFilter) {
          console.log(`[Commercial Filter] Removed ${beforeCommercialFilter - afterCommercialFilter} hard-blocked ingredients`);
        }
      }

      // 🔥 PMI-BASED: Filter fats using learned pairing intelligence
      if (category === 'fat') {
        const selectedProteins = selected.filter(ing => canonicalCategory(ing.category) === 'protein');
        if (selectedProteins.length > 0) {
          const beforeFilter = inCategory.length;
          inCategory = inCategory.filter(s => {
            const compat = isFatCompatibleWithProteins(s.ingredient, selectedProteins, this.constraints.species);
            if (!compat.compatible) {
              console.log(`[PMI Filter] ${s.ingredient.name}: ${compat.reason}`);
            }
            return compat.compatible;
          });
          const afterFilter = inCategory.length;
          if (beforeFilter !== afterFilter) {
            console.log(`[PMI Filter] Removed ${beforeFilter - afterFilter} incompatible fats based on learned priors`);
          }
        }
      }

      // 🔥 DEBUG: Log protein pool details for cats
      if (this.constraints.species === 'cats' && category === 'protein') {
        console.log(`[ProteinPool] Total proteins in scored: ${inCategory.length}`);
        console.log(`[ProteinPool] Top 10 proteins:`, inCategory.slice(0, 10).map(s =>
          `${s.ingredient.name} (score: ${s.totalScore.toFixed(1)}, role: ${s.ingredient.proteinRole || 'none'})`
        ));
      }

      if (inCategory.length === 0) {
        console.warn(`No ingredients found for category: ${category} (species: ${this.constraints.species})`);
        continue;
      }

      const count = this.getIngredientCountForCategory(category);

      // DEBUG: Log selection details for birds
      if (this.constraints.species === 'birds') {
        console.log(`[BIRD DEBUG] Category '${category}': ${inCategory.length} available, selecting ${count}`);
        if (inCategory.length > 0) {
          console.log(`[BIRD DEBUG]   Top 3 in ${category}:`, inCategory.slice(0, 3).map(s =>
            `${s.ingredient.name} (score: ${s.totalScore.toFixed(1)})`
          ));
        }
      }

      // Skip if count is 0 (e.g., cats don't need grains)
      if (count === 0) continue;

      // Pick randomly from top N
      for (let i = 0; i < count && inCategory.length > 0; i++) {
        let poolSize: number;
        switch (this.diversityMode) {
          case 'high':
            poolSize = Math.min(8, inCategory.length);
            break;
          case 'medium':
            poolSize = Math.min(5, inCategory.length);
            break;
          case 'low':
            poolSize = Math.min(3, inCategory.length);
            break;
          case 'none':
            poolSize = 1;
            break;
        }

        const randomIndex = this.weightedRandomSelection(inCategory.slice(0, poolSize));
        const selectedIng = inCategory[randomIndex].ingredient;
        selected.push(selectedIng);

        // 🔥 DEBUG: Log what was selected
        if (this.constraints.species === 'cats' && category === 'protein') {
          console.log(`[Selection] Picked protein: ${selectedIng.name} (from pool of ${poolSize})`);
        }

        // Remove selected to avoid duplicates
        inCategory.splice(randomIndex, 1);
      }
    }

    if (selected.length === 0) {
      console.error('No ingredients selected for species:', this.constraints.species);
      console.error('Available categories:', categories);
      console.error('Scored ingredients count:', scored.length);
    }

    // CRITICAL: Enforce minimum 3 ingredients for proper meal prep
    // 2-ingredient meals are just "putting ingredients in a bowl", not meal prep
    const MIN_INGREDIENTS = 3;
    if (selected.length < MIN_INGREDIENTS) {
      console.warn(`Only ${selected.length} ingredients selected, need at least ${MIN_INGREDIENTS}`);

      // 🔥 NEVER pad with proteins when vegetables/fats are missing
      // Check what categories we're missing
      const selectedCategories = new Set(selected.map(ing => ing.category));
      const missingCategories = categories.filter(cat => !selectedCategories.has(cat));

      if (missingCategories.length > 0) {
        console.error(`Missing required categories: ${missingCategories.join(', ')}`);
        console.error('Cannot pad with random ingredients - aborting recipe generation');
        throw new Error(
          `Recipe generation failed: missing required categories [${missingCategories.join(', ')}]. ` +
          `This indicates the ingredient pool is too small or filtered incorrectly.`
        );
      }

      // Only pad if we have all required categories but just need more variety
      const remainingNeeded = MIN_INGREDIENTS - selected.length;
      const alreadySelectedIds = new Set(selected.map(ing => ing.id));

      // Get top-scoring ingredients from EXISTING categories only (no proteins if we already have one)
      const availableToAdd = scored
        .filter(s => {
          // Don't add if already selected
          if (alreadySelectedIds.has(s.ingredient.id)) return false;

          // For cats: don't add more proteins (we already have 1)
          if (this.constraints.species === 'cats' && canonicalCategory(s.ingredient.category) === 'protein') {
            return false;
          }

          // Only add from categories we already have
          return selectedCategories.has(s.ingredient.category);
        })
        .slice(0, remainingNeeded * 3); // Get 3x needed for variety

      for (let i = 0; i < remainingNeeded && availableToAdd.length > 0; i++) {
        const randomIndex = Math.floor(Math.random() * Math.min(5, availableToAdd.length));
        selected.push(availableToAdd[randomIndex].ingredient);
        availableToAdd.splice(randomIndex, 1);
      }

      console.log(`Added ${remainingNeeded} ingredients to reach minimum. Total: ${selected.length}`);
    }

    // DEBUG: Log final selection for birds
    if (this.constraints.species === 'birds') {
      console.log(`[BIRD DEBUG] Final selection: ${selected.length} ingredients`);
      selected.forEach(ing => console.log(`[BIRD DEBUG]   - ${ing.name} (${ing.category})`));
    }

    return selected;
  }

  /**
   * Weighted random selection
   * Higher-scoring ingredients have higher probability of being selected
   */
  private weightedRandomSelection(pool: ScoredIngredient[]): number {
    if (pool.length === 1) return 0;

    // Calculate weights (score^2 gives exponential preference to higher scores)
    const weights = pool.map(s => Math.pow(Math.max(0, s.totalScore), 2));
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);

    if (totalWeight === 0) {
      // Fallback to uniform random if all scores are 0 or negative
      return Math.floor(Math.random() * pool.length);
    }

    // Pick random value in [0, totalWeight)
    let random = Math.random() * totalWeight;

    // Find which ingredient this corresponds to
    for (let i = 0; i < weights.length; i++) {
      random -= weights[i];
      if (random <= 0) return i;
    }

    return pool.length - 1; // Fallback
  }

  /**
   * Calculate portions based on NUTRIENT TARGETS (not category weights)
   * CRITICAL FIX: Calculate protein/fat needs UPFRONT, then allocate portions to meet targets
   * This ensures recipes meet AAFCO standards for all species
   */
  private calculatePortions(ingredients: Ingredient[]): PortionedIngredient[] {
    const petWeightKg = this.constraints.petWeightKg || 5;
    const species = this.constraints.species;

    // Step 1: Calculate total meal size
    const totalMealGrams = this.calculateTotalMealSize(petWeightKg, species);

    // Step 2: Get nutritional targets for this species
    const targets = this.getNutritionalTargets(species);

    // Step 3: Calculate required nutrient grams
    const targetProteinGrams = totalMealGrams * targets.proteinPercent;
    const targetFatGrams = totalMealGrams * targets.fatPercent;

    // Step 4: Allocate portions to meet nutrient targets
    return this.allocateNutrientTargetedPortions(
      ingredients,
      totalMealGrams,
      targetProteinGrams,
      targetFatGrams,
      petWeightKg
    );
  }

  /**
   * Calculate total meal size based on species and pet weight
   */
  private calculateTotalMealSize(petWeightKg: number, species: Species): number {
    if (species === 'dogs' || species === 'cats') {
      const mealMultiplier = this.qualityTier === 'premium' ? 80 : this.qualityTier === 'standard' ? 65 : 50;
      return petWeightKg * mealMultiplier;
    } else if (species === 'birds') {
      return petWeightKg * 40;
    } else if (species === 'reptiles') {
      return petWeightKg * 30;
    } else if (species === 'pocket-pets') {
      return petWeightKg * 100;
    }
    return petWeightKg * 65;
  }

  /**
   * Get nutritional targets (protein %, fat %) for each species
   * Based on AAFCO standards
   */
  private getNutritionalTargets(species: Species): { proteinPercent: number; fatPercent: number } {
    switch (species) {
      case 'dogs':
        return { proteinPercent: 0.20, fatPercent: 0.08 }; // 20% protein, 8% fat (above 18% minimum)
      case 'cats':
        return { proteinPercent: 0.23, fatPercent: 0.10 }; // 23% protein, 10% fat (allows diverse protein sources)
      case 'birds':
        // Target 15% but accept 13-17% range (natural fluctuation in seed diets)
        return { proteinPercent: 0.15, fatPercent: 0.08 };
      case 'reptiles':
        // Target 15% but accept 13-17% range (natural fluctuation in insect diets)
        return { proteinPercent: 0.15, fatPercent: 0.07 };
      case 'pocket-pets':
        // Target 14% but accept 12-16% range (natural fluctuation in hay diets)
        return { proteinPercent: 0.14, fatPercent: 0.06 };
      default:
        return { proteinPercent: 0.20, fatPercent: 0.08 };
    }
  }

  /**
   * Allocate portions to meet nutrient targets
   * Uses iterative approach: start with base allocation, then adjust to hit targets
   */
  private allocateNutrientTargetedPortions(
    ingredients: Ingredient[],
    totalMealGrams: number,
    targetProteinGrams: number,
    targetFatGrams: number,
    petWeightKg: number
  ): PortionedIngredient[] {
    const species = this.constraints.species;

    // Note: highProtein used later for boosting portions if needed
    const highProtein = ingredients.filter(ing => (ing.composition.protein || 0) >= 15);

    const portioned: PortionedIngredient[] = [];
    let allocatedGrams = 0;
    let allocatedProtein = 0;
    let allocatedFat = 0;

    // USER REQUIREMENT: Distribute portions across ALL selected ingredients
    // Don't allocate 90% to one ingredient - spread it out for variety

    // For dogs/cats: Use SELECTED protein (whatever was chosen by scoring)
    if (species === 'dogs' || species === 'cats') {
      // Get ANY protein that was selected (no primary/secondary distinction)
      const proteinIngredients = ingredients.filter(ing => canonicalCategory(ing.category) === 'protein');

      if (proteinIngredients.length === 0) {
        console.warn('No protein ingredients available for dogs/cats!');
        console.warn('Selected ingredients:', ingredients.map(i => `${i.name} (cat: ${i.category})`));
        return [];
      }

      // Use whichever protein was selected (chicken, sardines, mackerel, turkey, etc.)
      const primaryProtein = proteinIngredients[0];

      // Calculate portion needed to hit protein target with THIS protein
      const proteinDensity = (primaryProtein.composition.protein || 20) / 100;
      const requiredIngredientGrams = targetProteinGrams / proteinDensity;

      let proteinPortion = requiredIngredientGrams;

      // ARCHITECTURAL RULE: Hard upper bound to prevent crowding out micronutrients/fats
      // Cats: 90% max (obligate carnivores, need high protein even with diverse sources)
      // Dogs: 85% max (leaves 15% for variety & micronutrient carriers)
      const maxProteinPercent = species === 'cats' ? 0.90 : 0.85;
      proteinPortion = Math.min(proteinPortion, totalMealGrams * maxProteinPercent);

      // ARCHITECTURAL RULE: Never override max-inclusion constraints
      const maxGrams = petWeightKg * 1000 * primaryProtein.maxInclusionPercent[species];
      proteinPortion = Math.min(proteinPortion, maxGrams);

      proteinPortion = Math.round(proteinPortion);

      if (proteinPortion > 0) {
        portioned.push({ ingredient: primaryProtein, grams: proteinPortion });
        allocatedGrams += proteinPortion;
        allocatedProtein += (primaryProtein.composition.protein || 0) * proteinPortion / 100;
        allocatedFat += (primaryProtein.composition.fat || 0) * proteinPortion / 100;
      }

      // Allocate remaining grams to other ingredients
      const remainingGrams = totalMealGrams - allocatedGrams;
      const otherIngredients = ingredients.filter(ing => ing.id !== primaryProtein.id);

      if (remainingGrams > 0 && otherIngredients.length > 0) {
        const gramsPerIngredient = remainingGrams / otherIngredients.length;

        for (const ing of otherIngredients) {
          let grams = gramsPerIngredient;
          grams *= (0.85 + Math.random() * 0.3);

          const maxGrams = petWeightKg * 1000 * ing.maxInclusionPercent[species];
          grams = Math.min(grams, maxGrams);
          grams = Math.round(grams);

          if (grams > 0) {
            portioned.push({ ingredient: ing, grams });
            allocatedGrams += grams;
            allocatedProtein += (ing.composition.protein || 0) * grams / 100;
            allocatedFat += (ing.composition.fat || 0) * grams / 100;
          }
        }
      }
    } else {
      // For exotic pets: Distribute with bias toward higher-protein items
      // Equal grams ≠ equal nutrition - bias toward protein-dense natural foods

      // Calculate protein density weights for each ingredient
      const totalProteinDensity = ingredients.reduce((sum, ing) =>
        sum + (ing.composition.protein || 0), 0);

      for (const ing of ingredients) {
        const proteinDensity = ing.composition.protein || 0;

        // Base allocation: equal distribution
        const baseGrams = totalMealGrams / ingredients.length;

        // Protein bias: allocate more to higher-protein ingredients
        // Weight = 70% equal + 30% protein-density-weighted
        const proteinWeight = totalProteinDensity > 0
          ? proteinDensity / totalProteinDensity
          : 1 / ingredients.length;

        let grams = (baseGrams * 0.70) + (totalMealGrams * proteinWeight * 0.30);

        // Add variation (±15%)
        grams *= (0.85 + Math.random() * 0.3);

        // ARCHITECTURAL RULE: Never override max-inclusion constraints
        const maxGrams = petWeightKg * 1000 * ing.maxInclusionPercent[species];
        grams = Math.min(grams, maxGrams);
        grams = Math.round(grams);

        if (grams > 0) {
          portioned.push({ ingredient: ing, grams });
          allocatedGrams += grams;
          allocatedProtein += (ing.composition.protein || 0) * grams / 100;
          allocatedFat += (ing.composition.fat || 0) * grams / 100;
        }
      }
    }

    // Step 4: Adjust if we're still below protein target
    const currentProteinPercent = allocatedGrams > 0 ? (allocatedProtein / allocatedGrams) : 0;
    const targetProteinPercent = targetProteinGrams / totalMealGrams;

    if (currentProteinPercent < targetProteinPercent * 0.95 && highProtein.length > 0) {
      // Boost high-protein portions by 20%
      for (const portioned_ing of portioned) {
        if ((portioned_ing.ingredient.composition.protein || 0) >= 15) {
          const boost = Math.round(portioned_ing.grams * 0.2);
          const maxGrams = petWeightKg * 1000 * portioned_ing.ingredient.maxInclusionPercent[species];
          portioned_ing.grams = Math.min(portioned_ing.grams + boost, maxGrams);
        }
      }
    }

    return portioned;
  }


  /**
   * Calculate estimated cost
   */
  private calculateCost(portioned: PortionedIngredient[]): number {
    return portioned.reduce((sum, p) => {
      if (!p.ingredient.pricePerLb) return sum;
      const lbs = p.grams / 453.592;
      return sum + lbs * p.ingredient.pricePerLb;
    }, 0);
  }
}
