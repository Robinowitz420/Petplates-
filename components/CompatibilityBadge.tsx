import React from 'react';

interface CompatibilityBadgeProps {
  compatibility: 'excellent' | 'good' | 'fair' | 'poor';
  score: number;
  className?: string;
}

export const CompatibilityBadge: React.FC<CompatibilityBadgeProps> = ({
  compatibility,
  score,
  className = ''
}) => {
  const getBadgeStyles = () => {
    switch (compatibility) {
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

  const getCompatibilityLabel = () => {
    switch (compatibility) {
      case 'excellent':
        return 'Excellent Match';
      case 'good':
        return 'Good Match';
      case 'fair':
        return 'Fair Match';
      case 'poor':
        return 'Poor Match';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getBadgeStyles()} ${className}`}>
      <span>{score}% {getCompatibilityLabel()}</span>
    </div>
  );
};