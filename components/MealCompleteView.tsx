'use client';

import { useState, useEffect, useRef } from 'react';
import { CheckCircle, AlertTriangle, XCircle, Info, Plus, RotateCcw, Save } from 'lucide-react';
import { MealAnalysis, IngredientSelection } from '@/lib/analyzeCustomMeal';
import MealCompositionList from '@/components/MealCompositionList';
import { generateMealName } from '@/lib/utils/mealNameGenerator';
import { createPortal } from 'react-dom';
import FireworksAnimation from '@/components/FireworksAnimation';
import { saveCustomMeal } from '@/lib/utils/customMealStorage';
import { logger } from '@/lib/utils/logger';

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
  isFirstCreation = false
}: MealCompleteViewProps) {
  const totalGrams = selectedIngredients.reduce((sum, s) => sum + s.grams, 0);
  const [showMealCreated, setShowMealCreated] = useState(false);
  const [mealName, setMealName] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const hasShownPopup = useRef(false); // Track if we've shown the popup
  const hasAppliedRecommended = useRef(false); // Track if we've auto-applied recommended amounts

  const handleSaveMeal = () => {
    if (!analysis || !mealName.trim()) {
      setSaveMessage('Please enter a meal name');
      setTimeout(() => setSaveMessage(null), 3000);
      return;
    }

    setIsSaving(true);
    try {
      saveCustomMeal(userId, petId, mealName.trim(), selectedIngredients, analysis);
      setSaveMessage('Meal saved successfully! ✓');
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      logger.error('Error saving meal:', error);
      setSaveMessage('Error saving meal. Please try again.');
      setTimeout(() => setSaveMessage(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  // Generate meal name when ingredients are first set
  useEffect(() => {
    if (selectedIngredients.length > 0 && !mealName) {
      const name = generateMealName(selectedIngredients.map(ing => ing.key));
      setMealName(name);
    }
  }, [selectedIngredients, mealName]);

  // Show "Meal Created" popup only once when meal is first created and analysis is ready
  useEffect(() => {
    // Only show if:
    // 1. This is the first creation (wizard just completed)
    // 2. Analysis is ready
    // 3. We haven't shown it yet
    if (isFirstCreation && analysis && analysis.score > 0 && !hasShownPopup.current) {
      setShowMealCreated(true);
      hasShownPopup.current = true;
      
      // Auto-hide after exactly 1.5 seconds - always clear this timer
      const timer = setTimeout(() => {
        setShowMealCreated(false);
      }, 1500);
      
      // Cleanup function to clear timer if component unmounts or effect re-runs
      return () => {
        clearTimeout(timer);
      };
    }
  }, [isFirstCreation, analysis]);

  // Separate effect to ensure popup is hidden if it somehow stays visible
  useEffect(() => {
    if (showMealCreated && hasShownPopup.current) {
      const forceHideTimer = setTimeout(() => {
        setShowMealCreated(false);
      }, 1600); // Slightly longer than the main timer as a safety net
      
      return () => clearTimeout(forceHideTimer);
    }
  }, [showMealCreated]);

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

  // Auto-apply recommended amounts when analysis is complete (only once)
  useEffect(() => {
    if (analysis && analysis.recommendedServingGrams > 0 && selectedIngredients.length > 0 && !hasAppliedRecommended.current) {
      const currentTotal = totalGrams;
      if (currentTotal > 0) {
        const recommendedTotal = analysis.recommendedServingGrams;
        // Only apply if current total is significantly different from recommended (more than 10% difference)
        const difference = Math.abs(currentTotal - recommendedTotal) / recommendedTotal;
        if (difference > 0.1) {
          // Apply recommended amounts
          const recommendedAmounts = calculateRecommendedAmounts();
          Object.entries(recommendedAmounts).forEach(([key, grams]) => {
            onUpdateAmount(key, grams);
          });
          hasAppliedRecommended.current = true;
        } else {
          // If already close to recommended, just mark as applied
          hasAppliedRecommended.current = true;
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analysis, totalGrams]);

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Meal Complete for {petName}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {petBreed} • {petAge} • {petWeight}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleSaveMeal}
                disabled={isSaving || !analysis || !mealName.trim()}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={16} />
                {isSaving ? 'Saving...' : 'Save Meal'}
              </button>
              <button
                onClick={onAddMore}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                <Plus size={16} />
                Add More Ingredients
              </button>
              <button
                onClick={onStartOver}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                <RotateCcw size={16} />
                Start Over
              </button>
            </div>
            {saveMessage && (
              <div className={`mt-2 px-3 py-2 rounded-md text-sm ${
                saveMessage.includes('Error') 
                  ? 'bg-red-50 text-red-800' 
                  : 'bg-green-50 text-green-800'
              }`}>
                {saveMessage}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Hero: Compatibility Score - Main Focus */}
        <div className="mb-8">
          {analysis ? (
            <div className={`rounded-2xl border-4 p-8 shadow-lg ${getScoreColor(analysis.score)}`}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-6">
                  <div className="text-6xl">
                    {getScoreIcon(analysis.score)}
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold mb-2">Compatibility Score</h2>
                    <p className="text-lg opacity-90">
                      {analysis.score >= 80 && '✓ Excellent match for your pet!'}
                      {analysis.score >= 60 && analysis.score < 80 && '⚠ Good, but could be improved'}
                      {analysis.score < 60 && '✗ Needs adjustments for safety'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-7xl font-bold mb-2">{analysis.score}</div>
                  <div className="text-2xl font-semibold opacity-75">/ 100</div>
                </div>
              </div>
              
              {/* Large Progress Bar */}
              <div className="w-full bg-white/50 rounded-full h-6 mb-4">
                <div
                  className="h-6 rounded-full transition-all duration-1000"
                  style={{ 
                    width: `${analysis.score}%`,
                    backgroundColor: getProgressGradientColor(analysis.score)
                  }}
                />
              </div>

              {/* Score Breakdown */}
              <div className="grid grid-cols-3 gap-6 mt-6 pt-6 border-t-2 border-white/40">
                <div className="text-center">
                  <div className="text-xs font-medium opacity-75 mb-1">Nutrient Coverage</div>
                  <div className="text-2xl font-bold">{analysis.breakdown.nutrientCoverageScore}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs font-medium opacity-75 mb-1">Balance & Variety</div>
                  <div className="text-2xl font-bold">{analysis.breakdown.balanceVarietyScore}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs font-medium opacity-75 mb-1">Toxicity Penalty</div>
                  <div className="text-2xl font-bold">-{analysis.breakdown.toxicityPenalty}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-100 rounded-2xl border-4 border-gray-300 p-8 shadow-lg">
              <div className="flex items-center justify-center gap-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-700">Calculating Compatibility...</h2>
                  <p className="text-lg text-gray-600 mt-1">Analyzing your meal composition</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-[1fr_350px] gap-6">
          {/* LEFT: Ingredients List */}
          <div className="space-y-6">

            {/* Selected Ingredients */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Meal Composition</h2>
                {analysis?.recommendedServingGrams && (
                  <div className="text-sm text-gray-600">
                    Recommended total: <span className="font-semibold text-primary-600">{analysis.recommendedServingGrams}g</span>
                  </div>
                )}
              </div>
              <MealCompositionList
                ingredients={selectedIngredients}
                onRemove={onRemove}
                onUpdateAmount={onUpdateAmount}
                getIngredientDisplayName={getIngredientDisplayName}
                getCompatibilityIndicator={getCompatibilityIndicator}
                recommendedAmounts={recommendedAmounts}
              />
            </div>


            {/* Safety Alerts */}
            {analysis && (analysis.toxicityWarnings.length > 0 || analysis.allergyWarnings.length > 0) && (
              <div className="bg-red-50 rounded-lg border border-red-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle size={20} className="text-red-600" />
                  <h2 className="text-lg font-semibold text-red-900">Safety Alerts</h2>
                </div>
                <div className="space-y-3">
                  {analysis.toxicityWarnings.map((warning, idx) => (
                    <div key={idx} className="text-sm text-red-800">
                      <div className="font-medium">⚠️ {warning.ingredientName || warning.ingredientKey}</div>
                      <div className="text-xs mt-1 opacity-90">{warning.message}</div>
                    </div>
                  ))}
                  {analysis.allergyWarnings.map((warning, idx) => (
                    <div key={idx} className="text-sm text-red-800">
                      <div className="font-medium">⚠️ {typeof warning === 'string' ? warning : warning.message}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {analysis && analysis.suggestions.length > 0 && (
              <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Info size={20} className="text-blue-600" />
                  <h2 className="text-lg font-semibold text-blue-900">Recommendations</h2>
                </div>
                <div className="space-y-2">
                  {analysis.suggestions.map((suggestion, idx) => (
                    <div key={idx} className="text-sm text-blue-800">
                      💡 {typeof suggestion === 'string' ? suggestion : suggestion.message}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Nutrient Warnings */}
            {analysis && analysis.nutrientWarnings.length > 0 && (
              <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle size={20} className="text-yellow-600" />
                  <h2 className="text-lg font-semibold text-yellow-900">Nutritional Warnings</h2>
                </div>
                <div className="space-y-2">
                  {analysis.nutrientWarnings.map((warning, idx) => (
                    <div key={idx} className="text-sm text-yellow-800">
                      ⚠️ {warning.message}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Meal Data & Image */}
          <div className="space-y-6">
            {/* Meal Name */}
            {mealName && (
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <label className="block text-xs font-medium text-gray-700 mb-2">Meal Name</label>
                <input
                  type="text"
                  value={mealName}
                  onChange={(e) => setMealName(e.target.value)}
                  className="w-full px-3 py-2 text-lg font-semibold text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter meal name..."
                />
              </div>
            )}

            {/* Meal Image Placeholder */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <label className="block text-xs font-medium text-gray-700 mb-2">Meal Image</label>
              <div className="w-full aspect-square bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                <div className="text-center">
                  <Info size={32} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-xs text-gray-500">80x80px</p>
                </div>
              </div>
            </div>

            {/* Nutritional Summary */}
            {analysis && (
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Nutritional Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Weight:</span>
                    <span className="font-medium">{totalGrams}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Calories:</span>
                    <span className="font-medium">
                      {((analysis.nutrients as any).kcal ?? (analysis.nutrients as any).calories_kcal ?? (analysis.nutrients as any).energy_kcal ?? 0).toFixed(0)} kcal
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Protein:</span>
                    <span className="font-medium">
                      {((analysis.nutrients as any).protein_g ?? 0).toFixed(1)}g
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fat:</span>
                    <span className="font-medium">
                      {((analysis.nutrients as any).fat_g ?? 0).toFixed(1)}g
                    </span>
                  </div>
                  {analysis.caToPratio && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ca:P Ratio:</span>
                      <span className="font-medium">{analysis.caToPratio.toFixed(2)}</span>
                    </div>
                  )}
                  {analysis.recommendedServingGrams > 0 && (
                    <div className="flex justify-between pt-2 border-t border-gray-200">
                      <span className="text-gray-600 font-medium">Recommended Serving:</span>
                      <span className="font-semibold text-primary-600">{analysis.recommendedServingGrams}g</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Meal Created Popup with Fireworks */}
      {showMealCreated && typeof window !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 p-4">
          <FireworksAnimation />
          
          <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full text-center relative z-10 transform transition-all duration-300">
            <div className="mb-4">
              <div className="text-6xl mb-2">🎆</div>
              <CheckCircle size={64} className="mx-auto text-green-600 animate-bounce" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Meal Created!</h2>
            {mealName && (
              <p className="text-lg text-primary-600 font-semibold mb-4">{mealName}</p>
            )}
            <p className="text-gray-600">
              Compatibility score: <span className="font-bold text-primary-600">{analysis?.score || 0}/100</span>
            </p>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

