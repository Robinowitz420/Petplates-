/**
 * Add manually provided cat and reptile products to commercial dataset
 */

import * as fs from 'fs/promises';

const CAT_PRODUCTS = [
  { name: "Chicken Feast", ingredients: ["Chicken", "Chicken Broth", "Meat By-Products"] },
  { name: "Chopped Grill Feast", ingredients: ["Meat Broth", "Meat By-Products", "Chicken"] },
  { name: "Cod, Sole & Shrimp Feast", ingredients: ["Cod", "Fish", "Meat By-Products"] },
  { name: "Ocean Whitefish & Tuna Feast", ingredients: ["Ocean Whitefish", "Fish", "Meat By-Products"] },
  { name: "Salmon & Shrimp Feast", ingredients: ["Salmon", "Meat By-Products", "Liver"] },
  { name: "Savory Salmon Feast", ingredients: ["Salmon", "Meat By-Products", "Liver"] },
  { name: "Seafood Feast", ingredients: ["Ocean Fish", "Meat By-Products", "Fish Broth"] },
  { name: "Tender Beef Feast", ingredients: ["Beef", "Beef Broth", "Meat By-Products"] },
  { name: "Tender Beef & Chicken Feast", ingredients: ["Meat Broth", "Beef", "Chicken"] },
  { name: "Tender Beef & Liver Feast", ingredients: ["Beef", "Beef Broth", "Liver"] },
  { name: "Tender Chicken & Liver Feast", ingredients: ["Chicken", "Chicken Broth", "Liver"] },
  { name: "Turkey & Giblets Feast", ingredients: ["Turkey", "Poultry Giblets", "Meat By-Products"] },
  { name: "Grilled Beef Feast in Gravy", ingredients: ["Beef Broth", "Beef", "Wheat Gluten"] },
  { name: "Grilled Chicken Feast in Gravy", ingredients: ["Chicken Broth", "Chicken", "Wheat Gluten"] },
  { name: "Grilled Liver & Chicken Feast in Gravy", ingredients: ["Chicken Broth", "Liver", "Chicken"] },
  { name: "Grilled Ocean Whitefish & Tuna Feast in Gravy", ingredients: ["Fish Broth", "Meat By-Products", "Wheat Gluten"] },
  { name: "Grilled Salmon Feast in Gravy", ingredients: ["Fish Broth", "Salmon", "Wheat Gluten"] },
  { name: "Grilled Salmon & Shrimp Feast in Gravy", ingredients: ["Fish Broth", "Salmon", "Wheat Gluten"] },
  { name: "Grilled Seafood Feast in Gravy", ingredients: ["Fish Broth", "Ocean Fish", "Wheat Gluten"] },
  { name: "Grilled Tuna Feast in Gravy", ingredients: ["Fish Broth", "Tuna", "Wheat Gluten"] },
  { name: "Grilled Turkey Feast in Gravy", ingredients: ["Turkey Broth", "Turkey", "Wheat Gluten"] },
  { name: "Beef Feast in Gravy", ingredients: ["Poultry Broth", "Turkey", "Liver"] },
  { name: "Chicken Feast in Gravy", ingredients: ["Chicken Broth", "Chicken", "Liver"] },
  { name: "Ocean Whitefish & Tuna Feast in Gravy", ingredients: ["Fish Broth", "Ocean Whitefish", "Tuna"] },
  { name: "Salmon & Sole Feast in Gravy", ingredients: ["Fish Broth", "Salmon", "Sole"] },
  { name: "Turkey Feast in Gravy", ingredients: ["Poultry Broth", "Turkey", "Liver"] },
  { name: "Chicken & Beef Feast in Gravy", ingredients: ["Chicken Broth", "Chicken", "Liver"] },
  { name: "Flaked Chicken & Tuna Feast", ingredients: ["Chicken", "Fish", "Chicken Broth"] },
  { name: "Flaked Fish & Shrimp Feast", ingredients: ["Fish Broth", "Fish", "Shrimp"] },
  { name: "Flaked Salmon & Ocean Whitefish Feast", ingredients: ["Fish Broth", "Salmon", "Ocean Whitefish"] },
  { name: "Flaked Tuna Feast", ingredients: ["Fish Broth", "Tuna", "Fish"] },
  { name: "Flaked Tuna & Mackerel Feast", ingredients: ["Fish Broth", "Tuna", "Mackerel"] },
  { name: "Flaked Trout Feast", ingredients: ["Fish Broth", "Trout", "Fish"] },
  { name: "Chunky Chicken Feast", ingredients: ["Chicken Broth", "Chicken", "Meat By-Products"] },
  { name: "Chunky Chopped Grill Feast", ingredients: ["Meat Broth", "Meat By-Products", "Chicken"] },
  { name: "Chunky Turkey Feast", ingredients: ["Turkey Broth", "Turkey", "Meat By-Products"] },
  { name: "White Meat Chicken Florentine", ingredients: ["Poultry Broth", "Chicken", "Wheat Gluten"] },
  { name: "Wild Salmon Primavera", ingredients: ["Fish Broth", "Salmon", "Wheat Gluten"] },
  { name: "Tuna Tuscany", ingredients: ["Fish Broth", "Tuna", "Wheat Gluten"] },
  { name: "Beef Ragu & Pasta", ingredients: ["Beef Broth", "Beef", "Wheat Gluten"] },
  { name: "Turkey Primavera", ingredients: ["Turkey Broth", "Turkey", "Wheat Gluten"] },
  { name: "Wild Salmon Florentine", ingredients: ["Fish Broth", "Salmon", "Wheat Gluten"] },
  { name: "Beef Recipe Paté", ingredients: ["Beef", "Meat Broth", "Liver"] },
  { name: "Chicken Recipe Paté", ingredients: ["Chicken", "Chicken Broth", "Liver"] },
  { name: "Salmon Recipe Paté", ingredients: ["Salmon", "Fish Broth", "Fish"] },
  { name: "Trout Recipe Paté", ingredients: ["Trout", "Fish Broth", "Fish"] },
  { name: "Tuna Recipe Paté", ingredients: ["Tuna", "Fish Broth", "Fish"] },
  { name: "White Meat Chicken Recipe Paté", ingredients: ["Chicken", "Chicken Broth", "Liver"] },
  { name: "Wild Alaskan Salmon Recipe Paté", ingredients: ["Salmon", "Fish Broth", "Fish"] },
  { name: "Grilled Chicken Feast & Cheddar", ingredients: ["Chicken Broth", "Chicken", "Wheat Gluten"] },
  { name: "Grilled Turkey Feast & Cheddar", ingredients: ["Turkey Broth", "Turkey", "Wheat Gluten"] },
  { name: "Whitefish & Cheddar Cheese Feast", ingredients: ["Fish Broth", "Ocean Whitefish", "Wheat Gluten"] },
  { name: "Paté with Chicken & Gravy Center", ingredients: ["Chicken", "Chicken Broth", "Meat By-Products"] },
  { name: "Paté with Beef & Gravy Center", ingredients: ["Beef", "Beef Broth", "Meat By-Products"] },
  { name: "Paté with Salmon & Gravy Center", ingredients: ["Salmon", "Fish Broth", "Fish"] },
  { name: "Paté with Tuna & Gravy Center", ingredients: ["Tuna", "Fish Broth", "Fish"] },
  { name: "Gems Mousse Chicken", ingredients: ["Chicken", "Chicken Broth", "Liver"] },
  { name: "Gems Mousse Beef", ingredients: ["Beef", "Beef Broth", "Liver"] },
  { name: "Gems Mousse Salmon", ingredients: ["Salmon", "Fish Broth", "Fish"] },
  { name: "Gems Mousse Tuna", ingredients: ["Tuna", "Fish Broth", "Fish"] },
  { name: "Creamy Delights Chicken Feast", ingredients: ["Chicken", "Poultry Broth", "Liver"] },
  { name: "Creamy Delights Tuna Feast", ingredients: ["Tuna", "Fish Broth", "Fish"] },
  { name: "Creamy Delights Salmon Feast", ingredients: ["Salmon", "Fish Broth", "Fish"] },
  { name: "Kitten Classic Paté Chicken Feast", ingredients: ["Chicken", "Poultry Broth", "Liver"] },
  { name: "Kitten Classic Paté Turkey & Whitefish Feast", ingredients: ["Turkey", "Poultry Broth", "Liver"] },
  { name: "Kitten Gravy Lovers Poultry & Beef", ingredients: ["Poultry Broth", "Turkey", "Liver"] },
  { name: "High Protein Senior 7+ Chicken Feast Paté", ingredients: ["Chicken", "Poultry Broth", "Liver"] },
  { name: "High Protein Senior 7+ Chicken Minced Gravy", ingredients: ["Chicken Broth", "Chicken", "Wheat Gluten"] },
];

