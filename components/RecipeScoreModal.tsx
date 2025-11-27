'use client';

import React from 'react';
import { X, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import type { Pet } from '@/lib/utils/petRatingSystem';
import { rateRecipeForPet } from '@/lib/utils/petRatingSystem';
import type { Recipe } from '@/lib/types';
import healthConcerns from '@/lib/data/healthConcerns';

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
  const rating = pet ? rateRecipeForPet(recipe, pet) : null;

  if (!rating) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">Recipe Compatibility</h3>
            <button onClick={onClose}><X /></button>
          </div>
          <p className="text-sm text-gray-600">Select a pet to view compatibility details.</p>
        </div>
      </div>
    );
  }

  const { overallScore, compatibility, breakdown, warnings, strengths, recommendations } = rating;

  function openAmazon(link: string) {
    if (!link) return;
    // Add affiliate tag to Amazon links
    const affiliateLink = link.includes('amazon.com') && !link.includes('tag=') ?
      link + (link.includes('?') ? '&' : '?') + 'tag=robinfrench-20' : link;
    window.open(affiliateLink, '_blank', 'noopener,noreferrer');
  }

  // Build quick-swap buttons from healthConcerns mapping for relevant pet issues
  const concernRecs = (pet?.healthConcerns || [])
    .map(c => healthConcerns.find(h => h.value === c))
    .filter(Boolean) as (typeof healthConcerns[0])[];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 sm:px-6">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-2xl overflow-hidden ring-1 ring-black/5">
        <div className="flex items-start justify-between p-5 border-b">
          <div>
            <h2 className="text-xl font-bold">{recipe.name}</h2>
            <p className="text-sm text-gray-600 mt-1">{recipe.description}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Score</span>
              <div className={`px-3 py-1 rounded-md font-semibold ${overallScore >= 85 ? 'bg-green-50 text-green-700' : overallScore >= 70 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'}`}>
                {overallScore} / 100
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded hover:bg-gray-100">
              <X />
            </button>
          </div>
        </div>

        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Left: Breakdown */}
          <div className="md:col-span-2">
            <h4 className="text-sm font-semibold mb-2">Why this score</h4>
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex items-center justify-between">
                <div>Species match</div>
                <div className="font-mono">{breakdown.petTypeMatch.score}%</div>
              </div>
              <div className="flex items-center justify-between">
                <div>Age appropriateness</div>
                <div className="font-mono">{breakdown.ageAppropriate.score}%</div>
              </div>
              <div className="flex items-center justify-between">
                <div>Nutritional fit</div>
                <div className="font-mono">{breakdown.nutritionalFit.score}%</div>
              </div>
              <div className="flex items-center justify-between">
                <div>Health compatibility</div>
                <div className="font-mono">{breakdown.healthCompatibility.score}%</div>
              </div>
              <div className="flex items-center justify-between">
                <div>Allergen safety</div>
                <div className="font-mono">{breakdown.allergenSafety.score}%</div>
              </div>
            </div>

            {/* Strengths */}
            {strengths.length > 0 && (
              <div className="mt-4">
                <h5 className="text-sm font-semibold">Strengths</h5>
                <ul className="list-disc ml-5 text-sm text-gray-700">
                  {strengths.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
            )}

            {/* Warnings */}
            {warnings.length > 0 && (
              <div className="mt-4">
                <h5 className="text-sm font-semibold">Warnings</h5>
                <ul className="list-disc ml-5 text-sm text-red-700">
                  {warnings.map((w, i) => <li key={i}>{w}</li>)}
                </ul>
              </div>
            )}

            {/* Recommendations (generic) */}
            <div className="mt-4">
              <h5 className="text-sm font-semibold">Quick recommendations</h5>
              <div className="flex flex-wrap gap-2 mt-2">
                {/* show recommended ingredient/supplement buttons from the concernRecs */}
                {concernRecs.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => {
                      // open primary recommended supplement/product (first item) if present
                      const first = c.recommendedProducts?.[0];
                      if (first?.affiliateUrl) openAmazon(first.affiliateUrl);
                    }}
                    className="px-3 py-1 rounded-md border text-sm bg-white hover:bg-gray-50"
                    title={c.label}
                  >
                    {c.label} → Suggested
                  </button>
                ))}

                {/* Add a generic "Add supplement" CTA (hook to your affiliate flow) */}
                <button
                  onClick={() => {
                    // example: open a general supplements search
                    openAmazon('https://www.amazon.com/s?k=dog+joint+supplement');
                  }}
                  className="px-3 py-1 rounded-md border text-sm bg-primary-50 text-primary-700"
                >
                  Browse supplements
                </button>
              </div>
            </div>
          </div>

          {/* Right: Quick edits / portion & swaps */}
          <div>
            <h4 className="text-sm font-semibold mb-2">Quick fixes</h4>

            <div className="space-y-3 text-sm">
              {/* Portion hint */}
              <div className="p-3 border rounded-md">
                <div className="flex items-start gap-2">
                  <Info className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-xs text-gray-600">Portion suggestion</div>
                    <div className="font-semibold">{recipe.servings} serving(s) — reduce by 10% if weight loss is target</div>
                  </div>
                </div>
              </div>

              {/* Swap protein (example action) */}
              <div className="p-3 border rounded-md">
                <div className="text-xs text-gray-600">Swap protein</div>
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => openAmazon('https://www.amazon.com/s?k=novel+protein+venison')}
                    className="px-3 py-1 rounded-md border text-sm"
                  >
                    Venison topper
                  </button>
                  <button
                    onClick={() => openAmazon('https://www.amazon.com/s?k=novel+protein=rabbit')}
                    className="px-3 py-1 rounded-md border text-sm"
                  >
                    Rabbit topper
                  </button>
                </div>
              </div>

              {/* Save recipe to pet quick CTA */}
              <div className="p-3 border rounded-md">
                <div className="text-xs text-gray-600">Save / Add</div>
                <div className="mt-2 flex gap-2">
                  <Btn onClick={() => {
                    // hacky client save for MVP: store saved recipes per pet in localStorage
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
                    // navigate to full recipe page
                    window.location.href = `/recipe/${recipe.id}?petId=${pet?.id ?? ''}`;
                  }} className="px-3 py-1 rounded-md border">View recipe</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 border-t flex justify-end gap-3">
          <button onClick={onClose} className="px-3 py-2 rounded-md border">Close</button>
        </div>
      </div>
    </div>
  );
}