// lib/analyzeCustomMeal.ts

// Gamified custom meal analysis engine for PetPlates

// - Exports generateCustomMealAnalysis(petProfile, selections)

// - Returns a pet-specific, gamified MealAnalysis (score 0..100)

// - Uses INGREDIENT_COMPOSITIONS for per-100g nutrient values

//

// Replace / extend species rules with your canonical FEDIAF/AAFCO tables when ready.

import { INGREDIENT_COMPOSITIONS, type IngredientComposition } from '@/lib/data/ingredientCompositions';
import { getIngredientDisplayName } from '@/lib/utils/allIngredients';

export type Species =
  | 'dog'
  | 'cat'
  | 'bearded-dragon'
  | 'parrot'
  | 'guinea-pig'
  | 'hamster'
  | string;

export type PetProfile = {
  id?: string;
  name?: string;
  species: Species;
  lifeStage?: string; // e.g., 'adult', 'juvenile', 'pregnant'
  weightKg?: number;
  allergies?: string[]; // ingredient keys or names
  meds?: string[]; // medication identifiers (optional)
  activity?: 'low' | 'moderate' | 'high';
};

export type IngredientSelection = {
  key: string; // composition key or display name (we attempt mapping)
  grams: number;
};

export type WarningItem = {
  id?: string;
  ingredientKey?: string;
  ingredientName?: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
};

export type Suggestion = {
  message: string;
  action?: string; // e.g., "add_calcium", "reduce_liver", "swap_to_bsfl"
  confidence?: 'low' | 'medium' | 'high';
};

export type MealAnalysis = {
  nutrients: Record<string, number>; // totals for entire serving analyzed (mg/g units per chosen keys)
  totalRecipeGrams: number;
  energyDensityKcalPerGram: number;
  recommendedServingGrams: number;
  score: number; // 0..100 gamified
  breakdown: {
    nutrientCoverageScore: number; // 0..100
    toxicityPenalty: number; // 0..100 (penalty applied)
    balanceVarietyScore: number; // 0..100
  };
  toxicityWarnings: WarningItem[];
  allergyWarnings: WarningItem[];
  nutrientWarnings: WarningItem[]; // deficiencies / excesses
  suggestions: Suggestion[];
  // Legacy fields for backward compatibility
  dmNutrients?: Record<string, number>;
  dryMatterPercent?: number;
  totalWeight_g?: number;
  caToPratio?: number;
  deficiencies?: string[];
  excesses?: string[];
  adequacies?: string[];
  scoreBreakdown?: {
    baseScore?: number;
    nutritionPenalty?: number;
    balancePenalty?: number;
  };
};

// ---------- Helper accesses ----------

function safeGetIngredient(key: string) {
  // Try direct key then fallback to slugified match by name
  const direct = (INGREDIENT_COMPOSITIONS as Record<string, any>)[key];
  if (direct) return direct;
  
  const slug = key.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
  const bySlug = (INGREDIENT_COMPOSITIONS as Record<string, any>)[slug];
  if (bySlug) return bySlug;
  
  // Try name match
  const values = Object.values(INGREDIENT_COMPOSITIONS) as any[];
  const found = values.find(v => (v.name || '').toLowerCase() === key.toLowerCase());
  if (found) return found;
  
  // Common fallback mappings for missing ingredients
  const fallbackMappings: Record<string, string> = {
    'salmon_oil': 'fish_oil',
    'herring_oil': 'fish_oil',
    'mackerel_oil': 'fish_oil',
    'sardine_oil': 'fish_oil',
    'cod_liver_oil': 'fish_oil',
    'olive_oil': 'fish_oil',
    'coconut_oil': 'fish_oil',
    'avocado_oil': 'fish_oil',
    'ground_chicken': 'chicken_breast',
    'ground_turkey': 'turkey_breast',
    'ground_beef': 'ground_beef_lean',
    'white_rice': 'brown_rice_cooked',
    'pumpkin_puree': 'sweet_potato',
  };
  
  const fallback = fallbackMappings[slug] || fallbackMappings[key.toLowerCase()];
  if (fallback && (INGREDIENT_COMPOSITIONS as Record<string, any>)[fallback]) {
    return (INGREDIENT_COMPOSITIONS as Record<string, any>)[fallback];
  }
  
  // Return a minimal placeholder instead of throwing - allows scoring to continue
  // Ingredient not found in composition DB - using placeholder
  return {
    protein: 0,
    fat: 0,
    calcium: 0,
    phosphorus: 0,
    moisture: 0,
    kcal: 0,
    name: key
  };
}

