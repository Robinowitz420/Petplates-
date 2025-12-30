'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronLeft,
  X
} from 'lucide-react';
import { useAuth } from '@clerk/nextjs';
import { generateCustomMealAnalysis } from '@/lib/analyzeCustomMeal';
import { INGREDIENT_COMPOSITIONS } from '@/lib/data/ingredientCompositions';
import { type IngredientSelection, type MealAnalysis } from '@/lib/analyzeCustomMeal';
import { getIngredientsForSpecies, mapIngredientToCompositionKey, ALL_INGREDIENTS, getIngredientDisplayName } from '@/lib/utils/allIngredients';
import { generateIngredientSuggestions } from '@/lib/utils/ingredientSuggestions';
import { getWhitelistForSpecies, isWhitelisted, getSpeciesCoverageLevel, getBlacklistForSpecies } from '@/lib/utils/ingredientWhitelists';
import IngredientPicker from '@/components/IngredientPicker';
import MealCompositionList from '@/components/MealCompositionList';
import CompatibilityPanel from '@/components/CompatibilityPanel';
import SuggestedIngredients from '@/components/SuggestedIngredients';
import MealBuilderWizard from '@/components/MealBuilderWizard';
import MealCompleteView from '@/components/MealCompleteView';
import { getPets } from '@/lib/utils/petStorage'; // Import async storage

// Style mapping for severity levels
const severityStyles = {
  critical: 'bg-red-50 border-red-200 text-red-800',
  major: 'bg-red-50 border-red-200 text-red-700',
  moderate: 'bg-orange-50 border-orange-200 text-orange-700',
};

const getSeverityIcon = (severity: string) => {
  switch (severity) {
    case 'critical':
      return <span className="text-red-600">⚠️</span>;
    case 'major':
      return <span className="text-red-600">⚠️</span>;
    default:
      return <span className="text-orange-600">ℹ️</span>;
  }
};

const getProgressGradientColor = (score: number) => {
  if (score === 0) return '#dc2626'; // red-600
  if (score <= 10) return '#dc2626'; // red-600
  if (score <= 20) return '#ea580c'; // orange-600
  if (score <= 30) return '#d97706'; // amber-600
  if (score <= 40) return '#ca8a04'; // yellow-600
  if (score <= 50) return '#a3a3a3'; // gray-400 (neutral)
  if (score <= 60) return '#84cc16'; // lime-500
  if (score <= 70) return '#65a30d'; // lime-700
  if (score <= 80) return '#16a34a'; // green-600
  if (score <= 90) return '#15803d'; // green-700
  return '#166534'; // green-800
};

interface Pet {
  id: string;
  names: string[];
  type: string;
  breed: string;
  age: string;
  weight: string;
  healthConcerns?: string[];
  dietaryRestrictions?: string[];
  allergies?: string[];
  dislikes?: string[];
  image?: string;
  savedRecipes?: string[];
  weightKg?: number;
}

