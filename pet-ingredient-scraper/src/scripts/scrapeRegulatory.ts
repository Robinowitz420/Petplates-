import { RegulatoryScraper } from '../scrapers/RegulatoryScraper';
import { writeFileSync } from 'fs';
import path from 'path';

async function main() {
  console.log('Starting regulatory scraper...');

  const scraper = new RegulatoryScraper({ headless: false }); // Set to true for production

  try {
    console.log('Fetching AAFCO guidelines...');
    const guidelines = await scraper.getAafcoGuidelines();
    console.log(`Found ${guidelines.length} AAFCO guidelines`);

    // Save results
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const resultsDir = path.join(__dirname, '..', '..', 'results');

    writeFileSync(
      path.join(resultsDir, `aafco-${timestamp}.json`),
      JSON.stringify(guidelines, null, 2)
    );

    console.log(`Saved guidelines to results/aafco-${timestamp}.json`);

    // Group by category
    const categories = guidelines.reduce((acc, guideline) => {
      if (!acc[guideline.category]) {
        acc[guideline.category] = [];
      }
      acc[guideline.category].push(guideline);
      return acc;
    }, {} as Record<string, typeof guidelines>);

    console.log('\nGuidelines by category:');
    Object.entries(categories).forEach(([category, items]) => {
      console.log(`  ${category}: ${items.length} guidelines`);
    });

  } catch (error) {
    console.error('Error during regulatory scraping:', error);
  } finally {
    await scraper.close();
    console.log('Regulatory scraping completed!');
  }
}

main().catch(console.error);