'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { CheckCircle, AlertTriangle, XCircle, Info, Plus, Save, ShoppingCart, Star, ChevronLeft, Edit3 } from 'lucide-react';
import { MealAnalysis, IngredientSelection } from '@/lib/analyzeCustomMeal';
import MealCompositionList from '@/components/MealCompositionList';
import { generateMealName } from '@/lib/utils/mealNameGenerator';
import { saveCustomMeal } from '@/lib/utils/customMealStorage';
import type { Recipe } from '@/lib/types';
import Image from 'next/image';
import Tooltip from '@/components/Tooltip';
import { getPets } from '@/lib/utils/petStorage';
import { getRecommendationsForRecipe } from '@/lib/utils/nutritionalRecommendations';
import { logger } from '@/lib/utils/logger';
import { getProductUrl } from '@/lib/data/product-prices';
import { ShoppingList } from '@/components/ShoppingList';
import { CostComparison } from '@/components/CostComparison';
import { calculateMealsFromGroceryList } from '@/lib/utils/mealEstimation';
import Link from 'next/link';
import { ensureSellerId } from '@/lib/utils/affiliateLinks';
import { buildAmazonSearchUrl } from '@/lib/utils/purchaseLinks';
import { debugEnabled, debugLog } from '@/lib/utils/debugLog';
import CompatibilityRadial from '@/components/CompatibilityRadial';
import { normalizePetType } from '@/lib/utils/petType';
import { scoreWithSpeciesEngine } from '@/lib/utils/speciesScoringEngines';
import { useRecipePricing } from '@/lib/hooks/useRecipePricing';
import { calculateRecipeNutrition } from '@/lib/utils/recipeNutrition';
import { checkAllBadges } from '@/lib/utils/badgeChecker';
import { formatPercent } from '@/lib/utils/formatPercent';
import { getPortionPlan } from '@/lib/portionCalc';
import { getProfilePictureForPetType } from '@/lib/utils/emojiMapping';
import PetCompatibilityBlock from '@/components/PetCompatibilityBlock';
import CustomMadeForLine from '@/components/CustomMadeForLine';
import IngredientsTabImage from '@/public/images/Buttons/ingredients.png';
import SupplementsTabImage from '@/public/images/Buttons/Supplements.png';
import RecipeScoreModal from '@/components/RecipeScoreModal';
import AlphabetText from '@/components/AlphabetText';
import ShoppingListBanner from '@/public/images/Site Banners/ShoppingList.png';
import StorageServingBanner from '@/public/images/Site Banners/unnamed.jpg';
import HealthAnalysisBanner from '@/public/images/Site Banners/HealthAnalysis.png';

interface MealCompleteViewProps {
  petName: string;
  petBreed: string;
  petAge: string;
  petWeight: string;
  petId: string;
  userId: string;
  selectedIngredients: IngredientSelection[];
  analysis: MealAnalysis | null;
  isAnalyzing: boolean;
  onUpdateAmount: (key: string, grams: number) => void;
  onRemove: (key: string) => void;
  onAddMore: () => void;
  onStartOver: () => void;
  getIngredientDisplayName: (key: string) => string;
  getCompatibilityIndicator?: (key: string) => 'safe' | 'warning' | 'blocked' | null;
  isFirstCreation?: boolean; // New prop to indicate if this is the first time creating the meal
  petType?: string; // Pet type (dog, cat, etc.)
}

function extractSafetyFlags(ingredients: Array<{ name?: string } | string>): string[] {
  const items = Array.isArray(ingredients) ? ingredients : [];
  const names = items
    .map((i) => (typeof i === 'string' ? i : i?.name || ''))
    .join(' | ')
    .toLowerCase();

  const flags: Array<{ key: string; text: string }> = [
    { key: 'onion', text: 'Contains onion — may be unsafe for some pets.' },
    { key: 'garlic', text: 'Contains garlic — may be unsafe for some pets.' },
    { key: 'chive', text: 'Contains chives — may be unsafe for some pets.' },
    { key: 'grape', text: 'Contains grapes — may be unsafe for some pets.' },
    { key: 'raisin', text: 'Contains raisins — may be unsafe for some pets.' },
    { key: 'chocolate', text: 'Contains chocolate/cocoa — may be unsafe for some pets.' },
    { key: 'cocoa', text: 'Contains chocolate/cocoa — may be unsafe for some pets.' },
    { key: 'xylitol', text: 'Contains xylitol — may be unsafe for some pets.' },
    { key: 'macadamia', text: 'Contains macadamia — may be unsafe for some pets.' },
    { key: 'alcohol', text: 'Contains alcohol — may be unsafe for some pets.' },
    { key: 'caffeine', text: 'Contains caffeine/coffee/tea — may be unsafe for some pets.' },
    { key: 'coffee', text: 'Contains caffeine/coffee/tea — may be unsafe for some pets.' },
    { key: 'tea', text: 'Contains caffeine/coffee/tea — may be unsafe for some pets.' },
  ];

  const found = new Map<string, string>();
  for (const f of flags) {
    if (names.includes(f.key)) {
      found.set(f.key, f.text);
    }
  }

  return Array.from(found.values());
}

