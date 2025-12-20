/**
 * REPTILE RECIPE SCRAPER
 * Specialized scraper for reptile feeding guides and plant safety data
 * Sources: Tortoise Table, ReptiFiles, Moon Valley Reptiles
 */

import { BaseRecipeScraper } from './BaseRecipeScraper';
import { ScrapedRecipe, ScraperResult, RecipeIngredient, IngredientSafety } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class ReptileScraper extends BaseRecipeScraper {
  private safetyData: IngredientSafety[] = [];

  async scrape(): Promise<ScraperResult> {
    const startTime = Date.now();
    const recipes: ScrapedRecipe[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      this.log('info', `Starting reptile scrape of ${this.source.name}`);

      // Special handling for Tortoise Table (plant safety database)
      if (this.source.id === 'tortoise-table') {
        await this.scrapeTortoiseTable();
      } else {
        // Standard recipe scraping
        await this.scrapeStandardRecipes(recipes, errors, warnings);
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
      ingredientsSafety: this.safetyData.length,
      errors,
      warnings,
      duration,
      source: this.source.name,
    };
  }

  /**
   * Scrape Tortoise Table plant safety database
   */
  private async scrapeTortoiseTable(): Promise<void> {
    const $ = await this.fetchPage(`${this.source.baseUrl}/plants-database.php`);
    if (!$) return;

    this.log('info', 'Scraping Tortoise Table plant database');

    $('table tr').each((_, row) => {
      const $row = $(row);
      const cells = $row.find('td');
      
      if (cells.length >= 3) {
        const plantName = $(cells[0]).text().trim();
        const scientificName = $(cells[1]).text().trim();
        const safetyClass = $(cells[2]).text().trim().toLowerCase();

        if (plantName) {
          const safety: IngredientSafety = {
            ingredient: plantName,
            scientificName: scientificName || undefined,
            safeFor: safetyClass.includes('safe') ? ['reptiles'] : [],
            toxicFor: safetyClass.includes('toxic') || safetyClass.includes('avoid') ? ['reptiles'] : [],
            cautionFor: safetyClass.includes('caution') || safetyClass.includes('sparingly') ? ['reptiles'] : [],
            notes: `Tortoise Table classification: ${safetyClass}`,
          };

          this.safetyData.push(safety);
        }
      }
    });

    this.log('info', `Extracted ${this.safetyData.length} plant safety entries`);
  }

  /**
   * Standard recipe scraping for ReptiFiles, etc.
   */
  private async scrapeStandardRecipes(
    recipes: ScrapedRecipe[],
    errors: string[],
    warnings: string[]
  ): Promise<void> {
    const $ = await this.fetchPage(this.source.baseUrl);
    if (!$) {
      throw new Error('Failed to load main page');
    }

    // Find care guide links
    const links = this.extractCareGuideLinks($);
    this.log('info', `Found ${links.length} care guide pages`);

    for (const link of links.slice(0, 15)) {
      await this.delay();
      
      try {
        const recipe = await this.scrapeCareGuidePage(link);
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
  }

  /**
   * Extract care guide links
   */
  private extractCareGuideLinks($: any): string[] {
    const links: string[] = [];
    const keywords = ['care', 'diet', 'feeding', 'food', 'nutrition'];

    $('a').each((_: any, elem: any) => {
      const href = $(elem).attr('href');
      const text = $(elem).text().toLowerCase();
      
      if (href && keywords.some(kw => text.includes(kw) || href.includes(kw))) {
        const fullUrl = new URL(href, this.source.baseUrl).href;
        links.push(fullUrl);
      }
    });

    return [...new Set(links)];
  }

  /**
   * Scrape care guide page for feeding information
   */
  private async scrapeCareGuidePage(url: string): Promise<ScrapedRecipe | null> {
    const $ = await this.fetchPage(url);
    if (!$) return null;

    try {
      const title = $('h1').first().text().trim();
      if (!title) return null;

      // Extract food lists
      const ingredients = this.extractFoodList($);
      if (ingredients.length === 0) return null;

      // Detect reptile type
      const species = this.detectReptileType($, title);

      const recipe: ScrapedRecipe = {
        id: uuidv4(),
        name: `${species} Feeding Guide - ${title}`,
        species: ['reptiles'],
        ingredients,
        sourceUrl: url,
        sourceName: this.source.name,
        sourceTier: this.source.tier,
        scrapedAt: new Date(),
        tags: [species, 'feeding-guide'],
      };

      return recipe;
    } catch (error) {
      this.log('error', `Failed to parse care guide at ${url}: ${error}`);
      return null;
    }
  }

  /**
   * Extract food list from care guide
   */
  private extractFoodList($: any): RecipeIngredient[] {
    const ingredients: RecipeIngredient[] = [];
    const foodSections = [
      'staple foods',
      'vegetables',
      'greens',
      'protein',
      'insects',
      'safe foods',
      'diet',
    ];

    // Find sections with food lists
    $('h2, h3, h4').each((_: any, heading: any) => {
      const headingText = $(heading).text().toLowerCase();
      
      if (foodSections.some(section => headingText.includes(section))) {
        // Get the list following this heading
        const list = $(heading).nextAll('ul, ol').first();
        
        list.find('li').each((_: any, item: any) => {
          const text = $(item).text().trim();
          if (text && text.length > 2) {
            const parsed = this.parseIngredientAmount(text);
            ingredients.push({
              name: parsed.name,
              notes: this.extractFrequency(text),
            });
          }
        });
      }
    });

    return ingredients;
  }

  /**
   * Extract feeding frequency from text
   */
  private extractFrequency(text: string): string | undefined {
    const frequencyKeywords = [
      'daily',
      'weekly',
      'occasionally',
      'sparingly',
      'staple',
      'treat',
      'supplement',
    ];

    const lower = text.toLowerCase();
    for (const keyword of frequencyKeywords) {
      if (lower.includes(keyword)) {
        return keyword;
      }
    }

    return undefined;
  }

  /**
   * Detect reptile type from content
   */
  private detectReptileType($: any, title: string): string {
    const content = $('body').text().toLowerCase();
    const titleLower = title.toLowerCase();

    const types = [
      'bearded dragon',
      'iguana',
      'tortoise',
      'turtle',
      'gecko',
      'chameleon',
      'snake',
      'lizard',
    ];

    for (const type of types) {
      if (titleLower.includes(type) || content.includes(type)) {
        return type;
      }
    }

    return 'reptile';
  }
}
