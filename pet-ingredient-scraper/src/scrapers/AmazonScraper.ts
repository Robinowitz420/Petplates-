import { Page } from 'puppeteer';
import { BaseScraper } from './BaseScraper';
import { ProductSource, Review, ScraperOptions } from '../models/types';

export class AmazonScraper extends BaseScraper {
  private readonly baseUrl = 'https://www.amazon.com';
  private readonly affiliateTag = 'robinfrench-20';

  constructor(options: ScraperOptions = {}) {
    super({
      ...options,
      headless: options.headless ?? true,
    });
  }

  async search(query: string): Promise<ProductSource[]> {
    try {
      await this.initializeBrowser();
      if (!this.page) throw new Error('Page not initialized');

      const searchUrl = `${this.baseUrl}/s?k=${encodeURIComponent(query + ' for pets')}`;
      const success = await this.safeNavigate(searchUrl);
      if (!success) return [];

      return await this.page.evaluate((affiliateTag: string) => {
        const products: any[] = [];
        const items = document.querySelectorAll('.s-result-item[data-component-type="s-search-result"]');
        
        items.forEach(item => {
          const titleEl = item.querySelector('h2 a') as HTMLAnchorElement | null;
          const priceEl = item.querySelector('.a-price .a-offscreen') as HTMLElement | null;
          const ratingEl = item.querySelector('.a-icon-alt') as HTMLElement | null;
          const reviewCountEl = item.querySelector('.a-size-base.s-underline-text') as HTMLElement | null;
          const urlEl = item.querySelector('h2 a') as HTMLAnchorElement | null;
          const imageEl = item.querySelector('img.s-image') as HTMLImageElement | null;

          if (!titleEl || !urlEl) return;

          const title = titleEl.textContent?.trim() || 'Unknown';
          const url = new URL(urlEl.href, window.location.origin).href;
          const price = parseFloat(priceEl?.textContent?.replace(/[^0-9.]/g, '') || '0');
          const rating = parseFloat(ratingEl?.textContent?.split(' ')[0] || '0');
          const reviewCount = parseInt(reviewCountEl?.textContent?.replace(/[^0-9]/g, '') || '0');
          const imageUrl = imageEl?.getAttribute('src') || '';

          // Create affiliate link
          const affiliateUrl = new URL(url);
          if (affiliateUrl.hostname.includes('amazon.com')) {
            affiliateUrl.searchParams.set('tag', affiliateTag);
          }

          products.push({
            name: title,
            url: affiliateUrl.toString(),
            price,
            rating,
            reviewCount,
            isAffiliate: true,
            lastChecked: new Date(),
            imageUrl
          });
        });

        return products;
      }, this.affiliateTag);

    } catch (error) {
      console.error('Error in Amazon search:', error);
      return [];
    } finally {
      await this.close();
    }
  }

  async getProductDetails(url: string): Promise<{
    details: any;
    reviews: Review[];
  }> {
    try {
      await this.initializeBrowser();
      if (!this.page) throw new Error('Page not initialized');

      const success = await this.safeNavigate(url);
      if (!success) return { details: null, reviews: [] };

      // Wait for product details to load
      await this.page.waitForSelector('#productTitle', { timeout: 10000 }).catch(() => null);

      const details = await this.page.evaluate(() => {
        const title = document.querySelector('#productTitle')?.textContent?.trim() || '';
        const priceText = document.querySelector('.a-price .a-offscreen')?.textContent || '';
        const price = parseFloat(priceText.replace(/[^0-9.]/g, '')) || 0;
        const ratingText = document.querySelector('.a-icon-alt')?.textContent || '';
        const rating = parseFloat(ratingText.split(' ')[0]) || 0;
        const reviewCountText = document.querySelector('#acrCustomerReviewText')?.textContent || '';
        const reviewCount = parseInt(reviewCountText.replace(/[^0-9]/g, '')) || 0;
        
        // Get product details
        const details: Record<string, string> = {};
        document.querySelectorAll('#detailBullets_feature_div li, #productDetails_detailBullets_sections1 tr').forEach(row => {
          const key = row.querySelector('th, .a-text-bold')?.textContent?.trim().replace(/[^a-zA-Z ]/g, '') || '';
          const value = row.querySelector('td, .a-size-base')?.textContent?.trim() || '';
          if (key && value) {
            details[key] = value;
          }
        });

        return {
          title,
          price,
          rating,
          reviewCount,
          details,
          description: document.querySelector('#productDescription')?.textContent?.trim() || '',
          features: Array.from(document.querySelectorAll('#feature-bullets li')).map(li => li.textContent?.trim() || '').filter(Boolean)
        };
      });

      // Get reviews
      const reviews = await this.getProductReviews(url);

      return {
        details,
        reviews
      };
    } catch (error) {
      console.error('Error getting product details:', error);
      return { details: null, reviews: [] };
    } finally {
      await this.close();
    }
  }

  private async getProductReviews(productUrl: string): Promise<Review[]> {
    if (!this.page) return [];
    
    try {
      const reviewUrl = productUrl.replace(/\/dp\//, '/product-reviews/') + '?reviewerType=all_reviews&sortBy=recent';
      const success = await this.safeNavigate(reviewUrl);
      if (!success) return [];

      await this.page.waitForSelector('[data-hook="review"]', { timeout: 10000 }).catch(() => null);

      return await this.page.evaluate(() => {
        const reviews: Review[] = [];
        const reviewElements = document.querySelectorAll('[data-hook="review"]');
        
        reviewElements.forEach(reviewEl => {
          const ratingText = reviewEl.querySelector('[data-hook="review-star-rating"]')?.textContent || '';
          const rating = parseFloat(ratingText.split(' ')[0]) || 0;
          const title = reviewEl.querySelector('[data-hook="review-title"]')?.textContent?.trim() || '';
          const content = reviewEl.querySelector('[data-hook="review-body"]')?.textContent?.trim() || '';
          const author = reviewEl.querySelector('[class*="author"]')?.textContent?.trim() || 'Anonymous';
          const dateText = reviewEl.querySelector('[data-hook="review-date"]')?.textContent || '';
          const date = new Date(dateText.replace(/.*on\s+/, ''));
          const verified = reviewEl.querySelector('[data-hook="avp-badge"]') !== null;
          
          reviews.push({
            source: 'amazon',
            author,
            rating,
            date,
            title,
            content,
            verifiedPurchase: verified,
            url: window.location.href
          });
        });

        return reviews;
      });
    } catch (error) {
      console.error('Error getting reviews:', error);
      return [];
    }
  }

  async getDetails(url: string): Promise<any> {
    return this.getProductDetails(url);
  }

  async close(): Promise<void> {
    await super.close();
  }
}
