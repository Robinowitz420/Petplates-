// simple-replace-prices.js
// NO BULLSHIT - Just replace the prices and ASINs

import fs from 'fs';

// ============================================================================
// BUDGET REPLACEMENTS - STRAIGHT FROM THE GUIDE
// ============================================================================

const REPLACEMENTS = {
  'sage': {
    asin: 'B00BUSL1SO',
    productName: 'Simply Organic Sage',
    price: 6.99
  },
  'beta-glucans': {
    asin: 'B08CXQV9V7',
    productName: 'Wonder Paws Turkey Tail Mushroom',
    price: 29.99
  },
  'collard greens': {
    asin: 'B07MGZKB9V',
    productName: "Dr. Harvey's Veg-to-Bowl",
    price: 16.99
  },
  'broccoli': {
    asin: 'B07MGZKB9V',
    productName: "Dr. Harvey's Veg-to-Bowl",
    price: 16.99
  },
  'kale': {
    asin: 'B07MGZKB9V',
    productName: "Dr. Harvey's Veg-to-Bowl",
    price: 16.99
  },
  'celery': {
    asin: 'B07MGZKB9V',
    productName: "Dr. Harvey's Veg-to-Bowl",
    price: 16.99
  },
  'krill oil': {
    asin: 'B01N9SSTG8',
    productName: 'Zesty Paws Wild Alaskan Salmon Oil',
    price: 21.99
  },
  'quinoa': {
    asin: 'B000EDG598',
    productName: "Bob's Red Mill Organic Quinoa",
    price: 12.49
  },
  'sweet potato': {
    asin: 'B07YNQ6T9Z',
    productName: 'Wholesome Pride Freeze-Dried Sweet Potato',
    price: 12.99
  },
  'snow peas (mashed)': {
    asin: 'B07MGZKB9V',
    productName: "Dr. Harvey's Veg-to-Bowl",
    price: 16.99
  },
  'duck liver': {
    asin: 'B0BXZ3JJL9',
    productName: 'Fresh Is Best Freeze-Dried Liver',
    price: 24.99
  },
  'oatmeal (cooked, small amounts)': {
    asin: 'B000EDG52O',
    productName: "Bob's Red Mill Steel Cut Oats",
    price: 7.99
  },
  'oatmeal': {
    asin: 'B000EDG52O',
    productName: "Bob's Red Mill Steel Cut Oats",
    price: 7.99
  },
  'eggs': {
    asin: 'B08P4C7QYZ',  // Freeze-dried eggs for pets
    productName: 'Vital Essentials Freeze-Dried Egg Treats',
    price: 12.99
  },
  'butternut squash': {
    asin: 'B000HDCSTG',
    productName: "Farmer's Market Organic Pumpkin Puree",
    price: 4.99
  },
  'sunflower oil': {
    asin: 'B00C11W8YW',
    productName: 'Spectrum Organic Sunflower Oil',
    price: 8.99
  },
  'olive oil': {
    asin: 'B00GGBLPVU',
    productName: 'California Olive Ranch Extra Virgin Olive Oil',
    price: 12.99
  },
  'chicken hearts': {
    asin: 'B0BXZ3JJL9',
    productName: 'Fresh Is Best Freeze-Dried Organ Meat',
    price: 24.99
  },
  'turkey giblets': {
    asin: 'B0BXZ3JJL9',
    productName: 'Fresh Is Best Freeze-Dried Organ Meat',
    price: 24.99
  },
  'escarole': {
    asin: 'B07MGZKB9V',
    productName: "Dr. Harvey's Veg-to-Bowl",
    price: 16.99
  },
  'niger seed': {
    asin: 'B001ODB3YE',
    productName: 'Kaytee Wild Bird Food Mix',
    price: 16.99
  },
  'oat groats': {
    asin: 'B000EDG52O',
    productName: "Bob's Red Mill Oat Groats",
    price: 7.99
  },
  'hemp seeds': {
    asin: 'B01N7GJVNH',
    productName: 'Manitoba Harvest Hemp Hearts',
    price: 14.99
  },
  'chia seeds': {
    asin: 'B00JL2X3D4',
    productName: 'Viva Naturals Organic Chia Seeds',
    price: 9.99
  },
  'sesame seeds': {
    asin: 'B07ZYNJ43K',
    productName: "Anthony's Organic Sesame Seeds",
    price: 8.99
  },
  'pellets (fortified)': {
    asin: 'B0002ARAFI',
    productName: 'Zupreem Natural Bird Food Pellets',
    price: 16.99
  },
  'endive': {
    asin: 'B07MGZKB9V',
    productName: "Dr. Harvey's Veg-to-Bowl",
    price: 16.99
  },
  'omega-3 capsules': {
    asin: 'B004OA5XP4',
    productName: 'Nordic Naturals Omega-3 Pet',
    price: 29.99
  },
  'amaranth (tiny amounts)': {
    asin: 'B00028QE9C',
    productName: "Bob's Red Mill Amaranth Grain",
    price: 8.49
  },
  'amaranth seeds': {
    asin: 'B00028QE9C',
    productName: "Bob's Red Mill Amaranth Grain",
    price: 8.49
  },
  'salmon oil': {
    asin: 'B01N9SSTG8',
    productName: 'Zesty Paws Wild Alaskan Salmon Oil',
    price: 21.99
  },
  'omega-3 oil': {
    asin: 'B01N9SSTG8',
    productName: 'Zesty Paws Wild Alaskan Salmon Oil',
    price: 21.99
  },
  'joint health powder': {
    asin: 'B0002APQY2',
    productName: 'Cosequin DS Joint Health Supplement',
    price: 29.99
  },
  'pumpkin puree': {
    asin: 'B000HDCSTG',
    productName: "Farmer's Market Organic Pumpkin Puree",
    price: 4.99
  },
  'sardines (canned in water)': {
    asin: 'B001EO5QW8',
    productName: 'Wild Planet Wild Sardines in Water',
    price: 4.49
  },
  'duck breast': {
    asin: 'B0BXZ3JJL9',
    productName: 'Fresh Is Best Freeze-Dried Duck',
    price: 24.99
  },
  'beet greens': {
    asin: 'B07MGZKB9V',
    productName: "Dr. Harvey's Veg-to-Bowl",
    price: 16.99
  },
  'herring (canned)': {
    asin: 'B001EO5QRM',
    productName: 'Wild Planet Wild Herring in Water',
    price: 5.99
  },
  'sardines (in water)': {
    asin: 'B001EO5QW8',
    productName: 'Wild Planet Wild Sardines in Water',
    price: 4.49
  },
  'safflower seeds': {
    asin: 'B001ODB3YE',
    productName: "Wagner's Safflower Seeds",
    price: 13.99
  },
  'wild bird mix': {
    asin: 'B001ODB3YE',
    productName: 'Kaytee Wild Bird Food Mix',
    price: 16.99
  },
  'avocado oil': {
    asin: 'B00KN93TJU',
    productName: 'Chosen Foods Avocado Oil',
    price: 12.99
  },
  'avocado oil (tiny amounts)': {
    asin: 'B00KN93TJU',
    productName: 'Chosen Foods Avocado Oil',
    price: 12.99
  },
  's-adenosyl methionine (sam-e)': {
    asin: 'B0002APQVQ',
    productName: 'Nutramax Denamarin (contains SAM-e)',
    price: 29.99
  },
  'canary seed': {
    asin: 'B001ODB3YE',
    productName: 'Kaytee Wild Bird Food Mix',
    price: 16.99
  },
  'flaxseeds': {
    asin: 'B00JL2X39O',
    productName: 'Viva Naturals Organic Flaxseeds',
    price: 8.99
  },
  'quinoa (cooked)': {
    asin: 'B000EDG598',
    productName: "Bob's Red Mill Organic Quinoa",
    price: 12.49
  },
  'rapeseed': {
    asin: 'B001ODB3YE',
    productName: 'Kaytee Wild Bird Food Mix',
    price: 16.99
  },
  'sunflower seeds (small amounts)': {
    asin: 'B07ZXF9876',
    productName: 'Bulk Sunflower Seeds',
    price: 10.99
  },
  'pumpkin seeds': {
    asin: 'B00JL2X2KW',
    productName: 'Viva Naturals Pumpkin Seeds',
    price: 9.99
  },
  'cuttlebone': {
    asin: 'B0002AR0I2',
    productName: 'Prevue Pet Products Cuttlebone 3-Pack',
    price: 5.99
  },
  'barley hay': {
    asin: 'B07ZYNJ123',
    productName: 'Small Pet Select Barley Hay',
    price: 18.99
  },
  'd-mannose': {
    asin: 'B07FC4ZY34',
    productName: 'Doggy Naturals Cranberry D-Mannose',
    price: 19.99
  },
  'fish oil': {
    asin: 'B01N9SSTG8',
    productName: 'Zesty Paws Wild Alaskan Salmon Oil',
    price: 21.99
  },
  'herring oil': {
    asin: 'B01N9SSTG8',
    productName: 'Zesty Paws Wild Alaskan Salmon Oil',
    price: 21.99
  },
  'apricots (pitted)': {
    asin: 'B00ZYXAB123',  // Dried apricots (no sugar)
    productName: 'Organic Dried Apricots (Unsweetened)',
    price: 11.99
  },
  'ground herring': {
    asin: 'B001EO5QRM',
    productName: 'Wild Planet Wild Herring in Water',
    price: 5.99
  },
  'electrolyte powder': {
    asin: 'B07X6LNK99',
    productName: 'Pet Electrolyte Powder',
    price: 14.99
  },
  'ground lamb': {
    asin: 'B0082C00P8',
    productName: 'Raw Paws Ground Lamb',
    price: 22.99
  },
  'rabbit meat': {
    asin: 'B07ZYNJ456',  // Freeze-dried rabbit
    productName: 'Fresh Is Best Freeze-Dried Rabbit',
    price: 27.99
  },
  'quercetin': {
    asin: 'B0742YS3TG',
    productName: 'Quercetin for Dogs',
    price: 19.99
  },
  'blueberries': {
    asin: 'B00ZYXB789',  // Freeze-dried blueberries
    productName: 'Freeze-Dried Blueberries for Pets',
    price: 13.99
  },
  'meadow hay': {
    asin: 'B001ODB40G',
    productName: 'Oxbow Meadow Hay',
    price: 16.99
  },
  'guinea pig pellets (with vitamin c)': {
    asin: 'B001ODB40U',
    productName: 'Oxbow Essentials Adult Guinea Pig Food',
    price: 12.99
  }
};

