// Script to generate proper recipes using only approved ingredients
// UPDATED: Includes comprehensive nutrition DB, Calcium tracking, smart weight conversion, and vetted affiliate links
const fs = require('fs');

// Import vetted products for affiliate link optimization
const { getBestAffiliateLink } = require('./lib/data/vetted-products-new.js');

// Available images
const IMAGE_FILES = [
  'AAGRBT0C7xk_1763846334307.png',
  'AAGRBT0C7xk_1763846334312.png',
  'AAGRBT0C7xk_1763846334314.png',
  'AAGRBT0C7xk_1763846334316.png',
  'AAGRBT0C7xk_1763846334317.png',
  'AAGRBT0C7xk_1763846334318.png',
  'AAGRBT0C7xk_1763846334320.png',
  'AAGRBT0C7xk_1763846334321.png',
  'AAGRBT0C7xk_1763846334323.png',
  'AAGRBT0C7xk_1763846334325.png',
  'AAGRBT0C7xk_1763846334327.png',
  'AAGRBT0C7xk_1763846334328.png',
  'AAGRBT0C7xk_1763846334331.png',
  'AAGRBT0C7xk_1763846334332.png',
  'AAGRBT0C7xk_1763846334333.png',
  'AAGRBT0C7xk_1763846334335.png',
  'AAGRBT0C7xk_1763846334338.png',
  'AAGRBT0C7xk_1763846334340.png',
  'AAGRBT0C7xk_1763846334342.png',
  'AAGRBT0C7xk_1763846334343.png',
  'AAGRBT0C7xk_1763846334344.png',
  'AAGRBT0C7xk_1763846334346.png',
  'AAGRBT0C7xk_1763846334347.png',
  'AAGRBT0C7xk_1763846334349.png',
  'AAGRBT0C7xk_1763846334350.png',
  'AAGRBT0C7xk_1763846334352.png',
  'AAGRBT0C7xk_1763846334354.png',
  'AAGRBT0C7xk_1763846334355.png',
  'AAGRBT0C7xk_1763846334357.png',
  'AAGRBT0C7xk_1763846334359 (1).png',
  'AAGRBT0C7xk_1763846334359.png',
  'AAGRBT0C7xk_1763846334362.png',
  'AAGRBT0C7xk_1763846334365.png',
  'AAGRBT0C7xk_1763846334367.png'
];

function getRandomImage() {
  return IMAGE_FILES[Math.floor(Math.random() * IMAGE_FILES.length)];
}

