import React, { useState } from 'react';
import type { Review } from '../../types';
import StarRating from '../ui/StarRating';
import Button from '../ui/Button';
import { useAuthStore } from '../../store/authStore';
import { useReviewStore } from '../../store/reviewStore';
import { 
  HeartIcon,
  PencilIcon,
  TrashIcon,
  UserIcon 
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import ReviewForm from './ReviewForm';
import Modal from '../ui/Modal';
import toast from 'react-hot-toast';

interface ReviewCardProps {
  review: Review;
  showBookInfo?: boolean;
  className?: string;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ 
  review, 
  showBookInfo = false,
  className = '' 
}) => {
  const { user, token } = useAuthStore();
  const { updateReview, deleteReview, likeReview } = useReviewStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);
  const [localLikeCount, setLocalLikeCount] = useState(review.likeCount);

  const isOwner = user && typeof review.userId === 'object' && review.userId._id === user.id;
  const reviewUser = typeof review.userId === 'object' ? review.userId : null;
  const book = typeof review.bookId === 'object' ? review.bookId : null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleLike = async () => {
    if (!user || !token) {
      toast.error('Please log in to like reviews');
      return;
    }

    if (isLiking) return;

    setIsLiking(true);
    const previousLiked = hasLiked;
    const previousCount = localLikeCount;
    
    // Optimistic update
    setHasLiked(!hasLiked);
    setLocalLikeCount(hasLiked ? localLikeCount - 1 : localLikeCount + 1);

    try {
      await likeReview(review._id, token);
    } catch (error) {
      // Revert optimistic update on error
      setHasLiked(previousLiked);
      setLocalLikeCount(previousCount);
      toast.error('Failed to like review');
    } finally {
      setIsLiking(false);
    }
  };

  const handleEdit = async (data: any) => {
    if (!token) return;

    try {
      await updateReview(review._id, data, token);
      setIsEditing(false);
      toast.success('Review updated successfully');
    } catch (error) {
      toast.error('Failed to update review');
    }
  };

  const handleDelete = async () => {
    if (!token) return;

    setIsDeleting(true);
    try {
      await deleteReview(review._id, token);
      toast.success('Review deleted successfully');
    } catch (error) {
      toast.error('Failed to delete review');
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-3 flex-1">
            {/* User avatar */}
            <div className="flex-shrink-0">
              {reviewUser?.avatar ? (
                <img
                  src={reviewUser.avatar}
                  alt={reviewUser.name}
                  className="h-10 w-10 rounded-full object-cover ring-2 ring-gray-100 dark:ring-gray-700"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center ring-2 ring-gray-100 dark:ring-gray-700">
                  <UserIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                </div>
              )}
            </div>

            {/* User info and rating */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1 flex-wrap">
                <h4 className="text-base font-semibold text-gray-900 dark:text-white truncate">
                  {reviewUser?.name || 'Unknown User'}
                </h4>
                <div className="flex items-center">
                  <StarRating rating={review.rating} size="sm" />
                  
                </div>
              </div>
              
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 space-x-2">
                <span>{formatDate(review.createdAt)}</span>
                {review.editedAt && (
                  <>
                    <span>•</span>
                    <span className="italic">Edited {formatDate(review.editedAt)}</span>
                  </>
                )}
              </div>

              {/* Book info if requested */}
              {showBookInfo && book && (
                <div className="mt-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm text-blue-700 dark:text-blue-300 inline-block">
                  Review for: <span className="font-semibold">{book.title}</span> by {book.author}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          {isOwner && (
            <div className="flex items-center space-x-1 ml-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                title="Edit review"
              >
                <PencilIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                loading={isDeleting}
                className="p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                title="Delete review"
              >
                <TrashIcon className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Review content */}
        <div className="mb-4">
          {review.title && (
            <h5 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
              {review.title}
            </h5>
          )}
          <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
            {review.reviewText}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleLike}
            disabled={!user || isLiking}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              !user 
                ? 'cursor-not-allowed opacity-50 text-gray-400' 
                : hasLiked
                ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30'
                : 'text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
            }`}
            title={!user ? 'Log in to like reviews' : hasLiked ? 'Unlike' : 'Like this review'}
          >
            {hasLiked ? (
              <HeartSolidIcon className={`h-5 w-5 ${isLiking ? 'animate-pulse' : ''}`} />
            ) : (
              <HeartIcon className={`h-5 w-5 ${isLiking ? 'animate-pulse' : ''}`} />
            )}
            <span className="text-sm">{localLikeCount}</span>
          </button>

          <div className="flex items-center space-x-2">
            <StarRating rating={review.rating} size="sm" />
           
          </div>
        </div>
      </div>

      {/* Edit modal */}
      <Modal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        title="Edit Review"
        size="lg"
      >
        <div className="p-6">
          <ReviewForm
            bookId={typeof review.bookId === 'object' ? review.bookId._id : review.bookId}
            initialData={{
              rating: review.rating,
              reviewText: review.reviewText,
              title: review.title,
            }}
            onSubmit={handleEdit}
            submitButtonText="Update Review"
          />
        </div>
      </Modal>
    </>
  );
};

export default ReviewCard;