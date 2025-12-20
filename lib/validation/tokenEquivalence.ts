// Token equivalence mapping - handles lexical variants that mean the same thing
// Keep this SMALL and EXPLICIT - no regex expansion, no ML

export interface TokenEquivalenceMap {
  [ingredientFamily: string]: {
    [canonicalToken: string]: string[];
  };
}

// Small, explicit synonym table
// Format: canonical token -> acceptable synonyms
export const TOKEN_EQUIVALENCE: TokenEquivalenceMap = {
  // Rice family
  rice: {
    'hulled': ['brown', 'whole grain', 'unmilled'],
    'white': ['polished', 'refined', 'milled'],
    'long grain': ['basmati', 'jasmine'],
    'short grain': ['arborio', 'sushi'],
  },
  
  // Fish - canning medium
  sardines: {
    'water packed': ['in water', 'water', 'brine'],
    'oil packed': ['in oil', 'olive oil', 'soybean oil'],
    'canned': ['tinned', 'preserved'],
  },
  
  herring: {
    'water packed': ['in water', 'water', 'brine'],
    'canned': ['tinned', 'preserved'],
  },
  
  tuna: {
    'water packed': ['in water', 'water', 'brine'],
    'oil packed': ['in oil', 'olive oil'],
    'canned': ['tinned', 'preserved'],
  },
  
  salmon: {
    'canned': ['tinned', 'preserved'],
    'wild': ['wild caught', 'wild-caught'],
    'fresh': ['raw', 'uncooked'],
  },
  
  // Chicken preparation
  chicken: {
    'raw': ['fresh', 'uncooked'],
    'ground': ['minced', 'mince'],
    'breast': ['white meat'],
    'thigh': ['dark meat'],
    'whole': ['entire', 'complete'],
  },
  
  // Beef preparation
  beef: {
    'raw': ['fresh', 'uncooked'],
    'ground': ['minced', 'mince', 'hamburger'],
    'lean': ['extra lean', '90/10', '93/7', '95/5'],
    'grass fed': ['grass-fed', 'pasture raised'],
  },
  
  // Lamb preparation
  lamb: {
    'raw': ['fresh', 'uncooked'],
    'ground': ['minced', 'mince'],
    'leg': ['shank'],
  },
  
  // Turkey preparation
  turkey: {
    'raw': ['fresh', 'uncooked'],
    'ground': ['minced', 'mince'],
    'breast': ['white meat'],
  },
  
  // Pork preparation
  pork: {
    'raw': ['fresh', 'uncooked'],
    'ground': ['minced', 'mince'],
    'lean': ['trimmed', 'fat removed'],
  },
  
  // Duck preparation
  duck: {
    'raw': ['fresh', 'uncooked'],
    'whole': ['entire', 'complete'],
  },
  
  // Venison preparation
  venison: {
    'raw': ['fresh', 'uncooked'],
    'ground': ['minced', 'mince'],
    'deer': ['elk', 'game'],
  },
  
  // Rabbit preparation
  rabbit: {
    'raw': ['fresh', 'uncooked'],
    'whole': ['entire', 'complete'],
  },
  
  // Eggs
  egg: {
    'hard boiled': ['hard-boiled', 'boiled', 'cooked'],
    'whole': ['entire', 'complete', 'shell on'],
    'chicken': ['hen'],
  },
  
  // Vegetables - preparation
  vegetable: {
    'raw': ['fresh', 'uncooked'],
    'cooked': ['steamed', 'boiled'],
    'organic': ['organically grown'],
  },
  
  // Carrots
  carrot: {
    'raw': ['fresh', 'uncooked'],
    'baby': ['small', 'mini'],
  },
  
  // Broccoli
  broccoli: {
    'raw': ['fresh', 'uncooked'],
    'florets': ['crowns', 'heads'],
  },
  
  // Spinach
  spinach: {
    'raw': ['fresh', 'uncooked'],
    'baby': ['young', 'tender'],
  },
  
  // Sweet potato
  'sweet potato': {
    'raw': ['fresh', 'uncooked'],
    'yam': ['sweet yam'],
  },
  
  // Peas
  peas: {
    'green': ['garden', 'english'],
    'split': ['dried'],
    'sugar snap': ['snap', 'edible pod'],
  },
  
  // Seeds
  seed: {
    'whole': ['intact', 'unprocessed'],
    'raw': ['unroasted', 'natural'],
    'shelled': ['hulled', 'dehulled'],
  },
  
  // Flax
  flax: {
    'ground': ['milled', 'meal'],
    'whole': ['intact', 'seed'],
  },
  
  // Chia
  chia: {
    'whole': ['intact', 'seed'],
    'black': ['dark'],
  },
  
  // Hemp
  hemp: {
    'hulled': ['shelled', 'hearts'],
    'whole': ['intact', 'seed'],
  },
  
  // Nuts
  nut: {
    'raw': ['unroasted', 'natural', 'unsalted'],
    'whole': ['intact', 'unprocessed'],
    'chopped': ['pieces', 'crushed'],
  },
  
  // Almond
  almond: {
    'raw': ['unroasted', 'natural'],
    'whole': ['intact'],
    'sliced': ['slivered'],
  },
  
  // Walnut
  walnut: {
    'raw': ['unroasted', 'natural'],
    'halves': ['pieces'],
  },
  
  // Oils
  oil: {
    'extra virgin': ['cold pressed', 'unrefined'],
    'refined': ['processed'],
  },
  
  // Fish oil
  'fish oil': {
    'omega 3': ['omega-3', 'dha', 'epa'],
    'liquid': ['oil'],
  },
  
  // Supplements
  supplement: {
    'powder': ['powdered'],
    'capsule': ['pill', 'tablet'],
    'liquid': ['oil', 'tincture'],
  },
  
  // Prebiotic
  prebiotic: {
    'fiber': ['fibre'],
    'inulin': ['chicory root', 'fos'],
  },
  
  // Probiotic
  probiotic: {
    'live': ['active', 'viable'],
    'culture': ['bacteria', 'strain'],
  },
  
  // Joint supplements
  joint: {
    'glucosamine': ['glucosamine sulfate', 'glucosamine hcl'],
    'chondroitin': ['chondroitin sulfate'],
    'msm': ['methylsulfonylmethane'],
  },
  
  // Grains
  grain: {
    'whole': ['intact', 'unprocessed'],
    'rolled': ['flaked'],
  },
  
  // Oats
  oats: {
    'rolled': ['old fashioned', 'flaked'],
    'steel cut': ['irish', 'pinhead'],
    'whole': ['groats'],
  },
  
  // Quinoa
  quinoa: {
    'white': ['ivory'],
    'red': ['crimson'],
    'whole': ['grain'],
  },
  
  // Hay (for pocket pets)
  hay: {
    'timothy': ['grass hay'],
    'alfalfa': ['lucerne'],
    'orchard': ['orchard grass'],
  },
  
  // Pellets
  pellet: {
    'fortified': ['enriched', 'supplemented'],
    'complete': ['balanced', 'all-in-one'],
  },
};