// --- 1. INGREDIENTS LIST ---
const INGREDIENTS = {
  dogs: {
    proteins: [
      'Ground Chicken', 'Ground Turkey', 'Ground Beef (lean)', 'Ground Lamb', 'Salmon (boneless)',
      'Chicken Breast', 'Chicken Thighs', 'Turkey Breast', 'Beef Liver', 'Chicken Liver',
      'Chicken Hearts', 'Sardines (canned in water)', 'Eggs', 'Turkey Giblets', 'Chicken Giblets',
      'Duck Breast', 'Venison', 'Rabbit Meat', 'Quail', 'Ground Pork (lean)', 'Turkey Necks',
      'Ground Duck', 'Turkey Thighs', 'Chicken Necks', 'Ground Venison', 'Ground Rabbit',
      'Lamb Liver', 'Turkey Liver', 'Duck Hearts', 'Quail Eggs', 'Ground Quail'
    ],
    carbs: [
      'Brown Rice', 'White Rice', 'Quinoa', 'Sweet Potato', 'Regular Potato',
      'Oats (rolled)', 'Barley', 'Pumpkin Puree', 'Butternut Squash', 'Lentils',
      'Chickpeas (mashed)', 'Black Beans (mashed)', 'Green Peas', 'Wild Rice',
      'Amaranth', 'Buckwheat', 'Millet', 'Sorghum', 'Farro', 'Bulgur',
      'Split Peas', 'Kidney Beans (mashed)', 'Pinto Beans (mashed)', 'Navy Beans (mashed)',
      'Acorn Squash', 'Spaghetti Squash', 'Delicata Squash', 'Kabocha Squash'
    ],
    vegetables: [
      'Carrots', 'Green Beans', 'Peas', 'Spinach', 'Broccoli', 'Zucchini',
      'Kale', 'Celery', 'Bell Peppers (red/green)', 'Brussels Sprouts', 'Asparagus', 'Parsley',
      'Cucumber (peeled)', 'Lettuce (romaine)', 'Arugula', 'Endive', 'Escarole', 'Dandelion Greens',
      'Collard Greens', 'Mustard Greens', 'Turnip Greens', 'Beet Greens', 'Radish Greens',
      'Swiss Chard', 'Bok Choy', 'Napa Cabbage', 'Red Cabbage', 'Green Cabbage',
      'Cauliflower', 'Romanesco Broccoli', 'Snow Peas', 'Sugar Snap Peas',
      'Fennel', 'Leeks', 'Shallots', 'Garlic (small amounts)', 'Ginger (small amounts)',
      'Artichokes', 'Eggplant', 'Tomatoes (small amounts)', 'Yellow Squash', 'Pattypan Squash',
      'Radicchio', 'Frisee', 'Mache', 'Watercress', 'Purslane', 'Miner\'s Lettuce',
      'Lamb\'s Quarters', 'Amaranth Leaves', 'Malabar Spinach', 'New Zealand Spinach'
    ],
    fats: [
      'Coconut Oil', 'Olive Oil', 'Salmon Oil', 'Flaxseed (ground)', 'Hemp Seeds',
      'Eggshells (crushed)', 'Kelp Powder', 'Turmeric', 'Fish Oil', 'Avocado Oil',
      'Sunflower Oil', 'Sesame Oil', 'Pumpkin Seed Oil', 'Walnut Oil', 'Almond Oil',
      'Cod Liver Oil', 'Herring Oil', 'Mackerel Oil', 'Sardine Oil', 'Anchovy Oil',
      'Evening Primrose Oil', 'Borage Oil', 'Black Currant Oil', 'Chia Seed Oil'
    ]
  },
  cats: {
    // High-taurine proteins (essential for cats)
    proteins: [
      'Ground Chicken', 'Ground Turkey', 'Ground Beef (lean)', 'Chicken Thighs (boneless)',
      'Turkey Thighs', 'Salmon Fillet', 'Tuna (canned in water)', 'Chicken Liver',
      'Turkey Liver', 'Sardines (in water)', 'Eggs', 'Ground Duck', 'Rabbit Meat',
      'Venison', 'Quail', 'Ground Lamb (lean)', 'Turkey Giblets', 'Chicken Giblets',
      'Ground Venison', 'Ground Rabbit', 'Duck Liver', 'Quail Meat', 'Ground Quail',
      'Turkey Necks', 'Chicken Necks', 'Duck Hearts', 'Turkey Hearts', 'Mackerel (canned)',
      'Herring (canned)', 'Anchovies (canned)', 'Ground Mackerel', 'Ground Herring',
      'Lamb Liver', 'Beef Liver (small amounts)', 'Ground Pork (lean, small amounts)',
      'Turkey Sausage (no additives)', 'Chicken Sausage (no additives)'
    ],
    // Low-glycemic, moisture-rich carbs for diabetic/sensitive cats
    carbs: [
      'Pumpkin Puree (small amounts)', 'Brown Rice (occasional)', 'Oatmeal (cooked, small amounts)',
      'Sweet Potato (cooked, minimal)', 'Quinoa (tiny amounts)', 'Barley (cooked, minimal)',
      'Butternut Squash (mashed, minimal)', 'Acorn Squash (mashed, minimal)', 'Canned Pumpkin (plain)',
      'Oat Bran (small amounts)', 'Rice Bran (small amounts)', 'Millet (tiny amounts)',
      'Amaranth (tiny amounts)', 'Buckwheat (tiny amounts)', 'Lentils (mashed, tiny amounts)',
      'Chickpeas (mashed, tiny amounts)', 'Green Peas (mashed)', 'Split Peas (mashed)',
      'Black Beans (mashed, tiny amounts)', 'Kidney Beans (mashed, tiny amounts)'
    ],
    // High-moisture, nutrient-dense vegetables for urinary/kidney health
    vegetables: [
      'Carrots (grated)', 'Peas (mashed)', 'Zucchini (grated)', 'Spinach (cooked)',
      'Broccoli (tiny amounts)', 'Green Beans (cooked)', 'Asparagus (tips only)',
      'Celery (small amounts)', 'Parsley (fresh)', 'Cucumber (peeled)', 'Lettuce (romaine, small amounts)',
      'Kale (cooked, tiny amounts)', 'Collard Greens (cooked, tiny amounts)', 'Mustard Greens (cooked, tiny amounts)',
      'Dandelion Greens (fresh, small amounts)', 'Endive (small amounts)', 'Arugula (small amounts)',
      'Bok Choy (small amounts)', 'Napa Cabbage (small amounts)', 'Green Beans (mashed)',
      'Snow Peas (mashed)', 'Sugar Snap Peas (mashed)', 'Fennel (small amounts)',
      'Swiss Chard (cooked, tiny amounts)', 'Beet Greens (cooked, tiny amounts)', 'Turnip Greens (cooked, tiny amounts)',
      'Radish Greens (cooked, tiny amounts)', 'Watercress (small amounts)', 'Purslane (small amounts)',
      'Cat Grass (wheatgrass)', 'Barley Grass', 'Alfalfa Sprouts (small amounts)'
    ],
    // Essential fatty acids and joint support
    fats: [
      'Salmon Oil', 'Fish Oil', 'Cod Liver Oil', 'Herring Oil', 'Sardine Oil',
      'Mackerel Oil', 'Anchovy Oil', 'Krill Oil', 'Algae Oil (DHA)', 'Evening Primrose Oil',
      'Borage Oil', 'Black Currant Oil', 'Chia Seed Oil', 'Hemp Seed Oil', 'Flaxseed Oil',
      'Coconut Oil', 'Olive Oil (small amounts)', 'Avocado Oil (tiny amounts)', 'Wheat Germ Oil'
    ],
    // Hairball prevention and digestive health
    fiber_supplements: [
      'Hairball Control Paste', 'Psyllium Husk', 'Probiotic Powder', 'Digestive Enzymes',
      'Brewer\'s Yeast', 'Spirulina Powder', 'Kelp Powder', 'Wheat Germ', 'Oat Bran',
      'Rice Bran', 'Inulin (prebiotic)', 'Fructooligosaccharides (FOS)', 'Mannanoligosaccharides (MOS)',
      'Beta-glucans', 'Pectin (from apples)', 'Chicory Root', 'Jerusalem Artichoke'
    ],
    // Immune and urinary health
    supplements: [
      'Taurine Powder', 'L-Carnitine Powder', 'Lysine Powder', 'Vitamin E Oil',
      'Vitamin C (small amounts)', 'Vitamin B Complex', 'Niacinamide', 'Biotin',
      'Egg Yolks', 'Eggshells (crushed)', 'Chicken Broth (no salt)', 'Turkey Broth (no salt)',
      'Fish Broth (no salt)', 'Bone Broth (low sodium)', 'Cranberry Extract', 'D-Mannose',
      'Ursodeoxycholic Acid (UDCA)', 'S-Adenosyl methionine (SAM-e)', 'Milk Thistle',
      'Curcumin (turmeric extract)', 'Quercetin', 'Omega-3 Capsules', 'Joint Health Supplement',
      'Glucosamine Sulfate', 'Chondroitin Sulfate', 'MSM (methylsulfonylmethane)', 'Hyaluronic Acid'
    ]
  },
  birds: {
    seeds: [
      'Millet (white/red)', 'Canary Seed', 'Niger Seed', 'Oat Groats', 'Hemp Seeds',
      'Flaxseeds', 'Sesame Seeds', 'Chia Seeds', 'Quinoa (cooked)', 'Rapeseed',
      'Sunflower Seeds (small amounts)', 'Pumpkin Seeds', 'Safflower Seeds', 'Nyjer Seeds',
      'Amaranth Seeds', 'Buckwheat (hulled)', 'Barley (hulled)', 'Wheat (hulled)',
      'Rice (hulled)', 'Corn (cracked)', 'Poppy Seeds', 'Teff Seeds', 'Wild Bird Mix'
    ],
    vegetables: [
      'Carrots (grated)', 'Broccoli', 'Spinach', 'Kale', 'Bell Peppers', 'Zucchini',
      'Sweet Potato (cooked)', 'Peas', 'Corn (fresh)', 'Lettuce (romaine)', 'Endive',
      'Escarole', 'Arugula', 'Dandelion Greens', 'Collard Greens', 'Mustard Greens',
      'Turnip Greens', 'Beet Greens', 'Swiss Chard', 'Bok Choy', 'Napa Cabbage',
      'Cauliflower', 'Romanesco Broccoli', 'Snow Peas', 'Sugar Snap Peas', 'Asparagus',
      'Celery', 'Fennel', 'Parsley', 'Cilantro', 'Basil', 'Mint', 'Thyme'
    ],
    fruits: [
      'Apples (no seeds)', 'Blueberries', 'Strawberries', 'Mango', 'Banana',
      'Grapes (chopped)', 'Papaya', 'Melon', 'Pineapple (small amounts)', 'Kiwi',
      'Raspberries', 'Blackberries', 'Cranberries', 'Cherries (pitted)', 'Pears (no seeds)',
      'Peaches (pitted)', 'Plums (pitted)', 'Apricots (pitted)', 'Figs', 'Dates (pitted)',
      'Raisins (unsweetened)', 'Currants', 'Goji Berries', 'Mulberries'
    ],
    supplements: [
      'Egg (hard-boiled)', 'Pellets (fortified)', 'Cuttlebone', 'Honey (tiny amounts)',
      'Peanut Butter (unsalted, tiny amounts)', 'Brewer\'s Yeast', 'Spirulina Powder',
      'Kelp Powder', 'Probiotic Powder', 'Vitamin D3 Drops', 'Calcium Supplement',
      'Electrolyte Powder', 'Amino Acid Supplement', 'Omega-3 Oil', 'Joint Health Powder'
    ]
  },
  reptiles: {
    insects: [
      'Dubia Roaches', 'Crickets', 'Mealworms', 'Superworms', 'Black Soldier Fly Larvae', 'Hornworms',
      'Silkworms', 'Waxworms', 'Butterworms', 'Phoenix Worms', 'Earthworms', 'Grasshoppers',
      'Locusts', 'Mantids', 'Fruit Flies', 'Pinhead Crickets', 'Small Dubia Roaches'
    ],
    vegetables: [
      'Collard Greens', 'Mustard Greens', 'Turnip Greens', 'Dandelion Greens', 'Butternut Squash',
      'Bell Peppers', 'Carrots (grated)', 'Zucchini', 'Green Beans', 'Snap Peas',
      'Acorn Squash', 'Endive', 'Escarole', 'Arugula', 'Kale', 'Swiss Chard', 'Bok Choy',
      'Napa Cabbage', 'Romaine Lettuce', 'Iceberg Lettuce', 'Red Leaf Lettuce', 'Butter Lettuce',
      'Cauliflower', 'Broccoli', 'Romanesco Broccoli', 'Asparagus', 'Celery', 'Fennel',
      'Parsley', 'Cilantro', 'Basil', 'Mint', 'Thyme', 'Oregano', 'Sage', 'Rosemary',
      'Sweet Potato (cooked)', 'Pumpkin (cooked)', 'Squash (various)', 'Cucumber', 'Eggplant'
    ],
    fruits: [
      'Blueberries', 'Mango', 'Papaya', 'Strawberries', 'Figs', 'Apples (no seeds)',
      'Pears (no seeds)', 'Bananas', 'Melon', 'Cantaloupe', 'Honeydew', 'Watermelon',
      'Pineapple', 'Kiwi', 'Raspberries', 'Blackberries', 'Cranberries', 'Cherries (pitted)',
      'Peaches (pitted)', 'Plums (pitted)', 'Apricots (pitted)', 'Grapes (seedless)',
      'Raisins (unsweetened)', 'Dates (pitted)', 'Prunes', 'Goji Berries', 'Mulberries'
    ]
  },
  'pocket-pets': {
    hay: [
      'Timothy Hay', 'Meadow Hay', 'Orchard Grass Hay', 'Alfalfa Hay (babies/pregnant only)',
      'Bermuda Hay', 'Bluegrass Hay', 'Fescue Hay', 'Ryegrass Hay', 'Wheat Hay',
      'Oat Hay', 'Barley Hay', 'Straw (wheat/pine)', 'Dried Grass'
    ],
    vegetables: [
      'Romaine Lettuce', 'Bell Peppers (high vitamin C)', 'Carrots', 'Cucumber', 'Zucchini',
      'Celery', 'Parsley', 'Cilantro', 'Kale (limited)', 'Spinach (limited)', 'Broccoli',
      'Arugula', 'Endive', 'Basil', 'Mint', 'Collard Greens', 'Mustard Greens', 'Turnip Greens',
      'Dandelion Greens', 'Swiss Chard', 'Bok Choy', 'Napa Cabbage', 'Red Cabbage',
      'Green Cabbage', 'Cauliflower', 'Asparagus', 'Fennel', 'Leeks', 'Shallots',
      'Garlic Chives', 'Radicchio', 'Frisee', 'Mache', 'Watercress', 'Purslane',
      'Miner\'s Lettuce', 'Lamb\'s Quarters', 'Amaranth Leaves', 'Malabar Spinach',
      'New Zealand Spinach', 'Sweet Potato (cooked)', 'Pumpkin (cooked)', 'Squash (cooked)'
    ],
    pellets: [
      'Guinea Pig Pellets (with vitamin C)', 'Rabbit Pellets (high fiber)', 'Hamster Pellets (higher protein)',
      'Gerbil Pellets', 'Mouse/Rat Pellets', 'Chinchilla Pellets', 'Degus Pellets',
      'Fortified Pellets (vitamin C)', 'Timothy-Based Pellets', 'Alfalfa-Based Pellets'
    ],
    fruits: [
      'Apples (no seeds)', 'Strawberries', 'Blueberries', 'Banana', 'Melon', 'Grapes', 'Papaya',
      'Pears (no seeds)', 'Peaches (pitted)', 'Plums (pitted)', 'Apricots (pitted)', 'Cherries (pitted)',
      'Raspberries', 'Blackberries', 'Cranberries', 'Kiwi', 'Pineapple (small amounts)',
      'Mango (small amounts)', 'Papaya (small amounts)', 'Figs', 'Dates (pitted)', 'Raisins (unsweetened)',
      'Goji Berries', 'Mulberries', 'Currants', 'Elderberries'
    ],
    hamster_additions: [
      'Mealworms (freeze-dried)', 'Eggs (hard-boiled, tiny amounts)', 'Whole Grain Cheerios',
      'Sunflower Seeds (unsalted)', 'Pumpkin Seeds (unsalted)', 'Flaxseeds', 'Chia Seeds',
      'Hemp Seeds', 'Sesame Seeds', 'Popcorn (plain)', 'Whole Wheat Pasta (cooked)',
      'Brown Rice (cooked)', 'Quinoa (cooked)', 'Amaranth (cooked)', 'Buckwheat (cooked)',
      'Millet (cooked)', 'Barley (cooked)', 'Oats (cooked)', 'Corn (cooked)', 'Peas (cooked)'
    ]
  }
};