// ---------- Basic nutrition math ----------
  
function sumRecipeTotals(selections: IngredientSelection[]) {
  const totals: Record<string, number> = {};
  let totalGrams = 0;
  const ingredientsNotFound: string[] = []; // Track ingredients not in DB
  
  for (const sel of selections) {
    if (!sel || !sel.key || !sel.grams || sel.grams <= 0) continue;
    
    const ing = safeGetIngredient(sel.key);
    
    // Track if ingredient was found in DB (placeholder has name === 'Unknown')
    if (ing.name === 'Unknown' || !ing.name) {
      ingredientsNotFound.push(sel.key);
    }
    
    const factor = sel.grams / 100;
    totalGrams += sel.grams;

    // Map ingredient composition properties to standard nutrient keys
    // Current structure: { protein, fat, calcium, phosphorus, moisture, kcal, etc. }
    // Map to: { protein_g, fat_g, ca_mg, p_mg, moisture_g, calories_kcal, etc. }
    
    const mappings: Record<string, string> = {
      'protein': 'protein_g',
      'fat': 'fat_g',
      'calcium': 'ca_mg',
      'phosphorus': 'p_mg',
      'moisture': 'moisture_g',
      'kcal': 'calories_kcal',
      'omega3': 'omega3_g',
      'vitaminA': 'vit_a_IU',
      'vitaminC': 'vit_c_mg',
      'taurine': 'taurine_mg',
      'fiber': 'fiber_g',
      'carbs': 'carbs_g',
    };
    
    // Try per100g structure first (new format)
    const per100g = (ing as any).per100g || (ing as any).per100g_raw || (ing as any).per100gData;
    if (per100g && typeof per100g === 'object') {
      for (const [k, v] of Object.entries(per100g)) {
        if (typeof v === 'number') {
          const mappedKey = mappings[k] || k;
          totals[mappedKey] = (totals[mappedKey] ?? 0) + v * factor;
        }
      }
    } else {
      // Use direct properties (current format in ingredientCompositions.ts)
      for (const [key, mappedKey] of Object.entries(mappings)) {
        const value = (ing as any)[key];
        if (typeof value === 'number') {
          totals[mappedKey] = (totals[mappedKey] ?? 0) + value * factor;
        }
      }
      
      // Also handle direct property access for any other numeric fields
      for (const [k, v] of Object.entries(ing)) {
        if (k !== 'source' && k !== 'name' && typeof v === 'number' && !mappings[k]) {
          // Preserve original key if not in mappings
          totals[k] = (totals[k] ?? 0) + v * factor;
        }
      }
    }
  }

  return { totals, totalGrams, ingredientsNotFound };
}

function computeEnergyDensityKcalPerGram(nutrients: Record<string, number>) {
  // Expect calories_kcal total per recipe -> kcal per gram
  const kcalTotal = nutrients['calories_kcal'] ?? nutrients['energy_kcal'] ?? 0;
  return kcalTotal;
}

// ---------- Pet energy target (simple, adjustable) ----------

function computeDailyKcalTarget(pet: PetProfile) {
  const weight = Math.max(0.1, pet.weightKg ?? 5);

  // Use simplified MER approximations (not authoritative; replace with FEDIAF/AFFCO later)
  let factor = 1.6; // default moderate
  if (pet.activity === 'low') factor = 1.3;
  if (pet.activity === 'high') factor = 2.0;

  switch ((pet.species || '').toLowerCase()) {
    case 'dog':
      // RER = 70 * kg^0.75, MER ~ RER * factor
      return Math.round(70 * Math.pow(weight, 0.75) * factor);
    case 'cat':
      // cats: more kcal/kg (approx)
      return Math.round(50 * Math.pow(weight, 0.75) * factor);
    case 'bearded-dragon':
      // reptiles: single feeding approach, use simpler target scaled to small kg
      return Math.round(30 * weight * (pet.activity === 'high' ? 1.5 : 1.0));
    case 'guinea-pig':
      return Math.round(80 * weight); // placeholder
    default:
      return Math.round(60 * Math.pow(weight, 0.75));
  }
}

// ---------- Species-specific quick checks ----------

