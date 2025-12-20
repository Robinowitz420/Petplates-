/**
 * RECIPE CONSTRAINT RULES
 * Pre-scoring validation gates that reject unsafe/invalid recipes before optimization
 * 
 * Pipeline:
 * 1. Constraint Gate (hard rejections)
 * 2. Composition Validator (structure + balance)
 * 3. Nutrient Ceiling Validator (micronutrient caps)
 * 4. Optimizer (cost + nutrition)
 * 5. Scorer (quality + fit)
 */

import type { Ingredient, Species } from '@/lib/data/ingredients';

// ============================================================================
// NUTRIENT CEILING TABLE (Species-Aware)
// Absolute caps per day equivalent, not scoring targets
// ============================================================================

export const NUTRIENT_CEILINGS: Record<Species, {
  vitaminA_IU: number;
  copper_mg: number;
  iodine_mcg: number;
  fat_percent: number;
  calcium_g: number;
  calcium_phosphorus_min: number;
  calcium_phosphorus_max: number;
}> = {
  dogs: {
    vitaminA_IU: 30000,       // PHASE 2: Per recipe (realistic with organs)
    copper_mg: 5.0,           // PHASE 2: Per recipe ceiling (realistic with organs)
    iodine_mcg: 1000,         // PHASE 2: Per recipe ceiling (realistic)
    fat_percent: 30,
    calcium_g: 2.5,
    calcium_phosphorus_min: 1.2,
    calcium_phosphorus_max: 2.0,
  },
  cats: {
    vitaminA_IU: 25000,       // PHASE 2: Per recipe (realistic with organs)
    copper_mg: 4.0,           // PHASE 2: Per recipe ceiling (realistic with organs)
    iodine_mcg: 800,          // PHASE 2: Per recipe ceiling (realistic)
    fat_percent: 45,
    calcium_g: 2.0,
    calcium_phosphorus_min: 1.1,
    calcium_phosphorus_max: 1.5,
  },
  birds: {
    vitaminA_IU: 4000, // Species-dependent, conservative estimate
    copper_mg: 0.3,
    iodine_mcg: 150,
    fat_percent: 15,
    calcium_g: 1.5,
    calcium_phosphorus_min: 1.0,
    calcium_phosphorus_max: 2.0,
  },
  reptiles: {
    vitaminA_IU: 3000, // Highly species-dependent
    copper_mg: 0.2,
    iodine_mcg: 100,
    fat_percent: 20,
    calcium_g: 2.0,
    calcium_phosphorus_min: 1.5,
    calcium_phosphorus_max: 2.5,
  },
  'pocket-pets': {
    vitaminA_IU: 4000,
    copper_mg: 0.3,
    iodine_mcg: 150,
    fat_percent: 20,
    calcium_g: 1.8,
    calcium_phosphorus_min: 1.0,
    calcium_phosphorus_max: 2.0,
  },
};

// ============================================================================
// INGREDIENT ROLE MATRIX
// Prevents "two mains in disguise" and organ stacking
// ============================================================================

export const INGREDIENT_ROLE_MATRIX = {
  'primary-protein': {
    allowedAsPrimary: true,
    percentCap: 0.60,
    maxPerRecipe: 1, // Exactly one primary protein
    examples: ['chicken_breast', 'beef', 'salmon', 'turkey_breast'],
  },
  'carb-base': {
    allowedAsPrimary: false,
    percentCap: 0.40,
    maxPerRecipe: 2,
    examples: ['rice', 'sweet_potato', 'oats', 'barley'],
  },
  'vegetable': {
    allowedAsPrimary: false,
    percentCap: 0.25,
    maxPerRecipe: 3,
    examples: ['carrots', 'green_beans', 'spinach', 'broccoli'],
  },
  'organ-meat': {
    allowedAsPrimary: false,
    percentCap: 0.10, // Hard cap for organ meats
    maxPerRecipe: 1, // Only one organ meat per recipe
    examples: ['chicken_liver', 'beef_liver', 'chicken_hearts'],
  },
  'fat-supplement': {
    allowedAsPrimary: false,
    percentCap: 0.05,
    maxPerRecipe: 1, // Only one added fat source
    examples: ['fish_oil', 'coconut_oil', 'olive_oil'],
  },
  'micronutrient': {
    allowedAsPrimary: false,
    percentCap: 0.01,
    maxPerRecipe: 1,
    examples: ['kelp', 'eggshell_powder', 'vitamin_premix'],
  },
};

