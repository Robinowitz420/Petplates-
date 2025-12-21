import React from 'react';
import { CompatibilityRating } from '@/lib/utils/petRatingSystem';

interface RatingBreakdownProps {
  rating: CompatibilityRating;
  className?: string;
}

export const RatingBreakdown: React.FC<RatingBreakdownProps> = ({
  rating,
  className = ''
}) => {
  const getProgressBarColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-blue-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const formatFactorName = (key: string) => {
    switch (key) {
      case 'petTypeMatch':
        return 'Pet Type Match';
      case 'ageAppropriate':
        return 'Age Appropriate';
      case 'nutritionalFit':
        return 'Nutritional Fit';
      case 'healthCompatibility':
        return 'Health Compatibility';
      case 'allergenSafety':
        return 'Allergen Safety';
      default:
        return key;
    }
  };

  return (
    <div className={`bg-surface rounded-lg shadow-md p-6 border border-surface-highlight ${className}`}>
      <h3 className="text-xl font-bold text-gray-900 mb-6">Compatibility Analysis</h3>

      {/* Overall Score */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-lg font-semibold text-gray-900">Overall Compatibility</span>
          <span className="text-2xl font-bold text-gray-900">{rating.overallScore}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-300 ${getProgressBarColor(rating.overallScore)}`}
            style={{ width: `${rating.overallScore}%` }}
          />
        </div>
        <p className="text-sm text-gray-600 mt-2 capitalize">{rating.compatibility} match for your pet</p>
      </div>

      {/* Detailed Breakdown */}
      <div className="space-y-4 mb-6">
        <h4 className="text-lg font-semibold text-gray-900">Detailed Breakdown</h4>
        {Object.entries(rating.breakdown).map(([key, factor]) => (
          <div key={key} className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">
                  {formatFactorName(key)}
                </span>
                <span className="text-sm text-gray-600">
                  {factor.score}% ({factor.weight}% weight)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor(factor.score)}`}
                  style={{ width: `${factor.score}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">{factor.reason}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Warnings */}
      {rating.warnings.length > 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-red-700 mb-3 flex items-center">
            <span className="mr-2">⚠️</span>
            Important Considerations
          </h4>
          <ul className="space-y-2">
            {rating.warnings.map((warning, index) => (
              <li key={index} className="flex items-start text-sm text-red-700">
                <span className="mr-2 mt-1">•</span>
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Strengths */}
      {rating.strengths.length > 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-green-700 mb-3 flex items-center">
            <span className="mr-2">✅</span>
            Recipe Strengths
          </h4>
          <ul className="space-y-2">
            {rating.strengths.map((strength, index) => (
              <li key={index} className="flex items-start text-sm text-green-700">
                <span className="mr-2 mt-1">•</span>
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommendations */}
      {rating.recommendations.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-blue-700 mb-3 flex items-center">
            <span className="mr-2">💡</span>
            Recommendations
          </h4>
          <ul className="space-y-2">
            {rating.recommendations.map((recommendation, index) => (
              <li key={index} className="flex items-start text-sm text-blue-700">
                <span className="mr-2 mt-1">•</span>
                <span>{recommendation}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};