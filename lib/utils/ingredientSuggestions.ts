// lib/utils/ingredientSuggestions.ts
// Generate ingredient suggestions based on pet profile

import { ALL_INGREDIENTS } from './allIngredients';

export interface SuggestedIngredient {
  name: string;
  reason: string;
  category: string;
}

interface PetProfile {
  type: string;
  age?: string;
  healthConcerns?: string[];
  breed?: string;
}

export function generateIngredientSuggestions(pet: PetProfile): SuggestedIngredient[] {
  if (!pet) return [];
  
  const suggestions: SuggestedIngredient[] = [];
  const normalizedSpecies = pet.type === 'dog' ? 'dogs' : 
                           pet.type === 'cat' ? 'cats' :
                           pet.type === 'bird' ? 'birds' :
                           pet.type === 'reptile' ? 'reptiles' :
                           pet.type === 'pocket-pet' ? 'pocket-pets' : pet.type;
  
  const speciesData = ALL_INGREDIENTS[normalizedSpecies as keyof typeof ALL_INGREDIENTS];
  if (!speciesData) return [];

  const healthConcerns = (pet.healthConcerns || []).map(hc => hc.toLowerCase());
  const age = pet.age?.toLowerCase() || '';

  // Safe property access helper
  const getProperty = <T>(obj: any, key: string, defaultValue: T[] = []): T[] => {
    return (key in obj ? obj[key] : defaultValue) || defaultValue;
  };

  const addUnique = (name: string, reason: string, category: string) => {
    if (suggestions.some((s) => s.name === name)) return;
    suggestions.push({ name, reason, category });
  };

  const proteins = getProperty<string>(speciesData, 'proteins');
  const vegetables = getProperty<string>(speciesData, 'vegetables');
  const carbs = getProperty<string>(speciesData, 'carbs');
  const fruits = getProperty<string>(speciesData, 'fruits');
  const fats = getProperty<string>(speciesData, 'fats');
  const supplements = getProperty<string>(speciesData, 'supplements');
  const insects = getProperty<string>(speciesData, 'insects');
  const hay = getProperty<string>(speciesData, 'hay');
  const seeds = getProperty<string>(speciesData, 'seeds');
  const pellets = getProperty<string>(speciesData, 'pellets');

  // Species-specific essentials
  if (normalizedSpecies === 'cats') {
    // Taurine is essential for cats
    if (supplements.includes('Taurine Powder')) {
      suggestions.push({
        name: 'Taurine Powder',
        reason: 'Essential amino acid required for cats - supports heart and eye health',
        category: 'Supplements'
      });
    }
    // High-taurine proteins
    if (proteins.includes('Chicken Liver')) {
      suggestions.push({
        name: 'Chicken Liver',
        reason: 'Rich in taurine and essential nutrients for cats',
        category: 'Proteins'
      });
    }
  }

  if (normalizedSpecies === 'reptiles') {
    // Calcium is essential for reptiles
    if (vegetables.includes('Collard Greens')) {
      suggestions.push({
        name: 'Collard Greens',
        reason: 'High in calcium - essential for bone health in reptiles',
        category: 'Greens & Veggies'
      });
    }
    // Insects for protein
    if (insects.includes('Dubia Roaches')) {
      suggestions.push({
        name: 'Dubia Roaches',
        reason: 'Excellent protein source with ideal calcium-to-phosphorus ratio',
        category: 'Proteins'
      });
    }
  }

  if (normalizedSpecies === 'pocket-pets') {
    // Hay is essential
    if (hay.includes('Timothy Hay')) {
      suggestions.push({
        name: 'Timothy Hay',
        reason: 'Essential fiber source for digestive health',
        category: 'Hay'
      });
    }
    // Vitamin C rich vegetables
    if (vegetables.includes('Bell Peppers (high vitamin C)')) {
      suggestions.push({
        name: 'Bell Peppers (high vitamin C)',
        reason: 'High in vitamin C - essential for guinea pigs and other pocket pets',
        category: 'Greens & Veggies'
      });
    }
  }

  // Age-based suggestions
  if (age.includes('baby') || age.includes('puppy') || age.includes('kitten')) {
    if (proteins.includes('Ground Chicken')) {
      suggestions.push({
        name: 'Ground Chicken',
        reason: 'Easy to digest protein perfect for growing pets',
        category: 'Proteins'
      });
    }
    if (carbs.includes('Sweet Potato') || carbs.includes('Sweet Potato (cooked)')) {
      suggestions.push({
        name: carbs.includes('Sweet Potato') ? 'Sweet Potato' : 'Sweet Potato (cooked)',
        reason: 'Gentle on developing digestive systems and rich in nutrients',
        category: 'Grains & Carbs'
      });
    }
  }

  if (age.includes('senior')) {
    if (supplements.includes('Glucosamine Sulfate')) {
      suggestions.push({
        name: 'Glucosamine Sulfate',
        reason: 'Supports joint health in older pets',
        category: 'Supplements'
      });
    }
    if (fats.includes('Fish Oil') || supplements.includes('Fish Oil')) {
      suggestions.push({
        name: 'Fish Oil',
        reason: 'Omega-3 fatty acids support brain and joint health in seniors',
        category: 'Supplements'
      });
    }
  }

  // Health concern-based suggestions
  if (healthConcerns.some(hc => hc.includes('kidney') || hc.includes('urinary'))) {
    if (vegetables.includes('Green Beans') || vegetables.includes('Green Beans (cooked)')) {
      suggestions.push({
        name: vegetables.includes('Green Beans') ? 'Green Beans' : 'Green Beans (cooked)',
        reason: 'Low in phosphorus - ideal for kidney support',
        category: 'Greens & Veggies'
      });
    }
    if (normalizedSpecies === 'cats' && supplements.includes('Cranberry Extract')) {
      suggestions.push({
        name: 'Cranberry Extract',
        reason: 'Supports urinary tract health',
        category: 'Supplements'
      });
    }
  }

  if (healthConcerns.some(hc => hc.includes('joint') || hc.includes('mobility'))) {
    if (supplements.includes('Glucosamine Sulfate')) addUnique('Glucosamine Sulfate', 'Supports joint cartilage and mobility', 'Supplements');
    if (fats.includes('Fish Oil') || supplements.includes('Fish Oil')) addUnique('Fish Oil', 'Anti-inflammatory omega-3s help reduce joint inflammation', 'Supplements');
  }

  if (healthConcerns.some(hc => hc.includes('weight') || hc.includes('obesity'))) {
    if (proteins.includes('Ground Turkey')) {
      addUnique('Ground Turkey', 'Lean protein helps maintain muscle while managing weight', 'Proteins');
    }
    if (vegetables.includes('Green Beans') || vegetables.includes('Green Beans (cooked)')) {
      addUnique(vegetables.includes('Green Beans') ? 'Green Beans' : 'Green Beans (cooked)', 'Low calorie, high fiber - helps with satiety', 'Greens & Veggies');
    }
  }

  if (healthConcerns.some(hc => hc.includes('digestive') || hc.includes('gi'))) {
    if (carbs.includes('Pumpkin Puree') || carbs.includes('Pumpkin Puree (small amounts)')) {
      addUnique(carbs.includes('Pumpkin Puree') ? 'Pumpkin Puree' : 'Pumpkin Puree (small amounts)', 'Soluble fiber helps regulate digestion', 'Grains & Carbs');
    }
    if (supplements.includes('Probiotic Powder')) {
      addUnique('Probiotic Powder', 'Supports healthy gut bacteria and digestive function', 'Supplements');
    }
  }

  if (healthConcerns.some(hc => hc.includes('skin') || hc.includes('coat'))) {
    if (fats.includes('Salmon Oil') || supplements.includes('Salmon Oil')) {
      addUnique('Salmon Oil', 'Omega-3 fatty acids promote healthy skin and shiny coat', 'Supplements');
    }
    const salmonOptions = proteins.filter(p => p.toLowerCase().includes('salmon'));
    if (salmonOptions.length > 0) {
      addUnique(salmonOptions[0], 'Rich in omega-3s for healthy skin and coat', 'Proteins');
    }
  }

  // Baseline species recommendations to ensure multiple options
  if (normalizedSpecies === 'dogs') {
    addUnique('Chicken Breast', 'Lean, versatile protein for most dogs', 'Proteins');
    addUnique('Brown Rice', 'Gentle carb to mix meals', 'Grains & Carbs');
    addUnique('Carrots', 'Great source of beta-carotene and fiber for dogs', 'Greens & Veggies');
  }

  if (normalizedSpecies === 'cats') {
    const sardineOptions = proteins.filter(p => p.toLowerCase().includes('sardine'));
    if (sardineOptions.length > 0) {
      addUnique(sardineOptions[0], 'High in taurine and omega-3s - excellent for cats', 'Proteins');
    }
    addUnique('Chicken Liver', 'Taurine-rich organ meat for cats', 'Proteins');
    addUnique('Pumpkin Puree (small amounts)', 'Fiber to help digestion', 'Grains & Carbs');
  }

  if (normalizedSpecies === 'birds') {
    addUnique('Millet (white/red)', 'Staple seed birds readily accept', 'Seeds');
    addUnique('Carrots (grated)', 'Vitamin A-rich veggie for birds', 'Greens & Veggies');
    addUnique('Apples (no seeds)', 'Common fruit treat (seed-free)', 'Fruits');
  }

  if (normalizedSpecies === 'reptiles') {
    addUnique('Collard Greens', 'High-calcium staple green', 'Greens & Veggies');
    addUnique('Dubia Roaches', 'Staple insect protein with good Ca:P', 'Proteins');
    addUnique('Blueberries', 'Occasional fruit treat many reptiles accept', 'Fruits');
  }

  if (normalizedSpecies === 'pocket-pets') {
    addUnique('Timothy Hay', 'Essential daily fiber source', 'Hay');
    addUnique('Bell Peppers (high vitamin C)', 'Vitamin C boost for pocket pets', 'Greens & Veggies');
    addUnique('Carrots', 'Crunchy, familiar veggie treat', 'Greens & Veggies');
  }

  // Remove duplicates and keep a healthy list (up to 12)
  const unique = suggestions.filter((sug, idx, self) =>
    idx === self.findIndex(s => s.name === sug.name)
  );

  return unique.slice(0, 12);
}

