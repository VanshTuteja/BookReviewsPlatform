import React from 'react';
import type { RatingDistribution } from '../../types';
import { StarIcon } from '@heroicons/react/24/solid';

interface RatingChartProps {
  ratingDistribution: RatingDistribution;
  averageRating: number;
  totalReviews: number;
  className?: string;
}

const RatingChart: React.FC<RatingChartProps> = ({
  ratingDistribution,
  averageRating,
  totalReviews,
  className = '',
}) => {
  const maxCount = Math.max(...Object.values(ratingDistribution));
  
  const getBarWidth = (count: number) => {
    if (maxCount === 0) return 0;
    return (count / maxCount) * 100;
  };

  const getPercentage = (count: number) => {
    if (totalReviews === 0) return 0;
    return Math.round((count / totalReviews) * 100);
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Ratings Overview
        </h3>
        <div className="text-right">
          <div className="flex items-center space-x-1">
            <StarIcon className="h-5 w-5 text-yellow-400" />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {averageRating.toFixed(1)}
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {totalReviews} review{totalReviews !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {[5, 4, 3, 2, 1].map((stars) => (
          <div key={stars} className="flex items-center space-x-3">
            {/* Stars */}
            <div className="flex items-center space-x-1 w-12">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {stars}
              </span>
              <StarIcon className="h-3 w-3 text-yellow-400" />
            </div>

            {/* Progress bar */}
            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 min-w-0">
              <div
                className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${getBarWidth(ratingDistribution[stars as keyof RatingDistribution])}%` }}
              />
            </div>

            {/* Count and percentage */}
            <div className="flex items-center space-x-2 w-16 text-right">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {ratingDistribution[stars as keyof RatingDistribution]}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                ({getPercentage(ratingDistribution[stars as keyof RatingDistribution])}%)
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Additional stats */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {Math.round((ratingDistribution[4] + ratingDistribution[5]) / totalReviews * 100) || 0}%
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              4+ Stars
            </p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {Math.round(ratingDistribution[5] / totalReviews * 100) || 0}%
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              5 Stars
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RatingChart;