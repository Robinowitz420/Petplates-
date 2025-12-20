import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

const args = new Set(process.argv.slice(2));
const getArgValue = (name, fallback) => {
  const raw = process.argv.find((a) => a.startsWith(`${name}=`));
  if (!raw) return fallback;
  const v = raw.slice(name.length + 1);
  return v.length ? v : fallback;
};

const shouldFetchTitles = args.has('--fetch-titles');
const maxFetch = Number(getArgValue('--max-fetch', '60')) || 60;
const fetchDelayMs = Number(getArgValue('--fetch-delay-ms', '1500')) || 1500;

const vettedPath = path.join(root, 'lib', 'data', 'vetted-products.ts');
const pricesPath = path.join(root, 'data', 'product-prices.json');
const allIngredientsPath = path.join(root, 'lib', 'utils', 'allIngredients.ts');
const recipesCompletePath = path.join(root, 'lib', 'data', 'recipes-complete.ts');

function readText(p) {
  return fs.readFileSync(p, 'utf8');
}

function normalizeKey(s) {
  return String(s || '').toLowerCase().trim();
}

function normalizeDisplay(s) {
  return String(s || '')
    .toLowerCase()
    .trim()
    .replace(/\s*\([^)]*\)\s*/g, '')
    .replace(/\s+/g, ' ')
    .replace(/[’]/g, "'");
}

function extractAsinFromAmazonUrl(url) {
  if (!url) return null;
  const m = String(url).match(/\/(?:dp|gp\/product)\/([A-Z0-9]{10})/);
  return m ? m[1] : null;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function stripHtml(s) {
  return String(s || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[’]/g, "'")
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function computeTitleSignals(key, title) {
  const keyTokens = new Set(tokenize(normalizeDisplay(key)));
  const titleTokens = new Set(tokenize(title));

  const missing = [];
  for (const t of keyTokens) {
    if (t.length < 3) continue;
    if (!titleTokens.has(t)) missing.push(t);
  }

  const hasJerkySignal = titleTokens.has('jerky');
  const hasTreatSignal = titleTokens.has('treat') || titleTokens.has('treats');
  const hasSupplementSignal =
    titleTokens.has('supplement') || titleTokens.has('supplements') || titleTokens.has('capsules') || titleTokens.has('tablets');

  const mismatchScore = Math.min(10, missing.length) + (hasJerkySignal ? 5 : 0);

  return {
    missingKeyTokens: missing.slice(0, 12),
    mismatchScore,
    hasJerkySignal,
    hasTreatSignal,
    hasSupplementSignal,
  };
}

async function fetchAmazonTitleByAsin(asin) {
  const url = `https://www.amazon.com/dp/${asin}`;
  const res = await fetch(url, {
    redirect: 'follow',
    headers: {
      'user-agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'accept-language': 'en-US,en;q=0.9',
      accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
  });

  const status = res.status;
  const text = await res.text();

  const og = text.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["'][^>]*>/i);
  const titleTag = text.match(/<title>([\s\S]*?)<\/title>/i);
  const candidate = (og?.[1] || titleTag?.[1] || '').trim();
  const title = stripHtml(candidate);

  return { url, status, title };
}

function parseAllIngredientsStrings(allIngredientsTs) {
  // This file is mostly string literals; extracting all '...' strings is good enough for membership checks.
  const set = new Set();
  const strRe = /'([^']+)'/g;
  let m;
  while ((m = strRe.exec(allIngredientsTs))) {
    const v = m[1];
    if (!v || v.length < 2) continue;
    set.add(normalizeDisplay(v));
  }
  return set;
}

function parseRecipeIngredientNames(recipesCompleteTs) {
  // Extract occurrences like: name: 'Ground Chicken'
  const set = new Set();
  const nameRe = /\bname\s*:\s*'([^']+)'/g;
  let m;
  while ((m = nameRe.exec(recipesCompleteTs))) {
    const v = m[1];
    if (!v || v.length < 2) continue;
    set.add(normalizeDisplay(v));
  }
  return set;
}

function parseVettedProducts(vettedTs) {
  // Parse object entries:
  //  'ground chicken': {
  //    productName: '...'
  //    amazonLink: '...'
  //  },
  const entries = [];
  const entryRe = /\n\s*'([^']+)'\s*:\s*\{([\s\S]*?)\n\s*\},/g;
  let m;
  while ((m = entryRe.exec(vettedTs))) {
    const key = m[1];
    const block = m[2];

    const productNameMatch = block.match(/productName:\s*'([^']+)'|productName:\s*\"([^\"]+)\"/);
    const amazonLinkMatch = block.match(/amazonLink:\s*'([^']+)'|amazonLink:\s*\"([^\"]+)\"/);

    const productName = productNameMatch ? (productNameMatch[1] || productNameMatch[2] || '') : '';
    const amazonLink = amazonLinkMatch ? (amazonLinkMatch[1] || amazonLinkMatch[2] || '') : '';
    const asin = extractAsinFromAmazonUrl(amazonLink);

    entries.push({
      key,
      keyNorm: normalizeKey(key),
      productName,
      amazonLink,
      asin,
    });
  }
  return entries;
}

