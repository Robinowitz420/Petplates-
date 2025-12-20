const fs = require('fs');
const path = require('path');

const generatorPath = path.join(__dirname, 'lib', 'recipe-generator.ts');
let content = fs.readFileSync(generatorPath, 'utf-8');

// Update the contribution object in GeneratedRecipe interface
content = content.replace(
  /contribution: \{\s*protein: number;\s*fat: number;\s*calories: number;\s*\};/,
  `contribution: {
      protein: number;
      fat: number;
      calories: number;
      fiber?: number;
      calcium?: number;
      phosphorus?: number;
    };`
);

fs.writeFileSync(generatorPath, content);
console.log('✅ Updated contribution object type');