// Species-appropriate ingredient categories
const SPECIES_INGREDIENT_FILTERS = {
  dogs: {
    allowed: ['chicken_breast', 'ground_turkey', 'chicken_thighs', 'turkey_breast', 'chicken_liver', 'chicken_hearts',
              'salmon_atlantic', 'sardines_water', 'tuna_water',
              'ground_beef_lean', 'beef_liver',
              'eggs_whole',
              'kale_raw', 'spinach_raw', 'carrots_raw', 'sweet_potato', 'broccoli_raw',
              'blueberries_raw', 'bananas_raw',
              'brown_rice_cooked', 'oats', 'quinoa_cooked',
              'fish_oil'], // Meat-focused with some veggies
    disallowed: ['taurine_powder'], // Dogs can synthesize taurine
  },
  cats: {
    allowed: ['chicken_breast', 'ground_turkey', 'turkey_breast', 'chicken_liver', 'chicken_hearts',
              'salmon_atlantic', 'sardines_water', 'tuna_water',
              'eggs_whole',
              'brown_rice_cooked', 'quinoa_cooked',
              'taurine_powder', 'fish_oil'], // Taurine essential for cats, very meat-focused
    disallowed: ['ground_beef_lean', 'beef_liver'], // Many cats allergic/intolerant to beef
  },
  reptiles: {
    allowed: ['kale_raw', 'spinach_raw', 'carrots_raw', 'sweet_potato', 'broccoli_raw', 'celery_raw',
              'blueberries_raw', 'bananas_raw', 'eggs_whole',
              'calcium_carbonate'], // Vegetables and calcium (reptiles are often herbivores/omnivores)
    // Reptiles should use insects like crickets, dubia, etc. but those aren't in our current DB
    disallowed: ['chicken_breast', 'ground_turkey', 'ground_beef_lean', 'beef_liver', 'chicken_liver'],
  },
  birds: {
    allowed: [
      // Protein sources
      'eggs_whole', 'egg (hard-boiled)',
      // Seeds (protein sources for birds)
      'millet (white/red)', 'canary seed', 'niger seed', 'hemp seeds', 'flaxseeds',
      'sesame seeds', 'chia seeds', 'sunflower seeds (small amounts)', 'pumpkin seeds',
      'safflower seeds', 'nyjer seeds', 'amaranth seeds', 'wild bird mix',
      // Insects (for some bird species)
      'crickets', 'mealworms', 'superworms', 'black soldier fly larvae', 'hornworms',
      'dubia roaches', 'pinhead crickets',
      // Cooked lean meats (small amounts for some birds)
      'turkey_breast', 'chicken_breast',
      // Fruits, grains, vegetables, calcium
      'blueberries_raw', 'bananas_raw',
      'brown_rice_cooked', 'oats', 'quinoa_cooked',
      'kale_raw', 'spinach_raw', 'carrots_raw', 'broccoli_raw',
      'calcium_carbonate'
    ],
    disallowed: ['ground_beef_lean', 'beef_liver', 'chicken_liver'], // Raw meat not ideal for birds
  },
  'pocket-pets': {
    allowed: ['oats', 'quinoa_cooked', 'brown_rice_cooked',
              'kale_raw', 'spinach_raw', 'carrots_raw', 'broccoli_raw', 'celery_raw',
              'blueberries_raw', 'bananas_raw',
              'calcium_carbonate'], // Hay/pellet substitutes, veggies, fruits, calcium
    disallowed: ['chicken_breast', 'ground_turkey', 'ground_beef_lean', 'beef_liver', 'salmon_atlantic'],
  },
};

// Normalize pet type to match ALL_INGREDIENTS keys
const normalizeSpecies = (species: string): string => {
  const mapping: Record<string, string> = {
    'dog': 'dogs',
    'cat': 'cats',
    'bird': 'birds',
    'reptile': 'reptiles',
    'pocket-pet': 'pocket-pets',
    'dogs': 'dogs',
    'cats': 'cats',
    'birds': 'birds',
    'reptiles': 'reptiles',
    'pocket-pets': 'pocket-pets'
  };
  return mapping[species.toLowerCase()] || species;
};

const shouldExcludeIngredientName = (value: string): boolean => {
  const n = String(value || '').toLowerCase();
  if (!n) return false;

  if (n.includes('duck') && !n.includes('egg')) return true;
  if (n.includes('rabbit') && !n.includes('pellet')) return true;

  const organKeywords = [
    'liver',
    'heart',
    'hearts',
    'kidney',
    'giblet',
    'giblets',
    'gizzard',
    'tripe',
    'offal',
    'spleen',
    'pancreas',
    'lung',
    'brain',
  ];
  return organKeywords.some((kw) => n.includes(kw));
};

// Get filtered ingredients based on pet species - ONLY show species-specific ingredients
const getAvailableIngredients = (species: string, bannedIngredients?: string[]): string[] => {
  const normalizedSpecies = normalizeSpecies(species);
  const filters = SPECIES_INGREDIENT_FILTERS[normalizedSpecies as keyof typeof SPECIES_INGREDIENT_FILTERS];

  // Get species-specific ingredients from scraped data (generate-recipes.js INGREDIENTS object)
  // This contains all the AAFCO and research-based ingredients for this species
  const scrapedIngredients = getIngredientsForSpecies(normalizedSpecies);
  
  // Return ALL scraped ingredient names - don't filter by composition key mapping
  // The composition keys will be looked up when needed for nutritional analysis
  const allIngredientNames = new Set<string>(scrapedIngredients);
  
  // Also include composition keys that are commonly used across species (universal ingredients)
  // but only if they're not explicitly disallowed
  const universalIngredients = [
    'eggs_whole', 'carrots_raw', 'broccoli_raw', 'spinach_raw', 
    'kale_raw', 'celery_raw', 'blueberries_raw', 'bananas_raw',
    'brown_rice_cooked', 'quinoa_cooked', 'sweet_potato', 'oats',
    'fish_oil', 'calcium_carbonate'
  ];
  
  universalIngredients.forEach(key => {
    if (!filters?.disallowed?.includes(key)) {
      // Convert composition key to readable name and add
      const displayName = key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      allIngredientNames.add(displayName);
    }
  });
  
  // Return all ingredient names (scraped names + universal ingredients)
  const mappedKeys = Array.from(allIngredientNames);

  let filtered = mappedKeys;
  
  if (filters) {
    // Filter out disallowed items
    filtered = filtered.filter(ing => !filters.disallowed?.includes(ing));
  }
  
  // Filter out banned ingredients (case-insensitive partial match)
  if (bannedIngredients && bannedIngredients.length > 0) {
    const bannedLower = bannedIngredients.map(b => b.toLowerCase());
    filtered = filtered.filter(ing => {
      const ingLower = ing.toLowerCase();
      return !bannedLower.some(banned => ingLower.includes(banned) || banned.includes(ingLower));
    });
  }

  filtered = filtered.filter((ing) => !shouldExcludeIngredientName(ing));

  return Array.from(filtered).sort();
};

