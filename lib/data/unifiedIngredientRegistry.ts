// lib/data/unifiedIngredientRegistry.ts
// Unified Ingredient Registry - Single source of truth for all ingredient data
// Consolidates: ingredientCompositions, allIngredients, vetted-species-map, vetted-products

import { INGREDIENT_COMPOSITIONS, type IngredientComposition, type SpeciesCompatibility } from './ingredientCompositions';
import { VETTED_PRODUCTS } from './vetted-products';
import { VETTED_SPECIES_MAP } from './vetted-species-map';
import { ALL_INGREDIENTS } from '../utils/allIngredients';
import { getFallbackNutrition } from '../utils/nutritionFallbacks';

export type Species = 'dog' | 'cat' | 'bird' | 'reptile' | 'pocket-pet';
export type IngredientCategory = 'protein' | 'grain' | 'vegetable' | 'fruit' | 'supplement' | 'fat' | 'insect' | 'hay' | 'pellet';

/**
 * Unified ingredient structure - single source of truth
 */
export interface UnifiedIngredient {
  // Canonical ID (primary key) - snake_case format
  id: string; // e.g., 'chicken_breast'
  
  // Display names (all variations found across the system)
  displayNames: string[]; // ['Chicken Breast', 'chicken breast', 'Chicken breast', 'Ground Chicken']
  
  // Primary display name (most common)
  primaryDisplayName: string;
  
  // Nutrition data (from ingredientCompositions or fallback)
  nutrition: IngredientComposition;
  
  // Species compatibility (consolidated from multiple sources)
  speciesCompatibility: Record<Species, SpeciesCompatibility | null>;
  
  // Species availability (from vetted-species-map)
  availableForSpecies: Species[];
  
  // Vetted product links (from vetted-products)
  vettedProducts?: Array<{
    productName: string;
    asinLink: string;
    purchaseLink?: string;
    chewyLink?: string;
    specialtyLink?: string;
    vetNote?: string;
    category?: string;
  }>;
  
  // Category for meal builder (detected from usage)
  category: IngredientCategory;
  
  // Categories by species (from allIngredients)
  categoriesBySpecies?: Record<Species, IngredientCategory[]>;
  
  // Confidence level for nutrition data
  nutritionConfidence: 'high' | 'medium' | 'low';
  
  // Whether this uses fallback nutrition
  usesFallbackNutrition: boolean;
}

/**
 * Normalize ingredient name to canonical ID format
 */
