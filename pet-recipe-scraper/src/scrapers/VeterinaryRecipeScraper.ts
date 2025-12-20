/**
 * VETERINARY RECIPE SCRAPER
 * Scrapes vet-approved recipes from Tufts, BalanceIT, PetDiets, etc.
 */

import { BaseRecipeScraper } from './BaseRecipeScraper';
import { ScrapedRecipe, ScraperResult, RecipeIngredient } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class VeterinaryRecipeScraper extends BaseRecipeScraper {
  async scrape(): Promise<ScraperResult> {
    const startTime = Date.now();
    const recipes: ScrapedRecipe[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      this.log('info', `Starting scrape of ${this.source.name}`);

      // Fetch main page
      const $ = await this.fetchPage(this.source.baseUrl);
      if (!$) {
        throw new Error('Failed to load main page');
      }

      // Find recipe links
      const recipeLinks = this.extractRecipeLinks($);
      this.log('info', `Found ${recipeLinks.length} potential recipe pages`);

      // Scrape each recipe
      for (const link of recipeLinks.slice(0, 20)) { // Limit to 20 for testing
        await this.delay();
        
        try {
          const recipe = await this.scrapeRecipePage(link);
          if (recipe) {
            const validation = this.validateRecipe(recipe);
            
            if (validation.valid) {
              recipes.push(recipe);
              this.log('info', `✓ Scraped: ${recipe.name}`);
            } else {
              warnings.push(`Recipe "${recipe.name}" failed validation`);
              warnings.push(...validation.warnings);
            }
          }
        } catch (error) {
          errors.push(`Failed to scrape ${link}: ${error}`);
        }
      }

    } catch (error) {
      errors.push(`Scraper failed: ${error}`);
    } finally {
      await this.close();
    }

    const duration = Date.now() - startTime;

    return {
      success: errors.length === 0,
      recipesScraped: recipes.length,
      ingredientsSafety: 0,
      errors,
      warnings,
      duration,
      source: this.source.name,
    };
  }

  /**
   * Extract recipe links from main page
   */
  private extractRecipeLinks($: any): string[] {
    const links: string[] = [];
    const selector = this.source.selectors.recipeList || 'article, .recipe';

    $(selector).each((_: any, elem: any) => {
      const $elem = $(elem);
      const href = $elem.find('a').attr('href') || $elem.attr('href');
      
      if (href) {
        const fullUrl = new URL(href, this.source.baseUrl).href;
        if (this.isRecipeUrl(fullUrl)) {
          links.push(fullUrl);
        }
      }
    });

    return [...new Set(links)]; // Remove duplicates
  }

  /**
   * Check if URL looks like a recipe page
   */
  private isRecipeUrl(url: string): boolean {
    const recipeKeywords = ['recipe', 'diet', 'meal', 'food', 'nutrition', 'feeding'];
    const urlLower = url.toLowerCase();
    return recipeKeywords.some(keyword => urlLower.includes(keyword));
  }

  /**
   * Scrape individual recipe page
   */
  private async scrapeRecipePage(url: string): Promise<ScrapedRecipe | null> {
    const $ = await this.fetchPage(url);
    if (!$) return null;

    try {
      // Extract title
      const titleSelector = this.source.selectors.recipeTitle || 'h1, h2';
      const title = $(titleSelector).first().text().trim();
      if (!title) return null;

      // Extract ingredients
      const ingredients = this.extractIngredients($);
      if (ingredients.length === 0) return null;

      // Extract instructions
      const instructions = this.extractInstructions($);

      // Extract warnings
      const recipeWarnings = this.extractWarnings($);

      // Detect species from content
      const species = this.detectSpecies($, title);

      const recipe: ScrapedRecipe = {
        id: uuidv4(),
        name: title,
        species,
        ingredients,
        instructions: instructions.length > 0 ? instructions : undefined,
        warnings: recipeWarnings.length > 0 ? recipeWarnings : undefined,
        sourceUrl: url,
        sourceName: this.source.name,
        sourceTier: this.source.tier,
        scrapedAt: new Date(),
        vetApproved: this.source.tier === 'veterinary',
      };

      return recipe;
    } catch (error) {
      this.log('error', `Failed to parse recipe at ${url}: ${error}`);
      return null;
    }
  }

  /**
   * Extract ingredients from page
   */
  private extractIngredients($: any): RecipeIngredient[] {
    const ingredients: RecipeIngredient[] = [];
    const selector = this.source.selectors.ingredients || '.ingredients li, ul li';

    $(selector).each((_: any, elem: any) => {
      const text = $(elem).text().trim();
      if (!text || text.length < 2) return;

      const parsed = this.parseIngredientAmount(text);
      ingredients.push({
        name: parsed.name,
        amount: parsed.amount,
        unit: parsed.unit,
      });
    });

    return ingredients;
  }

  /**
   * Extract instructions from page
   */
  private extractInstructions($: any): string[] {
    const instructions: string[] = [];
    const selector = this.source.selectors.instructions || '.instructions li, ol li';

    $(selector).each((_: any, elem: any) => {
      const text = $(elem).text().trim();
      if (text && text.length > 5) {
        instructions.push(text);
      }
    });

    return instructions;
  }

  /**
   * Extract warnings from page
   */
  private extractWarnings($: any): string[] {
    const warnings: string[] = [];
    const selector = this.source.selectors.warnings || '.warning, .caution, .alert';

    $(selector).each((_: any, elem: any) => {
      const text = $(elem).text().trim();
      if (text) {
        warnings.push(text);
      }
    });

    return warnings;
  }

  /**
   * Detect species from page content
   */
  private detectSpecies($: any, title: string): any[] {
    const content = $('body').text().toLowerCase();
    const titleLower = title.toLowerCase();
    const detected: Set<string> = new Set();

    const speciesKeywords = {
      dogs: ['dog', 'canine', 'puppy'],
      cats: ['cat', 'feline', 'kitten'],
      birds: ['bird', 'parrot', 'avian', 'cockatiel', 'parakeet'],
      reptiles: ['reptile', 'lizard', 'turtle', 'tortoise', 'snake', 'iguana', 'bearded dragon'],
      'pocket-pets': ['rabbit', 'guinea pig', 'hamster', 'rat', 'mouse', 'chinchilla', 'gerbil'],
    };

    for (const [species, keywords] of Object.entries(speciesKeywords)) {
      if (keywords.some(kw => titleLower.includes(kw) || content.includes(kw))) {
        detected.add(species);
      }
    }

    // Default to dogs/cats if nothing detected
    if (detected.size === 0) {
      if (this.source.species.includes('dogs')) detected.add('dogs');
      if (this.source.species.includes('cats')) detected.add('cats');
    }

    return Array.from(detected);
  }
}
