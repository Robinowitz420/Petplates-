import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface InteractiveStarRatingProps {
  currentRating?: number;
  onRatingChange: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
}

export const InteractiveStarRating: React.FC<InteractiveStarRatingProps> = ({
  currentRating = 0,
  onRatingChange,
  size = 'md',
  disabled = false,
  className = ''
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const handleStarClick = (rating: number) => {
    if (disabled) return;
    onRatingChange(rating);
  };

  const handleStarHover = (rating: number) => {
    if (disabled) return;
    setHoverRating(rating);
  };

  const handleMouseLeave = () => {
    if (disabled) return;
    setHoverRating(0);
  };

  const getStarClass = (starIndex: number) => {
    const rating = hoverRating || currentRating;
    const baseClass = `${sizeClasses[size]} cursor-pointer transition-colors`;

    if (disabled) {
      return `${baseClass} text-gray-300 cursor-not-allowed`;
    }

    if (starIndex <= rating) {
      return `${baseClass} text-yellow-400 fill-yellow-400`;
    }

    return `${baseClass} text-gray-300 hover:text-yellow-400`;
  };

  return (
    <div
      className={`flex items-center gap-1 ${className}`}
      onMouseLeave={handleMouseLeave}
      role="radiogroup"
      aria-label="Rate this recipe"
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={getStarClass(star)}
          onClick={() => handleStarClick(star)}
          onMouseEnter={() => handleStarHover(star)}
          disabled={disabled}
          aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
          aria-pressed={star <= currentRating}
        >
          <Star />
        </button>
      ))}
      {currentRating > 0 && !disabled && (
        <span className="ml-2 text-sm text-gray-600">
          {currentRating} star{currentRating !== 1 ? 's' : ''}
        </span>
      )}
    </div>
  );
};