function normalizeToId(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

/**
 * Detect category from ingredient name
 */
function detectCategory(name: string, species?: Species): IngredientCategory {
  const lower = name.toLowerCase();
  
  // Protein detection
  if (lower.match(/\b(chicken|turkey|beef|lamb|fish|salmon|tuna|meat|protein|pork|duck|organ|heart|liver|kidney|venison|rabbit|quail)\b/)) {
    return 'protein';
  }
  
  // Insect detection
  if (lower.match(/\b(cricket|mealworm|roach|dubia|insect|superworm|hornworm|silkworm|waxworm|phoenix|black.*soldier.*fly|bsfl)\b/)) {
    return 'insect';
  }
  
  // Vegetable detection
  if (lower.match(/\b(carrot|broccoli|spinach|kale|lettuce|pepper|squash|vegetable|green|collard|mustard|turnip|dandelion|arugula|endive|escarole|bok.*choy|cabbage|celery|asparagus|fennel|parsley|zucchini|cucumber|eggplant|leek|shallot|radicchio|frisee|mache|watercress|purslane|swiss.*chard|beet.*green)\b/)) {
    return 'vegetable';
  }
  
  // Fruit detection
  if (lower.match(/\b(apple|berry|mango|papaya|banana|fruit|grape|melon|cantaloupe|honeydew|watermelon|pineapple|kiwi|raspberry|blackberry|cranberry|cherry|pear|peach|plum|apricot|fig|date|raisin|currant|goji|mulberry|elderberry|strawberry|blueberry)\b/)) {
    return 'fruit';
  }
  
  // Grain/Seed detection
  if (lower.match(/\b(rice|oats|quinoa|barley|wheat|grain|seed|millet|canary|niger|hemp|flax|chia|sesame|sunflower|pumpkin|safflower|nyjer|amaranth|buckwheat|teff|rapeseed|poppy|corn|maize|groat)\b/)) {
    return 'grain';
  }
  
  // Hay detection
  if (lower.match(/\b(hay|timothy|alfalfa|grass|meadow|orchard|bermuda|bluegrass|fescue|ryegrass|straw|dried.*grass)\b/)) {
    return 'hay';
  }
  
  // Pellet detection
  if (lower.match(/\b(pellet|fortified.*pellet)\b/)) {
    return 'pellet';
  }
  
  // Supplement detection
  if (lower.match(/\b(supplement|vitamin|calcium|taurine|fortified|cuttlebone|grit|probiotic|enzyme|glucosamine|chondroitin|omega|epa|dha|antioxidant|spirulina|kelp|brewer.*yeast|electrolyte|amino.*acid|joint.*health)\b/)) {
    return 'supplement';
  }
  
  // Fat/Oil detection
  if (lower.match(/\b(oil|fat|salmon.*oil|fish.*oil|coconut.*oil|olive.*oil)\b/)) {
    return 'fat';
  }
  
  return 'protein'; // Default fallback
}

/**
 * Get species compatibility from multiple sources
 */
function getSpeciesCompatibility(id: string, displayNames: string[]): Record<Species, SpeciesCompatibility | null> {
  const compat: Record<Species, SpeciesCompatibility | null> = {
    dog: null,
    cat: null,
    bird: null,
    reptile: null,
    'pocket-pet': null,
  };
  
  // First, check ingredientCompositions
  const composition = INGREDIENT_COMPOSITIONS[id];
  if (composition?.speciesCompatibility) {
    Object.assign(compat, composition.speciesCompatibility);
  }
  
  // Then, check vetted-species-map (which uses display names)
  for (const displayName of displayNames) {
    const vettedKey = displayName.toLowerCase();
    const vettedSpecies = VETTED_SPECIES_MAP[vettedKey];
    if (vettedSpecies) {
      // If in vetted map, assume 'ok' for those species
      vettedSpecies.forEach(species => {
        if (compat[species as Species] === null) {
          compat[species as Species] = 'ok';
        }
      });
    }
  }
  
  return compat;
}

/**
 * Get available species from vetted-species-map
 */
function getAvailableSpecies(displayNames: string[]): Species[] {
  const speciesSet = new Set<Species>();
  
  for (const displayName of displayNames) {
    const vettedKey = displayName.toLowerCase();
    const vettedSpecies = VETTED_SPECIES_MAP[vettedKey];
    if (vettedSpecies) {
      vettedSpecies.forEach(s => speciesSet.add(s as Species));
    }
  }
  
  return Array.from(speciesSet);
}

/**
 * Get vetted products for ingredient
 */
function getVettedProducts(displayNames: string[]): UnifiedIngredient['vettedProducts'] {
  const products: UnifiedIngredient['vettedProducts'] = [];
  
  for (const displayName of displayNames) {
    const vettedKey = displayName.toLowerCase();
    const vetted = VETTED_PRODUCTS[vettedKey];
    if (vetted) {
      products.push({
        productName: vetted.productName,
        asinLink: vetted.asinLink,
        purchaseLink: vetted.purchaseLink,
        chewyLink: vetted.chewyLink,
        specialtyLink: vetted.specialtyLink,
        vetNote: vetted.vetNote,
        category: vetted.category,
      });
    }
  }
  
  return products.length > 0 ? products : undefined;
}

/**
 * Get categories by species from allIngredients
 */
function getCategoriesBySpecies(id: string, displayNames: string[]): Record<Species, IngredientCategory[]> | undefined {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/0b2cb572-34bf-468c-9297-dd079c8c4c2d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'unifiedIngredientRegistry.ts:207',message:'getCategoriesBySpecies entry',data:{id,displayNamesCount:displayNames.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  
  const categoriesBySpecies: Record<Species, IngredientCategory[]> = {
    dog: [],
    cat: [],
    bird: [],
    reptile: [],
    'pocket-pet': [],
  };
  
  let hasCategories = false;
  
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/0b2cb572-34bf-468c-9297-dd079c8c4c2d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'unifiedIngredientRegistry.ts:220',message:'Before ALL_INGREDIENTS iteration',data:{allIngredientsKeys:Object.keys(ALL_INGREDIENTS),categoriesBySpeciesKeys:Object.keys(categoriesBySpecies)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  
  // Check allIngredients structure
  Object.entries(ALL_INGREDIENTS).forEach(([species, speciesData]) => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/0b2cb572-34bf-468c-9297-dd079c8c4c2d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'unifiedIngredientRegistry.ts:222',message:'ALL_INGREDIENTS entry',data:{species,speciesDataType:typeof speciesData},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    
    // Normalize species key from ALL_INGREDIENTS (plural) to Species type (singular)
    let normalizedSpecies: Species;
    if (species === 'dogs') {
      normalizedSpecies = 'dog';
    } else if (species === 'cats') {
      normalizedSpecies = 'cat';
    } else if (species === 'birds') {
      normalizedSpecies = 'bird';
    } else if (species === 'reptiles') {
      normalizedSpecies = 'reptile';
    } else if (species === 'pocket-pets') {
      normalizedSpecies = 'pocket-pet';
    } else {
      normalizedSpecies = species as Species;
    }
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/0b2cb572-34bf-468c-9297-dd079c8c4c2d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'unifiedIngredientRegistry.ts:240',message:'After normalization',data:{originalSpecies:species,normalizedSpecies,categoriesBySpeciesHasKey:normalizedSpecies in categoriesBySpecies},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    
    Object.entries(speciesData).forEach(([categoryName, ingredientList]) => {
      if (Array.isArray(ingredientList)) {
        const matches = ingredientList.filter(ing => {
          const normalizedIng = normalizeToId(ing);
          return normalizedIng === id || displayNames.some(dn => normalizeToId(dn) === normalizedIng);
        });
        
        if (matches.length > 0) {
          // Map category names to IngredientCategory
          let category: IngredientCategory = 'protein';
          if (categoryName === 'proteins' || categoryName === 'insects') {
            category = categoryName === 'insects' ? 'insect' : 'protein';
          } else if (categoryName === 'vegetables' || categoryName === 'hay') {
            category = categoryName === 'hay' ? 'hay' : 'vegetable';
          } else if (categoryName === 'fruits') {
            category = 'fruit';
          } else if (categoryName === 'carbs' || categoryName === 'seeds' || categoryName === 'pellets') {
            category = categoryName === 'pellets' ? 'pellet' : 'grain';
          } else if (categoryName === 'fats') {
            category = 'fat';
          } else if (categoryName === 'supplements' || categoryName === 'fiber_supplements') {
            category = 'supplement';
          }
          
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/0b2cb572-34bf-468c-9297-dd079c8c4c2d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'unifiedIngredientRegistry.ts:265',message:'Before categoriesBySpecies access',data:{normalizedSpecies,category,categoriesBySpeciesValue:categoriesBySpecies[normalizedSpecies]},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
          // #endregion
          
          if (categoriesBySpecies[normalizedSpecies] && !categoriesBySpecies[normalizedSpecies].includes(category)) {
            categoriesBySpecies[normalizedSpecies].push(category);
            hasCategories = true;
          }
        }
      }
    });
  });
  
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/0b2cb572-34bf-468c-9297-dd079c8c4c2d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'unifiedIngredientRegistry.ts:275',message:'getCategoriesBySpecies exit',data:{hasCategories,resultKeys:hasCategories?Object.keys(categoriesBySpecies):null},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  
  return hasCategories ? categoriesBySpecies : undefined;
}

/**
 * Build unified ingredient from all sources
 */
function buildUnifiedIngredient(
  id: string,
  displayNames: string[],
  primaryDisplayName: string
): UnifiedIngredient {
  // Get nutrition data
  const composition = INGREDIENT_COMPOSITIONS[id];
  let nutrition: IngredientComposition;
  let usesFallback = false;
  let nutritionConfidence: 'high' | 'medium' | 'low' = 'high';
  
  if (composition) {
    nutrition = composition;
    // Check confidence from composition
    if (composition.confidenceBySpecies) {
      const confidences = Object.values(composition.confidenceBySpecies);
      if (confidences.includes('low')) {
        nutritionConfidence = 'low';
      } else if (confidences.includes('medium')) {
        nutritionConfidence = 'medium';
      }
    }
  } else {
    // Try fallback
    const fallback = getFallbackNutrition(primaryDisplayName);
    if (fallback) {
      nutrition = fallback;
      usesFallback = true;
      nutritionConfidence = 'low';
    } else {
      // Last resort: minimal placeholder
      nutrition = {
        protein: 0,
        fat: 0,
        calcium: 0,
        phosphorus: 0,
        moisture: 0,
        kcal: 0,
        source: 'placeholder',
        needsReview: true,
      };
      usesFallback = true;
      nutritionConfidence = 'low';
    }
  }
  
  // Get species compatibility
  const speciesCompatibility = getSpeciesCompatibility(id, displayNames);
  
  // Get available species
  const availableForSpecies = getAvailableSpecies(displayNames);
  
  // Get vetted products
  const vettedProducts = getVettedProducts(displayNames);
  
  // Detect category
  const category = detectCategory(primaryDisplayName);
  
  // Get categories by species
  const categoriesBySpecies = getCategoriesBySpecies(id, displayNames);
  
  return {
    id,
    displayNames,
    primaryDisplayName,
    nutrition,
    speciesCompatibility,
    availableForSpecies,
    vettedProducts,
    category,
    categoriesBySpecies,
    nutritionConfidence,
    usesFallbackNutrition: usesFallback,
  };
}

/**
 * Build unified registry from all sources
 * This is a one-time migration that consolidates all ingredient data
 */
function buildRegistry(): Map<string, UnifiedIngredient> {
  const registry = new Map<string, UnifiedIngredient>();
  const nameToIdMap = new Map<string, string>(); // Map display names to IDs
  
  // Step 1: Collect all ingredient names from allIngredients
  const allIngredientNames = new Set<string>();
  Object.values(ALL_INGREDIENTS).forEach(speciesData => {
    Object.values(speciesData).forEach(ingredientList => {
      if (Array.isArray(ingredientList)) {
        ingredientList.forEach(ing => allIngredientNames.add(ing));
      }
    });
  });
  
  // Step 2: Collect from ingredientCompositions
  Object.keys(INGREDIENT_COMPOSITIONS).forEach(id => {
    const comp = INGREDIENT_COMPOSITIONS[id];
    if (comp.name) {
      allIngredientNames.add(comp.name);
    }
    allIngredientNames.add(id.replace(/_/g, ' ')); // Add display version of ID
  });
  
  // Step 3: Collect from vetted-products and vetted-species-map
  Object.keys(VETTED_PRODUCTS).forEach(name => allIngredientNames.add(name));
  Object.keys(VETTED_SPECIES_MAP).forEach(name => allIngredientNames.add(name));
  
  // Step 4: Group names by canonical ID
  const idToNames = new Map<string, Set<string>>();
  
  allIngredientNames.forEach(name => {
    const id = normalizeToId(name);
    if (!idToNames.has(id)) {
      idToNames.set(id, new Set());
    }
    idToNames.get(id)!.add(name);
    nameToIdMap.set(name.toLowerCase(), id);
  });
  
  // Step 5: Build unified ingredients
  idToNames.forEach((names, id) => {
    const nameArray = Array.from(names);
    const primaryName = nameArray[0] || id.replace(/_/g, ' ');
    const unified = buildUnifiedIngredient(id, nameArray, primaryName);
    registry.set(id, unified);
  });
  
  return registry;
}

// Build registry on module load (cached)
let _registry: Map<string, UnifiedIngredient> | null = null;
let _nameToIdMap: Map<string, string> | null = null;

function getRegistry(): Map<string, UnifiedIngredient> {
  if (!_registry) {
    _registry = buildRegistry();
  }
  return _registry;
}

function getNameToIdMap(): Map<string, string> {
  if (!_nameToIdMap) {
    _nameToIdMap = new Map<string, string>();
    getRegistry().forEach((ing, id) => {
      ing.displayNames.forEach(name => {
        _nameToIdMap!.set(name.toLowerCase(), id);
      });
    });
  }
  return _nameToIdMap;
}

/**
 * Get ingredient by canonical ID
 */
export function getIngredientById(id: string): UnifiedIngredient | null {
  const registry = getRegistry();
  return registry.get(id) || null;
}

/**
 * Get ingredient by display name (fuzzy match)
 */
export function getIngredientByName(name: string): UnifiedIngredient | null {
  const nameMap = getNameToIdMap();
  const normalized = name.toLowerCase().trim();
  const id = nameMap.get(normalized);
  
  if (id) {
    return getIngredientById(id);
  }
  
  // Try fuzzy match - normalize the input
  const normalizedId = normalizeToId(name);
  return getIngredientById(normalizedId);
}

/**
 * Normalize ingredient name to canonical ID
 */
export function normalizeIngredientName(name: string): string {
  const nameMap = getNameToIdMap();
  const normalized = name.toLowerCase().trim();
  const id = nameMap.get(normalized);
  
  if (id) {
    return id;
  }
  
  // Fallback to normalized version
  return normalizeToId(name);
}

/**
 * Get ingredients available for a species, optionally filtered by category
 */
export function getIngredientsForSpecies(
  species: Species,
  category?: IngredientCategory
): UnifiedIngredient[] {
  const registry = getRegistry();
  const ingredients: UnifiedIngredient[] = [];
  
  registry.forEach(ing => {
    // Check if available for species
    const isAvailable = ing.availableForSpecies.includes(species) ||
                       ing.speciesCompatibility[species] === 'ok' ||
                       ing.speciesCompatibility[species] === 'limit' ||
                       ing.speciesCompatibility[species] === 'caution';
    
    if (isAvailable) {
      // Filter by category if specified
      if (!category || ing.category === category || ing.categoriesBySpecies?.[species]?.includes(category)) {
        ingredients.push(ing);
      }
    }
  });
  
  return ingredients;
}

/**
 * Get all ingredients in a category
 */
export function getIngredientsByCategory(category: IngredientCategory): UnifiedIngredient[] {
  const registry = getRegistry();
  const ingredients: UnifiedIngredient[] = [];
  
  registry.forEach(ing => {
    if (ing.category === category) {
      ingredients.push(ing);
    }
  });
  
  return ingredients;
}

/**
 * Get all ingredients in the registry
 */
export function getAllIngredients(): UnifiedIngredient[] {
  return Array.from(getRegistry().values());
}

/**
 * Search ingredients by name (fuzzy)
 */
export function searchIngredients(query: string): UnifiedIngredient[] {
  const registry = getRegistry();
  const results: UnifiedIngredient[] = [];
  const queryLower = query.toLowerCase();
  
  registry.forEach(ing => {
    // Check if query matches any display name or ID
    const matches = ing.displayNames.some(name => name.toLowerCase().includes(queryLower)) ||
                   ing.id.includes(queryLower) ||
                   ing.primaryDisplayName.toLowerCase().includes(queryLower);
    
    if (matches) {
      results.push(ing);
    }
  });
  
  return results;
}