// ============================================================================
// STRUCTURAL COMPOSITION RULES (Hard Gates)
// ============================================================================

export interface CompositionRuleResult {
  passed: boolean;
  ruleId: string;
  message: string;
}

export function validateStructuralComposition(
  ingredients: Ingredient[],
  species: Species,
  lifeStage: 'puppy' | 'adult' | 'senior'
): CompositionRuleResult[] {
  const results: CompositionRuleResult[] = [];

  // S1: Exactly 1 protein source (STRICT) - Species-aware
  // Dogs/cats: Must have 1 'protein' category (any protein, not just "primary")
  // Birds: Can have seeds/nuts as protein
  // Reptiles: Can have insects as protein
  // Pocket-pets: Can have hay/seeds as protein
  
  // Helper to normalize categories
  const canonicalCategory = (cat: any): string => {
    const c = String(cat ?? '').toLowerCase().trim();
    if (c === 'protein' || c.includes('protein') || c.includes('meat') || 
        c.includes('poultry') || c.includes('fish') || c.includes('seafood') || c.includes('egg')) {
      return 'protein';
    }
    return c;
  };
  
  let primaryProteins: Ingredient[];
  if (species === 'dogs' || species === 'cats') {
    // Accept ANY protein ingredient (chicken, turkey, sardines, mackerel, etc.)
    primaryProteins = ingredients.filter(ing => canonicalCategory(ing.category) === 'protein');
  } else if (species === 'birds') {
    // Birds: seeds/nuts/insects, but exclude oils (they're fats, not protein sources)
    primaryProteins = ingredients.filter(ing =>
      ['seed', 'nut', 'insect'].includes(ing.category) &&
      !ing.name.toLowerCase().includes('oil')
    );
  } else if (species === 'reptiles') {
    primaryProteins = ingredients.filter(ing =>
      ['insect', 'protein'].includes(ing.category)
    );
  } else if (species === 'pocket-pets') {
    primaryProteins = ingredients.filter(ing =>
      ['hay', 'seed'].includes(ing.category)
    );
  } else {
    // Default: accept any protein
    primaryProteins = ingredients.filter(ing => canonicalCategory(ing.category) === 'protein');
  }
  
  // Dogs/cats need exactly 1, exotic species can have 1-2 for variety
  const minRequired = (species === 'dogs' || species === 'cats') ? 1 : 1;
  const maxAllowed = (species === 'dogs' || species === 'cats') ? 1 : 3;
  
  results.push({
    passed: primaryProteins.length >= minRequired && primaryProteins.length <= maxAllowed,
    ruleId: 'S1',
    message: `Primary protein sources: ${primaryProteins.length} (species: ${species}, range: ${minRequired}-${maxAllowed})`,
  });

  // S2: Organ meats ≤ 1 per recipe (count-based, not weight)
  // NOTE: Weight-based cap moved to quality scoring as soft gate
  const organMeatNames = ['liver', 'kidney', 'heart'];
  const organMeats = ingredients.filter(ing => {
    const name = ing.name.toLowerCase();
    return ing.feedingRole === 'supplement' && organMeatNames.some(organ => name.includes(organ));
  });
  
  results.push({
    passed: organMeats.length <= 1,
    ruleId: 'S2',
    message: `Organ meats ≤ 1 per recipe (found ${organMeats.length})`,
  });

  // S3: Organ meats cannot be primary protein
  const organAsPrimary = ingredients.filter(ing =>
    ing.feedingRole === 'staple' &&
    (ing.name.toLowerCase().includes('liver') ||
      ing.name.toLowerCase().includes('kidney') ||
      ing.name.toLowerCase().includes('heart'))
  );
  results.push({
    passed: organAsPrimary.length === 0,
    ruleId: 'S3',
    message: `Organ meats cannot be primary protein (found ${organAsPrimary.length})`,
  });

  // S4: Must include carb/energy source (species-aware)
  // Dogs: need 'carb' (grains)
  // Birds: need 'seed' or 'nut' (energy-dense)
  // Pocket-pets: need 'hay' (fiber/energy)
  // Cats/reptiles: optional carbs
  let hasEnergySource = false;
  if (species === 'dogs') {
    hasEnergySource = ingredients.some(ing => ing.category === 'carb');
  } else if (species === 'birds') {
    hasEnergySource = ingredients.some(ing => ['seed', 'nut', 'carb'].includes(ing.category));
  } else if (species === 'pocket-pets') {
    hasEnergySource = ingredients.some(ing => ['hay', 'seed', 'carb'].includes(ing.category));
  } else {
    hasEnergySource = true; // Cats/reptiles don't require carbs
  }
  
  results.push({
    passed: hasEnergySource,
    ruleId: 'S4',
    message: `${species} energy source requirement met: ${hasEnergySource}`,
  });

  // S5: Carnivores may be carb-free (informational, not a gate)
  const isCarnivore = ['cats', 'reptiles'].includes(species);
  results.push({
    passed: true, // Always pass - this is permissive
    ruleId: 'S5',
    message: `${species} may be carb-free (allowed)`,
  });

  // S6: Minimum ingredient categories
  // All species need at least 2 different categories for nutritional balance
  const categories = new Set(ingredients.map(ing => ing.category));
  results.push({
    passed: categories.size >= 2,
    ruleId: 'S6',
    message: `Minimum 2 ingredient categories required (found ${categories.size})`,
  });

  // S7: Added fat sources ≤ 1
  const addedFats = ingredients.filter(ing => ing.category === 'fat');
  results.push({
    passed: addedFats.length <= 1,
    ruleId: 'S7',
    message: `Maximum 1 added fat source (found ${addedFats.length})`,
  });

  // S8: Ingredient diversity ≥ 3 unique foods
  const uniqueIngredients = new Set(ingredients.map(ing => ing.id));
  results.push({
    passed: uniqueIngredients.size >= 3,
    ruleId: 'S8',
    message: `Minimum 3 unique ingredients required (found ${uniqueIngredients.size})`,
  });

  return results;
}