// Categorize ingredients
const getCategorizedIngredients = (availableIngredients: string[], species: string) => {
  const normalizedSpecies = normalizeSpecies(species);
  const categories = {
    proteins: {
      name: 'Proteins',
      description: 'Main protein source',
      maxSelections: 999, // No limit - let users experiment
      icon: '🥩',
      ingredients: [] as string[]
    },
    greens: {
      name: 'Greens & Veggies',
      description: 'Vitamins and fiber',
      maxSelections: 999,
      icon: '🥬',
      ingredients: [] as string[]
    },
    fruits: {
      name: 'Fruits',
      description: 'Natural sweetness and nutrients',
      maxSelections: 999,
      icon: '🍎',
      ingredients: [] as string[]
    },
    grains: {
      name: 'Grains & Carbs',
      description: 'Energy source',
      maxSelections: 999,
      icon: '🌾',
      ingredients: [] as string[]
    },
    supplements: {
      name: 'Supplements',
      description: 'Essential nutrients',
      maxSelections: 999,
      icon: '💊',
      ingredients: [] as string[]
    }
  };

  // Special handling for cats (taurine is specifically marked as essential but can be added to supplements)
  if (normalizedSpecies === 'cats') {
    categories.supplements.description = 'Essential nutrients (taurine recommended)';
  }

  // Special handling for reptiles/herbivores (calcium is essential)
  if (['reptiles', 'pocket-pets'].includes(normalizedSpecies)) {
    categories.supplements.description = 'Essential minerals (calcium recommended)';
  }

  // Get species-specific ingredient categories from scraped data
  const speciesData = ALL_INGREDIENTS[normalizedSpecies as keyof typeof ALL_INGREDIENTS];
  
  if (speciesData) {
    // Map scraped ingredients to composition keys and categorize by species-specific categories
    Object.entries(speciesData).forEach(([categoryName, ingredientList]) => {
      if (Array.isArray(ingredientList)) {
        ingredientList.forEach(ingName => {
          // Use the ingredient name directly (not the composition key) for display
          // Only add if it's in availableIngredients (species-filtered)
          if (availableIngredients.includes(ingName)) {
            // Map category names to our 5 categories based on species
            // Use ingredient name directly (not composition key) for display
            if (categoryName === 'proteins' || categoryName === 'insects' || 
                (normalizedSpecies === 'birds' && categoryName === 'seeds')) {
              // For birds, seeds are protein sources
              if (!categories.proteins.ingredients.includes(ingName)) {
                categories.proteins.ingredients.push(ingName);
              }
            } else if (categoryName === 'vegetables' || categoryName === 'hay') {
              if (!categories.greens.ingredients.includes(ingName)) {
                categories.greens.ingredients.push(ingName);
              }
            } else if (categoryName === 'fruits') {
              if (!categories.fruits.ingredients.includes(ingName)) {
                categories.fruits.ingredients.push(ingName);
              }
            } else if (categoryName === 'carbs' || categoryName === 'seeds' || categoryName === 'pellets' || categoryName === 'hamster_additions') {
              // Seeds go to grains for non-bird species
              if (!categories.grains.ingredients.includes(ingName)) {
                categories.grains.ingredients.push(ingName);
              }
            } else if (categoryName === 'fats' || categoryName === 'fiber_supplements' || categoryName === 'supplements') {
              if (!categories.supplements.ingredients.includes(ingName)) {
                categories.supplements.ingredients.push(ingName);
              }
            }
          }
        });
      }
    });
  }
  
  // Also categorize any remaining ingredients that weren't in scraped data
  availableIngredients.forEach(ingName => {
    // Skip if already categorized
    const allCategorized = [
      ...categories.proteins.ingredients,
      ...categories.greens.ingredients,
      ...categories.fruits.ingredients,
      ...categories.grains.ingredients,
      ...categories.supplements.ingredients
    ];
    if (allCategorized.includes(ingName)) return;
    
    const keyLower = ingName.toLowerCase();
    
    // Proteins: meat, fish, eggs, insects
    if (keyLower.includes('chicken') || keyLower.includes('turkey') || 
        keyLower.includes('beef') || keyLower.includes('liver') || 
        keyLower.includes('hearts') || keyLower.includes('salmon') || 
        keyLower.includes('tuna') || keyLower.includes('sardines') ||
        keyLower.includes('duck') || keyLower.includes('venison') ||
        keyLower.includes('rabbit') || keyLower.includes('quail') ||
        keyLower.includes('pork') || keyLower.includes('giblets') ||
        keyLower.includes('eggs') || keyLower.includes('egg') ||
        keyLower.includes('cricket') || keyLower.includes('roach') ||
        keyLower.includes('worm') || keyLower.includes('insect')) {
      categories.proteins.ingredients.push(ingName);
    } 
    // Greens & Vegetables
    else if (keyLower.includes('kale') || keyLower.includes('spinach') || 
             keyLower.includes('carrot') || keyLower.includes('broccoli') || 
             keyLower.includes('celery') || keyLower.includes('bok') ||
             keyLower.includes('choy') || keyLower.includes('green bean') ||
             keyLower.includes('peas') || keyLower.includes('zucchini') ||
             keyLower.includes('brussels') || keyLower.includes('asparagus') ||
             keyLower.includes('cucumber') || keyLower.includes('lettuce') ||
             keyLower.includes('cabbage') || keyLower.includes('cauliflower') ||
             keyLower.includes('hay')) {
      categories.greens.ingredients.push(ingName);
    } 
    // Fruits
    else if (keyLower.includes('blueberr') || keyLower.includes('banana') ||
             keyLower.includes('apple') || keyLower.includes('berry') ||
             keyLower.includes('mango') || keyLower.includes('papaya') ||
             keyLower.includes('strawberr') || keyLower.includes('grape')) {
      categories.fruits.ingredients.push(ingName);
    } 
    // Grains & Carbs
    else if (keyLower.includes('rice') || keyLower.includes('quinoa') || 
             keyLower.includes('oats') || keyLower.includes('barley') ||
             keyLower.includes('sweet potato') || keyLower.includes('potato') ||
             keyLower.includes('pumpkin') || keyLower.includes('squash') ||
             keyLower.includes('lentil') || keyLower.includes('bean') ||
             keyLower.includes('chickpea') || keyLower.includes('grain') ||
             keyLower.includes('amaranth') || keyLower.includes('buckwheat') ||
             keyLower.includes('millet') || keyLower.includes('sorghum') ||
             keyLower.includes('farro') || keyLower.includes('bulgur') ||
             keyLower.includes('seed') || keyLower.includes('pellet')) {
      categories.grains.ingredients.push(ingName);
    } 
    // Supplements
    else if (keyLower.includes('oil') || keyLower.includes('calcium') || 
             keyLower.includes('taurine') || keyLower.includes('supplement') ||
             keyLower.includes('vitamin') || keyLower.includes('probiotic') ||
             keyLower.includes('psyllium') || keyLower.includes('joint')) {
      categories.supplements.ingredients.push(ingName);
    }
    // Default: add to greens if not categorized
    else {
      categories.greens.ingredients.push(ingName);
    }
  });

  return categories;
};

