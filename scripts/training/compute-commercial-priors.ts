/**
 * COMPUTE COMMERCIAL PRIORS WITH PROPER PMI
 * 
 * Steps:
 * 1. Filter to top 5-7 real ingredients (drop vitamins/minerals/preservatives)
 * 2. Compute ingredient counts and pair counts
 * 3. Compute PMI with thresholds (minIng>=20, minPair>=5)
 * 4. Detect hardBlockPairs (never-seen) and strongPenaltyPairs (rare+negative PMI)
 * 5. Write to recipePriors.json under commercialPriors section
 */

import * as fs from 'fs/promises';

interface CommercialPriors {
  version: string;
  generatedAt: string;
  metadata: {
    totalProducts: number;
    minIngredientCount: number;
    minPairCount: number;
    minCommonIngredient: number;
  };
  commercialPriors: {
    [species: string]: {
      ingredientCounts: Record<string, number>;
      ingredientFreq: Record<string, number>;
      pairCounts: Record<string, number>;
      pairPMI: Record<string, number>;
      hardBlockPairs: string[];
      strongPenaltyPairs: string[];
    };
  };
}

// Thresholds - CONSERVATIVE to avoid over-blocking
const MIN_ING_COUNT = 30; // Ingredient must appear in at least 30 products (up from 20)
const MIN_PAIR_COUNT = 5; // Pair must appear in at least 5 products
const MIN_COMMON_ING = 40; // For hardBlock detection (up from 20, very conservative)
const RARE_PAIR_MAX = 2; // For strongPenalty detection
const NEGATIVE_PMI_THRESHOLD = -1.5;
const SMOOTHING = 0.5;

// Category tokens to skip (they poison PMI)
const CATEGORY_TOKENS = new Set(['grain', 'meat', 'vegetable', 'fat', 'oil']);

