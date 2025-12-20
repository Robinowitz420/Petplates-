// scripts/verify-asin-accuracy.ts
// Analyzes vetted products to identify potential ASIN accuracy issues
// Creates manual verification checklists and identifies suspicious patterns

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load vetted products from text file
function loadVettedProducts(): Array<{ ingredient: string; asin: string; productName: string; asinLink: string; vetNote: string }> {
  const filePath = path.join(__dirname, '../lib/data/vetted-products.txt');
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  const products: Array<{ ingredient: string; asin: string; productName: string; asinLink: string; vetNote: string }> = [];
  let currentIngredient = '';
  let currentProductName = '';
  let currentAsinLink = '';
  let currentVetNote = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Look for ingredient keys (like 'ground chicken': {)
    const ingredientMatch = line.match(/^\s*'([^']+)':\s*\{/);
    if (ingredientMatch) {
      // Save previous product if complete
      if (currentIngredient && currentAsinLink) {
        const asin = extractASIN(currentAsinLink);
        if (asin) {
          products.push({
            ingredient: currentIngredient,
            asin,
            productName: currentProductName,
            asinLink: currentAsinLink,
            vetNote: currentVetNote
          });
        }
      }

      // Start new product
      currentIngredient = ingredientMatch[1];
      currentProductName = '';
      currentAsinLink = '';
      currentVetNote = '';
      continue;
    }

    // Look for productName
    const productNameMatch = line.match(/productName:\s*'([^']+)'/);
    if (productNameMatch) {
      currentProductName = productNameMatch[1];
    }

    // Look for asinLink
    const asinLinkMatch = line.match(/asinLink:\s*'([^']+)'/);
    if (asinLinkMatch) {
      currentAsinLink = asinLinkMatch[1];
    }

    // Look for vetNote
    const vetNoteMatch = line.match(/vetNote:\s*'([^']+)'/);
    if (vetNoteMatch) {
      currentVetNote = vetNoteMatch[1];
    }
  }

  // Don't forget the last product
  if (currentIngredient && currentAsinLink) {
    const asin = extractASIN(currentAsinLink);
    if (asin) {
      products.push({
        ingredient: currentIngredient,
        asin,
        productName: currentProductName,
        asinLink: currentAsinLink,
        vetNote: currentVetNote
      });
    }
  }

  return products;
}

interface AnalysisResult {
  ingredient: string;
  asin: string;
  productName: string;
  vetNote: string;
  url: string;
  analysis: {
    issues: string[];
    confidence: 'high' | 'medium' | 'low';
  };
  needsManualCheck: boolean;
}

interface AnalysisSummary {
  totalProducts: number;
  highConfidence: number;
  mediumConfidence: number;
  lowConfidence: number;
  needsManualCheck: number;
  issuesByType: Record<string, number>;
  results: AnalysisResult[];
}

// Extract ASIN from URL
function extractASIN(url: string): string | null {
  if (!url) return null;

  // Try /dp/ASIN pattern
  const dpMatch = url.match(/\/dp\/([A-Z0-9]{10})(?:\/|$|\?)/);
  if (dpMatch) return dpMatch[1];

  // Try /gp/product/ASIN pattern
  const gpMatch = url.match(/\/gp\/product\/([A-Z0-9]{10})(?:\/|$|\?)/);
  if (gpMatch) return gpMatch[1];

  // Try /product/ASIN pattern
  const productMatch = url.match(/\/product\/([A-Z0-9]{10})(?:\/|$|\?)/);
  if (productMatch) return productMatch[1];

  return null;
}

// Analyze product name for potential accuracy issues
function analyzeProductAccuracy(ingredient: string, productName: string, vetNote: string): {
  issues: string[];
  confidence: 'high' | 'medium' | 'low';
} {
  const issues: string[] = [];
  let confidence: 'high' | 'medium' | 'low' = 'high';

  const ingredientLower = ingredient.toLowerCase();
  const productLower = productName.toLowerCase();

  // Check if product name contains the ingredient
  if (!productLower.includes(ingredientLower)) {
    // Check for partial matches (key words)
    const ingredientWords = ingredientLower.split(/\s+/).filter(word => word.length > 2);
    const productWords = productLower.split(/\s+/);

    let matchedWords = 0;
    for (const word of ingredientWords) {
      if (productWords.some(productWord => productWord.includes(word))) {
        matchedWords++;
      }
    }

    if (matchedWords === 0) {
      issues.push('Product name does not contain ingredient name');
      confidence = 'low';
    } else if (matchedWords < ingredientWords.length * 0.5) {
      issues.push('Product name has weak match with ingredient');
      confidence = 'medium';
    }
  }

  // Check for generic or suspicious product names
  const suspiciousPatterns = [
    /generic/i,
    /variety pack/i,
    /mix/i,
    /blend/i,
    /assorted/i,
    /unknown brand/i,
    /no name/i
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(productName)) {
      issues.push(`Suspicious product name pattern: "${pattern.source}"`);
      confidence = 'low';
      break;
    }
  }

  // Check vet note quality
  if (!vetNote || vetNote.length < 20) {
    issues.push('Vet note too short or missing');
    confidence = confidence === 'high' ? 'medium' : confidence;
  }

  return { issues, confidence };
}

