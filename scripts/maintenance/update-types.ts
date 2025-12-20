const fs = require('fs');
const path = require('path');

const typesPath = path.join(__dirname, 'lib', 'types.ts');
let content = fs.readFileSync(typesPath, 'utf-8');

// Replace the RecipeNutritionInfo interface
content = content.replace(
  /export interface RecipeNutritionInfo \{[\s\S]*?\}\n\n/,
  `export interface RecipeNutritionInfo {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber: number;
  moisture: number;
  calcium?: number;
  phosphorus?: number;
  caP_ratio?: string;
}

`
);

fs.writeFileSync(typesPath, content);
console.log('✅ Updated RecipeNutritionInfo interface');