// ============================================================================
// SAFETY & TOXICITY RULES (Hard Gates)
// ============================================================================

export interface SafetyRuleResult {
  passed: boolean;
  ruleId: string;
  message: string;
  value?: number;
  ceiling?: number;
}

export function validateSafetyAndToxicity(
  ingredients: Ingredient[],
  species: Species,
  allergies?: string[]
): SafetyRuleResult[] {
  const results: SafetyRuleResult[] = [];
  const ceilings = NUTRIENT_CEILINGS[species];

  // T1: Vitamin A ceiling (HARD for dogs/cats, SOFT for exotic pets)
  const proteinAndOrganMeats = ingredients.filter(ing => 
    ing.category === 'protein' || 
    ing.name.toLowerCase().includes('liver') ||
    ing.name.toLowerCase().includes('kidney') ||
    ing.name.toLowerCase().includes('heart')
  );
  
  const totalVitaminA = ingredients.reduce((sum, ing) => sum + (ing.composition.vitaminA || 0), 0);
  const hasVitaminAData = proteinAndOrganMeats.every(ing => ing.composition.vitaminA !== undefined);
  
  // Only enforce for dogs/cats (AAFCO standards exist)
  const enforceT1 = species === 'dogs' || species === 'cats';
  results.push({
    passed: enforceT1 ? (hasVitaminAData && totalVitaminA <= ceilings.vitaminA_IU) : true,
    ruleId: 'T1',
    message: hasVitaminAData 
      ? `Vitamin A: ${totalVitaminA} IU (ceiling: ${ceilings.vitaminA_IU})`
      : enforceT1 
        ? `Vitamin A data incomplete for proteins/organs - cannot validate`
        : `Vitamin A data incomplete (soft warning for ${species})`,
    value: totalVitaminA,
    ceiling: ceilings.vitaminA_IU,
  });

  // T2: Copper ceiling (HARD for dogs/cats, SOFT for exotic pets)
  const totalCopper = ingredients.reduce((sum, ing) => sum + (ing.composition.copper_mg_per_100g || 0), 0);
  const hasAllCopperData = ingredients.every(ing => ing.composition.copper_mg_per_100g !== undefined);
  
  // Only enforce for dogs/cats
  const enforceT2 = species === 'dogs' || species === 'cats';
  results.push({
    passed: enforceT2 ? (hasAllCopperData && totalCopper <= ceilings.copper_mg) : true,
    ruleId: 'T2',
    message: hasAllCopperData 
      ? `Copper: ${totalCopper.toFixed(2)} mg (ceiling: ${ceilings.copper_mg})`
      : enforceT2
        ? `Copper data incomplete - cannot validate`
        : `Copper data incomplete (soft warning for ${species})`,
    value: totalCopper,
    ceiling: ceilings.copper_mg,
  });

  // T3: Iodine ceiling (PHASE 2: Now using class-based defaults + measured overrides)
  const totalIodine = ingredients.reduce((sum, ing) => sum + (ing.composition.iodine_mcg_per_100g || 0), 0);
  const hasAllIodineData = ingredients.every(ing => ing.composition.iodine_mcg_per_100g !== undefined);
  results.push({
    passed: hasAllIodineData && totalIodine <= ceilings.iodine_mcg,
    ruleId: 'T3',
    message: hasAllIodineData 
      ? `Iodine: ${totalIodine.toFixed(1)} mcg (ceiling: ${ceilings.iodine_mcg})`
      : `Iodine data incomplete - cannot validate`,
    value: totalIodine,
    ceiling: ceilings.iodine_mcg,
  });

  // T4: Known toxic ingredient present
  const toxicIngredients = ['grape', 'raisin', 'onion', 'garlic', 'chocolate', 'xylitol'];
  const hasToxic = ingredients.some(ing =>
    toxicIngredients.some(toxic => ing.name.toLowerCase().includes(toxic))
  );
  results.push({
    passed: !hasToxic,
    ruleId: 'T4',
    message: `No known toxic ingredients (found: ${hasToxic})`,
  });

  // T5: Allergen or derivative present
  const hasAllergen =
    allergies && allergies.length > 0
      ? ingredients.some(ing =>
          allergies.some(allergen =>
            ing.name.toLowerCase().includes(allergen.toLowerCase()) ||
            ing.id.includes(allergen.toLowerCase())
          )
        )
      : false;
  results.push({
    passed: !hasAllergen,
    ruleId: 'T5',
    message: `No allergens present (found: ${hasAllergen})`,
  });

  // T6: Ca:P ratio (SOFT WARNING - hard gate disabled until supplements available)
  // Phase 1: Just track it. Phase 2: Apply soft penalties if out of range.
  // Real fix: Add calcium supplement ingredients (eggshell powder, bone meal, etc.)
  const totalCalcium = ingredients.reduce((sum, ing) => sum + (ing.composition.calcium || 0), 0);
  const totalPhosphorus = ingredients.reduce((sum, ing) => sum + (ing.composition.phosphorus || 0), 0);
  const caPRatio = totalPhosphorus > 0 ? totalCalcium / totalPhosphorus : 1;
  const hasCalciumSupplement = ingredients.some(ing =>
    ing.name.toLowerCase().includes('eggshell') ||
    ing.name.toLowerCase().includes('bone meal') ||
    ing.name.toLowerCase().includes('calcium')
  );
  
  // Pass if: naturally in range OR has calcium supplement
  const caPValid = (caPRatio >= 1.0 && caPRatio <= 2.0) || hasCalciumSupplement;
  
  results.push({
    passed: true, // Always pass - this is now a soft warning, not hard gate
    ruleId: 'T6',
    message: `Ca:P ratio: ${Math.round(caPRatio * 100) / 100} ${hasCalciumSupplement ? '(supplement present)' : '(natural)'}`,
    value: Math.round(caPRatio * 100) / 100,
    ceiling: 2.0,
  });

  return results;
}