/**
 * Get equivalent tokens for a given ingredient family and canonical token
 */
export function getEquivalentTokens(
  ingredientFamily: string | undefined,
  canonicalToken: string
): string[] {
  if (!ingredientFamily) return [];
  
  const familyMap = TOKEN_EQUIVALENCE[ingredientFamily.toLowerCase()];
  if (!familyMap) return [];
  
  const equivalents = familyMap[canonicalToken.toLowerCase()];
  return equivalents || [];
}

/**
 * Check if a token matches either directly or via equivalence
 */
export function tokenMatches(
  searchToken: string,
  targetText: string,
  ingredientFamily?: string
): { matched: boolean; via: 'direct' | 'equivalent' | null; synonym?: string } {
  const searchLower = searchToken.toLowerCase();
  const targetLower = targetText.toLowerCase();
  
  // Direct match
  if (targetLower.includes(searchLower)) {
    return { matched: true, via: 'direct' };
  }
  
  // Check equivalents
  if (ingredientFamily) {
    const equivalents = getEquivalentTokens(ingredientFamily, searchToken);
    for (const equiv of equivalents) {
      if (targetLower.includes(equiv.toLowerCase())) {
        return { matched: true, via: 'equivalent', synonym: equiv };
      }
    }
  }
  
  return { matched: false, via: null };
}

/**
 * Extract ingredient family from ingredient name
 * Used to determine which equivalence map to use
 */
export function extractIngredientFamily(ingredientName: string): string | undefined {
  const name = ingredientName.toLowerCase();
  
  // Check for known families (order matters - most specific first)
  
  // Specific proteins
  if (name.includes('venison') || name.includes('deer')) return 'venison';
  if (name.includes('rabbit')) return 'rabbit';
  if (name.includes('duck')) return 'duck';
  if (name.includes('pork')) return 'pork';
  if (name.includes('turkey')) return 'turkey';
  if (name.includes('lamb')) return 'lamb';
  if (name.includes('beef')) return 'beef';
  if (name.includes('chicken')) return 'chicken';
  
  // Fish
  if (name.includes('salmon')) return 'salmon';
  if (name.includes('tuna')) return 'tuna';
  if (name.includes('sardine')) return 'sardines';
  if (name.includes('herring')) return 'herring';
  
  // Eggs
  if (name.includes('egg')) return 'egg';
  
  // Specific vegetables
  if (name.includes('sweet potato') || name.includes('yam')) return 'sweet potato';
  if (name.includes('carrot')) return 'carrot';
  if (name.includes('broccoli')) return 'broccoli';
  if (name.includes('spinach')) return 'spinach';
  if (name.includes('pea')) return 'peas';
  
  // Specific seeds
  if (name.includes('flax')) return 'flax';
  if (name.includes('chia')) return 'chia';
  if (name.includes('hemp')) return 'hemp';
  
  // Specific nuts
  if (name.includes('almond')) return 'almond';
  if (name.includes('walnut')) return 'walnut';
  
  // Grains
  if (name.includes('rice')) return 'rice';
  if (name.includes('oat')) return 'oats';
  if (name.includes('quinoa')) return 'quinoa';
  
  // Supplements
  if (name.includes('fish oil') || name.includes('omega')) return 'fish oil';
  if (name.includes('prebiotic') || name.includes('inulin') || name.includes('fos')) return 'prebiotic';
  if (name.includes('probiotic')) return 'probiotic';
  if (name.includes('joint') || name.includes('glucosamine') || name.includes('chondroitin')) return 'joint';
  
  // Hay (pocket pets)
  if (name.includes('hay') || name.includes('timothy') || name.includes('alfalfa')) return 'hay';
  
  // Pellets
  if (name.includes('pellet')) return 'pellet';
  
  // Generic categories
  if (name.includes('seed')) return 'seed';
  if (name.includes('nut')) return 'nut';
  if (name.includes('oil')) return 'oil';
  if (name.includes('supplement')) return 'supplement';
  if (name.includes('vegetable') || name.includes('veggie')) return 'vegetable';
  if (name.includes('grain')) return 'grain';
  
  return undefined;
}
