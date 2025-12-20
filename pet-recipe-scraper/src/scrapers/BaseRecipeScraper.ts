/**
 * BASE RECIPE SCRAPER
 * Foundation class for all pet recipe scrapers with rate limiting, safety, and normalization
 */

import puppeteer, { Browser, Page } from 'puppeteer';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { ScraperOptions, ScraperResult, ScrapedRecipe, ScraperSource } from '../types';
import { validateRecipeIngredients } from '../config/safety-database';

export abstract class BaseRecipeScraper {
  protected browser?: Browser;
  protected page?: Page;
  protected options: Required<ScraperOptions>;
  protected source: ScraperSource;
  protected robotsTxt?: any;

  constructor(source: ScraperSource, options: ScraperOptions = {}) {
    this.source = source;
    this.options = {
      headless: options.headless ?? true,
      timeout: options.timeout ?? 30000,
      userAgent: options.userAgent ?? 'PetRecipeBot/1.0 (Educational Research)',
      maxRetries: options.maxRetries ?? 3,
      respectRobotsTxt: options.respectRobotsTxt ?? true,
      outputDir: options.outputDir ?? './scraped-data',
      logLevel: options.logLevel ?? 'info',
    };
  }

  /**
   * Initialize browser for JavaScript-heavy sites
   */
  protected async initBrowser(): Promise<void> {
    if (this.browser) return;

    this.browser = await puppeteer.launch({
      headless: this.options.headless,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    this.page = await this.browser.newPage();
    await this.page.setUserAgent(this.options.userAgent);
    await this.page.setViewport({ width: 1920, height: 1080 });
  }

  /**
   * Check robots.txt before scraping
   * Note: Simplified version - just logs and allows all for now
   */
  protected async checkRobotsTxt(url: string): Promise<boolean> {
    if (!this.options.respectRobotsTxt) return true;

    try {
      const robotsUrl = new URL('/robots.txt', this.source.baseUrl).href;
      await axios.get(robotsUrl, { timeout: 5000 });
      this.log('debug', `robots.txt found at ${robotsUrl} - allowing scrape`);
      return true;
    } catch (error) {
      this.log('debug', 'No robots.txt found, proceeding');
      return true;
    }
  }

  /**
   * Rate limiting delay
   */
  protected async delay(): Promise<void> {
    const ms = this.source.rateLimit || 2000;
    await new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Fetch page with axios (for static sites)
   */
  protected async fetchPage(url: string): Promise<cheerio.CheerioAPI | null> {
    try {
      const allowed = await this.checkRobotsTxt(url);
      if (!allowed) return null;

      this.log('info', `Fetching: ${url}`);
      
      const response = await axios.get(url, {
        headers: { 'User-Agent': this.options.userAgent },
        timeout: this.options.timeout,
      });

      return cheerio.load(response.data);
    } catch (error) {
      this.log('error', `Failed to fetch ${url}: ${error}`);
      return null;
    }
  }

  /**
   * Fetch page with Puppeteer (for JavaScript sites)
   */
  protected async fetchPageDynamic(url: string): Promise<cheerio.CheerioAPI | null> {
    try {
      const allowed = await this.checkRobotsTxt(url);
      if (!allowed) return null;

      await this.initBrowser();
      if (!this.page) throw new Error('Browser not initialized');

      this.log('info', `Fetching (dynamic): ${url}`);
      
      await this.page.goto(url, { 
        waitUntil: 'networkidle2',
        timeout: this.options.timeout 
      });

      const html = await this.page.content();
      return cheerio.load(html);
    } catch (error) {
      this.log('error', `Failed to fetch dynamic ${url}: ${error}`);
      return null;
    }
  }

  /**
   * Normalize ingredient text
   */
  protected normalizeIngredient(text: string): string {
    return text
      .trim()
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, ' ');
  }

  /**
   * Extract amount and unit from ingredient text
   * Examples: "2 cups chicken", "1/2 lb beef", "3 tablespoons oil"
   */
  protected parseIngredientAmount(text: string): {
    name: string;
    amount?: string;
    unit?: string;
  } {
    const amountPattern = /^([\d\/\.\s]+)\s*([a-z]+)?\s+(.+)$/i;
    const match = text.match(amountPattern);

    if (match) {
      return {
        amount: match[1].trim(),
        unit: match[2]?.trim(),
        name: match[3].trim(),
      };
    }

    return { name: text.trim() };
  }

  /**
   * Validate and filter recipe by safety
   */
  protected validateRecipe(recipe: ScrapedRecipe): {
    valid: boolean;
    warnings: string[];
  } {
    const warnings: string[] = [];
    let valid = true;

    // Check each species
    for (const species of recipe.species) {
      const ingredientNames = recipe.ingredients.map(ing => ing.name);
      const validation = validateRecipeIngredients(ingredientNames, species);
      
      if (!validation.safe) {
        valid = false;
        warnings.push(`Recipe contains toxic ingredients for ${species}`);
      }
      
      warnings.push(...validation.warnings);
    }

    // Check minimum ingredients
    if (recipe.ingredients.length < 2) {
      warnings.push('Recipe has fewer than 2 ingredients - may be incomplete');
    }

    return { valid, warnings };
  }

  /**
   * Logging helper
   */
  protected log(level: 'debug' | 'info' | 'warn' | 'error', message: string): void {
    const levels = { debug: 0, info: 1, warn: 2, error: 3 };
    const currentLevel = levels[this.options.logLevel];
    const messageLevel = levels[level];

    if (messageLevel >= currentLevel) {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] [${level.toUpperCase()}] [${this.source.name}] ${message}`);
    }
  }

  /**
   * Cleanup
   */
  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = undefined;
      this.page = undefined;
    }
  }

  /**
   * Abstract method - must be implemented by subclasses
   */
  abstract scrape(): Promise<ScraperResult>;
}