const POCKET_PET_PRODUCTS = [
  { name: "Oxbow Essentials Hamster & Gerbil Food", ingredients: ["Whole Brown Rice", "Oat Groats", "Wheat Bran"] },
  { name: "Oxbow Essentials Cavy Cuisine Adult Guinea Pig Food", ingredients: ["Timothy Meal", "Soybean Hulls", "Soybean Meal"] },
  { name: "Oxbow Essentials Adult Rabbit Food", ingredients: ["Timothy Meal", "Soybean Hulls", "Soybean Meal"] },
  { name: "Oxbow Essentials Adult Rat Food", ingredients: ["Whole Brown Rice", "Oat Groats", "Wheat Bran"] },
  { name: "Oxbow Essentials Adult Mouse Food", ingredients: ["Whole Brown Rice", "Oat Groats", "Wheat Bran"] },
  { name: "Wysong Epigen 90 Ferret Food", ingredients: ["Chicken Meal", "Organic Chicken", "Chicken By-Products"] },
  { name: "Oxbow Essentials Chinchilla Food", ingredients: ["Alfalfa Meal", "Soybean Hulls", "Soybean Meal"] },
  { name: "Exotic Nutrition HPW Diet Sugar Glider", ingredients: ["Water", "Dried Whey Protein Concentrate", "Honey"] },
  { name: "Exotic Nutrition HPW Diet Hedgehog", ingredients: ["Water", "Dried Whey Protein Concentrate", "Honey"] },
];