async function computeCommercialPriors() {
  console.log('\n📊 Computing commercial priors with proper PMI...\n');
  
  // Load commercial top ingredients data
  const data = JSON.parse(await fs.readFile('./output/commercial-top-ingredients.json', 'utf-8'));
  
  const ingredientFrequency: Record<string, number> = data.ingredientFrequency;
  const topIngredientPairs: Record<string, number> = data.topIngredientPairs;
  
  // Total products (estimate from max ingredient count)
  const totalProducts = Math.max(...Object.values(ingredientFrequency));
  
  console.log(`Total products (estimated): ${totalProducts}`);
  console.log(`Unique ingredients: ${Object.keys(ingredientFrequency).length}`);
  console.log(`Unique pairs: ${Object.keys(topIngredientPairs).length}\n`);
  
  // Step 1: Filter to common ingredients (count >= MIN_ING_COUNT) and remove category tokens
  const commonIngredients = Object.entries(ingredientFrequency)
    .filter(([ing, count]) => count >= MIN_ING_COUNT && !CATEGORY_TOKENS.has(ing))
    .map(([ing, _]) => ing);
  
  console.log(`Common ingredients (>=${MIN_ING_COUNT}): ${commonIngredients.length}`);
  
  // Step 2: Compute PMI for valid pairs
  const pairPMI: Record<string, number> = {};
  const validPairs: Record<string, number> = {};
  
  for (const [pair, pairCount] of Object.entries(topIngredientPairs)) {
    if (pairCount < MIN_PAIR_COUNT) continue;
    
    const [ing1, ing2] = pair.split('|');
    const count1 = ingredientFrequency[ing1] || 0;
    const count2 = ingredientFrequency[ing2] || 0;
    
    // Both ingredients must be common
    if (count1 < MIN_ING_COUNT || count2 < MIN_ING_COUNT) continue;
    
    // Compute PMI with smoothing
    const pXY = (pairCount + SMOOTHING) / (totalProducts + SMOOTHING);
    const pX = (count1 + SMOOTHING) / (totalProducts + SMOOTHING);
    const pY = (count2 + SMOOTHING) / (totalProducts + SMOOTHING);
    const pmi = Math.log2(pXY / (pX * pY));
    
    pairPMI[pair] = Math.round(pmi * 100) / 100;
    validPairs[pair] = pairCount;
  }
  
  console.log(`Valid pairs (>=${MIN_PAIR_COUNT}, both ingredients >=${MIN_ING_COUNT}): ${Object.keys(validPairs).length}\n`);
  
  // Step 3: Detect hardBlockPairs (never-seen)
  // CRITICAL: Be very conservative - data quality is limited
  // Don't block poultry + fish (fish oil is common supplement)
  const hardBlockPairs: string[] = [];
  const POULTRY = new Set(['chicken', 'turkey', 'duck']);
  const FISH = new Set(['fish', 'salmon', 'tuna', 'cod', 'whitefish', 'trout', 'mackerel']);
  
  for (let i = 0; i < commonIngredients.length; i++) {
    for (let j = i + 1; j < commonIngredients.length; j++) {
      const pair = [commonIngredients[i], commonIngredients[j]].sort().join('|');
      const ing1 = commonIngredients[i];
      const ing2 = commonIngredients[j];
      
      // Skip poultry + fish combinations (fish oil is common with poultry)
      if ((POULTRY.has(ing1) && FISH.has(ing2)) || (FISH.has(ing1) && POULTRY.has(ing2))) {
        continue;
      }
      
      // Both common, but pair count is 0
      if (!topIngredientPairs[pair] || topIngredientPairs[pair] === 0) {
        const count1 = ingredientFrequency[ing1];
        const count2 = ingredientFrequency[ing2];
        
        if (count1 >= MIN_COMMON_ING && count2 >= MIN_COMMON_ING) {
          hardBlockPairs.push(pair);
        }
      }
    }
  }
  
  console.log(`hardBlockPairs (never-seen, both >=${MIN_COMMON_ING}): ${hardBlockPairs.length}`);
  
  // Step 4: Detect strongPenaltyPairs (rare + negative PMI)
  const strongPenaltyPairs: string[] = [];
  
  for (const [pair, pairCount] of Object.entries(topIngredientPairs)) {
    if (pairCount > RARE_PAIR_MAX) continue;
    
    const [ing1, ing2] = pair.split('|');
    const count1 = ingredientFrequency[ing1] || 0;
    const count2 = ingredientFrequency[ing2] || 0;
    
    // Both must be somewhat common
    if (count1 < MIN_ING_COUNT || count2 < MIN_ING_COUNT) continue;
    
    // Compute PMI
    const pXY = (pairCount + SMOOTHING) / (totalProducts + SMOOTHING);
    const pX = (count1 + SMOOTHING) / (totalProducts + SMOOTHING);
    const pY = (count2 + SMOOTHING) / (totalProducts + SMOOTHING);
    const pmi = Math.log2(pXY / (pX * pY));
    
    if (pmi < NEGATIVE_PMI_THRESHOLD) {
      strongPenaltyPairs.push(pair);
    }
  }
  
  console.log(`strongPenaltyPairs (rare + PMI<${NEGATIVE_PMI_THRESHOLD}): ${strongPenaltyPairs.length}\n`);
  
  // Step 5: Build commercial priors structure (species-specific)
  // Note: Current data is mixed species, so we'll put it under 'dogs' and 'cats'
  // since most commercial products are for these species
  const commercialPriors: CommercialPriors = {
    version: '2.0.0',
    generatedAt: new Date().toISOString(),
    metadata: {
      totalProducts,
      minIngredientCount: MIN_ING_COUNT,
      minPairCount: MIN_PAIR_COUNT,
      minCommonIngredient: MIN_COMMON_ING,
    },
    commercialPriors: {
      dogs: {
        ingredientCounts: ingredientFrequency,
        ingredientFreq: Object.fromEntries(
          Object.entries(ingredientFrequency)
            .filter(([_, count]) => count >= MIN_ING_COUNT)
        ),
        pairCounts: validPairs,
        pairPMI,
        hardBlockPairs,
        strongPenaltyPairs,
      },
      cats: {
        ingredientCounts: ingredientFrequency,
        ingredientFreq: Object.fromEntries(
          Object.entries(ingredientFrequency)
            .filter(([_, count]) => count >= MIN_ING_COUNT)
        ),
        pairCounts: validPairs,
        pairPMI,
        hardBlockPairs,
        strongPenaltyPairs,
      },
    },
  };
  
  // Step 6: Merge with existing recipePriors.json
  let existingPriors: any = {};
  try {
    const existing = await fs.readFile('../../lib/data/recipePriors.json', 'utf-8');
    existingPriors = JSON.parse(existing);
  } catch (error) {
    console.log('No existing recipePriors.json found, creating new one');
  }
  
  // Merge without overwriting recipe priors
  const merged = {
    ...existingPriors,
    commercialPriors: commercialPriors.commercialPriors,
    commercialMetadata: commercialPriors.metadata,
    commercialVersion: commercialPriors.version,
    commercialGeneratedAt: commercialPriors.generatedAt,
  };
  
  await fs.writeFile(
    '../../lib/data/recipePriors.json',
    JSON.stringify(merged, null, 2),
    'utf-8'
  );
  
  console.log('💾 Updated recipePriors.json with commercial priors\n');
  
  // Step 7: Show examples
  console.log('📈 Top 10 positive PMI pairs:');
  Object.entries(pairPMI)
    .filter(([_, pmi]) => pmi > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([pair, pmi]) => {
      const count = validPairs[pair];
      console.log(`  ${pair.replace('|', ' + ')}: PMI=${pmi.toFixed(2)}, count=${count}`);
    });
  
  console.log('\n📈 Sample hardBlockPairs (never-seen):');
  hardBlockPairs.slice(0, 20).forEach(pair => {
    const [ing1, ing2] = pair.split('|');
    const count1 = ingredientFrequency[ing1];
    const count2 = ingredientFrequency[ing2];
    console.log(`  ${pair.replace('|', ' + ')}: ${ing1}(${count1}) + ${ing2}(${count2}) = NEVER`);
  });
  
  console.log('\n📈 Sample strongPenaltyPairs:');
  strongPenaltyPairs.slice(0, 10).forEach(pair => {
    const count = topIngredientPairs[pair] || 0;
    console.log(`  ${pair.replace('|', ' + ')}: count=${count} (RARE)`);
  });
  
  // Check for turkey + fish combinations
  console.log('\n🔍 Checking turkey + fish combinations:');
  const turkeyFishPairs = hardBlockPairs.filter(p => 
    (p.includes('turkey') && (p.includes('fish') || p.includes('salmon') || p.includes('tuna') || p.includes('anchovy')))
  );
  
  if (turkeyFishPairs.length > 0) {
    console.log('  ✅ Found turkey + fish hardBlockPairs:');
    turkeyFishPairs.forEach(pair => console.log(`     ${pair.replace('|', ' + ')}`));
  } else {
    console.log('  ⚠️  No turkey + fish hardBlockPairs detected (may need more data)');
  }
}

computeCommercialPriors().catch(console.error);
