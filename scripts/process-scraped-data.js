// scripts/process-scraped-data.js
// Processes scraped results and populates global ingredient pool

const fs = require('fs');
const path = require('path');

/**
 * Normalize ingredient name to ID format
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
function detectCategory(name, speciesCategory) {
  if (!name) return 'other';
  
  const lower = name.toLowerCase();
  
  // Protein detection
  if (lower.match(/\b(chicken|turkey|beef|lamb|fish|salmon|tuna|meat|protein|pork|duck|organ|heart|liver|kidney)\b/)) {
    return 'protein';
  }
  
  // Insect detection
  if (lower.match(/\b(cricket|mealworm|roach|dubia|insect|superworm|hornworm|silkworm|waxworm|phoenix|black.*soldier.*fly)\b/)) {
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
 * Map species category to normalized species
 */
function normalizeSpeciesCategory(category) {
  if (!category) return 'unknown';
  
  const lower = category.toLowerCase();
  
  if (lower.includes('bird') || lower.includes('avian')) return 'bird';
  if (lower.includes('reptile') || lower.includes('herpetology')) return 'reptile';
  if (lower.includes('pocket') || lower.includes('rabbit') || lower.includes('guinea') || lower.includes('hamster') || lower.includes('ferret') || lower.includes('chinchilla')) return 'pocket-pet';
  if (lower.includes('dog')) return 'dog';
  if (lower.includes('cat')) return 'cat';
  if (lower.includes('dogs-cats')) return 'dogs-cats';
  
  return 'unknown';
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
      // Single result object
      results = [data];
    }
    
    results.forEach(result => {
      const category = normalizeSpeciesCategory(result.category || result.type);
      const source = result.source || result.url || filePath;
      
      // Extract ingredients
      const ingList = result.ingredients || [];
      if (!Array.isArray(ingList)) return;
      
      ingList.forEach(ing => {
        if (!ing || typeof ing !== 'string') return;
        
        const normalized = normalizeIngredientName(ing);
        if (!normalized || normalized.length < 2) return;
        
        if (!ingredients.has(normalized)) {
          ingredients.set(normalized, {
            name: ing,
            normalized,
            sources: new Set(),
            categories: new Set(),
            species: new Set(),
            scrapedCount: 0
          });
        }
        
        const entry = ingredients.get(normalized);
        entry.sources.add(source);
        entry.categories.add(detectCategory(ing, category));
        entry.species.add(category);
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
 * Main processing function
 */
async function processScrapedData() {
  console.log('🔄 Processing scraped data...\n');
  
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
          name: data.name,
          normalized,
          sources: new Set(data.sources),
          categories: new Set(data.categories),
          species: new Set(data.species),
          scrapedCount: data.scrapedCount
        });
      } else {
        const existing = allIngredients.get(normalized);
        data.sources.forEach(s => existing.sources.add(s));
        data.categories.forEach(c => existing.categories.add(c));
        data.species.forEach(s => existing.species.add(s));
        existing.scrapedCount += data.scrapedCount;
      }
    });
  }
  
  console.log(`\n✅ Processed ${allIngredients.size} unique ingredients\n`);
  
  // Convert to global ingredients format
  const globalIngredients = {};
  
  allIngredients.forEach((data, normalized) => {
    const primaryCategory = Array.from(data.categories)[0] || 'other';
    const confidenceLevel = 
      data.scrapedCount > 5 ? 'high' :
      data.scrapedCount > 2 ? 'medium' : 'low';
    
    globalIngredients[normalized] = {
      id: normalized,
      displayName: data.name,
      category: primaryCategory,
      commonNames: [data.name],
      confidenceLevel,
      lastScraped: new Date().toISOString(),
      sources: Array.from(data.sources).slice(0, 10), // Limit to 10 sources
      scrapedCount: data.scrapedCount
    };
  });
  
  // Save to global ingredients file
  const outputPath = path.join(__dirname, '../lib/data/globalIngredients.json');
  fs.writeFileSync(outputPath, JSON.stringify(globalIngredients, null, 2), 'utf8');
  
  // Generate summary
  const summary = {
    totalIngredients: Object.keys(globalIngredients).length,
    byCategory: {},
    byConfidence: {},
    bySpecies: {}
  };
  
  Object.values(globalIngredients).forEach(ing => {
    summary.byCategory[ing.category] = (summary.byCategory[ing.category] || 0) + 1;
    summary.byConfidence[ing.confidenceLevel] = (summary.byConfidence[ing.confidenceLevel] || 0) + 1;
  });
  
  console.log('📊 Summary:');
  console.log(`  Total ingredients: ${summary.totalIngredients}`);
  console.log(`  By category:`, summary.byCategory);
  console.log(`  By confidence:`, summary.byConfidence);
  console.log(`\n📁 Saved to: ${outputPath}`);
  
  return globalIngredients;
}

// Run if called directly
if (require.main === module) {
  processScrapedData()
    .then(() => {
      console.log('\n✅ Processing complete!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Error:', error);
      process.exit(1);
    });
}

module.exports = { processScrapedData, normalizeIngredientName, detectCategory };