export default function RecipeBuilderPage() {
  const params = useParams();
  const router = useRouter();
  const petId = params.id as string;
  const { userId, isLoaded } = useAuth();

  const [pet, setPet] = useState<Pet | null>(null);
  const [selectedIngredients, setSelectedIngredients] = useState<IngredientSelection[]>([]);
  const [analysis, setAnalysis] = useState<MealAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [wizardCompleted, setWizardCompleted] = useState(false);
  const [showAddMore, setShowAddMore] = useState(false);
  const [hasAppliedRecommended, setHasAppliedRecommended] = useState(false);
  const [isFirstCreation, setIsFirstCreation] = useState(false); // Track if this is the first creation
  const [recommendedMeals, setRecommendedMeals] = useState<any[]>([]); // Store recommended meals

  // Get species-appropriate ingredients and categories
  const normalizedSpeciesType = pet ? normalizeSpecies(pet.type) : null;
  const speciesCoverageLevel = normalizedSpeciesType ? getSpeciesCoverageLevel(normalizedSpeciesType as any) : 'limited';
  const blacklist = normalizedSpeciesType ? getBlacklistForSpecies(normalizedSpeciesType as any) : [];
  
  // Filter available ingredients through whitelist
  const allAvailableIngredients = pet ? getAvailableIngredients(pet.type, (pet as any).bannedIngredients) : [];
  const whitelist = normalizedSpeciesType ? getWhitelistForSpecies(normalizedSpeciesType as any) : [];
  const availableIngredients = whitelist.length > 0 
    ? allAvailableIngredients.filter(ing => isWhitelisted(ing, normalizedSpeciesType as any))
    : allAvailableIngredients; // Fallback to all if no whitelist data
  
  const categorizedIngredients = pet ? getCategorizedIngredients(availableIngredients, pet.type) : null;
  
  // Generate base suggestions from static rules
  const baseSuggestedIngredients = pet ? generateIngredientSuggestions({
    type: pet.type,
    age: pet.age,
    healthConcerns: pet.healthConcerns || [],
    breed: pet.breed
  }) : [];
  
  // Extract ingredients from recommended meals and merge with base suggestions
  const suggestedIngredients = (() => {
    if (!pet || recommendedMeals.length === 0) {
      return baseSuggestedIngredients;
    }
    
    // Extract unique ingredients from top 5 recommended meals
    const ingredientsFromMeals = new Map<string, { name: string; reason: string; category: string; fromMeal: boolean }>();
    
    recommendedMeals.slice(0, 5).forEach((meal: any) => {
      const mealIngredients = meal.recipe?.ingredients || meal.adjustedIngredients || [];
      mealIngredients.forEach((ing: any) => {
        const ingName = ing.name || ing.productName || '';
        if (ingName && !ingredientsFromMeals.has(ingName)) {
          // Try to categorize the ingredient
          const nameLower = ingName.toLowerCase();
          let category = 'Other';
          if (nameLower.includes('liver') || nameLower.includes('heart') || nameLower.includes('chicken') || 
              nameLower.includes('turkey') || nameLower.includes('duck') || nameLower.includes('salmon') ||
              nameLower.includes('beef') || nameLower.includes('fish') || nameLower.includes('meat')) {
            category = 'Proteins';
          } else if (nameLower.includes('squash') || nameLower.includes('greens') || nameLower.includes('kale') ||
                     nameLower.includes('spinach') || nameLower.includes('carrot') || nameLower.includes('broccoli') ||
                     nameLower.includes('dandelion') || nameLower.includes('vegetable')) {
            category = 'Greens & Veggies';
          } else if (nameLower.includes('rice') || nameLower.includes('quinoa') || nameLower.includes('oats') ||
                     nameLower.includes('grain') || nameLower.includes('carb')) {
            category = 'Grains & Carbs';
          } else if (nameLower.includes('oil') || nameLower.includes('supplement') || nameLower.includes('powder') ||
                     nameLower.includes('currant') || nameLower.includes('vitamin')) {
            category = 'Supplements';
          } else if (nameLower.includes('berry') || nameLower.includes('apple') || nameLower.includes('banana') ||
                     nameLower.includes('fruit')) {
            category = 'Fruits';
          }
          
          ingredientsFromMeals.set(ingName, {
            name: ingName,
            reason: `Found in your top recommended meals - ${meal.recipe?.name || 'recommended meal'}`,
            category,
            fromMeal: true
          });
        }
      });
    });
    
    // Merge with base suggestions, prioritizing ingredients from meals
    const merged = new Map<string, { name: string; reason: string; category: string }>();
    
    // First add ingredients from recommended meals (higher priority)
    ingredientsFromMeals.forEach((ing) => {
      merged.set(ing.name, { name: ing.name, reason: ing.reason, category: ing.category });
    });
    
    // Then add base suggestions (if not already present)
    baseSuggestedIngredients.forEach((ing) => {
      if (!merged.has(ing.name)) {
        merged.set(ing.name, ing);
      }
    });
    
    return Array.from(merged.values()).slice(0, 12); // Limit to 12 total suggestions
  })();
  
  // Extract recommended ingredient names for wizard
  const recommendedIngredientNames = suggestedIngredients.map(s => s.name);
  
  // Debug logging (remove in production)
  useEffect(() => {
    if (pet && availableIngredients.length > 0) {
      // Debug logging removed for production
    }
  }, [pet, availableIngredients.length, categorizedIngredients]);

  // Load pet data and fetch recommended meals
  useEffect(() => {
    const loadPetData = async () => {
      if (!isLoaded) return;
      if (!userId) return;

      try {
          const pets = await getPets(userId);
          const foundPet = pets.find((p: any) => p.id === petId);
          
          if (foundPet) {
            setPet(foundPet as unknown as Pet);
            // Show wizard on initial load if no ingredients selected
            if (selectedIngredients.length === 0 && !wizardCompleted) {
              setShowWizard(true);
            }
            
            // Fetch recommended meals... (rest of logic)
            const concerns = (foundPet.healthConcerns || []).filter((concern: string) => concern !== 'none');
            const allergies = (foundPet as any).allergies?.filter((allergy: string) => allergy !== 'none') || [];
            // Use random name from pet's names array
            const petNames = Array.isArray(foundPet.names) ? foundPet.names.filter((n: string) => n && n.trim() !== '') : [];
            const petDisplayName = petNames.length > 0 
              ? petNames[Math.floor(Math.random() * petNames.length)]
              : 'Your Pet';
            
            try {
              const response = await fetch('/api/recommendations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  profile: {
                    species: foundPet.type,
                    ageGroup: foundPet.age,
                    breed: foundPet.breed,
                    weightKg: parseFloat(foundPet.weight?.replace(/[^0-9.]/g, '') || '10'),
                    healthConcerns: concerns,
                    allergies,
                    petName: petDisplayName,
                  },
                  limit: 5, // Only need top 5 for ingredient extraction
                }),
              });

              if (response.ok) {
                const data = await response.json();
                if (data?.results && Array.isArray(data.results)) {
                  setRecommendedMeals(data.results);
                }
              }
            } catch (error) {
              // Failed to fetch recommended meals
            }
          }
      } catch (error) {
        console.error("Error loading pet:", error);
      }
    };

    loadPetData();
  }, [isLoaded, petId, userId]);

  // Handle wizard completion
  const handleWizardComplete = (selections: { [category: string]: string[] }) => {
    // Convert wizard selections to IngredientSelection format
    const ingredients: IngredientSelection[] = [];
    
    Object.entries(selections).forEach(([category, ingredientNames]) => {
      if (ingredientNames && ingredientNames.length > 0) {
        // Start with a reasonable default based on category
        let defaultGrams = 50;
        if (category === 'proteins') defaultGrams = 100; // More protein
        else if (category === 'grains') defaultGrams = 60;
        else if (category === 'greens') defaultGrams = 40;
        else if (category === 'fruits') defaultGrams = 20;
        else if (category === 'supplements') defaultGrams = 5;
        
        // Add all selected ingredients from this category
        ingredientNames.forEach(ingredientName => {
          ingredients.push({
            key: ingredientName,
            grams: defaultGrams
          });
        });
      }
    });

    setSelectedIngredients(ingredients);
    setWizardCompleted(true);
    setShowWizard(false);
    setIsFirstCreation(true); // Mark as first creation to show popup
    
    // Analysis will be triggered automatically by the useEffect when ingredients change
    // After analysis completes, we can update to recommended amounts
  };

  // Handle start over
  const handleStartOver = () => {
    setSelectedIngredients([]);
    setAnalysis(null);
    setWizardCompleted(false);
    setShowWizard(true);
    setShowAddMore(false);
    setHasAppliedRecommended(false);
    setIsFirstCreation(false); // Reset first creation flag
  };

  // Handle add more ingredients
  const handleAddMore = () => {
    setShowAddMore(true);
  };

  // Auto-analyze recipe when ingredients change
  useEffect(() => {
    const analyzeRecipe = async () => {
      if (selectedIngredients.length > 0 && pet) {
        setIsAnalyzing(true);
        try {
          const petProfile = {
            id: pet.id,
            name: pet.names[0] || 'Pet',
            species: pet.type as any,
            lifeStage: pet.age as any, // Maps to 'adult', 'juvenile', etc.
            weightKg: parseFloat(pet.weight?.replace(/[^0-9.]/g, '')) || 5,
            allergies: [],
            activity: 'moderate' as const, // Default activity level
          };

          // Map ingredient display names to composition keys for analysis
          const mappedIngredients = selectedIngredients.map(sel => {
            const compositionKey = mapIngredientToCompositionKey(sel.key) || sel.key.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
            return {
              key: compositionKey,
              grams: sel.grams
            };
          });
          
          const result = generateCustomMealAnalysis(petProfile, mappedIngredients);
          setAnalysis(result);
          
          // After first analysis from wizard, auto-apply recommended amounts once
          if (result.recommendedServingGrams > 0 && selectedIngredients.length > 0 && wizardCompleted && !hasAppliedRecommended) {
            const currentTotal = selectedIngredients.reduce((sum, s) => sum + s.grams, 0);
            if (currentTotal > 0) {
              const recommendedTotal = result.recommendedServingGrams;
              const updatedIngredients = selectedIngredients.map(ing => {
                const ratio = ing.grams / currentTotal;
                return {
                  ...ing,
                  grams: Math.round(recommendedTotal * ratio)
                };
              });
              setSelectedIngredients(updatedIngredients);
              setHasAppliedRecommended(true);
            }
          }
        } catch (error) {
          // Analysis error - handled by error state
        } finally {
          setIsAnalyzing(false);
        }
      } else {
        setAnalysis(null);
      }
    };

    const debounceTimer = setTimeout(analyzeRecipe, 500);
    return () => clearTimeout(debounceTimer);
  }, [selectedIngredients, pet]);

  const addIngredient = (ingredientKey: string) => {
    // Check if ingredient is whitelisted for this species
    if (normalizedSpeciesType && whitelist.length > 0) {
      // ingredientKey might be a display name already, try both
      const displayName = ingredientKey; // Assume it's already a display name from the picker
      if (!isWhitelisted(displayName, normalizedSpeciesType as any)) {
        // Show warning but allow (user can override with vet approval)
        const confirmed = window.confirm(
          `${displayName} is not in the recommended whitelist for ${pet?.type}.\n\n` +
          `This ingredient may not be safe for this species. Please check with your vet before using.\n\n` +
          `Do you want to add it anyway?`
        );
        if (!confirmed) return;
      }
    }
    
    const existing = selectedIngredients.find(s => s.key === ingredientKey);
    if (existing) {
      setSelectedIngredients(prev =>
        prev.map(s =>
          s.key === ingredientKey
            ? { ...s, grams: s.grams + 50 }
            : s
        )
      );
    } else {
      setSelectedIngredients(prev => [...prev, { key: ingredientKey, grams: 50 }]);
    }
  };

  const removeIngredient = (ingredientKey: string) => {
    setSelectedIngredients(prev => prev.filter(s => s.key !== ingredientKey));
  };

  const updateIngredientGrams = (ingredientKey: string, grams: number) => {
    if (grams <= 0) {
      removeIngredient(ingredientKey);
      return;
    }

    setSelectedIngredients(prev =>
      prev.map(s =>
        s.key === ingredientKey
          ? { ...s, grams: Math.round(grams) }
          : s
      )
    );
  };

  const totalGrams = selectedIngredients.reduce((sum, s) => sum + s.grams, 0);

  if (!pet) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0f2c0f' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400"></div>
        <span className="ml-3 text-gray-300">Loading pet data...</span>
      </div>
    );
  }

  // Prepare categories for wizard
  const proteinRequired = !['pocket-pets', 'reptiles'].includes((normalizedSpeciesType || '').toLowerCase());

  const wizardCategories = categorizedIngredients ? {
    proteins: {
      ...categorizedIngredients.proteins,
      required: proteinRequired && categorizedIngredients.proteins.ingredients.length > 0
    },
    grains: {
      ...categorizedIngredients.grains,
      required: false
    },
    greens: {
      ...categorizedIngredients.greens,
      required: false
    },
    fruits: {
      ...categorizedIngredients.fruits,
      required: false
    },
    supplements: {
      ...categorizedIngredients.supplements,
      required: false
    }
  } : null;

  // Show wizard if not completed and no ingredients
  if (showWizard && wizardCategories) {
    return (
      <>
        {/* Species Coverage Badge */}
        {normalizedSpeciesType && (
          <div className="border-b px-4 py-2" style={{ backgroundColor: '#1a3d2e', borderColor: '#2d5a47' }}>
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-300">Ingredient Coverage:</span>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  speciesCoverageLevel === 'full' ? 'bg-green-100 text-green-800' :
                  speciesCoverageLevel === 'beta' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {speciesCoverageLevel === 'full' ? '✓ Full Coverage' :
                   speciesCoverageLevel === 'beta' ? 'β Beta (Expanding)' :
                   '⚠ Limited Data'}
                </span>
                {blacklist.length > 0 && (
                  <span className="text-xs text-gray-500">
                    ({blacklist.length} ingredients to avoid)
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
        <MealBuilderWizard
          isOpen={showWizard}
          onClose={() => setShowWizard(false)}
          onComplete={handleWizardComplete}
          categories={wizardCategories}
          petName={pet.names[0] || 'Pet'}
          petType={normalizedSpeciesType || pet.type}
          recommendedIngredients={recommendedIngredientNames}
        />
        <div className="min-h-screen" style={{ backgroundColor: '#0f2c0f' }} />
      </>
    );
  }

  // Show meal complete view after wizard or if ingredients exist
  if (wizardCompleted || selectedIngredients.length > 0) {
    return (
      <>
        <MealCompleteView
          petName={pet.names[0] || 'Pet'}
          petBreed={pet.breed}
          petAge={pet.age}
          petWeight={pet.weight}
          petId={petId}
          userId={userId || ''}
          selectedIngredients={selectedIngredients}
          analysis={analysis}
          isAnalyzing={isAnalyzing}
          onUpdateAmount={updateIngredientGrams}
          onRemove={removeIngredient}
          onAddMore={handleAddMore}
          onStartOver={handleStartOver}
          petType={pet.type}
          getIngredientDisplayName={(key) => {
            // Normalize key to match vetted products
            const normalized = key
              .toLowerCase()
              .replace(/_/g, ' ')      // chicken_breast → chicken breast
              .replace(/-/g, ' ')      // chicken-breast → chicken breast
              .trim();
            
            // Try to find display name in vetted products
            const product = require('@/lib/data/vetted-products').getVettedProduct(normalized);
            return product?.productName || normalized;
          }}
          isFirstCreation={isFirstCreation}
          getCompatibilityIndicator={(key) => {
            if (!analysis) return null;
            const hasToxicityWarning = analysis.toxicityWarnings.some(w => 
              w.ingredientKey === key || (w.ingredientName && w.ingredientName.toLowerCase().includes(key.toLowerCase()))
            );
            if (hasToxicityWarning) return 'blocked';
            const hasAllergyWarning = analysis.allergyWarnings.some(w => 
              (typeof w === 'string' ? w : w.message).toLowerCase().includes(key.toLowerCase())
            );
            if (hasAllergyWarning) return 'warning';
            return 'safe';
          }}
        />

        {/* Add More Ingredients Modal/View */}
        {showAddMore && categorizedIngredients && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[95vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
                <h2 className="text-xl font-bold text-gray-100">Add More Ingredients</h2>
                <button
                  onClick={() => setShowAddMore(false)}
                  className="p-2 hover:opacity-80 rounded-full transition-colors"
                  style={{ backgroundColor: '#2d5a47' }}
                >
                  <X size={20} className="text-gray-200" />
                </button>
              </div>
              <div className="p-6">
                {/* Recommended Ingredients Quick Add */}
                {suggestedIngredients.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-sm font-semibold text-gray-200">Recommended Additions:</span>
                      <span className="text-xs text-gray-400">Click to add quickly</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {suggestedIngredients
                        .filter(sug => !selectedIngredients.some(sel => sel.key === sug.name))
                        .slice(0, 12)
                        .map((suggestion, idx) => {
                          // Check if this ingredient comes from recommended meals
                          const fromMeal = recommendedMeals.some((meal: any) => {
                            const mealIngredients = meal.recipe?.ingredients || meal.adjustedIngredients || [];
                            return mealIngredients.some((ing: any) => 
                              (ing.name || ing.productName || '').toLowerCase() === suggestion.name.toLowerCase()
                            );
                          });
                          
                          return (
                            <button
                              key={idx}
                              onClick={() => {
                                addIngredient(suggestion.name);
                              }}
                              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-opacity ${
                                fromMeal
                                  ? 'bg-green-50 border border-green-300 text-green-900 hover:opacity-80'
                                  : 'bg-blue-50 border border-blue-200 text-blue-900 hover:opacity-80'
                              }`}
                              title={suggestion.reason}
                            >
                              <span>{fromMeal ? '✨' : '⭐'}</span>
                              <span>{suggestion.name}</span>
                              {fromMeal && (
                                <span className="text-xs opacity-75">(from meals)</span>
                              )}
                            </button>
                          );
                        })}
                    </div>
                    {suggestedIngredients.filter(sug => !selectedIngredients.some(sel => sel.key === sug.name)).length === 0 && (
                      <p className="text-xs text-gray-500 italic">All recommended ingredients have been added</p>
                    )}
                  </div>
                )}

                {/* Search Bar */}
                <div className="mb-4">
                  <IngredientPicker
                    ingredients={availableIngredients.map(name => {
                      let category = 'Other';
                      for (const [catKey, cat] of Object.entries(categorizedIngredients)) {
                        if (cat.ingredients.includes(name)) {
                          category = cat.name;
                          break;
                        }
                      }
                      return { name, category };
                    })}
                    categories={categorizedIngredients}
                    onSelect={(ingredientName) => {
                      addIngredient(ingredientName);
                    }}
                    disabled={isAnalyzing}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Fallback: show original builder (shouldn't reach here normally)
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0f2c0f' }}>
      <div className="text-center">
        <p className="text-gray-300 mb-4">Starting meal builder...</p>
        <button
          onClick={() => setShowWizard(true)}
          className="px-4 py-2 text-white rounded-md hover:opacity-90"
          style={{ backgroundColor: '#16a34a' }}
        >
          Start Wizard
        </button>
      </div>
    </div>
  );
}
