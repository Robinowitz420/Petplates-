/**
 * Extract top 4-5 ingredients from commercial products
 * Translate to English and normalize to registry names
 */

import * as fs from 'fs/promises';

interface CommercialProduct {
  brand: string;
  productName: string;
  speciesHint: string[];
  ingredientsList: Array<{ name: string; position: number }>;
}

// Translation map: foreign -> English
const TRANSLATIONS: Record<string, string> = {
  // French
  'viandes et sous-produits animaux': 'meat',
  'viandes': 'meat',
  'viande': 'meat',
  'poulet': 'chicken',
  'boeuf': 'beef',
  'agneau': 'lamb',
  'canard': 'duck',
  'dinde': 'turkey',
  'poisson': 'fish',
  'saumon': 'salmon',
  'thon': 'tuna',
  'céréales': 'grain',
  'blé': 'wheat',
  'maïs': 'corn',
  'riz': 'rice',
  'avoine': 'oats',
  'légumes': 'vegetable',
  'carottes': 'carrot',
  'petits pois': 'peas',
  'pommes de terre': 'potato',
  'patates douces': 'sweet_potato',
  'huiles et graisses': 'fat',
  'huile de poisson': 'fish_oil',
  'graisse de volaille': 'chicken_fat',
  'graisse de canard': 'duck_fat',
  'pulpe de betterave': 'beet_pulp',
  'sous-produits d\'origine végétale': 'vegetable',
  'substances minérales': 'minerals',
  'levures': 'yeast',
  'levure': 'yeast',
  'poudre d\'oeuf': 'egg',
  'oeuf': 'egg',
  
  // Italian
  'carni e derivati': 'meat',
  'carni': 'meat',
  'carne': 'meat',
  'pollo': 'chicken',
  'manzo': 'beef',
  'agnello': 'lamb',
  'pesce': 'fish',
  'tonno': 'tuna',
  'cereali': 'grain',
  'grano': 'wheat',
  'mais': 'corn',
  'riso': 'rice',
  'verdure': 'vegetable',
  'carote': 'carrot',
  'piselli': 'peas',
  'patate': 'potato',
  'oli e grassi': 'fat',
  'oli': 'oil',
  'grassi': 'fat',
  'sottoprodotti di origine vegetale': 'vegetable',
  'sostanze minerali': 'minerals',
  'lievito': 'yeast',
  'uova': 'egg',
  
  // German
  'fleisch': 'meat',
  'huhn': 'chicken',
  'hühnerfleisch': 'chicken',
  'rind': 'beef',
  'rindfleisch': 'beef',
  'lamm': 'lamb',
  'lammfleisch': 'lamb',
  'pute': 'turkey',
  'putenfleisch': 'turkey',
  'ente': 'duck',
  'fisch': 'fish',
  'lachs': 'salmon',
  'thunfisch': 'tuna',
  'getreide': 'grain',
  'weizen': 'wheat',
  'reis': 'rice',
  'hafer': 'oats',
  'gemüse': 'vegetable',
  'karotten': 'carrot',
  'möhren': 'carrot',
  'erbsen': 'peas',
  'kartoffeln': 'potato',
  'mineralstoffe': 'minerals',
  
  // Spanish (only add unique ones not in Italian)
  'ternera': 'beef',
  'cordero': 'lamb',
  'pavo': 'turkey',
  'pato': 'duck',
  'pescado': 'fish',
  'salmón': 'salmon',
  'atún': 'tuna',
  'trigo': 'wheat',
  'maíz': 'corn',
  'arroz': 'rice',
  'verduras': 'vegetable',
  'zanahorias': 'carrot',
  'guisantes': 'peas',
  'patatas': 'potato',
  
  // English variations
  'meat and animal derivatives': 'meat',
  'meat and animal by-products': 'meat',
  'animal by-products': 'meat',
  'chicken meal': 'chicken',
  'chicken by-product': 'chicken',
  'beef meal': 'beef',
  'lamb meal': 'lamb',
  'fish meal': 'fish',
  'salmon meal': 'salmon',
  'ocean fish': 'fish',
  'corn meal': 'corn',
  'ground corn': 'corn',
  'brewers rice': 'rice',
  'brown rice': 'rice',
  'white rice': 'rice',
  'whole grain': 'grain',
  'vegetable oil': 'vegetable_oil',
  'chicken fat': 'chicken_fat',
  'animal fat': 'fat',
  'beet pulp': 'beet_pulp',
  'dried beet pulp': 'beet_pulp',
  'sweet potato': 'sweet_potato',
  'dried sweet potato': 'sweet_potato',
};

