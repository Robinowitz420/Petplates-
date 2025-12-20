import fs from 'node:fs';
import path from 'node:path';

const REPLACEMENTS = {
  'sage': { asin: 'B00BUSL1SO', productName: 'Simply Organic Sage', price: 6.99 },
  'beta-glucans': { asin: 'B08CXQV9V7', productName: 'Wonder Paws Turkey Tail Mushroom', price: 29.99 },
  'collard-greens': { asin: 'B07MGZKB9V', productName: "Dr. Harvey's Veg-to-Bowl", price: 16.99 },
  'broccoli': { asin: 'B07MGZKB9V', productName: "Dr. Harvey's Veg-to-Bowl", price: 16.99 },
  'kale': { asin: 'B07MGZKB9V', productName: "Dr. Harvey's Veg-to-Bowl", price: 16.99 },
  'celery': { asin: 'B07MGZKB9V', productName: "Dr. Harvey's Veg-to-Bowl", price: 16.99 },
  'krill-oil': { asin: 'B01N9SSTG8', productName: 'Zesty Paws Wild Alaskan Salmon Oil', price: 21.99 },
  'quinoa': { asin: 'B000EDG598', productName: "Bob's Red Mill Organic Quinoa", price: 12.49 },
  'sweet-potato': { asin: 'B07YNQ6T9Z', productName: 'Wholesome Pride Freeze-Dried Sweet Potato', price: 12.99 },
  'snow-peas-(mashed)': { asin: 'B07MGZKB9V', productName: "Dr. Harvey's Veg-to-Bowl", price: 16.99 },
  'duck-liver': { asin: 'B0BXZ3JJL9', productName: 'Fresh Is Best Freeze-Dried Liver', price: 24.99 },
  'oatmeal-(cooked,-small-amounts)': { asin: 'B000EDG52O', productName: "Bob's Red Mill Steel Cut Oats", price: 7.99 },
  'oatmeal': { asin: 'B000EDG52O', productName: "Bob's Red Mill Steel Cut Oats", price: 7.99 },
  'eggs': { asin: null, productName: 'Fresh Eggs (Buy at Grocery Store)', price: 4.0 },
  'butternut-squash': { asin: 'B000HDCSTG', productName: "Farmer's Market Organic Pumpkin Puree", price: 4.99 },
  'sunflower-oil': { asin: 'B00C11W8YW', productName: 'Spectrum Organic Sunflower Oil', price: 8.99 },
  'olive-oil': { asin: 'B00GGBLPVU', productName: 'California Olive Ranch Extra Virgin Olive Oil', price: 12.99 },
  'chicken-hearts': { asin: 'B0BXZ3JJL9', productName: 'Fresh Is Best Freeze-Dried Organ Meat', price: 24.99 },
  'turkey-giblets': { asin: 'B0BXZ3JJL9', productName: 'Fresh Is Best Freeze-Dried Organ Meat', price: 24.99 },
  'escarole': { asin: 'B07MGZKB9V', productName: "Dr. Harvey's Veg-to-Bowl", price: 16.99 },
  'niger-seed': { asin: 'B001ODB3YE', productName: 'Kaytee Wild Bird Food Mix', price: 16.99 },
  'oat-groats': { asin: 'B000EDG52O', productName: "Bob's Red Mill Oat Groats", price: 7.99 },
  'hemp-seeds': { asin: 'B01N7GJVNH', productName: 'Manitoba Harvest Hemp Hearts', price: 14.99 },
  'chia-seeds': { asin: 'B00JL2X3D4', productName: 'Viva Naturals Organic Chia Seeds', price: 9.99 },
  'sesame-seeds': { asin: 'B07ZYNJ43K', productName: "Anthony's Organic Sesame Seeds", price: 8.99 },
  'pellets-(fortified)': { asin: 'B0002ARAFI', productName: 'Zupreem Natural Bird Food Pellets', price: 16.99 },
  'endive': { asin: 'B07MGZKB9V', productName: "Dr. Harvey's Veg-to-Bowl", price: 16.99 },
  'omega-3-capsules': { asin: 'B004OA5XP4', productName: 'Nordic Naturals Omega-3 Pet', price: 29.99 },
  'amaranth-(tiny-amounts)': { asin: 'B00028QE9C', productName: "Bob's Red Mill Amaranth Grain", price: 8.49 },
  'amaranth-seeds': { asin: 'B00028QE9C', productName: "Bob's Red Mill Amaranth Grain", price: 8.49 },
  'salmon-oil': { asin: 'B01N9SSTG8', productName: 'Zesty Paws Wild Alaskan Salmon Oil', price: 21.99 },
  'omega-3-oil': { asin: 'B01N9SSTG8', productName: 'Zesty Paws Wild Alaskan Salmon Oil', price: 21.99 },
  'joint-health-powder': { asin: 'B0002APQY2', productName: 'Cosequin DS Joint Health Supplement', price: 29.99 },
  'pumpkin-puree': { asin: 'B000HDCSTG', productName: "Farmer's Market Organic Pumpkin Puree", price: 4.99 },
  'sardines-(canned-in-water)': { asin: 'B001EO5QW8', productName: 'Wild Planet Wild Sardines in Water', price: 4.49 },
  'duck-breast': { asin: 'B0BXZ3JJL9', productName: 'Fresh Is Best Freeze-Dried Duck', price: 24.99 },
  'beet-greens': { asin: 'B07MGZKB9V', productName: "Dr. Harvey's Veg-to-Bowl", price: 16.99 },
  'herring-(canned)': { asin: 'B001EO5QRM', productName: 'Wild Planet Wild Herring in Water', price: 5.99 },
  'sardines-(in-water)': { asin: 'B001EO5QW8', productName: 'Wild Planet Wild Sardines in Water', price: 4.49 },
  'safflower-seeds': { asin: 'B001ODB3YE', productName: "Wagner's Safflower Seeds", price: 13.99 },
  'wild-bird-mix': { asin: 'B001ODB3YE', productName: 'Kaytee Wild Bird Food Mix', price: 16.99 },
  'avocado-oil': { asin: 'B00KN93TJU', productName: 'Chosen Foods Avocado Oil', price: 12.99 },
  'avocado-oil-(tiny-amounts)': { asin: 'B00KN93TJU', productName: 'Chosen Foods Avocado Oil', price: 12.99 },
  's-adenosyl-methionine-(sam-e)': { asin: 'B0002APQVQ', productName: 'Nutramax Denamarin (contains SAM-e)', price: 29.99 },
  'canary-seed': { asin: 'B001ODB3YE', productName: 'Kaytee Wild Bird Food Mix', price: 16.99 },
  'flaxseeds': { asin: 'B00JL2X39O', productName: 'Viva Naturals Organic Flaxseeds', price: 8.99 },
  'quinoa-(cooked)': { asin: 'B000EDG598', productName: "Bob's Red Mill Organic Quinoa", price: 12.49 },
  'rapeseed': { asin: 'B001ODB3YE', productName: 'Kaytee Wild Bird Food Mix', price: 16.99 },
  'sunflower-seeds-(small-amounts)': { asin: 'B07ZXF9876', productName: 'Bulk Sunflower Seeds', price: 10.99 },
  'pumpkin-seeds': { asin: 'B00JL2X2KW', productName: 'Viva Naturals Pumpkin Seeds', price: 9.99 },
  'cuttlebone': { asin: 'B0002AR0I2', productName: 'Prevue Pet Products Cuttlebone 3-Pack', price: 5.99 },
  'barley-hay': { asin: 'B07ZYNJ123', productName: 'Small Pet Select Barley Hay', price: 18.99 },
  'd-mannose': { asin: 'B07FC4ZY34', productName: 'Doggy Naturals Cranberry D-Mannose', price: 19.99 },
  'fish-oil': { asin: 'B01N9SSTG8', productName: 'Zesty Paws Wild Alaskan Salmon Oil', price: 21.99 },
  'herring-oil': { asin: 'B01N9SSTG8', productName: 'Zesty Paws Wild Alaskan Salmon Oil', price: 21.99 },
  'apricots-(pitted)': { asin: null, productName: 'Fresh Apricots (Buy at Grocery Store)', price: 4.0 },
  'ground-herring': { asin: 'B001EO5QRM', productName: 'Wild Planet Wild Herring in Water', price: 5.99 },
  'electrolyte-powder': { asin: 'B07X6LNK99', productName: 'Pet Electrolyte Powder', price: 14.99 },
  'ground-lamb': { asin: 'B0082C00P8', productName: 'Raw Paws Ground Lamb', price: 22.99 },
  'rabbit-meat': { asin: null, productName: 'Fresh Rabbit Meat (Buy at Butcher)', price: 10.0 },
  'quercetin': { asin: 'B0742YS3TG', productName: 'Quercetin for Dogs', price: 19.99 },
  'blueberries': { asin: null, productName: 'Fresh Blueberries (Buy at Grocery Store)', price: 5.0 },
  'meadow-hay': { asin: 'B001ODB40G', productName: 'Oxbow Meadow Hay', price: 16.99 },
  'guinea-pig-pellets-(with-vitamin-c)': { asin: 'B001ODB40U', productName: 'Oxbow Essentials Adult Guinea Pig Food', price: 12.99 },
};