async function main() {
  const vettedTs = readText(vettedPath);
  const allIngredientsTs = readText(allIngredientsPath);
  const recipesCompleteTs = readText(recipesCompletePath);

  const prices = JSON.parse(readText(pricesPath));

  const allIngredientsSet = parseAllIngredientsStrings(allIngredientsTs);
  const recipeIngredientsSet = parseRecipeIngredientNames(recipesCompleteTs);
  const vettedEntries = parseVettedProducts(vettedTs);

  const asinToIngredientsFromPrices = new Map();
  for (const p of prices) {
    const asin = String(p?.asin || '').toUpperCase();
    const ingredient = normalizeKey(p?.ingredient);
    if (!asin || asin.length !== 10 || !ingredient) continue;
    if (!asinToIngredientsFromPrices.has(asin)) asinToIngredientsFromPrices.set(asin, new Set());
    asinToIngredientsFromPrices.get(asin).add(ingredient);
  }

  const asinToKeys = new Map();
  for (const e of vettedEntries) {
    if (!e.asin) continue;
    if (!asinToKeys.has(e.asin)) asinToKeys.set(e.asin, []);
    asinToKeys.get(e.asin).push(e.key);
  }

  const flags = [];

  const asinTitleCache = new Map();
  let fetchedCount = 0;

  for (const e of vettedEntries) {
    const problems = [];

    // Compare against canonical ingredient catalogs (not productName)
    const inAllIngredients = allIngredientsSet.has(normalizeDisplay(e.key));
    const inRecipes = recipeIngredientsSet.has(normalizeDisplay(e.key));
    if (!inAllIngredients && !inRecipes) {
      problems.push('key_not_in_ingredient_catalogs');
    }

    if (!e.amazonLink) problems.push('missing_amazonLink');
    if (e.amazonLink && !e.amazonLink.includes('amazon.com')) problems.push('non_amazon_url');
    if (e.amazonLink && e.amazonLink.includes('/s?')) problems.push('search_url_not_dp');
    if (e.amazonLink && !e.amazonLink.includes('tag=robinfrench-20')) problems.push('missing_affiliate_tag');
    if (!e.asin) problems.push('no_asin_in_url');

    if (e.asin) {
      const expected = asinToIngredientsFromPrices.get(e.asin);
      if (expected && !expected.has(e.keyNorm)) problems.push('asin_mismatch_vs_product_prices_json');
      const dupKeys = asinToKeys.get(e.asin) || [];
      if (dupKeys.length > 1) problems.push(`asin_shared_with_${dupKeys.length}_keys`);
    }

    let fetched = null;
    let titleSignals = null;
    if (shouldFetchTitles && e.asin) {
      if (asinTitleCache.has(e.asin)) {
        fetched = asinTitleCache.get(e.asin);
      } else if (fetchedCount < maxFetch) {
        try {
          if (fetchedCount > 0) await sleep(fetchDelayMs);
          fetched = await fetchAmazonTitleByAsin(e.asin);
          fetchedCount += 1;
          asinTitleCache.set(e.asin, fetched);
        } catch (err) {
          fetched = { url: `https://www.amazon.com/dp/${e.asin}`, status: 0, title: '' };
          asinTitleCache.set(e.asin, fetched);
        }
      }

      if (fetched?.title) {
        titleSignals = computeTitleSignals(e.key, fetched.title);
        if (titleSignals.mismatchScore >= 7) problems.push('title_mismatch_suspected');
        if (titleSignals.hasJerkySignal) problems.push('title_contains_jerky');
      }
    }

    if (problems.length) {
      flags.push({
        key: e.key,
        asin: e.asin,
        amazonLink: e.amazonLink,
        productName: e.productName,
        fetchedTitle: fetched?.title || '',
        fetchedStatus: fetched?.status ?? null,
        fetchedUrl: fetched?.url || '',
        titleSignals,
        problems,
      });
    }
  }

  const severity = (p) => {
    if (p.startsWith('asin_shared_with_')) return 3;
    if (p === 'asin_mismatch_vs_product_prices_json') return 3;
    if (p === 'search_url_not_dp') return 2;
    if (p === 'no_asin_in_url') return 2;
    if (p === 'missing_amazonLink') return 2;
    if (p === 'missing_affiliate_tag') return 1;
    if (p === 'key_not_in_ingredient_catalogs') return 1;
    return 1;
  };

  flags.sort((a, b) => {
    const sa = a.problems.reduce((s, p) => s + severity(p), 0);
    const sb = b.problems.reduce((s, p) => s + severity(p), 0);
    return sb - sa;
  });

  const dupList = [];
  for (const [asin, keys] of asinToKeys.entries()) {
    if (keys.length > 1) dupList.push({ asin, keys });
  }
  dupList.sort((a, b) => b.keys.length - a.keys.length);

  console.log('=== Amazon Link Audit ===');
  console.log('Vetted entries parsed:', vettedEntries.length);
  console.log('Unique ALL_INGREDIENTS strings:', allIngredientsSet.size);
  console.log('Unique recipes-complete ingredient names:', recipeIngredientsSet.size);
  console.log('Flagged vetted entries:', flags.length);
  console.log('Duplicate ASINs:', dupList.length);
  if (shouldFetchTitles) {
    console.log('Fetched Amazon titles:', fetchedCount);
  }

  console.log('\n=== Top 60 suspicious entries ===');
  for (const f of flags.slice(0, 60)) {
    console.log(`- ${f.key} | ASIN=${f.asin || ''} | ${f.problems.join(', ')} | ${f.amazonLink || ''}`);
  }

  console.log('\n=== Top ASIN duplicates (first 30) ===');
  for (const d of dupList.slice(0, 30)) {
    console.log(`- ${d.asin} -> ${d.keys.length} keys: ${d.keys.join(' | ')}`);
  }

  // Write machine-readable report
  const outPath = path.join(root, 'data', 'amazon-link-audit-report.json');
  fs.writeFileSync(
    outPath,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        flags,
        duplicates: dupList,
        fetchTitles: shouldFetchTitles,
        fetchConfig: shouldFetchTitles ? { maxFetch, fetchDelayMs } : null,
      },
      null,
      2
    )
  );
  console.log(`\nWrote JSON report: ${outPath}`);
}

main();
