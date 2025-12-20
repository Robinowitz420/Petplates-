/**
 * BULK URL SCRAPER
 * Scrapes recipes from a predefined list of URLs
 * Uses JSON-LD extraction with heuristic fallback
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import { v4 as uuidv4 } from 'uuid';
import type { ScrapedRecipe, RecipeIngredient, Species } from '../types';
import { 
  hasSpeciesContext, 
  hasMeasurements, 
  hasRatioPattern, 
  extractMeasuredItems, 
  extractRatioIngredients 
} from './BulkUrlScraper.helpers';

export class BulkUrlScraper {
  constructor(
    private timeoutMs = 20000,
    private userAgent = 'PetPlates-RecipeBot/1.0 (Educational Research)'
  ) {}

  async scrapeUrls(urls: string[], species: Species[]): Promise<ScrapedRecipe[]> {
    const recipes: ScrapedRecipe[] = [];
    
    console.log(`\n🔍 Scraping ${urls.length} recipe URLs...`);
    
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      console.log(`   [${i + 1}/${urls.length}] ${url}`);
      
      try {
        const recipe = await this.scrapeRecipePage(url, species);
        if (recipe) {
          recipes.push(recipe);
          console.log(`   ✓ ${recipe.name}`);
        } else {
          console.log(`   ✗ No recipe found`);
        }
      } catch (error: any) {
        console.log(`   ✗ Error: ${error.message}`);
      }
      
      // Rate limit: 1 second between requests
      await this.sleep(1000);
    }
    
    console.log(`\n✅ Scraped ${recipes.length}/${urls.length} recipes`);
    return recipes;
  }

  private async scrapeRecipePage(url: string, species: Species[]): Promise<ScrapedRecipe | null> {
    try {
      const response = await axios.get(url, {
        timeout: this.timeoutMs,
        headers: { 'User-Agent': this.userAgent },
      });

      const $ = cheerio.load(response.data);
      
      // Try JSON-LD first (best quality)
      const jsonLdRecipe = this.extractJsonLdRecipe($);
      if (jsonLdRecipe) {
        return this.convertJsonLdToScrapedRecipe(jsonLdRecipe, url, species);
      }

      // Fallback to heuristic extraction
      return this.heuristicExtraction($, url, species);
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  private extractJsonLdRecipe($: cheerio.CheerioAPI): any {
    const scripts = $('script[type="application/ld+json"]');
    
    for (let i = 0; i < scripts.length; i++) {
      try {
        const json = JSON.parse($(scripts[i]).html() || '{}');
        
        // Handle @graph wrapper
        if (json['@graph']) {
          const recipe = json['@graph'].find((item: any) => item['@type'] === 'Recipe');
          if (recipe) return recipe;
        }
        
        // Direct Recipe object
        if (json['@type'] === 'Recipe') {
          return json;
        }
      } catch (e) {
        continue;
      }
    }
    
    return null;
  }

  private convertJsonLdToScrapedRecipe(
    jsonLd: any,
    url: string,
    species: Species[]
  ): ScrapedRecipe {
    const ingredients: RecipeIngredient[] = [];
    
    if (Array.isArray(jsonLd.recipeIngredient)) {
      for (const ing of jsonLd.recipeIngredient) {
        const parsed = this.parseIngredient(ing);
        ingredients.push(parsed);
      }
    }

    const instructions: string[] = [];
    if (Array.isArray(jsonLd.recipeInstructions)) {
      for (const step of jsonLd.recipeInstructions) {
        if (typeof step === 'string') {
          instructions.push(step);
        } else if (step.text) {
          instructions.push(step.text);
        }
      }
    } else if (typeof jsonLd.recipeInstructions === 'string') {
      instructions.push(jsonLd.recipeInstructions);
    }

    return {
      id: uuidv4(),
      name: jsonLd.name || 'Untitled Recipe',
      species: species,
      ingredients,
      instructions: instructions.length > 0 ? instructions : undefined,
      sourceUrl: url,
      sourceName: new URL(url).hostname,
      sourceTier: 'community',
      scrapedAt: new Date(),
      tags: this.extractTags(jsonLd),
    };
  }

  private heuristicExtraction(
    $: cheerio.CheerioAPI,
    url: string,
    species: Species[]
  ): ScrapedRecipe | null {
    // Try to find recipe title
    const title = 
      $('h1').first().text().trim() ||
      $('title').text().trim() ||
      'Untitled Recipe';

    // Get full page text for pattern detection
    const pageText = $('body').text().toLowerCase();

    // Species confirmation gate: reject if species not mentioned
    if (!hasSpeciesContext(pageText, species)) {
      return null;
    }

    // Try to find ingredients (multiple strategies)
    const ingredients: RecipeIngredient[] = [];
    
    // Strategy 1: Structured ingredient lists
    const ingredientSelectors = [
      '.ingredients li',
      '.ingredient-list li',
      '[class*="ingredient"] li',
      'ul li',
    ];

    for (const selector of ingredientSelectors) {
      const items = $(selector);
      if (items.length > 3) {
        items.each((_, el) => {
          const text = $(el).text().trim();
          if (text && text.length > 2) {
            ingredients.push(this.parseIngredient(text));
          }
        });
        break;
      }
    }

    // Strategy 2: Detect measured lists in paragraphs (for chop/mix formulas)
    if (ingredients.length < 3) {
      const measuredItems = extractMeasuredItems($);
      ingredients.push(...measuredItems);
    }

    // Quality checks for valid recipes
    // For exotic pets, accept if we have measured items OR ratio patterns
    const hasMeasurementsFound = hasMeasurements(pageText);
    const hasRatioPatternFound = hasRatioPattern(pageText);
    
    if (ingredients.length < 2 && !hasMeasurementsFound && !hasRatioPatternFound) {
      return null;
    }
    
    // If we found ratio patterns but few ingredients, try to extract from text
    if (ingredients.length < 3 && hasRatioPatternFound) {
      const ratioIngredients = extractRatioIngredients($);
      ingredients.push(...ratioIngredients);
    }

    // Reject if too many "ingredients" (likely scraped navigation/page content)
    if (ingredients.length > 50) {
      return null;
    }

    // Check if ingredients look like real food items (not navigation text)
    const navigationKeywords = ['policy', 'privacy', 'terms', 'contact', 'about', 'home', 'menu', 'search', 'login', 'sign', 'account', 'cart', 'shop', 'blog', 'forum', 'guide', 'resources', 'links', 'gallery', 'videos'];
    const navigationCount = ingredients.filter(ing => {
      const lower = ing.name.toLowerCase();
      return navigationKeywords.some(keyword => lower.includes(keyword));
    }).length;

    // If more than 30% are navigation-like, reject
    if (navigationCount / ingredients.length > 0.3) {
      return null;
    }

    // Check average ingredient name length (real ingredients are usually 2-4 words)
    const avgWordCount = ingredients.reduce((sum, ing) => {
      return sum + ing.name.split(' ').length;
    }, 0) / ingredients.length;

    // If average is > 6 words, likely scraped sentences/paragraphs
    if (avgWordCount > 6) {
      return null;
    }

    // Try to find instructions
    const instructions: string[] = [];
    const instructionSelectors = [
      '.instructions li',
      '.directions li',
      '[class*="instruction"] li',
      'ol li',
    ];

    for (const selector of instructionSelectors) {
      const items = $(selector);
      if (items.length > 0) {
        items.each((_, el) => {
          const text = $(el).text().trim();
          if (text && text.length > 10) {
            instructions.push(text);
          }
        });
        break;
      }
    }

    return {
      id: uuidv4(),
      name: title,
      species: species,
      ingredients,
      instructions: instructions.length > 0 ? instructions : undefined,
      sourceUrl: url,
      sourceName: new URL(url).hostname,
      sourceTier: 'community',
      scrapedAt: new Date(),
    };
  }

  private parseIngredient(text: string): RecipeIngredient {
    // Simple parsing: extract amount, unit, and name
    const match = text.match(/^([\d\/\.\s]+)?\s*([a-zA-Z]+)?\s*(.+)$/);
    
    if (match) {
      return {
        name: match[3]?.trim() || text,
        amount: match[1]?.trim(),
        unit: match[2]?.trim(),
      };
    }

    return { name: text };
  }

  private extractTags(jsonLd: any): string[] {
    const tags: string[] = [];
    
    if (jsonLd.keywords) {
      if (typeof jsonLd.keywords === 'string') {
        tags.push(...jsonLd.keywords.split(',').map((k: string) => k.trim()));
      } else if (Array.isArray(jsonLd.keywords)) {
        tags.push(...jsonLd.keywords);
      }
    }

    if (jsonLd.recipeCategory) {
      tags.push(jsonLd.recipeCategory);
    }

    if (jsonLd.recipeCuisine) {
      tags.push(jsonLd.recipeCuisine);
    }

    return tags;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
