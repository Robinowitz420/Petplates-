// scripts/buildIngredients.js
// Processes all scraped results into a curated ingredient import file
// Dedupes, normalizes, and auto-tags ingredients based on source

const fs = require('fs');
const path = require('path');

/**
 * Infer subtype tags from source name/URL
 */
function inferSubtypesFromSource(source, category) {
  const subtypes = new Set();
  const sourceLower = (source || '').toLowerCase();
  const categoryLower = (category || '').toLowerCase();
  
  // Bird sources
  if (sourceLower.includes('lafeber') || 
      sourceLower.includes('aav') || 
      sourceLower.includes('avian') ||
      sourceLower.includes('parrots.org') ||
      sourceLower.includes('parrot')) {
    subtypes.add('bird_large');
  }
  
  if (sourceLower.includes('birdforum') || 
      sourceLower.includes('r/birdfood') ||
      sourceLower.includes('budgie') ||
      sourceLower.includes('cockatiel') ||
      sourceLower.includes('canary') ||
      sourceLower.includes('finch')) {
    subtypes.add('bird_small');
    subtypes.add('bird_large'); // Small bird sources often apply to large too
  }
  
  if (categoryLower.includes('bird')) {
    subtypes.add('bird_small');
    subtypes.add('bird_large');
  }
  
  // Reptile sources
  if (sourceLower.includes('california academy') || 
      sourceLower.includes('herpetology') ||
      sourceLower.includes('reptifiles') ||
      sourceLower.includes('reptiles magazine') ||
      sourceLower.includes('beardeddragon')) {
    subtypes.add('reptile_herbivore');
    subtypes.add('reptile_omnivore');
  }
  
  if (sourceLower.includes('leopardgecko') || 
      sourceLower.includes('gecko') ||
      sourceLower.includes('insectivore')) {
    subtypes.add('reptile_insectivore');
  }
  
  if (sourceLower.includes('snake') || 
      sourceLower.includes('python') ||
      sourceLower.includes('carnivore')) {
    subtypes.add('reptile_carnivore');
  }
  
  if (categoryLower.includes('reptile')) {
    // Default to all reptile subtypes if category matches
    subtypes.add('reptile_herbivore');
    subtypes.add('reptile_omnivore');
    subtypes.add('reptile_insectivore');
  }
  
  // Pocket pet sources
  if (sourceLower.includes('house rabbit') || 
      sourceLower.includes('rabbit.org') ||
      sourceLower.includes('rabbitforum') ||
      sourceLower.includes('r/rabbits')) {
    subtypes.add('pocket_hay');
  }
  
  if (sourceLower.includes('guineapig') || 
      sourceLower.includes('guinea pig') ||
      sourceLower.includes('cavy')) {
    subtypes.add('pocket_hay');
  }
  
  if (sourceLower.includes('hamster') || 
      sourceLower.includes('gerbil') ||
      sourceLower.includes('rat') ||
      sourceLower.includes('mouse')) {
    subtypes.add('pocket_varied');
  }
  
  if (sourceLower.includes('chinchilla')) {
    subtypes.add('pocket_hay');
  }
  
  if (sourceLower.includes('ferret')) {
    subtypes.add('pocket_carnivore');
  }
  
  if (sourceLower.includes('hedgehog')) {
    subtypes.add('pocket_insectivore');
  }
  
  if (categoryLower.includes('pocket')) {
    // Default to all pocket pet subtypes if category matches
    subtypes.add('pocket_hay');
    subtypes.add('pocket_varied');
  }
  
  return Array.from(subtypes);
}

/**
 * Normalize ingredient name to ID
 */
function normalizeIngredientName(name) {
  if (!name || typeof name !== 'string') return null;
  
  return name.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // Remove special chars
    .replace(/\s+/g, '_') // Spaces to underscores
    .replace(/_+/g, '_') // Multiple underscores to single
    .replace(/^_|_$/g, '') // Trim underscores
    .trim();
}

/**
 * Detect ingredient category
 */
