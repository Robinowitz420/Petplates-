// scripts/enhance-recipes.ts
// Comprehensive recipe enhancement script (OPTIMIZED)
// - Runs auto-tagging with improvements
// - Verifies and completes shortName fields
// - Verifies and completes celebrity quotes
// - Validates data consistency
// - Outputs to JSON for faster processing
// VERSION: 2025-12-05-v2 - Fixed syntax error and backup file reading

import * as fs from 'fs';
import * as path from 'path';
// REMOVED: import { recipes } from '../lib/data/recipes-complete'; // This causes TypeScript to compile the entire 19k line file
import { 
  dogCelebrities, 
  catCelebrities, 
  birdCelebrities, 
  reptileCelebrities, 
  pocketPetCelebrities 
} from '../lib/data/celebrity-pets-complete';

// Immediate file write to verify script execution
const testFile = path.join(process.cwd(), 'script-test-execution.txt');
try {
  fs.writeFileSync(testFile, `Script executed at: ${new Date().toISOString()}\nWorking directory: ${process.cwd()}\n`, 'utf8');
  console.log('✅ Test file created:', testFile);
} catch (e) {
  console.error('❌ Failed to create test file:', e);
}

console.log('=== SCRIPT LOADING... ===');
console.log('Starting enhance-recipes.ts script');
console.log('Current working directory:', process.cwd());
console.log('=== IMPORTS SUCCESSFUL ===');
console.log('Celebrity data loaded');

// Pre-build celebrity arrays once (not per recipe)
const ALL_CELEBS = [
  ...dogCelebrities,
  ...catCelebrities,
  ...birdCelebrities,
  ...reptileCelebrities,
  ...pocketPetCelebrities
];

console.log(`Total celebrities: ${ALL_CELEBS.length}`);

const CELEBS_BY_TYPE: Record<string, typeof ALL_CELEBS> = {
  dog: ALL_CELEBS.filter(c => c.petType === 'dog'),
  cat: ALL_CELEBS.filter(c => c.petType === 'cat'),
  bird: ALL_CELEBS.filter(c => c.petType === 'bird'),
  reptile: ALL_CELEBS.filter(c => c.petType === 'reptile'),
  'pocket-pet': ALL_CELEBS.filter(c => c.petType === 'pocket-pet'),
};

// Optimized merge function (avoids array spreading)
function mergeUnique(target: string[], source: string[]): string[] {
  const result = [...target];
  for (const s of source) {
    if (!result.includes(s)) {
      result.push(s);
    }
  }
  return result;
}

interface Recipe {
  id: string;
  name: string;
  shortName?: string;
  celebrityName?: string;
  celebrityQuote?: string;
  category?: string;
  ingredients: Array<{ name: string; amount?: string }>;
  healthConcerns?: string[];
  notSuitableFor?: string[];
  [key: string]: any;
}

// =================================================================
// 1. AUTO-TAGGING (Enhanced)
// =================================================================

