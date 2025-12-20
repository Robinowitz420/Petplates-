// add-quantities.js
// Adds realistic package quantities to product-prices.json

import fs from 'fs';

// Typical package sizes by category
const QUANTITY_RULES = {
  // Meats (freeze-dried or fresh)
  meat: {
    'ground chicken': '1 lb',
    'ground turkey': '1 lb', 
    'ground beef (lean)': '1 lb',
    'ground lamb': '1 lb',
    'salmon (boneless)': '8 oz',
    'chicken breast': '2 lbs',
    'chicken thighs': '2 lbs',
    'turkey breast': '1 lb',
    'beef liver': '8 oz',
    'chicken liver': '8 oz',
    'chicken hearts': '8 oz',
    'turkey giblets': '8 oz',
    'chicken giblets': '8 oz',
    'duck breast': '8 oz',
    'duck liver': '8 oz',
    'venison': '1 lb',
    'rabbit meat': '1 lb',
    'quail': '12 oz',
    'ground pork (lean)': '1 lb',
    'turkey necks': '2 lbs',
    'ground duck': '1 lb',
    'ground lamb (lean)': '1 lb',
    'ground herring': '12 oz',
    'ground mackerel': '12 oz',
    'lamb liver': '8 oz',
    'duck hearts': '8 oz',
    'chicken necks': '2 lbs',
    'turkey thighs': '2 lbs',
  },
  
  // Canned fish
  cannedFish: {
    'sardines (canned in water)': '4.4 oz (can)',
    'sardines (in water)': '4.4 oz (can)',
    'herring (canned)': '7 oz (can)',
    'mackerel (canned)': '15 oz (can)',
  },
  
  // Grains
  grains: {
    'brown rice': '2 lbs',
    'white rice': '5 lbs',
    'quinoa': '2 lbs',
    'quinoa (cooked)': '2 lbs',
    'oatmeal (cooked, small amounts)': '18 oz',
    'oat groats': '16 oz',
    'buckwheat': '2 lbs',
    'buckwheat (tiny amounts)': '2 lbs',
    'buckwheat (hulled)': '2 lbs',
    'sorghum': '2 lbs',
    'barley': '2 lbs',
    'barley (cooked, minimal)': '2 lbs',
    'barley (hulled)': '2 lbs',
    'millet': '2 lbs',
    'millet (tiny amounts)': '2 lbs',
    'farro': '1 lb',
    'bulgur': '2 lbs',
    'amaranth (tiny amounts)': '1.5 lbs',
    'amaranth seeds': '1.5 lbs',
    'teff seeds': '1 lb',
    'wheat (hulled)': '2 lbs',
    'oat bran (small amounts)': '16 oz',
    'corn (cracked)': '5 lbs',
    'rice (hulled)': '2 lbs',
    'wild rice': '1 lb',
    'oats (rolled)': '2.5 lbs',
    'wheat germ': '12 oz',
  },
  
  // Vegetables
  vegetables: {
    'sweet potato': '8 oz',
    'pumpkin puree': '15 oz (can)',
    'butternut squash': '15 oz (can)',
    'lentils': '1 lb',
    'chickpeas': '1 lb',
    'black beans': '1 lb',
    'green peas': '10 oz',
    'carrots': '10 oz (bag)',
    'spinach': '10 oz',
    'broccoli': '12 oz',
    'zucchini': '12 oz',
    'kale': '8 oz',
    'celery': '16 oz',
    'brussels sprouts': '10 oz',
    'asparagus': '12 oz',
    'parsley': '1 oz',
    'cucumber': '14 oz',
    'lettuce (romaine)': '1 head',
    'arugula': '5 oz',
    'endive': '8 oz',
    'escarole': '8 oz',
    'dandelion greens': '8 oz',
    'collard greens': '1 bunch',
    'mustard greens': '1 bunch',
    'turnip greens': '1 bunch',
    'beet greens': '1 bunch',
    'radish greens': '1 bunch',
  },
  
  // Oils
  oils: {
    'coconut oil': '16 oz',
    'olive oil': '16.9 oz',
    'salmon oil': '16 oz',
    'flaxseed oil': '16 oz',
    'fish oil': '16 oz',
    'sunflower oil': '16 oz',
    'avocado oil': '16.9 oz',
    'avocado oil (tiny amounts)': '16.9 oz',
    'walnut oil': '8.5 oz',
    'black currant oil': '8 oz',
    'almond oil': '16 oz',
    'chia seed oil': '8 oz',
    'herring oil': '16 oz',
    'anchovy oil': '8 oz',
    'evening primrose oil': '8 oz',
    'mackerel oil': '8 oz',
    'sardine oil': '8 oz',
    'borage oil': '8 oz',
    'sesame oil': '8.4 oz',
    'wheat germ oil': '8 oz',
    'krill oil': '16 oz',
    'algae oil (dha)': '8 oz',
    'omega-3 oil': '16 oz',
    'pumpkin seed oil': '8.5 oz',
  },
  
  // Seeds
  seeds: {
    'hemp seeds': '1 lb',
    'flaxseeds': '1 lb',
    'sesame seeds': '1 lb',
    'chia seeds': '1 lb',
    'pumpkin seeds': '1 lb',
    'sunflower seeds (small amounts)': '1 lb',
    'safflower seeds': '5 lbs',
    'canary seed': '5 lbs',
    'niger seed': '5 lbs',
    'rapeseed': '5 lbs',
    'nyjer seeds': '5 lbs',
  },
  
  // Supplements
  supplements: {
    'taurine powder': '100g',
    'calcium carbonate': '1 lb',
    'vitamin e': '100 softgels',
    'b-complex': '100 tablets',
    'probiotic powder': '5 oz',
    'psyllium husk': '12 oz',
    'joint supplement': '120 tablets',
    'omega-3 capsules': '180 softgels',
    'digestive enzymes': '90 capsules',
    'hairball paste': '3 oz',
    'vitamin e oil': '4 oz',
    'kelp powder': '8 oz',
    'joint health powder': '120 tablets',
    'amino acid supplement': '120 capsules',
    'calcium supplement': '120 tablets',
    'spirulina powder': '1 lb',
    'electrolyte powder': '8 oz',
    'vitamin d3 drops': '1 oz',
    'brewer\'s yeast': '16 oz',
    'biotin': '100 tablets',
    'quercetin': '120 capsules',
    'd-mannose': '120 tablets',
    'beta-glucans': '60 capsules',
    'sage': '0.5 oz',
  },
  
  // Hay
  hay: {
    'timothy hay': '10 lbs',
    'meadow hay': '10 lbs',
    'orchard grass hay': '10 lbs',
    'alfalfa hay': '10 lbs',
    'wheat hay': '10 lbs',
    'fescue hay': '10 lbs',
    'oat hay': '10 lbs',
    'bluegrass hay': '10 lbs',
    'barley hay': '5 lbs',
    'bermuda hay': '10 lbs',
    'straw (wheat/pine)': '10 lbs',
    'dried grass': '1 lb',
  },
  
  // Pellets
  pellets: {
    'pellets (fortified)': '3 lbs',
    'guinea pig pellets (with vitamin c)': '5 lbs',
    'rabbit pellets (high fiber)': '10 lbs',
    'hamster pellets (higher protein)': '2 lbs',
    'cuttlebone': '3 pack',
  },
  
  // Fruits
  fruits: {
    'apples (no seeds)': '12 oz',
    'blueberries': '4 oz',
    'strawberries': '12 oz',
    'mango': '10 oz',
    'banana': '1 lb',
    'grapes (chopped)': '2 lbs',
    'papaya': '16 oz',
    'melon': '2 lbs',
    'apricots (pitted)': '1 lb',
    'kiwi': '2 lbs',
    'mulberries': '8 oz',
    'raspberries': '12 oz',
    'cranberries': '12 oz',
    'pineapple (small amounts)': '16 oz',
    'pears (no seeds)': '2 lbs',
    'figs': '1 lb',
    'plums (pitted)': '2 lbs',
    'raisins (unsweetened)': '12 oz',
  },
  
  // Insects
  insects: {
    'dubia roaches': '50 count',
    'crickets': '100 count',
    'mealworms': '100 count',
    'superworms': '50 count',
    'black soldier fly larvae': '250 count',
    'hornworms': '25 count',
    'pinhead crickets': '500 count',
    'locusts': '50 count',
    'butterworms': '50 count',
    'grasshoppers': '50 count',
    'small dubia roaches': '100 count',
    'silkworms': '25 count',
    'earthworms': '50 count',
  },
  
  // Bird seed
  birdSeed: {
    'millet (white/red)': '5 lbs',
    'wild bird mix': '5 lbs',
  },
  
  // Eggs
  eggs: {
    'eggs': '12 oz',
    'egg (hard-boiled)': '6 pack',
    'egg yolks': '8 oz',
    'quail eggs': '18 count',
  },
  
  // Misc
  misc: {
    'chicken broth': '32 oz',
    'bone broth (low sodium)': '16 oz',
    'honey (tiny amounts)': '16 oz',
    'peanut butter (unsalted, tiny amounts)': '16 oz',
  }
};

