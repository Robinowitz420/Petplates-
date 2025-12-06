// lib/utils/mealNameGenerator.ts
// Generate creative meal names based on ingredients

export function generateMealName(ingredients: string[]): string {
  if (ingredients.length === 0) return 'Custom Meal';
  
  // Extract main ingredient names (first word, cleaned)
  const mainIngredients = ingredients
    .map(ing => {
      // Remove common prefixes and get first meaningful word
      const cleaned = ing
        .replace(/^(Ground|Fresh|Cooked|Raw|Canned|Dried|Freeze-Dried)\s+/i, '')
        .replace(/\s*\([^)]*\)/g, '') // Remove parentheses
        .trim()
        .split(/\s+/)[0]; // Get first word
      return cleaned;
    })
    .filter(Boolean)
    .slice(0, 3); // Use up to 3 main ingredients

  if (mainIngredients.length === 0) return 'Custom Meal';

  // Identify primary protein
  const proteins = mainIngredients.filter(ing => 
    /chicken|turkey|beef|pork|lamb|salmon|tuna|sardine|duck|venison|rabbit|quail|egg|liver|heart/i.test(ing)
  );
  
  // Identify carbs/grains
  const carbs = mainIngredients.filter(ing =>
    /rice|quinoa|oats|barley|potato|sweet potato|pumpkin|squash|lentil|bean|chickpea/i.test(ing)
  );
  
  // Identify vegetables
  const veggies = mainIngredients.filter(ing =>
    /carrot|broccoli|spinach|kale|celery|green bean|peas|zucchini|pepper|cabbage|bok choy/i.test(ing)
  );

  const protein = proteins[0] || mainIngredients[0];
  const carb = carbs[0];
  const veggie = veggies[0];

  // Name generation patterns
  const patterns = [
    // Simple combinations
    `${protein} & ${carb || veggie || 'Mix'}`,
    `${protein} ${carb ? `with ${carb}` : veggie ? `and ${veggie}` : 'Bowl'}`,
    
    // With cooking method
    `Fresh ${protein} ${carb ? `& ${carb}` : veggie ? `& ${veggie}` : 'Mix'}`,
    `Homemade ${protein} ${veggie ? `& ${veggie}` : 'Delight'}`,
    
    // Descriptive
    `${protein} Power Bowl`,
    `${protein} Wellness Mix`,
    `${protein} Complete Meal`,
    
    // If we have multiple ingredients
    ...(mainIngredients.length >= 2 ? [
      `${protein} ${carb ? `& ${carb}` : ''} ${veggie ? `& ${veggie}` : ''} Blend`.trim(),
      `${protein} ${veggie || carb || 'Feast'}`,
    ] : []),
  ];

  // Pick a pattern based on ingredient count
  let selectedPattern;
  if (mainIngredients.length === 1) {
    selectedPattern = patterns[0]; // Simple name
  } else if (mainIngredients.length === 2) {
    selectedPattern = patterns[1] || patterns[0];
  } else {
    // For 3+ ingredients, use a more descriptive pattern
    selectedPattern = patterns[Math.min(4, patterns.length - 1)];
  }

  // Capitalize properly
  return selectedPattern
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

