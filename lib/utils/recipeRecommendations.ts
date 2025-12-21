import { Recipe } from '@/lib/types';

interface Pet {
  id: string;
  name: string;
  type: string;
  breed: string;
  age: string | number;
  healthConcerns: string[];
  weight?: number;
  activityLevel?: 'sedentary' | 'moderate' | 'active' | 'very-active';
  allergies?: string[];
  dietaryRestrictions?: string[];
  savedRecipes?: string[];
  names?: string[];
  weightKg?: number;
}

import { normalizeToSubtype, type Subtype } from './ingredientWhitelists';
import { getHealthTemplatesForSpecies, applyHealthTemplate, type HealthConcernTemplate } from '@/lib/data/healthConcernTemplates';
import {
  calculateEnhancedCompatibility,
  type Pet as EnhancedPet,
} from './enhancedCompatibilityScoring';

/**
 * Check if recipe matches species/subtype
 * Exported so scoreRecipe can use it
 */
export function matchesSpecies(recipe: Recipe, pet: Pet): boolean {
  // Exact match
  if (recipe.category === pet.type) return true;
  
  // Subtype matching for exotics (Beta feature)
  const subtype = normalizeToSubtype(pet.type as any, pet.breed);
  
  if (pet.type === 'bird') {
    const largeBirds = ['parrot', 'cockatoo', 'african grey', 'macaw', 'conure', 'quaker'];
    const isLargeBird = largeBirds.some(lb => (pet.breed || '').toLowerCase().includes(lb));
    
    // Allow generic bird recipes for all birds
    if (recipe.category === 'birds' || recipe.category === 'bird') return true;
    
    // Allow subtype-specific recipes
    if (recipe.category === 'bird_large' && isLargeBird) return true;
    if (recipe.category === 'bird_small' && !isLargeBird) return true;
  }
  
  if (pet.type === 'reptile') {
    // Allow generic reptile recipes
    if (recipe.category === 'reptiles' || recipe.category === 'reptile') return true;
    
    // Allow subtype-specific recipes
    const subtypeCategories = [
      'reptile_herbivore', 'reptile_insectivore', 
      'reptile_omnivore', 'reptile_carnivore'
    ];
    if (subtypeCategories.includes(recipe.category)) {
      // Check if recipe category matches subtype
      return recipe.category === subtype;
    }
  }
  
  if (pet.type === 'pocket-pet') {
    // Allow generic pocket-pet recipes
    if (recipe.category === 'pocket-pets' || recipe.category === 'pocket-pet') return true;
    
    // Allow subtype-specific recipes
    const subtypeCategories = [
      'pocket_hay', 'pocket_varied', 
      'pocket_carnivore', 'pocket_insectivore'
    ];
    if (subtypeCategories.includes(recipe.category)) {
      return recipe.category === subtype;
    }
  }
  
  return false;
}

/**
 * Tiered recommendation system - ensures users never see "0 meals"
 * 
 * Tier 1: Exact match (species + age + health concern)
 * Tier 2: Subtype + health concern template match
 * Tier 3: Species + age match (no health concern)
 * Tier 4: Species match only (all ages)
 * Tier 5: Subtype match (generic)
 * Tier 6: Health template-based suggestions (always available)
 */
export interface RecipeRecommendation {
  recipe: Recipe;
  tier: number;
  tierLabel: string;
  healthConcernMatch?: string;
  template?: HealthConcernTemplate;
  warning?: string;
  score: number;
  enhancedScore?: any; // Optional improved scoring
}

/**
 * Normalize pet age to age group string
 * Handles both string ("adult") and number (5) formats
 */
function normalizePetAgeToGroup(age: string | number): string {
  if (typeof age === 'string') {
    // Already a string like "adult", "young", etc.
    const normalized = age.toLowerCase().trim();
    if (['baby', 'young', 'adult', 'senior', 'all'].includes(normalized)) {
      return normalized;
    }
    // Try to parse if it's a number string
    const numAge = parseFloat(normalized);
    if (!isNaN(numAge)) {
      if (numAge < 1) return 'baby';
      if (numAge < 2) return 'young';
      if (numAge < 7) return 'adult';
      return 'senior';
    }
    return normalized; // Return as-is if can't parse
  }
  // Convert number to age group
  if (age < 1) return 'baby';
  if (age < 2) return 'young';
  if (age < 7) return 'adult';
  return 'senior';
}

/**
 * Normalize health concern names to match recipe database format
 * Maps user-friendly names to database keys
 */
function normalizeHealthConcern(concern: string): string {
  const mapping: Record<string, string> = {
    'dental health': 'dental-issues',
    'dental-health': 'dental-issues',
    'weight management': 'weight-management',
    'weight-management': 'weight-management',
    'joint & mobility': 'joint-health',
    'joint-health': 'joint-health',
    'skin & coat': 'skin-coat',
    'skin-coat': 'skin-coat',
    'kidney/urinary support': 'kidney',
    'kidney/urinary-support': 'kidney',
    'digestive health': 'digestive',
    'digestive': 'digestive',
    'allergy support': 'allergies',
    'allergies': 'allergies',
  };
  
  const normalized = concern.toLowerCase().trim();
  return mapping[normalized] || normalized.replace(/\s+/g, '-').toLowerCase();
}

