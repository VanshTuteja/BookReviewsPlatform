import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import type { ReviewFormData } from '../../types';
import Button from '../ui/Button';
import StarRating from '../ui/StarRating';

const schema = yup.object().shape({
  rating: yup.number().required('Rating is required').min(1).max(5),
  reviewText: yup
    .string()
    .required('Review text is required')
    .min(10, 'Review must be at least 10 characters')
    .max(2000, 'Review cannot exceed 2000 characters'),
  title: yup.string().max(100, 'Title cannot exceed 100 characters').optional(),
});

interface ReviewFormProps {
  bookId: string;
  initialData?: Partial<ReviewFormData>;
  onSubmit: (data: Omit<ReviewFormData, 'bookId'>) => Promise<void>;
  isLoading?: boolean;
  submitButtonText?: string;
}

const ReviewForm: React.FC<ReviewFormProps> = ({
  bookId,
  initialData,
  onSubmit,
  isLoading = false,
  submitButtonText = 'Submit Review',
}) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Omit<ReviewFormData, 'bookId'>>({
    resolver: yupResolver(schema),
    defaultValues: {
      rating: 5,
      reviewText: '',
      title: '',
      ...initialData,
    },
  });

  const rating = watch('rating');

  const handleRatingChange = (newRating: number) => {
    setValue('rating', newRating, { shouldValidate: true });
  };

  const handleFormSubmit = async (data: Omit<ReviewFormData, 'bookId'>) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Review submission error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Rating */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Rating *
        </label>
        <div className="flex items-center space-x-4">
          <StarRating
            rating={rating}
            interactive
            onRatingChange={handleRatingChange}
            size="lg"
          />
          <span className="text-lg font-medium text-gray-900 dark:text-white">
            {rating}/5
          </span>
        </div>
        {errors.rating && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.rating.message}
          </p>
        )}
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Review Title (Optional)
        </label>
        <input
          type="text"
          {...register('title')}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Give your review a title"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.title.message}
          </p>
        )}
      </div>

      {/* Review text */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Your Review *
        </label>
        <textarea
          {...register('reviewText')}
          rows={6}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Share your thoughts about this book..."
        />
        <div className="mt-1 flex justify-between items-center">
          {errors.reviewText && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {errors.reviewText.message}
            </p>
          )}
          <p className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
            {watch('reviewText')?.length || 0}/2000 characters
          </p>
        </div>
      </div>

      {/* Submit button */}
      <div className="flex justify-end">
        <Button
          type="submit"
          loading={isLoading}
          size="lg"
          className="min-w-[150px]"
        >
          {submitButtonText}
        </Button>
      </div>
    </form>
  );
};

export default ReviewForm;