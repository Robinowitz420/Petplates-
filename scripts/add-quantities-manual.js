#!/usr/bin/env node

/**
 * Helper script to add quantities to product-prices.json
 * You can manually look up quantities from Amazon and paste them here
 * 
 * Usage:
 * 1. Open each Amazon link from product-prices.json
 * 2. Find the package size/quantity in the product details
 * 3. Add the mapping below
 * 4. Run: node scripts/add-quantities-manual.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PRODUCT_PRICES_PATH = path.join(__dirname, '../data/product-prices.json');

// Manually curated quantities from Amazon product pages
// Format: "ingredient name": "quantity from Amazon"
const AMAZON_QUANTITIES = {
  // Proteins
  'ground chicken': '2 lbs',
  'ground turkey': '1 lb',
  'ground beef (lean)': '1 lb',
  'ground lamb': '1 lb',
  'salmon (boneless)': '1 lb',
  'chicken breast': '2.5 lbs',
  'chicken thighs': '2.5 lbs',
  'turkey breast': '1.5 lbs',
  'beef liver': '1 lb',
  'chicken liver': '1 lb',
  'chicken hearts': '1 lb',
  'sardines (canned in water)': '3.75 oz',
  'eggs': '18 count',
  'turkey giblets': '1 lb',
  'chicken giblets': '1 lb',
  'duck breast': '1 lb',
  'venison': '1 lb',
  'rabbit meat': '1 lb',
  'quail': '2 lbs',
  'ground pork (lean)': '1 lb',
  'turkey necks': '2 lbs',
  
  // Grains & Carbs
  'brown rice': '2 lbs',
  'white rice': '2 lbs',
  'quinoa': '1.5 lbs',
  'sweet potato': '3 lbs',
  'lentils': '2 lbs',
  'chickpeas': '2 lbs',
  'black beans': '2 lbs',
  'green peas': '1 lb',
  'wild rice': '1 lb',
  
  // Vegetables
  'carrots': '2 lbs',
  'spinach': '10 oz',
  'broccoli': '2 lbs',
  'zucchini': '2 lbs',
  'kale': '1 lb',
  'celery': '1 bunch',
  'brussels sprouts': '2 lbs',
  'asparagus': '1 lb',
  'parsley': '0.5 oz',
  'cucumber': '1 lb',
  'lettuce (romaine)': '1 head',
  'arugula': '5 oz',
  'endive': '1 lb',
  'escarole': '1 lb',
  'dandelion greens': '5 oz',
  'collard greens': '1 lb',
  'mustard greens': '1 lb',
  'turnip greens': '1 lb',
  'beet greens': '1 lb',
  'radish greens': '1 lb',
  'bell peppers': '3 lbs',
  'corn (fresh)': '4 ears',
  
  // Fruits
  'apples (no seeds)': '3 lbs',
  'blueberries': '1 lb',
  'strawberries': '1 lb',
  'mango': '2 count',
  'banana': '3 lbs',
  'grapes (chopped)': '2 lbs',
  'papaya': '1 count',
  'melon': '1 count',
  
  // Oils & Liquids
  'coconut oil': '14 oz',
  'olive oil': '25.5 oz',
  'salmon oil': '16 oz',
  'flaxseed oil': '16 oz',
  'fish oil': '16 oz',
  'chicken broth': '32 oz',
  'chicken bone broth': '24 oz',
  'beef bone broth': '24 oz',
  'vitamin e oil': '16 oz',
  
  // Seeds
  'millet (white/red)': '2 lbs',
  'canary seed': '2 lbs',
  'niger seed': '2 lbs',
  'oat groats': '2 lbs',
  'hemp seeds': '1 lb',
  'flaxseeds': '2 lbs',
  'sesame seeds': '1 lb',
  'chia seeds': '1 lb',
  'rapeseed': '2 lbs',
  'sunflower seeds (small amounts)': '2 lbs',
  'pumpkin seeds': '1 lb',
  
  // Supplements & Powders
  'taurine powder': '3.5 oz',
  'calcium carbonate': '1 lb',
  'vitamin e': '100 capsules',
  'b-complex': '100 tablets',
  'probiotic powder': '3.5 oz',
  'psyllium husk': '1 lb',
  'joint supplement': '120 tablets',
  'omega-3 capsules': '100 capsules',
  'digestive enzymes': '90 capsules',
  'hairball paste': '2.1 oz',
  'beta-glucans': '4 oz',
  
  // Hay & Grass
  'timothy hay': '10 lbs',
  'meadow hay': '10 lbs',
  'orchard grass hay': '10 lbs',
  'alfalfa hay': '10 lbs',
  
  // Insects & Specialty
  'dubia roaches': '500 count',
  'crickets': '500 count',
  'mealworms': '500 count',
  'superworms': '500 count',
  'black soldier fly larvae': '500 count',
  'hornworms': '500 count',
  
  // Other
  'honey (tiny amounts)': '12 oz',
  'peanut butter (unsalted, tiny amounts)': '16 oz',
  'pellets (fortified)': '2 lbs',
  'cuttlebone': '1 count',
  'acorn squash': '2 count',
  'figs': '2 lbs',
  'romaine lettuce': '1 head',
  'cilantro': '1 bunch',
  'basil': '0.5 oz',
  'duck hearts': '1 lb',
  'lamb liver': '1 lb',
  'duck liver': '1 lb',
  'chicken necks': '2 lbs',
  'turkey thighs': '2 lbs',
  'sage': '0.5 oz',
  
  // Additional oils
  'borage oil': '16 oz',
  'sesame oil': '16 oz',
  'avocado oil': '16 oz',
  'avocado oil (tiny amounts)': '16 oz',
  'wheat germ oil': '16 oz',
  'krill oil': '16 oz',
  'algae oil (dha)': '16 oz',
  'omega-3 oil': '16 oz',
  'pumpkin seed oil': '16 oz',
  
  // Powders & Supplements
  'kelp powder': '4 oz',
  'joint health powder': '4 oz',
  'amino acid supplement': '100 servings',
  'calcium supplement': '100 tablets',
  'spirulina powder': '4 oz',
  'electrolyte powder': '4 oz',
  'vitamin d3 drops': '1 oz',
  'brewer\'s yeast': '1 lb',
  'biotin': '100 tablets',
  'chondroitin sulfate': '100 tablets',
  'cranberry extract': '100 capsules',
  'curcumin (turmeric extract)': '100 capsules',
  'd-mannose': '100 capsules',
  'fructooligosaccharides (fos)': '1 lb',
  'glucosamine sulfate': '100 tablets',
  'hyaluronic acid': '100 capsules',
  'inulin (prebiotic)': '1 lb',
  'joint health supplement': '120 tablets',
  'l-carnitine powder': '4 oz',
  'lysine powder': '4 oz',
  'mannanoligosaccharides (mos)': '1 lb',
  'milk thistle': '100 capsules',
  'niacinamide': '100 tablets',
  's-adenosyl methionine (sam-e)': '100 tablets',
  'vitamin b complex': '100 tablets',
  'vitamin c (small amounts)': '100 tablets',
  
  // Grains & Seeds (additional)
  'buckwheat': '2 lbs',
  'buckwheat (tiny amounts)': '2 lbs',
  'buckwheat (hulled)': '2 lbs',
  'sorghum': '2 lbs',
  'barley': '2 lbs',
  'barley (cooked, minimal)': '2 lbs',
  'barley (hulled)': '2 lbs',
  'millet (tiny amounts)': '2 lbs',
  'farro': '2 lbs',
  'bulgur': '2 lbs',
  'amaranth (tiny amounts)': '2 lbs',
  'amaranth seeds': '2 lbs',
  'teff seeds': '2 lbs',
  'wheat (hulled)': '2 lbs',
  'oat bran (small amounts)': '2 lbs',
  'oatmeal (cooked, small amounts)': '2 lbs',
  'oats (rolled)': '2 lbs',
  'corn (cracked)': '2 lbs',
  'safflower seeds': '2 lbs',
  'nyjer seeds': '2 lbs',
  'rice (hulled)': '2 lbs',
  'flaxseed (ground)': '2 lbs',
  
  // Vegetables (additional)
  'bok choi': '1 lb',
  'bok choy (small amounts)': '1 lb',
  'cauliflower': '2 lbs',
  'green beans': '1 lb',
  'green beans (cooked)': '1 lb',
  'snap peas': '1 lb',
  'snow peas': '1 lb',
  'snow peas (mashed)': '1 lb',
  'sugar snap peas': '1 lb',
  'sugar snap peas (mashed)': '1 lb',
  'split peas': '2 lbs',
  'split peas (mashed)': '2 lbs',
  'delicata squash': '2 count',
  'yellow squash': '2 lbs',
  'squash (cooked)': '2 lbs',
  'leeks': '1 lb',
  'shallots': '1 lb',
  'tomatoes (small amounts)': '2 lbs',
  'napa cabbage': '2 lbs',
  'napa cabbage (small amounts)': '2 lbs',
  'artichokes': '1 lb',
  'frisee': '1 lb',
  'radicchio': '1 lb',
  'red cabbage': '2 lbs',
  'green cabbage': '2 lbs',
  'swiss chard': '1 lb',
  'swiss chard (cooked, tiny amounts)': '1 lb',
  'lettuce (romaine, small amounts)': '1 head',
  'red leaf lettuce': '1 head',
  'mache': '5 oz',
  'alfalfa sprouts (small amounts)': '4 oz',
  'cat grass (wheatgrass)': '1 oz',
  'lamb\'s quarters': '1 lb',
  'amaranth leaves': '1 lb',
  'watercress': '4 oz',
  'watercress (small amounts)': '4 oz',
  
  // Herbs & Spices
  'ginger (small amounts)': '0.5 oz',
  'turmeric': '0.5 oz',
  'rosemary': '0.5 oz',
  'mint': '0.5 oz',
  'garlic chives': '0.5 oz',
  'fennel': '0.5 oz',
  'chicory root': '4 oz',
  
  // Fruits (additional)
  'raisins (unsweetened)': '1 lb',
  'plums (pitted)': '2 lbs',
  'apricots (pitted)': '1 lb',
  'kiwi': '2 lbs',
  'mulberries': '1 lb',
  'raspberries': '1 lb',
  'cranberries': '1 lb',
  'pineapple (small amounts)': '1 count',
  'pears (no seeds)': '3 lbs',
  
  // Insects (additional)
  'locusts': '500 count',
  'butterworms': '500 count',
  'grasshoppers': '500 count',
  'silkworms': '500 count',
  'earthworms': '500 count',
  
  // Hay (additional)
  'wheat hay': '10 lbs',
  'fescue hay': '10 lbs',
  'oat hay': '10 lbs',
  'bluegrass hay': '10 lbs',
  'straw (wheat/pine)': '10 lbs',
  'dried grass': '10 lbs',
  'bermuda hay': '10 lbs',
  'barley hay': '10 lbs',
  
  // Pellets & Specialty
  'guinea pig pellets (with vitamin c)': '2 lbs',
  'rabbit pellets (high fiber)': '2 lbs',
  'hamster pellets (higher protein)': '2 lbs',
  'wild bird mix': '2 lbs',
  
  // Broths & Liquids (additional)
  'fish broth (no salt)': '32 oz',
  'turkey broth (no salt)': '32 oz',
  
  // Egg products
  'egg yolks': '12 count',
  'eggshells (crushed)': '18 count',
  'quail eggs': '18 count',
  
  // Vegetables (additional)
  'eggplant': '2 lbs',
  'jerusalem artichoke': '2 lbs',
  'wheat germ': '1 lb',
  
  // Greens (additional)
  'malabar spinach': '10 oz',
  'new zealand spinach': '10 oz',
  'romanesco broccoli': '2 lbs',
  
  // Legumes (additional)
  'navy beans (mashed)': '2 lbs',
  'kidney beans (mashed)': '2 lbs',
  'kidney beans (mashed, tiny amounts)': '2 lbs',
  'pinto beans (mashed)': '2 lbs',
  'peas (mashed)': '2 lbs',
  'peas': '2 lbs',
  
  // Vegetables (additional)
  'purslane': '1 lb',
  'purslane (small amounts)': '1 lb',
  'miner\'s lettuce': '5 oz',
  
  // Misc
  'pectin (from apples)': '1 lb',
  'sardines (in water)': '3.75 oz',
  'hairball control paste': '2.1 oz',
  
  // Remaining products
  'egg (hard-boiled)': '12 count',
  'ground duck': '1 lb',
  'ground herring': '1 lb',
  'ground mackerel': '1 lb',
  'mackerel (canned)': '3.75 oz',
  'herring (canned)': '3.75 oz',
  'ground pork (lean, small amounts)': '1 lb',
  'regular potato': '5 lbs',
  'walnut oil': '16 oz',
  'black currant oil': '16 oz',
  'almond oil': '16 oz',
  'sunflower oil': '16 oz',
  'chia seed oil': '16 oz',
  'herring oil': '16 oz',
  'anchovy oil': '16 oz',
  'evening primrose oil': '16 oz',
  'mackerel oil': '16 oz',
  'sardine oil': '16 oz',
  'quercetin': '100 capsules',
};

function addQuantities() {
  console.log('Reading product-prices.json...');
  const data = fs.readFileSync(PRODUCT_PRICES_PATH, 'utf8');
  const products = JSON.parse(data);

  console.log(`Processing ${products.length} products...\n`);

  let added = 0;
  let skipped = 0;
  let notFound = 0;

  products.forEach((product, index) => {
    const ingredient = product.ingredient.toLowerCase();

    // Check if already has quantity
    if (product.quantity) {
      skipped++;
      return;
    }

    // Look for exact match
    let quantity = null;
    for (const [key, value] of Object.entries(AMAZON_QUANTITIES)) {
      if (key.toLowerCase() === ingredient) {
        quantity = value;
        break;
      }
    }

    // If no exact match, try partial match
    if (!quantity) {
      for (const [key, value] of Object.entries(AMAZON_QUANTITIES)) {
        if (ingredient.includes(key.toLowerCase()) || key.toLowerCase().includes(ingredient)) {
          quantity = value;
          break;
        }
      }
    }

    if (quantity) {
      product.quantity = quantity;
      added++;
      console.log(`✓ ${product.ingredient}: "${quantity}"`);
    } else {
      notFound++;
      console.log(`✗ ${product.ingredient}: NOT FOUND - please add manually`);
    }
  });

  console.log(`\n✓ Added quantities to ${added} products`);
  console.log(`⊘ Skipped ${skipped} products (already had quantities)`);
  console.log(`✗ Could not find ${notFound} products - please add manually\n`);

  // Save updated file
  fs.writeFileSync(PRODUCT_PRICES_PATH, JSON.stringify(products, null, 2));
  console.log('✓ Updated product-prices.json saved!');
}

addQuantities();
