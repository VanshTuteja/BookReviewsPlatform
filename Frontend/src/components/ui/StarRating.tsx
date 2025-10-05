import React from 'react';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  className?: string;
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxRating = 5,
  size = 'md',
  interactive = false,
  onRatingChange,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const handleStarClick = (starRating: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(starRating);
    }
  };

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      {Array.from({ length: maxRating }, (_, index) => {
        const starRating = index + 1;
        const isFilled = starRating <= Math.floor(rating);
        const isHalfFilled = starRating === Math.ceil(rating) && rating % 1 !== 0;

        return (
          <button
            key={index}
            type="button"
            disabled={!interactive}
            onClick={() => handleStarClick(starRating)}
            className={`${
              interactive 
                ? 'cursor-pointer hover:scale-110 transition-transform' 
                : 'cursor-default'
            }`}
            aria-label={`Rate ${starRating} star${starRating === 1 ? '' : 's'}`}
          >
            {isFilled ? (
              <StarIcon className={`${sizeClasses[size]} text-yellow-400`} />
            ) : isHalfFilled ? (
              <div className={`relative ${sizeClasses[size]}`}>
                <StarOutlineIcon className={`absolute inset-0 ${sizeClasses[size]} text-gray-300`} />
                <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
                  <StarIcon className={`${sizeClasses[size]} text-yellow-400`} />
                </div>
              </div>
            ) : (
              <StarOutlineIcon 
                className={`${sizeClasses[size]} ${
                  interactive 
                    ? 'text-gray-300 hover:text-yellow-400' 
                    : 'text-gray-300'
                }`} 
              />
            )}
          </button>
        );
      })}
      {!interactive && (
        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
          ({rating.toFixed(1)})
        </span>
      )}
    </div>
  );
};

export default StarRating;