async function extractTopIngredients() {
  const data = await fs.readFile('./output/commercial-products-2025-12-19T02-57-56.json', 'utf-8');
  const products: CommercialProduct[] = JSON.parse(data);
  
  console.log(`\n📊 Extracting top 5 ingredients from ${products.length} products...\n`);
  
  const topIngredientPairs: Record<string, number> = {};
  const ingredientFrequency: Record<string, number> = {};
  let successCount = 0;
  
  for (const product of products) {
    // Get top 5 ingredients (positions 1-5)
    const topIngredients = product.ingredientsList
      .filter(i => i.position <= 5)
      .map(i => translateAndNormalize(i.name))
      .filter(i => i !== 'unknown' && i !== 'minerals' && i !== 'vitamins');
    
    if (topIngredients.length >= 2) {
      successCount++;
      
      // Count individual ingredients
      topIngredients.forEach(ing => {
        ingredientFrequency[ing] = (ingredientFrequency[ing] || 0) + 1;
      });
      
      // Count pairs
      for (let i = 0; i < topIngredients.length; i++) {
        for (let j = i + 1; j < topIngredients.length; j++) {
          const pair = [topIngredients[i], topIngredients[j]].sort().join('|');
          topIngredientPairs[pair] = (topIngredientPairs[pair] || 0) + 1;
        }
      }
    }
  }
  
  console.log(`✅ Extracted top ingredients from ${successCount}/${products.length} products\n`);
  
  // Show top ingredient frequencies
  console.log('Top 20 ingredients by frequency:');
  Object.entries(ingredientFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .forEach(([ing, count]) => console.log(`  ${count.toString().padStart(4)} | ${ing}`));
  
  console.log('\nTop 30 ingredient pairs:');
  Object.entries(topIngredientPairs)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30)
    .forEach(([pair, count]) => console.log(`  ${count.toString().padStart(4)} | ${pair.replace('|', ' + ')}`));
  
  // Save results
  await fs.writeFile(
    './output/commercial-top-ingredients.json',
    JSON.stringify({ ingredientFrequency, topIngredientPairs }, null, 2),
    'utf-8'
  );
  
  console.log('\n💾 Saved to commercial-top-ingredients.json');
}

function translateAndNormalize(name: string): string {
  let normalized = name.toLowerCase().trim();
  
  // Remove parenthetical content
  normalized = normalized.replace(/\([^)]*\)/g, '');
  
  // Remove percentages and numbers
  normalized = normalized.replace(/\d+%?/g, '');
  
  // Remove extra whitespace
  normalized = normalized.replace(/\s+/g, ' ').trim();
  
  // Skip if too short or looks like junk
  if (normalized.length < 3 || normalized.includes('mg') || normalized.includes('ui') || normalized.includes('ie')) {
    return 'unknown';
  }
  
  // Check translation map
  if (TRANSLATIONS[normalized]) {
    return TRANSLATIONS[normalized];
  }
  
  // Pattern matching for common ingredients
  if (normalized.includes('chicken') || normalized.includes('poulet') || normalized.includes('pollo') || normalized.includes('huhn')) return 'chicken';
  if (normalized.includes('beef') || normalized.includes('boeuf') || normalized.includes('manzo') || normalized.includes('rind')) return 'beef';
  if (normalized.includes('lamb') || normalized.includes('agneau') || normalized.includes('lamm')) return 'lamb';
  if (normalized.includes('turkey') || normalized.includes('dinde') || normalized.includes('pute')) return 'turkey';
  if (normalized.includes('duck') || normalized.includes('canard') || normalized.includes('ente')) return 'duck';
  if (normalized.includes('salmon') || normalized.includes('saumon') || normalized.includes('lachs')) return 'salmon';
  if (normalized.includes('tuna') || normalized.includes('thon') || normalized.includes('tonno')) return 'tuna';
  if (normalized.includes('fish') || normalized.includes('poisson') || normalized.includes('fisch') || normalized.includes('pesce')) return 'fish';
  if (normalized.includes('rabbit') || normalized.includes('lapin') || normalized.includes('kaninchen')) return 'rabbit';
  if (normalized.includes('venison') || normalized.includes('wild') || normalized.includes('gibier')) return 'venison';
  
  if (normalized.includes('rice') || normalized.includes('riz') || normalized.includes('reis') || normalized.includes('riso')) return 'rice';
  if (normalized.includes('corn') || normalized.includes('maïs') || normalized.includes('mais')) return 'corn';
  if (normalized.includes('wheat') || normalized.includes('blé') || normalized.includes('weizen') || normalized.includes('grano')) return 'wheat';
  if (normalized.includes('oat') || normalized.includes('avoine') || normalized.includes('hafer')) return 'oats';
  if (normalized.includes('barley') || normalized.includes('orge') || normalized.includes('gerste')) return 'barley';
  
  if (normalized.includes('carrot') || normalized.includes('carote') || normalized.includes('karotten') || normalized.includes('möhren')) return 'carrot';
  if (normalized.includes('pea') || normalized.includes('pois') || normalized.includes('piselli') || normalized.includes('erbsen')) return 'peas';
  if (normalized.includes('potato') || normalized.includes('patate') || normalized.includes('kartoffel')) return 'potato';
  if (normalized.includes('sweet potato') || normalized.includes('patate douce')) return 'sweet_potato';
  if (normalized.includes('pumpkin') || normalized.includes('citrouille') || normalized.includes('zucca')) return 'pumpkin';
  if (normalized.includes('spinach') || normalized.includes('épinard') || normalized.includes('spinaci')) return 'spinach';
  
  if (normalized.includes('egg') || normalized.includes('oeuf') || normalized.includes('uova') || normalized.includes('ei')) return 'egg';
  if (normalized.includes('yeast') || normalized.includes('levure') || normalized.includes('lievito')) return 'yeast';
  
  return 'unknown';
}

extractTopIngredients().catch(console.error);
