import express from 'express';
import Review from '../models/Review';
import Book from '../models/Book';
import { auth } from '../middleware/auth';
import { validateReview } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../types';
import logger from '../utils/logger';
import mongoose from 'mongoose';

const router = express.Router();

// @route   POST /api/reviews
// @desc    Create new review
// @access  Private
router.post('/', auth, validateReview, asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
  const { bookId, rating, reviewText, title } = req.body;

  logger.info('Review creation attempt', { 
    bookId, 
    rating, 
    userId: req.user!._id 
  });

  // Check if book exists
  const book = await Book.findOne({ _id: bookId, isActive: true });
  if (!book) {
    logger.warn('Review creation failed - Book not found', { bookId });
    return res.status(404).json({
      success: false,
      message: 'Book not found'
    });
  }

  // Check if user already reviewed this book
  const existingReview = await Review.findOne({ 
    bookId, 
    userId: req.user!._id,
    isActive: true
  });

  if (existingReview) {
    logger.warn('Review creation failed - User already reviewed', { 
      bookId, 
      userId: req.user!._id 
    });
    return res.status(400).json({
      success: false,
      message: 'You have already reviewed this book'
    });
  }

  // Create review
  const review = new Review({
    bookId,
    userId: req.user!._id,
    rating,
    reviewText,
    title
  });

  await review.save();
  await review.populate('userId', 'name avatar');
  await review.populate('bookId', 'title author');

  logger.info('Review created successfully', { 
    reviewId: review._id, 
    bookId, 
    userId: req.user!._id 
  });

  return res.status(201).json({
    success: true,
    message: 'Review created successfully',
    data: {
      review
    }
  });
}));

// @route   GET /api/reviews/book/:bookId
// @desc    Get all reviews for a book
// @access  Public
router.get('/book/:bookId', asyncHandler(async (req: express.Request, res: express.Response) => {
  const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query as any;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  let sort: any = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const reviews = await Review.find({ 
    bookId: req.params.bookId,
    isActive: true
  })
  .populate('userId', 'name avatar')
  .sort(sort)
  .skip(skip)
  .limit(parseInt(limit));

  const totalReviews = await Review.countDocuments({ 
    bookId: req.params.bookId,
    isActive: true
  });

  const totalPages = Math.ceil(totalReviews / parseInt(limit));

  // Calculate rating statistics
const bookObjectId = new mongoose.Types.ObjectId(req.params.bookId);

const ratingStats = await Review.aggregate([
  { $match: { bookId: bookObjectId, isActive: true } },
  {
    $group: {
      _id: null,
      averageRating: { $avg: '$rating' },
      totalReviews: { $sum: 1 },
      ratingDistribution: { $push: '$rating' }
    }
  }
]);

  let ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  if (ratingStats.length > 0) {
    ratingStats[0].ratingDistribution.forEach((rating: number) => {
      ratingDistribution[rating as keyof typeof ratingDistribution]++;
    });
  }

  logger.info('Book reviews fetched', { 
    bookId: req.params.bookId, 
    reviewCount: reviews.length 
  });

  res.json({
    success: true,
    data: {
      reviews,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalReviews,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      },
      statistics: {
        averageRating: ratingStats.length > 0 ? Math.round(ratingStats[0].averageRating * 10) / 10 : 0,
        totalReviews,
        ratingDistribution
      }
    }
  });
}));

// @route   GET /api/reviews/user/:userId
// @desc    Get all reviews by a user
// @access  Public
router.get('/user/:userId', asyncHandler(async (req: express.Request, res: express.Response) => {
  const { page = 1, limit = 10 } = req.query as any;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const reviews = await Review.find({ 
    userId: req.params.userId,
    isActive: true
  })
  .populate('bookId', 'title author genre coverImage')
  .populate('userId', 'name avatar')
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(parseInt(limit));

  const totalReviews = await Review.countDocuments({ 
    userId: req.params.userId,
    isActive: true
  });

  const totalPages = Math.ceil(totalReviews / parseInt(limit));

  logger.info('User reviews fetched', { 
    userId: req.params.userId, 
    reviewCount: reviews.length 
  });

  res.json({
    success: true,
    data: {
      reviews,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalReviews,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      }
    }
  });
}));

// @route   PUT /api/reviews/:id
// @desc    Update review
// @access  Private (only review author)
router.put('/:id', auth, validateReview, asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
  let review = await Review.findOne({ _id: req.params.id, isActive: true });

  if (!review) {
    logger.warn('Review not found for update', { reviewId: req.params.id });
    return res.status(404).json({
      success: false,
      message: 'Review not found'
    });
  }

  // Check if user is the review author
  if (review.userId.toString() !== req.user!._id.toString()) {
    logger.warn('Unauthorized review update attempt', { 
      reviewId: req.params.id, 
      userId: req.user!._id 
    });
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this review'
    });
  }

  const { rating, reviewText, title } = req.body;

  review.rating = rating;
  review.reviewText = reviewText;
  if (title !== undefined) review.title = title;

  await review.save();
  await review.populate('userId', 'name avatar');
  await review.populate('bookId', 'title author');

  logger.info('Review updated successfully', { 
    reviewId: review._id, 
    userId: req.user!._id 
  });

  return res.json({
    success: true,
    message: 'Review updated successfully',
    data: {
      review
    }
  });
}));

// @route   DELETE /api/reviews/:id
// @desc    Delete review
// @access  Private (only review author)
router.delete('/:id', auth, asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
  const review = await Review.findOne({ _id: req.params.id, isActive: true });

  if (!review) {
    logger.warn('Review not found for deletion', { reviewId: req.params.id });
    return res.status(404).json({
      success: false,
      message: 'Review not found'
    });
  }

  // Check if user is the review author
  if (review.userId.toString() !== req.user!._id.toString()) {
    logger.warn('Unauthorized review deletion attempt', { 
      reviewId: req.params.id, 
      userId: req.user!._id 
    });
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this review'
    });
  }

  // Soft delete
  review.isActive = false;
  await review.save();

  logger.info('Review deleted successfully', { 
    reviewId: review._id, 
    userId: req.user!._id 
  });

  return res.json({
    success: true,
    message: 'Review deleted successfully'
  });
}));

// @route   POST /api/reviews/:id/like
// @desc    Like/Unlike a review
// @access  Private
router.post('/:id/like', auth, asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
  const review = await Review.findOne({ _id: req.params.id, isActive: true });

  if (!review) {
    return res.status(404).json({
      success: false,
      message: 'Review not found'
    });
  }

  const userId = req.user!._id;
  const likeIndex = review.likes.indexOf(userId);

  if (likeIndex > -1) {
    // Unlike
    review.likes.splice(likeIndex, 1);
    logger.info('Review unliked', { reviewId: review._id, userId });
  } else {
    // Like
    review.likes.push(userId);
    logger.info('Review liked', { reviewId: review._id, userId });
  }

  await review.save();

  return res.json({
    success: true,
    message: likeIndex > -1 ? 'Review unliked' : 'Review liked',
    data: {
      likes: review.likes.length,
      isLiked: likeIndex === -1
    }
  });
}));

// @route   GET /api/reviews/recent
// @desc    Get recent reviews
// @access  Public
router.get('/recent', asyncHandler(async (req: express.Request, res: express.Response) => {
  const { limit = 10 } = req.query as any;

  const reviews = await Review.find({ isActive: true })
    .populate('userId', 'name avatar')
    .populate('bookId', 'title author coverImage')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit));

  logger.info('Recent reviews fetched', { count: reviews.length });

  res.json({
    success: true,
    data: {
      reviews
    }
  });
}));

export default router;