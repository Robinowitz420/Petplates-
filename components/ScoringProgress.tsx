// components/ScoringProgress.tsx
// Progress indicator for chunked recipe scoring

'use client';

interface ScoringProgressProps {
  progress: number;
  totalMeals: number;
  scoredCount: number;
  currentRecipe?: string;
}

export default function ScoringProgress({
  progress,
  totalMeals,
  scoredCount,
  currentRecipe,
}: ScoringProgressProps) {
  const displayProgress = Math.round(progress);

  return (
    <div className="bg-surface rounded-lg shadow-md border border-surface-highlight p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Analyzing Recipes
          </h3>
          <p className="text-sm text-gray-400">
            Finding the best matches for your pet
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-orange-500">
            {displayProgress}%
          </div>
          <div className="text-xs text-gray-500">complete</div>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-400 mb-1">
          <span>Progress</span>
          <span>{scoredCount}/{totalMeals} recipes</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-orange-400 to-orange-500 h-3 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {currentRecipe && (
        <div className="mb-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
          <div className="flex items-center">
            <div className="mr-3">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-800">
                Currently scoring
              </div>
              <div className="text-sm text-gray-600 truncate">
                {currentRecipe}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="text-xs text-gray-500 text-center">
        Scoring happens in the background • You can continue browsing
      </div>
    </div>
  );
}