const REPTILE_PRODUCTS = [
  { name: "Can O' Crickets", ingredients: ["Crickets", "Water"] },
  { name: "Can O' Mealworms", ingredients: ["Mealworms", "Water"] },
  { name: "Can O' Superworms", ingredients: ["Superworms", "Water"] },
  { name: "Can O' Snails", ingredients: ["Snails", "Water"] },
  { name: "Can O' Silkworms", ingredients: ["Silkworms", "Water"] },
  { name: "Blue Tongue Skink & Tegu Food", ingredients: ["Chicken", "Soybean Meal", "Ground Corn"] },
  { name: "Box Turtle Food", ingredients: ["Apple", "Corn Meal", "Whole Corn"] },
  { name: "Tortoise & Omnivorous Lizard Food", ingredients: ["Opuntia Cactus", "Whole Peas", "Apples"] },
  { name: "Gourmet-Style Crickets", ingredients: ["Crickets", "Water"] },
  { name: "Gourmet-Style Mealworms", ingredients: ["Mealworms", "Water"] },
  { name: "Gourmet-Style Grasshoppers", ingredients: ["Grasshoppers", "Water"] },
  { name: "Gourmet Canned Omnivore Mix", ingredients: ["Mealworms", "Squash", "Carrots"] },
  { name: "Gourmet Canned Mixed Insects", ingredients: ["Superworms", "Grasshoppers", "Dubia Roaches"] },
  { name: "Tinned Crickets", ingredients: ["Crickets", "Water"] },
  { name: "Tinned Mealworms", ingredients: ["Mealworms", "Water"] },
  { name: "Tinned Grasshoppers", ingredients: ["Grasshoppers", "Water"] },
  { name: "Tinned Super Worms", ingredients: ["Morio Worms", "Water"] },
  { name: "Zoo Med Bearded Dragon Food Pellets", ingredients: ["Soybean Meal", "Ground Corn", "Calcium Carbonate"] },
  { name: "Repashy Beardie Buffet", ingredients: ["Insect Meal", "Dried Potato", "Dried Fruit"] },
  { name: "Repashy Leopard Gecko Classic", ingredients: ["Insect meal", "Dried Potato", "Dried Fruit"] },
  { name: "Repashy Grub Pie", ingredients: ["Insect meal", "Dried Potato", "Dried Fruit"] },
  { name: "Repashy Bluey Buffet", ingredients: ["Insect meal", "Grain products", "Plant products"] },
  { name: "Repashy Crested Gecko MRP", ingredients: ["Dried Fruit", "Insect meal", "Whey Protein"] },
  { name: "Hikari DragonGel", ingredients: ["Mealworm meal", "Japanese mustard spinach", "Soybean meal"] },
  { name: "Hikari LeopaGel", ingredients: ["Mealworm meal", "Silkworm meal", "Soybean meal"] },
  { name: "Tetra ReptoMin Floating Food Sticks", ingredients: ["Fish Meal", "Ground Corn", "Oat Meal"] },
  { name: "Exo Terra Tortoise Food Flower & Fruit", ingredients: ["Dried Grass Meal", "Dried Chicory Root", "Dried Mango"] },
  { name: "Zoo Med Iguana Food Adult Formula", ingredients: ["Timothy Meal", "Alfalfa Meal", "Ground Corn"] },
];