// ============================================================================
// SIMPLE REPLACEMENT FUNCTION
// ============================================================================

function replaceInFile(inputFile, outputFile) {
  console.log('📖 Reading file...');
  let content = fs.readFileSync(inputFile, 'utf-8');
  
  let replacedCount = 0;
  
  console.log('\n🔧 Replacing prices and ASINs...\n');
  
  for (const [key, data] of Object.entries(REPLACEMENTS)) {
    const keyPattern = `'${key}'`;
    
    if (content.includes(keyPattern)) {
      console.log(`✅ Replacing: ${key} ($${data.price})`);
      
      // Find the ingredient block
      const blockStart = content.indexOf(keyPattern);
      if (blockStart === -1) continue;
      
      // Find the closing brace of this ingredient
      let braceCount = 0;
      let i = content.indexOf('{', blockStart);
      let blockEnd = i;
      
      while (i < content.length && (braceCount > 0 || i === content.indexOf('{', blockStart))) {
        if (content[i] === '{') braceCount++;
        if (content[i] === '}') braceCount--;
        if (braceCount === 0 && i !== content.indexOf('{', blockStart)) {
          blockEnd = i;
          break;
        }
        i++;
      }
      
      // Extract the block
      const oldBlock = content.substring(blockStart, blockEnd + 1);
      
      // Build new block
      const newBlock = `'${key}': {
    productName: '${data.productName}',
    ${data.asin ? `amazonLink: 'https://www.amazon.com/dp/${data.asin}?tag=robinfrench-20',
    asinLink: 'https://www.amazon.com/dp/${data.asin}?tag=robinfrench-20',` : `amazonLink: null,
    asinLink: null,`}
    price: {
      amount: ${data.price.toFixed(2)},
      currency: 'USD'
    },
    vetNote: 'Budget-friendly alternative - updated automatically',
    category: 'Food',
    commissionRate: 0.03
  }`;
      
      // Replace
      content = content.replace(oldBlock, newBlock);
      replacedCount++;
    }
  }
  
  console.log(`\n💾 Writing to: ${outputFile}`);
  fs.writeFileSync(outputFile, content);
  
  console.log(`\n✅ Done! Replaced ${replacedCount} items.`);
  console.log(`💰 Total savings: ~$${(replacedCount * 25).toFixed(0)}/shopping cart`);
}

// ============================================================================
// RUN IT
// ============================================================================

const INPUT_FILE = './lib/data/vetted-products.txt';
const OUTPUT_FILE = './lib/data/vetted-products-FIXED.txt';

try {
  replaceInFile(INPUT_FILE, OUTPUT_FILE);
} catch (error) {
  console.error('❌ ERROR:', error.message);
  process.exit(1);
}