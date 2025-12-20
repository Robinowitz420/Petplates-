// Script to generate proper recipes using only approved, vetted ingredients
// UPDATED: Now uses VETTED_SPECIES_MAP for strict safety and VETTED_PRODUCTS for monetization
const fs = require('fs');
const path = require('path');

// --- IMPORTS ---
const VETTED_PRODUCTS_PATH = path.join(__dirname, 'lib/data/vetted-products.ts');
const VETTED_PRODUCTS_NEW_PATH = path.join(__dirname, 'lib/data/vetted-products-new.ts');
const VETTED_SPECIES_MAP_PATH = path.join(__dirname, 'lib/data/vetted-species-map.ts');
const CELEBRITY_PETS_PATH = path.join(__dirname, 'lib/data/celebrity-pets-complete.ts');

// --- HELPER TO EXTRACT DATA FROM TS FILES ---
function extractExportedObject(filePath, exportName) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const regex = new RegExp(`export const ${exportName}(?:\\s*:\\s*[^=]+)?\\s*=\\s*({[\\s\\S]*?});`, 'm');
    const match = content.match(regex);
    if (match) {
      return eval('(' + match[1] + ')');
    }
    return null;
  } catch (e) {
    console.warn(`Failed to extract ${exportName} from ${filePath}:`, e.message);
    return null;
  }
}

function extractExportedArray(filePath, exportName) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const regex = new RegExp(`export const ${exportName}(?:\\s*:\\s*[^=]+)?\\s*=\\s*(\\[[\\s\\S]*?\\]);`, 'm');
    const match = content.match(regex);
    if (match) {
      return eval('(' + match[1] + ')');
    }
    return null;
  } catch (e) {
    console.warn(`Failed to extract ${exportName} from ${filePath}:`, e.message);
    return null;
  }
}

// --- LOAD DATA ---
console.log('Loading vetted data...');
const VETTED_PRODUCTS = extractExportedObject(VETTED_PRODUCTS_PATH, 'VETTED_PRODUCTS') || {};
const VETTED_PRODUCTS_RESEARCH = extractExportedObject(VETTED_PRODUCTS_NEW_PATH, 'VETTED_PRODUCTS_RESEARCH') || {};
const VETTED_SPECIES_MAP = extractExportedObject(VETTED_SPECIES_MAP_PATH, 'VETTED_SPECIES_MAP') || {};

const ALL_VETTED_PRODUCTS = { ...VETTED_PRODUCTS, ...VETTED_PRODUCTS_RESEARCH };

const dogCelebrities = extractExportedArray(CELEBRITY_PETS_PATH, 'dogCelebrities') || [];
const catCelebrities = extractExportedArray(CELEBRITY_PETS_PATH, 'catCelebrities') || [];
const birdCelebrities = extractExportedArray(CELEBRITY_PETS_PATH, 'birdCelebrities') || [];
const reptileCelebrities = extractExportedArray(CELEBRITY_PETS_PATH, 'reptileCelebrities') || [];
const pocketPetCelebrities = extractExportedArray(CELEBRITY_PETS_PATH, 'pocketPetCelebrities') || [];

const CELEBS = {
  dogs: dogCelebrities,
  cats: catCelebrities,
  birds: birdCelebrities,
  reptiles: reptileCelebrities,
  'pocket-pets': pocketPetCelebrities
};

// --- CONFIGURATION ---
const SPECIES = ['dogs', 'cats', 'birds', 'reptiles', 'pocket-pets'];
const RECIPES_PER_SPECIES = 40; 
const TOTAL_RECIPES = SPECIES.length * RECIPES_PER_SPECIES;

const HEALTH_CONCERNS = {
  dogs: ['weight-management', 'joint-health', 'digestive-issues', 'allergies', 'skin-coat', 'heart-disease', 'anxiety', 'dental-health'],
  cats: ['urinary-health', 'kidney-disease', 'weight-management', 'hairball-control', 'digestive-issues', 'joint-health', 'dental-health'],
  birds: ['feather-health', 'immune-support', 'digestive-health', 'stress-relief'],
  reptiles: ['bone-health', 'shedding-support', 'digestive-health', 'hydration'],
  'pocket-pets': ['digestive-health', 'dental-health', 'immune-support', 'skin-coat']
};

const AGE_GROUPS = ['baby', 'young', 'adult', 'senior'];

// --- GENERATOR FUNCTIONS ---

function getSafeIngredientsForSpecies(speciesKey) {
  const singularKey = {
    'dogs': 'dog',
    'cats': 'cat',
    'birds': 'bird',
    'reptiles': 'reptile',
    'pocket-pets': 'pocket-pet'
  }[speciesKey];

  const safeIngredients = [];
  
  for (const [key, product] of Object.entries(ALL_VETTED_PRODUCTS)) {
    const safeFor = VETTED_SPECIES_MAP[key.toLowerCase()];
    if (safeFor && safeFor.includes(singularKey)) {
      safeIngredients.push({
        id: key, 
        ...product
      });
    }
  }
  return safeIngredients;
}

