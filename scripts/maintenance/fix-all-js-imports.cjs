// Comprehensive script to remove ALL .js extensions from imports in TypeScript files
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Finding all TypeScript files with .js imports...\n');

// Find all .ts and .tsx files with .js imports
let filesToFix = [];
try {
  // Use grep/findstr to locate files (cross-platform approach)
  const isWindows = process.platform === 'win32';
  
  if (isWindows) {
    // Windows: recursively find all .ts and .tsx files
    const findCommand = 'dir /s /b *.ts *.tsx 2>nul';
    const allFiles = execSync(findCommand, { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 })
      .split('\n')
      .filter(f => f.trim() && !f.includes('node_modules'));
    
    // Check each file for .js imports
    allFiles.forEach(file => {
      try {
        const content = fs.readFileSync(file.trim(), 'utf8');
        if (content.match(/from ['"]\.\/.*\.js['"]/)) {
          filesToFix.push(file.trim());
        }
      } catch (e) {
        // Skip files that can't be read
      }
    });
  } else {
    // Unix-like systems
    const grepCommand = 'grep -rl "from [\'\\"]\\./.*\\.js[\'\\\"]" --include="*.ts" --include="*.tsx" . 2>/dev/null || true';
    const output = execSync(grepCommand, { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
    filesToFix = output.split('\n').filter(f => f.trim() && !f.includes('node_modules'));
  }
} catch (e) {
  console.log('⚠️  Could not auto-detect files, using manual list...');
  filesToFix = [
    './lib/utils/customMealStorageFirebase.ts',
    './lib/services/unifiedVettingService.ts',
    './lib/utils/ingredientSuggestions.ts',
    './lib/utils/improvedCompatibilityScoring.ts',
    './lib/utils/localStorageSafe.ts',
    './lib/utils/ingredientWhitelists.ts',
    './lib/data/__tests__/TESTEST.ts',
    './lib/utils/petPurchaseTracking.ts',
    './lib/utils/purchaseTracking.ts',
    './lib/utils/recipeRecommendations.ts',
    './lib/utils/scoringDiagnostics.ts',
    './lib/utils/scoringTransparency.ts',
    './lib/utils/validation.ts',
  ];
}

console.log(`📝 Found ${filesToFix.length} files to check\n`);

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
    
    // Remove ALL .js extensions from imports
    // Pattern 1: from './something.js' or from "./something.js"
    content = content.replace(/from ['"](\.\/.+?)\.js['"]/g, "from '$1'");
    // Pattern 2: from '@/something.js'
    content = content.replace(/from ['"](@\/.+?)\.js['"]/g, "from '$1'");
    // Pattern 3: import './something.js'
    content = content.replace(/import ['"](\.\/.+?)\.js['"]/g, "import '$1'");
    // Pattern 4: import '@/something.js'
    content = content.replace(/import ['"](@\/.+?)\.js['"]/g, "import '$1'");
    
    if (content !== original) {
      fs.writeFileSync(fullPath, content, 'utf8');
      const relativePath = path.relative(process.cwd(), fullPath);
      console.log(`✅ Fixed ${relativePath}`);
      fixedCount++;
    } else {
      const relativePath = path.relative(process.cwd(), fullPath);
      console.log(`⏭️  No changes needed for ${relativePath}`);
      skippedCount++;
    }
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
    errorCount++;
  }
});

console.log('\n' + '='.repeat(50));
console.log('📊 Summary:');
console.log(`✅ Fixed: ${fixedCount} files`);
console.log(`⏭️  Skipped: ${skippedCount} files`);
console.log(`❌ Errors: ${errorCount} files`);
console.log('='.repeat(50));
console.log('\n✨ All done! Try running: npm run dev');
