// extract-asins.js

// Fully automated ASIN extractor for your ingredient links

// Run: node scripts/extract-asins.js

const fs = require('fs');
const https = require('https');
const path = require('path');

// ============================================
// CONFIGURATION
// ============================================

const INPUT_FILE = path.join(__dirname, '../lib/data/vetted-products.ts'); // Your vetted products file
const OUTPUT_FILE = path.join(__dirname, '../asins-extracted.json');        // Output file
const DELAY_MS = 2000;                               // Delay between requests (avoid rate limiting)

// ============================================
// STEP 1: Extract ASIN from URL (Fast - No Scraping)
// ============================================

function extractASINFromURL(url) {
  if (!url || typeof url !== 'string') return null;
  
  const patterns = [
    /\/dp\/([A-Z0-9]{10})/,
    /\/product\/([A-Z0-9]{10})/,
    /\/gp\/product\/([A-Z0-9]{10})/,
    /[?&]ASIN=([A-Z0-9]{10})/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  
  return null;
}

// ============================================
// STEP 2: Scrape ASIN from Search Results (Slow)
// ============================================

function fetchASINFromSearchURL(url) {
  return new Promise((resolve) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      }
    }, (res) => {
      let data = '';
      
      res.on('data', chunk => data += chunk);
      
      res.on('end', () => {
        // Try multiple patterns to find ASIN
        const patterns = [
          /data-asin="([A-Z0-9]{10})"/,
          /\/dp\/([A-Z0-9]{10})/,
          /asin["\s]*[:=]["\s]*([A-Z0-9]{10})/i,
          /"asin":"([A-Z0-9]{10})"/,
        ];
        
        for (const pattern of patterns) {
          const match = data.match(pattern);
          if (match) {
            resolve(match[1]);
            return;
          }
        }
        
        resolve(null);
      });
    }).on('error', (err) => {
      console.error('  ⚠️  Fetch error:', err.message);
      resolve(null);
    });
  });
}

// ============================================
// STEP 3: Process All Links with Smart Logic
// ============================================

async function extractAllASINs(amazonLinks) {
  const results = [];
  const progressFile = OUTPUT_FILE.replace('.json', '-progress.json');
  
  // Try to load previous progress
  let startIndex = 0;
  if (fs.existsSync(progressFile)) {
    try {
      const progress = JSON.parse(fs.readFileSync(progressFile, 'utf8'));
      results.push(...progress.results);
      startIndex = progress.lastIndex + 1;
      console.log(`📂 Resuming from item ${startIndex + 1}/${amazonLinks.length}`);
    } catch (e) {
      console.log('⚠️  Could not load progress, starting fresh');
    }
  }
  
  for (let i = startIndex; i < amazonLinks.length; i++) {
    const item = amazonLinks[i];
    console.log(`\n[${i + 1}/${amazonLinks.length}] ${item.name}`);
    
    try {
      // Try URL pattern first (instant)
      let asin = extractASINFromURL(item.link);
      
      if (asin) {
        console.log(`  ✅ Found ASIN in URL: ${asin}`);
        results.push({ ...item, asin, method: 'url' });
      } else {
        // It's a search link - fetch the page
        console.log(`  🔍 Search link detected, fetching...`);
        
        await new Promise(resolve => setTimeout(resolve, DELAY_MS));
        asin = await fetchASINFromSearchURL(item.link);
        
        if (asin) {
          console.log(`  ✅ Extracted ASIN from page: ${asin}`);
          results.push({ ...item, asin, method: 'scrape' });
        } else {
          console.log(`  ❌ Could not find ASIN`);
          results.push({ ...item, asin: null, method: 'failed' });
        }
      }
      
      // Save progress every 10 items
      if ((i + 1) % 10 === 0) {
        fs.writeFileSync(progressFile, JSON.stringify({
          lastIndex: i,
          results: results
        }, null, 2));
        console.log(`  💾 Progress saved (${i + 1}/${amazonLinks.length})`);
      }
    } catch (error) {
      console.error(`  ⚠️  Error processing ${item.name}:`, error.message);
      results.push({ ...item, asin: null, method: 'error', error: error.message });
    }
  }
  
  // Clean up progress file on completion
  if (fs.existsSync(progressFile)) {
    fs.unlinkSync(progressFile);
  }
  
  return results;
}

// ============================================
// STEP 4: Parse Your Vetted Products File
// ============================================