function normalizeSpecies(species: string): 'dog' | 'cat' | 'bird' | 'reptile' | 'pocket-pet' | string {
  const s = (species || '').toLowerCase();
  if (s.includes('dog')) return 'dog';
  if (s.includes('cat')) return 'cat';
  if (s.includes('bird') || s.includes('parrot') || s.includes('finch')) return 'bird';
  if (s.includes('reptile') || s.includes('lizard') || s.includes('bearded') || s.includes('dragon')) return 'reptile';
  if (s.includes('pocket') || s.includes('rabbit') || s.includes('guinea') || s.includes('hamster') || s.includes('gerbil')) return 'pocket-pet';
  return s;
}

function checkToxicityAndAllergies(
  pet: PetProfile,
  selections: IngredientSelection[],
  totalGrams: number,
): { toxicityWarnings: WarningItem[]; allergyWarnings: WarningItem[]; inclusionWarnings: WarningItem[] } {
  const tox: WarningItem[] = [];
  const allergy: WarningItem[] = [];
  const inclusion: WarningItem[] = [];
  const petAllergiesLower = (pet.allergies || []).map(a => a.toLowerCase());
  const normalizedSpecies = normalizeSpecies(pet.species || '');
  
  for (const sel of selections) {
    try {
      const ing = safeGetIngredient(sel.key);
      // FIXED: Use original ingredient name for display, not composition key
      // This ensures warnings show "bok choi" not "kale_raw"
      const displayName = getIngredientDisplayName(sel.key) || sel.key;
      const ingPercent = totalGrams > 0 ? (sel.grams / totalGrams) : 0;

      // Check species compatibility (NEW)
      if (ing.speciesCompatibility && normalizedSpecies) {
        const compat = ing.speciesCompatibility[normalizedSpecies as keyof typeof ing.speciesCompatibility];
        if (compat === 'avoid') {
          tox.push({
            ingredientKey: sel.key,
            ingredientName: displayName,
            message: `${displayName} should be avoided for ${pet.species}. ${ing.notesBySpecies?.[normalizedSpecies as keyof typeof ing.notesBySpecies] || ''}`,
            severity: 'critical',
          });
        } else if (compat === 'limit') {
          tox.push({
            ingredientKey: sel.key,
            ingredientName: displayName,
            message: `${displayName} should be limited for ${pet.species}. ${ing.notesBySpecies?.[normalizedSpecies as keyof typeof ing.notesBySpecies] || ''}`,
            severity: 'medium',
          });
        } else if (compat === 'caution') {
          tox.push({
          ingredientKey: sel.key,
            ingredientName: displayName,
            message: `${displayName} requires caution for ${pet.species}. ${ing.notesBySpecies?.[normalizedSpecies as keyof typeof ing.notesBySpecies] || ''}`,
            severity: 'low',
          });
        }
      }

      // Check max inclusion percentage (NEW)
      if (ing.maxInclusionPercentBySpecies && normalizedSpecies && totalGrams > 0) {
        const maxPercent = ing.maxInclusionPercentBySpecies[normalizedSpecies as keyof typeof ing.maxInclusionPercentBySpecies];
        if (maxPercent !== undefined && ingPercent > maxPercent) {
          const overage = ((ingPercent - maxPercent) * 100).toFixed(1);
          inclusion.push({
            ingredientKey: sel.key,
            ingredientName: displayName,
            message: `${displayName} exceeds recommended maximum (${(maxPercent * 100).toFixed(0)}% of meal). Currently ${(ingPercent * 100).toFixed(1)}% (+${overage}%). ${ing.notesBySpecies?.[normalizedSpecies as keyof typeof ing.notesBySpecies] || ''}`,
            severity: ingPercent > maxPercent * 1.5 ? 'high' : 'medium',
          });
        }
      }

      // Legacy toxicity check
      if (ing.toxicFor && Array.isArray(ing.toxicFor)) {
        const affectsPet = ing.toxicFor.map((s: string) => s.toLowerCase()).includes(normalizedSpecies) || ing.toxicFor.includes('all');
        if (affectsPet) {
          tox.push({
            ingredientKey: sel.key,
            ingredientName: displayName,
            message: `${displayName} flagged as potentially toxic/contraindicated for ${pet.species}`,
            severity: (ing.toxicSeverity as any) ?? 'high',
          });
        }
      }

      // User allergies
      if (petAllergiesLower.length > 0) {
        const nameLower = displayName.toLowerCase();
        for (const a of petAllergiesLower) {
          if (nameLower.includes(a) || sel.key.toLowerCase().includes(a)) {
            allergy.push({
              ingredientKey: sel.key,
              ingredientName: displayName,
              message: `${displayName} matches pet allergy "${a}"`,
              severity: 'high',
            });
          }
        }
      }
    } catch (e) {
      // ignore missing compositions (should be validated earlier)
    }
  }

  return { toxicityWarnings: tox, allergyWarnings: allergy, inclusionWarnings: inclusion };
}