// --- 2. NUTRITION DATABASE (Values per 100g approximate) ---
// Format: [Protein (g), Fat (g), Fiber (g), Calories (kcal), Phosphorus (mg), Calcium (mg)]
const NUTRIENTS_DB = {
  // Proteins
  'Chicken': [25, 10, 0, 165, 180, 12],
  'Turkey': [29, 5, 0, 135, 200, 15],
  'Beef': [26, 15, 0, 250, 180, 6],
  'Lamb': [25, 20, 0, 280, 190, 10],
  'Pork': [27, 14, 0, 240, 200, 8],
  'Salmon': [20, 13, 0, 208, 250, 12],
  'Sardines': [24, 11, 0, 208, 400, 300], // High Calcium (bones)
  'Tuna': [28, 1, 0, 130, 280, 10],
  'Duck': [19, 28, 0, 337, 180, 11],
  'Venison': [30, 3, 0, 150, 200, 10],
  'Rabbit': [33, 3.5, 0, 173, 220, 15],
  'Quail': [25, 14, 0, 230, 220, 14],
  'Liver': [20, 5, 0, 135, 350, 10], // High Phos
  'Hearts': [17, 5, 0, 112, 200, 10],
  'Giblets': [18, 4, 0, 120, 200, 12],
  'Eggs': [13, 11, 0, 155, 190, 50],
  'Insects': [20, 10, 5, 150, 100, 50], // Generic insect profile
  'Dubia': [22, 8, 3, 160, 110, 800],   // Dubia specific
  'BSFL': [17, 9, 3, 150, 300, 800],    // Calcium rich larvae
  
  // Carbs/Grains
  'Rice': [2.7, 0.3, 0.4, 130, 40, 10],
  'Quinoa': [4.4, 1.9, 2.8, 120, 150, 17],
  'Potato': [2, 0.1, 2, 86, 50, 12],
  'SweetPotato': [1.6, 0.1, 3, 86, 47, 30],
  'Oats': [16.9, 6.9, 10.6, 389, 523, 54], // Dry weight often
  'Barley': [2.3, 0.4, 3.8, 123, 60, 15],
  'Lentils': [9, 0.4, 8, 116, 180, 20],
  'Chickpeas': [8.9, 2.5, 7.6, 164, 160, 49],
  'Beans': [8, 0.5, 7, 130, 140, 30],
  
  // Veggies
  'Carrots': [0.9, 0.2, 2.8, 41, 35, 33],
  'Peas': [5, 0.4, 5, 81, 108, 25],
  'Spinach': [2.9, 0.4, 2.2, 23, 50, 99],
  'Broccoli': [2.8, 0.4, 2.6, 34, 66, 47],
  'Zucchini': [1.2, 0.3, 1, 17, 38, 16],
  'Kale': [2.9, 1.5, 3.6, 49, 50, 150], // High Ca
  'Pumpkin': [1, 0.1, 0.5, 26, 44, 21],
  'Squash': [1, 0.1, 1.5, 40, 33, 30],
  'Greens': [2, 0.5, 3, 30, 40, 120], // Generic leafy greens
  'Collards': [2.5, 0.4, 3.6, 32, 10, 232], // Very high Ca
  'Dandelion': [2.7, 0.7, 3.5, 45, 66, 187],
  'Peppers': [0.9, 0.3, 2.1, 31, 20, 10],
  'Celery': [0.7, 0.2, 1.6, 16, 24, 40],
  'Cucumber': [0.7, 0.1, 0.5, 15, 24, 16],
  'Asparagus': [2.2, 0.1, 2.1, 20, 52, 24],
  'Corn': [3.2, 1.2, 2.7, 86, 89, 2],
  'Lettuce': [1.2, 0.2, 2.1, 17, 33, 36],
  'Endive': [1.3, 0.2, 3.1, 17, 28, 52],
  'Arugula': [2.6, 0.7, 1.6, 25, 52, 160],
  'Swiss Chard': [1.8, 0.2, 3.7, 20, 58, 51],
  'Bok Choy': [1.5, 0.2, 2.2, 13, 37, 105],
  'Napa Cabbage': [1.2, 0.2, 2.1, 16, 29, 43],
  'Red Cabbage': [1.4, 0.2, 3.6, 31, 30, 45],
  'Green Cabbage': [1.3, 0.2, 5.8, 25, 40, 40],
  'Cauliflower': [1.9, 0.3, 2.1, 25, 22, 22],
  'Romanesco Broccoli': [2.8, 0.4, 2.6, 34, 66, 47],
  'Snow Peas': [2.4, 0.2, 2.6, 42, 26, 43],
  'Sugar Snap Peas': [2.4, 0.2, 2.6, 42, 26, 43],
  'Fennel': [1.2, 0.2, 3.1, 31, 49, 49],
  'Leeks': [1.5, 0.3, 2.1, 61, 59, 59],
  'Shallots': [1.5, 0.1, 3.2, 72, 37, 37],
  'Artichokes': [3.3, 0.2, 10.3, 47, 120, 44],
  'Eggplant': [1, 0.2, 3.4, 25, 14, 9],
  'Tomatoes': [0.9, 0.2, 1.2, 18, 24, 10],
  'Yellow Squash': [1.2, 0.3, 1, 17, 38, 16],
  'Pattypan Squash': [1.2, 0.3, 1, 17, 38, 16],
  'Radicchio': [1.4, 0.3, 4, 23, 30, 19],
  'Frisee': [1.2, 0.2, 2.1, 17, 33, 36],
  'Mache': [2.6, 0.7, 1.6, 25, 52, 160],
  'Watercress': [2.3, 0.1, 1.3, 11, 120, 120],
  'Purslane': [2, 0.4, 3.4, 20, 0, 0],
  'Miner\'s Lettuce': [2.4, 0.4, 2.7, 22, 0, 0],
  'Lamb\'s Quarters': [4.2, 0.8, 4.2, 43, 309, 250],
  'Amaranth Leaves': [2.5, 0.3, 4.1, 23, 0, 0],
  'Malabar Spinach': [3, 0.4, 2.9, 19, 0, 0],
  'New Zealand Spinach': [2.5, 0.3, 2.4, 14, 0, 0],
  
  // Fruits
  'Apple': [0.3, 0.2, 2.4, 52, 11, 6],
  'Banana': [1.1, 0.3, 2.6, 89, 22, 5],
  'Blueberry': [0.7, 0.3, 2.4, 57, 12, 6],
  'Strawberry': [0.7, 0.3, 2.0, 32, 24, 16],
  'Mango': [0.8, 0.4, 1.6, 60, 14, 11],
  'Papaya': [0.5, 0.3, 1.7, 43, 10, 20],
  'Melon': [0.8, 0.2, 0.9, 34, 15, 9],
  'Grape': [0.7, 0.2, 0.9, 69, 20, 10],
  'Fig': [0.8, 0.3, 2.9, 74, 14, 35],
  
  // Fats/Supplements
  'Oil': [0, 100, 0, 884, 0, 0],
  'Seeds': [18, 40, 20, 550, 600, 255], // Flax/Hemp/Chia generic
  'Eggshells': [0, 0, 0, 0, 0, 38000], // Pure Calcium source
  'Cuttlebone': [0, 0, 0, 0, 0, 38000], // Pure Calcium source
  'Taurine': [100, 0, 0, 400, 0, 0],
  'Honey': [0.3, 0, 0.2, 304, 4, 6],
  'PeanutButter': [25, 50, 6, 588, 350, 43],
  'Pellets': [14, 4, 18, 250, 400, 800], // Generic fortified pellet

  // Cat-specific supplements
  'L-Carnitine Powder': [100, 0, 0, 400, 0, 0],
  'Lysine Powder': [100, 0, 0, 400, 0, 0],
  'Brewer\'s Yeast': [45, 2, 38, 325, 20, 20],
  'Spirulina Powder': [60, 8, 30, 290, 120, 120],
  'Wheat Germ Oil': [0, 100, 0, 884, 0, 0],
  'Black Currant Oil': [0, 100, 0, 884, 0, 0],
  'Chia Seed Oil': [0, 100, 0, 884, 0, 0],
  'Hemp Seed Oil': [0, 100, 0, 884, 0, 0],
  'Algae Oil (DHA)': [0, 100, 0, 884, 0, 0],
  'Krill Oil': [0, 100, 0, 884, 0, 0],
  'Hairball Control Paste': [5, 2, 10, 50, 10, 10],
  'Psyllium Husk': [0, 0, 80, 200, 0, 0],
  'Probiotic Powder': [20, 1, 5, 80, 5, 5],
  'Digestive Enzymes': [10, 0, 2, 40, 0, 0],
  'Joint Health Supplement': [15, 1, 3, 60, 5, 5],
  'Omega-3 Capsules': [0, 100, 0, 884, 0, 0],
  'Vitamin E Oil': [0, 100, 0, 884, 0, 0],
  'Cod Liver Oil': [0, 100, 0, 884, 0, 0],
  'Herring Oil': [0, 100, 0, 884, 0, 0],
  'Sardine Oil': [0, 100, 0, 884, 0, 0],
  'Evening Primrose Oil': [0, 100, 0, 884, 0, 0],
  'Borage Oil': [0, 100, 0, 884, 0, 0],
  'Chicken Broth (no salt)': [5, 1, 0, 30, 50, 5],
  'Turkey Broth (no salt)': [5, 1, 0, 30, 50, 5],
  'Fish Broth (no salt)': [5, 1, 0, 30, 50, 5],
  'Bone Broth (low sodium)': [10, 2, 0, 50, 100, 20],
  'Cranberry Extract': [0, 0, 50, 200, 0, 0],
  'D-Mannose': [0, 0, 0, 0, 0, 0],
  'Milk Thistle': [5, 1, 20, 50, 5, 5],
  'Curcumin (turmeric extract)': [5, 1, 50, 50, 5, 5],
  'Quercetin': [0, 0, 0, 0, 0, 0],
  'Glucosamine Sulfate': [100, 0, 0, 400, 0, 0],
  'Chondroitin Sulfate': [100, 0, 0, 400, 0, 0],
  'MSM (methylsulfonylmethane)': [100, 0, 0, 400, 0, 0],
  'Hyaluronic Acid': [100, 0, 0, 400, 0, 0],
  'Inulin (prebiotic)': [0, 0, 90, 150, 0, 0],
  'Fructooligosaccharides (FOS)': [0, 0, 90, 150, 0, 0],
  'Mannanoligosaccharides (MOS)': [0, 0, 90, 150, 0, 0],
  'Beta-glucans': [5, 0, 50, 50, 0, 0],
  'Pectin (from apples)': [0, 0, 30, 50, 0, 0],
  'Chicory Root': [5, 0, 65, 80, 10, 10],
  'Jerusalem Artichoke': [2, 0, 20, 75, 10, 10],
  'Cat Grass (wheatgrass)': [5, 1, 15, 30, 50, 100],
  'Barley Grass': [5, 1, 20, 30, 50, 100],
  'Alfalfa Sprouts (small amounts)': [4, 0.5, 3, 23, 30, 32],
  'Vitamin C (small amounts)': [0, 0, 0, 0, 0, 0],
  'Vitamin B Complex': [10, 0, 5, 40, 0, 0],
  'Niacinamide': [100, 0, 0, 400, 0, 0],
  'Biotin': [100, 0, 0, 400, 0, 0],
  'Ursodeoxycholic Acid (UDCA)': [100, 0, 0, 400, 0, 0],
  'S-Adenosyl methionine (SAM-e)': [100, 0, 0, 400, 0, 0],

  // Additional fish types for cats
  'Mackerel (canned)': [20, 13, 0, 208, 250, 12],
  'Herring (canned)': [20, 13, 0, 208, 250, 12],
  'Anchovies (canned)': [20, 13, 0, 208, 250, 12],
  'Ground Mackerel': [20, 13, 0, 208, 250, 12],
  'Ground Herring': [20, 13, 0, 208, 250, 12],
  'Lamb Liver': [20, 5, 0, 135, 350, 10],
  'Beef Liver (small amounts)': [20, 5, 0, 135, 350, 10],
  'Ground Pork (lean, small amounts)': [27, 14, 0, 240, 200, 8],
  'Turkey Sausage (no additives)': [20, 10, 0, 165, 180, 12],
  'Chicken Sausage (no additives)': [20, 10, 0, 165, 180, 12],

  // Default
  'default': [5, 1, 2, 50, 50, 20]
};

