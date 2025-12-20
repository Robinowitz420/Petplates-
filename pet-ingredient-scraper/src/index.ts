import { AmazonScraper } from './scrapers/AmazonScraper.ts.ts';
import { RegulatoryScraper } from './scrapers/RegulatoryScraper.ts.ts';
import { writeFileSync } from 'fs';
import path from 'path';

async function main() {
  console.log('Starting scrapers...');

  // Initialize scrapers
  const amazonScraper = new AmazonScraper({ headless: false }); // Set to true for production
  const regulatoryScraper = new RegulatoryScraper({ headless: false });

  try {
    // Example: Search for chicken dog food on Amazon
    console.log('Searching Amazon for chicken dog food...');
    const products = await amazonScraper.search('chicken dog food');
    console.log(`Found ${products.length} products`);

    // Save results to a file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const resultsDir = path.join(__dirname, '..', 'results');
    require('fs').mkdirSync(resultsDir, { recursive: true });

    // Save Amazon results
    writeFileSync(
      path.join(resultsDir, `amazon-${timestamp}.json`),
      JSON.stringify(products, null, 2)
    );
    console.log(`Saved Amazon results to results/amazon-${timestamp}.json`);

    // Get AAFCO guidelines
    console.log('\nFetching AAFCO guidelines...');
    const aafcoGuidelines = await regulatoryScraper.getAafcoGuidelines();
    console.log(`Found ${aafcoGuidelines.length} AAFCO guidelines`);

    // Save AAFCO results
    writeFileSync(
      path.join(resultsDir, `aafco-${timestamp}.json`),
      JSON.stringify(aafcoGuidelines, null, 2)
    );
    console.log(`Saved AAFCO results to results/aafco-${timestamp}.json`);

  } catch (error) {
    console.error('Error during scraping:', error);
  } finally {
    await amazonScraper.close();
    await regulatoryScraper.close();
    console.log('\nScraping completed!');
  }
}

main().catch(console.error);