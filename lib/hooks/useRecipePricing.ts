'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { Recipe } from '@/lib/types';

export type RecipePricingSource = 'snapshot' | 'estimate' | 'mixed' | 'none';

export type RecipePricingResult = {
  recipeId: string;
  costPerMealUsd: number | null;
  asOf: string | null;
  pricedIngredientCount: number;
  totalIngredientCount: number;
  missingIngredientKeys: string[];
  uniqueIngredientCount: number;
  isComplete: boolean;
  pricingSource: RecipePricingSource;
};

type ApiResponse = {
  results: RecipePricingResult[];
};

function stableRecipeKey(recipe: Recipe): string {
  const ingredients = Array.isArray((recipe as any)?.ingredients) ? (recipe as any).ingredients : [];
  return JSON.stringify({
    id: (recipe as any)?.id ?? '',
    servings: (recipe as any)?.servings ?? null,
    ingredients: ingredients.map((ing: any) => ({
      name: String(ing?.name || ''),
      amount: String(ing?.amount || ''),
      category: typeof ing?.category === 'string' ? ing.category : null,
    })),
  });
}

export function useRecipePricing(recipes: Recipe[] | null | undefined): {
  pricingByRecipeId: Record<string, RecipePricingResult>;
  isLoading: boolean;
  error: string | null;
} {
  const [pricingByRecipeId, setPricingByRecipeId] = useState<Record<string, RecipePricingResult>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestKey = useMemo(() => {
    const list = Array.isArray(recipes) ? recipes.filter(Boolean) : [];
    if (list.length === 0) return '';
    return list.map(stableRecipeKey).join('||');
  }, [recipes]);

  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const list = Array.isArray(recipes) ? recipes.filter(Boolean) : [];
    if (list.length === 0) {
      abortRef.current?.abort();
      setIsLoading(false);
      setError(null);
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);
    setError(null);

    fetch('/api/pricing/recipes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipes: list }),
      signal: controller.signal,
    })
      .then((r) => (r.ok ? (r.json() as Promise<ApiResponse>) : null))
      .then((data) => {
        if (!data?.results) return;
        const map: Record<string, RecipePricingResult> = {};
        data.results.forEach((res) => {
          if (res?.recipeId) map[res.recipeId] = res;
        });
        setPricingByRecipeId((prev) => ({ ...prev, ...map }));
      })
      .catch((e) => {
        if (e && typeof e === 'object' && 'name' in e && (e as any).name === 'AbortError') return;
        setError(e instanceof Error ? e.message : String(e));
      })
      .finally(() => {
        setIsLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, [requestKey]);

  return { pricingByRecipeId, isLoading, error };
}