// --- 3. HELPER FUNCTIONS ---

function getNutritionForIngredient(name) {
  const n = name.toLowerCase();
  let key = 'default';
  
  // Proteins
  if (n.includes('liver')) key = 'Liver';
  else if (n.includes('heart')) key = 'Hearts';
  else if (n.includes('giblet')) key = 'Giblets';
  else if (n.includes('chicken')) key = 'Chicken';
  else if (n.includes('turkey')) key = 'Turkey';
  else if (n.includes('beef')) key = 'Beef';
  else if (n.includes('lamb')) key = 'Lamb';
  else if (n.includes('pork')) key = 'Pork';
  else if (n.includes('salmon')) key = 'Salmon';
  else if (n.includes('sardine')) key = 'Sardines';
  else if (n.includes('tuna')) key = 'Tuna';
  else if (n.includes('duck')) key = 'Duck';
  else if (n.includes('venison')) key = 'Venison';
  else if (n.includes('rabbit')) key = 'Rabbit';
  else if (n.includes('quail')) key = 'Quail';
  else if (n.includes('egg')) key = 'Eggs';
  
  // Insects (Reptiles/Birds)
  else if (n.includes('dubia')) key = 'Dubia';
  else if (n.includes('soldier') || n.includes('larvae')) key = 'BSFL';
  else if (n.includes('worm') || n.includes('cricket') || n.includes('roach') || n.includes('fly')) key = 'Insects';

  // Carbs/Grains
  else if (n.includes('rice')) key = 'Rice';
  else if (n.includes('quinoa')) key = 'Quinoa';
  else if (n.includes('sweet potato')) key = 'SweetPotato';
  else if (n.includes('potato')) key = 'Potato';
  else if (n.includes('oat')) key = 'Oats';
  else if (n.includes('barley')) key = 'Barley';
  else if (n.includes('lentil')) key = 'Lentils';
  else if (n.includes('chickpea')) key = 'Chickpeas';
  else if (n.includes('pea')) key = 'Peas';
  else if (n.includes('bean')) key = 'Beans';
  else if (n.includes('corn')) key = 'Corn';
  else if (n.includes('pellet') || n.includes('cheerio')) key = 'Pellets';
  
  // Veggies
  else if (n.includes('spinach')) key = 'Spinach';
  else if (n.includes('broccoli')) key = 'Broccoli';
  else if (n.includes('zucchini')) key = 'Zucchini';
  else if (n.includes('kale')) key = 'Kale';
  else if (n.includes('collard')) key = 'Collards';
  else if (n.includes('dandelion')) key = 'Dandelion';
  else if (n.includes('pumpkin') || n.includes('squash')) key = 'Pumpkin';
  else if (n.includes('pepper')) key = 'Peppers';
  else if (n.includes('celery')) key = 'Celery';
  else if (n.includes('cucumber')) key = 'Cucumber';
  else if (n.includes('asparagus')) key = 'Asparagus';
  else if (n.includes('lettuce') || n.includes('romaine')) key = 'Lettuce';
  else if (n.includes('endive') || n.includes('escarole')) key = 'Endive';
  else if (n.includes('arugula')) key = 'Arugula';
  else if (n.includes('carrot')) key = 'Carrots';
  else if (n.includes('green') && !n.includes('bean')) key = 'Greens'; // Catch-all for leafy greens

  // Fruits
  else if (n.includes('apple')) key = 'Apple';
  else if (n.includes('banana')) key = 'Banana';
  else if (n.includes('blueberr')) key = 'Blueberry';
  else if (n.includes('strawberr')) key = 'Strawberry';
  else if (n.includes('mango')) key = 'Mango';
  else if (n.includes('papaya')) key = 'Papaya';
  else if (n.includes('melon')) key = 'Melon';
  else if (n.includes('grape')) key = 'Grape';
  else if (n.includes('fig')) key = 'Fig';
  
  // Fats/Supplements
  else if (n.includes('oil')) key = 'Oil';
  else if (n.includes('seed') || n.includes('flax')) key = 'Seeds';
  else if (n.includes('peanut')) key = 'PeanutButter';
  else if (n.includes('honey')) key = 'Honey';
  else if (n.includes('eggshell')) key = 'Eggshells';
  else if (n.includes('cuttlebone')) key = 'Cuttlebone';
  else if (n.includes('taurine')) key = 'Taurine';
  
  return NUTRIENTS_DB[key] || NUTRIENTS_DB['default'];
}