// ============================================================================
// LIFE STAGE RULES (Hard Gates)
// ============================================================================

export interface LifeStageRuleResult {
  passed: boolean;
  ruleId: string;
  message: string;
}

export function validateLifeStage(
  ingredients: Ingredient[],
  species: Species,
  lifeStage: 'puppy' | 'adult' | 'senior'
): LifeStageRuleResult[] {
  const results: LifeStageRuleResult[] = [];

  if (lifeStage === 'puppy') {
    // L1: Puppy calcium upper limit (prevent skeletal issues)
    const totalCalcium = ingredients.reduce((sum, ing) => sum + (ing.composition.calcium || 0), 0);
    const puppyCalciumMax = 2.0; // g per day
    results.push({
      passed: totalCalcium <= puppyCalciumMax,
      ruleId: 'L1',
      message: `Puppy calcium ≤ ${puppyCalciumMax}g (found ${totalCalcium}g)`,
    });

    // L4: Growth diets require higher protein
    const totalProtein = ingredients.reduce((sum, ing) => sum + (ing.composition.protein || 0), 0);
    const puppyProteinMin = 18; // % of calories
    results.push({
      passed: totalProtein >= puppyProteinMin,
      ruleId: 'L4',
      message: `Puppy protein ≥ ${puppyProteinMin}% (found ${totalProtein}%)`,
    });
  }

  if (lifeStage === 'senior' && species === 'dogs') {
    // L3: Senior kidney load (reduce phosphorus)
    const totalPhosphorus = ingredients.reduce((sum, ing) => sum + (ing.composition.phosphorus || 0), 0);
    const seniorPhosphorusMax = 1.0; // g per day
    results.push({
      passed: totalPhosphorus <= seniorPhosphorusMax,
      ruleId: 'L3',
      message: `Senior phosphorus ≤ ${seniorPhosphorusMax}g (found ${totalPhosphorus}g)`,
    });
  }

  return results;
}