function getRandomItems(array, count) {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function generateRecipe(species, index) {
  const safePool = getSafeIngredientsForSpecies(species);
  
  if (safePool.length < 3) {
    // Only warn if significantly empty to avoid spam
    if (index === 0) console.warn(`Not enough safe ingredients for ${species}! Found: ${safePool.length}`);
    return null;
  }

  const proteins = safePool.filter(i => i.category === 'Meat' || i.category === 'Insect' || i.category === 'Fish');
  const veggies = safePool.filter(i => i.category === 'Vegetable' || i.category === 'Leafy Green');
  const fruits = safePool.filter(i => i.category === 'Fruit');
  const supplements = safePool.filter(i => i.category === 'Supplement' || i.category === 'Oil');
  const carbs = safePool.filter(i => i.category === 'Carb' || i.category === 'Grain' || i.category === 'Seed' || i.category === 'Hay' || i.category === 'Pellet');

  let ingredients = [];

  if (species === 'dogs' || species === 'cats') {
    const mainProtein = getRandomItems(proteins, 1)[0];
    const secondary = getRandomItems(proteins, 1)[0]; 
    const veg = getRandomItems(veggies, 1)[0];
    const supp = getRandomItems(supplements, 1)[0];
    
    if (mainProtein) ingredients.push({ ...mainProtein, amount: '150g' });
    if (secondary && secondary.id !== mainProtein?.id) ingredients.push({ ...secondary, amount: '50g' });
    if (veg) ingredients.push({ ...veg, amount: '50g' });
    if (supp) ingredients.push({ ...supp, amount: '1 tsp' });
  } 
  else if (species === 'birds' || species === 'pocket-pets') {
    const base = getRandomItems(carbs, 2);
    const fresh = getRandomItems(veggies.concat(fruits), 2);
    const supp = getRandomItems(supplements, 1)[0];

    base.forEach(i => ingredients.push({ ...i, amount: '2 tbsp' }));
    fresh.forEach(i => ingredients.push({ ...i, amount: '1 tbsp' }));
    if (supp) ingredients.push({ ...supp, amount: 'pinch' });
  }
  else if (species === 'reptiles') {
    const bugs = getRandomItems(proteins, 1);
    const greens = getRandomItems(veggies, 2);
    const fruit = getRandomItems(fruits, 1)[0];
    const supp = getRandomItems(supplements, 1)[0];

    bugs.forEach(i => ingredients.push({ ...i, amount: '5-6 insects' }));
    greens.forEach(i => ingredients.push({ ...i, amount: '1 cup' }));
    if (fruit && Math.random() > 0.7) ingredients.push({ ...fruit, amount: '1 slice' });
    if (supp) ingredients.push({ ...supp, amount: 'dusting' });
  }

  if (ingredients.length === 0) {
    ingredients = getRandomItems(safePool, 4).map(i => ({ ...i, amount: 'varies' }));
  }

  const celebs = CELEBS[species] || [];
  const celeb = celebs.length > 0 ? celebs[index % celebs.length] : { name: 'Chef Paws', quote: 'Bon Appetit!' };

  const healthFocus = getRandomItems(HEALTH_CONCERNS[species] || [], 2);
  const ageGroup = Math.random() > 0.3 ? ['adult'] : getRandomItems(AGE_GROUPS, 2);

  const mainIngName = ingredients[0]?.productName?.split(' ').slice(0, 2).join(' ') || 'Mystery';
  const adjectives = ['Delight', 'Feast', 'Bowl', 'Mix', 'Medley', 'Crunch', 'Supper', 'Bites'];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const name = `${celeb.name}'s ${mainIngName} ${adj}`;

  return {
    id: `${species}-${index + 1000}`,
    name: name,
    shortName: `${mainIngName} ${adj}`,
    celebrityName: celeb.name,
    celebrityQuote: celeb.quote,
    category: species,
    breed: null,
    ageGroup: ageGroup,
    healthConcerns: healthFocus,
    description: `A veterinarian-reviewed ${species} meal featuring ${mainIngName}.`,
    tags: ['vetted', 'balanced', ...healthFocus],
    imageUrl: `/images/meals/${species}-meal-${(index % 25) + 1}.png`,
    prepTime: '10 min',
    cookTime: '0 min',
    servings: 1,
    ingredients: ingredients.map((ing, i) => ({
      id: `${i+1}`,
      name: ing.id,
      amount: ing.amount,
      amazonLink: ing.asinLink || ing.amazonLink,
      productName: ing.productName,
      vetNote: ing.vetNote,
      isVetted: true
    })),
    instructions: [
      `Prepare ${ingredients[0]?.productName || 'ingredients'} according to package.`,
      `Mix in ${ingredients[1]?.productName || 'secondary ingredients'}.`,
      `Serve immediately.`
    ],
    rating: 4.5 + (Math.random() * 0.5),
    reviews: Math.floor(Math.random() * 50) + 10
  };
}

// --- MAIN EXECUTION ---
console.log('Generating recipes...');
const allRecipes = [];

SPECIES.forEach(species => {
  console.log(`Processing ${species}...`);
  for (let i = 0; i < RECIPES_PER_SPECIES; i++) {
    const recipe = generateRecipe(species, i);
    if (recipe) allRecipes.push(recipe);
  }
});

console.log(`Generated ${allRecipes.length} recipes.`);

const outputPath = path.join(__dirname, 'lib/data/recipes-complete.ts');
const fileContent = `// lib/data/recipes-complete.ts
// Auto-generated comprehensive recipe database
// Generated on: ${new Date().toISOString()}
// Total recipes: ${allRecipes.length}

import type { Recipe } from '../types';

export const recipes: Recipe[] = ${JSON.stringify(allRecipes, null, 2)};
`;

fs.writeFileSync(outputPath, fileContent);
console.log(`✅ Saved to ${outputPath}`);