const BIRD_PRODUCTS = [
  { name: "ZuPreem FruitBlend Small Bird Food", ingredients: ["Ground Corn", "Soybean Meal", "Ground Wheat"] },
  { name: "ZuPreem FruitBlend Medium Bird Food", ingredients: ["Ground Corn", "Soybean Meal", "Ground Wheat"] },
  { name: "ZuPreem FruitBlend Large Bird Food", ingredients: ["Ground Corn", "Soybean Meal", "Ground Wheat"] },
  { name: "Higgins Sunburst Gourmet Canary & Finch Food", ingredients: ["Canary Grass Seed", "White Proso Millet", "Red Millet"] },
  { name: "Harrison's Adult Lifetime Coarse Bird Food", ingredients: ["Organic Ground Whole Yellow Corn", "Organic Ground Whole Hulless Barley", "Organic Hulled Gray Millet"] },
  { name: "Lafeber's Nutri-Berries General Parrot", ingredients: ["Hulled White Proso Millet", "Ground Oats", "Safflower Seed"] },
];

function normalizeIngredient(name: string): string {
  const lower = name.toLowerCase().trim();
  
  // Skip water and broth
  if (lower.includes('water') || lower.includes('broth')) return 'skip';
  
  // CRITICAL: Preserve oil variants (fish_oil, salmon_oil, anchovy_oil, etc.)
  // These must NOT collapse to base ingredients
  if (lower.includes('anchovy') && lower.includes('oil')) return 'anchovy_oil';
  if (lower.includes('sardine') && lower.includes('oil')) return 'sardine_oil';
  if (lower.includes('salmon') && lower.includes('oil')) return 'salmon_oil';
  if (lower.includes('fish') && lower.includes('oil')) return 'fish_oil';
  if (lower.includes('cod') && lower.includes('oil')) return 'cod_liver_oil';
  if (lower.includes('chicken') && lower.includes('fat')) return 'chicken_fat';
  if (lower.includes('duck') && lower.includes('fat')) return 'duck_fat';
  if (lower.includes('beef') && lower.includes('fat')) return 'beef_fat';
  if (lower.includes('pork') && lower.includes('fat')) return 'pork_fat';
  if (lower.includes('coconut') && lower.includes('oil')) return 'coconut_oil';
  if (lower.includes('olive') && lower.includes('oil')) return 'olive_oil';
  if (lower.includes('sunflower') && lower.includes('oil')) return 'sunflower_oil';
  if (lower.includes('flaxseed') && lower.includes('oil')) return 'flaxseed_oil';
  if (lower.includes('canola') && lower.includes('oil')) return 'canola_oil';
  
  // Proteins (only after checking for oils/fats)
  if (lower.includes('chicken')) return 'chicken';
  if (lower.includes('beef')) return 'beef';
  if (lower.includes('turkey') || lower.includes('poultry giblets')) return 'turkey';
  if (lower.includes('salmon')) return 'salmon';
  if (lower.includes('tuna')) return 'tuna';
  if (lower.includes('cod')) return 'cod';
  if (lower.includes('whitefish') || lower.includes('ocean fish')) return 'whitefish';
  if (lower.includes('sole')) return 'sole';
  if (lower.includes('mackerel')) return 'mackerel';
  if (lower.includes('trout')) return 'trout';
  if (lower.includes('shrimp')) return 'shrimp';
  if (lower.includes('fish')) return 'fish';
  if (lower.includes('liver')) return 'liver';
  if (lower.includes('duck')) return 'duck';
  if (lower.includes('lamb')) return 'lamb';
  if (lower.includes('pork')) return 'pork';
  if (lower.includes('venison')) return 'venison';
  if (lower.includes('rabbit')) return 'rabbit';
  
  // Skip category tokens (they poison PMI)
  if (lower === 'meat' || lower === 'meats') return 'skip';
  if (lower === 'grain' || lower === 'grains') return 'skip';
  if (lower === 'vegetable' || lower === 'vegetables') return 'skip';
  if (lower === 'fat' || lower === 'fats') return 'skip';
  if (lower === 'oil' || lower === 'oils') return 'skip';
  
  // Insects
  if (lower.includes('cricket')) return 'crickets';
  if (lower.includes('mealworm')) return 'mealworms';
  if (lower.includes('superworm')) return 'superworms';
  if (lower.includes('grasshopper')) return 'grasshoppers';
  if (lower.includes('roach')) return 'roaches';
  if (lower.includes('snail')) return 'snails';
  if (lower.includes('silkworm')) return 'silkworms';
  if (lower.includes('insect')) return 'insect_meal';
  
  // Grains
  if (lower.includes('wheat gluten') || lower.includes('wheat')) return 'wheat';
  if (lower.includes('corn')) return 'corn';
  if (lower.includes('rice')) return 'rice';
  if (lower.includes('soybean')) return 'soybean';
  if (lower.includes('oat')) return 'oats';
  if (lower.includes('barley')) return 'barley';
  if (lower.includes('millet')) return 'millet';
  
  // Hay/Grass
  if (lower.includes('timothy')) return 'timothy_hay';
  if (lower.includes('alfalfa')) return 'alfalfa';
  if (lower.includes('grass')) return 'grass';
  
  // Seeds
  if (lower.includes('safflower')) return 'safflower_seed';
  if (lower.includes('seed')) return 'seed';
  
  // Vegetables/Fruits
  if (lower.includes('carrot')) return 'carrot';
  if (lower.includes('peas')) return 'peas';
  if (lower.includes('squash')) return 'squash';
  if (lower.includes('potato')) return 'potato';
  if (lower.includes('apple')) return 'apple';
  if (lower.includes('mango')) return 'mango';
  if (lower.includes('banana')) return 'banana';
  if (lower.includes('cactus')) return 'cactus';
  if (lower.includes('spinach')) return 'greens';
  if (lower.includes('chicory')) return 'chicory';
  
  // Other
  if (lower.includes('whey protein')) return 'whey_protein';
  if (lower.includes('honey')) return 'honey';
  if (lower.includes('egg')) return 'egg';
  if (lower.includes('calcium')) return 'skip'; // Skip supplements
  
  return 'skip';
}

