// Retail specs for high-priority ingredients
// These define what makes a product valid for each ingredient
// 
// IMPORTANT: Specs should only encode retail form constraints, NOT quality/nutrition
// - YES: identity (chicken vs beef), preparation (raw vs cooked), medium (water vs oil)
// - NO: organic, grass-fed, quality language, micronutrients

import { IngredientRetailSpec } from '../types/retailValidation';

export const RETAIL_SPECS: Record<string, IngredientRetailSpec> = {
  // MEATS - High Priority Issues
  'venison': {
    requiredTokens: ['venison', 'deer'],
    forbiddenTokens: ['beef', 'seasoned', 'jerky', 'cooked', 'smoked', 'marinated', 'sausage'],
    acceptableForms: ['raw', 'ground', 'frozen', 'fresh'],
    validationRules: {
      titleMatch: 'strict',
      allowGenericBrand: true,
      caseSensitive: false,
    },
  },
  
  'rabbit meat': {
    requiredTokens: ['rabbit'],
    forbiddenTokens: ['lamb', 'seasoned', 'cooked', 'smoked', 'marinated'],
    acceptableForms: ['raw', 'ground', 'frozen', 'fresh', 'whole'],
    validationRules: {
      titleMatch: 'strict',
      allowGenericBrand: true,
      caseSensitive: false,
    },
  },
  
  'turkey giblets': {
    requiredTokens: ['turkey', 'giblets'],
    forbiddenTokens: ['chicken', 'seasoned', 'cooked', 'gravy'],
    acceptableForms: ['raw', 'frozen', 'fresh'],
    validationRules: {
      titleMatch: 'strict',
      allowGenericBrand: true,
      caseSensitive: false,
    },
  },
  
  'ground beef (lean)': {
    requiredTokens: ['beef', 'ground'],
    forbiddenTokens: ['venison', 'seasoned', 'cooked', 'patties', 'burger'],
    acceptableForms: ['raw', 'frozen', 'fresh', 'lean'],
    validationRules: {
      titleMatch: 'strict',
      allowGenericBrand: true,
      caseSensitive: false,
    },
  },
  
  'ground lamb': {
    requiredTokens: ['lamb', 'ground'],
    forbiddenTokens: ['rabbit', 'beef', 'seasoned', 'cooked', 'kebab', 'kofta'],
    acceptableForms: ['raw', 'frozen', 'fresh'],
    validationRules: {
      titleMatch: 'strict',
      allowGenericBrand: true,
      caseSensitive: false,
    },
  },
  
  'chicken hearts': {
    requiredTokens: ['chicken', 'hearts'],
    forbiddenTokens: ['turkey', 'duck', 'seasoned', 'cooked'],
    acceptableForms: ['raw', 'frozen', 'fresh'],
    validationRules: {
      titleMatch: 'strict',
      allowGenericBrand: true,
      caseSensitive: false,
    },
  },
  
  'duck hearts': {
    requiredTokens: ['duck', 'hearts'],
    forbiddenTokens: ['chicken', 'turkey', 'egg', 'seasoned', 'cooked'],
    acceptableForms: ['raw', 'frozen', 'fresh'],
    validationRules: {
      titleMatch: 'strict',
      allowGenericBrand: true,
      caseSensitive: false,
    },
  },
  
  // FISH - High Priority Issues
  'herring (canned)': {
    requiredTokens: ['herring'],
    forbiddenTokens: ['sardines', 'sardine', 'smoked', 'pickled', 'creamed', 'in oil'],
    acceptableForms: ['canned', 'in water', 'water packed'],
    validationRules: {
      titleMatch: 'strict',
      allowGenericBrand: true,
      caseSensitive: false,
    },
  },
  
  'sardines (canned in water)': {
    requiredTokens: ['sardines', 'water'],
    forbiddenTokens: ['herring', 'in oil', 'smoked', 'tomato'],
    acceptableForms: ['canned', 'water packed'],
    validationRules: {
      titleMatch: 'strict',
      allowGenericBrand: true,
      caseSensitive: false,
    },
  },
  
  'sardines (in water)': {
    requiredTokens: ['sardines', 'water'],
    forbiddenTokens: ['herring', 'in oil', 'smoked', 'tomato'],
    acceptableForms: ['canned', 'water packed'],
    validationRules: {
      titleMatch: 'strict',
      allowGenericBrand: true,
      caseSensitive: false,
    },
  },
  
  // SEEDS - High Priority Issues
  'canary seed': {
    requiredTokens: ['canary', 'seed'],
    forbiddenTokens: ['mix', 'blend', 'treat'],
    validationRules: {
      titleMatch: 'flexible', // Seed mixes might be OK
      allowGenericBrand: true,
      caseSensitive: false,
    },
  },
  
  'flaxseeds': {
    requiredTokens: ['flax'],
    forbiddenTokens: ['oil', 'meal', 'capsule', 'supplement'],
    acceptableForms: ['seed', 'seeds', 'whole', 'ground'],
    validationRules: {
      titleMatch: 'strict',
      allowGenericBrand: true,
      caseSensitive: false,
    },
  },
  
  'niger seed': {
    requiredTokens: ['niger', 'nyjer', 'thistle'],
    forbiddenTokens: ['mix', 'blend'],
    validationRules: {
      titleMatch: 'flexible',
      allowGenericBrand: true,
      caseSensitive: false,
    },
  },
  
  'hemp seeds': {
    requiredTokens: ['hemp', 'seed'],
    forbiddenTokens: ['oil', 'protein', 'powder', 'hearts'],
    acceptableForms: ['seed', 'seeds', 'whole', 'hulled'],
    validationRules: {
      titleMatch: 'strict',
      allowGenericBrand: true,
      caseSensitive: false,
    },
  },
  
  'chia seeds': {
    requiredTokens: ['chia', 'seed'],
    forbiddenTokens: ['oil', 'powder', 'gel'],
    acceptableForms: ['seed', 'seeds', 'whole'],
    validationRules: {
      titleMatch: 'strict',
      allowGenericBrand: true,
      caseSensitive: false,
    },
  },
  
  'sunflower seeds (small amounts)': {
    requiredTokens: ['sunflower', 'seed'],
    forbiddenTokens: ['oil', 'roasted', 'salted', 'flavored'],
    acceptableForms: ['raw', 'shelled', 'unshelled'],
    validationRules: {
      titleMatch: 'strict',
      allowGenericBrand: true,
      caseSensitive: false,
    },
  },
  
  'pumpkin seeds': {
    requiredTokens: ['pumpkin', 'seed'],
    forbiddenTokens: ['oil', 'roasted', 'salted', 'flavored'],
    acceptableForms: ['raw', 'shelled', 'pepitas'],
    validationRules: {
      titleMatch: 'strict',
      allowGenericBrand: true,
      caseSensitive: false,
    },
  },
  
  // OILS - High Priority Issues
  'chia seed oil': {
    requiredTokens: ['chia', 'oil'],
    forbiddenTokens: ['mango', 'blend', 'capsule'],
    validationRules: {
      titleMatch: 'strict',
      allowGenericBrand: true,
      caseSensitive: false,
    },
  },
  
  // EGGS - High Priority Issues
  'egg (hard-boiled)': {
    requiredTokens: ['egg'],
    forbiddenTokens: ['duck', 'quail', 'liquid', 'powder', 'substitute'],
    acceptableForms: ['hard boiled', 'hard-boiled', 'boiled', 'whole'],
    validationRules: {
      titleMatch: 'strict',
      allowGenericBrand: true,
      caseSensitive: false,
    },
  },
  
  // VEGETABLES - Dead Link
  'endive': {
    requiredTokens: ['endive'],
    forbiddenTokens: [],
    acceptableForms: ['fresh', 'organic'],
    validationRules: {
      titleMatch: 'strict',
      allowGenericBrand: true,
      caseSensitive: false,
    },
  },
  
  // GRAINS
  'brown rice': {
    requiredTokens: ['brown', 'rice'],
    forbiddenTokens: ['white', 'instant', 'minute', 'flavored', 'seasoned'],
    acceptableForms: ['whole grain', 'long grain', 'short grain'],
    validationRules: {
      titleMatch: 'flexible',
      allowGenericBrand: true,
      caseSensitive: false,
    },
  },
  
  'rice (hulled)': {
    requiredTokens: ['rice', 'hulled'],
    forbiddenTokens: ['white', 'instant', 'minute', 'flavored', 'seasoned'],
    validationRules: {
      titleMatch: 'flexible',
      allowGenericBrand: true,
      caseSensitive: false,
    },
  },
  
  // COMMON PROTEINS - Dogs/Cats
  'ground chicken': {
    requiredTokens: ['chicken', 'ground'],
    forbiddenTokens: ['giblets', 'liver', 'hearts', 'seasoned', 'cooked', 'breaded'],
    acceptableForms: ['raw', 'fresh', 'frozen'],
    validationRules: {
      titleMatch: 'strict',
      allowGenericBrand: true,
      caseSensitive: false,
    },
  },
  
  'chicken breast': {
    requiredTokens: ['chicken', 'breast'],
    forbiddenTokens: ['seasoned', 'cooked', 'breaded', 'marinated', 'fried'],
    acceptableForms: ['raw', 'fresh', 'frozen', 'boneless'],
    validationRules: {
      titleMatch: 'strict',
      allowGenericBrand: true,
      caseSensitive: false,
    },
  },
  
  'chicken thighs': {
    requiredTokens: ['chicken', 'thigh'],
    forbiddenTokens: ['seasoned', 'cooked', 'breaded', 'marinated', 'fried'],
    acceptableForms: ['raw', 'fresh', 'frozen', 'boneless'],
    validationRules: {
      titleMatch: 'strict',
      allowGenericBrand: true,
      caseSensitive: false,
    },
  },
  
  'beef liver': {
    requiredTokens: ['beef', 'liver'],
    forbiddenTokens: ['pork', 'chicken', 'seasoned', 'cooked'],
    acceptableForms: ['raw', 'fresh', 'frozen'],
    validationRules: {
      titleMatch: 'strict',
      allowGenericBrand: true,
      caseSensitive: false,
    },
  },
  
  'ground turkey': {
    requiredTokens: ['turkey', 'ground'],
    forbiddenTokens: ['chicken', 'seasoned', 'cooked', 'patties'],
    acceptableForms: ['raw', 'fresh', 'frozen'],
    validationRules: {
      titleMatch: 'strict',
      allowGenericBrand: true,
      caseSensitive: false,
    },
  },
  
  'salmon (canned)': {
    requiredTokens: ['salmon'],
    forbiddenTokens: ['smoked', 'seasoned', 'in oil'],
    acceptableForms: ['canned', 'in water', 'water packed'],
    validationRules: {
      titleMatch: 'strict',
      allowGenericBrand: true,
      caseSensitive: false,
    },
  },
  
  'tuna (canned in water)': {
    requiredTokens: ['tuna', 'water'],
    forbiddenTokens: ['in oil', 'seasoned', 'flavored'],
    acceptableForms: ['canned', 'water packed'],
    validationRules: {
      titleMatch: 'strict',
      allowGenericBrand: true,
      caseSensitive: false,
    },
  },
  
  // COMMON VEGETABLES
  'carrots': {
    requiredTokens: ['carrot'],
    forbiddenTokens: ['candied', 'glazed', 'seasoned'],
    acceptableForms: ['raw', 'fresh', 'baby', 'whole'],
    validationRules: {
      titleMatch: 'flexible',
      allowGenericBrand: true,
      caseSensitive: false,
    },
  },
  
  'broccoli': {
    requiredTokens: ['broccoli'],
    forbiddenTokens: ['cheese', 'seasoned', 'sauce'],
    acceptableForms: ['raw', 'fresh', 'frozen', 'florets'],
    validationRules: {
      titleMatch: 'flexible',
      allowGenericBrand: true,
      caseSensitive: false,
    },
  },
  
  'spinach': {
    requiredTokens: ['spinach'],
    forbiddenTokens: ['creamed', 'seasoned', 'sauce'],
    acceptableForms: ['raw', 'fresh', 'frozen', 'baby'],
    validationRules: {
      titleMatch: 'flexible',
      allowGenericBrand: true,
      caseSensitive: false,
    },
  },
  
  'sweet potato': {
    requiredTokens: ['sweet potato'],
    forbiddenTokens: ['candied', 'glazed', 'seasoned', 'fries'],
    acceptableForms: ['raw', 'fresh', 'whole'],
    validationRules: {
      titleMatch: 'flexible',
      allowGenericBrand: true,
      caseSensitive: false,
    },
  },
  
  'pumpkin (canned)': {
    requiredTokens: ['pumpkin'],
    forbiddenTokens: ['pie filling', 'spice', 'seasoned'],
    acceptableForms: ['canned', 'puree', 'pure'],
    validationRules: {
      titleMatch: 'strict',
      allowGenericBrand: true,
      caseSensitive: false,
    },
  },
  
  // COMMON SUPPLEMENTS
  'fish oil': {
    requiredTokens: ['fish', 'oil'],
    forbiddenTokens: ['capsule only'],
    acceptableForms: ['liquid', 'omega-3', 'omega 3'],
    validationRules: {
      titleMatch: 'strict',
      allowGenericBrand: true,
      caseSensitive: false,
    },
  },
  
  'salmon oil': {
    requiredTokens: ['salmon', 'oil'],
    forbiddenTokens: [],
    acceptableForms: ['liquid', 'omega-3', 'omega 3'],
    validationRules: {
      titleMatch: 'strict',
      allowGenericBrand: true,
      caseSensitive: false,
    },
  },
  
  'coconut oil': {
    requiredTokens: ['coconut', 'oil'],
    forbiddenTokens: ['scented', 'cosmetic'],
    acceptableForms: ['virgin', 'unrefined', 'refined'],
    validationRules: {
      titleMatch: 'strict',
      allowGenericBrand: true,
      caseSensitive: false,
    },
  },
  
  'probiotic': {
    requiredTokens: ['probiotic'],
    forbiddenTokens: [],
    acceptableForms: ['powder', 'capsule', 'supplement'],
    validationRules: {
      titleMatch: 'flexible',
      allowGenericBrand: true,
      caseSensitive: false,
    },
  },
  
  'digestive enzyme': {
    requiredTokens: ['digestive', 'enzyme'],
    forbiddenTokens: [],
    acceptableForms: ['powder', 'capsule', 'supplement'],
    validationRules: {
      titleMatch: 'flexible',
      allowGenericBrand: true,
      caseSensitive: false,
    },
  },
  
  // GRAINS
  'oats': {
    requiredTokens: ['oat'],
    forbiddenTokens: ['instant', 'flavored', 'sweetened'],
    acceptableForms: ['rolled', 'steel cut', 'whole'],
    validationRules: {
      titleMatch: 'flexible',
      allowGenericBrand: true,
      caseSensitive: false,
    },
  },
  
  'quinoa': {
    requiredTokens: ['quinoa'],
    forbiddenTokens: ['flavored', 'seasoned', 'instant'],
    acceptableForms: ['white', 'red', 'tri-color', 'whole'],
    validationRules: {
      titleMatch: 'flexible',
      allowGenericBrand: true,
      caseSensitive: false,
    },
  },
  
  'barley': {
    requiredTokens: ['barley'],
    forbiddenTokens: ['pearled only', 'instant'],
    acceptableForms: ['whole', 'hulled', 'pearled'],
    validationRules: {
      titleMatch: 'flexible',
      allowGenericBrand: true,
      caseSensitive: false,
    },
  },
};
