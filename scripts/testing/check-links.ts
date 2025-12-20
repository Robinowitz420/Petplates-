/**
 * AMAZON LINK VALIDATOR
 * Checks all 292 ingredient links for:
 * 1. HTTP 200 (valid) vs 404 (broken)
 * 2. Product title matches ingredient name
 * 3. ASIN format is correct
 * 
 * Usage:
 * 1. Save as check-links.ts
 * 2. Run: npx tsx check-links.ts
 * 3. Review output: broken-links-report.json
 */

import fs from 'fs';

interface IngredientLink {
  id: number;
  ingredient: string;
  product: string;
  category: string;
  link: string;
  asin: string;
}

// Parse your markdown file
function parseIngredientLinks(mdContent: string): IngredientLink[] {
  const ingredients: IngredientLink[] = [];
  const sections = mdContent.split('\n## ');
  
  sections.forEach(section => {
    if (!section.trim()) return;
    
    const lines = section.split('\n').filter(l => l.trim());
    if (lines.length < 4) return;
    
    const idMatch = lines[0].match(/^(\d+)\.\s*(.+)$/);
    if (!idMatch) return;
    
    const id = parseInt(idMatch[1]);
    const ingredient = idMatch[2].trim();
    
    let product = '';
    let category = '';
    let link = '';
    let asin = '';
    
    lines.forEach(line => {
      if (line.startsWith('- **Product:**')) {
        product = line.replace('- **Product:**', '').trim();
      } else if (line.startsWith('- **Category:**')) {
        category = line.replace('- **Category:**', '').trim();
      } else if (line.startsWith('- **Link:**')) {
        link = line.replace('- **Link:**', '').trim();
      } else if (line.startsWith('- **ASIN:**')) {
        asin = line.replace('- **ASIN:**', '').trim();
      }
    });
    
    if (id && ingredient && link && asin) {
      ingredients.push({ id, ingredient, product, category, link, asin });
    }
  });
  
  return ingredients;
}

// Validate ASIN format
function validateASIN(asin: string): { valid: boolean; error?: string } {
  // Amazon ASINs are 10 characters: alphanumeric
  if (!asin || asin.length !== 10) {
    return { valid: false, error: `Invalid length (${asin.length}, need 10)` };
  }
  
  if (!/^[A-Z0-9]{10}$/.test(asin)) {
    return { valid: false, error: 'Contains invalid characters (need A-Z, 0-9 only)' };
  }
  
  return { valid: true };
}

// Check if link works (HEAD request to avoid downloading full page)
async function checkLink(url: string, retries = 2): Promise<{ 
  status: number; 
  valid: boolean; 
  error?: string;
  title?: string;
}> {
  try {
    // Use HEAD request first (faster)
    const headResponse = await fetch(url, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LinkChecker/1.0)',
      },
      redirect: 'follow',
    });
    
    if (headResponse.ok) {
      // Link works, but we need GET to check title
      const getResponse = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; LinkChecker/1.0)',
        },
      });
      
      const html = await getResponse.text();
      
      // Extract product title from Amazon page
      const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
      const title = titleMatch ? titleMatch[1].replace(' : Amazon.com', '').trim() : '';
      
      return { 
        status: getResponse.status, 
        valid: true,
        title
      };
    }
    
    // If HEAD failed, try GET (some servers block HEAD)
    if (!headResponse.ok && retries > 0) {
      console.log(`HEAD failed for ${url}, retrying with GET...`);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s
      
      const getResponse = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; LinkChecker/1.0)',
        },
      });
      
      if (getResponse.ok) {
        const html = await getResponse.text();
        const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
        const title = titleMatch ? titleMatch[1].replace(' : Amazon.com', '').trim() : '';
        
        return { 
          status: getResponse.status, 
          valid: true,
          title
        };
      }
      
      return { 
        status: getResponse.status, 
        valid: false, 
        error: `HTTP ${getResponse.status}` 
      };
    }
    
    return { 
      status: headResponse.status, 
      valid: false, 
      error: `HTTP ${headResponse.status}` 
    };
    
  } catch (error: any) {
    if (retries > 0) {
      console.log(`Error checking ${url}, retrying... (${retries} left)`);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s before retry
      return checkLink(url, retries - 1);
    }
    
    return { 
      status: 0, 
      valid: false, 
      error: error.message || 'Network error' 
    };
  }
}

// Check if product title matches ingredient
function checkTitleMatch(ingredient: string, title: string): { 
  matches: boolean; 
  similarity: number;
  reason?: string;
} {
  if (!title) return { matches: false, similarity: 0, reason: 'No title found' };
  
  const ingredientLower = ingredient.toLowerCase()
    .replace(/\(.*?\)/g, '') // Remove parentheses content
    .replace(/[^a-z0-9\s]/g, '') // Remove special chars
    .trim();
  
  const titleLower = title.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim();
  
  // Check if key words from ingredient are in title
  const ingredientWords = ingredientLower.split(/\s+/).filter(w => w.length > 2);
  const titleWords = new Set(titleLower.split(/\s+/));
  
  const matchedWords = ingredientWords.filter(word => titleWords.has(word));
  const similarity = matchedWords.length / ingredientWords.length;
  
  if (similarity >= 0.6) {
    return { matches: true, similarity };
  } else if (similarity >= 0.3) {
    return { 
      matches: false, 
      similarity, 
      reason: `Partial match (${Math.round(similarity * 100)}% similar)` 
    };
  } else {
    return { 
      matches: false, 
      similarity, 
      reason: `Poor match (${Math.round(similarity * 100)}% similar)` 
    };
  }
}