async function addManualProducts() {
  console.log('\n📊 Adding manual products (cats, reptiles, pocket pets, birds)...\n');
  
  // Load existing data
  const existing = JSON.parse(await fs.readFile('./output/commercial-top-ingredients.json', 'utf-8'));
  
  const ingredientFrequency = { ...existing.ingredientFrequency };
  const topIngredientPairs = { ...existing.topIngredientPairs };
  
  let catCount = 0;
  let reptileCount = 0;
  let pocketPetCount = 0;
  let birdCount = 0;
  
  // Helper to process products
  const processProducts = (products: typeof CAT_PRODUCTS) => {
    let count = 0;
    for (const product of products) {
      const ingredients = product.ingredients
        .map(normalizeIngredient)
        .filter(i => i !== 'skip');
      
      // CRITICAL: Deduplicate ingredient IDs per product (avoid beef+beef, egg+egg)
      const uniqueIngredients = Array.from(new Set(ingredients));
      
      if (uniqueIngredients.length >= 2) {
        count++;
        
        // Count ingredients
        uniqueIngredients.forEach(ing => {
          ingredientFrequency[ing] = (ingredientFrequency[ing] || 0) + 1;
        });
        
        // Count pairs
        for (let i = 0; i < uniqueIngredients.length; i++) {
          for (let j = i + 1; j < uniqueIngredients.length; j++) {
            const pair = [uniqueIngredients[i], uniqueIngredients[j]].sort().join('|');
            topIngredientPairs[pair] = (topIngredientPairs[pair] || 0) + 1;
          }
        }
      }
    }
    return count;
  };
  
  // Process all product types
  catCount = processProducts(CAT_PRODUCTS);
  reptileCount = processProducts(REPTILE_PRODUCTS);
  pocketPetCount = processProducts(POCKET_PET_PRODUCTS);
  birdCount = processProducts(BIRD_PRODUCTS);
  
  console.log(`✅ Added ${catCount} cat products`);
  console.log(`✅ Added ${reptileCount} reptile products`);
  console.log(`✅ Added ${pocketPetCount} pocket pet products`);
  console.log(`✅ Added ${birdCount} bird products\n`);
  
  // Save updated data
  await fs.writeFile(
    './output/commercial-top-ingredients.json',
    JSON.stringify({ ingredientFrequency, topIngredientPairs }, null, 2),
    'utf-8'
  );
  
  // Show updated top ingredients
  console.log('Updated top 20 ingredients:');
  Object.entries(ingredientFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .forEach(([ing, count]) => console.log(`  ${count.toString().padStart(4)} | ${ing}`));
  
  console.log('\nUpdated top 30 ingredient pairs:');
  Object.entries(topIngredientPairs)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30)
    .forEach(([pair, count]) => console.log(`  ${count.toString().padStart(4)} | ${pair.replace('|', ' + ')}`));
  
  console.log('\n💾 Updated commercial-top-ingredients.json');
}

addManualProducts().catch(console.error);
