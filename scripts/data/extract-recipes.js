// Script to extract recipe list for images
const fs = require('fs');

try {
  console.log('Reading recipes file...');
  const content = fs.readFileSync('lib/data/recipes-complete.ts', 'utf8');

  // Find the JSON array - skip the TypeScript parts
  const arrayStart = content.indexOf('[');
  const arrayEnd = content.lastIndexOf(']');

  if (arrayStart !== -1 && arrayEnd !== -1) {
    const jsonContent = content.substring(arrayStart, arrayEnd + 1);

    console.log('Parsing JSON...');
    const recipes = JSON.parse(jsonContent);

    console.log('=== RECIPE LIST FOR IMAGES ===');
    console.log('Total recipes:', recipes.length);
    console.log('');

    const categories = {};
    recipes.forEach(recipe => {
      if (!categories[recipe.category]) categories[recipe.category] = [];
      categories[recipe.category].push(recipe);
    });

    Object.keys(categories).forEach(category => {
      console.log(`${category.toUpperCase()}: ${categories[category].length} recipes`);
      categories[category].slice(0, 10).forEach(recipe => {
        console.log(`  ${recipe.id}: ${recipe.name} (${recipe.shortName})`);
      });
      if (categories[category].length > 10) {
        console.log(`  ... and ${categories[category].length - 10} more`);
      }
      console.log('');
    });

    console.log('=== UNIQUE IMAGE PATHS NEEDED ===');
    const imagePaths = [...new Set(recipes.map(r => r.imageUrl))];
    console.log('Total unique image paths:', imagePaths.length);
    imagePaths.slice(0, 20).forEach(path => console.log(path));
    if (imagePaths.length > 20) {
      console.log(`... and ${imagePaths.length - 20} more`);
    }
  } else {
    console.log('Could not find JSON array');
  }
} catch (e) {
  console.error('Error:', e.message);
  console.error('Stack:', e.stack);
}