function autoTagRecipe(recipe: Recipe): { healthConcerns: string[]; notSuitableFor: string[] } {
  const nameLower = recipe.name.toLowerCase();
  const ingredientsText = (recipe.ingredients ?? [])
    .map((i) => (typeof i === 'string' ? i : i.name || '').toLowerCase())
    .join(' ');
  
  const allText = `${nameLower} ${ingredientsText}`;
  const categoryLower = recipe.category?.toLowerCase() || '';

  const healthConcerns: string[] = [];
  const notSuitableFor: string[] = [];

  // DIGESTIVE ISSUES - Bland, easily digestible
  if (
    (allText.includes('chicken') && (allText.includes('rice') || allText.includes('white rice'))) ||
    allText.includes('pumpkin') ||
    allText.includes('bone broth') ||
    nameLower.includes('bland') ||
    nameLower.includes('sensitive') ||
    nameLower.includes('digestive')
  ) {
    healthConcerns.push('digestive-issues');
  }

  // JOINT HEALTH - Omega-3 rich
  if (
    allText.includes('salmon') ||
    allText.includes('fish oil') ||
    allText.includes('salmon oil') ||
    allText.includes('omega') ||
    allText.includes('sardine') ||
    allText.includes('mackerel') ||
    nameLower.includes('joint') ||
    nameLower.includes('arthritis')
  ) {
    healthConcerns.push('joint-health');
  }

  // KIDNEY DISEASE - Avoid high phosphorus
  if (
    allText.includes('liver') ||
    allText.includes('kidney') ||
    allText.includes('organ meat') ||
    allText.includes('organ') ||
    (allText.includes('beef') && allText.includes('liver'))
  ) {
    notSuitableFor.push('kidney-disease');
  } else if (
    allText.includes('white fish') ||
    allText.includes('egg white') ||
    allText.includes('low-sodium') ||
    (allText.includes('chicken') && !allText.includes('liver') && !allText.includes('thigh'))
  ) {
    healthConcerns.push('kidney-disease');
  }

  // WEIGHT MANAGEMENT - Low calorie, lean
  if (
    allText.includes('lean') ||
    allText.includes('low-fat') ||
    allText.includes('low-calorie') ||
    allText.includes('diet') ||
    nameLower.includes('weight') ||
    nameLower.includes('slim') ||
    (allText.includes('turkey') && allText.includes('breast')) ||
    (allText.includes('chicken') && allText.includes('breast')) ||
    allText.includes('green beans') ||
    allText.includes('cauliflower')
  ) {
    healthConcerns.push('weight-management');
  }

  // PANCREATITIS - Ultra low fat
  const hasHighFat = 
    allText.includes('salmon') ||
    allText.includes('pork') ||
    allText.includes('lamb') ||
    allText.includes('duck') ||
    allText.includes('fatty') ||
    (allText.includes('beef') && !allText.includes('lean'));
  
  if (hasHighFat) {
    notSuitableFor.push('pancreatitis');
  } else if (
    allText.includes('lean') ||
    allText.includes('low-fat') ||
    allText.includes('white fish') ||
    allText.includes('turkey breast') ||
    (allText.includes('chicken') && allText.includes('breast'))
  ) {
    healthConcerns.push('pancreatitis');
  }

  // HEART DISEASE - Low sodium, taurine-rich
  if (
    allText.includes('low-sodium') ||
    allText.includes('taurine') ||
    allText.includes('heart') ||
    nameLower.includes('heart') ||
    (allText.includes('chicken') && allText.includes('breast')) ||
    (allText.includes('turkey') && allText.includes('breast'))
  ) {
    healthConcerns.push('heart-disease');
  } else if (
    allText.includes('high-sodium') ||
    allText.includes('processed') ||
    (allText.includes('sodium') && !allText.includes('low-sodium'))
  ) {
    notSuitableFor.push('heart-disease');
  }

  // DIABETES - Low glycemic
  const hasSimpleCarbs = 
    allText.includes('white rice') ||
    allText.includes('corn syrup') ||
    allText.includes('sugar') ||
    allText.includes('honey');
  
  if (hasSimpleCarbs) {
    notSuitableFor.push('diabetes');
  } else if (
    allText.includes('complex') ||
    allText.includes('high-fiber') ||
    allText.includes('low-glycemic') ||
    (allText.includes('sweet potato') && !allText.includes('white rice')) ||
    allText.includes('quinoa') ||
    allText.includes('brown rice') ||
    nameLower.includes('diabetic') ||
    nameLower.includes('diabetes')
  ) {
    healthConcerns.push('diabetes');
  }

  // SKIN CONDITIONS - Omega-3, quality protein
  if (
    allText.includes('salmon') ||
    allText.includes('fish oil') ||
    allText.includes('salmon oil') ||
    allText.includes('omega') ||
    allText.includes('sardine') ||
    allText.includes('vitamin e') ||
    allText.includes('zinc') ||
    nameLower.includes('skin') ||
    nameLower.includes('coat')
  ) {
    healthConcerns.push('skin-conditions');
  } else if (
    allText.includes('artificial') ||
    allText.includes('preservatives') ||
    allText.includes('color')
  ) {
    notSuitableFor.push('skin-conditions');
  }

  // ALLERGIES - Novel proteins
  if (
    allText.includes('rabbit') ||
    allText.includes('duck') ||
    allText.includes('venison') ||
    allText.includes('bison') ||
    allText.includes('kangaroo') ||
    allText.includes('novel') ||
    nameLower.includes('hypoallergenic') ||
    nameLower.includes('allergy')
  ) {
    healthConcerns.push('allergies');
  }

  // DENTAL ISSUES - Soft foods
  if (
    allText.includes('stew') ||
    allText.includes('soft') ||
    allText.includes('wet') ||
    allText.includes('puree') ||
    nameLower.includes('senior') ||
    nameLower.includes('dental') ||
    nameLower.includes('soft')
  ) {
    healthConcerns.push('dental-issues');
  }

  // URINARY HEALTH - High moisture
  if (
    allText.includes('bone broth') ||
    allText.includes('cranberry') ||
    allText.includes('moisture') ||
    allText.includes('hydration') ||
    nameLower.includes('urinary')
  ) {
    healthConcerns.push('urinary-health');
  }

  return {
    healthConcerns: [...new Set(healthConcerns)],
    notSuitableFor: [...new Set(notSuitableFor)]
  };
}