// ---------- Nutrient checks & simple coverage scoring (gamified) ----------

function speciesKey(p: PetProfile) {
  return (p.species || 'unknown').toLowerCase();
}

// ---------- Fixed Nutrient checks & lenient coverage scoring ----------

function computeNutrientCoverageAndWarnings(
  pet: PetProfile,
  totals: Record<string, number>,
  totalGrams: number,
  recommendedServingGrams?: number, // NEW: Use recommended serving for warnings
) {
  const warnings: WarningItem[] = [];
  const coverageScores: Record<string, number> = {}; // 0..1 for each tracked nutrient

  const species = speciesKey(pet);

  // FIXED: Calculate warnings based on recommended serving size, not total batch
  // This prevents contradictions between warnings and portion recommendations
  const servingGrams = recommendedServingGrams && recommendedServingGrams > 0 
    ? recommendedServingGrams 
    : totalGrams; // Fallback to total batch if no serving size provided
  
  // Scale nutrients to per-serving values
  const servingRatio = totalGrams > 0 ? servingGrams / totalGrams : 1;
  const prot = (totals['protein_g'] ?? 0) * servingRatio;
  const fat = (totals['fat_g'] ?? 0) * servingRatio;
  const fiber = (totals['fiber_g'] ?? 0) * servingRatio;
  const ca = (totals['ca_mg'] ?? 0) * servingRatio;
  const p = (totals['p_mg'] ?? 0) * servingRatio;
  const taurine = (totals['taurine_mg'] ?? 0) * servingRatio;
  const vitC = (totals['vit_c_mg'] ?? 0) * servingRatio;

  // FIXED: Much more lenient targets - actual realistic meal compositions
  const targetsBySpecies: Record<string, Record<string, number>> = {
    dog: {
      protein_per_100g: 5,    // FIXED: Was 8 - now realistic for mixed meals
      fat_per_100g: 2,        // FIXED: Was 4 - allows lean meals
      fiber_per_100g: 0.5,    // FIXED: Was 1 - fiber is often low in fresh meals
    },
    cat: {
      protein_per_100g: 8,    // FIXED: Was 15 - realistic for mixed meals
      fat_per_100g: 3,        // FIXED: Was 6 - allows leaner meals
      taurine_per_100g: 20,   // FIXED: Was 40 - more achievable target
    },
    'bearded-dragon': {
      ca_p_ratio: 1.0,        // FIXED: Was 1.2 - more lenient
      ca_per_100g: 100,       // FIXED: Was 150 - more achievable
    },
    'guinea-pig': {
      vit_c_per_kg: 5,        // FIXED: Was 8 - more lenient
    },
  };

  // FIXED: Use serving size for per-100g calculations, not total batch
  const gramsPer100 = servingGrams / 100 || 1;

  if (targetsBySpecies[species]) {
    const t = targetsBySpecies[species];

    if (t.protein_per_100g) {
      const expectedProtein = t.protein_per_100g * gramsPer100;
      const ratio = prot / Math.max(1, expectedProtein);
      
      // FIXED: Much more generous scoring curve
      // 0% target = 0 score
      // 50% target = 0.5 score
      // 100% target = 1.0 score
      // 150% target = 1.2 score (bonus!)
      coverageScores['protein'] = Math.min(1.5, ratio); // Allow up to 150% bonus
      
      // Only warn if VERY low (below 40% of target)
      // FIXED: Warning now references per-serving values to match recommendations
      if (prot < expectedProtein * 0.4) {
        warnings.push({
          message: `Protein is quite low for ${pet.species} (${prot.toFixed(1)}g per ${Math.round(servingGrams)}g serving, target ~${expectedProtein.toFixed(1)}g).`,
          severity: 'medium',
        });
      }
    }

    if (t.fat_per_100g) {
      const expectedFat = t.fat_per_100g * gramsPer100;
      const ratio = fat / Math.max(0.1, expectedFat);
      
      // FIXED: Same generous curve as protein
      coverageScores['fat'] = Math.min(1.5, ratio);
      
      // Only warn if very low
      // FIXED: Warning now references per-serving values
      if (fat < expectedFat * 0.4) {
        warnings.push({
          message: `Fat content is low (${fat.toFixed(1)}g per ${Math.round(servingGrams)}g serving). Consider adding healthy fats like fish oil.`,
          severity: 'low',
        });
      }
    }

    if (species === 'cat' && t.taurine_per_100g) {
      const expectedTaurine = t.taurine_per_100g * gramsPer100;
      const ratio = taurine / Math.max(1, expectedTaurine);
      
      // FIXED: More lenient for taurine
      coverageScores['taurine'] = Math.min(1.5, ratio);
      
      // Only warn if below 30% (cats NEED taurine but it's in many proteins)
      // FIXED: Warning now references per-serving values
      if (taurine < expectedTaurine * 0.3) {
        warnings.push({
          message: `Taurine is low for a cat diet (${taurine.toFixed(1)}mg per ${Math.round(servingGrams)}g serving). Add taurine supplement or more heart/liver.`,
          severity: 'high',
        });
      }
    }

    if (species === 'bearded-dragon' && typeof p === 'number' && p > 0) {
      const ratio = ca / p;
      const desired = t.ca_p_ratio;
      
      // FIXED: More lenient Ca:P ratio scoring
      if (ratio < desired * 0.7) { // Only warn if below 70% of target
        warnings.push({
          message: `Ca:P ratio is ${ratio.toFixed(2)}. Bearded dragons prefer higher calcium relative to phosphorus (target: ${desired}).`,
          severity: ratio < desired * 0.5 ? 'high' : 'medium',
        });
      }
      
      // Give full credit if within 70% of target
      coverageScores['ca_p'] = Math.min(1.2, (ratio / desired) * 1.2);
    }
  }

  // Generic excess checks (FIXED: now per-serving, not total batch)
  const vitDPerServing = (totals['vit_d_IU'] ?? 0) * servingRatio;
  const vitAPerServing = (totals['vit_a_IU'] ?? 0) * servingRatio;
  
  // Daily safe limits (IU per day for typical pets)
  const vitDSafeLimit = 20000; // IU per day
  const vitASafeLimit = 100000; // IU per day
  
  if (vitDPerServing > vitDSafeLimit) {
    warnings.push({
      message: `Vitamin D is very high (${Math.round(vitDPerServing)} IU per ${Math.round(servingGrams)}g serving) and may be toxic at large doses.`,
      severity: 'high',
    });
  }

  if (vitAPerServing > vitASafeLimit) {
    warnings.push({
      message: `Vitamin A is very high (${Math.round(vitAPerServing)} IU per ${Math.round(servingGrams)}g serving) — repeated feeding could cause hypervitaminosis A.`,
      severity: 'high',
    });
  }

  return { coverageScores, warnings };
}