function parseAmountToGrams(amountStr, ingredientName = '') {
  const s = amountStr.toLowerCase();
  const n = ingredientName.toLowerCase();
  
  // --- SPECIAL WEIGHT HANDLING ---
  
  // 1 Cup Logic: Leafy greens are light, dense food is heavy
  if (s.includes('cup')) {
    if (n.includes('spinach') || n.includes('kale') || n.includes('greens') || n.includes('lettuce') || n.includes('arugula')) {
      return 30; // Leafy greens are light
    } else if (n.includes('carrot') || n.includes('apple') || n.includes('berry') || n.includes('pepper') || n.includes('pea')) {
      return 150; // Chopped veg/fruit average
    } else {
      return 200; // Dense meat/mash/puree
    }
  }

  if (s.includes('unlimited')) return 500; // Arbitrary large number for hay
  if (s.includes('mg')) return parseFloat(s) / 1000;
  if (s.includes('kg')) return parseFloat(s) * 1000;
  if (s.includes('g')) return parseFloat(s);
  
  // Volume to weight approximations
  if (s.includes('tbsp')) return 15;
  if (s.includes('tsp')) return 5;
  if (s.includes('pinch')) return 1;
  if (s.includes('piece')) return 2; // Approx weight of a worm/insect
  
  return 50; // Default fallback
}

function calculateRecipeNutrition(ingredients) {
  let totalProtein = 0;
  let totalFat = 0;
  let totalFiber = 0;
  let totalCalories = 0;
  let totalPhosphorus = 0;
  let totalCalcium = 0;
  let totalWeight = 0;

  ingredients.forEach(ing => {
    const grams = parseAmountToGrams(ing.amount, ing.name);
    const [p, f, fib, cal, phos, calcium] = getNutritionForIngredient(ing.name);
    
    // Values in DB are per 100g, so we multiply by (grams / 100)
    const multiplier = grams / 100;
    
    totalProtein += p * multiplier;
    totalFat += f * multiplier;
    totalFiber += fib * multiplier;
    totalCalories += cal * multiplier;
    totalPhosphorus += phos * multiplier;
    totalCalcium += (calcium || 0) * multiplier;
    totalWeight += grams;
  });

  if (totalWeight === 0) return { protein: 0, fat: 0, fiber: 0, calories: 0, phosphorus: 0, calcium: 0 };

  // Convert totals back to percentages for macronutrients
  const proteinPct = (totalProtein / totalWeight) * 100;
  const fatPct = (totalFat / totalWeight) * 100;
  const fiberPct = (totalFiber / totalWeight) * 100;

  // Return in the format expected by the frontend (with ranges for display)
  return {
    raw: {
      protein: parseFloat(proteinPct.toFixed(1)),
      fat: parseFloat(fatPct.toFixed(1)),
      fiber: parseFloat(fiberPct.toFixed(1)),
      calories: Math.round(totalCalories),
      phosphorus: Math.round(totalPhosphorus),
      calcium: Math.round(totalCalcium)
    },
    formatted: {
      protein: { min: Math.floor(proteinPct), max: Math.ceil(proteinPct), unit: '%' },
      fat: { min: Math.floor(fatPct), max: Math.ceil(fatPct), unit: '%' },
      fiber: { min: Math.floor(fiberPct), max: Math.ceil(fiberPct), unit: '%' },
      calories: { min: Math.round(totalCalories * 0.9), max: Math.round(totalCalories * 1.1), unit: 'kcal' },
      phosphorus: { min: Math.round(totalPhosphorus * 0.9), max: Math.round(totalPhosphorus * 1.1), unit: 'mg' },
      calcium: { min: Math.round(totalCalcium * 0.9), max: Math.round(totalCalcium * 1.1), unit: 'mg' }
    },
    infoString: {
      protein: `${proteinPct.toFixed(1)}%`,
      fat: `${fatPct.toFixed(1)}%`,
      fiber: `${fiberPct.toFixed(1)}%`,
      calories: `${Math.round(totalCalories)} kcal`,
      calcium: `${Math.round(totalCalcium)} mg`
    }
  };
}

// --- 4. CELEBRITY QUOTES ---
const CELEBRITY_QUOTES = {
  dogs: [
    "Bark Obama: \"Yes we can... eat healthy too!\"",
    "Laid-back vibes and a full bowl - perfect day.",
    "Wag more, bark less, eat fresh always.",
    "From the doghouse to the penthouse - fresh food!",
    "Tail wags for homemade goodness.",
    "Paw-some nutrition in every bite.",
    "Fetch the freshest ingredients!",
    "Dog-gone delicious and healthy.",
    "Paw-fectly balanced nutrition.",
    "Woof-worthy wellness starts here."
  ],
  cats: [
    "Meowly Cyrus: \"This salmon is a wrecking ball of flavor.\"",
    "Purr-fectly balanced for feline friends.",
    "Cat-tastic nutrition in every bowl.",
    "From alley cat to gourmet kitty.",
    "Paw-some protein for perfect purring.",
    "Feline fine dining at its best.",
    "Whisker-licking good nutrition.",
    "Cat-approved culinary delights.",
    "Purr-fect portion, perfect nutrition.",
    "Meow-nificent meals for majestic cats."
  ],
  birds: [
    "Tweet dreams are made of fresh seeds.",
    "Feathered friend fuel for flight.",
    "Chirp-worthy nutrition for happy birds.",
    "From cage to gourmet - fresh and fun.",
    "Beak-a-boo! Healthy and delicious.",
    "Wing and a prayer for perfect nutrition.",
    "Polly wants proper nutrition too.",
    "Feather-light but nutrient-dense.",
    "Tweet about this tasty treat!",
    "Bird-brilliant nutrition for bright birds."
  ],
  reptiles: [
    "Cold-blooded but hot on nutrition.",
    "Scale-tastic meals for reptilian royalty.",
    "From rock to gourmet - fresh and fun.",
    "Reptile-rific nutrition for happy herps.",
    "Slither into better health.",
    "Scale-mail armor for healthy reptiles.",
    "Cold-blooded cuisine at its finest.",
    "Reptile-approved culinary delights.",
    "From tank to gourmet dining.",
    "Herp-derp delicious nutrition."
  ],
  'pocket-pets': [
    "Small but mighty nutrition.",
    "Pocket-sized perfection in every bite.",
    "From hutch to gourmet - fresh and fun.",
    "Tiny treats for terrific nutrition.",
    "Small animal, big nutrition needs.",
    "Pocket pet perfection in portions.",
    "Nibble-worthy nutrition for happy pets.",
    "From cage to gourmet dining.",
    "Tiny but mighty nutritional power.",
    "Pocket-sized gourmet goodness."
  ]
};

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function generateRecipeId(category, index) {
  const prefixes = { dogs: 'dog', cats: 'cat', birds: 'bird', reptiles: 'reptile', 'pocket-pets': 'pocket' };
  return `${prefixes[category]}-${String(index + 1).padStart(3, '0')}`;
}