// =================================================================
// 2. SHORT NAME GENERATION (Optimized)
// =================================================================

function generateShortName(recipe: Recipe): string {
  const nameLower = recipe.name.toLowerCase();
  const ingredients = recipe.ingredients || [];
  
  // Pre-normalize ingredient names once
  const ingredientNames = ingredients.map(ing => (ing.name || '').toLowerCase()).join(' ');
  
  // Extract main protein
  const proteins = ['chicken', 'beef', 'turkey', 'duck', 'rabbit', 'salmon', 'fish', 'quail', 'lamb', 'pork'];
  const mainProtein = proteins.find(p => 
    nameLower.includes(p) || ingredientNames.includes(p)
  );
  
  // Extract main carb/vegetable
  const carbs = ['rice', 'oats', 'quinoa', 'buckwheat', 'sweet potato', 'potato', 'beans', 'chickpeas'];
  const mainCarb = carbs.find(c => 
    nameLower.includes(c) || ingredientNames.includes(c)
  );
  
  // Build short name
  if (mainProtein && mainCarb) {
    return `${mainProtein.charAt(0).toUpperCase() + mainProtein.slice(1)} ${mainCarb.charAt(0).toUpperCase() + mainCarb.slice(1)}`;
  } else if (mainProtein) {
    return mainProtein.charAt(0).toUpperCase() + mainProtein.slice(1);
  } else if (mainCarb) {
    return mainCarb.charAt(0).toUpperCase() + mainCarb.slice(1);
  }
  
  // Fallback: use first 2-3 words of name
  const skipWords = ['baked', 'grilled', 'fresh', 'delight', 'bowl', 'stew', 'formula'];
  const words = recipe.name.split(' ').filter(w => 
    !skipWords.includes(w.toLowerCase())
  );
  return words.slice(0, 2).join(' ').substring(0, 20);
}

// =================================================================
// 3. CELEBRITY QUOTE ASSIGNMENT
// =================================================================

function hashString(s: string): number {
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = ((hash << 5) - hash) + s.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash);
}

// Optimized: uses pre-built CELEBS_BY_TYPE (no array building per recipe)
function getCelebrityForRecipe(recipe: Recipe): { name: string; quote: string } {
  const category = recipe.category || 'dogs';
  
  const categoryToPetType: Record<string, keyof typeof CELEBS_BY_TYPE> = {
    'dogs': 'dog',
    'cats': 'cat',
    'birds': 'bird',
    'reptiles': 'reptile',
    'pocket-pets': 'pocket-pet'
  };
  
  const petType = categoryToPetType[category] ?? 'dog';
  const list = CELEBS_BY_TYPE[petType] ?? ALL_CELEBS;
  
  const id = recipe.id || recipe.name;
  const index = hashString(id) % list.length;
  
  return {
    name: list[index].name,
    quote: list[index].quote
  };
}

