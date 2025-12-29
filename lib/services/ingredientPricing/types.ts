export type IngredientPriceSnapshot = {
  ingredientKey: string;
  query: string;
  asin: string;
  title: string;
  url: string;
  priceUsd: number;
  weightGrams: number;
  unitPriceUsdPerGram: number;
  capturedAt: string;
};

export type IngredientPricingCandidate = {
  asin: string;
  title: string;
  url: string;
  priceUsd: number;
  weightGrams: number;
  unitPriceUsdPerGram: number;
};

export type RecipePricingResult = {
  recipeId: string;
  costPerMealUsd: number | null;
  asOf: string | null;
  pricedIngredientCount: number;
  totalIngredientCount: number;
  missingIngredientKeys: string[];
};
