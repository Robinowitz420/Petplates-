// Centralized ingredient name normalization
// Maps between display names, composition keys, and price lookup names

const INGREDIENT_NAME_MAP: Record<string, {
  display: string;
  compositionKey: string;
  priceKey: string;
}> = {
  // Proteins
  'ground chicken': {
    display: 'ground chicken',
    compositionKey: 'ground_chicken',
    priceKey: 'ground chicken'
  },
  'ground turkey': {
    display: 'ground turkey',
    compositionKey: 'ground_turkey',
    priceKey: 'ground turkey'
  },
  'ground beef (lean)': {
    display: 'ground beef (lean)',
    compositionKey: 'ground_beef_lean',
    priceKey: 'ground beef (lean)'
  },
  'ground lamb': {
    display: 'ground lamb',
    compositionKey: 'ground_lamb',
    priceKey: 'ground lamb'
  },
  'salmon (boneless)': {
    display: 'salmon (boneless)',
    compositionKey: 'salmon_atlantic',
    priceKey: 'salmon (boneless)'
  },
  'chicken breast': {
    display: 'chicken breast',
    compositionKey: 'chicken_breast',
    priceKey: 'chicken breast'
  },
  'chicken thighs': {
    display: 'chicken thighs',
    compositionKey: 'chicken_thighs',
    priceKey: 'chicken thighs'
  },
  'turkey breast': {
    display: 'turkey breast',
    compositionKey: 'turkey_breast',
    priceKey: 'turkey breast'
  },
  'beef liver': {
    display: 'beef liver',
    compositionKey: 'beef_liver',
    priceKey: 'beef liver'
  },
  'chicken liver': {
    display: 'chicken liver',
    compositionKey: 'chicken_liver',
    priceKey: 'chicken liver'
  },
  'chicken hearts': {
    display: 'chicken hearts',
    compositionKey: 'chicken_hearts',
    priceKey: 'chicken hearts'
  },
  'sardines (canned in water)': {
    display: 'sardines (canned in water)',
    compositionKey: 'sardines_water',
    priceKey: 'sardines (canned in water)'
  },
  'eggs': {
    display: 'eggs',
    compositionKey: 'eggs_whole',
    priceKey: 'eggs'
  },
  'quail': {
    display: 'quail',
    compositionKey: 'quail',
    priceKey: 'quail'
  },
  'ground pork (lean)': {
    display: 'ground pork (lean)',
    compositionKey: 'ground_pork_lean',
    priceKey: 'ground pork (lean)'
  },
  'turkey necks': {
    display: 'turkey necks',
    compositionKey: 'turkey_necks',
    priceKey: 'turkey necks'
  },
  'tuna': {
    display: 'tuna',
    compositionKey: 'tuna_water',
    priceKey: 'tuna'
  },

  // Carbs
  'brown rice': {
    display: 'brown rice',
    compositionKey: 'brown_rice_cooked',
    priceKey: 'brown rice'
  },
  'white rice': {
    display: 'white rice',
    compositionKey: 'white_rice_cooked',
    priceKey: 'white rice'
  },
  'quinoa': {
    display: 'quinoa',
    compositionKey: 'quinoa_cooked',
    priceKey: 'quinoa'
  },
  'sweet potato': {
    display: 'sweet potato',
    compositionKey: 'sweet_potato',
    priceKey: 'sweet potato'
  },
  'oats': {
    display: 'oats',
    compositionKey: 'oats',
    priceKey: 'oats'
  },
  'pumpkin': {
    display: 'pumpkin',
    compositionKey: 'pumpkin',
    priceKey: 'pumpkin'
  },
  'lentils': {
    display: 'lentils',
    compositionKey: 'lentils',
    priceKey: 'lentils'
  },
  'chickpeas': {
    display: 'chickpeas',
    compositionKey: 'chickpeas',
    priceKey: 'chickpeas'
  },
  'black beans': {
    display: 'black beans',
    compositionKey: 'black_beans',
    priceKey: 'black beans'
  },
  'green peas': {
    display: 'green peas',
    compositionKey: 'green_peas',
    priceKey: 'green peas'
  },

  // Vegetables
  'carrots': {
    display: 'carrots',
    compositionKey: 'carrots_raw',
    priceKey: 'carrots'
  },
  'green beans': {
    display: 'green beans',
    compositionKey: 'green_beans_raw',
    priceKey: 'green beans'
  },
  'spinach': {
    display: 'spinach',
    compositionKey: 'spinach_raw',
    priceKey: 'spinach'
  },
  'broccoli': {
    display: 'broccoli',
    compositionKey: 'broccoli_raw',
    priceKey: 'broccoli'
  },
  'zucchini': {
    display: 'zucchini',
    compositionKey: 'zucchini',
    priceKey: 'zucchini'
  },
  'kale': {
    display: 'kale',
    compositionKey: 'kale_raw',
    priceKey: 'kale'
  },
  'celery': {
    display: 'celery',
    compositionKey: 'celery_raw',
    priceKey: 'celery'
  },
  'brussels sprouts': {
    display: 'brussels sprouts',
    compositionKey: 'brussels_sprouts',
    priceKey: 'brussels sprouts'
  },
  'asparagus': {
    display: 'asparagus',
    compositionKey: 'asparagus',
    priceKey: 'asparagus'
  },
  'parsley': {
    display: 'parsley',
    compositionKey: 'parsley',
    priceKey: 'parsley'
  },
  'cucumber': {
    display: 'cucumber',
    compositionKey: 'celery_raw',
    priceKey: 'cucumber'
  },
  'lettuce (romaine)': {
    display: 'lettuce (romaine)',
    compositionKey: 'lettuce_romaine',
    priceKey: 'lettuce (romaine)'
  },
  'arugula': {
    display: 'arugula',
    compositionKey: 'arugula',
    priceKey: 'arugula'
  },
  'bok choy': {
    display: 'bok choy',
    compositionKey: 'bok_choy',
    priceKey: 'bok choy'
  },

  // Fruits
  'blueberries': {
    display: 'blueberries',
    compositionKey: 'blueberries_raw',
    priceKey: 'blueberries'
  },
  'bananas': {
    display: 'bananas',
    compositionKey: 'bananas_raw',
    priceKey: 'bananas'
  },

  // Additional proteins
  'turkey giblets': {
    display: 'turkey giblets',
    compositionKey: 'turkey_giblets',
    priceKey: 'turkey giblets'
  },
  'chicken giblets': {
    display: 'chicken giblets',
    compositionKey: 'chicken_giblets',
    priceKey: 'chicken giblets'
  },
  'duck breast': {
    display: 'duck breast',
    compositionKey: 'duck_breast',
    priceKey: 'duck breast'
  },
  'venison': {
    display: 'venison',
    compositionKey: 'venison',
    priceKey: 'venison'
  },
  'rabbit meat': {
    display: 'rabbit meat',
    compositionKey: 'rabbit_meat',
    priceKey: 'rabbit meat'
  },

  // Additional carbs
  'barley': {
    display: 'barley',
    compositionKey: 'barley',
    priceKey: 'barley'
  },
  'butternut squash': {
    display: 'butternut squash',
    compositionKey: 'butternut_squash',
    priceKey: 'butternut squash'
  },
  'acorn squash': {
    display: 'acorn squash',
    compositionKey: 'acorn_squash',
    priceKey: 'acorn squash'
  },

  // Additional vegetables
  'bell peppers': {
    display: 'bell peppers',
    compositionKey: 'bell_peppers',
    priceKey: 'bell peppers'
  },
  'bell peppers (red/green)': {
    display: 'bell peppers (red/green)',
    compositionKey: 'bell_peppers',
    priceKey: 'bell peppers'
  },
  'peas': {
    display: 'peas',
    compositionKey: 'peas',
    priceKey: 'peas'
  },
  'endive': {
    display: 'endive',
    compositionKey: 'endive',
    priceKey: 'endive'
  },
  'collard greens': {
    display: 'collard greens',
    compositionKey: 'collard_greens',
    priceKey: 'collard greens'
  },
  'mustard greens': {
    display: 'mustard greens',
    compositionKey: 'mustard_greens',
    priceKey: 'mustard greens'
  },
  'swiss chard': {
    display: 'swiss chard',
    compositionKey: 'swiss_chard',
    priceKey: 'swiss chard'
  },
  'cauliflower': {
    display: 'cauliflower',
    compositionKey: 'cauliflower',
    priceKey: 'cauliflower'
  },

  // Oils and fats
  'salmon oil': {
    display: 'salmon oil',
    compositionKey: 'salmon_oil',
    priceKey: 'salmon oil'
  },
  'fish oil': {
    display: 'fish oil',
    compositionKey: 'fish_oil',
    priceKey: 'fish oil'
  },
  'cod liver oil': {
    display: 'cod liver oil',
    compositionKey: 'cod_liver_oil',
    priceKey: 'cod liver oil'
  },
  'coconut oil': {
    display: 'coconut oil',
    compositionKey: 'coconut_oil',
    priceKey: 'coconut oil'
  },
  'olive oil': {
    display: 'olive oil',
    compositionKey: 'olive_oil',
    priceKey: 'olive oil'
  },

  // Supplements
  'calcium carbonate': {
    display: 'calcium carbonate',
    compositionKey: 'calcium_carbonate',
    priceKey: 'calcium carbonate'
  },
  'taurine powder': {
    display: 'taurine powder',
    compositionKey: 'taurine_powder',
    priceKey: 'taurine powder'
  },
};

export function getCompositionKey(displayName: string): string {
  const normalized = displayName.toLowerCase().trim();
  const mapping = INGREDIENT_NAME_MAP[normalized];
  if (mapping) {
    return mapping.compositionKey;
  }
  // Fallback: normalize to underscore format (handles unmapped ingredients)
  return normalized
    .replace(/\s*\([^)]*\)/g, '')
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
}

export function getPriceKey(displayName: string): string {
  const normalized = displayName.toLowerCase().trim();
  const mapping = INGREDIENT_NAME_MAP[normalized];
  if (mapping) {
    return mapping.priceKey;
  }
  // Fallback: use lowercase version for price lookup
  return normalized;
}

export function getDisplayName(compositionKeyOrPrice: string): string {
  const normalized = compositionKeyOrPrice.toLowerCase().trim();
  // Search through map for matching composition key or price key
  for (const [display, mapping] of Object.entries(INGREDIENT_NAME_MAP)) {
    if (mapping.compositionKey === normalized || mapping.priceKey === normalized) {
      return mapping.display;
    }
  }
  // Fallback: convert underscore format back to display format
  return normalized
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
