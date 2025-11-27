import { Page, Browser, BrowserContext } from 'puppeteer';
import { ScraperOptions } from '../models/types';

export abstract class BaseScraper {
  protected browser: Browser | null = null;
  protected context: BrowserContext | null = null;
  protected page: Page | null = null;
  protected options: Required<ScraperOptions>;

  constructor(options: ScraperOptions = {}) {
    this.options = {
      headless: true,
      maxPages: 3,
      delay: 2000,
      timeout: 30000,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      ...options
    };
  }

  protected async initializeBrowser() {
    const puppeteer = await import('puppeteer');
    this.browser = await puppeteer.launch({
      headless: this.options.headless ? 'shell' : false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    this.context = await this.browser.createBrowserContext();
    this.page = await this.context.newPage();
    await this.page.setUserAgent(this.options.userAgent);
    await this.page.setViewport({ width: 1366, height: 768 });
  }

  protected async delay(ms: number = this.options.delay) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  protected async safeNavigate(url: string) {
    if (!this.page) {
      await this.initializeBrowser();
      if (!this.page) throw new Error('Failed to initialize page');
    }
    try {
      await this.page.goto(url, { 
        waitUntil: 'networkidle2',
        timeout: this.options.timeout 
      });
      await this.delay();
      return true;
    } catch (error) {
      console.error(`Error navigating to ${url}:`, error);
      return false;
    }
  }

  protected async close() {
    if (this.page) await this.page.close();
    if (this.context) await this.context.close();
    if (this.browser) await this.browser.close();
  }

  // Abstract methods that child classes must implement
  abstract search(query: string): Promise<any[]>;
  abstract getDetails(url: string): Promise<any>;
}