/**
 * Get recommended recipes with optional enhanced scoring
 * @param pet - Pet profile
 * @param minCount - Minimum number of recipes to return
 * @param useEnhancedScoring - Whether to use the enhanced compatibility scoring system
 * @param customRecipes - Optional custom recipes to include in recommendations
 */
export const getRecommendedRecipes = (
  pet: Pet,
  minCount: number = 20,
  useEnhancedScoring: boolean = false,
  customRecipes?: Recipe[]
): RecipeRecommendation[] => {
  const { type, age, healthConcerns } = pet;
  // Normalize health concerns to match recipe database format
  const normalizedConcerns = (healthConcerns || []).map(normalizeHealthConcern);
  const results: RecipeRecommendation[] = [];

  // Use provided recipes only - static recipes are no longer available
  const allRecipes = customRecipes || [];

  // Normalize pet age to age group string
  const petAgeGroup = normalizePetAgeToGroup(age);
  
  // Tier 1: Perfect matches (species + age) - health concerns handled in scoring, not filtering
  const tier1 = allRecipes.filter(r => {
    const speciesMatch = matchesSpecies(r, pet);
    const ageMatch = (r.ageGroup || []).includes(petAgeGroup) || (r.ageGroup || []).includes('all');
    // Health concerns are scoring modifiers, not filters
    return speciesMatch && ageMatch;
  }).map(r => {
    // Find matching health concern for display (but don't filter by it)
    const matchingConcern = normalizedConcerns.length > 0 
      ? normalizedConcerns.find(hc => r.healthConcerns?.includes(hc) || r.healthConcerns?.some(rc => rc.toLowerCase().includes(hc.toLowerCase())))
      : undefined;
    return {
      recipe: r,
      tier: 1,
      tierLabel: matchingConcern ? 'Best Match' : 'Age-Appropriate',
      healthConcernMatch: matchingConcern,
      score: 100
    };
  });
  results.push(...tier1);
  
  // Tier 2: Subtype + health concern template match - ALWAYS run when concerns exist
  if (normalizedConcerns.length > 0) {
    const subtype = normalizeToSubtype(type as any, pet.breed);
    
    // Process each health concern (use normalized version)
    normalizedConcerns.forEach(concern => {
      const templates = getHealthTemplatesForSpecies(type, pet.breed, concern);
      
      templates.forEach(template => {
        // Find recipes that match subtype and age (can be adapted)
        const subtypeRecipes = allRecipes.filter(r => {
          const speciesMatch = matchesSpecies(r, pet);
          const ageMatch = (r.ageGroup || []).includes(petAgeGroup) || (r.ageGroup || []).includes('all');
          // Don't include recipes already in results
          const notIncluded = !results.some(res => res.recipe.id === r.id);
          return speciesMatch && ageMatch && notIncluded;
        });
        
        // Actually apply the template to adapt ingredients
        subtypeRecipes.forEach(r => {
          const ingredientNames = r.ingredients.map(i => i.name);
          const adapted = applyHealthTemplate(ingredientNames, template);
          
          // Create adapted recipe
          const adaptedRecipe: Recipe = {
            ...r,
            id: `${r.id}__${template.id}`, // Avoid ID clash
            name: `${r.name} (Adapted for ${concern})`,
            description: `${r.description} Adapted using ${template.name} template.`,
            ingredients: adapted.adjustedIngredients.map((name, idx) => ({
              id: `adapted-${idx}`,
              name,
              amount: 'varies',
              asinLink: r.ingredients[0]?.asinLink || ''
            })),
            healthConcerns: Array.from(new Set([
              ...(r.healthConcerns || []),
              concern
            ])),
            tags: [...(r.tags || []), 'template-adapted']
          };
          
          results.push({
            recipe: adaptedRecipe,
            tier: 2,
            tierLabel: `Adapted for ${concern}`,
            healthConcernMatch: concern,
            template,
            warning: adapted.warnings.length > 0 
              ? `${template.warning || ''} ${adapted.warnings.join('; ')}`
              : template.warning,
            score: 80
          });
        });
      });
    });
  }
  
  // Tier 3: Species + age match (no health concern) - Fill up to minCount
  const tier3 = allRecipes.filter(r => {
    const speciesMatch = matchesSpecies(r, pet);
    const ageMatch = (r.ageGroup || []).includes(petAgeGroup) || (r.ageGroup || []).includes('all');
    const notIncluded = !results.some(res => res.recipe.id === r.id);
    return speciesMatch && ageMatch && notIncluded;
  }).slice(0, Math.max(0, minCount - results.length)) // Only take what we need
  .map(r => ({
    recipe: r,
    tier: 3,
    tierLabel: normalizedConcerns.length > 0 ? 'General Safe Meal' : 'Age-Appropriate',
    warning: normalizedConcerns.length > 0 
      ? `No ${normalizedConcerns[0]} recipes yet; this is a general safe meal`
      : undefined,
    score: 60
  }));
  results.push(...tier3);
  
  // Tier 4: Species match only (all ages) - Fill up to minCount
  // Always ensure we have at least minCount recipes
  const neededFromTier4 = Math.max(0, minCount - results.length);
  const tier4 = allRecipes.filter(r => {
    const speciesMatch = matchesSpecies(r, pet);
    const notIncluded = !results.some(res => res.recipe.id === r.id);
    return speciesMatch && notIncluded;
  }).slice(0, neededFromTier4) // Take only what we need to reach minCount
  .map(r => ({
    recipe: r,
    tier: 4,
    tierLabel: 'Species-Appropriate',
    warning: 'Not optimized for age or health concerns',
    score: 40
  }));
  results.push(...tier4);
  
  // Tier 5: Subtype match (generic) - Fill up to minCount for exotics
  if (results.length < minCount && ['bird', 'reptile', 'pocket-pet', 'birds', 'reptiles', 'pocket-pets'].includes(type)) {
    const subtype = normalizeToSubtype(type as any, pet.breed);
    const tier5 = allRecipes.filter(r => {
      const matchesSubtype = r.category === subtype || 
        (r.category && r.category.includes(subtype.split('_')[0])) ||
        matchesSpecies(r, pet); // Also include any species matches
      const notIncluded = !results.some(res => res.recipe.id === r.id);
      return matchesSubtype && notIncluded;
    }).slice(0, minCount - results.length) // Only take what we need
    .map(r => ({
      recipe: r,
      tier: 5,
      tierLabel: 'Generic ' + subtype.replace('_', ' ') + ' Template',
      warning: 'Generic template - confirm with your vet',
      score: 30
    }));
    results.push(...tier5);
  }
  
  // Tier 6: Health template-based suggestions (always ensure something shows)
  // Also run if we're below minCount for exotics
  if ((results.length === 0 || (results.length < minCount && ['bird', 'reptile', 'pocket-pet', 'birds', 'reptiles', 'pocket-pets'].includes(type))) && normalizedConcerns.length > 0) {
    const templates = getHealthTemplatesForSpecies(type, pet.breed, normalizedConcerns[0]);
    if (templates.length > 0) {
      // Create a placeholder recipe from template
      const template = templates[0];
      const placeholderRecipe: Recipe = {
        id: `template-${template.id}`,
        name: template.name,
        category: type,
        ageGroup: [petAgeGroup],
        healthConcerns: [normalizedConcerns[0]],
        description: template.description,
        ingredients: (template.rules.preferIngredients || []).map((ing, idx) => ({
          id: `ing-${idx}`,
          name: ing,
          amount: 'varies',
          asinLink: ''
        })),
        instructions: ['Use custom meal builder with this template', 'Follow template guidelines'],
        tags: ['template', 'health-concern'],
        rating: 0,
        reviews: 0,
        prepTime: '0 min',
        cookTime: '0 min',
        servings: 1
      };
      
      results.push({
        recipe: placeholderRecipe,
        tier: 6,
        tierLabel: 'Template-Based',
        template,
        warning: template.warning || 'Use custom meal builder with health template',
        score: 20
      });
    }
  }
  
  // Apply improved scoring if requested
  if (useEnhancedScoring) {
    results.forEach(result => {
      try {
        // Convert pet format for improved scoring
        const numericAge = typeof pet.age === 'number' ? pet.age : (parseFloat(pet.age) || 1);
        const enhancedPet: EnhancedPet = {
          id: pet.id,
          name: pet.name,
          type: pet.type as 'dog' | 'cat' | 'bird' | 'reptile' | 'pocket-pet',
          breed: pet.breed,
          age: numericAge,
          weight: pet.weight || 10,
          activityLevel: pet.activityLevel,
          healthConcerns: pet.healthConcerns || [],
          dietaryRestrictions: pet.dietaryRestrictions || [],
          allergies: pet.allergies || [],
        };
        
        const enhanced = calculateEnhancedCompatibility(result.recipe, enhancedPet);
        result.enhancedScore = enhanced;
        result.score = enhanced.overallScore;
      } catch (error) {
        // If enhanced scoring fails, keep original score
        console.warn('Enhanced scoring failed for recipe:', result.recipe.id, error);
      }
    });
  }

  // Sort by score (tier or enhanced score) and return
  const sorted = results.sort((a, b) => {
    // If both have enhanced scores, use those
    if (a.enhancedScore && b.enhancedScore) {
      return b.enhancedScore.overallScore - a.enhancedScore.overallScore;
    }
    // Otherwise use tier score
    return b.score - a.score;
  });
  // Return up to minCount recipes, or all if we have fewer than minCount
  return sorted.slice(0, Math.min(minCount, sorted.length));
};

/**
 * Get count of recipes by priority level for display purposes
 * Returns empty stats since recipes are now generated dynamically
 */
export const getRecommendationStats = (pet: Pet) => {
  return {
    perfect: 0,
    typeAge: 0,
    typeOnly: 0,
    total: 0
  };
};