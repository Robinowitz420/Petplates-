const fs = require('fs');
const path = require('path');

// Hash function (same as in mealImageAssignment.ts)
function hashStringToNumber(s) {
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    const char = s.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function getMealImageForRecipe(recipeId, category) {
  const categoryMap = {
    'dogs': 'dogs',
    'cats': 'cats',
    'birds': 'birds',
    'reptiles': 'reptiles',
    'pocket-pets': 'pocket-pets'
  };
  
  const normalizedCategory = categoryMap[category.toLowerCase()] || 'dogs';
  const hash = hashStringToNumber(recipeId);
  const imageNumber = (hash % 25) + 1;
  const imageNumberStr = imageNumber.toString().padStart(2, '0');
  
  return `/images/meals/${normalizedCategory}-meal-${imageNumberStr}.png`;
}

// Read the recipes file
const recipesPath = path.join(__dirname, '../lib/data/recipes-complete.ts');
let content = fs.readFileSync(recipesPath, 'utf8');

// Count recipes updated
let updatedCount = 0;

// Replace all imageUrl fields with meal images
// Pattern: "imageUrl": "/images/..."
content = content.replace(
  /"imageUrl":\s*"[^"]*"/g,
  (match) => {
    // Extract recipe ID and category from context
    // We need to find the recipe ID and category before this imageUrl
    const beforeMatch = content.substring(0, content.indexOf(match));
    const recipeMatch = beforeMatch.match(/"id":\s*"([^"]+)"/);
    const categoryMatch = beforeMatch.match(/"category":\s*"([^"]+)"/);
    
    if (recipeMatch && categoryMatch) {
      const recipeId = recipeMatch[1];
      const category = categoryMatch[1];
      const newImageUrl = getMealImageForRecipe(recipeId, category);
      updatedCount++;
      return `"imageUrl": "${newImageUrl}"`;
    }
    
    return match; // Keep original if we can't find ID/category
  }
);

// Write back
fs.writeFileSync(recipesPath, content, 'utf8');

console.log(`✅ Updated ${updatedCount} recipe image URLs to use meal images`);
console.log(`📁 Recipes file: ${recipesPath}`);

