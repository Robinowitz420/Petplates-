"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const RegulatoryScraper_1 = require("../scrapers/RegulatoryScraper");
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
async function main() {
    console.log('Starting regulatory scraper...');
    const scraper = new RegulatoryScraper_1.RegulatoryScraper({ headless: false }); // Set to true for production
    try {
        console.log('Fetching AAFCO guidelines...');
        const guidelines = await scraper.getAafcoGuidelines();
        console.log(`Found ${guidelines.length} AAFCO guidelines`);
        // Save results
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const resultsDir = path_1.default.join(__dirname, '..', '..', 'results');
        (0, fs_1.writeFileSync)(path_1.default.join(resultsDir, `aafco-${timestamp}.json`), JSON.stringify(guidelines, null, 2));
        console.log(`Saved guidelines to results/aafco-${timestamp}.json`);
        // Group by category
        const categories = guidelines.reduce((acc, guideline) => {
            if (!acc[guideline.category]) {
                acc[guideline.category] = [];
            }
            acc[guideline.category].push(guideline);
            return acc;
        }, {});
        console.log('\nGuidelines by category:');
        Object.entries(categories).forEach(([category, items]) => {
            console.log(`  ${category}: ${items.length} guidelines`);
        });
    }
    catch (error) {
        console.error('Error during regulatory scraping:', error);
    }
    finally {
        await scraper.close();
        console.log('Regulatory scraping completed!');
    }
}
main().catch(console.error);
