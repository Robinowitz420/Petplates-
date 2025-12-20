/**
 * BLOG RECIPE DISCOVERY SCRAPER
 * Discovers recipes via sitemap + RSS, extracts via JSON-LD schema.org
 * This is the "smart" scraper that doesn't rely on homepage CSS selectors
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import { ScrapedRecipe, RecipeIngredient, ScraperSource } from '../types';
import { v4 as uuidv4 } from 'uuid';

export interface DiscoveredRecipe {
  url: string;
  title?: string;
  speciesHints: string[];
  ingredients: string[];
  instructions?: string[];
  jsonLdRecipe?: any;
  extractedAt: string;
}

export class BlogRecipeDiscoveryScraper {
  constructor(
    private sources: ScraperSource[],
    private maxUrlsPerSite = 500,
    private timeoutMs = 20000
  ) {}

  async run(): Promise<ScrapedRecipe[]> {
    const out: ScrapedRecipe[] = [];
    
    for (const source of this.sources) {
      console.log(`\n🔍 Discovering recipes from: ${source.name}`);
      
      const urls = await this.discoverUrls(source.baseUrl);
      const candidates = this.filterRecipeLikeUrls(urls).slice(0, this.maxUrlsPerSite);
      
      console.log(`   Found ${urls.length} URLs, ${candidates.length} recipe candidates`);

      for (const url of candidates) {
        const recipe = await this.scrapeRecipePage(url, source);
        if (recipe) {
          out.push(recipe);
          console.log(`   ✓ Scraped: ${recipe.name}`);
        }
        await this.sleep(350);
      }
    }
    
    return out;
  }

  private async discoverUrls(baseUrl: string): Promise<string[]> {
    const sitemaps = await this.findSitemaps(baseUrl);
    const urls: string[] = [];
    
    for (const sm of sitemaps) {
      const smUrls = await this.parseSitemap(sm);
      urls.push(...smUrls);
      if (urls.length > this.maxUrlsPerSite * 3) break;
    }
    
    return Array.from(new Set(urls));
  }

  private async findSitemaps(baseUrl: string): Promise<string[]> {
    const base = new URL(baseUrl);
    const robotsUrl = new URL('/robots.txt', base).toString();

    const sitemaps: string[] = [];
    try {
      const res = await axios.get(robotsUrl, { timeout: this.timeoutMs });
      const lines = String(res.data).split('\n');
      for (const line of lines) {
        const m = line.match(/^sitemap:\s*(.+)$/i);
        if (m?.[1]) sitemaps.push(m[1].trim());
      }
    } catch {
      // ignore
    }

    if (sitemaps.length === 0) {
      sitemaps.push(new URL('/sitemap.xml', base).toString());
      sitemaps.push(new URL('/sitemap_index.xml', base).toString());
    }

    return Array.from(new Set(sitemaps));
  }

  private async parseSitemap(sitemapUrl: string): Promise<string[]> {
    try {
      const res = await axios.get(sitemapUrl, { timeout: this.timeoutMs });
      const xml = String(res.data);

      if (xml.includes('<sitemapindex')) {
        const $ = cheerio.load(xml, { xmlMode: true });
        const subs: string[] = [];
        $('sitemap > loc').each((_: any, el: any) => { subs.push($(el).text().trim()); });
        
        const out: string[] = [];
        for (const sub of subs.slice(0, 40)) {
          const subUrls = await this.parseSitemap(sub);
          out.push(...subUrls);
          if (out.length > this.maxUrlsPerSite * 3) break;
        }
        return out;
      }

      const $ = cheerio.load(xml, { xmlMode: true });
      const urls: string[] = [];
      $('url > loc').each((_: any, el: any) => {
        const u = $(el).text().trim();
        if (u) urls.push(u);
      });
      return urls;
    } catch {
      return [];
    }
  }

  private filterRecipeLikeUrls(urls: string[]): string[] {
    const rx = /(recipe|recipes|homemade|treat|meal|diet|dog[-_ ]food|cat[-_ ]food|puppy|kitten)/i;
    return urls.filter((u: string) => rx.test(u));
  }

  private async scrapeRecipePage(url: string, source: ScraperSource): Promise<ScrapedRecipe | null> {
    try {
      const res = await axios.get(url, {
        timeout: this.timeoutMs,
        headers: { 'User-Agent': 'PetPlatesRecipeBot/1.0 (Educational Research)' }
      });
      const html = String(res.data);
      const $ = cheerio.load(html);

      // Prefer JSON-LD Recipe
      const jsonLd = this.extractJsonLd($);
      const recipeLd = jsonLd.find(x => this.hasRecipeType(x));
      
      if (recipeLd) {
        const ingredients: RecipeIngredient[] = [];
        const rawIngredients = Array.isArray(recipeLd.recipeIngredient) 
          ? recipeLd.recipeIngredient 
          : [];
        
        for (const ing of rawIngredients) {
          const parsed = this.parseIngredientAmount(String(ing));
          ingredients.push({
            name: parsed.name,
            amount: parsed.amount,
            unit: parsed.unit,
          });
        }

        return {
          id: uuidv4(),
          name: recipeLd.name ?? $('title').text().trim(),
          species: this.inferSpeciesHints(url, source.species),
          ingredients,
          instructions: this.normalizeInstructions(recipeLd),
          sourceUrl: url,
          sourceName: source.name,
          sourceTier: source.tier,
          scrapedAt: new Date(),
          tags: ['json-ld', 'blog'],
        };
      }

      // Fallback: heuristic ingredient parsing
      const title = $('h1').first().text().trim() || $('title').text().trim();
      const ingredients = this.heuristicIngredients($);
      
      if (ingredients.length >= 3) {
        return {
          id: uuidv4(),
          name: title,
          species: this.inferSpeciesHints(url, source.species),
          ingredients,
          sourceUrl: url,
          sourceName: source.name,
          sourceTier: source.tier,
          scrapedAt: new Date(),
          tags: ['heuristic', 'blog'],
          warnings: ['Extracted via heuristics - may need manual review'],
        };
      }

      return null;
    } catch {
      return null;
    }
  }

  private extractJsonLd($: cheerio.CheerioAPI): any[] {
    const out: any[] = [];
    $('script[type="application/ld+json"]').each((_: any, el: any) => {
      const raw = $(el).text();
      if (!raw) return;
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) out.push(...parsed);
        else if (parsed?.['@graph']) out.push(...parsed['@graph']);
        else out.push(parsed);
      } catch {
        // ignore
      }
    });
    return out;
  }

  private hasRecipeType(x: any): boolean {
    const t = x?.['@type'];
    if (!t) return false;
    if (Array.isArray(t)) return t.includes('Recipe');
    return t === 'Recipe';
  }

  private normalizeInstructions(recipeLd: any): string[] | undefined {
    const inst = recipeLd?.recipeInstructions;
    if (!inst) return undefined;
    if (typeof inst === 'string') return [inst];
    if (Array.isArray(inst)) {
      return inst.map((i: any) => (typeof i === 'string' ? i : i?.text)).filter(Boolean);
    }
    return undefined;
  }

  private heuristicIngredients($: cheerio.CheerioAPI): RecipeIngredient[] {
    const headings = $('h2,h3,h4').filter((_: any, el: any) => /ingredients/i.test($(el).text()));
    if (headings.length === 0) return [];

    const list: RecipeIngredient[] = [];
    headings.each((_: any, h: any) => {
      const section = $(h).nextAll('ul,ol').first();
      section.find('li').each((__: any, li: any) => {
        const text = $(li).text().replace(/\s+/g, ' ').trim();
        if (text) {
          const parsed = this.parseIngredientAmount(text);
          list.push({
            name: parsed.name,
            amount: parsed.amount,
            unit: parsed.unit,
          });
        }
      });
    });

    return Array.from(new Set(list.map(i => JSON.stringify(i)))).map(s => JSON.parse(s)).slice(0, 60);
  }

  private parseIngredientAmount(text: string): {
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

  private inferSpeciesHints(url: string, defaults: any[]): any[] {
    const u = url.toLowerCase();
    const hints = new Set(defaults);
    if (u.includes('cat') || u.includes('feline') || u.includes('kitten')) hints.add('cats');
    if (u.includes('dog') || u.includes('canine') || u.includes('puppy')) hints.add('dogs');
    if (u.includes('bird') || u.includes('parrot') || u.includes('avian')) hints.add('birds');
    if (u.includes('reptile') || u.includes('tortoise') || u.includes('lizard')) hints.add('reptiles');
    if (u.includes('guinea') || u.includes('rabbit') || u.includes('hamster')) hints.add('pocket-pets');
    return Array.from(hints);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
