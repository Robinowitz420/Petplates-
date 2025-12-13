import React, { useState, useEffect } from 'react';
import { StarRating } from './StarRating';
import { InteractiveStarRating } from './InteractiveStarRating';
import { RatingDistribution } from './RatingDistribution';
import {
  saveUserRating,
  getUserRating,
  hasUserRated,
  getRecipeRatingData
} from '@/lib/utils/ratings';
import { CheckCircle, X, MessageSquare, ThumbsUp, ThumbsDown } from 'lucide-react';
import { logger } from '@/lib/utils/logger';

interface RecipeRatingSectionProps {
  recipeId: string;
  recipeName: string;
  userId?: string;
  className?: string;
}

export const RecipeRatingSection: React.FC<RecipeRatingSectionProps> = ({
  recipeId,
  recipeName,
  userId,
  className = ''
}) => {
  const [ratingData, setRatingData] = useState({
    averageRating: 0,
    totalReviews: 0,
    distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as { [key: number]: number }
  });
  const [userCurrentRating, setUserCurrentRating] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [showDetailedReview, setShowDetailedReview] = useState(false);

  // Enhanced feedback state
  const [petAcceptance, setPetAcceptance] = useState<boolean | null>(null);
  const [prepEase, setPrepEase] = useState<number | null>(null);
  const [nutritionOutcome, setNutritionOutcome] = useState<boolean | null>(null);
  const [valueRating, setValueRating] = useState<number | null>(null);
  const [reviewText, setReviewText] = useState('');
  const [modifications, setModifications] = useState('');

  useEffect(() => {
    loadRatingData();
  }, [recipeId]);

  useEffect(() => {
    if (userId) {
      const userRating = getUserRating(userId, recipeId);
      setUserCurrentRating(userRating);
    } else {
      setUserCurrentRating(null);
    }
  }, [userId, recipeId]);

  const loadRatingData = () => {
    const data = getRecipeRatingData(recipeId);
    setRatingData(data);
  };

  const handleRatingSubmit = async (rating: number) => {
    if (!userId) {
      setShowLoginPrompt(true);
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      // Save basic rating
      saveUserRating(userId, recipeId, rating);
      setUserCurrentRating(rating);

      // If detailed review is provided, save it too
      if (showDetailedReview && (petAcceptance !== null || prepEase || nutritionOutcome !== null || valueRating || reviewText.trim() || modifications.trim())) {
        const detailedReview = {
          petAcceptance,
          prepEase,
          nutritionOutcome,
          valueRating,
          reviewText: reviewText.trim(),
          modifications: modifications.trim(),
          timestamp: new Date().toISOString()
        };

        // Save detailed review (we'll implement this storage later)
        const existingReviews = JSON.parse(localStorage.getItem(`recipe_reviews_${recipeId}`) || '[]');
        const userReviewIndex = existingReviews.findIndex((r: any) => r.userId === userId);

        if (userReviewIndex >= 0) {
          existingReviews[userReviewIndex] = { ...detailedReview, userId, rating };
        } else {
          existingReviews.push({ ...detailedReview, userId, rating });
        }

        localStorage.setItem(`recipe_reviews_${recipeId}`, JSON.stringify(existingReviews));
      }

      // Reload rating data to show updated averages
      loadRatingData();

      setMessage('Thank you for your feedback! ⭐');
      setTimeout(() => setMessage(null), 3000);

      // Reset form
      setShowDetailedReview(false);
      setPetAcceptance(null);
      setPrepEase(null);
      setNutritionOutcome(null);
      setValueRating(null);
      setReviewText('');
      setModifications('');
    } catch (error) {
      logger.error('Error saving rating:', error);
      setMessage('Failed to save rating. Please try again.');
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasUserAlreadyRated = userId ? hasUserRated(userId, recipeId) : false;

  return (
    <div className={`bg-surface rounded-2xl shadow-lg p-3 border-l-4 border-green-500 border border-surface-highlight ${className}`}>
      <h3 className="text-base font-bold text-green-300 mb-3">Pet Reviews</h3>

      {/* Overall Rating Summary */}
      <div className="flex items-center gap-3 mb-3 p-2 bg-green-900/20 rounded-lg border border-green-700/30">
        <div className="text-center">
          <div className="text-xl font-bold text-green-300">
            {ratingData.averageRating.toFixed(1)}
          </div>
          <StarRating rating={ratingData.averageRating} size="sm" />
          <div className="text-xs text-green-400 mt-1">
            {ratingData.totalReviews} {ratingData.totalReviews === 1 ? 'review' : 'reviews'}
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="flex-1">
          <RatingDistribution
            distribution={ratingData.distribution}
            totalReviews={ratingData.totalReviews}
          />
        </div>
      </div>

      {/* User Rating Section */}
      <div className="border-t border-surface-highlight pt-4">
        <h4 className="text-sm font-semibold text-gray-300 mb-3">
          {hasUserAlreadyRated ? 'Your Rating' : 'Rate This Recipe'}
        </h4>

        {userId ? (
          <div className="space-y-4">
            {hasUserAlreadyRated ? (
              <div className="flex items-center gap-3">
                <span className="text-gray-300 text-sm">You rated this recipe:</span>
                <InteractiveStarRating
                  currentRating={userCurrentRating || 0}
                  onRatingChange={handleRatingSubmit}
                  disabled={isSubmitting}
                />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="space-y-2">
                  <p className="text-gray-300 text-sm">
                    How would you rate "{recipeName}"?
                  </p>
                  <InteractiveStarRating
                    currentRating={userCurrentRating || 0}
                    onRatingChange={handleRatingSubmit}
                    disabled={isSubmitting}
                    size="lg"
                  />
                </div>

                {/* Detailed Review Toggle */}
                <div className="border-t border-green-700/30 pt-2">
                  <button
                    onClick={() => setShowDetailedReview(!showDetailedReview)}
                    className="flex items-center gap-1.5 text-green-400 hover:text-green-300 font-medium text-xs"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    {showDetailedReview ? 'Hide' : 'Add'} Detailed Review
                  </button>
                  <p className="text-[10px] text-gray-500 mt-0.5">
                    Help improve this recipe for other pet parents
                  </p>
                </div>

                {/* Detailed Review Form */}
                {showDetailedReview && (
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-4">
                    {/* Pet Acceptance */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Did your pet eat this meal?
                      </label>
                      <div className="flex gap-4">
                        <button
                          onClick={() => setPetAcceptance(true)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                            petAcceptance === true
                              ? 'bg-green-100 border-green-300 text-green-800'
                              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <ThumbsUp className="w-4 h-4" />
                          Yes, ate it all
                        </button>
                        <button
                          onClick={() => setPetAcceptance(false)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                            petAcceptance === false
                              ? 'bg-red-100 border-red-300 text-red-800'
                              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <ThumbsDown className="w-4 h-4" />
                          No, refused it
                        </button>
                      </div>
                    </div>

                    {/* Preparation Ease */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        How easy was this to prepare? (1-5 stars)
                      </label>
                      <InteractiveStarRating
                        currentRating={prepEase || 0}
                        onRatingChange={setPrepEase}
                        disabled={false}
                        size="sm"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Very difficult</span>
                        <span>Very easy</span>
                      </div>
                    </div>

                    {/* Nutritional Outcome */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Did this meet your nutritional expectations?
                      </label>
                      <div className="flex gap-4">
                        <button
                          onClick={() => setNutritionOutcome(true)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                            nutritionOutcome === true
                              ? 'bg-green-100 border-green-300 text-green-800'
                              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <CheckCircle className="w-4 h-4" />
                          Yes, very balanced
                        </button>
                        <button
                          onClick={() => setNutritionOutcome(false)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                            nutritionOutcome === false
                              ? 'bg-yellow-100 border-yellow-300 text-yellow-800'
                              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <X className="w-4 h-4" />
                          Could be improved
                        </button>
                      </div>
                    </div>

                    {/* Value Rating */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Value for money (1-5 stars)
                      </label>
                      <InteractiveStarRating
                        currentRating={valueRating || 0}
                        onRatingChange={setValueRating}
                        disabled={false}
                        size="sm"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Poor value</span>
                        <span>Excellent value</span>
                      </div>
                    </div>

                    {/* Modifications Made */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Any modifications you made? (Optional)
                      </label>
                      <textarea
                        value={modifications}
                        onChange={(e) => setModifications(e.target.value)}
                        placeholder="e.g., Added more carrots, reduced protein portion..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        rows={2}
                      />
                    </div>

                    {/* Review Text */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Additional feedback (Optional)
                      </label>
                      <textarea
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        placeholder="Share your experience, tips for other pet parents..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        rows={3}
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      onClick={() => handleRatingSubmit(userCurrentRating || 0)}
                      disabled={isSubmitting}
                      className="w-full px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 disabled:bg-gray-400 transition-colors"
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Detailed Review'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {isSubmitting && (
              <div className="text-sm text-blue-600">
                Saving your rating...
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-600 mb-4">
              Sign in to rate and review recipes
            </p>
            <button
              onClick={() => setShowLoginPrompt(true)}
              className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Sign In to Rate
            </button>
          </div>
        )}

        {/* Success/Error Messages */}
        {message && (
          <div className={`mt-4 p-3 rounded-lg text-sm font-medium ${
            message.includes('Thank you')
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {message}
          </div>
        )}

        {/* Login Prompt Modal (simple implementation) */}
        {showLoginPrompt && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md mx-4">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Sign In Required
              </h3>
              <p className="text-gray-600 mb-6">
                You need to be signed in to rate and review recipes. This helps us maintain quality ratings.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLoginPrompt(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Redirect to sign in page
                    window.location.href = '/sign-in';
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Sign In
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};