import { AmazonScraper } from '../scrapers/AmazonScraper';
import { writeFileSync } from 'fs';
import path from 'path';

async function main() {
  console.log('Starting Amazon scraper...');

  const scraper = new AmazonScraper({ headless: false }); // Set to true for production

  try {
    // Search for pet food ingredients
    const searchTerms = [
      'chicken dog food',
      'turkey dog food',
      'salmon dog food',
      'sweet potato dog food',
      'pumpkin dog food'
    ];

    const allProducts: any[] = [];

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
    const resultsDir = path.join(__dirname, '..', '..', 'results');

    writeFileSync(
      path.join(resultsDir, `amazon-${timestamp}.json`),
      JSON.stringify(allProducts, null, 2)
    );

    console.log(`\nSaved ${allProducts.length} total products to results/amazon-${timestamp}.json`);

  } catch (error) {
    console.error('Error during Amazon scraping:', error);
  } finally {
    await scraper.close();
    console.log('Amazon scraping completed!');
  }
}

main().catch(console.error);