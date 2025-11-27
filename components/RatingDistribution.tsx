import React from 'react';

interface RatingDistributionProps {
  distribution: { [key: number]: number };
  totalReviews: number;
  className?: string;
}

export const RatingDistribution: React.FC<RatingDistributionProps> = ({
  distribution,
  totalReviews,
  className = ''
}) => {
  if (totalReviews === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-gray-500">No ratings yet</p>
        <p className="text-sm text-gray-400 mt-1">Be the first to rate this recipe!</p>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {[5, 4, 3, 2, 1].map((stars) => {
        const count = distribution[stars] || 0;
        const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

        return (
          <div key={stars} className="flex items-center gap-3">
            <div className="flex items-center gap-1 min-w-[60px]">
              <span className="text-sm font-medium text-gray-700">{stars}</span>
              <svg className="w-4 h-4 text-yellow-400 fill-yellow-400" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>

            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className="bg-yellow-400 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${percentage}%` }}
              />
            </div>

            <div className="min-w-[40px] text-right">
              <span className="text-sm text-gray-600">{count}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};