function detectCategory(name) {
  if (!name) return 'other';
  
  const lower = name.toLowerCase();
  
  // Protein detection
  if (lower.match(/\b(chicken|turkey|beef|lamb|fish|salmon|tuna|meat|protein|pork|duck|organ|heart|liver|kidney|giblet)\b/)) {
    return 'protein';
  }
  
  // Insect detection
  if (lower.match(/\b(cricket|mealworm|roach|dubia|insect|superworm|hornworm|silkworm|waxworm|phoenix|black.*soldier.*fly|locust|mantid|fruit.*fly)\b/)) {
    return 'insect';
  }
  
  // Vegetable detection
  if (lower.match(/\b(carrot|broccoli|spinach|kale|lettuce|pepper|squash|vegetable|green|collard|mustard|turnip|dandelion|arugula|endive|escarole|bok.*choy|cabbage|celery|asparagus|fennel|parsley|cilantro|basil|mint|thyme|oregano|sage|rosemary|zucchini|cucumber|eggplant|leek|shallot|radicchio|frisee|mache|watercress|purslane|swiss.*chard|beet.*green)\b/)) {
    return 'vegetable';
  }
  
  // Fruit detection
  if (lower.match(/\b(apple|berry|mango|papaya|banana|fruit|grape|melon|cantaloupe|honeydew|watermelon|pineapple|kiwi|raspberry|blackberry|cranberry|cherry|pear|peach|plum|apricot|fig|date|raisin|currant|goji|mulberry|elderberry|strawberry|blueberry)\b/)) {
    return 'fruit';
  }
  
  // Grain/Seed detection
  if (lower.match(/\b(rice|oats|quinoa|barley|wheat|grain|seed|millet|canary|niger|hemp|flax|chia|sesame|sunflower|pumpkin|safflower|nyjer|amaranth|buckwheat|teff|rapeseed|poppy|corn|maize|groat)\b/)) {
    return 'grain';
  }
  
  // Hay detection
  if (lower.match(/\b(hay|timothy|alfalfa|grass|meadow|orchard|bermuda|bluegrass|fescue|ryegrass|straw|dried.*grass)\b/)) {
    return 'hay';
  }
  
  // Supplement detection
  if (lower.match(/\b(supplement|vitamin|calcium|taurine|pellet|fortified|cuttlebone|grit|probiotic|enzyme|glucosamine|chondroitin|omega|epa|dha|antioxidant|spirulina|kelp|brewer.*yeast|electrolyte|amino.*acid|joint.*health|vitamin.*c|vitamin.*d|vitamin.*a)\b/)) {
    return 'supplement';
  }
  
  return 'other';
}

/**
 * Process a single scrape result file
 */
function processScrapeFile(filePath) {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(fileContent);
    
    const ingredients = new Map();
    
    // Handle different file structures
    let results = [];
    if (Array.isArray(data)) {
      results = data;
    } else if (data.results && Array.isArray(data.results)) {
      results = data.results;
    } else if (data.ingredients && Array.isArray(data.ingredients)) {
      results = [data];
    }
    
    results.forEach(result => {
      const category = (result.category || result.type || '').toLowerCase();
      const source = result.source || result.url || filePath;
      
      // Extract ingredients
      const ingList = result.ingredients || [];
      if (!Array.isArray(ingList)) return;
      
      ingList.forEach(ing => {
        if (!ing || typeof ing !== 'string') return;
        
        // Filter out extremely long entries (likely scraped HTML/text errors)
        // Also filter out entries that look like navigation text or page content
        if (ing.length > 200 || 
            ing.includes('▼') || 
            ing.includes('shopping list') || 
            ing.includes('enclosure:') ||
            ing.includes('additional resources') ||
            ing.match(/\b(care|shopping|enclosure|decor|handling|health|diseases|tips)\b.*\b(care|shopping|enclosure|decor|handling|health|diseases|tips)\b/i)) {
          return;
        }
        
        const normalized = normalizeIngredientName(ing);
        if (!normalized || normalized.length < 2 || normalized.length > 100) return;
        
        // Infer subtypes from source
        const subtypes = inferSubtypesFromSource(source, category);
        const categoryType = detectCategory(ing);
        
        if (!ingredients.has(normalized)) {
          ingredients.set(normalized, {
            id: normalized,
            name: ing,
            category: categoryType,
            subtypeTags: new Set(subtypes),
            sources: new Set([source]),
            scrapedCount: 0
          });
        }
        
        const entry = ingredients.get(normalized);
        entry.subtypeTags = new Set([...entry.subtypeTags, ...subtypes]);
        entry.sources.add(source);
        entry.scrapedCount++;
      });
    });
    
    return ingredients;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return new Map();
  }
}

/**
 * Main build function
 */