function parseVettedProductsFile() {
  try {
    const content = fs.readFileSync(INPUT_FILE, 'utf8');
    
    // Extract all amazonLink entries with their ingredient names
    // Pattern: 'ingredient name': { ... amazonLink: 'url' ... }
    const entries = [];
    
    // Match ingredient entries: 'key': { ... amazonLink: 'value' ... }
    const entryPattern = /'([^']+)':\s*\{[^}]*amazonLink:\s*['"]([^'"]+)['"]/g;
    let match;
    
    while ((match = entryPattern.exec(content)) !== null) {
      const ingredientName = match[1];
      const amazonLink = match[2];
      
      entries.push({
        name: ingredientName,
        link: amazonLink
      });
    }
    
    // Also try to get productName if available
    const detailedPattern = /'([^']+)':\s*\{([^}]+)\}/gs;
    let detailedMatch;
    const detailedEntries = [];
    
    while ((detailedMatch = detailedPattern.exec(content)) !== null) {
      const ingredientName = detailedMatch[1];
      const entryContent = detailedMatch[2];
      
      const linkMatch = entryContent.match(/amazonLink:\s*['"]([^'"]+)['"]/);
      const productMatch = entryContent.match(/productName:\s*['"]([^'"]+)['"]/);
      
      if (linkMatch) {
        detailedEntries.push({
          name: ingredientName,
          productName: productMatch ? productMatch[1] : ingredientName,
          link: linkMatch[1]
        });
      }
    }
    
    // Use detailed entries if we found them, otherwise use simple entries
    return detailedEntries.length > 0 ? detailedEntries : entries;
  } catch (error) {
    console.error('Error reading file:', error.message);
    return [];
  }
}

// ============================================
// STEP 5: Save Results
// ============================================

function saveResults(results) {
  // Save as JSON
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2));
  console.log(`\n✅ Saved ${results.length} results to ${OUTPUT_FILE}`);
  
  // Also save as CSV for easy viewing
  const csvFile = OUTPUT_FILE.replace('.json', '.csv');
  const csv = [
    'Ingredient Name,Product Name,Amazon Link,ASIN,Extraction Method',
    ...results.map(r => 
      `"${r.name || ''}","${r.productName || ''}","${r.link}","${r.asin || 'NOT_FOUND'}","${r.method || 'unknown'}"`
    )
  ].join('\n');
  
  fs.writeFileSync(csvFile, csv);
  console.log(`✅ Also saved CSV to ${csvFile}`);
  
  // Statistics
  const found = results.filter(r => r.asin).length;
  const fromURL = results.filter(r => r.method === 'url').length;
  const fromScrape = results.filter(r => r.method === 'scrape').length;
  const failed = results.filter(r => !r.asin).length;
  
  console.log('\n📊 STATISTICS:');
  console.log(`  Total processed: ${results.length}`);
  console.log(`  ✅ Found ASINs: ${found} (${Math.round(found/results.length*100)}%)`);
  console.log(`     - From URL: ${fromURL}`);
  console.log(`     - From scraping: ${fromScrape}`);
  console.log(`  ❌ Failed: ${failed}`);
  
  // Show failed ones
  if (failed > 0) {
    console.log('\n❌ Failed to extract ASINs:');
    results.filter(r => !r.asin).forEach(r => {
      console.log(`  - ${r.name}: ${r.link.substring(0, 80)}...`);
    });
  }
}

// ============================================
// MAIN EXECUTION
// ============================================

async function main() {
  console.log('🚀 Starting ASIN extraction...\n');
  console.log(`📁 Input file: ${INPUT_FILE}`);
  console.log(`📁 Output file: ${OUTPUT_FILE}\n`);
  
  // Parse vetted products file
  console.log('📖 Reading vetted products file...');
  const ingredients = parseVettedProductsFile();
  
  if (ingredients.length === 0) {
    console.error('❌ No ingredients found. Check INPUT_FILE path.');
    console.error(`   Looking for: ${INPUT_FILE}`);
    process.exit(1);
  }
  
  console.log(`✅ Found ${ingredients.length} ingredient links\n`);
  
  // Extract ASINs
  const results = await extractAllASINs(ingredients);
  
  // Save results
  saveResults(results);
  
  console.log('\n✨ Done!');
  console.log(`\n💡 Next steps:`);
  console.log(`   1. Review ${OUTPUT_FILE.replace(path.join(__dirname, '../'), '')}`);
  console.log(`   2. Update vetted-products.ts with direct ASIN links`);
  console.log(`   3. Replace search URLs with: https://amazon.com/dp/ASIN?tag=robinfrench-20`);
}

// Run it
main().catch(console.error);