function generateDogRecipe(index) {
  const proteins = INGREDIENTS.dogs.proteins;
  const carbs = INGREDIENTS.dogs.carbs;
  const veggies = INGREDIENTS.dogs.vegetables;
  const fats = INGREDIENTS.dogs.fats;
  const cookingMethods = ['Baked', 'Grilled', 'Steamed', 'Fresh', 'Homemade', 'Classic', 'Savory', 'Herb-Infused', 'Traditional', 'Special'];

  const protein = getRandomElement(proteins);
  const carb = getRandomElement(carbs);
  const veggie = getRandomElement(veggies);
  const fat = getRandomElement(fats);
  const cooking = getRandomElement(cookingMethods);

  const ingredients = [
    { id: '1', name: protein, amount: '200g', amazonLink: getBestAffiliateLink(protein) || `https://www.amazon.com/s?k=${encodeURIComponent(protein.toLowerCase() + ' for dogs')}` },
    { id: '2', name: carb, amount: '100g', amazonLink: getBestAffiliateLink(carb) || `https://www.amazon.com/s?k=${encodeURIComponent(carb.toLowerCase() + ' for dogs')}` },
    { id: '3', name: veggie, amount: '50g', amazonLink: getBestAffiliateLink(veggie) || `https://www.amazon.com/s?k=${encodeURIComponent(veggie.toLowerCase() + ' for dogs')}` },
    { id: '4', name: fat, amount: '1 tsp', amazonLink: getBestAffiliateLink(fat) || `https://www.amazon.com/s?k=${encodeURIComponent(fat.toLowerCase() + ' for dogs')}` }
  ];

  const nutrition = calculateRecipeNutrition(ingredients);
  
  // Auto-tagging based on nutrient profile
  const healthConcerns = [];
  if (nutrition.raw.fat < 12) healthConcerns.push('weight-management', 'pancreatitis');
  if (nutrition.raw.protein > 30) healthConcerns.push('skin-coat');
  if (nutrition.raw.phosphorus < 200) healthConcerns.push('kidney');
  if (protein.includes('Salmon') || fat.includes('Fish Oil')) healthConcerns.push('joint-health');
  if (protein.includes('Rabbit') || protein.includes('Venison')) healthConcerns.push('allergies');
  if (carb.includes('Pumpkin') || carb.includes('Rice')) healthConcerns.push('digestive');

  const ageGroups = [];
  if (Math.random() > 0.6) ageGroups.push('baby');
  if (Math.random() > 0.4) ageGroups.push('young');
  ageGroups.push('adult');
  if (Math.random() > 0.6) ageGroups.push('senior');

  // Generate unique name using cooking method and multiple ingredients
  const nameFormats = [
    `${cooking} ${protein.split(' ')[0]} with ${carb.split(' ')[0]} & ${veggie.split(' ')[0]}`,
    `${cooking} ${protein.split(' ')[0]} & ${carb.split(' ')[0]} Bowl`,
    `${protein.split(' ')[0]} ${carb.split(' ')[0]} ${cooking} Mix`,
    `${cooking} ${protein.split(' ')[0]} ${veggie.split(' ')[0]} Feast`,
    `${protein.split(' ')[0]} & ${veggie.split(' ')[0]} ${cooking} Bowl`,
    `${cooking} ${carb.split(' ')[0]} ${protein.split(' ')[0]} Delight`
  ];
  const name = getRandomElement(nameFormats);

  return {
    id: generateRecipeId('dogs', index),
    name,
    shortName: `${protein.split(' ')[0]} ${carb.split(' ')[0]}`,
    celebrityName: "Bark Obama",
    celebrityQuote: getRandomElement(CELEBRITY_QUOTES.dogs),
    category: 'dogs',
    breed: null,
    ageGroup: ageGroups,
    healthConcerns,
    description: `Fresh ${protein.toLowerCase()} with ${carb.toLowerCase()} and ${veggie.toLowerCase()} for optimal canine nutrition.`,
    tags: ['fresh', 'homemade', 'balanced'],
    imageUrl: `/images/${getRandomImage()}`,
    prepTime: `${Math.floor(Math.random() * 20) + 15} min`,
    cookTime: `${Math.floor(Math.random() * 15) + 10} min`,
    servings: 1,
    ingredients,
    instructions: [
      `Prepare ${protein.toLowerCase()} by cooking thoroughly.`,
      `Cook ${carb.toLowerCase()} until tender.`,
      `Steam or boil ${veggie.toLowerCase()}.`,
      `Mix all ingredients and add ${fat.toLowerCase()}.`,
      `Cool to room temperature before serving.`
    ],
    nutritionalInfo: {
      ...nutrition.formatted,
      phosphorus: nutrition.formatted.phosphorus, // Ensure phosphorus is included
      calcium: nutrition.formatted.calcium // Ensure calcium is included
    },
    nutritionInfo: nutrition.infoString,
    rating: 0,
    reviews: 0
  };
}

function generateCatRecipe(index) {
  const proteins = INGREDIENTS.cats.proteins;
  const carbs = INGREDIENTS.cats.carbs;
  const veggies = INGREDIENTS.cats.vegetables;
  const fats = INGREDIENTS.cats.fats;
  const fiberSupplements = INGREDIENTS.cats.fiber_supplements;
  const supplements = INGREDIENTS.cats.supplements;
  const cookingMethods = ['Baked', 'Grilled', 'Steamed', 'Fresh', 'Homemade', 'Classic', 'Savory', 'Herb-Infused', 'Traditional', 'Special'];

  // Always include a high-taurine protein source
  const protein = getRandomElement(proteins);

  // Include moisture-rich carb for urinary health (cats need hydration)
  const carb = getRandomElement(carbs);

  // Include vegetables for fiber and nutrients (cats need some plant matter)
  const veggie1 = getRandomElement(veggies);
  const veggie2 = Math.random() > 0.6 ? getRandomElement(veggies.filter(v => v !== veggie1)) : null;

  // Essential fatty acids for skin/coat health
  const fat = getRandomElement(fats);

  // Fiber supplement for hairball prevention (very common cat issue)
  const fiber = getRandomElement(fiberSupplements);

  // Health-specific supplement based on common cat needs
  const supplement1 = getRandomElement(supplements);
  const supplement2 = Math.random() > 0.7 ? getRandomElement(supplements.filter(s => s !== supplement1)) : null;

  const cooking = getRandomElement(cookingMethods);

  // Build comprehensive ingredient list for cat health (main ingredients only)
  const ingredients = [
    { id: '1', name: protein, amount: '120g', amazonLink: getBestAffiliateLink(protein) || `https://www.amazon.com/s?k=${encodeURIComponent(protein.toLowerCase() + ' for cats')}` },
    { id: '2', name: carb, amount: '3 tbsp', amazonLink: getBestAffiliateLink(carb) || `https://www.amazon.com/s?k=${encodeURIComponent(carb.toLowerCase() + ' for cats')}` },
    { id: '3', name: veggie1, amount: '2 tbsp', amazonLink: getBestAffiliateLink(veggie1) || `https://www.amazon.com/s?k=${encodeURIComponent(veggie1.toLowerCase() + ' for cats')}` },
    { id: '4', name: fat, amount: '1/4 tsp', amazonLink: getBestAffiliateLink(fat) || `https://www.amazon.com/s?k=${encodeURIComponent(fat.toLowerCase() + ' for cats')}` }
  ];

  if (veggie2) ingredients.push({ id: '5', name: veggie2, amount: '1 tbsp', amazonLink: getBestAffiliateLink(veggie2) || `https://www.amazon.com/s?k=${encodeURIComponent(veggie2.toLowerCase() + ' for cats')}` });

  // Separate supplements array for proper categorization
  const supplementItems = [
    { id: '1', name: fiber, amount: '1/4 tsp', amazonLink: getBestAffiliateLink(fiber) || `https://www.amazon.com/s?k=${encodeURIComponent(fiber.toLowerCase() + ' for cats')}` },
    { id: '2', name: supplement1, amount: '1/8 tsp', amazonLink: getBestAffiliateLink(supplement1) || `https://www.amazon.com/s?k=${encodeURIComponent(supplement1.toLowerCase() + ' for cats')}` }
  ];

  if (supplement2) supplementItems.push({ id: '3', name: supplement2, amount: '1/8 tsp', amazonLink: getBestAffiliateLink(supplement2) || `https://www.amazon.com/s?k=${encodeURIComponent(supplement2.toLowerCase() + ' for cats')}` });

  // Calculate nutrition for main ingredients only (supplements are separate)
  const mainNutrition = calculateRecipeNutrition(ingredients);

  const nutrition = calculateRecipeNutrition(ingredients);

  // Comprehensive health concern tagging based on ingredients
  const healthConcerns = [];

  // Weight management (low fat)
  if (nutrition.raw.fat < 12) healthConcerns.push('weight-management', 'pancreatitis');

  // Kidney/urinary health (low phosphorus, high moisture)
  if (nutrition.raw.phosphorus < 200) healthConcerns.push('kidney');
  if (carb.includes('Pumpkin') || carb.includes('Squash')) healthConcerns.push('urinary-health');

  // Heart health (taurine)
  if (supplement1.includes('Taurine') || supplement2?.includes('Taurine')) healthConcerns.push('heart-health');

  // Hairball prevention
  if (fiber.includes('Hairball') || fiber.includes('Psyllium')) healthConcerns.push('hairball');

  // Allergies (novel proteins)
  if (protein.includes('Rabbit') || protein.includes('Venison') || protein.includes('Quail')) healthConcerns.push('allergies');

  // Skin/coat health (omega-3s)
  if (fat.includes('Salmon') || fat.includes('Fish') || supplement1.includes('Omega-3')) healthConcerns.push('skin-conditions');

  // Joint health
  if (supplement1.includes('Joint') || supplement2?.includes('Glucosamine')) healthConcerns.push('joint-health', 'hip-dysplasia');

  // Diabetes (low glycemic)
  if (carb.includes('Sweet Potato') || carb.includes('Squash')) healthConcerns.push('diabetes');

  // Digestive health
  if (fiber.includes('Probiotic') || fiber.includes('Digestive')) healthConcerns.push('digestive-issues');

  // Dental health
  if (veggie1.includes('Carrot') || veggie2?.includes('Celery')) healthConcerns.push('dental-issues');

  const ageGroups = [];
  if (Math.random() > 0.6) ageGroups.push('young');
  ageGroups.push('adult');
  if (Math.random() > 0.6) ageGroups.push('senior');

  // Generate unique name using multiple ingredients
  const mainIngredients = [protein.split(' ')[0], carb.split(' ')[0], veggie1.split(' ')[0]];
  const nameFormats = [
    `${cooking} ${protein.split(' ')[0]} & ${carb.split(' ')[0]} Feline Feast`,
    `${cooking} ${protein.split(' ')[0]} with ${veggie1.split(' ')[0]} Cat Delight`,
    `${protein.split(' ')[0]} ${carb.split(' ')[0]} ${cooking} Cat Meal`,
    `${cooking} ${protein.split(' ')[0]} ${veggie1.split(' ')[0]} Wellness Mix`,
    `${protein.split(' ')[0]} & ${veggie1.split(' ')[0]} ${cooking} Complete Meal`,
    `${cooking} Complete ${protein.split(' ')[0]} Cat Nutrition`
  ];
  const name = getRandomElement(nameFormats);

  return {
    id: generateRecipeId('cats', index),
    name,
    shortName: `${protein.split(' ')[0]} Complete Cat Meal`,
    celebrityName: "Meowly Cyrus",
    celebrityQuote: getRandomElement(CELEBRITY_QUOTES.cats),
    category: 'cats',
    breed: null,
    ageGroup: ageGroups,
    healthConcerns,
    description: `Complete feline nutrition featuring ${protein.toLowerCase()} with moisture-rich ${carb.toLowerCase()}, essential fatty acids, and digestive support for optimal cat health.`,
    tags: ['complete-nutrition', 'taurine-rich', 'hairball-prevention', 'urinary-health', 'omega-3', 'cat-approved'],
    imageUrl: `/images/${getRandomImage()}`,
    prepTime: `${Math.floor(Math.random() * 15) + 10} min`,
    cookTime: `${Math.floor(Math.random() * 10) + 5} min`,
    servings: 1,
    ingredients,
    supplements: supplementItems,
    instructions: [
      `Cook ${protein.toLowerCase()} thoroughly until fully done.`,
      `Steam or boil ${carb.toLowerCase()} and ${veggie1.toLowerCase()} until soft.`,
      ...(veggie2 ? [`Add ${veggie2.toLowerCase()} for extra nutrients.`] : []),
      `Mix in ${fat.toLowerCase()} for essential fatty acids.`,
      `Add ${fiber.toLowerCase()} for digestive and hairball support.`,
      `Include ${supplement1.toLowerCase()} for targeted health benefits.`,
      ...(supplement2 ? [`Add ${supplement2.toLowerCase()} for additional support.`] : []),
      `Cool completely to room temperature before serving to your cat.`
    ],
    nutritionalInfo: {
      ...mainNutrition.formatted,
      phosphorus: mainNutrition.formatted.phosphorus,
      calcium: mainNutrition.formatted.calcium
    },
    nutritionInfo: mainNutrition.infoString,
    rating: 0,
    reviews: 0
  };
}

