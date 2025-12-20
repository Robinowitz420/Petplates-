import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * AUTOMATED ASIN CORRECTION SYSTEM
 * Searches Amazon by GENERIC INGREDIENT NAME and finds correct products
 */

interface VettedProduct {
  ingredient: string;
  productName: string;
  asin: string;
  amazonLink: string;
  vetNote: string;
  category?: string;
}

interface SearchResult {
  asin: string;
  title: string;
  price: string;
  rating: string;
  imageUrl: string;
  matchScore: number;
}

// ============================================================================
// PARSE YOUR VETTED-PRODUCTS.TXT FILE
// ============================================================================

function parseVettedProducts(filePath: string): VettedProduct[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const products: VettedProduct[] = [];

  // Match entries like: 'ground beef (lean)': {
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const ingredientMatch = line.match(/'([^']+)':\s*{/);

    if (ingredientMatch) {
      const ingredient = ingredientMatch[1];

      // Extract the object block
      let block = '';
      let braceCount = 1;
      let j = i + 1;

      while (j < lines.length && braceCount > 0) {
        block += lines[j] + '\n';
        braceCount += (lines[j].match(/{/g) || []).length;
        braceCount -= (lines[j].match(/}/g) || []).length;
        j++;
      }

      // Extract fields
      const productNameMatch = block.match(/productName:\s*'([^']+)'/);
      const amazonLinkMatch = block.match(/amazonLink:\s*'([^']+)'/);
      const asinMatch = block.match(/\/dp\/([A-Z0-9]{10})/);
      const vetNoteMatch = block.match(/vetNote:\s*'([^']+)'/);
      const categoryMatch = block.match(/category:\s*'([^']+)'/);

      products.push({
        ingredient,
        productName: productNameMatch ? productNameMatch[1] : '',
        asin: asinMatch ? asinMatch[1] : 'UNKNOWN',
        amazonLink: amazonLinkMatch ? amazonLinkMatch[1] : '',
        vetNote: vetNoteMatch ? vetNoteMatch[1] : '',
        category: categoryMatch ? categoryMatch[1] : undefined
      });
    }
  }

  return products;
}

// ============================================================================
// SEARCH AMAZON BY GENERIC INGREDIENT NAME
// ============================================================================

async function searchAmazonByIngredient(
  ingredient: string,
  category: string = 'pet-supplies'
): Promise<SearchResult[]> {

  // JUST search for the ingredient name - nothing else!
  // Amazon's pet-supplies category will handle the context
  const searchTerms = [
    ingredient,  // Just "turkey" or "ground beef"
  ];

  const results: SearchResult[] = [];

  for (const searchTerm of searchTerms) {
    try {
      console.log(`  🔍 Searching: "${searchTerm}"`);

      // Search ONLY in pet-supplies with the basic ingredient name
      const url = `https://www.amazon.com/s?k=${encodeURIComponent(searchTerm)}&i=${category}`;

      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
        },
        timeout: 10000
      });

      const $ = cheerio.load(response.data);

      // Extract product cards
      $('[data-component-type="s-search-result"]').each((i, element) => {
        if (i >= 5) return; // Get top 5 results

        const asin = $(element).attr('data-asin');
        if (!asin) return;

        const title = $(element).find('h2 span').text().trim();
        const price = $(element).find('.a-price-whole').first().text().trim() || 'N/A';
        const rating = $(element).find('.a-icon-star-small span').first().text().trim() || 'N/A';
        const imageUrl = $(element).find('img.s-image').attr('src') || '';

        if (title && asin) {
          const matchScore = calculateMatchScore(ingredient, title);
          results.push({
            asin,
            title,
            price,
            rating,
            imageUrl,
            matchScore
          });
        }
      });

      // Wait between searches to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1500));

    } catch (error: any) {
      console.error(`  ❌ Search failed: ${error.message}`);
    }
  }

  // Sort by match score and deduplicate
  const uniqueResults = Array.from(
    new Map(results.map(r => [r.asin, r])).values()
  );

  return uniqueResults
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 5); // Return top 5
}

// ============================================================================
// INTELLIGENT MATCHING ALGORITHM
// ============================================================================