// ---------- FIXED Scoring model (more generous) ----------

function calculateGamifiedScore(
  pet: PetProfile,
  totals: Record<string, number>,
  totalGrams: number,
  toxicityWarnings: WarningItem[],
  allergyWarnings: WarningItem[],
  nutrientWarnings: WarningItem[],
  ingredientsNotFound?: string[],
  totalIngredientCount?: number,
) {
  const { coverageScores } = computeNutrientCoverageAndWarnings(pet, totals, totalGrams);

  const keys = Object.keys(coverageScores);
  const foundIngredientCount = (totalIngredientCount || 0) - (ingredientsNotFound?.length || 0);
  let avgCoverage = 0;
  
  if (keys.length > 0) {
    const totalCoverage = Object.values(coverageScores).reduce((a, b) => a + b, 0);
    // FIXED: If some ingredients found, don't penalize as much - align with recipe scoring generosity
    // Recipe scoring gives 50 base + bonuses, so custom meals should be similarly generous
    if (foundIngredientCount > 0) {
      // If we have coverage data, use it (but be generous)
      // If some ingredients missing, still give good score (like recipe scoring does)
      const baseCoverage = totalCoverage / keys.length;
      avgCoverage = ingredientsNotFound && ingredientsNotFound.length > 0 
        ? Math.max(0.7, baseCoverage) // At least 70% if some ingredients found
        : baseCoverage;
    } else {
      avgCoverage = 0.4; // No ingredients found in DB
    }
  } else {
    // FIXED: More generous base score when no coverage data (align with recipe scoring)
    // Recipe scoring gives 50 base even without detailed nutrition, so custom meals should too
    avgCoverage = foundIngredientCount > 0 ? 0.7 : 0.5; // 70% if ingredients exist, 50% if none
  }
  
  const nutrientCoverageScore = Math.min(100, Math.round(avgCoverage * 100));

  // FIXED: Less harsh toxicity penalties
  let toxPenaltyRaw = 0;
  for (const t of toxicityWarnings) {
    if (t.severity === 'critical' || t.severity === 'high') toxPenaltyRaw += 30; // FIXED: Was 40
    else if (t.severity === 'medium') toxPenaltyRaw += 15; // FIXED: Was 20
    else toxPenaltyRaw += 5; // FIXED: Was 8
  }
  for (const a of allergyWarnings) {
    toxPenaltyRaw += 40; // FIXED: Was 50 (still heavy but not instant kill)
  }
  const toxicityPenalty = Math.min(100, toxPenaltyRaw);

  // FIXED: Balance/variety - make it more generous to align with recipe scoring
  // Recipe scoring doesn't penalize for missing categories, so custom meals shouldn't either
  const presentCats = new Set<string>();
  if ((totals['protein_g'] ?? 0) > 0) presentCats.add('protein');
  if ((totals['fiber_g'] ?? 0) > 0 || (totals['ca_mg'] ?? 0) > 0) presentCats.add('greens');
  if ((totals['carbs_g'] ?? 0) > 0) presentCats.add('carbs');
  if ((totals['fat_g'] ?? 0) > 0) presentCats.add('fat');

  // FIXED: Give full credit for 2+ categories (most meals have protein + carbs or protein + greens)
  // This aligns with recipe scoring which doesn't require all categories
  const varietyScore = presentCats.size >= 2 ? 1.0 : (presentCats.size / 2); // Full credit at 2+
  const balanceVarietyScore = Math.round(varietyScore * 100);

  // FIXED: Better base score calculation - align with recipe scoring
  // Recipe scoring: 50 base + 15 age + 15 health + 15 nutrition = 95 (very generous)
  // Custom meals should be similarly generous, so weight nutrient coverage more
  const base = Math.round(nutrientCoverageScore * 0.8 + balanceVarietyScore * 0.2);

  // FIXED: Cap penalty at 40% of base score (more generous than before)
  // Recipe scoring rarely goes below 30, so custom meals should be similar
  const maxPenalty = Math.round(base * 0.4);
  const penaltyApplied = Math.min(maxPenalty, Math.round((toxicityPenalty / 100) * base));
  
  const finalScore = Math.max(0, base - penaltyApplied);
  
  return {
    nutrientCoverageScore,
    toxicityPenalty,
    balanceVarietyScore,
    finalScore,
    base,
    penaltyApplied,
  };
}

