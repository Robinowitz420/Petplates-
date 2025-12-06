// scripts/run-scrapers.js
// Master script to run all scrapers and process results

// Import the scraper class
const PetRecipeScraper = require('../scraping/scraper');
const { buildIngredients } = require('./buildIngredients');
const fs = require('fs');
const path = require('path');

async function runAllScrapers() {
  console.log('🕷️ Starting comprehensive scraper run...\n');
  
  try {
    // Step 1: Run scrapers
    console.log('Step 1: Running web scrapers (this may take a while)...\n');
    const ScraperClass = PetRecipeScraper.default || PetRecipeScraper;
    const scraper = new ScraperClass();
    
    // Run scrapers with progress tracking
    let completed = 0;
    const totalSources = scraper.sources.length;
    
    console.log(`📊 Total sources to scrape: ${totalSources}\n`);
    
    const results = await scraper.scrapeAll();
    
    // Save consolidated results
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputPath = path.join(__dirname, '../scraping/results', `full_scrape_${timestamp}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), 'utf8');
    
    console.log(`\n✅ Scraping complete! Results saved to: ${outputPath}`);
    console.log(`📊 Total sources scraped: ${results.results?.length || 0}`);
    console.log(`📊 Successful: ${results.results?.filter(r => r.success).length || 0}`);
    console.log(`📊 Failed: ${results.results?.filter(r => !r.success).length || 0}\n`);
    
    // Step 2: Build curated ingredients from all scraped results
    console.log('Step 2: Building curated ingredients from all scraped data...\n');
    await buildIngredients();
    
    console.log('\n✅ All steps complete!');
    console.log('\n📋 Next steps:');
    console.log('1. Review lib/data/generatedIngredients.ts');
    console.log('2. The generated ingredients are now integrated into getIngredientsForSpecies()');
    console.log('3. Run scrapers again anytime to discover more ingredients');
    console.log('4. Manually curate ingredient compatibility in INGREDIENT_COMPOSITIONS.ts');
    
  } catch (error) {
    console.error('\n❌ Error during scraping:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  runAllScrapers()
    .then(() => {
      process.exit(0);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { runAllScrapers };