function generateBirdRecipe(index) {
  const seeds = INGREDIENTS.birds.seeds;
  const veggies = INGREDIENTS.birds.vegetables;
  const fruits = INGREDIENTS.birds.fruits;
  const supplements = INGREDIENTS.birds.supplements;
  const cookingMethods = ['Fresh', 'Homemade', 'Classic', 'Nutrient-Rich', 'Feather-Boosting', 'Vitamin-Packed'];

  const seed1 = getRandomElement(seeds);
  const seed2 = getRandomElement(seeds.filter(s => s !== seed1));
  const veggie = getRandomElement(veggies);
  const fruit = Math.random() > 0.6 ? getRandomElement(fruits) : null;
  const supplement = getRandomElement(supplements);
  const cooking = getRandomElement(cookingMethods);

  const ingredients = [
    { id: '1', name: seed1, amount: '2 tbsp', amazonLink: getBestAffiliateLink(seed1) || `https://www.amazon.com/s?k=${encodeURIComponent(seed1.toLowerCase() + ' for birds')}` },
    { id: '2', name: seed2, amount: '1 tbsp', amazonLink: getBestAffiliateLink(seed2) || `https://www.amazon.com/s?k=${encodeURIComponent(seed2.toLowerCase() + ' for birds')}` },
    { id: '3', name: veggie, amount: '1 tsp grated', amazonLink: getBestAffiliateLink(veggie) || `https://www.amazon.com/s?k=${encodeURIComponent(veggie.toLowerCase() + ' for birds')}` },
    { id: '4', name: supplement, amount: 'pinch', amazonLink: getBestAffiliateLink(supplement) || `https://www.amazon.com/s?k=${encodeURIComponent(supplement.toLowerCase() + ' for birds')}` }
  ];

  if (fruit) ingredients.push({ id: '5', name: fruit, amount: '1/2 tsp chopped', amazonLink: getBestAffiliateLink(fruit) || `https://www.amazon.com/s?k=${encodeURIComponent(fruit.toLowerCase() + ' for birds')}` });

  const nutrition = calculateRecipeNutrition(ingredients);

  // Generate unique name using cooking method and ingredients
  const nameFormats = [
    `${cooking} ${seed1.split(' ')[0]} & ${seed2.split(' ')[0]} Mix`,
    `${cooking} ${seed1.split(' ')[0]} Bird Delight`,
    `${seed1.split(' ')[0]} ${seed2.split(' ')[0]} ${cooking} Blend`,
    `${cooking} Seed & ${veggie.split(' ')[0]} Mix`,
    `${seed1.split(' ')[0]} & ${veggie.split(' ')[0]} ${cooking} Feast`,
    `${cooking} Avian ${seed1.split(' ')[0]} Mix`
  ];
  const name = getRandomElement(nameFormats);

  return {
    id: generateRecipeId('birds', index),
    name,
    shortName: `${seed1.split(' ')[0]} Bird Mix`,
    celebrityName: "Tweety Bird",
    celebrityQuote: getRandomElement(CELEBRITY_QUOTES.birds),
    category: 'birds',
    breed: null,
    ageGroup: ['young', 'adult', 'senior'],
    healthConcerns: ['none'],
    description: `Nutrient-rich seed mix with fresh produce for optimal avian health.`,
    tags: ['seed-based', 'vitamin-rich', 'feather-health'],
    imageUrl: `/images/${getRandomImage()}`,
    prepTime: '5 min',
    cookTime: '0 min',
    servings: 1,
    ingredients,
    instructions: [
      `Mix seeds in appropriate proportions.`,
      `Grate or chop vegetables finely.`,
      `Add supplement and any fruit treats.`,
      `Serve in clean dish.`
    ],
    nutritionalInfo: {
      ...nutrition.formatted,
      phosphorus: nutrition.formatted.phosphorus,
      calcium: nutrition.formatted.calcium
    },
    nutritionInfo: nutrition.infoString,
    rating: 0,
    reviews: 0
  };
}