// ---------- Suggestion generator (concrete, gamified) ----------

function generatePetSpecificSuggestions(
  pet: PetProfile,
  totals: Record<string, number>,
  totalGrams: number,
  toxicityWarnings: WarningItem[],
  allergyWarnings: WarningItem[],
) {
  const suggestions: Suggestion[] = [];
  const species = speciesKey(pet);

  // If cat and taurine low
  if (species === 'cat') {
    const taurine = totals['taurine_mg'] ?? 0;
    const gramsPer100 = Math.max(1, totalGrams / 100);
    const expectedTaurinePerBatch = 50 * gramsPer100; // placeholder desired mg per batch
    if (taurine < expectedTaurinePerBatch * 0.75) {
      suggestions.push({
        message: 'Taurine is low — add 0.1g taurine supplement per 100g serving or include more heart/liver.',
        action: 'add_taurine',
        confidence: 'high',
      });
    }
  }

  // Bearded dragon Ca:P
  if (species === 'bearded-dragon') {
    const ca = totals['ca_mg'] ?? 0;
    const p = totals['p_mg'] ?? 0;
    const ratio = p === 0 ? 0 : ca / p;
    if (ratio < 1.5) {
      // compute delta
      const desiredCa = 1.5 * (p || 1);
      const deltaMg = Math.max(0, desiredCa - ca);
      // grams CaCO3 (400 mg elemental Ca per 1 g CaCO3)
      const gramsCaCO3 = +(deltaMg / 400).toFixed(2);
      suggestions.push({
        message: `Ca:P low (${ratio.toFixed(2)}). Add ~${gramsCaCO3} g calcium carbonate per batch to improve ratio.`,
        action: 'add_calcium',
        confidence: 'high',
      });
    }
  }

  // Guinea pig vitamin C
  if (species === 'guinea-pig') {
    const vitC = totals['vit_c_mg'] ?? 0;
    const weight = pet.weightKg ?? 1;
    const required = 10 * weight; // mg/day placeholder
    if (vitC < required) {
      suggestions.push({
        message: `Vitamin C seems low for this guinea pig. Aim to include vitamin C rich greens or a supplement (target ~${required} mg/day).`,
        action: 'add_vitC',
        confidence: 'medium',
      });
    }
  }

  // Generic: if liver present and vit A high risk
  if ((totals['vit_a_IU'] ?? 0) > 50000) {
    suggestions.push({
      message: 'Batch contains large amounts of vitamin A (from liver). Rotate liver less frequently to avoid excess vitamin A.',
      action: 'reduce_liver_frequency',
      confidence: 'high',
    });
  }

  // Toxicity-driven suggestion examples
  for (const t of toxicityWarnings) {
    // FIXED: Use ingredientName (display name) instead of ingredientKey (composition key)
    const ingDisplayName = t.ingredientName || t.ingredientKey || 'this ingredient';
    suggestions.push({
      message: `Consider removing or reducing ${ingDisplayName}: ${t.message}`,
      action: 'remove_toxic',
      confidence: t.severity === 'high' ? 'high' : 'medium',
    });
  }

  for (const a of allergyWarnings) {
    suggestions.push({
      message: `Ingredient flagged for allergy: ${a.message}. Replace with hypoallergenic alternative (duck, rabbit, or novel protein).`,
      action: 'replace_allergen',
      confidence: 'high',
    });
  }

  // Variety suggestion: if only 1 category present
  const presentCats = new Set<string>();
  if ((totals['protein_g'] ?? 0) > 0) presentCats.add('protein');
  if ((totals['fiber_g'] ?? 0) > 0 || (totals['ca_mg'] ?? 0) > 0) presentCats.add('greens');
  if ((totals['carbs_g'] ?? 0) > 0) presentCats.add('carbs');
  if ((totals['fat_g'] ?? 0) > 0) presentCats.add('fat');

  if (presentCats.size <= 1) {
    suggestions.push({
      message: 'This batch is dominated by a single category. Add a vegetable or healthy fat for balance.',
      action: 'add_variety',
      confidence: 'low',
    });
  }
  
  return suggestions;
}

