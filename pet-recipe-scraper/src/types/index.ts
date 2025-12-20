/**
 * PET RECIPE SCRAPER - TYPE DEFINITIONS
 * Professional-grade scraper for pet nutrition recipes across all species
 */

export type Species = 'cats' | 'dogs' | 'reptiles' | 'birds' | 'pocket-pets';
export type LifeStage = 'puppy' | 'kitten' | 'adult' | 'senior' | 'juvenile';
export type SafetyStatus = 'safe' | 'caution' | 'toxic' | 'unknown';
export type SourceTier = 'veterinary' | 'brand' | 'community' | 'regulatory' | 'academic';

export interface ScrapedRecipe {
  id: string;
  name: string;
  species: Species[];
  lifeStage?: LifeStage[];
  ingredients: RecipeIngredient[];
  instructions?: string[];
  nutritionalInfo?: NutritionalInfo;
  warnings?: string[];
  frequency?: string;
  servingSize?: string;
  prepTime?: string;
  sourceUrl: string;
  sourceName: string;
  sourceTier: SourceTier;
  scrapedAt: Date;
  vetApproved?: boolean;
  tags?: string[];
}

export interface RecipeIngredient {
  name: string;
  amount?: string;
  unit?: string;
  notes?: string;
  safetyStatus?: SafetyStatus;
}

export interface NutritionalInfo {
  protein?: number;
  fat?: number;
  fiber?: number;
  moisture?: number;
  calories?: number;
  calcium?: number;
  phosphorus?: number;
  calciumPhosphorusRatio?: number;
  vitaminC?: number;
  [key: string]: number | undefined;
}

export interface IngredientSafety {
  ingredient: string;
  scientificName?: string;
  safeFor: Species[];
  toxicFor: Species[];
  cautionFor: Species[];
  notes?: string;
  imageUrl?: string;
}

export interface ScraperSource {
  id: string;
  name: string;
  baseUrl: string;
  tier: SourceTier;
  species: Species[];
  active: boolean;
  respectRobotsTxt: boolean;
  rateLimit: number;
  startUrls?: string[];
  selectors: SourceSelectors;
  lastScraped?: Date;
}

export interface SourceSelectors {
  recipeList?: string;
  recipeCard?: string;
  recipeTitle?: string;
  ingredients?: string;
  instructions?: string;
  nutritionTable?: string;
  warnings?: string;
  species?: string;
  [key: string]: string | undefined;
}

export interface ScraperOptions {
  headless?: boolean;
  timeout?: number;
  userAgent?: string;
  maxRetries?: number;
  respectRobotsTxt?: boolean;
  outputDir?: string;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
}

export interface ScraperResult {
  success: boolean;
  recipesScraped: number;
  ingredientsSafety: number;
  errors: string[];
  warnings: string[];
  duration: number;
  source: string;
}
