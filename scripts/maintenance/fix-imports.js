// Script to remove .js extensions from ALL imports in TypeScript files
const fs = require('fs');
const path = require('path');

const filesToFix = [
  './lib/services/unifiedVettingService.ts',
  './lib/utils/customMealStorageFirebase.ts',
  './lib/utils/improvedCompatibilityScoring.ts',
  './lib/data/__tests__/TESTEST.ts',
  './lib/utils/enhancedCompatibilityScoring.ts',
  './lib/utils/ingredientSuggestions.ts',
  './lib/utils/localStorageSafe.ts',
  './lib/utils/ingredientWhitelists.ts',
  './lib/utils/petPurchaseTracking.ts',
  './lib/utils/purchaseTracking.ts',
  './lib/utils/recipeRecommendations.ts',
  './lib/utils/scoringDiagnostics.ts',
  './lib/utils/scoringTransparency.ts',
  './lib/utils/validation.ts',
];

let fixedCount = 0;
let skippedCount = 0;
let errorCount = 0;

filesToFix.forEach(filePath => {
  try {
    const fullPath = path.resolve(filePath);
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  Skipping ${filePath} - file not found`);
      skippedCount++;
      return;
    }

    let content = fs.readFileSync(fullPath, 'utf8');
    const original = content;
    
    // Remove .js extensions from ALL imports (relative and absolute)
    // Pattern 1: from './something.js'
    content = content.replace(/from ['"](\.\/.+?)\.js['"]/g, "from '$1'");
    // Pattern 2: from '@/something.js'
    content = content.replace(/from ['"](@\/.+?)\.js['"]/g, "from '$1'");
    // Pattern 3: import './something.js'
    content = content.replace(/import ['"](\.\/.+?)\.js['"]/g, "import '$1'");
    
    if (content !== original) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✅ Fixed ${filePath}`);
      fixedCount++;
    } else {
      console.log(`⏭️  No changes needed for ${filePath}`);
      skippedCount++;
    }
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
    errorCount++;
  }
});

console.log('\n📊 Summary:');
console.log(`✅ Fixed: ${fixedCount}`);
console.log(`⏭️  Skipped: ${skippedCount}`);
console.log(`❌ Errors: ${errorCount}`);
console.log('\n✨ Done!');