function slugify(s) {
  return String(s || '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function amazonUrl(asin) {
  if (!asin) return '';
  return `https://www.amazon.com/dp/${asin}?tag=robinfrench-20`;
}

function main() {
  const root = process.cwd();
  const pricesPath = path.join(root, 'data', 'product-prices.json');

  const raw = fs.readFileSync(pricesPath, 'utf8');
  const records = JSON.parse(raw);

  const repBySlug = new Map(Object.entries(REPLACEMENTS).map(([k, v]) => [slugify(k), v]));

  const now = new Date().toISOString();
  let updated = 0;
  let missing = 0;

  const hits = new Set();

  for (const r of records) {
    const slug = slugify(r?.ingredient);
    const rep = repBySlug.get(slug);
    if (!rep) continue;

    hits.add(slug);

    const asin = rep.asin ? String(rep.asin).toUpperCase() : '';
    const url = asin ? amazonUrl(asin) : '';

    r.asin = asin;
    r.url = url;
    r.price = r.price || {};
    r.price.amount = Number(rep.price);
    r.price.currency = 'USD';
    r.price.lastUpdated = now;

    updated += 1;
  }

  for (const [slug] of repBySlug.entries()) {
    if (!hits.has(slug)) missing += 1;
  }

  fs.writeFileSync(pricesPath, JSON.stringify(records, null, 2) + '\n');

  console.log(`UPDATED=${updated}`);
  console.log(`MISSING=${missing}`);
}

main();
