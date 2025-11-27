"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegulatoryScraper = void 0;
const BaseScraper_1 = require("./BaseScraper");
const axios_1 = __importDefault(require("axios"));
const cheerio = __importStar(require("cheerio"));
class RegulatoryScraper extends BaseScraper_1.BaseScraper {
    constructor() {
        super(...arguments);
        this.aafcoUrls = [
            'https://www.aafco.org/consumer-resources/pet-food-labels/',
            'https://www.aafco.org/feed-regulations/',
            'https://www.aafco.org/nutrition-profiles/',
            'https://www.aafco.org/consumer-resources/nutrition/',
        ];
    }
    async getAafcoGuidelines() {
        const guidelines = [];
        for (const url of this.aafcoUrls) {
            try {
                console.log(`Scraping AAFCO page: ${url}`);
                const response = await axios_1.default.get(url, {
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
            }
            catch (error) {
                console.error(`Error scraping ${url}:`, error);
            }
        }
        return guidelines;
    }
    extractGuidelinesFromPage($, url) {
        const guidelines = [];
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
    determineCategory(title, content) {
        const text = (title + ' ' + content).toLowerCase();
        if (text.includes('dog') && !text.includes('cat')) {
            return 'dog';
        }
        else if (text.includes('cat') && !text.includes('dog')) {
            return 'cat';
        }
        else {
            return 'general';
        }
    }
    // Implement abstract methods from BaseScraper
    async search(query) {
        // Regulatory scraper doesn't implement general search
        throw new Error('RegulatoryScraper does not support general search. Use getAafcoGuidelines() instead.');
    }
    async getDetails(url) {
        // Regulatory scraper doesn't implement general details
        throw new Error('RegulatoryScraper does not support general details. Use getAafcoGuidelines() instead.');
    }
    async close() {
        await super.close();
    }
}
exports.RegulatoryScraper = RegulatoryScraper;