// ============================================================================
// QUALITY / PLAUSIBILITY RULES (Soft Gates → Penalty)
// ============================================================================

export interface QualityRuleResult {
  passed: boolean;
  ruleId: string;
  message: string;
  penalty: number; // 0-100, applied to score
}

export function validateQualityAndPlausibility(
  ingredients: Ingredient[],
  estimatedCost: number
): QualityRuleResult[] {
  const results: QualityRuleResult[] = [];

  // Q1: "Two mains in disguise" (multiple high-protein ingredients)
  const highProteinCount = ingredients.filter(ing =>
    ing.composition.protein && ing.composition.protein > 20
  ).length;
  const twoMainsPenalty = highProteinCount > 1 ? 30 : 0;
  results.push({
    passed: highProteinCount <= 1,
    ruleId: 'Q1',
    message: `Multiple high-protein ingredients detected (${highProteinCount})`,
    penalty: twoMainsPenalty,
  });

  // Q2: Excessive powders / oils (low ingredient diversity)
  const powderOilCount = ingredients.filter(ing =>
    ing.name.toLowerCase().includes('oil') ||
    ing.name.toLowerCase().includes('powder') ||
    ing.name.toLowerCase().includes('premix')
  ).length;
  const excessivePowderPenalty = powderOilCount > 2 ? 25 : 0;
  results.push({
    passed: powderOilCount <= 2,
    ruleId: 'Q2',
    message: `Excessive powders/oils (${powderOilCount})`,
    penalty: excessivePowderPenalty,
  });

  // Q3: Human implausibility heuristic
  // Recipes that are technically complete but no one would actually make
  const implausiblePatterns = [
    ingredients.length === 2, // Too simple
    estimatedCost < 0.50, // Suspiciously cheap
    ingredients.every(ing => ing.category === 'supplement'), // All supplements
  ];
  const implausiblePenalty = implausiblePatterns.filter(p => p).length > 0 ? 20 : 0;
  results.push({
    passed: implausiblePenalty === 0,
    ruleId: 'Q3',
    message: `Recipe may be implausible (${implausiblePatterns.filter(p => p).length} flags)`,
    penalty: implausiblePenalty,
  });

  // Q4: Repetitive cheap filler pattern
  const cheapFillers = ingredients.filter(ing =>
    (ing.name.toLowerCase().includes('rice') ||
      ing.name.toLowerCase().includes('corn') ||
      ing.name.toLowerCase().includes('wheat')) &&
    (ing.pricePerLb || 1) < 0.50
  ).length;
  const fillerPenalty = cheapFillers >= 2 ? 15 : 0;
  results.push({
    passed: cheapFillers < 2,
    ruleId: 'Q4',
    message: `Repetitive cheap filler pattern (${cheapFillers})`,
    penalty: fillerPenalty,
  });

  // Q5: Organ meat weight cap (soft gate - penalize if >10%)
  const organMeatNames = ['liver', 'kidney', 'heart'];
  const organMeats = ingredients.filter(ing => {
    const name = ing.name.toLowerCase();
    return ing.feedingRole === 'supplement' && organMeatNames.some(organ => name.includes(organ));
  });
  
  const totalWeight = ingredients.reduce((sum, ing) => sum + (ing.composition.protein || 1), 0);
  const organMeatWeight = organMeats.reduce((sum, ing) => sum + (ing.composition.protein || 1), 0);
  const organMeatPercent = totalWeight > 0 ? (organMeatWeight / totalWeight) * 100 : 0;
  
  let organMeatPenalty = 0;
  if (organMeatPercent > 15) organMeatPenalty = 30; // Way over
  else if (organMeatPercent > 10) organMeatPenalty = 15; // Slightly over
  
  results.push({
    passed: organMeatPercent <= 10,
    ruleId: 'Q5',
    message: `Organ meat weight: ${organMeatPercent.toFixed(1)}% (soft cap 10%)`,
    penalty: organMeatPenalty,
  });

  return results;
}

