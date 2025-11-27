"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AmazonScraper_1 = require("../scrapers/AmazonScraper");
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
async function main() {
    console.log('Starting Amazon scraper...');
    const scraper = new AmazonScraper_1.AmazonScraper({ headless: false }); // Set to true for production
    try {
        // Search for pet food ingredients
        const searchTerms = [
            'chicken dog food',
            'turkey dog food',
            'salmon dog food',
            'sweet potato dog food',
            'pumpkin dog food'
        ];
        const allProducts = [];
        for (const term of searchTerms) {
            console.log(`\nSearching for: ${term}`);
            const products = await scraper.search(term);
            console.log(`Found ${products.length} products for "${term}"`);
            allProducts.push(...products);
            // Small delay between searches
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        // Save results
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const resultsDir = path_1.default.join(__dirname, '..', '..', 'results');
        (0, fs_1.writeFileSync)(path_1.default.join(resultsDir, `amazon-${timestamp}.json`), JSON.stringify(allProducts, null, 2));
        console.log(`\nSaved ${allProducts.length} total products to results/amazon-${timestamp}.json`);
    }
    catch (error) {
        console.error('Error during Amazon scraping:', error);
    }
    finally {
        await scraper.close();
        console.log('Amazon scraping completed!');
    }
}
main().catch(console.error);
