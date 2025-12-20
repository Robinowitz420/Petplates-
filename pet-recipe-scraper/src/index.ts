/**
 * PET RECIPE SCRAPER - MAIN RUNNER
 * Orchestrates all scrapers and outputs results
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import { VeterinaryRecipeScraper } from './scrapers/VeterinaryRecipeScraper';
import { ReptileScraper } from './scrapers/ReptileScraper';
import { BlogRecipeDiscoveryScraper } from './scrapers/BlogRecipeDiscoveryScraper';
import { RedditRecipeScraper } from './scrapers/RedditRecipeScraper';
import { NutrientTableScraper } from './scrapers/NutrientTableScraper';
import { BulkUrlScraper } from './scrapers/BulkUrlScraper';
import { SCRAPER_SOURCES } from './config/sources';
import { REDDIT_SUBREDDITS, getSubredditsBySpecies } from './config/reddit-sources';
import { BULK_RECIPE_URLS } from './config/bulk-recipe-urls';
import { NEW_RECIPE_URLS } from './config/new-recipe-urls';
import { FOREIGN_RECIPE_URLS } from './config/foreign-recipe-urls';
import { LATEST_RECIPE_URLS } from './config/latest-recipe-urls';
import { ScraperResult, ScrapedRecipe, Species } from './types';

interface RunnerOptions {
  species?: string[];
  tiers?: string[];
  sources?: string[];
  outputDir?: string;
  maxConcurrent?: number;
  mode?: 'standard' | 'blogs' | 'reddit' | 'nutrients' | 'bulk' | 'new' | 'foreign' | 'latest';
}

class RecipeScraperRunner {
  private options: Required<RunnerOptions>;
  private allRecipes: ScrapedRecipe[] = [];
  private allResults: ScraperResult[] = [];

  constructor(options: RunnerOptions = {}) {
    this.options = {
      species: options.species || ['cats', 'dogs', 'reptiles', 'birds', 'pocket-pets'],
      tiers: options.tiers || ['veterinary', 'academic', 'brand'],
      sources: options.sources || [],
      outputDir: options.outputDir || './output',
      maxConcurrent: options.maxConcurrent || 3,
      mode: options.mode || 'standard',
    };
  }

  async run(): Promise<void> {
    console.log('🐾 PET RECIPE SCRAPER STARTING');
    console.log('================================\n');

    await fs.ensureDir(this.options.outputDir);

    // Blog discovery mode
    if (this.options.mode === 'blogs') {
      await this.runBlogDiscovery();
      return;
    }

    // Reddit mode
    if (this.options.mode === 'reddit') {
      await this.runRedditScraping();
      return;
    }

    // Nutrient table mode
    if (this.options.mode === 'nutrients') {
      await this.runNutrientScraping();
      return;
    }

    // Bulk URL mode
    if (this.options.mode === 'bulk') {
      await this.runBulkUrlScraping();
      return;
    }

    // New URLs only mode
    if (this.options.mode === 'new') {
      await this.runNewUrlScraping();
      return;
    }

    // Foreign language URLs mode
    if (this.options.mode === 'foreign') {
      await this.runForeignUrlScraping();
      return;
    }

    // Latest URLs mode
    if (this.options.mode === 'latest') {
      await this.runLatestUrlScraping();
      return;
    }

    // Get sources to scrape
    const sources = this.selectSources();
    console.log(`📋 Selected ${sources.length} sources to scrape\n`);

    // Run scrapers
    for (const source of sources) {
      try {
        console.log(`\n🔍 Scraping: ${source.name}`);
        console.log(`   Tier: ${source.tier} | Species: ${source.species.join(', ')}`);
        
        const scraper = this.createScraper(source);
        const result = await scraper.scrape();
        
        this.allResults.push(result);
        
        if (result.success) {
          console.log(`   ✅ Success: ${result.recipesScraped} recipes, ${result.ingredientsSafety} safety entries`);
        } else {
          console.log(`   ❌ Failed: ${result.errors.length} errors`);
        }

        if (result.warnings.length > 0) {
          console.log(`   ⚠️  ${result.warnings.length} warnings`);
        }

      } catch (error) {
        console.error(`   ❌ Error: ${error}`);
      }

      // Rate limiting between sources
      await this.delay(2000);
    }

    // Save results
    await this.saveResults();
    
    // Print summary
    this.printSummary();
  }

  private selectSources() {
    let sources = SCRAPER_SOURCES.filter(s => s.active);

    // Filter by specific source IDs if provided
    if (this.options.sources.length > 0) {
      sources = sources.filter(s => this.options.sources.includes(s.id));
    }

    // Filter by species
    if (this.options.species.length > 0) {
      sources = sources.filter(s => 
        s.species.some(sp => this.options.species.includes(sp))
      );
    }

    // Filter by tier
    if (this.options.tiers.length > 0) {
      sources = sources.filter(s => this.options.tiers.includes(s.tier));
    }

    return sources;
  }

  private createScraper(source: any) {
    // Determine scraper type based on source
    if (source.species.includes('reptiles') && 
        ['tortoise-table', 'reptifiles', 'moon-valley-reptiles'].includes(source.id)) {
      return new ReptileScraper(source);
    }

    // Default to veterinary scraper
    return new VeterinaryRecipeScraper(source);
  }

  private async saveResults(): Promise<void> {
    const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
    
    // Save recipes
    const recipesFile = path.join(this.options.outputDir, `recipes-${timestamp}.json`);
    await fs.writeJson(recipesFile, this.allRecipes, { spaces: 2 });
    console.log(`\n💾 Saved recipes to: ${recipesFile}`);

    // Save results summary
    const resultsFile = path.join(this.options.outputDir, `results-${timestamp}.json`);
    await fs.writeJson(resultsFile, this.allResults, { spaces: 2 });
    console.log(`💾 Saved results to: ${resultsFile}`);

    // Save by species
    const bySpecies = this.groupBySpecies();
    for (const [species, recipes] of Object.entries(bySpecies)) {
      const speciesFile = path.join(this.options.outputDir, `${species}-${timestamp}.json`);
      await fs.writeJson(speciesFile, recipes, { spaces: 2 });
    }
  }

  private groupBySpecies(): Record<string, ScrapedRecipe[]> {
    const grouped: Record<string, ScrapedRecipe[]> = {};

    for (const recipe of this.allRecipes) {
      for (const species of recipe.species) {
        if (!grouped[species]) {
          grouped[species] = [];
        }
        grouped[species].push(recipe);
      }
    }

    return grouped;
  }

  private printSummary(): void {
    console.log('\n\n================================');
    console.log('📊 SCRAPING SUMMARY');
    console.log('================================\n');

    const totalRecipes = this.allResults.reduce((sum, r) => sum + r.recipesScraped, 0);
    const totalSafety = this.allResults.reduce((sum, r) => sum + r.ingredientsSafety, 0);
    const totalErrors = this.allResults.reduce((sum, r) => sum + r.errors.length, 0);
    const totalWarnings = this.allResults.reduce((sum, r) => sum + r.warnings.length, 0);
    const successCount = this.allResults.filter(r => r.success).length;

    console.log(`✅ Successful sources: ${successCount}/${this.allResults.length}`);
    console.log(`📝 Total recipes: ${totalRecipes}`);
    console.log(`🛡️  Safety entries: ${totalSafety}`);
    console.log(`⚠️  Warnings: ${totalWarnings}`);
    console.log(`❌ Errors: ${totalErrors}`);

    // By species
    const bySpecies = this.groupBySpecies();
    console.log('\n📋 By Species:');
    for (const [species, recipes] of Object.entries(bySpecies)) {
      console.log(`   ${species}: ${recipes.length} recipes`);
    }

    // By tier
    const byTier: Record<string, number> = {};
    for (const result of this.allResults) {
      const source = SCRAPER_SOURCES.find(s => s.name === result.source);
      if (source) {
        byTier[source.tier] = (byTier[source.tier] || 0) + result.recipesScraped;
      }
    }
    console.log('\n🏆 By Source Tier:');
    for (const [tier, count] of Object.entries(byTier)) {
      console.log(`   ${tier}: ${count} recipes`);
    }

    console.log('\n✨ Scraping complete!\n');
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async runBlogDiscovery(): Promise<void> {
    console.log('🔍 BLOG DISCOVERY MODE\n');
    
    // Select blog-friendly sources
    const blogSources = this.selectSources().filter(s => 
      ['veterinary', 'academic', 'brand', 'community'].includes(s.tier)
    );

    console.log(`📋 Selected ${blogSources.length} blog sources\n`);

    const scraper = new BlogRecipeDiscoveryScraper(blogSources, 500, 20000);
    const recipes = await scraper.run();

    this.allRecipes = recipes;

    // Save results
    await this.saveBlogResults(recipes);
    
    // Print summary
    this.printBlogSummary(recipes);
  }

  private async saveBlogResults(recipes: ScrapedRecipe[]): Promise<void> {
    const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
    
    const recipesFile = path.join(this.options.outputDir, `blog-recipes-${timestamp}.json`);
    await fs.writeJson(recipesFile, recipes, { spaces: 2 });
    console.log(`\n💾 Saved blog recipes to: ${recipesFile}`);

    // Save by species
    const bySpecies = this.groupBySpecies();
    for (const [species, speciesRecipes] of Object.entries(bySpecies)) {
      const speciesFile = path.join(this.options.outputDir, `blog-${species}-${timestamp}.json`);
      await fs.writeJson(speciesFile, speciesRecipes, { spaces: 2 });
    }
  }

  private printBlogSummary(recipes: ScrapedRecipe[]): void {
    console.log('\n\n================================');
    console.log('📊 BLOG DISCOVERY SUMMARY');
    console.log('================================\n');

    console.log(`📝 Total recipes discovered: ${recipes.length}`);

    const bySpecies: Record<string, number> = {};
    for (const recipe of recipes) {
      for (const species of recipe.species) {
        bySpecies[species] = (bySpecies[species] || 0) + 1;
      }
    }

    console.log('\n📋 By Species:');
    for (const [species, count] of Object.entries(bySpecies)) {
      console.log(`   ${species}: ${count} recipes`);
    }

    const withJsonLd = recipes.filter(r => r.tags?.includes('json-ld')).length;
    const heuristic = recipes.filter(r => r.tags?.includes('heuristic')).length;

    console.log('\n🔬 Extraction Method:');
    console.log(`   JSON-LD (structured): ${withJsonLd}`);
    console.log(`   Heuristic (parsed): ${heuristic}`);

    console.log('\n✨ Blog discovery complete!\n');
  }

  private async runRedditScraping(): Promise<void> {
    console.log('🔍 REDDIT SCRAPING MODE\n');
    
    // Select subreddits based on species filter
    let subreddits = REDDIT_SUBREDDITS;
    if (this.options.species.length > 0) {
      subreddits = subreddits.filter(sub => 
        sub.species.some(sp => this.options.species.includes(sp))
      );
    }

    console.log(`📋 Selected ${subreddits.length} subreddits\n`);

    const scraper = new RedditRecipeScraper(subreddits);
    const recipes = await scraper.scrape();

    this.allRecipes = recipes;

    // Save results
    await this.saveRedditResults(recipes);
    
    // Print summary
    this.printRedditSummary(recipes);
  }

  private async saveRedditResults(recipes: ScrapedRecipe[]): Promise<void> {
    const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
    
    const recipesFile = path.join(this.options.outputDir, `reddit-recipes-${timestamp}.json`);
    await fs.writeJson(recipesFile, recipes, { spaces: 2 });
    console.log(`\n💾 Saved Reddit recipes to: ${recipesFile}`);

    // Save by species
    const bySpecies = this.groupBySpecies();
    for (const [species, speciesRecipes] of Object.entries(bySpecies)) {
      const speciesFile = path.join(this.options.outputDir, `reddit-${species}-${timestamp}.json`);
      await fs.writeJson(speciesFile, speciesRecipes, { spaces: 2 });
    }
  }

  private printRedditSummary(recipes: ScrapedRecipe[]): void {
    console.log('\n\n================================');
    console.log('📊 REDDIT SCRAPING SUMMARY');
    console.log('================================\n');

    console.log(`📝 Total recipes discovered: ${recipes.length}`);

    const bySpecies: Record<string, number> = {};
    for (const recipe of recipes) {
      for (const species of recipe.species) {
        bySpecies[species] = (bySpecies[species] || 0) + 1;
      }
    }

    console.log('\n📋 By Species:');
    for (const [species, count] of Object.entries(bySpecies)) {
      console.log(`   ${species}: ${count} recipes`);
    }

    const bySubreddit: Record<string, number> = {};
    for (const recipe of recipes) {
      const subreddit = recipe.tags?.find(t => t !== 'reddit' && t !== 'community') || 'unknown';
      bySubreddit[subreddit] = (bySubreddit[subreddit] || 0) + 1;
    }

    console.log('\n📋 By Subreddit:');
    const sorted = Object.entries(bySubreddit).sort((a, b) => b[1] - a[1]);
    for (const [subreddit, count] of sorted.slice(0, 10)) {
      console.log(`   r/${subreddit}: ${count} recipes`);
    }

    console.log('\n✨ Reddit scraping complete!\n');
  }

  private async runNutrientScraping(): Promise<void> {
    console.log('🔍 NUTRIENT TABLE SCRAPING MODE\n');
    
    const scraper = new NutrientTableScraper();
    const allRecipes: ScrapedRecipe[] = [];

    // Scrape specialized nutrient sources
    const nutrientSources = [
      {
        name: 'Tortoise Table',
        urls: [
          'https://www.thetortoisetable.org.uk/plant-database/viewplants/a-z/'
        ],
        method: (url: string) => scraper.scrapeTortoiseTable(url),
      },
      {
        name: 'Guinea Lynx',
        urls: [
          'https://www.guinealynx.info/diet_veggie.html'
        ],
        method: (url: string) => scraper.scrapeGuineaLynxChart(url),
      },
      {
        name: 'ReptiFiles',
        urls: [
          'https://reptifiles.com/bearded-dragon-care/bearded-dragon-diet-nutrition/',
          'https://reptifiles.com/blue-tongue-skink-care/blue-tongue-skink-diet-nutrition/'
        ],
        method: (url: string) => scraper.scrapeReptiFilesGuide(url),
      },
    ];

    for (const source of nutrientSources) {
      console.log(`\n📊 Scraping ${source.name}...`);
      
      for (const url of source.urls) {
        try {
          const recipes = await source.method(url);
          allRecipes.push(...recipes);
          await this.delay(2000); // Rate limiting
        } catch (error) {
          console.error(`   ❌ Error scraping ${url}: ${error}`);
        }
      }
    }

    this.allRecipes = allRecipes;

    // Save results
    await this.saveNutrientResults(allRecipes);
    
    // Print summary
    this.printNutrientSummary(allRecipes);
  }

  private async saveNutrientResults(recipes: ScrapedRecipe[]): Promise<void> {
    const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
    
    const recipesFile = path.join(this.options.outputDir, `nutrient-data-${timestamp}.json`);
    await fs.writeJson(recipesFile, recipes, { spaces: 2 });
    console.log(`\n💾 Saved nutrient data to: ${recipesFile}`);

    // Save by species
    const bySpecies = this.groupBySpecies();
    for (const [species, speciesRecipes] of Object.entries(bySpecies)) {
      const speciesFile = path.join(this.options.outputDir, `nutrient-${species}-${timestamp}.json`);
      await fs.writeJson(speciesFile, speciesRecipes, { spaces: 2 });
    }
  }

  private printNutrientSummary(recipes: ScrapedRecipe[]): void {
    console.log('\n\n================================');
    console.log('📊 NUTRIENT DATA SUMMARY');
    console.log('================================\n');

    console.log(`📝 Total nutrient entries: ${recipes.length}`);

    const bySpecies: Record<string, number> = {};
    for (const recipe of recipes) {
      for (const species of recipe.species) {
        bySpecies[species] = (bySpecies[species] || 0) + 1;
      }
    }

    console.log('\n📋 By Species:');
    for (const [species, count] of Object.entries(bySpecies)) {
      console.log(`   ${species}: ${count} entries`);
    }

    const bySource: Record<string, number> = {};
    for (const recipe of recipes) {
      bySource[recipe.sourceName] = (bySource[recipe.sourceName] || 0) + 1;
    }

    console.log('\n📋 By Source:');
    for (const [source, count] of Object.entries(bySource)) {
      console.log(`   ${source}: ${count} entries`);
    }

    const safetyData = recipes.filter(r => r.tags?.includes('safety-list')).length;
    const nutrientData = recipes.filter(r => r.tags?.includes('nutrient-data')).length;
    const caPRatio = recipes.filter(r => r.tags?.includes('ca-p-ratio')).length;

    console.log('\n📊 Data Types:');
    console.log(`   Safety lists: ${safetyData}`);
    console.log(`   Nutrient data: ${nutrientData}`);
    console.log(`   Ca:P ratios: ${caPRatio}`);

    console.log('\n✨ Nutrient scraping complete!\n');
  }

  private async runBulkUrlScraping(): Promise<void> {
    console.log('🔍 BULK URL SCRAPING MODE\n');
    
    const scraper = new BulkUrlScraper();
    const allRecipes: ScrapedRecipe[] = [];

    // Scrape each species group
    for (const source of BULK_RECIPE_URLS) {
      console.log(`\n📋 Scraping ${source.species.join(', ')} recipes (${source.urls.length} URLs)...`);
      
      const recipes = await scraper.scrapeUrls(source.urls, source.species as Species[]);
      allRecipes.push(...recipes);
      
      console.log(`   ✅ Scraped ${recipes.length}/${source.urls.length} recipes for ${source.species.join(', ')}`);
    }

    // Save results
    await this.saveBulkResults(allRecipes);
    this.printBulkSummary(allRecipes);

    console.log('\n✨ Bulk URL scraping complete!\n');
  }

  private async saveBulkResults(recipes: ScrapedRecipe[]): Promise<void> {
    const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
    const filename = `bulk-recipes-${timestamp}.json`;
    const filepath = path.join(this.options.outputDir, filename);

    await fs.writeJson(filepath, recipes, { spaces: 2 });
    console.log(`\n💾 Saved ${recipes.length} recipes to: ${filename}`);
  }

  private printBulkSummary(recipes: ScrapedRecipe[]): void {
    console.log('\n📊 BULK SCRAPING SUMMARY');
    console.log('========================\n');

    // By species
    const bySpecies: Record<string, number> = {};
    for (const recipe of recipes) {
      for (const species of recipe.species) {
        bySpecies[species] = (bySpecies[species] || 0) + 1;
      }
    }

    console.log('📈 Recipes by Species:');
    for (const [species, count] of Object.entries(bySpecies).sort((a, b) => b[1] - a[1])) {
      console.log(`   ${species}: ${count} recipes`);
    }

    // By domain
    const byDomain: Record<string, number> = {};
    for (const recipe of recipes) {
      const domain = new URL(recipe.sourceUrl).hostname;
      byDomain[domain] = (byDomain[domain] || 0) + 1;
    }

    console.log('\n📈 Top Recipe Sources:');
    const sorted = Object.entries(byDomain).sort((a, b) => b[1] - a[1]);
    for (const [domain, count] of sorted.slice(0, 10)) {
      console.log(`   ${domain}: ${count} recipes`);
    }

    // Ingredient stats
    const totalIngredients = recipes.reduce((sum, r) => sum + r.ingredients.length, 0);
    const avgIngredients = recipes.length > 0 ? (totalIngredients / recipes.length).toFixed(1) : 0;

    console.log('\n📈 Recipe Quality:');
    console.log(`   Total recipes: ${recipes.length}`);
    console.log(`   Avg ingredients per recipe: ${avgIngredients}`);
    console.log(`   Recipes with instructions: ${recipes.filter(r => r.instructions && r.instructions.length > 0).length}`);
  }

  private async runNewUrlScraping(): Promise<void> {
    console.log('🔍 NEW URL SCRAPING MODE (Filtered for measured recipes)\n');
    
    const scraper = new BulkUrlScraper();
    const allRecipes: ScrapedRecipe[] = [];

    // Scrape each species group from new URLs only
    for (const source of NEW_RECIPE_URLS) {
      console.log(`\n📋 Scraping NEW ${source.species.join(', ')} recipes (${source.urls.length} URLs)...`);
      
      const recipes = await scraper.scrapeUrls(source.urls, source.species as Species[]);
      allRecipes.push(...recipes);
      
      console.log(`   ✅ Scraped ${recipes.length}/${source.urls.length} recipes for ${source.species.join(', ')}`);
    }

    // Save results with "new-" prefix
    await this.saveNewResults(allRecipes);
    this.printBulkSummary(allRecipes);

    console.log('\n✨ New URL scraping complete!\n');
  }

  private async saveNewResults(recipes: ScrapedRecipe[]): Promise<void> {
    const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
    const filename = `new-recipes-${timestamp}.json`;
    const filepath = path.join(this.options.outputDir, filename);

    await fs.writeJson(filepath, recipes, { spaces: 2 });
    console.log(`\n💾 Saved ${recipes.length} recipes to: ${filename}`);
  }

  private async runForeignUrlScraping(): Promise<void> {
    console.log('🔍 FOREIGN LANGUAGE URL SCRAPING MODE (German, French, Spanish)\n');
    
    const scraper = new BulkUrlScraper();
    const allRecipes: ScrapedRecipe[] = [];

    // Scrape each language/species group
    for (const source of FOREIGN_RECIPE_URLS) {
      console.log(`\n📋 Scraping ${source.language.toUpperCase()} ${source.species.join(', ')} recipes (${source.urls.length} URLs)...`);
      
      const recipes = await scraper.scrapeUrls(source.urls, source.species as Species[]);
      allRecipes.push(...recipes);
      
      console.log(`   ✅ Scraped ${recipes.length}/${source.urls.length} recipes for ${source.language.toUpperCase()} ${source.species.join(', ')}`);
    }

    // Save results with "foreign-" prefix
    await this.saveForeignResults(allRecipes);
    this.printBulkSummary(allRecipes);

    console.log('\n✨ Foreign URL scraping complete!\n');
  }

  private async saveForeignResults(recipes: ScrapedRecipe[]): Promise<void> {
    const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
    const filename = `foreign-recipes-${timestamp}.json`;
    const filepath = path.join(this.options.outputDir, filename);

    await fs.writeJson(filepath, recipes, { spaces: 2 });
    console.log(`\n💾 Saved ${recipes.length} recipes to: ${filename}`);
  }

  private async runLatestUrlScraping(): Promise<void> {
    console.log('🔍 LATEST URL SCRAPING MODE (December 2025 batch)\n');
    
    const scraper = new BulkUrlScraper();
    const allRecipes: ScrapedRecipe[] = [];

    // Group URLs by species for better organization
    const urlsBySpecies = new Map<string, string[]>();
    
    for (const source of LATEST_RECIPE_URLS) {
      const speciesKey = source.species.join(',');
      if (!urlsBySpecies.has(speciesKey)) {
        urlsBySpecies.set(speciesKey, []);
      }
      urlsBySpecies.get(speciesKey)!.push(source.url);
    }

    // Scrape each species group
    for (const [speciesKey, urls] of urlsBySpecies) {
      const species = speciesKey.split(',');
      console.log(`\n📋 Scraping ${species.join(', ')} recipes (${urls.length} URLs)...`);
      
      const recipes = await scraper.scrapeUrls(urls, ['birds', 'reptiles', 'pocket-pets'] as Species[]);
      allRecipes.push(...recipes);
      
      console.log(`   ✅ Scraped ${recipes.length}/${urls.length} recipes`);
    }

    // Save results with "latest-" prefix
    await this.saveLatestResults(allRecipes);
    this.printBulkSummary(allRecipes);

    console.log('\n✨ Latest URL scraping complete!\n');
  }

  private async saveLatestResults(recipes: ScrapedRecipe[]): Promise<void> {
    const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
    const filename = `latest-recipes-${timestamp}.json`;
    const filepath = path.join(this.options.outputDir, filename);

    await fs.writeJson(filepath, recipes, { spaces: 2 });
    console.log(`\n💾 Saved ${recipes.length} recipes to: ${filename}`);
  }

}

// CLI execution
if (require.main === module) {
  const args = process.argv.slice(2);
  const options: RunnerOptions = {};

  // Parse CLI args
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--species' && args[i + 1]) {
      options.species = args[i + 1].split(',');
      i++;
    } else if (arg === '--tiers' && args[i + 1]) {
      options.tiers = args[i + 1].split(',');
      i++;
    } else if (arg === '--sources' && args[i + 1]) {
      options.sources = args[i + 1].split(',');
      i++;
    } else if (arg === '--output' && args[i + 1]) {
      options.outputDir = args[i + 1];
      i++;
    } else if (arg === '--mode' && args[i + 1]) {
      options.mode = args[i + 1] as 'standard' | 'blogs';
      i++;
    }
  }

  const runner = new RecipeScraperRunner(options);
  runner.run().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { RecipeScraperRunner };