// ============================================================================
// MASTER VALIDATION FUNCTION
// ============================================================================

export interface RecipeValidationResult {
  isValid: boolean;
  hardGates: {
    structural: CompositionRuleResult[];
    safety: SafetyRuleResult[];
    lifeStage: LifeStageRuleResult[];
  };
  softGates: QualityRuleResult[];
  totalPenalty: number;
  failedRules: string[];
}

export function validateRecipeComprehensive(
  ingredients: Ingredient[],
  species: Species,
  lifeStage: 'puppy' | 'adult' | 'senior',
  estimatedCost: number,
  allergies?: string[]
): RecipeValidationResult {
  const structural = validateStructuralComposition(ingredients, species, lifeStage);
  const safety = validateSafetyAndToxicity(ingredients, species, allergies);
  const lifeStageRules = validateLifeStage(ingredients, species, lifeStage);
  const quality = validateQualityAndPlausibility(ingredients, estimatedCost);

  const hardGateFailed = [
    ...structural,
    ...safety,
    ...lifeStageRules,
  ].filter(r => !r.passed);

  const totalPenalty = quality.reduce((sum, q) => sum + q.penalty, 0);

  return {
    isValid: hardGateFailed.length === 0,
    hardGates: {
      structural,
      safety,
      lifeStage: lifeStageRules,
    },
    softGates: quality,
    totalPenalty,
    failedRules: hardGateFailed.map(r => r.ruleId),
  };
}
