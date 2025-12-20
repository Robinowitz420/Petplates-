/**
 * LLM RECIPE LABELER
 * Uses LLM to classify and extract structured data from canonicalized recipes
 * This is Step 2 of the training pipeline
 */

import * as fs from 'fs/promises';

type CanonicalizedRecipe = {
  id: string;
  name: string;
  species: string[];
  ingredients: Array<{
    canonicalId: string;
    originalName: string;
  }>;
  instructions?: string[];
  warnings?: string[];
}

type LabeledRecipe = CanonicalizedRecipe & {
  labels: {
    speciesGuess: string[];
    mealType: 'complete_meal' | 'topper' | 'treat' | 'feeding_guide';
    prepStyle: 'cooked' | 'raw' | 'mixed' | 'unknown';
    warnings: string[];
    missingNutrients?: string[];
    confidence: number;
  };
}

/**
 * PROMPT TEMPLATE FOR LLM LABELING
 * Send this to your LLM API (OpenAI, Anthropic, etc.)
 */
export const RECIPE_LABELING_PROMPT = `You are a veterinary nutritionist analyzing pet food recipes.

Given a recipe with:
- Title
- Species (cats, dogs, birds, reptiles, pocket-pets)
- Ingredients list
- Instructions (if available)
- Warnings (if available)

Output strict JSON with these fields:

{
  "speciesGuess": ["cats"] // Confirm or correct the species
  "mealType": "complete_meal" | "topper" | "treat" | "feeding_guide",
  "prepStyle": "cooked" | "raw" | "mixed" | "unknown",
  "warnings": [
    "Missing calcium source",
    "High fat content - may cause pancreatitis",
    "Contains onion - toxic to dogs"
  ],
  "missingNutrients": ["calcium", "taurine", "vitamin_e"], // If incomplete
  "confidence": 0.85 // 0-1 scale
}

Rules:
1. "complete_meal" = balanced, can be fed as primary diet
2. "topper" = meant to mix with kibble/other food
3. "treat" = occasional snack, not nutritionally complete
4. "feeding_guide" = general advice, not a specific recipe

5. Flag missing critical nutrients:
   - Cats: taurine, calcium, vitamin_a, arachidonic_acid
   - Dogs: calcium, vitamin_d, vitamin_e
   - Birds: calcium, vitamin_a
   - Reptiles: calcium, vitamin_d3

6. Flag toxic ingredients:
   - Onion, garlic, grapes, raisins, xylitol, chocolate, avocado (for some species)

7. Flag structural issues:
   - All meat, no calcium = "Missing calcium source"
   - >70% fat calories = "Excessive fat content"
   - Single ingredient = "Not a complete meal"

Recipe to analyze:
---
Title: {title}
Species: {species}
Ingredients: {ingredients}
Instructions: {instructions}
Warnings: {warnings}
---

Output JSON only, no explanation:`;

class RecipeLabeler {
  /**
   * This is a STUB - you need to implement actual LLM API calls
   * Use OpenAI, Anthropic, or your preferred LLM provider
   */
  async labelRecipe(recipe: CanonicalizedRecipe): Promise<LabeledRecipe> {
    // TODO: Replace with actual LLM API call
    // const prompt = this.buildPrompt(recipe);
    // const response = await openai.chat.completions.create({...});
    // const labels = JSON.parse(response.choices[0].message.content);

    // For now, return heuristic labels
    const labels = this.heuristicLabels(recipe);

    return {
      ...recipe,
      labels,
    };
  }

