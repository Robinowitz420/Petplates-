import { BaseScraper } from './BaseScraper';
import axios from 'axios';
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';

interface AafcoGuideline {
  title: string;
  content: string;
  url: string;
  lastUpdated?: Date;
  category: 'dog' | 'cat' | 'general';
}

export class RegulatoryScraper extends BaseScraper {
  private aafcoUrls = [
    'https://www.aafco.org/consumer-resources/pet-food-labels/',
    'https://www.aafco.org/feed-regulations/',
    'https://www.aafco.org/nutrition-profiles/',
    'https://www.aafco.org/consumer-resources/nutrition/',
  ];

  async getAafcoGuidelines(): Promise<AafcoGuideline[]> {
    const guidelines: AafcoGuideline[] = [];

    for (const url of this.aafcoUrls) {
      try {
        console.log(`Scraping AAFCO page: ${url}`);
        const response = await axios.get(url, {
          headers: {
            'User-Agent': this.options.userAgent,
          },
          timeout: this.options.timeout,
        });

        const $ = cheerio.load(response.data);

        // Extract guidelines from the page
        const pageGuidelines = this.extractGuidelinesFromPage($, url);
        guidelines.push(...pageGuidelines);

        // Respect rate limiting
        await this.delay();

      } catch (error) {
        console.error(`Error scraping ${url}:`, error);
      }
    }

    return guidelines;
  }

  private extractGuidelinesFromPage($: cheerio.CheerioAPI, url: string): AafcoGuideline[] {
    const guidelines: AafcoGuideline[] = [];

    // Look for common AAFCO content patterns
    const selectors = [
      '.content h2, .content h3, .content h4',
      '.entry-content h2, .entry-content h3, .entry-content h4',
      '.post-content h2, .post-content h3, .post-content h4',
      'article h2, article h3, article h4',
    ];

    for (const selector of selectors) {
      $(selector).each((_, element) => {
        const $el = $(element);
        const title = $el.text().trim();

        if (title && title.length > 10) { // Filter out very short titles
          // Get the content following this heading
          let content = '';
          let $next = $el.next();

          while ($next.length && !$next.is('h1, h2, h3, h4, h5, h6')) {
            if ($next.is('p, ul, ol, table')) {
              content += $next.text().trim() + '\n\n';
            }
            $next = $next.next();
          }

          if (content.trim()) {
            const category = this.determineCategory(title, content);
            guidelines.push({
              title,
              content: content.trim(),
              url,
              lastUpdated: new Date(),
              category,
            });
          }
        }
      });
    }

    return guidelines;
  }

  private determineCategory(title: string, content: string): 'dog' | 'cat' | 'general' {
    const text = (title + ' ' + content).toLowerCase();

    if (text.includes('dog') && !text.includes('cat')) {
      return 'dog';
    } else if (text.includes('cat') && !text.includes('dog')) {
      return 'cat';
    } else {
      return 'general';
    }
  }

  // Implement abstract methods from BaseScraper
  async search(query: string): Promise<any[]> {
    // Regulatory scraper doesn't implement general search
    throw new Error('RegulatoryScraper does not support general search. Use getAafcoGuidelines() instead.');
  }

  async getDetails(url: string): Promise<any> {
    // Regulatory scraper doesn't implement general details
    throw new Error('RegulatoryScraper does not support general details. Use getAafcoGuidelines() instead.');
  }

  async close(): Promise<void> {
    await super.close();
  }
}