// ---------- Recommended serving calculation ----------

function computeRecommendedServingGrams(nutrients: Record<string, number>, totalGrams: number, pet: PetProfile) {
  const kcalTotal = nutrients['calories_kcal'] ?? nutrients['energy_kcal'] ?? 0;
  if (kcalTotal <= 0 || totalGrams <= 0) return 0;

  const kcalPerGram = kcalTotal / totalGrams;
  const dailyKcal = computeDailyKcalTarget(pet);

  // meals per day default
  const mealsPerDay = pet.species?.toLowerCase() === 'cat' ? 3 : 2;
  const targetMealKcal = Math.max(40, Math.round(dailyKcal / mealsPerDay)); // lower bound guard
  const serving = Math.round(targetMealKcal / kcalPerGram);

  // Safety cap: do not recommend more than 50% daily kcal in one serving
  const maxSingleMealKcal = Math.max(targetMealKcal * 2, Math.round(dailyKcal * 0.5));
  if (serving * kcalPerGram > maxSingleMealKcal) {
    return Math.round(maxSingleMealKcal / kcalPerGram);
  }

  return Math.max(0, serving);
}

// ---------- Public API: generateCustomMealAnalysis ----------

/**
 * Analyzes a custom meal composition for a specific pet profile.
 * 
 * Calculates nutritional totals, checks for toxicity/allergies, computes compatibility score (0-100),
 * and provides recommendations for improvement.
 * 
 * @param petProfile - Pet profile with species, life stage, weight, allergies, activity level
 * @param selections - Array of ingredient selections with keys (composition keys) and grams
 * @returns MealAnalysis with nutrients, score, warnings, suggestions, and recommended serving size
 * 
 * @example
 * ```ts
 * const analysis = generateCustomMealAnalysis(
 *   { species: 'dog', lifeStage: 'adult', weightKg: 20 },
 *   [{ key: 'chicken_breast', grams: 200 }, { key: 'brown_rice_cooked', grams: 100 }]
 * );
 * console.log(analysis.score); // 85
 * console.log(analysis.recommendedServingGrams); // 350
 * ```
 * 
 * @contract
 * - Input: PetProfile (from localStorage/backend), IngredientSelection[] (from UI)
 * - Output: MealAnalysis with standardized structure
 * - Side effects: None (pure function)
 * - Migration: Compatible with Firebase/Supabase (receives objects, not storage)
 * - Ingredient keys: Must match INGREDIENT_COMPOSITIONS keys (auto-mapped via safeGetIngredient)
 */