function calculateMatchScore(ingredient: string, productTitle: string): number {
  let score = 0;
  const titleLower = productTitle.toLowerCase();
  const ingredientLower = ingredient.toLowerCase();

  // Remove common modifiers for better matching
  const cleanIngredient = ingredientLower
    .replace(/\(lean\)|\(boneless\)|\(skinless\)|\(canned in water\)/g, '')
    .trim();

  // Extract main words (e.g., "ground beef" -> ["ground", "beef"])
  const ingredientWords = cleanIngredient.split(' ').filter(w => w.length > 2);

  // EXACT MATCH (80 points)
  if (titleLower.includes(cleanIngredient)) {
    score += 80;
  } else {
    // PARTIAL MATCH (up to 40 points)
    const matchedWords = ingredientWords.filter(word => titleLower.includes(word));
    score += (matchedWords.length / ingredientWords.length) * 40;
  }

  // PET-SPECIFIC (15 points)
  if (titleLower.includes('dog') || titleLower.includes('pet') || titleLower.includes('canine')) {
    score += 15;
  }

  // QUALITY INDICATORS (5 points each)
  if (titleLower.includes('freeze dried') || titleLower.includes('raw')) score += 5;
  if (titleLower.includes('human grade') || titleLower.includes('human-grade')) score += 5;
  if (titleLower.includes('organic') || titleLower.includes('grass fed')) score += 5;
  if (titleLower.includes('premium') || titleLower.includes('natural')) score += 3;

  // PENALTIES (subtract points)
  if (titleLower.includes('treat') || titleLower.includes('jerky')) score -= 30;
  if (titleLower.includes('toy') || titleLower.includes('bed')) score -= 50;
  if (titleLower.includes('mix') || titleLower.includes('variety pack')) score -= 20;
  if (titleLower.includes('supplement') && !ingredientLower.includes('oil')) score -= 25;

  // Heavy penalties for processed dog foods
  if (titleLower.includes('canned') || titleLower.includes('wet food')) score -= 40;
  if (titleLower.includes('dry food') || titleLower.includes('kibble')) score -= 35;
  if (titleLower.includes('dog food') && !titleLower.includes('ingredient')) score -= 30;
  if (titleLower.includes('entree') || titleLower.includes('recipe')) score -= 25;

  return Math.max(0, Math.min(100, score));
}

// ============================================================================
// VERIFY CURRENT ASIN
// ============================================================================

async function verifyCurrentASIN(asin: string): Promise<{ valid: boolean; title: string }> {
  try {
    const url = `https://www.amazon.com/dp/${asin}`;
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      timeout: 10000
    });

    const $ = cheerio.load(response.data);
    const title = $('#productTitle').text().trim();

    // Check if product exists and is available
    const unavailable = $('body').text().includes('Currently unavailable') ||
                       $('body').text().includes('out of stock');

    return {
      valid: !unavailable && title.length > 0,
      title
    };
  } catch (error) {
    return { valid: false, title: '' };
  }
}

// ============================================================================
// MAIN CORRECTION LOGIC
// ============================================================================

interface Correction {
  ingredient: string;
  oldASIN: string;
  newASIN: string;
  oldProductName: string;
  newProductName: string;
  confidence: 'high' | 'medium' | 'low';
  reason: string;
  matchScore: number;
}