function generateReptileRecipe(index) {
  const insects = INGREDIENTS.reptiles.insects;
  const veggies = INGREDIENTS.reptiles.vegetables;
  const fruits = INGREDIENTS.reptiles.fruits;
  const cookingMethods = ['Fresh', 'Gut-Loaded', 'Calcium-Dusted', 'Vitamin-Enriched', 'Nutrient-Dense'];
  const isOmnivore = index % 2 === 0;

  const insect = getRandomElement(insects);
  const cooking = getRandomElement(cookingMethods);
  const ingredients = [
    { id: '1', name: insect, amount: '5-10 pieces', amazonLink: getBestAffiliateLink(insect) || `https://www.amazon.com/s?k=${encodeURIComponent(insect.toLowerCase() + ' for reptiles')}` }
  ];

  if (isOmnivore) {
    const veggie = getRandomElement(veggies);
    ingredients.push({ id: '2', name: veggie, amount: '1 cup chopped', amazonLink: getBestAffiliateLink(veggie) || `https://www.amazon.com/s?k=${encodeURIComponent(veggie.toLowerCase() + ' for bearded dragons')}` });

    if (Math.random() > 0.7) {
      const fruit = getRandomElement(fruits);
      ingredients.push({ id: '3', name: fruit, amount: '1 tbsp chopped', amazonLink: getBestAffiliateLink(fruit) || `https://www.amazon.com/s?k=${encodeURIComponent(fruit.toLowerCase() + ' for bearded dragons')}` });
    }
  }

  const nutrition = calculateRecipeNutrition(ingredients);

  // Generate unique name using cooking method and ingredients
  const nameFormats = isOmnivore ? [
    `${cooking} ${insect.split(' ')[0]} & Greens Feast`,
    `${cooking} ${insect.split(' ')[0]} Reptile Delight`,
    `${insect.split(' ')[0]} & Veggie ${cooking} Mix`,
    `${cooking} Omnivore ${insect.split(' ')[0]} Feast`,
    `${insect.split(' ')[0]} Greens ${cooking} Blend`,
    `${cooking} ${insect.split(' ')[0]} Garden Feast`
  ] : [
    `${cooking} ${insect.split(' ')[0]} Insect Mix`,
    `${cooking} ${insect.split(' ')[0]} Reptile Feast`,
    `${insect.split(' ')[0]} ${cooking} Insect Blend`,
    `${cooking} Insectivore ${insect.split(' ')[0]} Mix`,
    `${insect.split(' ')[0]} ${cooking} Protein Mix`,
    `${cooking} ${insect.split(' ')[0]} Delight`
  ];
  const name = getRandomElement(nameFormats);

  return {
    id: generateRecipeId('reptiles', index),
    name,
    shortName: isOmnivore ? `Dragon Feast` : `Gecko Feast`,
    celebrityName: "Godzilla",
    celebrityQuote: getRandomElement(CELEBRITY_QUOTES.reptiles),
    category: 'reptiles',
    breed: null,
    ageGroup: ['young', 'adult', 'senior'],
    healthConcerns: ['none'],
    description: isOmnivore ?
      `Complete omnivore diet with insects and fresh produce for bearded dragons.` :
      `Insect-based diet perfect for leopard geckos and other insectivorous reptiles.`,
    tags: isOmnivore ? ['omnivore', 'calcium-rich', 'vitamin-d'] : ['insectivore', 'high-protein', 'gut-loaded'],
    imageUrl: `/images/${getRandomImage()}`,
    prepTime: '10 min',
    cookTime: '0 min',
    servings: 1,
    ingredients,
    instructions: [
      `Ensure insects are gut-loaded with nutritious food.`,
      `Wash and chop vegetables if included.`,
      `Dust insects with calcium supplement.`,
      ...(isOmnivore ? [`Offer vegetables and occasional fruit.`] : []),
      `Remove uneaten food after 24 hours.`
    ],
    nutritionalInfo: {
      ...nutrition.formatted,
      phosphorus: nutrition.formatted.phosphorus,
      calcium: nutrition.formatted.calcium
    },
    nutritionInfo: nutrition.infoString,
    rating: 0,
    reviews: 0
  };
}

function generatePocketPetRecipe(index) {
  const hay = INGREDIENTS['pocket-pets'].hay;
  const veggies = INGREDIENTS['pocket-pets'].vegetables;
  const pellets = INGREDIENTS['pocket-pets'].pellets;
  const fruits = INGREDIENTS['pocket-pets'].fruits;
  const hamsterAdditions = INGREDIENTS['pocket-pets'].hamster_additions;
  const cookingMethods = ['Fresh', 'Nutrient-Rich', 'Vitamin-Boosted', 'Fiber-Focused', 'Balanced'];

  const petTypes = ['guinea-pig', 'rabbit', 'hamster'];
  const petType = petTypes[index % 3];
  const cooking = getRandomElement(cookingMethods);

  const hayType = getRandomElement(hay);
  const veggie1 = getRandomElement(veggies);
  const veggie2 = getRandomElement(veggies.filter(v => v !== veggie1));
  const pellet = getRandomElement(pellets.filter(p => p.includes(petType === 'guinea-pig' ? 'Guinea' : petType === 'rabbit' ? 'Rabbit' : 'Hamster')));

  const ingredients = [
    { id: '1', name: hayType, amount: 'Unlimited', amazonLink: getBestAffiliateLink(hayType) || `https://www.amazon.com/s?k=${encodeURIComponent(hayType.toLowerCase() + ' for ' + petType)}` },
    { id: '2', name: veggie1, amount: '1 cup', amazonLink: getBestAffiliateLink(veggie1) || `https://www.amazon.com/s?k=${encodeURIComponent(veggie1.toLowerCase() + ' for ' + petType)}` },
    { id: '3', name: veggie2, amount: '1/2 cup', amazonLink: getBestAffiliateLink(veggie2) || `https://www.amazon.com/s?k=${encodeURIComponent(veggie2.toLowerCase() + ' for ' + petType)}` },
    { id: '4', name: pellet, amount: '1/8 cup', amazonLink: getBestAffiliateLink(pellet) || `https://www.amazon.com/s?k=${encodeURIComponent(pellet.toLowerCase())}` }
  ];

  if (Math.random() > 0.8) {
    const fruit = getRandomElement(fruits);
    ingredients.push({ id: '5', name: fruit, amount: '1 tbsp', amazonLink: getBestAffiliateLink(fruit) || `https://www.amazon.com/s?k=${encodeURIComponent(fruit.toLowerCase() + ' for ' + petType)}` });
  }

  if (petType === 'hamster' && Math.random() > 0.7) {
    const addition = getRandomElement(hamsterAdditions);
    ingredients.push({ id: '6', name: addition, amount: '1 tsp', amazonLink: getBestAffiliateLink(addition) || `https://www.amazon.com/s?k=${encodeURIComponent(addition.toLowerCase() + ' for hamsters')}` });
  }

  const nutrition = calculateRecipeNutrition(ingredients);

  // Generate unique name using cooking method and ingredients
  const nameFormats = [
    `${cooking} ${hayType.split(' ')[0]} & ${veggie1.split(' ')[0]} Mix`,
    `${cooking} ${veggie1.split(' ')[0]} ${petType.replace('-', ' ')} Feast`,
    `${hayType.split(' ')[0]} ${veggie1.split(' ')[0]} ${cooking} Blend`,
    `${cooking} ${petType.replace('-', ' ')} ${veggie1.split(' ')[0]} Mix`,
    `${veggie1.split(' ')[0]} & ${hayType.split(' ')[0]} ${cooking} Delight`,
    `${cooking} ${hayType.split(' ')[0]} Pocket Pet Mix`
  ];
  const name = getRandomElement(nameFormats);

  return {
    id: generateRecipeId('pocket-pets', index),
    name,
    shortName: `${petType.replace('-', ' ')} Mix`,
    celebrityName: "Bugs Bunny",
    celebrityQuote: getRandomElement(CELEBRITY_QUOTES['pocket-pets']),
    category: 'pocket-pets',
    breed: null,
    ageGroup: ['young', 'adult', 'senior'],
    healthConcerns: ['none'],
    description: `Balanced diet with unlimited ${hayType.toLowerCase()} and fresh vegetables for ${petType.replace('-', ' ')} health.`,
    tags: ['hay-based', 'high-fiber', petType === 'guinea-pig' ? 'vitamin-c' : 'digestive-health'],
    imageUrl: `/images/${getRandomImage()}`,
    prepTime: '5 min',
    cookTime: '0 min',
    servings: 1,
    ingredients,
    instructions: [
      `Provide unlimited fresh hay.`,
      `Wash and chop vegetables appropriately.`,
      `Offer measured amount of pellets.`,
      `Introduce new foods gradually.`,
      `Remove uneaten fresh foods daily.`
    ],
    nutritionalInfo: {
      ...nutrition.formatted,
      phosphorus: nutrition.formatted.phosphorus,
      calcium: nutrition.formatted.calcium
    },
    nutritionInfo: nutrition.infoString,
    rating: 0,
    reviews: 0
  };
}

// Generate all recipes
const recipes = [];

// Dogs: 400 recipes
for (let i = 0; i < 400; i++) {
  recipes.push(generateDogRecipe(i));
}

// Cats: 300 recipes
for (let i = 0; i < 300; i++) {
  recipes.push(generateCatRecipe(i));
}

// Birds: 100 recipes
for (let i = 0; i < 100; i++) {
  recipes.push(generateBirdRecipe(i));
}

// Reptiles: 100 recipes
for (let i = 0; i < 100; i++) {
  recipes.push(generateReptileRecipe(i));
}

// Pocket Pets: 100 recipes
for (let i = 0; i < 100; i++) {
  recipes.push(generatePocketPetRecipe(i));
}

// Generate the file content
const fileContent = `// lib/data/recipes-complete.ts
// Auto-generated comprehensive recipe database
// Generated on: ${new Date().toISOString()}
// Total recipes: ${recipes.length}

import type { Recipe } from '../types';

export const recipes: Recipe[] = ${JSON.stringify(recipes, null, 2)};
`;

// Write to file
fs.writeFileSync('lib/data/recipes-complete.ts', fileContent);
console.log(`Generated ${recipes.length} recipes and saved to lib/data/recipes-complete.ts`);
