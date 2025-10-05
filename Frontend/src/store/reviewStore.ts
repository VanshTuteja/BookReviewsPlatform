import { create } from 'zustand';
import type { Review, ReviewFormData, RatingDistribution, ApiResponse } from '../types';
import { reviewAPI } from '../services/api';

interface ReviewState {
  reviews: Review[];
  currentReview: Review | null;
  userReviews: Review[];
  recentReviews: Review[];
  ratingDistribution: RatingDistribution;
  averageRating: number;
  totalReviews: number;
  isLoading: boolean;
  error: string | null;
}

interface ReviewStore extends ReviewState {
  fetchBookReviews: (bookId: string, page?: number) => Promise<void>;
  fetchUserReviews: (userId: string, page?: number) => Promise<void>;
  fetchRecentReviews: (limit?: number) => Promise<void>;
  createReview: (data: ReviewFormData, token: string) => Promise<Review>;
  updateReview: (id: string, data: Partial<ReviewFormData>, token: string) => Promise<Review>;
  deleteReview: (id: string, token: string) => Promise<void>;
  likeReview: (id: string, token: string) => Promise<void>;
  clearReviews: () => void;
  clearError: () => void;
}

const initialRatingDistribution: RatingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

const initialState: ReviewState = {
  reviews: [],
  currentReview: null,
  userReviews: [],
  recentReviews: [],
  ratingDistribution: initialRatingDistribution,
  averageRating: 0,
  totalReviews: 0,
  isLoading: false,
  error: null,
};

export const useReviewStore = create<ReviewStore>()((set, get) => ({
  ...initialState,

  // ✅ FETCH REVIEWS FOR SPECIFIC BOOK
  fetchBookReviews: async (bookId: string, page = 1) => {
    set({ isLoading: true, error: null });
    try {
      const response = await reviewAPI.getBookReviews(bookId, page);

      if (response.success) {
        set({
          reviews: response.data.reviews,
          ratingDistribution: response.data.statistics.ratingDistribution,
          averageRating: response.data.statistics.averageRating,
          totalReviews: response.data.statistics.totalReviews,
          isLoading: false,
        });
      }
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response.data.message || 'Failed to fetch reviews',
      });
    }
  },

  // ✅ FETCH REVIEWS BY CURRENT USER
  fetchUserReviews: async (userId: string, page = 1) => {
    set({ isLoading: true, error: null });
    try {
      const response = await reviewAPI.getUserReviews(userId, page);
      if (response.success) {
        set({ userReviews: response.data.reviews, isLoading: false });
      }
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to fetch user reviews',
      });
    }
  },

  // ✅ FETCH RECENT REVIEWS
  fetchRecentReviews: async (limit = 10) => {
    try {
      const response = await reviewAPI.getRecentReviews(limit);
      if (response.success) set({ recentReviews: response.data.reviews });
    } catch (error: any) {
      console.error('Failed to fetch recent reviews:', error);
    }
  },

  // ✅ CREATE NEW REVIEW
  createReview: async (data: ReviewFormData, token: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await reviewAPI.createReview(data, token);
      if (response.success) {
        const { reviews } = get();
        set({
          reviews: [response.data.review, ...reviews],
          totalReviews: get().totalReviews + 1,
          isLoading: false,
        });
        return response.data.review;
      }
      throw new Error('Failed to create review');
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to create review',
      });
      throw error;
    }
  },

  // ✅ EDIT (UPDATE) REVIEW
  updateReview: async (id: string, data: Partial<ReviewFormData>, token: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await reviewAPI.updateReview(id, data, token);
      if (response.success) {
        await get().fetchRecentReviews(5);
        const updatedReview = response.data.review;
        const { reviews } = get();
        const updatedReviews = reviews.map((r) =>
          r._id === id ? updatedReview : r
        );

        set({
          reviews: updatedReviews,
          userReviews: get().userReviews.map((r) =>
            r._id === id ? updatedReview : r
          ),
          isLoading: false,
        });
        return updatedReview;
      }
      throw new Error('Failed to update review');
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to update review',
      });
      throw error;
    }
  },

  // ✅ DELETE REVIEW
  deleteReview: async (id: string, token: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await reviewAPI.deleteReview(id, token);
      if (response.success) {
        await get().fetchRecentReviews(5);
        set({
          reviews: get().reviews.filter((r) => r._id !== id),
          userReviews: get().userReviews.filter((r) => r._id !== id),
          totalReviews: Math.max(0, get().totalReviews - 1),
          isLoading: false,
        });
      }
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to delete review',
      });
      throw error;
    }
  },

  // ✅ LIKE/UNLIKE REVIEW
  likeReview: async (id: string, token: string) => {
    try {
      const response = await reviewAPI.likeReview(id, token);
      if (response.success) {
        const { reviews } = get();
        const updatedReviews = reviews.map((r) =>
          r._id === id
            ? { ...r, likeCount: response.data.likes }
            : r
        );
        set({ reviews: updatedReviews });
      }
    } catch (error: any) {
      console.error('Failed to like review:', error);
      throw error;
    }
  },

  clearReviews: () =>
    set({
      reviews: [],
      userReviews: [],
      ratingDistribution: initialRatingDistribution,
      averageRating: 0,
      totalReviews: 0,
    }),

  clearError: () => set({ error: null }),
}));