async function processProducts(products: VettedProduct[], limit?: number): Promise<Correction[]> {
  const corrections: Correction[] = [];
  const toProcess = limit ? products.slice(0, limit) : products;

  console.log(`\n🤖 Processing ${toProcess.length} ingredients${limit ? ` (first ${limit})` : ''}...\n`);

  for (let i = 0; i < toProcess.length; i++) {
    const product = products[i];

    console.log(`\n[${i + 1}/${products.length}] ${product.ingredient}`);
    console.log(`  Current: ${product.productName} (${product.asin})`);

    // Step 1: Verify current ASIN
    console.log(`  📦 Verifying current ASIN...`);
    const currentCheck = await verifyCurrentASIN(product.asin);

    if (!currentCheck.valid) {
      console.log(`  ⚠️  Current ASIN invalid/unavailable`);
    } else {
      const currentScore = calculateMatchScore(product.ingredient, currentCheck.title);
      console.log(`  ✓ Current ASIN score: ${currentScore}/100`);

      if (currentScore >= 75) {
        console.log(`  ✅ Current ASIN is good, skipping`);
        continue;
      }
    }

    // Step 2: Search for better options
    console.log(`  🔎 Searching for better matches...`);
    const searchResults = await searchAmazonByIngredient(product.ingredient, 'pet-supplies');

    if (searchResults.length === 0) {
      console.log(`  ❌ No results found`);
      continue;
    }

    // Step 3: Find best match
    const bestMatch = searchResults[0];
    console.log(`  🎯 Best match: ${bestMatch.title} (score: ${bestMatch.matchScore})`);

    // Step 4: Decide if we should replace
    const currentScore = currentCheck.valid ?
      calculateMatchScore(product.ingredient, currentCheck.title) : 0;

    if (bestMatch.matchScore > currentScore + 10 || !currentCheck.valid) {
      corrections.push({
        ingredient: product.ingredient,
        oldASIN: product.asin,
        newASIN: bestMatch.asin,
        oldProductName: product.productName,
        newProductName: bestMatch.title,
        confidence: bestMatch.matchScore >= 75 ? 'high' :
                   bestMatch.matchScore >= 60 ? 'medium' : 'low',
        reason: !currentCheck.valid ? 'Current ASIN invalid' :
                `Better match (${bestMatch.matchScore} vs ${currentScore})`,
        matchScore: bestMatch.matchScore
      });

      console.log(`  ✅ CORRECTION QUEUED`);
    } else {
      console.log(`  ✓ Current ASIN acceptable`);
    }

    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  return corrections;
}

// ============================================================================
// GENERATE OUTPUT FILES
// ============================================================================

function generateCorrectedFile(originalPath: string, corrections: Correction[]): string {
  let content = fs.readFileSync(originalPath, 'utf-8');

  for (const c of corrections) {
    // Replace the entire product entry (be more careful with the regex)
    const escapedIngredient = c.ingredient.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const oldEntryPattern = `'${escapedIngredient}':\\s*{[\\s\\S]*?},\\s*`;

    const oldEntryMatch = content.match(new RegExp(oldEntryPattern, 's'));
    if (oldEntryMatch) {
      const newEntry = `'${c.ingredient}': {
    productName: '${c.newProductName.replace(/'/g, "\\'")}',
    amazonLink: 'https://www.amazon.com/dp/${c.newASIN}?tag=robinfrench-20',
    vetNote: 'Updated by automated system - ${c.reason}',
    category: 'Meat',
    commissionRate: 0.03
  },`;

      content = content.replace(oldEntryMatch[0], newEntry);
    }
  }

  return content;
}

function generateReport(corrections: Correction[]): string {
  const highConf = corrections.filter(c => c.confidence === 'high');
  const medConf = corrections.filter(c => c.confidence === 'medium');
  const lowConf = corrections.filter(c => c.confidence === 'low');

  let report = `# ASIN Correction Report
Generated: ${new Date().toLocaleString()}
Total Corrections: ${corrections.length}

## Summary
- ✅ High Confidence: ${highConf.length}
- ⚠️  Medium Confidence: ${medConf.length}
- ❓ Low Confidence: ${lowConf.length}

## Corrections by Confidence

`;

  ['high', 'medium', 'low'].forEach(conf => {
    const items = corrections.filter(c => c.confidence === conf);
    if (items.length === 0) return;

    report += `### ${conf.toUpperCase()} CONFIDENCE (${items.length})\n\n`;

    items.forEach((c, i) => {
      report += `**${i + 1}. ${c.ingredient}** (Score: ${c.matchScore}/100)
- OLD: ${c.oldProductName} → \`${c.oldASIN}\`
- NEW: ${c.newProductName} → \`${c.newASIN}\`
- REASON: ${c.reason}
- LINK: https://www.amazon.com/dp/${c.newASIN}

`;
    });
  });

  return report;
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  const limit = process.argv[2] ? parseInt(process.argv[2]) : undefined;
  const inputFile = path.join(__dirname, '../lib/data/vetted-products.txt');
  const outputFile = path.join(__dirname, '../lib/data/vetted-products-CORRECTED.txt');
  const reportFile = path.join(__dirname, '../ASIN-CORRECTION-REPORT.md');

  console.log('🚀 AUTOMATED ASIN CORRECTION SYSTEM');
  console.log('━'.repeat(60));
  console.log(`📁 Input:  ${inputFile}`);
  console.log(`📁 Output: ${outputFile}`);
  console.log(`📁 Report: ${reportFile}`);
  if (limit) console.log(`🎯 Testing mode: Processing only first ${limit} products`);
  console.log('━'.repeat(60));

  try {
    // Parse products
    console.log('\n📖 Reading vetted-products.txt...');
    const products = parseVettedProducts(inputFile);
    console.log(`✅ Found ${products.length} products\n`);

    // Process (this will take a while!)
    const corrections = await processProducts(products, limit);

    // Generate outputs
    console.log(`\n📊 Generating corrected file and report...`);
    const correctedContent = generateCorrectedFile(inputFile, corrections);
    fs.writeFileSync(outputFile, correctedContent);

    const report = generateReport(corrections);
    fs.writeFileSync(reportFile, report);

    console.log('\n✅ DONE!');
    console.log(`📄 Corrected file: ${outputFile}`);
    console.log(`📊 Report: ${reportFile}`);
    console.log(`\n🎯 Made ${corrections.length} corrections`);

  } catch (error: any) {
    console.error('\n❌ ERROR:', error.message);
    process.exit(1);
  }
}

main();