async function buildIngredients() {
  console.log('🔨 Building curated ingredients from scraped data...\n');
  
  const resultsDir = path.join(__dirname, '../scraping/results');
  
  // Get all JSON files
  const files = fs.readdirSync(resultsDir);
  const jsonFiles = files.filter(f => f.endsWith('.json') && !f.includes('test'));
  
  console.log(`📁 Found ${jsonFiles.length} result files\n`);
  
  // Process all files
  const allIngredients = new Map();
  
  for (const file of jsonFiles) {
    const filePath = path.join(resultsDir, file);
    console.log(`  Processing: ${file}...`);
    
    const fileIngredients = processScrapeFile(filePath);
    
    // Merge into main map
    fileIngredients.forEach((data, normalized) => {
      if (!allIngredients.has(normalized)) {
        allIngredients.set(normalized, {
          id: data.id,
          name: data.name,
          category: data.category,
          subtypeTags: new Set(data.subtypeTags),
          sources: Array.from(data.sources).slice(0, 5), // Limit sources
          scrapedCount: data.scrapedCount
        });
      } else {
        const existing = allIngredients.get(normalized);
        // Merge subtype tags
        data.subtypeTags.forEach(tag => existing.subtypeTags.add(tag));
        // Merge sources (convert to Set temporarily, then back to array)
        const sourcesSet = new Set(existing.sources);
        data.sources.forEach(s => sourcesSet.add(s));
        existing.sources = Array.from(sourcesSet).slice(0, 5);
        existing.scrapedCount += data.scrapedCount;
      }
    });
  }
  
  console.log(`\n✅ Processed ${allIngredients.size} unique ingredients\n`);
  
  // Convert to TypeScript export format
  const generatedIngredients = Array.from(allIngredients.values())
    .map(ing => ({
      id: ing.id,
      name: ing.name,
      category: ing.category,
      subtypeTags: Array.from(ing.subtypeTags).sort(),
      confidence: ing.scrapedCount > 5 ? 'high' : ing.scrapedCount > 2 ? 'medium' : 'low',
      scrapedCount: ing.scrapedCount
    }))
    .sort((a, b) => {
      // Sort by category, then by name
      if (a.category !== b.category) {
        return a.category.localeCompare(b.category);
      }
      return a.name.localeCompare(b.name);
    });
  
  // Generate TypeScript file
  const tsContent = `// lib/data/generatedIngredients.ts
// AUTO-GENERATED - Do not edit manually
// Generated from scraped data on ${new Date().toISOString()}
// Run: node scripts/buildIngredients.js to regenerate

export interface GeneratedIngredient {
  id: string;
  name: string;
  category: 'protein' | 'vegetable' | 'fruit' | 'grain' | 'supplement' | 'insect' | 'hay' | 'other';
  subtypeTags: string[];
  confidence: 'high' | 'medium' | 'low';
  scrapedCount: number;
}

export const GENERATED_INGREDIENTS: GeneratedIngredient[] = ${JSON.stringify(generatedIngredients, null, 2)};

// Summary stats
export const GENERATED_INGREDIENTS_STATS = {
  total: ${generatedIngredients.length},
  byCategory: {
    protein: ${generatedIngredients.filter(i => i.category === 'protein').length},
    vegetable: ${generatedIngredients.filter(i => i.category === 'vegetable').length},
    fruit: ${generatedIngredients.filter(i => i.category === 'fruit').length},
    grain: ${generatedIngredients.filter(i => i.category === 'grain').length},
    supplement: ${generatedIngredients.filter(i => i.category === 'supplement').length},
    insect: ${generatedIngredients.filter(i => i.category === 'insect').length},
    hay: ${generatedIngredients.filter(i => i.category === 'hay').length},
    other: ${generatedIngredients.filter(i => i.category === 'other').length}
  },
  byConfidence: {
    high: ${generatedIngredients.filter(i => i.confidence === 'high').length},
    medium: ${generatedIngredients.filter(i => i.confidence === 'medium').length},
    low: ${generatedIngredients.filter(i => i.confidence === 'low').length}
  },
  bySubtype: {
    bird_small: ${generatedIngredients.filter(i => i.subtypeTags.includes('bird_small')).length},
    bird_large: ${generatedIngredients.filter(i => i.subtypeTags.includes('bird_large')).length},
    reptile_herbivore: ${generatedIngredients.filter(i => i.subtypeTags.includes('reptile_herbivore')).length},
    reptile_insectivore: ${generatedIngredients.filter(i => i.subtypeTags.includes('reptile_insectivore')).length},
    reptile_omnivore: ${generatedIngredients.filter(i => i.subtypeTags.includes('reptile_omnivore')).length},
    reptile_carnivore: ${generatedIngredients.filter(i => i.subtypeTags.includes('reptile_carnivore')).length},
    pocket_hay: ${generatedIngredients.filter(i => i.subtypeTags.includes('pocket_hay')).length},
    pocket_varied: ${generatedIngredients.filter(i => i.subtypeTags.includes('pocket_varied')).length},
    pocket_carnivore: ${generatedIngredients.filter(i => i.subtypeTags.includes('pocket_carnivore')).length},
    pocket_insectivore: ${generatedIngredients.filter(i => i.subtypeTags.includes('pocket_insectivore')).length}
  }
};
`;
  
  // Write TypeScript file
  const outputPath = path.join(__dirname, '../lib/data/generatedIngredients.ts');
  fs.writeFileSync(outputPath, tsContent, 'utf8');
  
  // Generate summary
  const stats = {
    total: generatedIngredients.length,
    byCategory: {},
    byConfidence: {},
    bySubtype: {}
  };
  
  generatedIngredients.forEach(ing => {
    stats.byCategory[ing.category] = (stats.byCategory[ing.category] || 0) + 1;
    stats.byConfidence[ing.confidence] = (stats.byConfidence[ing.confidence] || 0) + 1;
    ing.subtypeTags.forEach(tag => {
      stats.bySubtype[tag] = (stats.bySubtype[tag] || 0) + 1;
    });
  });
  
  console.log('📊 Summary:');
  console.log(`  Total ingredients: ${stats.total}`);
  console.log(`  By category:`, stats.byCategory);
  console.log(`  By confidence:`, stats.byConfidence);
  console.log(`  By subtype:`, stats.bySubtype);
  console.log(`\n📁 Saved to: ${outputPath}`);
  
  return generatedIngredients;
}

// Run if called directly
if (require.main === module) {
  buildIngredients()
    .then(() => {
      console.log('\n✅ Build complete!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Error:', error);
      process.exit(1);
    });
}

module.exports = { buildIngredients, inferSubtypesFromSource };

