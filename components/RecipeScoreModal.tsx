'use client';

import React, { useEffect } from 'react';
import { X, AlertTriangle, CheckCircle, Info, Star } from 'lucide-react';
import type { Pet } from '@/lib/utils/petRatingSystem';
import {
  calculateEnhancedCompatibility,
  type Pet as EnhancedPet,
} from '@/lib/utils/enhancedCompatibilityScoring';
import type { Recipe } from '@/lib/types';
import healthConcerns from '@/lib/data/healthConcerns';
import { actionNeededBeep } from '@/lib/utils/beep';
import { ensureSellerId, isValidAmazonUrl } from '@/lib/utils/affiliateLinks';

interface Props {
  recipe: Recipe;
  pet?: Pet | null;
  onClose?: () => void;
}

// simple button style helper (you probably already have similar)
const Btn: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, ...p }) => (
  <button {...p} className={`px-3 py-2 rounded-md text-sm font-semibold bg-primary-600 text-white hover:opacity-95 ${p.className ?? ''}`}>
    {children}
  </button>
);

export default function RecipeScoreModal({ recipe, pet, onClose }: Props) {
  // Use improved scoring if available, fallback to original
  let rating: any = null;

  if (pet) {
    try {
      const enhancedPet: EnhancedPet = {
        id: pet.id,
        name: pet.name,
        type: pet.type as 'dog' | 'cat' | 'bird' | 'reptile' | 'pocket-pet',
        breed: pet.breed,
        age: typeof pet.age === 'string' ? parseFloat(pet.age) || 1 : pet.age || 1,
        weight: pet.weight || 10,
        activityLevel: pet.activityLevel,
        healthConcerns: pet.healthConcerns || [],
        dietaryRestrictions: pet.dietaryRestrictions || [],
        allergies: pet.allergies || [],
      };
      const enhancedScore = calculateEnhancedCompatibility(recipe, enhancedPet);
      // Convert enhanced score to expected format
      const stars = Math.round(enhancedScore.overallScore / 20);
      rating = {
        overallScore: enhancedScore.overallScore,
        stars: stars,
        recommendation: enhancedScore.grade === 'A+' || enhancedScore.grade === 'A' ? 'excellent' :
                       enhancedScore.grade === 'B+' || enhancedScore.grade === 'B' ? 'good' :
                       enhancedScore.grade === 'C+' || enhancedScore.grade === 'C' ? 'fair' : 'poor',
        summaryReasoning: `Compatibility score: ${enhancedScore.overallScore}% (${enhancedScore.grade})`,
        compatibility: enhancedScore.grade === 'A+' || enhancedScore.grade === 'A' ? 'excellent' :
                       enhancedScore.grade === 'B+' || enhancedScore.grade === 'B' ? 'good' :
                       enhancedScore.grade === 'C+' || enhancedScore.grade === 'C' ? 'fair' : 'poor',
        breakdown: {
          petTypeMatch: { score: enhancedScore.factors.ingredientSafety.score },
          ageAppropriate: { score: enhancedScore.factors.lifeStageFit.score },
          nutritionalFit: { score: enhancedScore.factors.nutritionalAdequacy.score },
          healthCompatibility: { score: enhancedScore.factors.healthAlignment.score },
          activityFit: { score: enhancedScore.factors.activityFit.score },
          allergenSafety: { score: enhancedScore.factors.allergenSafety.score },
        },
        warnings: enhancedScore.detailedBreakdown.warnings,
        strengths: enhancedScore.detailedBreakdown.healthBenefits,
        recommendations: enhancedScore.detailedBreakdown.recommendations,
      };
    } catch (error) {
      console.error('Error calculating compatibility:', error);
      rating = null;
    }
  }

  if (!rating) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm">
        <div className="w-full max-w-2xl bg-surface rounded-xl shadow-lg border border-surface-highlight p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-foreground">Recipe Compatibility</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-white"><X /></button>
          </div>
          <p className="text-sm text-gray-400">Select a pet to view compatibility details.</p>
        </div>
      </div>
    );
  }

  // Play a short cue when the modal opens to prompt user action.
  useEffect(() => {
    actionNeededBeep();
  }, []);

  const { overallScore, compatibility, breakdown, warnings, strengths, recommendations, stars, summaryReasoning, recommendation } = rating;

  function openAmazon(link: string) {
    if (!link) return;
    const affiliateLink = isValidAmazonUrl(link) ? ensureSellerId(link) : link;
    window.open(affiliateLink, '_blank', 'noopener,noreferrer');
  }

  // Build quick-swap buttons from healthConcerns mapping for relevant pet issues
  const concernRecs = (pet?.healthConcerns || [])
    .map(c => healthConcerns.find(h => h.value === c))
    .filter(Boolean) as (typeof healthConcerns[0])[];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 sm:px-6 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-3xl bg-surface rounded-xl shadow-2xl overflow-hidden border border-surface-highlight">
        <div className="flex items-start justify-between p-5 border-b border-surface-highlight bg-surface">
          <div>
            <h2 className="text-xl font-bold text-foreground">{recipe.name}</h2>
            <p className="text-sm text-gray-400 mt-1">{recipe.description}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">Score</span>
              <div className={`px-3 py-1 rounded-md font-semibold ${overallScore >= 85 ? 'bg-green-900/30 text-green-400 border border-green-800' : overallScore >= 70 ? 'bg-amber-900/30 text-amber-400 border border-amber-800' : 'bg-red-900/30 text-red-400 border border-red-800'}`}>
                {overallScore} / 100
              </div>
            </div>
            <div className="flex items-center gap-1 text-yellow-500" aria-label="star rating">
              {[1,2,3,4,5].map(i => (
                <Star key={i} className={`w-4 h-4 ${stars && i <= stars ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'}`} />
              ))}
              <span className="text-xs text-gray-400 ml-1">{recommendation || compatibility}</span>
            </div>
            <button onClick={onClose} className="p-2 rounded text-gray-400 hover:bg-surface-highlight hover:text-white">
              <X />
            </button>
          </div>
        </div>

        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4 bg-surface">
          {/* Left: Breakdown */}
          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-gray-200">Why this score</h4>
            </div>
            {summaryReasoning && (
              <div className="mb-3 text-sm text-gray-300 font-semibold italic">
                {summaryReasoning}
              </div>
            )}
            <div className="space-y-2 text-sm text-gray-400">
              <div className="flex items-center justify-between">
                <div>Ingredient Safety</div>
                <div className="font-mono text-gray-300">{breakdown.petTypeMatch.score}%</div>
              </div>
              <div className="flex items-center justify-between">
                <div>Nutritional Adequacy</div>
                <div className="font-mono text-gray-300">{breakdown.nutritionalFit.score}%</div>
              </div>
              <div className="flex items-center justify-between">
                <div>Health Alignment</div>
                <div className="font-mono text-gray-300">{breakdown.healthCompatibility.score}%</div>
              </div>
              <div className="flex items-center justify-between">
                <div>Life Stage Fit</div>
                <div className="font-mono text-gray-300">{breakdown.ageAppropriate.score}%</div>
              </div>
              <div className="flex items-center justify-between">
                <div>Allergen Safety</div>
                <div className="font-mono text-gray-300">{breakdown.allergenSafety.score}%</div>
              </div>
            </div>

            {/* Strengths */}
            {strengths.length > 0 && (
              <div className="mt-4">
                <h5 className="text-sm font-semibold text-green-400">Strengths</h5>
                <ul className="list-disc ml-5 text-sm text-gray-400">
                  {strengths.map((s: string, i: number) => <li key={i}>{s}</li>)}
                </ul>
              </div>
            )}

            {/* Warnings */}
            {warnings.length > 0 && (
              <div className="mt-4">
                <h5 className="text-sm font-semibold text-red-400">Warnings</h5>
                <ul className="list-disc ml-5 text-sm text-red-300/80">
                  {warnings.map((w: string, i: number) => <li key={i}>{w}</li>)}
                </ul>
              </div>
            )}

            {/* Recommendations (generic) */}
            <div className="mt-4">
              <h5 className="text-sm font-semibold text-gray-200">Quick recommendations</h5>
              <div className="flex flex-wrap gap-2 mt-2">
                {concernRecs.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => {
                      const first = c.recommendedProducts?.[0];
                      if (first?.affiliateUrl) openAmazon(first.affiliateUrl);
                    }}
                    className="px-3 py-1 rounded-md border border-surface-highlight text-sm bg-surface-lighter text-gray-300 hover:bg-surface-highlight hover:text-white"
                    title={c.label}
                  >
                    {c.label} → Suggested
                  </button>
                ))}

                <button
                  onClick={() => {
                    openAmazon('https://www.amazon.com/s?k=dog+joint+supplement');
                  }}
                  className="px-3 py-1 rounded-md border border-primary-800 text-sm bg-primary-900/20 text-primary-300 hover:bg-primary-900/40"
                >
                  Browse supplements
                </button>
              </div>
            </div>
          </div>

          {/* Right: Quick edits / portion & swaps */}
          <div>
            <h4 className="text-sm font-semibold mb-2 text-gray-200">Quick fixes</h4>

            <div className="space-y-3 text-sm">
              {/* Portion hint */}
              <div className="p-3 border border-surface-highlight rounded-md bg-surface-lighter">
                <div className="flex items-start gap-2">
                  <Info className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-xs text-gray-500">Portion suggestion</div>
                    <div className="font-semibold text-gray-200">{recipe.servings} serving(s) — reduce by 10% if weight loss is target</div>
                  </div>
                </div>
              </div>

              {/* Swap protein (example action) */}
              <div className="p-3 border border-surface-highlight rounded-md bg-surface-lighter">
                <div className="text-xs text-gray-500">Swap protein</div>
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => openAmazon('https://www.amazon.com/s?k=novel+protein+venison')}
                    className="px-3 py-1 rounded-md border border-surface-highlight text-gray-300 hover:bg-surface-highlight hover:text-white text-sm"
                  >
                    Venison topper
                  </button>
                  <button
                    onClick={() => openAmazon('https://www.amazon.com/s?k=novel+protein=rabbit')}
                    className="px-3 py-1 rounded-md border border-surface-highlight text-gray-300 hover:bg-surface-highlight hover:text-white text-sm"
                  >
                    Rabbit topper
                  </button>
                </div>
              </div>

              {/* Save recipe to pet quick CTA */}
              <div className="p-3 border border-surface-highlight rounded-md bg-surface-lighter">
                <div className="text-xs text-gray-500">Save / Add</div>
                <div className="mt-2 flex gap-2">
                  <Btn onClick={() => {
                    if (!pet) { alert('Select a pet first'); return; }
                    const key = `saved_recipes_${pet.id}`;
                    const existing = localStorage.getItem(key);
                    const arr = existing ? JSON.parse(existing) : [];
                    if (!arr.find((r:any) => r.id === recipe.id)) {
                      arr.push({ id: recipe.id, name: recipe.name, savedAt: new Date().toISOString() });
                      localStorage.setItem(key, JSON.stringify(arr));
                      alert(`Saved to ${pet.name}`);
                    } else {
                      alert('Already saved');
                    }
                  }}>Add to {pet?.name ?? 'Pet'}</Btn>

                  <button onClick={() => {
                    window.location.href = `/recipe/${recipe.id}?petId=${pet?.id ?? ''}`;
                  }} className="px-3 py-1 rounded-md border border-surface-highlight text-gray-300 hover:bg-surface-highlight hover:text-white">View recipe</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 border-t border-surface-highlight bg-surface flex justify-end gap-3">
          <button onClick={onClose} className="px-3 py-2 rounded-md border border-surface-highlight text-gray-300 hover:bg-surface-highlight hover:text-white">Close</button>
        </div>
      </div>
    </div>
  );
}