// Main validation function
async function validateAllLinks() {
  console.log('🔍 Starting Amazon link validation...\n');
  
  // Check if file exists
  const filePath = 'ALL_INGREDIENT_LINKS.md';
  if (!fs.existsSync(filePath)) {
    console.error(`❌ ERROR: Could not find ${filePath}`);
    console.error(`   Current directory: ${process.cwd()}`);
    console.error(`   Please run this script from the directory containing ALL_INGREDIENT_LINKS.md`);
    process.exit(1);
  }
  
  console.log(`✅ Found ${filePath}`);
  
  // Read markdown file
  let mdContent: string;
  try {
    mdContent = fs.readFileSync(filePath, 'utf-8');
    console.log(`✅ Read file (${mdContent.length} characters)\n`);
  } catch (error: any) {
    console.error(`❌ ERROR reading file: ${error.message}`);
    process.exit(1);
  }
  
  const ingredients = parseIngredientLinks(mdContent);
  
  console.log(`Found ${ingredients.length} ingredients to check\n`);
  
  const results = {
    total: ingredients.length,
    checked: 0,
    valid: 0,
    broken: 0,
    invalidASIN: 0,
    titleMismatch: 0,
    errors: [] as any[],
  };
  
  // Check each ingredient (with rate limiting)
  for (let i = 0; i < ingredients.length; i++) {
    const ing = ingredients[i];
    
    console.log(`[${i + 1}/${ingredients.length}] Checking: ${ing.ingredient}...`);
    
    // Validate ASIN format
    const asinCheck = validateASIN(ing.asin);
    if (!asinCheck.valid) {
      results.invalidASIN++;
      results.errors.push({
        ingredient: ing.ingredient,
        issue: 'Invalid ASIN',
        details: asinCheck.error,
        asin: ing.asin,
      });
      console.log(`  ❌ Invalid ASIN: ${asinCheck.error}\n`);
      continue;
    }
    
    // Check link
    const linkCheck = await checkLink(ing.link);
    results.checked++;
    
    if (!linkCheck.valid) {
      results.broken++;
      results.errors.push({
        ingredient: ing.ingredient,
        issue: 'Broken link',
        details: linkCheck.error,
        link: ing.link,
        status: linkCheck.status,
      });
      console.log(`  ❌ Link broken: ${linkCheck.error}\n`);
      continue;
    }
    
    // Check title match
    if (linkCheck.title) {
      const titleCheck = checkTitleMatch(ing.ingredient, linkCheck.title);
      if (!titleCheck.matches) {
        results.titleMismatch++;
        results.errors.push({
          ingredient: ing.ingredient,
          issue: 'Title mismatch',
          details: titleCheck.reason,
          expectedTitle: ing.ingredient,
          actualTitle: linkCheck.title,
          link: ing.link,
        });
        console.log(`  ⚠️  Title mismatch: ${titleCheck.reason}`);
        console.log(`      Expected: "${ing.ingredient}"`);
        console.log(`      Got: "${linkCheck.title}"\n`);
      } else {
        results.valid++;
        console.log(`  ✅ Valid (${Math.round(titleCheck.similarity * 100)}% match)\n`);
      }
    } else {
      results.valid++;
      console.log(`  ✅ Link works (couldn't verify title)\n`);
    }
    
    // Rate limiting: wait 500ms between requests to avoid being blocked
    if (i < ingredients.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  // Generate report
  console.log('\n' + '='.repeat(80));
  console.log('VALIDATION REPORT');
  console.log('='.repeat(80));
  console.log(`Total ingredients: ${results.total}`);
  console.log(`Checked: ${results.checked}`);
  console.log(`✅ Valid: ${results.valid} (${Math.round(results.valid / results.checked * 100)}%)`);
  console.log(`❌ Broken: ${results.broken}`);
  console.log(`⚠️  Invalid ASIN: ${results.invalidASIN}`);
  console.log(`⚠️  Title mismatch: ${results.titleMismatch}`);
  console.log(`\nTotal issues: ${results.errors.length}`);
  
  // Save detailed report
  fs.writeFileSync(
    'broken-links-report.json',
    JSON.stringify(results, null, 2)
  );
  
  console.log('\n📄 Detailed report saved to: broken-links-report.json');
  
  // Print summary of issues
  if (results.errors.length > 0) {
    console.log('\n' + '='.repeat(80));
    console.log('ISSUES FOUND:');
    console.log('='.repeat(80));
    
    results.errors.forEach((error, i) => {
      console.log(`\n${i + 1}. ${error.ingredient}`);
      console.log(`   Issue: ${error.issue}`);
      console.log(`   Details: ${error.details}`);
      if (error.link) console.log(`   Link: ${error.link}`);
    });
  }
  
  return results;
}

// Run validation
validateAllLinks()
  .then(results => {
    console.log('\n✅ Validation complete!');
    process.exit(results.errors.length > 0 ? 1 : 0);
  })
  .catch(error => {
    console.error('\n❌ Fatal error:', error);
    console.error(error.stack);
    process.exit(1);
  });