// =================================================================
// 4. DATA VALIDATION
// =================================================================

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  stats: {
    total: number;
    hasShortName: number;
    hasCelebrity: number;
    hasHealthConcerns: number;
    hasIngredients: number;
  };
}

function validateRecipe(recipe: Recipe, index: number): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (!recipe.id) errors.push(`Recipe ${index}: Missing id`);
  if (!recipe.name) errors.push(`Recipe ${index}: Missing name`);
  if (!recipe.category) errors.push(`Recipe ${index}: Missing category`);
  if (!recipe.ingredients || recipe.ingredients.length === 0) {
    errors.push(`Recipe ${index}: Missing ingredients`);
  }
  
  if (!recipe.shortName || recipe.shortName.trim() === '') {
    warnings.push(`Recipe ${index} (${recipe.name}): Missing shortName`);
  } else if (recipe.shortName.length > 30) {
    warnings.push(`Recipe ${index} (${recipe.name}): shortName too long (${recipe.shortName.length} chars)`);
  }
  
  if (!recipe.celebrityName || !recipe.celebrityQuote) {
    warnings.push(`Recipe ${index} (${recipe.name}): Missing celebrity quote`);
  }
  
  if (!recipe.healthConcerns) {
    warnings.push(`Recipe ${index} (${recipe.name}): Missing healthConcerns array`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    stats: {
      total: 1,
      hasShortName: recipe.shortName ? 1 : 0,
      hasCelebrity: (recipe.celebrityName && recipe.celebrityQuote) ? 1 : 0,
      hasHealthConcerns: (recipe.healthConcerns && recipe.healthConcerns.length > 0) ? 1 : 0,
      hasIngredients: (recipe.ingredients && recipe.ingredients.length > 0) ? 1 : 0,
    }
  };
}

// =================================================================
// MAIN FUNCTION
// =================================================================

// Write all output to a log file as well
const logFile = path.join(process.cwd(), 'enhance-recipes-log.txt');
const logMessages: string[] = [];

function logToFile(msg: string) {
  logMessages.push(msg);
  console.log(msg);
}

