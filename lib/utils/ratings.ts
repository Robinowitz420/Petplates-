// lib/utils/ratings.ts - Core rating utilities for PetPlates

export interface RatingData {
  averageRating: number;
  totalReviews: number;
  distribution: { [key: number]: number }; // 1-5 stars count
}

export interface UserRating {
  recipeId: string;
  rating: number;
  timestamp: number;
}

// Storage keys
const USER_RATINGS_KEY = (userId: string) => `user_ratings_${userId}`;
const RECIPE_RATINGS_KEY = (recipeId: string) => `recipe_ratings_${recipeId}`;

/**
 * Save a user's rating for a recipe
 */
export const saveUserRating = (userId: string, recipeId: string, rating: number): void => {
  if (typeof window === 'undefined') return;

  const key = USER_RATINGS_KEY(userId);
  const existing = localStorage.getItem(key);
  const userRatings: UserRating[] = existing ? JSON.parse(existing) : [];

  // Remove existing rating for this recipe
  const filtered = userRatings.filter(r => r.recipeId !== recipeId);

  // Add new rating
  filtered.push({
    recipeId,
    rating,
    timestamp: Date.now()
  });

  localStorage.setItem(key, JSON.stringify(filtered));

  // Update global recipe ratings
  updateRecipeRatings(recipeId);
};

/**
 * Get a user's rating for a specific recipe
 */
export const getUserRating = (userId: string, recipeId: string): number | null => {
  if (typeof window === 'undefined') return null;

  const key = USER_RATINGS_KEY(userId);
  const existing = localStorage.getItem(key);

  if (!existing) return null;

  const userRatings: UserRating[] = JSON.parse(existing);
  const rating = userRatings.find(r => r.recipeId === recipeId);

  return rating ? rating.rating : null;
};

/**
 * Check if user has already rated a recipe
 */
export const hasUserRated = (userId: string, recipeId: string): boolean => {
  return getUserRating(userId, recipeId) !== null;
};

/**
 * Get all ratings for a recipe from all users
 */
export const getRecipeRatings = (recipeId: string): number[] => {
  if (typeof window === 'undefined') return [];

  // Optimized approach: iterate through all user_ratings keys more efficiently
  const ratings: number[] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('user_ratings_')) {
      try {
        const userRatings: UserRating[] = JSON.parse(localStorage.getItem(key) || '[]');
        const userRating = userRatings.find(r => r.recipeId === recipeId);
        if (userRating) {
          ratings.push(userRating.rating);
        }
      } catch (error) {
        // Skip corrupted data
        console.warn(`Skipping corrupted user ratings data for key: ${key}`);
      }
    }
  }

  return ratings;
};

/**
 * Update the global recipe ratings data
 */
export const updateRecipeRatings = (recipeId: string): void => {
  if (typeof window === 'undefined') return;

  const ratings = getRecipeRatings(recipeId);
  const key = RECIPE_RATINGS_KEY(recipeId);

  if (ratings.length === 0) {
    localStorage.removeItem(key);
    return;
  }

  const averageRating = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  ratings.forEach(rating => {
    distribution[rating as keyof typeof distribution]++;
  });

  const ratingData: RatingData = {
    averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
    totalReviews: ratings.length,
    distribution
  };

  localStorage.setItem(key, JSON.stringify(ratingData));
};

/**
 * Get rating data for a recipe
 */
export const getRecipeRatingData = (recipeId: string): RatingData => {
  if (typeof window === 'undefined') {
    return { averageRating: 0, totalReviews: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
  }

  const key = RECIPE_RATINGS_KEY(recipeId);
  const stored = localStorage.getItem(key);

  // If we have stored user ratings, use those
  if (stored) {
    return JSON.parse(stored);
  }

  // Otherwise, return default data (will be handled by RecipeCard using recipe.rating/reviews)
  return { averageRating: 0, totalReviews: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
};

/**
 * Calculate rating data on the fly (alternative to stored data)
 */
export const calculateRecipeRatingData = (recipeId: string): RatingData => {
  const ratings = getRecipeRatings(recipeId);

  if (ratings.length === 0) {
    return { averageRating: 0, totalReviews: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
  }

  const averageRating = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  ratings.forEach(rating => {
    distribution[rating as keyof typeof distribution]++;
  });

  return {
    averageRating: Math.round(averageRating * 10) / 10,
    totalReviews: ratings.length,
    distribution
  };
};

/**
 * Get star states for display (filled/empty stars)
 */
export const getStarStates = (rating: number): boolean[] => {
  const stars: boolean[] = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(i <= Math.round(rating));
  }
  return stars;
};

/**
 * Get partial star fill percentage for smooth display
 */
export const getStarFillPercentage = (rating: number, starIndex: number): number => {
  const fullStars = Math.floor(rating);
  const partialStar = rating - fullStars;

  if (starIndex < fullStars) return 100;
  if (starIndex === fullStars) return partialStar * 100;
  return 0;
};