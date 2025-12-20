'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { CheckCircle, AlertTriangle, XCircle, Info, Plus, Save, ShoppingCart, Star, ChevronLeft } from 'lucide-react';
import { MealAnalysis, IngredientSelection } from '@/lib/analyzeCustomMeal';
import MealCompositionList from '@/components/MealCompositionList';
import { generateMealName } from '@/lib/utils/mealNameGenerator';
import { saveCustomMeal } from '@/lib/utils/customMealStorage';
import { calculateEnhancedCompatibility, type Pet as EnhancedPet } from '@/lib/utils/enhancedCompatibilityScoring';
import type { Recipe } from '@/lib/types';
import Image from 'next/image';
import Tooltip from '@/components/Tooltip';
import { getPets } from '@/lib/utils/petStorage';
import { getRecommendationsForRecipe } from '@/lib/utils/nutritionalRecommendations';
import { logger } from '@/lib/utils/logger';
import { getProductByIngredient, getProductPrice, getProductUrl } from '@/lib/data/product-prices';
import { ShoppingList } from '@/components/ShoppingList';
import { CostComparison } from '@/components/CostComparison';
import { calculateMealsFromGroceryList } from '@/lib/utils/mealEstimation';
import Link from 'next/link';
import { checkAllBadges } from '@/lib/utils/badgeChecker';
import { ensureSellerId } from '@/lib/utils/affiliateLinks';

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
  petType = 'dog' // Default to dog if not provided
}: MealCompleteViewProps) {
  const totalGrams = selectedIngredients.reduce((sum, s) => sum + s.grams, 0);
  const [mealName, setMealName] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [pet, setPet] = useState<any>(null);
  const [healthAnalysis, setHealthAnalysis] = useState<any>(null);
  const [isCalculatingHealthAnalysis, setIsCalculatingHealthAnalysis] = useState(false);
  const [activeTab, setActiveTab] = useState<'ingredients' | 'supplements'>('ingredients');

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

      // Convert pet to EnhancedPet format
      // Use pet object if available, otherwise use props directly
      const enhancedPet: EnhancedPet = {
        id: pet?.id || petId,
        name: petName,
        type: (petType || pet?.type || 'dog') as 'dog' | 'cat' | 'bird' | 'reptile' | 'pocket-pet',
        breed: petBreed || pet?.breed || '',
        age: petAge === 'baby' ? 0.5 : petAge === 'young' ? 2 : petAge === 'senior' ? 10 : 5,
        weight: parseFloat(petWeight) || pet?.weightKg || 10,
        activityLevel: pet?.activityLevel || 'moderate',
        healthConcerns: pet?.healthConcerns || [],
        dietaryRestrictions: pet?.allergies || [],
        allergies: pet?.allergies || [],
      };

      const enhanced = calculateEnhancedCompatibility(recipe, enhancedPet);
      
      // Get nutritional recommendations
      const nutritionalGaps = enhanced.detailedBreakdown.nutritionalGaps || [];
      const recommendations = getRecommendationsForRecipe(
        nutritionalGaps,
        enhancedPet.type,
        enhancedPet.healthConcerns || []
      );
      
      // Format breakdown similar to recipe detail page
      const getReasonWithIssues = (factor: typeof enhanced.factors.ingredientSafety) => {
        if (factor.issues.length > 0) {
          return factor.issues.join('; ') + (factor.reasoning ? ` (${factor.reasoning})` : '');
        }
        return factor.reasoning || '';
      };

      setHealthAnalysis({
        overallScore: enhanced.overallScore,
        compatibility: enhanced.grade === 'A+' || enhanced.grade === 'A' ? 'excellent' :
                       enhanced.grade === 'B+' || enhanced.grade === 'B' ? 'good' :
                       enhanced.grade === 'C+' || enhanced.grade === 'C' ? 'fair' : 'poor',
        breakdown: {
          petTypeMatch: { 
            score: enhanced.factors.ingredientSafety.score,
            weightedContribution: Math.round(enhanced.factors.ingredientSafety.score * enhanced.factors.ingredientSafety.weight),
            weight: enhanced.factors.ingredientSafety.weight,
            reason: getReasonWithIssues(enhanced.factors.ingredientSafety)
          },
          ageAppropriate: { 
            score: enhanced.factors.lifeStageFit.score,
            weightedContribution: Math.round(enhanced.factors.lifeStageFit.score * enhanced.factors.lifeStageFit.weight),
            weight: enhanced.factors.lifeStageFit.weight,
            reason: getReasonWithIssues(enhanced.factors.lifeStageFit)
          },
          nutritionalFit: { 
            score: enhanced.factors.nutritionalAdequacy.score,
            weightedContribution: Math.round(enhanced.factors.nutritionalAdequacy.score * enhanced.factors.nutritionalAdequacy.weight),
            weight: enhanced.factors.nutritionalAdequacy.weight,
            reason: getReasonWithIssues(enhanced.factors.nutritionalAdequacy),
            recommendations: recommendations // Add recommendations to nutritional fit
          },
          healthCompatibility: { 
            score: enhanced.factors.healthAlignment.score,
            weightedContribution: Math.round(enhanced.factors.healthAlignment.score * enhanced.factors.healthAlignment.weight),
            weight: enhanced.factors.healthAlignment.weight,
            reason: getReasonWithIssues(enhanced.factors.healthAlignment)
          },
          activityFit: {
            score: enhanced.factors.activityFit.score,
            weightedContribution: Math.round(enhanced.factors.activityFit.score * enhanced.factors.activityFit.weight),
            weight: enhanced.factors.activityFit.weight,
            reason: getReasonWithIssues(enhanced.factors.activityFit)
          },
          allergenSafety: { 
            score: enhanced.factors.allergenSafety.score,
            weightedContribution: Math.round(enhanced.factors.allergenSafety.score * enhanced.factors.allergenSafety.weight),
            weight: enhanced.factors.allergenSafety.weight,
            reason: getReasonWithIssues(enhanced.factors.allergenSafety)
          },
        },
        warnings: enhanced.detailedBreakdown.warnings,
        strengths: enhanced.detailedBreakdown.healthBenefits,
        nutritionalGaps: nutritionalGaps,
        recommendations: recommendations,
      });

      // Check badges if score is 100% (Nutrient Navigator)
      if (enhanced.overallScore === 100 && userId && petId) {
        checkAllBadges(userId, petId, {
          action: 'meal_created',
          compatibilityScore: enhanced.overallScore,
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
      // Keep existing healthAnalysis if there was one, otherwise null
      // Don't set to null here - let the fallback score show instead
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

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle size={24} className="text-green-600" />;
    if (score >= 60) return <AlertTriangle size={24} className="text-yellow-600" />;
    return <XCircle size={24} className="text-red-600" />;
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


  // Get display score and compatibility
  const displayScore = healthAnalysis?.overallScore ?? (analysis?.score ?? 0);
  const compatibility = healthAnalysis?.compatibility ?? 
    (displayScore >= 80 ? 'excellent' : displayScore >= 60 ? 'good' : displayScore >= 40 ? 'fair' : 'poor');

  // Prepare ingredients for ShoppingList (memoized)
  const ingredientsWithASINs = useMemo(() => {
    console.log('[MealCompleteView] ========== ingredientsWithASINs Calculation ==========');
    console.log('[MealCompleteView] selectedIngredients:', selectedIngredients);
    console.log('[MealCompleteView] selectedIngredients.length:', selectedIngredients.length);
    
    const result = selectedIngredients
      .map((ing, index) => {
        console.log(`[MealCompleteView] Processing ingredient ${index + 1}:`, ing);
        const displayName = getIngredientDisplayName(ing.key);
        console.log(`[MealCompleteView]   Display name from getIngredientDisplayName:`, displayName);
        
        const link = getProductUrl(displayName);
        console.log(`[MealCompleteView]   Product-prices purchase link:`, link);
        
        if (link) {
          const item = {
            id: ing.key,
            name: displayName,
            amount: `${ing.grams}g`,
            asinLink: ensureSellerId(link)
          };
          console.log(`[MealCompleteView]   ✅ Added to ingredientsWithASINs:`, item);
          return item;
        }
        console.log(`[MealCompleteView]   ❌ No link found, skipping ingredient`);
        return null;
      })
      .filter(Boolean) as Array<{ id: string; name: string; amount: string; asinLink: string }>;
    
    console.log('[MealCompleteView] Final ingredientsWithASINs array:', result);
    console.log('[MealCompleteView] ingredientsWithASINs.length:', result.length);
    console.log('[MealCompleteView] =====================================================');
    return result;
  }, [selectedIngredients, getIngredientDisplayName]);

  const ingredientsWithoutASINs = useMemo(() => {
    return selectedIngredients
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
  }, [selectedIngredients, getIngredientDisplayName]);

  // Get recommended supplements
  const recommendedSupplements = healthAnalysis?.recommendations || [];

  // Calculate meal estimate only for CostComparison component
  const mealEstimateForCost = useMemo(() => {
    console.log('[MealCompleteView] Calculating mealEstimateForCost...');
    console.log('[MealCompleteView] ingredientsWithASINs:', ingredientsWithASINs);
    
    if (!ingredientsWithASINs || ingredientsWithASINs.length === 0) {
      console.log('[MealCompleteView] No ingredients with ASINs, returning null');
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
      
      console.log('[MealCompleteView] Shopping list items for calculation:', shoppingListItems);
      
      // Calculate total cost using product-prices.json when available, otherwise fall back to package estimates
      const totalCost = ingredientsWithASINs.reduce((sum, item) => {
        const price = getProductPrice(item.name);
        return typeof price === 'number' ? sum + price : sum;
      }, 0);
      
      const result = calculateMealsFromGroceryList(shoppingListItems);
      // Override totalCost with the one calculated from ShoppingList logic to ensure they match
      if (result) {
        result.totalCost = totalCost;
        result.costPerMeal = result.estimatedMeals > 0 ? totalCost / result.estimatedMeals : 0;
      }
      console.log('[MealCompleteView] mealEstimateForCost result:', result);
      return result;
    } catch (error) {
      console.error('[MealCompleteView] Error calculating meal estimate for cost:', error);
      return null;
    }
  }, [ingredientsWithASINs]);

  // Diagnostic logging - NOW AFTER DECLARATIONS
  useEffect(() => {
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
    console.groupEnd();
  }, [selectedIngredients, ingredientsWithASINs, mealEstimateForCost]);

  return (
    <div className="min-h-screen bg-background py-12 font-sans text-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <Link
          href={`/profile/pet/${petId}`}
          className="inline-flex items-center text-gray-400 hover:text-primary-400 mb-6 font-medium transition-colors"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          Back to Pet Profile
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          <main className="lg:col-span-3">
            {/* Recipe Info Card */}
            <div className="bg-surface rounded-2xl shadow-xl overflow-hidden mb-8 border border-surface-highlight">
              <div className="p-8">
                {/* Meal Name Input */}
                <div className="mb-4">
                  <label className="block text-xs font-medium text-gray-400 mb-2">Meal Name</label>
                  <input
                    type="text"
                    value={mealName}
                    onChange={(e) => setMealName(e.target.value)}
                    className="w-full px-4 py-2 text-4xl font-extrabold text-foreground bg-surface-highlight border border-surface-highlight rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Enter meal name..."
                  />
            </div>

                {/* Health Concerns */}
                {pet?.healthConcerns && pet.healthConcerns.length > 0 && (
                  <div className="mb-4 flex flex-wrap gap-2">
                    {pet.healthConcerns.map((concern: string) => (
                      <span
                        key={concern}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-900/40 text-orange-200 border border-orange-700/50"
                      >
                        {concern.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                      </span>
                    ))}
                  </div>
                )}

                {/* Compatibility Score - Big Progress Bar */}
                {analysis && (
                  <div className={`mb-6 rounded-xl border-2 p-6 ${
                    displayScore >= 80 ? 'bg-green-900/20 border-green-700/50 text-green-200' :
                    displayScore >= 60 ? 'bg-yellow-900/20 border-yellow-700/50 text-yellow-200' :
                    'bg-red-900/20 border-red-700/50 text-red-200'
                  }`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        {displayScore >= 80 ? <CheckCircle size={24} className="text-green-400" /> :
                         displayScore >= 60 ? <AlertTriangle size={24} className="text-yellow-400" /> :
                         <XCircle size={24} className="text-red-400" />}
                        <h3 className="font-semibold text-xl">Compatibility Score</h3>
                      </div>
                      <div className="text-4xl font-bold">{displayScore}/100</div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-black/30 rounded-full h-4 mb-3">
                      <div
                        className={`h-4 rounded-full transition-[width] duration-500 ease-out will-change-[width] ${
                          displayScore >= 80 ? 'bg-green-600' :
                          displayScore >= 60 ? 'bg-yellow-600' :
                          'bg-red-600'
                        }`}
                        style={{ width: `${displayScore}%` }}
                      />
                    </div>

                    <div className="text-sm opacity-90">
                      {isCalculatingHealthAnalysis && !healthAnalysis && 'Calculating enhanced score...'}
                      {healthAnalysis && (displayScore >= 80 ? '✓ Excellent match for your pet' :
                                         displayScore >= 60 ? '⚠ Good, but could be improved' :
                                         '✗ Needs adjustments for safety')}
                      {!isCalculatingHealthAnalysis && !healthAnalysis && (displayScore >= 80 ? '✓ Excellent match for your pet' :
                                         displayScore >= 60 ? '⚠ Good, but could be improved' :
                                         '✗ Needs adjustments for safety')}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 mb-6">
              {isSaved ? (
                    <div className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-green-600 bg-green-900/40 border border-green-700/50 rounded-md">
                  <CheckCircle size={16} />
                  Meal Saved
                </div>
              ) : (
                <button
                  onClick={handleSaveMeal}
                  disabled={isSaving || !analysis || !mealName.trim()}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save size={16} />
                  {isSaving ? 'Saving...' : 'Save Meal'}
                </button>
              )}
              <button
                onClick={onAddMore}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-300 bg-surface-highlight border border-surface-highlight rounded-md hover:bg-surface-highlight/80 transition-colors"
              >
                <Plus size={16} />
                Add More Ingredients
              </button>
              <button
                onClick={onStartOver}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 transition-colors"
              >
                <Plus size={16} />
                Create New Meal
              </button>
            </div>

                {/* Description placeholder */}
                <p className="text-gray-300 mb-8 leading-relaxed text-lg">
                  Custom meal created for {petName}. Adjust ingredient amounts to optimize nutritional balance.
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-8">
                  <span className="bg-surface-highlight text-gray-300 px-3 py-1 rounded-full text-sm font-medium border border-surface-highlight">
                    custom
                  </span>
                  <span className="bg-surface-highlight text-gray-300 px-3 py-1 rounded-full text-sm font-medium border border-surface-highlight">
                    user-created
                  </span>
          </div>
        </div>
      </div>

            {/* Ingredients & Supplements Tabs */}
            <div className="bg-surface rounded-2xl shadow-lg p-8 mb-8 border border-surface-highlight">
              {/* Tab Navigation */}
              <div className="flex border-b border-surface-highlight mb-6">
                <button
                  onClick={() => setActiveTab('ingredients')}
                  className={`px-6 py-3 font-semibold text-sm border-b-2 transition-colors ${
                    activeTab === 'ingredients'
                      ? 'border-orange-500 text-orange-400'
                      : 'border-transparent text-gray-500 hover:text-gray-300'
                  }`}
                >
                  Ingredients
                </button>
                <button
                  onClick={() => setActiveTab('supplements')}
                  className={`px-6 py-3 font-semibold text-sm border-b-2 transition-colors ${
                    activeTab === 'supplements'
                      ? 'border-orange-500 text-orange-400'
                      : 'border-transparent text-gray-500 hover:text-gray-300'
                  }`}
                >
                  Supplements
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
                      />
                    )}
                    
                    {/* Ingredients without ASIN links */}
                    {ingredientsWithoutASINs.length > 0 && (
                      <div className="bg-surface-lighter rounded-lg border border-surface-highlight p-6">
                        <h3 className="text-lg font-semibold text-foreground mb-4">
                          Additional Ingredients
                        </h3>
                        <div className="space-y-2">
                          {ingredientsWithoutASINs.map((ing, index) => (
                            <div
                              key={ing.id || index}
                              className="flex items-center justify-between p-3 bg-surface rounded-lg border border-surface-highlight"
                            >
                              <div className="flex-1">
                                <div className="font-medium text-gray-200">{ing.name}</div>
                                <div className="text-sm text-gray-400 mt-1">
                                  {ing.amount}
                                  {recommendedAmounts[ing.id] && recommendedAmounts[ing.id] !== parseFloat(ing.amount.replace('g', '')) && (
                                    <span className="text-orange-400 ml-2">
                                      (Recommended: {recommendedAmounts[ing.id]}g)
                                    </span>
                                  )}
                                </div>
                              </div>
                              <button
                                onClick={() => onRemove(ing.id)}
                                className="p-1.5 rounded hover:bg-red-900/30 text-gray-400 hover:text-red-400 transition-colors ml-2"
                                title="Remove ingredient"
                              >
                                <XCircle size={18} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
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
                  {/* Recommended Supplements */}
                  {recommendedSupplements.length > 0 && (
                    <div className="bg-orange-900/20 border border-orange-700/50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-orange-200 mb-4 flex items-center gap-2">
                        <span>💊</span>
                        Recommended Supplements
                      </h3>
                      <p className="text-sm text-gray-400 mb-4">
                        These supplements can help address nutritional deficiencies in this meal:
                      </p>
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

            {/* Safety Alerts */}
            {analysis && (analysis.toxicityWarnings.length > 0 || analysis.allergyWarnings.length > 0) && (
              <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-6 mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle size={20} className="text-red-400" />
                  <h2 className="text-lg font-semibold text-red-200">Safety Alerts</h2>
                </div>
                <div className="space-y-3">
                  {analysis.toxicityWarnings.map((warning, idx) => (
                    <div key={idx} className="text-sm text-red-300">
                      <div className="font-medium">⚠️ {warning.ingredientName || warning.ingredientKey}</div>
                      <div className="text-xs mt-1 opacity-90">{warning.message}</div>
                    </div>
                  ))}
                  {analysis.allergyWarnings.map((warning, idx) => (
                    <div key={idx} className="text-sm text-red-300">
                      <div className="font-medium">⚠️ {typeof warning === 'string' ? warning : warning.message}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {analysis && analysis.suggestions.length > 0 && (
              <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-6 mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <Info size={20} className="text-blue-400" />
                  <h2 className="text-lg font-semibold text-blue-200">Recommendations</h2>
                </div>
                <div className="space-y-2">
                  {analysis.suggestions.map((suggestion, idx) => (
                    <div key={idx} className="text-sm text-blue-300">
                      💡 {typeof suggestion === 'string' ? suggestion : suggestion.message}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cost Comparison */}
            {ingredientsWithASINs.length > 0 && mealEstimateForCost && mealEstimateForCost.costPerMeal > 0 && (
              <div className="mb-8">
                <CostComparison 
                  costPerMeal={mealEstimateForCost.costPerMeal}
                  totalCost={mealEstimateForCost.totalCost}
                  estimatedMeals={mealEstimateForCost.estimatedMeals}
                  exceedsBudget={mealEstimateForCost.exceedsBudget || false}
                />
              </div>
            )}
          </main>

          {/* Sidebar */}
          <aside className="lg:col-span-2 space-y-6">
            {/* Health Analysis Panel */}
            {healthAnalysis && (
              <div className="bg-surface rounded-2xl shadow-lg p-6 border-l-4 border-green-500 border border-surface-highlight">
                <h4 className="text-lg font-bold mb-4 flex items-center justify-center text-gray-200">
                  <span className="text-2xl mr-2">🏥</span>
                  Health Analysis
                </h4>
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
                  Proffessor Purfessor has found these individual factors that contribute to the overall compatibility score
                </p>
                <div className="space-y-3">
                  {Object.entries(healthAnalysis.breakdown).map(([key, factor]) => {
                    const f = factor as { score: number; weightedContribution?: number; weight: number; reason?: string; recommendations?: any[] };
                    const score = f.score || 0;
                    const weightedContribution = f.weightedContribution ?? Math.round(score * (f.weight || 0));
                    const weight = f.weight || 0;

                    let bgColor = 'bg-green-900/20 border-green-700/50';
                    let icon = '✅';
                    let textColor = 'text-green-200';

                    if (score < 70) {
                      bgColor = 'bg-yellow-900/20 border-yellow-700/50';
                      icon = '⚠️';
                      textColor = 'text-yellow-200';
                    }
                    if (score < 40) {
                      bgColor = 'bg-red-900/20 border-red-700/50';
                      icon = '❌';
                      textColor = 'text-red-200';
                    }

                    const factorName = key.replace(/([A-Z])/g, ' $1').toLowerCase();
                    const formattedFactorName = factorName.charAt(0).toUpperCase() + factorName.slice(1);
                    
                    let tooltipContent = `📊 ${formattedFactorName}\n\n─────────────────────\n\nRaw Score: ${score}%\nWeight: ${(weight * 100).toFixed(0)}%\nContribution: ${weightedContribution} points\n\n─────────────────────\n\n${f.reason ? `💡 ${f.reason}` : 'No additional details available'}`;
                    
                    if (key === 'nutritionalFit' && f.recommendations && f.recommendations.length > 0) {
                      tooltipContent += '\n\n─────────────────────\n\n💊 Recommendations:\n';
                      const supplements = f.recommendations.filter((r: any) => !r.isIngredient);
                      const ingredients = f.recommendations.filter((r: any) => r.isIngredient);
                      
                      if (supplements.length > 0) {
                        tooltipContent += `\nCheck Supplements tab for: ${supplements.map((r: any) => r.productName || r.name).join(', ')}`;
                      }
                      if (ingredients.length > 0) {
                        tooltipContent += `\nCheck Ingredients tab for: ${ingredients.map((r: any) => r.name).join(', ')}`;
                      }
                    }

                    return (
                      <Tooltip key={key} content={tooltipContent} wide={key === 'nutritionalFit'}>
                        <div className={`flex items-center justify-between p-3 ${bgColor} rounded-lg border cursor-help hover:opacity-80 transition-colors`}>
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{icon}</span>
                            <span className={`text-sm font-medium capitalize ${textColor}`}>
                              {factorName}
                            </span>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className={`text-sm font-bold ${textColor}`}>
                              {score}%
                            </span>
                            <span className="text-xs text-gray-400">
                              +{weightedContribution} pts
                            </span>
                          </div>
                        </div>
                      </Tooltip>
                    );
                  })}
                </div>

                {/* Compatibility Score Summary */}
                <div className="mt-4 pt-4 border-t border-surface-highlight">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Compatibility Score:</span>
                    <span className={`text-lg font-bold ${
                      healthAnalysis.overallScore >= 80 ? 'text-green-400' :
                      healthAnalysis.overallScore >= 60 ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                      {healthAnalysis.overallScore}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    {healthAnalysis.overallScore >= 80 ? 'Excellent nutritional balance for your pet!' :
                     healthAnalysis.overallScore >= 60 ? 'Good balance with some areas for improvement.' :
                     'Needs nutritional adjustments for optimal health.'}
                  </p>
                </div>
              </div>
            )}

            {/* Nutritional Summary */}
            {analysis && (
              <div className="bg-surface rounded-lg border border-surface-highlight p-6">
                <h3 className="text-sm font-semibold text-gray-200 mb-3">Nutritional Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Weight:</span>
                    <span className="font-medium text-gray-200">{totalGrams}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Calories:</span>
                    <span className="font-medium text-gray-200">
                      {((analysis.nutrients as any).kcal ?? (analysis.nutrients as any).calories_kcal ?? (analysis.nutrients as any).energy_kcal ?? 0).toFixed(0)} kcal
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Protein:</span>
                    <span className="font-medium text-gray-200">
                      {((analysis.nutrients as any).protein_g ?? 0).toFixed(1)}g
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Fat:</span>
                    <span className="font-medium text-gray-200">
                      {((analysis.nutrients as any).fat_g ?? 0).toFixed(1)}g
                    </span>
                  </div>
                  {analysis.caToPratio && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Ca:P Ratio:</span>
                      <span className="font-medium text-gray-200">{analysis.caToPratio.toFixed(2)}</span>
                    </div>
                  )}
                  {analysis.recommendedServingGrams > 0 && (
                    <div className="flex justify-between pt-2 border-t border-surface-highlight">
                      <span className="text-gray-300 font-medium">Recommended Serving:</span>
                      <span className="font-semibold text-orange-400">{analysis.recommendedServingGrams}g</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