// Helper function for safer parsing of JavaScript/TypeScript arrays
// Handles trailing commas and comments that JSON.parse() cannot
function parseRecipeArray(jsonContent: string): Recipe[] {
  try {
    // Try to clean up the content - remove comments and fix common issues
    let cleaned = jsonContent
      .replace(/\/\/.*$/gm, '') // Remove single-line comments
      .replace(/\/\*[\s\S]*?\*\//g, ''); // Remove multi-line comments
    
    logToFile(`Attempting to parse array (cleaned length: ${cleaned.length})...\n`);
    
    let recipes;
    try {
      const tempFn = new Function('return ' + cleaned);
      recipes = tempFn();
    } catch (fnError) {
      logToFile(`❌ Function construction/execution failed: ${fnError}\n`);
      logToFile(`First 1000 chars of cleaned content: ${cleaned.substring(0, 1000)}\n`);
      throw fnError;
    }
    
    if (!Array.isArray(recipes)) {
      logToFile(`❌ Parsed result is not an array. Type: ${typeof recipes}, Value: ${String(recipes).substring(0, 200)}\n`);
      throw new Error('Parsed content was not an array.');
    }
    if (recipes.length === 0) {
      logToFile('⚠️  Warning: Parsed array is empty, but continuing...\n');
    }
    return recipes;
  } catch (e) {
    logToFile(`❌ Severe Parsing Error: The recipe array in the source file has invalid JavaScript syntax (e.g., trailing commas, comments). ${e}`);
    logToFile(`First 500 chars of original content: ${jsonContent.substring(0, 500)}\n`);
    throw new Error(`Recipe array source is corrupted and cannot be parsed: ${e instanceof Error ? e.message : String(e)}`);
  }
}

async function main() {
  try {
    // Write initial log - FORCE RECOMPILE v4 - NEW TIMESTAMP
    const startTime = new Date().toISOString();
    console.log('=== MAIN FUNCTION STARTED ===', startTime);
    fs.writeFileSync(logFile, `Script module loaded successfully at ${startTime}\nVERSION: v4\n`, 'utf8');
    
    logToFile('🚀 Comprehensive Recipe Enhancement Script\n');
    logToFile('This script will:');
    logToFile('  1. Auto-tag recipes with health concerns');
    logToFile('  2. Generate/verify shortName fields');
    logToFile('  3. Assign celebrity quotes');
    logToFile('  4. Validate data consistency\n');

  const recipesPath = path.join(process.cwd(), 'lib', 'data', 'recipes-complete.ts');
  const jsonPath = path.join(process.cwd(), 'lib', 'data', 'recipes-complete.json');
  const backupPath = recipesPath.replace('.ts', `.backup.${Date.now()}.ts`);
  
  // Create backup
  if (fs.existsSync(recipesPath)) {
    fs.copyFileSync(recipesPath, backupPath);
    logToFile(`✅ Backup created: ${backupPath}\n`);
  }
  
  // Check if we need to restore from backup
  const backupFile = path.join(process.cwd(), 'lib', 'data', 'recipes-complete.backup.ts');
  if (fs.existsSync(backupFile)) {
    const backupContent = fs.readFileSync(backupFile, 'utf8');
    const currentContent = fs.existsSync(recipesPath) ? fs.readFileSync(recipesPath, 'utf8') : '';
    
    // If current file doesn't have recipes array but backup does, use backup
    if (!currentContent.includes('export const recipes: Recipe[] = [') && 
        !currentContent.includes('export const recipes = [') &&
        backupContent.includes('export const recipes: Recipe[] = [')) {
      logToFile('⚠️  Current file missing recipes, using backup file for reading...\n');
      // We'll read from backup but write to main file
    }
  }

  // Try to load from JSON first (much faster if it exists)
  let recipes: Recipe[] = [];
  if (fs.existsSync(jsonPath)) {
      logToFile('📖 Loading from existing JSON file (fast path)...');
      try {
        const jsonContent = fs.readFileSync(jsonPath, 'utf8');
        // Check if it's actually JSON (starts with [ or {)
        if (jsonContent.trim().startsWith('[') || jsonContent.trim().startsWith('{')) {
          const parsed = JSON.parse(jsonContent);
          if (Array.isArray(parsed) && parsed.length > 0) {
            recipes = parsed;
        logToFile(`✅ Loaded ${recipes.length} recipes from JSON\n`);
          } else {
            logToFile(`⚠️  JSON file exists but is empty or invalid (length: ${parsed?.length || 0}), checking TS file...\n`);
          }
        } else {
          logToFile(`⚠️  JSON file exists but doesn't appear to be valid JSON (starts with: ${jsonContent.substring(0, 50)}), checking TS file...\n`);
        }
      } catch (e) {
        logToFile(`⚠️  JSON file corrupted (${e}), falling back to TS file...\n`);
      }
  }

  // If JSON doesn't exist or is corrupted, read from TS file
  if (recipes.length === 0) {
    logToFile('📖 Reading recipes from TypeScript file (this may take a moment)...');
    
    // Try main file first, then backup if needed
    let fileContent = '';
    let sourceFile = recipesPath;
    
    try {
      if (fs.existsSync(recipesPath)) {
        fileContent = fs.readFileSync(recipesPath, 'utf8');
        logToFile(`Main file exists, length: ${fileContent.length} chars\n`);
        logToFile(`First 200 chars: ${fileContent.substring(0, 200)}\n`);
        
        // Check if TS file imports from JSON - if so, try loading JSON again
        if (fileContent.includes("import recipesData from './recipes-complete.json'") || 
            fileContent.includes('import recipesData from "./recipes-complete.json"')) {
          logToFile('📖 TS file imports from JSON, loading JSON file directly...\n');
          if (fs.existsSync(jsonPath)) {
            try {
              const jsonContent = fs.readFileSync(jsonPath, 'utf8');
              const parsed = JSON.parse(jsonContent);
              if (Array.isArray(parsed) && parsed.length > 0) {
                recipes = parsed;
                logToFile(`✅ Loaded ${recipes.length} recipes from JSON (via TS import detection)\n`);
              } else {
                logToFile(`⚠️  JSON file is empty or invalid, trying backup...\n`);
              }
            } catch (e) {
              logToFile(`⚠️  Failed to load JSON: ${e}, trying backup...\n`);
            }
          }
        }
      } else {
        logToFile('⚠️  Main file does not exist!\n');
      }
    } catch (e) {
      logToFile(`❌ Error reading main file: ${e}\n`);
      throw e;
    }
    
    // If still no recipes and main file doesn't have recipes array, try backup
    if (recipes.length === 0 && fileContent) {
      const hasRecipesArray = fileContent.includes('export const recipes: Recipe[] = [') || 
                              fileContent.includes('export const recipes = [');
      
      if (!hasRecipesArray) {
      const backupFile = path.join(process.cwd(), 'lib', 'data', 'recipes-complete.backup.ts');
      logToFile(`Checking backup file: ${backupFile}\n`);
      logToFile(`Backup exists: ${fs.existsSync(backupFile)}\n`);
      if (fs.existsSync(backupFile)) {
        logToFile('⚠️  Main file missing recipes array, reading from backup...\n');
        fileContent = fs.readFileSync(backupFile, 'utf8');
        sourceFile = backupFile;
        logToFile(`Backup file length: ${fileContent.length} chars\n`);
        logToFile(`Backup first 200 chars: ${fileContent.substring(0, 200)}\n`);
      } else {
        logToFile('❌ Backup file also does not exist!\n');
        }
      }
    }
    
    // Only try to parse TS file if we still don't have recipes and have file content
    if (recipes.length === 0 && fileContent) {
    // Find the JSON array in the TypeScript file
    logToFile(`Searching for recipes array in file content (length: ${fileContent.length})...\n`);
    const arrayStart = fileContent.indexOf('export const recipes: Recipe[] = [');
    logToFile(`arrayStart position: ${arrayStart}\n`);
    if (arrayStart === -1) {
      const altStart = fileContent.indexOf('export const recipes = [');
      logToFile(`altStart position: ${altStart}\n`);
      if (altStart === -1) {
        logToFile(`❌ File content preview: ${fileContent.substring(0, 1000)}\n`);
        throw new Error(`Could not find recipes array in file: ${sourceFile}. File length: ${fileContent.length}`);
      } else {
      const bracketStart = fileContent.indexOf('[', altStart);
      let bracketCount = 0;
      let bracketEnd = bracketStart;
      for (let i = bracketStart; i < fileContent.length; i++) {
        if (fileContent[i] === '[') bracketCount++;
        if (fileContent[i] === ']') bracketCount--;
        if (bracketCount === 0) {
          bracketEnd = i;
          break;
        }
      }
      const jsonContent = fileContent.substring(bracketStart, bracketEnd + 1);
      logToFile(`Extracted array content length: ${jsonContent.length} chars\n`);
      logToFile(`First 200 chars of extracted content: ${jsonContent.substring(0, 200)}\n`);
      recipes = parseRecipeArray(jsonContent);
      }
    } else {
      const bracketStart = fileContent.indexOf('[', arrayStart);
      if (bracketStart === -1) {
        throw new Error('Could not find opening bracket');
      }
      
      // Find the matching closing bracket (handle nested brackets)
      let bracketCount = 0;
      let bracketEnd = bracketStart;
      for (let i = bracketStart; i < fileContent.length; i++) {
        if (fileContent[i] === '[') bracketCount++;
        if (fileContent[i] === ']') bracketCount--;
        if (bracketCount === 0) {
          bracketEnd = i;
          break;
        }
      }
      
      // Extract and parse JSON
      const jsonContent = fileContent.substring(bracketStart, bracketEnd + 1);
      logToFile(`Extracted array content length: ${jsonContent.length} chars\n`);
      logToFile(`First 200 chars of extracted content: ${jsonContent.substring(0, 200)}\n`);
      recipes = parseRecipeArray(jsonContent);
    }
      logToFile(`✅ Loaded ${recipes.length} recipes from TS file\n`);
    }
  logToFile('📝 Processing recipes...\n');

  const tagStats: Record<string, number> = {};
  const notSuitableStats: Record<string, number> = {};
  let taggedCount = 0;
  let shortNameAdded = 0;
  let celebrityAdded = 0;
  const validationResults: ValidationResult[] = [];

  // Process each recipe
  const updatedRecipes = recipes.map((recipe: Recipe, index: number) => {
    // 1. Auto-tagging
    const tags = autoTagRecipe(recipe);
    const existingHealthConcerns = recipe.healthConcerns || [];
    const existingNotSuitable = recipe.notSuitableFor || [];
    
    // Use optimized merge function (avoids array spreading)
    const mergedHealthConcerns = mergeUnique([...existingHealthConcerns], tags.healthConcerns);
    const mergedNotSuitable = mergeUnique([...existingNotSuitable], tags.notSuitableFor);
    
    if (tags.healthConcerns.length > 0 || tags.notSuitableFor.length > 0) {
      taggedCount++;
      tags.healthConcerns.forEach(tag => tagStats[tag] = (tagStats[tag] || 0) + 1);
      tags.notSuitableFor.forEach(tag => notSuitableStats[tag] = (notSuitableStats[tag] || 0) + 1);
    }
    
    // 2. Short name
    let shortName = recipe.shortName;
    if (!shortName || shortName.trim() === '') {
      shortName = generateShortName(recipe);
      shortNameAdded++;
    }
    
    // 3. Celebrity quote
    let celebrityName = recipe.celebrityName;
    let celebrityQuote = recipe.celebrityQuote;
    if (!celebrityName || !celebrityQuote) {
      const celebrity = getCelebrityForRecipe(recipe);
      celebrityName = celebrity.name;
      celebrityQuote = celebrity.quote;
      celebrityAdded++;
    }
    
    // 4. Validation
    const validation = validateRecipe({
      ...recipe,
      shortName,
      celebrityName,
      celebrityQuote,
      healthConcerns: mergedHealthConcerns,
      notSuitableFor: mergedNotSuitable
    }, index);
    validationResults.push(validation);
    
    return {
      ...recipe,
      shortName,
      celebrityName,
      celebrityQuote,
      healthConcerns: mergedHealthConcerns,
      notSuitableFor: mergedNotSuitable
    };
  });

  // Aggregate validation stats
  const totalStats = validationResults.reduce((acc, result) => ({
    total: acc.total + result.stats.total,
    hasShortName: acc.hasShortName + result.stats.hasShortName,
    hasCelebrity: acc.hasCelebrity + result.stats.hasCelebrity,
    hasHealthConcerns: acc.hasHealthConcerns + result.stats.hasHealthConcerns,
    hasIngredients: acc.hasIngredients + result.stats.hasIngredients,
  }), { total: 0, hasShortName: 0, hasCelebrity: 0, hasHealthConcerns: 0, hasIngredients: 0 });

  const allErrors = validationResults.flatMap(r => r.errors);
  const allWarnings = validationResults.flatMap(r => r.warnings);

  // Write to JSON for faster processing (TypeScript imports JSON)
  fs.writeFileSync(jsonPath, JSON.stringify(updatedRecipes, null, 2), 'utf8');
  
  // Also update the TS file to import from JSON
  const tsOutput = `// lib/data/recipes-complete.ts
// Auto-generated comprehensive recipe database
// Auto-tagged on: ${new Date().toISOString()}
// Enhanced with shortName, celebrity quotes, and health tags
// Total recipes: ${updatedRecipes.length}
// 
// NOTE: Data is stored in recipes-complete.json for faster processing
// This file imports and re-exports it for TypeScript compatibility

import type { Recipe } from '../types';
import recipesData from './recipes-complete.json';

export const recipes: Recipe[] = recipesData as Recipe[];
`;

  fs.writeFileSync(recipesPath, tsOutput, 'utf8');

  // Print results
  logToFile('\n🎉 Enhancement Complete!\n');
  logToFile('📊 Statistics:');
  logToFile(`   Total recipes: ${updatedRecipes.length}`);
  logToFile(`   Recipes tagged: ${taggedCount}`);
  logToFile(`   Short names added: ${shortNameAdded}`);
  logToFile(`   Celebrity quotes added: ${celebrityAdded}\n`);
  
  logToFile('   Health Concern Tags:');
  Object.entries(tagStats)
    .sort(([, a], [, b]) => b - a)
    .forEach(([tag, count]) => {
      logToFile(`   + ${tag}: ${count} recipes`);
    });
  
  if (Object.keys(notSuitableStats).length > 0) {
    logToFile(`\n   Not Suitable For:`);
    Object.entries(notSuitableStats)
      .sort(([, a], [, b]) => b - a)
      .forEach(([tag, count]) => {
        logToFile(`   - ${tag}: ${count} recipes`);
      });
  }

  logToFile('\n📋 Data Quality:');
  logToFile(`   Recipes with shortName: ${totalStats.hasShortName}/${totalStats.total} (${Math.round(totalStats.hasShortName/totalStats.total*100)}%)`);
  logToFile(`   Recipes with celebrity: ${totalStats.hasCelebrity}/${totalStats.total} (${Math.round(totalStats.hasCelebrity/totalStats.total*100)}%)`);
  logToFile(`   Recipes with health tags: ${totalStats.hasHealthConcerns}/${totalStats.total} (${Math.round(totalStats.hasHealthConcerns/totalStats.total*100)}%)`);
  logToFile(`   Recipes with ingredients: ${totalStats.hasIngredients}/${totalStats.total} (${Math.round(totalStats.hasIngredients/totalStats.total*100)}%)`);

  if (allErrors.length > 0) {
    logToFile(`\n❌ Errors (${allErrors.length}):`);
    allErrors.slice(0, 10).forEach(err => logToFile(`   ${err}`));
    if (allErrors.length > 10) logToFile(`   ... and ${allErrors.length - 10} more`);
  }

  if (allWarnings.length > 0) {
    logToFile(`\n⚠️  Warnings (${allWarnings.length}):`);
    allWarnings.slice(0, 10).forEach(warn => logToFile(`   ${warn}`));
    if (allWarnings.length > 10) logToFile(`   ... and ${allWarnings.length - 10} more`);
  }

    logToFile('\n✅ Files updated:');
    logToFile('   - lib/data/recipes-complete.json (data)');
    logToFile('   - lib/data/recipes-complete.ts (imports JSON)');
    logToFile('🔄 Restart your dev server to see changes');
    
    // Write log to file
    fs.writeFileSync(logFile, logMessages.join('\n'), 'utf8');
    logToFile(`\n📝 Full log written to: ${logFile}`);
  } catch (error) {
    const errorMsg = `❌ Error running script: ${error}`;
    logToFile(errorMsg);
    if (error instanceof Error) {
      logToFile(`Error message: ${error.message}`);
      logToFile(`Stack trace: ${error.stack}`);
    }
    fs.writeFileSync(logFile, logMessages.join('\n'), 'utf8');
    console.error(errorMsg);
    process.exit(1);
  }
}

// Wrap everything in try-catch to catch import errors
try {
  main().catch((error) => {
    const errorMsg = `❌ Unhandled error: ${error}`;
    try {
      logMessages.push(errorMsg);
      if (error instanceof Error) {
        logMessages.push(`Error message: ${error.message}`);
        logMessages.push(`Stack trace: ${error.stack}`);
      }
      fs.writeFileSync(logFile, logMessages.join('\n'), 'utf8');
    } catch (writeError) {
      // If we can't write to log, at least try console
      console.error('Failed to write log file:', writeError);
    }
    console.error(errorMsg);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Stack trace:', error.stack);
    }
    process.exit(1);
  });
} catch (error) {
  // Catch import/module loading errors
  console.error('❌ Script failed to load:', error);
  if (error instanceof Error) {
    console.error('Error message:', error.message);
    console.error('Stack trace:', error.stack);
  }
  process.exit(1);
}

