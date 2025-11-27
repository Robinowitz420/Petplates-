"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AmazonScraper_1 = require("./scrapers/AmazonScraper");
const RegulatoryScraper_1 = require("./scrapers/RegulatoryScraper");
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
async function main() {
    console.log('Starting scrapers...');
    // Initialize scrapers
    const amazonScraper = new AmazonScraper_1.AmazonScraper({ headless: false }); // Set to true for production
    const regulatoryScraper = new RegulatoryScraper_1.RegulatoryScraper({ headless: false });
    try {
        // Example: Search for chicken dog food on Amazon
        console.log('Searching Amazon for chicken dog food...');
        const products = await amazonScraper.search('chicken dog food');
        console.log(`Found ${products.length} products`);
        // Save results to a file
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const resultsDir = path_1.default.join(__dirname, '..', 'results');
        require('fs').mkdirSync(resultsDir, { recursive: true });
        // Save Amazon results
        (0, fs_1.writeFileSync)(path_1.default.join(resultsDir, `amazon-${timestamp}.json`), JSON.stringify(products, null, 2));
        console.log(`Saved Amazon results to results/amazon-${timestamp}.json`);
        // Get AAFCO guidelines
        console.log('\nFetching AAFCO guidelines...');
        const aafcoGuidelines = await regulatoryScraper.getAafcoGuidelines();
        console.log(`Found ${aafcoGuidelines.length} AAFCO guidelines`);
        // Save AAFCO results
        (0, fs_1.writeFileSync)(path_1.default.join(resultsDir, `aafco-${timestamp}.json`), JSON.stringify(aafcoGuidelines, null, 2));
        console.log(`Saved AAFCO results to results/aafco-${timestamp}.json`);
    }
    catch (error) {
        console.error('Error during scraping:', error);
    }
    finally {
        await amazonScraper.close();
        await regulatoryScraper.close();
        console.log('\nScraping completed!');
    }
}
main().catch(console.error);