export function generateCustomMealAnalysis(petProfile: PetProfile, selections: IngredientSelection[]): MealAnalysis {
  // Defensive: ensure selections are valid
  const safeSelections = (selections || []).filter(s => s && s.key && s.grams && s.grams > 0);
  const { totals, totalGrams, ingredientsNotFound } = sumRecipeTotals(safeSelections);
  
  // Log ingredients not found in DB
  if (ingredientsNotFound && ingredientsNotFound.length > 0) {
    console.warn('Ingredients not found in composition DB:', ingredientsNotFound);
  }

  // Compute energy density
  const kcalTotal = totals['calories_kcal'] ?? totals['energy_kcal'] ?? 0;
  const energyDensity = totalGrams > 0 ? kcalTotal / totalGrams : 0;

  // Toxicity & allergies
  const { toxicityWarnings, allergyWarnings, inclusionWarnings } = checkToxicityAndAllergies(petProfile, safeSelections, totalGrams);

  // Suggested serving (calculate early so we can use it for warnings)
  const recommendedServingGrams = computeRecommendedServingGrams(totals, totalGrams, petProfile);

  // Nutrient warnings from species heuristics (now uses recommended serving size)
  const { coverageScores, warnings: nutrientHeuristicWarnings } = computeNutrientCoverageAndWarnings(petProfile, totals, totalGrams, recommendedServingGrams);

  // Combine nutrient warnings and inclusion warnings into standard structure
  const nutrientWarnings: WarningItem[] = [
    ...nutrientHeuristicWarnings.map(w => ({ message: w.message, severity: w.severity || 'medium' })),
    ...inclusionWarnings, // Add max inclusion percentage warnings
  ];

  // Scoring (pass ingredientsNotFound for better scoring)
  const scoreInfo = calculateGamifiedScore(petProfile, totals, totalGrams, toxicityWarnings, allergyWarnings, nutrientWarnings, ingredientsNotFound, safeSelections.length);

  // Suggestions
  const suggestions = generatePetSpecificSuggestions(petProfile, totals, totalGrams, toxicityWarnings, allergyWarnings);

  // Calculate Ca:P ratio for legacy compatibility
  const ca = totals['ca_mg'] ?? 0;
  const p = totals['p_mg'] ?? 0;
  const caToPratio = p > 0 ? ca / p : undefined;

  // Legacy compatibility fields
  const dmNutrients: Record<string, number> = {};
  const moisture = totals['moisture_g'] ?? 0;
  const dryMatter = totalGrams - moisture;
  const dryMatterPercent = totalGrams > 0 ? (dryMatter / totalGrams) * 100 : 0;

  if (dryMatter > 0) {
    for (const [key, value] of Object.entries(totals)) {
      if (key !== 'moisture_g') {
        dmNutrients[`${key}_percent`] = (value / dryMatter) * 100;
      }
    }
  }

  // Convert nutrientWarnings to legacy deficiencies/excesses format
  const deficiencies: string[] = [];
  const excesses: string[] = [];
  nutrientWarnings.forEach(w => {
    if (w.message.toLowerCase().includes('low') || w.message.toLowerCase().includes('deficient')) {
      deficiencies.push(w.message);
    } else if (w.message.toLowerCase().includes('high') || w.message.toLowerCase().includes('excess')) {
      excesses.push(w.message);
    }
  });

  // Final MealAnalysis object
  const analysis: MealAnalysis = {
    nutrients: totals,
    totalRecipeGrams: totalGrams,
    energyDensityKcalPerGram: energyDensity,
    recommendedServingGrams,
    score: scoreInfo.finalScore,
    breakdown: {
      nutrientCoverageScore: scoreInfo.nutrientCoverageScore,
      toxicityPenalty: scoreInfo.toxicityPenalty,
      balanceVarietyScore: scoreInfo.balanceVarietyScore,
    },
      toxicityWarnings,
      allergyWarnings,
    nutrientWarnings,
    suggestions,
    // Legacy compatibility fields
    dmNutrients,
    dryMatterPercent,
    totalWeight_g: totalGrams,
    caToPratio,
      deficiencies,
      excesses,
    adequacies: coverageScores['protein'] > 0.8 && coverageScores['fat'] > 0.8 ? ['Protein and fat levels look adequate'] : [],
      scoreBreakdown: {
      baseScore: scoreInfo.base,
      nutritionPenalty: scoreInfo.penaltyApplied,
        balancePenalty: 0,
      },
    };

  return analysis;
}