export default function MealCompleteView({
  petName,
  petBreed,
  petAge,
  petWeight,
  petId,
  userId,
  selectedIngredients,
  analysis,
  isAnalyzing,
  onUpdateAmount,
  onRemove,
  onAddMore,
  onStartOver,
  getIngredientDisplayName,
  getCompatibilityIndicator,
  isFirstCreation = false,
  petType = 'dog', // Default to dog if not provided
}: MealCompleteViewProps) {
  const totalGrams = selectedIngredients.reduce((sum, s) => sum + s.grams, 0);
  const [mealName, setMealName] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [pet, setPet] = useState<any>(null);
  const [healthAnalysis, setHealthAnalysis] = useState<any>(null);
  const [isCalculatingHealthAnalysis, setIsCalculatingHealthAnalysis] = useState(false);
  const [activeTab, setActiveTab] = useState<'ingredients' | 'supplements'>('ingredients');
  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);
  const [scoreContext, setScoreContext] = useState<{ recipe: Recipe; pet: any } | null>(null);
  const renameInputRef = useRef<HTMLInputElement | null>(null);
  const [isRenamingMeal, setIsRenamingMeal] = useState(false);
  const [draftMealName, setDraftMealName] = useState('');

  const debug = debugEnabled;

  const portionPlan = useMemo(() => {
    if (!analysis || !pet) return null;
    const normalizedType = normalizePetType(pet.type, 'MealCompleteView.portionPlan');
    if (normalizedType !== 'dog' && normalizedType !== 'cat') return null;

    const weightKg = typeof pet.weightKg === 'number' && pet.weightKg > 0 ? pet.weightKg : (parseFloat(String(pet.weight || '')) || 0);
    if (!Number.isFinite(weightKg) || weightKg <= 0) return null;

    const profile = {
      species: normalizedType === 'dog' ? 'dogs' : 'cats',
      ageGroup: pet.age || 'adult',
      weightKg,
      breed: pet.breed || null,
      healthConcerns: pet.healthConcerns || [],
      allergies: pet.allergies || [],
      petName: petName,
    };

    const recipeForPortion = {
      id: 'custom',
      name: mealName || 'Custom meal',
      category: normalizedType === 'dog' ? 'dogs' : 'cats',
      ageGroup: ['adult'],
      healthConcerns: [],
      ingredients: selectedIngredients.map((s, idx) => ({ id: String(idx), name: getIngredientDisplayName(s.key), amount: `${s.grams}g` })),
      instructions: [],
      nutritionalInfo: {
        calories: {
          min: (analysis.nutrients as any).kcal ?? (analysis.nutrients as any).calories_kcal ?? (analysis.nutrients as any).energy_kcal ?? 0,
          max: (analysis.nutrients as any).kcal ?? (analysis.nutrients as any).calories_kcal ?? (analysis.nutrients as any).energy_kcal ?? 0,
          unit: 'kcal',
        },
      },
    } as any;

    try {
      return getPortionPlan(recipeForPortion, profile as any);
    } catch {
      return null;
    }
  }, [analysis, pet, selectedIngredients, getIngredientDisplayName, petName, mealName]);

  useEffect(() => {
    if (!mealName) {
      setMealName('Custom Meal');
    }
  }, [mealName]);

  useEffect(() => {
    if (isRenamingMeal) {
      setDraftMealName(mealName.trim() || 'Custom Meal');
      renameInputRef.current?.focus();
      renameInputRef.current?.select();
    }
  }, [isRenamingMeal, mealName]);

  const commitRename = useCallback(() => {
    const next = draftMealName.trim();
    setMealName(next.length > 0 ? next : 'Custom Meal');
    setIsRenamingMeal(false);
  }, [draftMealName]);

  const cancelRename = useCallback(() => {
    setDraftMealName(mealName.trim() || 'Custom Meal');
    setIsRenamingMeal(false);
  }, [mealName]);

  const handleRenameKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        commitRename();
      }
      if (event.key === 'Escape') {
        event.preventDefault();
        cancelRename();
      }
    },
    [commitRename, cancelRename],
  );

  const handleSaveMeal = async () => {
    if (!analysis || !mealName.trim()) {
      return;
    }

    setIsSaving(true);
    try {
      await saveCustomMeal(userId, petId, mealName.trim(), selectedIngredients, analysis);
      setIsSaved(true);
    } catch (error) {
      logger.error('Error saving meal:', error);
      setIsSaved(false);
    } finally {
      setIsSaving(false);
    }
  };

  // Load pet data for health analysis
  useEffect(() => {
    async function loadPet() {
      try {
        const pets = await getPets(userId);
        const foundPet = pets.find((p: any) => p.id === petId);
        if (foundPet) {
          setPet(foundPet);
        }
      } catch (error) {
        console.error('Failed to load pet:', error);
      }
    }
    if (userId && petId) {
      loadPet();
    }
  }, [userId, petId]);

  // Diagnostic logging - MOVED BELOW DECLARATIONS to avoid TDZ error

  // Calculate health analysis when analysis and ingredients are available
  // We can work with pet props directly if pet object isn't loaded yet
  useEffect(() => {
    if (!analysis || selectedIngredients.length === 0) {
      setHealthAnalysis(null);
      setScoreContext(null);
      setIsCalculatingHealthAnalysis(false);
      return;
    }

    // Set calculating state
    setIsCalculatingHealthAnalysis(true);

    try {
      // Convert custom meal to Recipe format
      const recipe: Recipe = {
        id: `custom-meal-${Date.now()}`,
        name: mealName || 'Custom Meal',
        category: petType || 'dog',
        ageGroup: [petAge === 'baby' ? 'baby' : petAge === 'young' ? 'young' : petAge === 'senior' ? 'senior' : 'adult'],
        healthConcerns: [],
        ingredients: selectedIngredients.map((ing, idx) => ({
          id: `${idx + 1}`,
          name: getIngredientDisplayName(ing.key),
          amount: `${ing.grams}g`,
        })),
        instructions: [],
        nutritionalInfo: analysis.nutrients ? {
          protein: {
            min: (analysis.nutrients.protein_g || 0) / (totalGrams / 100),
            max: (analysis.nutrients.protein_g || 0) / (totalGrams / 100),
            unit: '%',
          },
          fat: {
            min: (analysis.nutrients.fat_g || 0) / (totalGrams / 100),
            max: (analysis.nutrients.fat_g || 0) / (totalGrams / 100),
            unit: '%',
          },
        } : undefined,
        // Add nutritionalCalculation field with actual analysis data for enhanced compatibility scoring
        nutritionalCalculation: analysis.nutrients ? {
          protein_g: analysis.nutrients.protein_g || 0,
          fat_g: analysis.nutrients.fat_g || 0,
          ca_mg: analysis.nutrients.ca_mg || 0,
          p_mg: analysis.nutrients.p_mg || 0,
          calories_kcal: analysis.nutrients.calories_kcal || analysis.nutrients.kcal || analysis.nutrients.energy_kcal || 0,
          fiber_g: analysis.nutrients.fiber_g || 0,
          totalGrams: totalGrams,
        } : undefined,
      } as any;

      const scoringPet = {
        id: pet?.id || petId,
        name: petName,
        type: normalizePetType(petType || pet?.type || 'dog', 'MealCompleteView'),
        breed: petBreed || pet?.breed || '',
        age: petAge === 'baby' ? 0.5 : petAge === 'young' ? 2 : petAge === 'senior' ? 10 : 5,
        weight: parseFloat(petWeight) || pet?.weightKg || 10,
        activityLevel: pet?.activityLevel || 'moderate',
        healthConcerns: pet?.healthConcerns || [],
        dietaryRestrictions: pet?.allergies || [],
        allergies: pet?.allergies || [],
      } as any;

      const scored = scoreWithSpeciesEngine(recipe, scoringPet);

      const nutrition = calculateRecipeNutrition(recipe);
      const fallbackNutritionalGaps: string[] = [];
      if ((scoringPet as any).type === 'cat') {
        const joined = (recipe.ingredients || []).map((i: any) => String(i?.name || '')).join(' ').toLowerCase();
        if (!joined.includes('taurine') && !joined.includes('heart')) fallbackNutritionalGaps.push('taurine');
      }
      if (nutrition.protein < 18) fallbackNutritionalGaps.push('protein');
      if (nutrition.fiber < 2) fallbackNutritionalGaps.push('fiber');
      if (nutrition.calcium > 0 && nutrition.phosphorus > 0) {
        const ratio = nutrition.calcium / nutrition.phosphorus;
        if (ratio < 1.0 || ratio > 2.0) fallbackNutritionalGaps.push('ca:p');
      } else {
        if (nutrition.calcium <= 0) fallbackNutritionalGaps.push('calcium');
        if (nutrition.phosphorus <= 0) fallbackNutritionalGaps.push('phosphorus');
      }

      const rawBreakdown = scored.raw?.factors ?? {};
      const breakdown = Object.entries(rawBreakdown).reduce(
        (acc, [key, factor]) => {
          const f = factor as {
            score?: number;
            weight?: number;
            reasoning?: string;
            issues?: string[];
            strengths?: string[];
            recommendations?: any[];
          };
          const score = typeof f.score === 'number' && Number.isFinite(f.score) ? f.score : 0;
          const weight = typeof f.weight === 'number' && Number.isFinite(f.weight) ? f.weight : 0;
          acc[key] = {
            score,
            weightedContribution: Math.round(score * weight),
            weight,
            reason:
              f.reasoning && f.reasoning.trim().length > 0
                ? f.reasoning
                : (Array.isArray(f.issues) && f.issues.length > 0
                    ? f.issues.join('; ')
                    : Array.isArray(f.strengths) && f.strengths.length > 0
                      ? f.strengths.join('; ')
                      : ''),
            recommendations: f.recommendations,
          };
          return acc;
        },
        {} as Record<string, { score: number; weightedContribution: number; weight: number; reason?: string; recommendations?: any[] }>,
      );

      const rawRecommendations = Array.isArray(scored.raw?.detailedBreakdown?.recommendations)
        ? (scored.raw?.detailedBreakdown?.recommendations as any[])
        : [];
      const fallbackRecommendations =
        scored.overallScore < 80
          ? getRecommendationsForRecipe(
              fallbackNutritionalGaps,
              (scoringPet as any).type,
              (scoringPet as any).healthConcerns || [],
            )
          : [];
      const combinedRecommendations = rawRecommendations.length > 0 ? rawRecommendations : fallbackRecommendations;
      const supplementRecommendations = combinedRecommendations.filter((r: any) => !r?.isIngredient);

      const rawNutritionalGaps = Array.isArray(scored.raw?.detailedBreakdown?.nutritionalGaps)
        ? (scored.raw?.detailedBreakdown?.nutritionalGaps as string[])
        : [];
      const nutritionalGaps = rawNutritionalGaps.length > 0 ? rawNutritionalGaps : fallbackNutritionalGaps;

      const summaryReasoning = scored.warnings.length > 0
        ? scored.warnings.slice(0, 3).join('. ')
        : scored.strengths.length > 0
          ? scored.strengths.slice(0, 3).join('. ')
          : 'Custom meal evaluated for compatibility with your pet.';

      setHealthAnalysis({
        overallScore: scored.overallScore,
        compatibility:
          scored.grade === 'A+' || scored.grade === 'A'
            ? 'excellent'
            : scored.grade === 'B+' || scored.grade === 'B'
              ? 'good'
              : scored.grade === 'C+' || scored.grade === 'C'
                ? 'fair'
                : 'poor',
        breakdown,
        warnings: scored.warnings,
        strengths: scored.strengths,
        nutritionalGaps,
        recommendations: supplementRecommendations,
        summaryReasoning,
        usesFallbackNutrition:
          Array.isArray(scored.raw?.detailedBreakdown?.nutritionalGaps) &&
          scored.raw?.detailedBreakdown?.nutritionalGaps.includes('fallback-nutrition'),
      });

      setScoreContext({
        recipe,
        pet: {
          ...scoringPet,
          weightKg: scoringPet.weightKg ?? scoringPet.weight,
        },
      });

      // Check badges on meal creation (Preparation + Perfect Match if applicable)
      if (userId && petId) {
        checkAllBadges(userId, petId, {
          action: 'meal_created',
          compatibilityScore: scored.overallScore,
        }).catch(err => {
          logger.error('Failed to check badges', err);
        });
      }

      // Successfully calculated
      setIsCalculatingHealthAnalysis(false);
    } catch (error) {
      // Log error but don't hide the compatibility score
      console.error('Error calculating enhanced health analysis:', error);
      logger.error('Error calculating enhanced health analysis', error);
      setScoreContext(null);
      setIsCalculatingHealthAnalysis(false);
    }
  }, [pet, analysis, selectedIngredients, mealName, petName, petBreed, petAge, petWeight, petType, petId, getIngredientDisplayName, totalGrams, userId]);

  // Generate meal name when ingredients are first set
  useEffect(() => {
    if (selectedIngredients.length > 0 && !mealName) {
      const ingredientKeys = selectedIngredients.map(ing => ing.key);
      
      // Extract nutritional profile from analysis
      const nutritionalProfile = analysis ? {
        protein: analysis.nutrients?.protein_g ? (analysis.nutrients.protein_g / totalGrams) * 100 : undefined,
        fat: analysis.nutrients?.fat_g ? (analysis.nutrients.fat_g / totalGrams) * 100 : undefined,
        fiber: analysis.nutrients?.fiber_g ? (analysis.nutrients.fiber_g / totalGrams) * 100 : undefined,
      } : undefined;
      
      const result = generateMealName(ingredientKeys, {
        petName,
        petBreed,
        petSpecies: petType,
        healthConcerns: pet?.healthConcerns || [],
        nutritionalProfile,
        mealType: 'complete',
        isCustomMeal: true,
      });
      
      setMealName(result.fullName);
    }
  }, [selectedIngredients, mealName, analysis, totalGrams, petName, petBreed, petType, pet]);


  // Calculate recommended amounts per ingredient based on total recommended serving
  const calculateRecommendedAmounts = (): { [key: string]: number } => {
    if (!analysis || !analysis.recommendedServingGrams || analysis.recommendedServingGrams <= 0) {
      return {};
    }

    const recommendedTotal = analysis.recommendedServingGrams;
    const currentTotal = totalGrams;
    
    if (currentTotal <= 0) return {};

    // Distribute recommended total proportionally based on current ingredient ratios
    const recommendedAmounts: { [key: string]: number } = {};
    selectedIngredients.forEach(ing => {
      const ratio = ing.grams / currentTotal;
      recommendedAmounts[ing.key] = Math.round(recommendedTotal * ratio);
    });

    return recommendedAmounts;
  };

  const recommendedAmounts = calculateRecommendedAmounts();

  // Estimate how many servings the current recipe batch makes, based on
  // total grams vs recommended serving size from analysis. This lets the
  // meal estimation logic work with per-meal ingredient usage instead of
  // treating the full batch amount as a single meal.
  const recipeServings = useMemo(() => {
    if (!analysis?.recommendedServingGrams || analysis.recommendedServingGrams <= 0) {
      return undefined;
    }
    if (totalGrams <= 0) {
      return undefined;
    }

    const rawServings = totalGrams / analysis.recommendedServingGrams;
    if (!Number.isFinite(rawServings) || rawServings <= 0) {
      return undefined;
    }

    // Ensure a sensible whole-number serving count (at least 1)
    return Math.max(1, Math.round(rawServings));
  }, [analysis?.recommendedServingGrams, totalGrams]);

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


  // Get display score and compatibility
  const displayScore = healthAnalysis?.overallScore ?? (analysis?.score ?? 0);
  const displayScoreRounded = Math.round(displayScore);
  const compatibility = healthAnalysis?.compatibility ?? 
    (displayScore >= 80 ? 'excellent' : displayScore >= 60 ? 'good' : displayScore >= 40 ? 'fair' : 'poor');
  const canShowScoreDetails = !!scoreContext;
  const hasCompatibilityScore = Boolean(healthAnalysis) || (typeof analysis?.score === 'number' && Number.isFinite(analysis.score));

  const scoreAdvisory =
    displayScoreRounded < 70
      ? '⚠️ Needs attention — add supplements or adjust ingredients.'
      : displayScoreRounded < 80
        ? 'Add the recommended supplements to reach complete nutrition.'
        : 'Great match for your pet!';
  const scoreAdvisoryClass =
    displayScoreRounded < 70 ? 'text-red-300' : displayScoreRounded < 80 ? 'text-amber-300' : 'text-gray-400';
  const healthScore = typeof healthAnalysis?.overallScore === 'number' ? healthAnalysis.overallScore : null;
  const recommendedPanelClass =
    healthScore !== null && healthScore < 70 ? 'bg-red-900/30 border-red-700/60' : 'bg-orange-900/20 border border-orange-700/50';
  const recommendedHeadingClass =
    healthScore !== null && healthScore < 70 ? 'text-red-200' : 'text-orange-200';
  const HEALTH_BREAKDOWN_ORDER = ['ingredientSafety', 'nutritionalAdequacy', 'healthAlignment', 'ingredientQuality'];
  const HEALTH_BREAKDOWN_LABELS: Record<string, string> = {
    ingredientSafety: 'ingredient safety',
    nutritionalAdequacy: 'nutritional adequacy',
    healthAlignment: 'health alignment',
    ingredientQuality: 'ingredient quality',
  };

  const handleOpenScoreModal = useCallback(() => {
    if (!scoreContext) return;
    if (userId && petId) {
      checkAllBadges(userId, petId, { action: 'score_details_viewed' }).catch(() => {
        // ignore
      });
    }
    setIsScoreModalOpen(true);
  }, [scoreContext, userId, petId]);

  const SUPPLEMENT_KEYWORDS = [
    'vitamin',
    'mineral',
    'supplement',
    'probiotic',
    'enzyme',
    'omega',
    'fish oil',
    'salmon oil',
    'anchovy oil',
    'sardine oil',
    'mackerel oil',
    'krill oil',
    'algae oil',
    'herring oil',
    'oil',
    'calcium',
    'carbonate',
    'eggshell',
    'taurine',
    'psyllium',
    'glucosamine',
    'chondroitin',
    'sam-e',
    's-adenosyl',
    'quercetin',
    'curcumin',
    'l-carnitine',
    'd-mannose',
    'fructooligosaccharides',
    'fos',
    'inulin',
    'mannanoligosaccharides',
    'mos',
    'beta-glucan',
    'hyaluronic',
    'b complex',
  ];

  const isSupplementLikeName = (name: string) => {
    const n = String(name || '')
      .toLowerCase()
      .trim()
      .replace(/_/g, ' ')
      .replace(/\s+/g, ' ');
    if (!n) return false;
    return SUPPLEMENT_KEYWORDS.some((kw) => n.includes(kw));
  };

  const { ingredientSelections, supplementSelections } = useMemo(() => {
    const ingredientSelections: IngredientSelection[] = [];
    const supplementSelections: IngredientSelection[] = [];

    for (const ing of selectedIngredients) {
      const displayName = getIngredientDisplayName(ing.key);
      if (isSupplementLikeName(displayName)) supplementSelections.push(ing);
      else ingredientSelections.push(ing);
    }

    return { ingredientSelections, supplementSelections };
  }, [selectedIngredients, getIngredientDisplayName]);

  // Prepare ingredients for ShoppingList (memoized)
  const ingredientsWithASINs = useMemo(() => {
    if (debugEnabled) debugLog('[MealCompleteView] ========== ingredientsWithASINs Calculation ==========');
    if (debugEnabled) debugLog('[MealCompleteView] selectedIngredients:', selectedIngredients);
    if (debugEnabled) debugLog('[MealCompleteView] selectedIngredients.length:', selectedIngredients.length);
    
    const result = ingredientSelections
      .map((ing, index) => {
        if (debugEnabled) debugLog(`[MealCompleteView] Processing ingredient ${index + 1}:`, ing);
        const displayName = getIngredientDisplayName(ing.key);
        if (debugEnabled) debugLog(`[MealCompleteView]   Display name from getIngredientDisplayName:`, displayName);
        
        const link = getProductUrl(displayName);
        if (debugEnabled) debugLog(`[MealCompleteView]   Product-prices purchase link:`, link);

        const item = {
          id: ing.key,
          name: displayName,
          amount: `${ing.grams}g`,
          ...(link ? { asinLink: ensureSellerId(link) } : {}),
          amazonSearchUrl: ensureSellerId(buildAmazonSearchUrl(displayName)),
        };
        if (debugEnabled) debugLog(`[MealCompleteView]   ✅ Added to ingredientsWithASINs:`, item);
        return item;
      })
      .filter(Boolean) as Array<{ id: string; name: string; amount: string; asinLink?: string; amazonSearchUrl?: string }>;
    
    if (debugEnabled) debugLog('[MealCompleteView] Final ingredientsWithASINs array:', result);
    if (debugEnabled) debugLog('[MealCompleteView] ingredientsWithASINs.length:', result.length);
    if (debugEnabled) debugLog('[MealCompleteView] =====================================================');
    return result;
  }, [debugEnabled, ingredientSelections, getIngredientDisplayName, selectedIngredients]);

  const ingredientsWithoutASINs = useMemo(() => {
    return ingredientSelections
      .filter(ing => {
        const displayName = getIngredientDisplayName(ing.key);
        const link = getProductUrl(displayName);
        return !link;
      })
      .map(ing => ({
        id: ing.key,
        name: getIngredientDisplayName(ing.key),
        amount: `${ing.grams}g`,
      }));
  }, [ingredientSelections, getIngredientDisplayName]);

  const supplementItems = useMemo(() => {
    return supplementSelections.map((ing) => {
      const displayName = getIngredientDisplayName(ing.key);
      const link = getProductUrl(displayName);
      return {
        id: ing.key,
        name: displayName,
        amount: `${ing.grams}g`,
        ...(link ? { asinLink: ensureSellerId(link) } : {}),
        amazonSearchUrl: ensureSellerId(buildAmazonSearchUrl(displayName)),
      };
    });
  }, [supplementSelections, getIngredientDisplayName]);

  // Get recommended supplements
  const recommendedSupplements = healthAnalysis?.recommendations || [];
  const recommendedSupplementShoppingItems = useMemo(() => {
    return recommendedSupplements.map((supplement, index) => {
      const baseId = (supplement.name || supplement.productName || `supplement-${index}`)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-');
      const link = supplement.asinLink || supplement.amazonLink;
      const fallbackName = supplement.productName || supplement.name || 'Recommended supplement';

      return {
        id: `recommended-${index}-${baseId}`,
        name: fallbackName,
        amount: supplement.defaultAmount || 'As directed',
        ...(link ? { asinLink: ensureSellerId(link) } : {}),
        amazonSearchUrl: ensureSellerId(
          buildAmazonSearchUrl(supplement.name || supplement.productName || 'pet supplement'),
        ),
      };
    });
  }, [recommendedSupplements]);

  const allSupplementShoppingItems = useMemo(
    () => [...supplementItems, ...recommendedSupplementShoppingItems],
    [supplementItems, recommendedSupplementShoppingItems],
  );

  // Calculate meal estimate only for CostComparison component
  const mealEstimateForCost = useMemo(() => {
    if (debug) debugLog('[MealCompleteView] Calculating mealEstimateForCost...');
    if (debug) debugLog('[MealCompleteView] ingredientsWithASINs:', ingredientsWithASINs);
    
    if (!ingredientsWithASINs || ingredientsWithASINs.length === 0) {
      if (debug) debugLog('[MealCompleteView] No ingredients with ASINs, returning null');
      return null;
    }
    
    try {
      const shoppingListItems = ingredientsWithASINs.map(ing => {
        return {
          id: ing.id,
          name: ing.name,
          amount: ing.amount,
          category: undefined
        };
      });
      
      if (debug) debugLog('[MealCompleteView] Shopping list items for calculation:', shoppingListItems);
      
      // Use the dedicated meal estimation utility, passing in inferred
      // recipeServings so amounts are interpreted as per-meal usage
      // rather than as a single-meal batch.
      const result = calculateMealsFromGroceryList(
        shoppingListItems,
        undefined,
        petType,
        true,
        recipeServings
      );
      if (debug) debugLog('[MealCompleteView] mealEstimateForCost result:', result);
      return result;
    } catch (error) {
      console.error('[MealCompleteView] Error calculating meal estimate for cost:', error);
      return null;
    }
  }, [debug, ingredientsWithASINs, petType, recipeServings]);

  const recipeForPricing = useMemo(() => {
    const servings = typeof recipeServings === 'number' && recipeServings > 0 ? recipeServings : 1;

    return {
      id: 'custom',
      name: mealName || 'Custom meal',
      servings,
      category: petType,
      ageGroup: ['adult'],
      healthConcerns: [],
      ingredients: selectedIngredients.map((s, idx) => ({
        id: String(idx),
        name: getIngredientDisplayName(s.key),
        amount: `${s.grams}g`,
      })),
      instructions: [],
      nutritionalInfo: {
        calories: {
          min: 0,
          max: 0,
          unit: 'kcal',
        },
      },
    } as any;
  }, [getIngredientDisplayName, mealName, petType, recipeServings, selectedIngredients]);

  const { pricingByRecipeId: apiPricingById } = useRecipePricing(recipeForPricing ? [recipeForPricing] : null);
  const apiPricing = apiPricingById?.[String((recipeForPricing as any)?.id || '')];
  const apiCostPerMeal = apiPricing?.costPerMealUsd;
  const canonicalCostPerMeal =
    typeof apiCostPerMeal === 'number' && Number.isFinite(apiCostPerMeal) && apiCostPerMeal > 0
      ? apiCostPerMeal
      : null;
  const fallbackCostPerMeal =
    typeof mealEstimateForCost?.costPerMeal === 'number' && Number.isFinite(mealEstimateForCost.costPerMeal) && mealEstimateForCost.costPerMeal > 0
      ? mealEstimateForCost.costPerMeal
      : null;
  const costPerMealForDisplay = canonicalCostPerMeal ?? fallbackCostPerMeal;

  // Diagnostic logging - NOW AFTER DECLARATIONS
  useEffect(() => {
    if (!debug) return;

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/0b2cb572-34bf-468c-9297-dd079c8c4c2d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'MealCompleteView.tsx:463',message:'Diagnostic useEffect executing',data:{hasIngredientsWithASINs:!!ingredientsWithASINs,length:ingredientsWithASINs?.length,hasMealEstimate:!!mealEstimateForCost},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion

    console.group('🔍 MealCompleteView Diagnostic');
    console.log('selectedIngredients:', selectedIngredients);
    console.log('selectedIngredients.length:', selectedIngredients.length);
    console.log('ingredientsWithASINs:', ingredientsWithASINs);
    console.log('ingredientsWithASINs.length:', ingredientsWithASINs.length);
    if (ingredientsWithASINs.length > 0) {
      const testItem = ingredientsWithASINs[0];
      console.log('First ingredient:', testItem);
      const pricedUrl = getProductUrl(testItem.name);
      console.log('Product-prices url for first ingredient:', pricedUrl);
    }
    console.log('mealEstimateForCost:', mealEstimateForCost);
    console.log('apiCostPerMeal:', canonicalCostPerMeal);
    console.groupEnd();
  }, [debug, selectedIngredients, ingredientsWithASINs, mealEstimateForCost, canonicalCostPerMeal]);

  return (
    <div className="min-h-screen bg-background py-12 font-sans text-foreground">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <Link
          href={`/profile/pet/${petId}`}
          className="inline-flex items-center text-gray-400 hover:text-primary-400 mb-6 font-medium transition-colors"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          Back to Pet Profile
        </Link>

        {/* Full-width hero */}
        <div className="bg-surface rounded-2xl shadow-xl overflow-hidden mb-8 border border-surface-highlight">
          <div className="p-8 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
            <div className="flex-1 min-w-0 lg:pr-[260px]">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-4xl font-extrabold text-foreground tracking-tight leading-tight break-words">
                  <AlphabetText text={mealName.trim() || 'Custom Meal'} size={40} />
                </h1>
                <button
                  type="button"
                  onClick={() => setIsRenamingMeal(true)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-surface-highlight bg-surface-highlight/50 text-gray-300 hover:border-orange-500/50 hover:text-orange-200 transition-colors"
                  aria-label="Rename meal"
                >
                  <Edit3 size={16} />
                </button>
              </div>
              {isRenamingMeal && (
                <div className="mt-3 max-w-xl">
                  <input
                    ref={renameInputRef}
                    type="text"
                    value={draftMealName}
                    onChange={(event) => setDraftMealName(event.target.value)}
                    onBlur={commitRename}
                    onKeyDown={handleRenameKeyDown}
                    className="w-full px-4 py-2.5 text-base font-semibold text-foreground bg-surface-highlight border border-surface-highlight rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Enter meal name..."
                  />
                  <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
                    <span>Press Enter to save</span>
                    <button type="button" onClick={cancelRename} className="text-orange-200 hover:text-orange-100">Cancel</button>
                  </div>
                </div>
              )}
              <CustomMadeForLine petName={petName} />
              {isCalculatingHealthAnalysis && !healthAnalysis && (
                <div className="mt-4 flex flex-col gap-3 text-sm text-gray-400">
                  <span className="text-xs text-gray-500">Calculating enhanced score…</span>
                </div>
              )}
            </div>
            <div className="flex flex-col items-center gap-4 lg:min-w-[220px]">
              <PetCompatibilityBlock
                avatarSrc={getProfilePictureForPetType(pet?.type || petType)}
                avatarAlt={`${petName} profile`}
                spacerClassName="w-16 shrink-0 bg-surface"
                right={
                  <div className="flex flex-col items-center gap-3">
                    <button
                      type="button"
                      onClick={handleOpenScoreModal}
                      disabled={!canShowScoreDetails}
                      className={`rounded-2xl border border-surface-highlight bg-surface-lighter px-6 py-5 transition-colors ${
                        canShowScoreDetails ? 'hover:border-orange-500/40' : 'opacity-60 cursor-not-allowed'
                      }`}
                      aria-label="View compatibility details"
                    >
                      <div className="flex items-center gap-5">
                        <CompatibilityRadial score={displayScoreRounded} size={118} strokeWidth={10} label="" />
                        <div className="text-left">
                          <div className="text-sm font-semibold text-gray-200">Compatibility</div>
                          <div className="text-xs text-gray-400 mt-1">Click for details</div>
                        </div>
                      </div>
                    </button>
                    {hasCompatibilityScore && (
                      <div className={`text-sm font-semibold text-center ${scoreAdvisoryClass}`}>{scoreAdvisory}</div>
                    )}
                  </div>
                }
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        <main className="lg:col-span-3">
          {/* Ingredients & Supplements Tabs */}
          <div className="bg-surface rounded-2xl shadow-lg p-8 mb-8 border border-surface-highlight">
            <div className="mb-6 flex justify-center">
              <Image
                src={ShoppingListBanner}
                alt="Shopping list"
                className="h-auto w-full max-w-md border border-surface-highlight rounded-lg"
                unoptimized
              />
            </div>
            {/* Tab Navigation */}
            <div className="flex border-b border-surface-highlight mb-6">
              <button
                onClick={() => setActiveTab('ingredients')}
                className={`group px-6 py-3 font-semibold text-sm border-b-2 transition-colors ${
                  activeTab === 'ingredients'
                    ? 'border-orange-500 text-orange-400'
                    : 'border-transparent text-gray-500 hover:text-gray-300'
                }`}
              >
                <span className="sr-only">Ingredients</span>
                <Image
                  src={IngredientsTabImage}
                  alt="Ingredients"
                  className={`h-8 w-auto ${activeTab === 'ingredients' ? '' : 'opacity-70 group-hover:opacity-100'}`}
                  unoptimized
                />
              </button>
              <button
                onClick={() => setActiveTab('supplements')}
                className={`group px-6 py-3 font-semibold text-sm border-b-2 transition-colors ${
                  activeTab === 'supplements'
                    ? 'border-orange-500 text-orange-400'
                    : 'border-transparent text-gray-500 hover:text-gray-300'
                }`}
              >
                <span className="sr-only">Supplements</span>
                <Image
                  src={SupplementsTabImage}
                  alt="Supplements"
                  className={`h-8 w-auto ${activeTab === 'supplements' ? '' : 'opacity-70 group-hover:opacity-100'}`}
                  unoptimized
                />
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'ingredients' && (
              <div className="relative">
                <div className="space-y-6">
                  {/* Ingredients with ASIN links */}
                  {ingredientsWithASINs.length > 0 && (
                    <ShoppingList
                      ingredients={ingredientsWithASINs}
                      recipeName={mealName || 'Custom Meal'}
                      userId={userId}
                      selectedIngredients={selectedIngredients}
                      totalGrams={totalGrams}
                      recommendedServingGrams={analysis?.recommendedServingGrams}
                      showHeader={false}
                    />
                  )}

                  {selectedIngredients.length === 0 && (
                    <div className="text-center py-8 text-gray-400 text-sm">
                      No ingredients added yet.
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'supplements' && (
              <div className="relative space-y-6">
                {allSupplementShoppingItems.length > 0 ? (
                  <ShoppingList
                    ingredients={allSupplementShoppingItems}
                    recipeName={mealName || 'Custom Meal'}
                    userId={userId}
                    selectedIngredients={selectedIngredients}
                    totalGrams={totalGrams}
                    recommendedServingGrams={analysis?.recommendedServingGrams}
                    showHeader={false}
                  />
                ) : (
                  <div className="text-center py-6 text-gray-400 text-sm">
                    No supplements added yet.
                  </div>
                )}

                {/* Recommended Supplements */}
                {recommendedSupplements.length > 0 && (
                  <div className={`${recommendedPanelClass} rounded-lg p-6`}>
                    <h3 className={`text-lg font-semibold ${recommendedHeadingClass} mb-4 flex items-center gap-2`}>
                      <span>💊</span>
                      Recommended Supplements
                    </h3>
                    {healthScore !== null && healthScore < 70 ? (
                      <p className="text-sm text-red-200 mb-4">
                        This meal still needs support — add the supplements below or adjust ingredients before serving.
                      </p>
                    ) : (
                      <p className="text-sm text-gray-400 mb-4">
                        These supplements can help address nutritional deficiencies in this meal:
                      </p>
                    )}
                    <div className="space-y-3">
                      {recommendedSupplements.map((supplement: any, index: number) => (
                        <div key={index} className="bg-surface rounded-lg p-4 border border-surface-highlight">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h5 className="font-semibold text-gray-200">{supplement.productName || supplement.name}</h5>
                              <p className="text-sm text-gray-400 mt-1">{supplement.description}</p>
                              <p className="text-xs text-orange-300 mt-2">
                                Addresses: {supplement.addressesDeficiency}
                              </p>
                              <p className="text-sm text-gray-300 mt-2">
                                <strong>Benefits:</strong> {supplement.benefits}
                              </p>
                              <p className="text-sm text-gray-400 mt-1">
                                <strong>Amount:</strong> {supplement.defaultAmount}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {recommendedSupplements.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>No supplements recommended for this meal.</p>
                    <p className="text-sm mt-2">Check the ingredients tab for all components.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Cost Comparison */}
          {ingredientsWithASINs.length > 0 && costPerMealForDisplay && costPerMealForDisplay > 0 && (
            <div className="mb-8">
              {canonicalCostPerMeal ? (
                <CostComparison
                  costPerMeal={canonicalCostPerMeal}
                  pricingSource={apiPricing?.pricingSource}
                  asOf={apiPricing?.asOf}
                  missingIngredientCount={Array.isArray(apiPricing?.missingIngredientKeys) ? apiPricing?.missingIngredientKeys.length : 0}
                  isComplete={apiPricing?.isComplete}
                />
              ) : (
                mealEstimateForCost && mealEstimateForCost.costPerMeal > 0 && (
                  <CostComparison
                    costPerMeal={mealEstimateForCost.costPerMeal}
                    totalCost={mealEstimateForCost.totalCost}
                    estimatedMeals={mealEstimateForCost.estimatedMeals}
                    exceedsBudget={mealEstimateForCost.exceedsBudget || false}
                  />
                )
              )}
            </div>
          )}
        </main>

        <aside className="lg:col-span-2 space-y-8">
            {/* Health Analysis Panel */}
            {healthAnalysis && (
              <div className="bg-surface rounded-2xl shadow-lg p-6 border-l-4 border-green-500 border border-surface-highlight">
                <div className="mb-4 flex justify-center">
                  <Image
                    src={HealthAnalysisBanner}
                    alt="Health analysis"
                    className="h-auto w-full max-w-xs border border-surface-highlight rounded-lg"
                    unoptimized
                  />
                </div>
                <div className="mb-4 flex justify-center">
                  <Image
                    src="/images/emojis/Mascots/Proffessor Purfessor/PUrfessorDesk.jpg"
                    alt="Professor Purfessor"
                    width={280}
                    height={210}
                    className="rounded-lg object-contain"
                    unoptimized
                  />
                </div>
                <p className="text-xs text-gray-400 mb-4">
                  Professor Purfessor is here to break it down for you!
                </p>
                <div className="space-y-3">
                  {HEALTH_BREAKDOWN_ORDER.map((factorKey) => {
                    const factor = (healthAnalysis.breakdown as any)?.[factorKey];
                    if (!factor) return null;

                    const f = factor as {
                      score?: number;
                      weight?: number;
                      reason?: string;
                      recommendations?: any[];
                    };
                    const score = typeof f.score === 'number' && Number.isFinite(f.score) ? f.score : 0;
                    const weight = typeof f.weight === 'number' && Number.isFinite(f.weight) ? f.weight : 0;
                    const label = HEALTH_BREAKDOWN_LABELS[factorKey] || factorKey;
                    const title = label.replace(/\b\w/g, (c) => c.toUpperCase());
                    const hasReason = typeof f.reason === 'string' && f.reason.trim().length > 0;
                    const hasRecommendations = Array.isArray(f.recommendations) && f.recommendations.length > 0;

                    if (!hasReason && !hasRecommendations && score === 0 && weight === 0) {
                      return null;
                    }

                    return (
                      <div key={factorKey} className="bg-surface-lighter border border-surface-highlight rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-semibold text-gray-200">{title}</div>
                            <div className="text-xs text-gray-500 mt-1">Weight: {(weight * 100).toFixed(0)}%</div>
                          </div>
                          <div className="text-lg font-bold text-green-300">{Math.round(score)}</div>
                        </div>
                        {hasReason ? (
                          <div className="text-xs text-gray-400 mt-3 leading-relaxed">
                            {f.reason!.split('. ').map((sentence, idx) => (
                              <p key={idx} className="mb-1 last:mb-0">
                                {sentence.trim()}
                              </p>
                            ))}
                          </div>
                        ) : null}
                        {hasRecommendations ? (
                          <div className="mt-3">
                            <div className="text-xs font-semibold text-gray-300 uppercase tracking-wide mb-2">
                              Recommendations
                            </div>
                            <ul className="list-disc list-inside text-xs text-gray-400 space-y-1">
                              {f.recommendations!.map((rec, idx) => (
                                <li key={idx}>{String(rec || '')}</li>
                              ))}
                            </ul>
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="bg-surface rounded-2xl shadow-lg p-6 border border-surface-highlight">
              <div className="mb-4 flex justify-center">
                <Image
                  src={StorageServingBanner}
                  alt="Storage and serving"
                  className="h-auto w-full max-w-md border border-surface-highlight rounded-lg"
                  unoptimized
                />
              </div>
              {portionPlan ? (
                <div className="space-y-4 text-sm text-gray-300">
                  <div className="bg-surface-lighter border border-surface-highlight rounded-lg p-4">
                    <div className="font-semibold text-gray-200">Daily portion guide</div>
                    {Array.isArray(portionPlan.mealsPerDay) && portionPlan.mealsPerDay.length > 0 ? (
                      <div className="grid grid-cols-2 gap-3 mt-3 text-xs text-gray-400">
                        {portionPlan.mealsPerDay.map((item, idx) => (
                          <div key={idx} className="flex flex-col">
                            <span className="text-gray-300 font-semibold">{item.label}</span>
                            <span>{item.amount}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="mt-3 text-xs text-gray-400">
                        Portion sizing guidance unavailable for this meal.
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="font-semibold text-gray-200">Storage</div>
                    <div className="text-gray-300 mt-1">Fridge: Store in airtight container up to 3 days</div>
                    <div className="text-gray-300">Freezer: Freeze portions up to 2 months</div>
                    <div className="text-gray-300">Thawing: Thaw overnight in fridge</div>
                  </div>

                  <div>
                    <div className="font-semibold text-gray-200">Serving temperature</div>
                    <div className="text-gray-300 mt-1">Serve at room temp or gently warmed</div>
                    <div className="text-gray-300">Avoid overheating; stir well and test temperature before serving</div>
                  </div>

                  <div>
                    <div className="font-semibold text-gray-200">Batch prep tip</div>
                    <div className="text-gray-300 mt-1">Cool fully before portioning; portion into daily containers</div>
                  </div>
                </div>
              ) : (
                <div className="bg-surface-lighter border border-surface-highlight rounded-lg p-4 text-sm text-gray-300">
                  Serving varies by species, size, age, and activity—create a pet profile for exact portions.
                </div>
              )}
            </div>

            <div className="bg-surface rounded-2xl shadow-lg p-6 border border-surface-highlight">
              <button
                type="button"
                onClick={handleSaveMeal}
                disabled={!userId || !analysis || !mealName.trim() || isSaving || isSaved}
                className="group relative w-full inline-flex focus:outline-none focus:ring-4 focus:ring-orange-500/40 rounded-2xl transition-transform duration-150 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={isSaved ? 'Saved' : isSaving ? 'Saving…' : 'Save Meal'}
              >
                <span className="relative h-32 w-full overflow-hidden rounded-2xl">
                  <Image
                    src={isSaved ? '/images/Buttons/MealSaved.png' : '/images/Buttons/SaveMeal.png'}
                    alt={isSaved ? 'Meal Saved' : 'Save Meal'}
                    fill
                    sizes="100vw"
                    className="object-contain"
                    priority
                    unoptimized
                  />
                </span>
                <span className="sr-only">{isSaved ? 'Saved' : isSaving ? 'Saving…' : 'Save Meal'}</span>
              </button>
              {!userId && <div className="mt-2 text-xs text-gray-400">Sign in to save</div>}
            </div>
        </aside>
      </div>

      {isScoreModalOpen && scoreContext && (
        <RecipeScoreModal
          recipe={scoreContext.recipe}
          pet={scoreContext.pet}
          onClose={() => setIsScoreModalOpen(false)}
        />
      )}
    </div>
  );
}