  async labelRecipeFile(inputPath: string, outputPath: string): Promise<void> {
    console.log(`\n🏷️  Labeling recipes from: ${inputPath}`);
    
    const fileContent = await fs.readFile(inputPath, 'utf-8');
    const recipes: CanonicalizedRecipe[] = JSON.parse(fileContent);
    console.log(`   Found ${recipes.length} canonicalized recipes`);

    const labeled: LabeledRecipe[] = [];

    for (const recipe of recipes) {
      const labeledRecipe = await this.labelRecipe(recipe);
      labeled.push(labeledRecipe);
      
      if (labeled.length % 10 === 0) {
        console.log(`   Labeled ${labeled.length}/${recipes.length} recipes...`);
      }
    }

    await fs.writeFile(outputPath, JSON.stringify(labeled, null, 2), 'utf-8');

    console.log(`\n✅ Labeling complete!`);
    console.log(`   Total labeled: ${labeled.length}`);
    console.log(`   Output: ${outputPath}`);
  }

  private buildPrompt(recipe: CanonicalizedRecipe): string {
    return RECIPE_LABELING_PROMPT
      .replace('{title}', recipe.name)
      .replace('{species}', recipe.species.join(', '))
      .replace('{ingredients}', recipe.ingredients.map(i => i.canonicalId).join(', '))
      .replace('{instructions}', recipe.instructions?.join('\n') || 'None')
      .replace('{warnings}', recipe.warnings?.join('\n') || 'None');
  }

  /**
   * Heuristic labeling (fallback when no LLM available)
   */
  private heuristicLabels(recipe: CanonicalizedRecipe): LabeledRecipe['labels'] {
    const title = recipe.name.toLowerCase();
    const ingredientIds = recipe.ingredients.map(i => i.canonicalId.toLowerCase());

    // Detect meal type
    let mealType: LabeledRecipe['labels']['mealType'] = 'complete_meal';
    if (title.includes('treat') || title.includes('snack')) {
      mealType = 'treat';
    } else if (title.includes('topper') || title.includes('mix-in')) {
      mealType = 'topper';
    } else if (title.includes('guide') || title.includes('feeding')) {
      mealType = 'feeding_guide';
    }

    // Detect prep style
    const instructions = recipe.instructions?.join(' ').toLowerCase() || '';
    let prepStyle: LabeledRecipe['labels']['prepStyle'] = 'unknown';
    if (instructions.includes('cook') || instructions.includes('bake')) {
      prepStyle = 'cooked';
    } else if (instructions.includes('raw')) {
      prepStyle = 'raw';
    }

    // Detect warnings
    const warnings: string[] = [];
    const missingNutrients: string[] = [];

    // Check for calcium
    const hasCalcium = ingredientIds.some(id => 
      id.includes('calcium') || id.includes('bone') || id.includes('eggshell')
    );
    if (!hasCalcium && recipe.species.includes('cats' || 'dogs')) {
      warnings.push('Missing calcium source');
      missingNutrients.push('calcium');
    }

    // Check for taurine (cats)
    if (recipe.species.includes('cats')) {
      const hasTaurine = ingredientIds.some(id => 
        id.includes('heart') || id.includes('liver') || id.includes('taurine')
      );
      if (!hasTaurine) {
        warnings.push('Missing taurine source for cats');
        missingNutrients.push('taurine');
      }
    }

    // Check for toxic ingredients
    const toxicIngredients = ['onion', 'garlic', 'grape', 'raisin', 'chocolate', 'xylitol'];
    for (const toxic of toxicIngredients) {
      if (ingredientIds.some(id => id.includes(toxic))) {
        warnings.push(`Contains ${toxic} - potentially toxic`);
      }
    }

    return {
      speciesGuess: recipe.species,
      mealType,
      prepStyle,
      warnings,
      missingNutrients: missingNutrients.length > 0 ? missingNutrients : undefined,
      confidence: 0.7, // Heuristic confidence
    };
  }
}

// CLI execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error('Usage: ts-node llm-label-recipes.ts <input-file> <output-file>');
    console.error('Example: ts-node llm-label-recipes.ts ./output/canonical-recipes.json ./output/labeled-recipes.json');
    process.exit(1);
  }

  const [inputPath, outputPath] = args;
  const labeler = new RecipeLabeler();
  
  await labeler.labelRecipeFile(inputPath, outputPath);
}

// Run if executed directly
main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
