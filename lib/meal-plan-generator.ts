// lib/meal-plan-generator.ts

// CORRECTED IMPORTS: Using absolute paths from the root ('@/')
import { Recipe, PetCategory, NutritionalRequirement } from '@/lib/types';
import { recipes } from '@/lib/data/recipes-complete';
import { nutritionalGuidelines } from '@/lib/data/nutritional-guidelines';

/**
 * Defines the complete set of filtering criteria for a pet's profile.
 * Exported so it can be used in page.tsx.
 */
export interface PetProfile {
  category: PetCategory;
  ageGroup: string; // e.g., 'adult', 'puppy'
  breed: string | null; // e.g., 'labrador' or null
  healthConcern: string | null; // e.g., 'weight-management' or null
}

/**
 * Filters the master recipe list based on the pet's profile metadata.
 */
const filterRecipes = (profile: PetProfile): Recipe[] => {
  return recipes.filter(recipe => {
    // 1. Category Match (Required)
    if (recipe.category !== profile.category) {
      return false;
    }

    // 2. Age Group Match (Required)
    // The recipe's ageGroup array must include the pet's ageGroup.
    if (!recipe.ageGroup.includes(profile.ageGroup)) {
      return false;
    }

    // 3. Breed Match (Optional - only applied if a breed is selected)
    // The recipe must either explicitly support the breed, or the recipe breed array is empty/null.
    if (profile.breed && recipe.breed && recipe.breed.length > 0) {
        if (!recipe.breed.includes(profile.breed)) {
            return false;
        }
    }
    
    // 4. Health Concern Match (Optional - only applied if a concern is selected)
    // The recipe's healthConcerns array must include the pet's health concern.
    if (profile.healthConcern && !recipe.healthConcerns.includes(profile.healthConcern)) {
      return false;
    }

    // If all checks pass, the recipe is suitable for the pet's profile.
    return true;
  });
};

/**
 * Generates a full weekly meal plan (14 meals total) from a pool of filtered recipes,
 * prioritizing variety and repeating recipes only if necessary.
 * Exported so it can be used in page.tsx.
 */
export const generateWeeklyMealPlan = (profile: PetProfile): Recipe[] => {
  const filteredRecipes = filterRecipes(profile);
  const mealPlan: Recipe[] = [];
  const requiredMeals = 14; // 7 days * 2 meals per day

  if (filteredRecipes.length === 0) {
    console.warn(`No recipes found for the selected profile: ${profile.category} - ${profile.ageGroup}. Returning placeholders.`);
    // Return a plan of placeholders if no recipes are found
    const placeholderRecipe: Recipe = {
        id: 'none',
        name: 'No Recipe Found',
        category: profile.category,
        ageGroup: ['adult'],
        healthConcerns: [],
        description: '',
        ingredients: [],
        instructions: [],
        tags: ['error'],
        rating: 0,
        reviews: 0,
        prepTime: '0 min',
        cookTime: '0 min',
        servings: 1
    };
    // Fill the 14-meal plan with the placeholder to prevent the UI from being empty
    return Array(requiredMeals).fill(placeholderRecipe);
  }

  // Use a temporary list to track recipes for variety
  let availableRecipes = [...filteredRecipes];

  // Loop to fill the 14-meal plan
  for (let i = 0; i < requiredMeals; i++) {
    // If we run out of unique recipes, refill the available list to allow repeats
    if (availableRecipes.length === 0) {
      availableRecipes = [...filteredRecipes];
    }

    // Randomly select a recipe from the current available list
    const randomIndex = Math.floor(Math.random() * availableRecipes.length);
    const selectedRecipe = availableRecipes[randomIndex];
    
    // Add the selected recipe to the plan
    mealPlan.push(selectedRecipe);

    // Remove the selected recipe from the available list to prevent immediate repetition
    availableRecipes.splice(randomIndex, 1);
  }

  return mealPlan;
};

/**
 * A utility function to retrieve the correct nutritional requirements.
 */
export const getRequiredGuidelines = (category: PetCategory, ageGroup: string): NutritionalRequirement | undefined => {
  const categoryGuidelines = nutritionalGuidelines[category];
  return categoryGuidelines[ageGroup as keyof typeof categoryGuidelines];
};