// Main analysis function
function analyzeASINAccuracy(): AnalysisSummary {
  console.log('🔍 Analyzing ASIN accuracy from existing data...\n');

  // Load products from text file
  const products = loadVettedProducts();

  console.log(`📦 Analyzing ${products.length} products...\n`);

  const results: AnalysisResult[] = [];
  const issuesByType: Record<string, number> = {};

  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const { ingredient, asin, productName, asinLink, vetNote } = product;

    console.log(`🔍 [${i + 1}/${products.length}] Analyzing ${ingredient}...`);

    const analysis = analyzeProductAccuracy(ingredient, productName, vetNote);
    const needsManualCheck = analysis.confidence === 'low' || analysis.issues.length > 0;

    const result: AnalysisResult = {
      ingredient,
      asin,
      productName,
      vetNote,
      url: asinLink,
      analysis,
      needsManualCheck,
    };

    results.push(result);

    // Track issue types
    for (const issue of analysis.issues) {
      issuesByType[issue] = (issuesByType[issue] || 0) + 1;
    }

    if (needsManualCheck) {
      console.log(`⚠️  ${ingredient}: ${analysis.issues.join(', ')} (Confidence: ${analysis.confidence})`);
    } else {
      console.log(`✅ ${ingredient}: Looks good (Confidence: ${analysis.confidence})`);
    }
  }

  const summary: AnalysisSummary = {
    totalProducts: results.length,
    highConfidence: results.filter(r => r.analysis.confidence === 'high').length,
    mediumConfidence: results.filter(r => r.analysis.confidence === 'medium').length,
    lowConfidence: results.filter(r => r.analysis.confidence === 'low').length,
    needsManualCheck: results.filter(r => r.needsManualCheck).length,
    issuesByType,
    results,
  };

  return summary;
}

// Generate report
function generateReport(summary: AnalysisSummary): string {
  const report = [
    '# ASIN Accuracy Analysis Report',
    `Generated: ${new Date().toISOString()}`,
    '',
    '## Summary',
    '',
    `- **Total products analyzed:** ${summary.totalProducts}`,
    `- **🟢 High confidence:** ${summary.highConfidence}`,
    `- **🟡 Medium confidence:** ${summary.mediumConfidence}`,
    `- **🔴 Low confidence:** ${summary.lowConfidence}`,
    `- **🔍 Needs manual check:** ${summary.needsManualCheck}`,
    '',
    '## Issues by Type',
    '',
  ];

  if (Object.keys(summary.issuesByType).length === 0) {
    report.push('✅ No issues found in analysis!');
  } else {
    Object.entries(summary.issuesByType)
      .sort(([,a], [,b]) => b - a)
      .forEach(([issue, count]) => {
        report.push(`- ${issue}: ${count} products`);
      });
  }

  report.push('', '## Products Needing Manual Verification', '');

  const manualCheckProducts = summary.results.filter(r => r.needsManualCheck);
  if (manualCheckProducts.length === 0) {
    report.push('✅ No products need manual verification!');
  } else {
    manualCheckProducts.forEach(result => {
      report.push(`### ${result.ingredient}`);
      report.push(`- **Product:** ${result.productName}`);
      report.push(`- **ASIN:** ${result.asin}`);
      report.push(`- **URL:** ${result.url}`);
      report.push(`- **Vet Note:** ${result.vetNote}`);
      report.push(`- **Confidence:** ${result.analysis.confidence}`);
      if (result.analysis.issues.length > 0) {
        report.push(`- **Issues:** ${result.analysis.issues.join(', ')}`);
      }
      report.push('');
    });
  }

  return report.join('\n');
}

// Save detailed results to JSON
function saveDetailedResults(summary: AnalysisSummary): void {
  const outputPath = path.join(__dirname, '../data/asin-analysis-results.json');
  fs.writeFileSync(outputPath, JSON.stringify(summary, null, 2));
  console.log(`📄 Detailed results saved to: ${outputPath}`);
}

// Main execution
function main() {
  console.log('🚀 ASIN Accuracy Analysis\n');
  console.log('='.repeat(60));

  try {
    const summary = analyzeASINAccuracy();

    console.log('\n' + '='.repeat(60));
    console.log('📊 ANALYSIS SUMMARY\n');

    console.log(`Total products analyzed: ${summary.totalProducts}`);
    console.log(`🟢 High confidence: ${summary.highConfidence}`);
    console.log(`🟡 Medium confidence: ${summary.mediumConfidence}`);
    console.log(`🔴 Low confidence: ${summary.lowConfidence}`);
    console.log(`🔍 Needs manual check: ${summary.needsManualCheck}`);

    // Generate and save report
    const report = generateReport(summary);
    const reportPath = path.join(__dirname, '../ASIN_ACCURACY_REPORT.md');
    fs.writeFileSync(reportPath, report);

    console.log(`\n📄 Report saved to: ${reportPath}`);
    saveDetailedResults(summary);

    if (summary.needsManualCheck > 0) {
      console.log('\n⚠️  PRODUCTS NEED MANUAL VERIFICATION - Check the report for details');
      process.exit(1);
    } else {
      console.log('\n✅ All products passed analysis - no manual checks needed!');
      process.exit(0);
    }

  } catch (error) {
    console.error('❌ Error running analysis:', error);
    process.exit(1);
  }
}

// Run verification
main();