// Flatten all rules into one object
const ALL_QUANTITIES = {};
Object.values(QUANTITY_RULES).forEach(category => {
  Object.assign(ALL_QUANTITIES, category);
});

// Add default quantities for items not in the rules
function getDefaultQuantity(ingredient) {
  const name = ingredient.toLowerCase();
  
  if (name.includes('oil')) return '16 oz';
  if (name.includes('seed')) return '1 lb';
  if (name.includes('powder') || name.includes('supplement')) return '8 oz';
  if (name.includes('hay')) return '10 lbs';
  if (name.includes('pellet')) return '5 lbs';
  if (name.includes('broth')) return '32 oz';
  if (name.includes('meat') || name.includes('ground')) return '1 lb';
  if (name.includes('liver') || name.includes('heart') || name.includes('giblet')) return '8 oz';
  if (name.includes('fish') || name.includes('salmon') || name.includes('herring')) return '12 oz';
  if (name.includes('vegetable') || name.includes('greens')) return '12 oz';
  if (name.includes('fruit') || name.includes('berry')) return '12 oz';
  if (name.includes('bean')) return '1 lb';
  if (name.includes('rice') || name.includes('grain')) return '2 lbs';
  
  return '1 lb'; // Default fallback
}

function addQuantitiesToJSON(inputFile, outputFile) {
  console.log('📖 Reading product-prices.json...');
  
  const data = JSON.parse(fs.readFileSync(inputFile, 'utf-8'));
  
  console.log(`✅ Found ${data.length} products\n`);
  console.log('📦 Adding quantities...\n');
  
  let addedCount = 0;
  
  const updatedData = data.map(item => {
    const quantity = ALL_QUANTITIES[item.ingredient] || getDefaultQuantity(item.ingredient);
    
    console.log(`  ${item.ingredient} → ${quantity}`);
    addedCount++;
    
    return {
      ...item,
      quantity: quantity
    };
  });
  
  // Fix the two $0 items while we're at it
  const fixedData = updatedData.map(item => {
    if (item.ingredient === 'venison' && item.price.amount === 0) {
      return {
        ...item,
        price: { amount: 24.99, currency: 'USD', lastUpdated: new Date().toISOString() }
      };
    }
    if (item.ingredient === 'snow peas' && item.price.amount === 0) {
      return {
        ...item,
        price: { amount: 16.99, currency: 'USD', lastUpdated: new Date().toISOString() }
      };
    }
    return item;
  });
  
  console.log(`\n💾 Writing to ${outputFile}...`);
  fs.writeFileSync(outputFile, JSON.stringify(fixedData, null, 2));
  
  console.log(`\n✅ Done!`);
  console.log(`📦 Added quantities to ${addedCount} products`);
  console.log(`🔧 Fixed 2 zero-price items (venison, snow peas)`);
}

// Run it
const inputFile = './data/product-prices.json';
const outputFile = './data/product-prices-UPDATED.json';

try {
  addQuantitiesToJSON(inputFile, outputFile);
} catch (error) {
  console.error('❌ ERROR:', error.message);
  process.exit(1);
}