import React from 'react';

type ScoreTier = 'perfect' | 'excellent' | 'great' | 'good' | 'fair' | 'poor';

function getScoreTier(score: number): ScoreTier {
  if (score >= 95) return 'perfect';
  if (score >= 90) return 'excellent';
  if (score >= 85) return 'great';
  if (score >= 80) return 'good';
  if (score >= 70) return 'fair';
  return 'poor';
}

interface CompatibilityBadgeProps {
  compatibility?: 'excellent' | 'good' | 'fair' | 'poor';
  score: number;
  className?: string;
  isGoldStandard?: boolean;
  hasPerfectMatches?: boolean;
}

export const CompatibilityBadge: React.FC<CompatibilityBadgeProps> = ({
  compatibility,
  score,
  className = '',
  isGoldStandard = false,
  hasPerfectMatches = true
}) => {
  // Use scoring tier system for better UX
  const tier = getScoreTier(score);
  
  // Determine compatibility from score if not provided
  const effectiveCompatibility = compatibility || (
    score >= 95 ? 'excellent' :
    score >= 85 ? 'good' :
    score >= 70 ? 'fair' : 'poor'
  );
  
  const getBadgeStyles = () => {
    switch (effectiveCompatibility) {
      case 'excellent':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'good':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'fair':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'poor':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCompatibilityLabel = (): string => {
    if (score >= 95 && isGoldStandard) {
      return 'Perfect Match';
    } else if (score >= 90) {
      return 'Excellent Match';
    } else if (score >= 85) {
      return 'Great Match';
    } else if (score >= 80) {
      return 'Good Match';
    } else if (score >= 70) {
      return 'Acceptable Match';
    } else {
      return hasPerfectMatches 
        ? 'Below Average Match'
        : 'Best Available Match';
    }
  };

  const getScoreSubtext = (): string => {
    if (!hasPerfectMatches && score < 90) {
      return ' (no perfect matches for this profile yet)';
    }
    if (isGoldStandard) {
      return ' (meets all requirements)';
    }
    return '';
  };

  return (
    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getBadgeStyles()} ${className}`}>
      <span>{score}% {getCompatibilityLabel()}{getScoreSubtext()}</span>
    </div>
  );
};