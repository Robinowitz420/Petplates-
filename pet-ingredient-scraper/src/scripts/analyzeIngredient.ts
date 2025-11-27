import { AmazonScraper } from '../scrapers/AmazonScraper';
import { RegulatoryScraper } from '../scrapers/RegulatoryScraper';
import { writeFileSync } from 'fs';
import path from 'path';

async function main() {
  const ingredient = process.argv[2];
  if (!ingredient) {
    console.error('Please provide an ingredient name. Usage: npm run analyze "chicken meal"');
    process.exit(1);
  }

  console.log(`Analyzing ingredient: ${ingredient}`);

  const amazonScraper = new AmazonScraper({ headless: false });
  const regulatoryScraper = new RegulatoryScraper({ headless: false });

  try {
    // Search Amazon for the ingredient
    console.log('Searching Amazon...');
    const amazonResults = await amazonScraper.search(`${ingredient} pet food`);

    // Search regulatory guidelines
    console.log('Searching regulatory guidelines...');
    const regulatoryResults = await regulatoryScraper.getAafcoGuidelines();

    // Filter regulatory results that mention the ingredient
    const relevantGuidelines = regulatoryResults.filter(guideline =>
      guideline.title.toLowerCase().includes(ingredient.toLowerCase()) ||
      guideline.content.toLowerCase().includes(ingredient.toLowerCase())
    );

    const analysis = {
      ingredient,
      timestamp: new Date().toISOString(),
      amazon: {
        totalProducts: amazonResults.length,
        averagePrice: amazonResults.reduce((sum, p) => sum + (p.price || 0), 0) / amazonResults.length,
        averageRating: amazonResults.reduce((sum, p) => sum + (p.rating || 0), 0) / amazonResults.length,
        topProducts: amazonResults.slice(0, 5)
      },
      regulatory: {
        relevantGuidelines: relevantGuidelines.length,
        guidelines: relevantGuidelines.slice(0, 3)
      },
      insights: {
        priceRange: amazonResults.length > 0 ? {
          min: Math.min(...amazonResults.map(p => p.price || 0)),
          max: Math.max(...amazonResults.map(p => p.price || 0))
        } : null,
        commonFeatures: [], // Could be enhanced with NLP
        regulatoryConcerns: relevantGuidelines.map(g => g.title)
      }
    };

    // Save analysis
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const resultsDir = path.join(__dirname, '..', '..', 'results');

    writeFileSync(
      path.join(resultsDir, `analysis-${ingredient.replace(/\s+/g, '-')}-${timestamp}.json`),
      JSON.stringify(analysis, null, 2)
    );

    console.log(`\nAnalysis complete for "${ingredient}":`);
    console.log(`- Found ${amazonResults.length} Amazon products`);
    console.log(`- Found ${relevantGuidelines.length} relevant regulatory guidelines`);
    console.log(`- Results saved to results/analysis-${ingredient.replace(/\s+/g, '-')}-${timestamp}.json`);

  } catch (error) {
    console.error('Error during analysis:', error);
  } finally {
    await amazonScraper.close();
    await regulatoryScraper.close();
  }
}

main().catch(console.error);