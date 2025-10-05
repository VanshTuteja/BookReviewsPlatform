import express from 'express';
import User from '../models/User';
import Book from '../models/Book';
import Review from '../models/Review';
import { auth } from '../middleware/auth';
import { validateObjectId } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../types';
import logger from '../utils/logger';

const router = express.Router();

// @route   GET /api/users/stats
// @desc    Get user statistics
// @access  Private
router.get('/stats', auth, asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
  const userId = req.user!._id;

  logger.info('User stats requested', { userId });

  // Get user's books count
  const booksCount = await Book.countDocuments({ 
    addedBy: userId, 
    isActive: true 
  });

  // Get user's reviews count
  const reviewsCount = await Review.countDocuments({ 
    userId, 
    isActive: true 
  });

  // Get user's average rating given
  const averageRatingGiven = await Review.aggregate([
    { $match: { userId, isActive: true } },
    { $group: { _id: null, avgRating: { $avg: '$rating' } } }
  ]);

  // Get user's books average rating received
  const averageRatingReceived = await Review.aggregate([
    {
      $lookup: {
        from: 'books',
        localField: 'bookId',
        foreignField: '_id',
        as: 'book'
      }
    },
    { $unwind: '$book' },
    { $match: { 'book.addedBy': userId, isActive: true } },
    { $group: { _id: null, avgRating: { $avg: '$rating' } } }
  ]);

  // Get reading activity by month
  const readingActivity = await Review.aggregate([
    { $match: { userId, isActive: true } },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);

  // Get favorite genres based on user's ratings
  const favoriteGenres = await Review.aggregate([
    {
      $lookup: {
        from: 'books',
        localField: 'bookId',
        foreignField: '_id',
        as: 'book'
      }
    },
    { $unwind: '$book' },
    { $match: { userId, isActive: true } },
    {
      $group: {
        _id: '$book.genre',
        avgRating: { $avg: '$rating' },
        count: { $sum: 1 }
      }
    },
    { $sort: { avgRating: -1, count: -1 } },
    { $limit: 5 }
  ]);

  const stats = {
    booksAdded: booksCount,
    reviewsWritten: reviewsCount,
    averageRatingGiven: averageRatingGiven[0]?.avgRating 
      ? Math.round(averageRatingGiven[0].avgRating * 10) / 10 
      : 0,
    averageRatingReceived: averageRatingReceived[0]?.avgRating 
      ? Math.round(averageRatingReceived[0].avgRating * 10) / 10 
      : 0,
    readingActivity,
    favoriteGenres
  };

  logger.info('User stats generated', { userId, stats });

  res.json({
    success: true,
    data: {
      stats
    }
  });
}));

// @route   GET /api/users/:id/profile
// @desc    Get user public profile
// @access  Public
router.get('/:id/profile', validateObjectId, asyncHandler(async (req: express.Request, res: express.Response) => {
  const user = await User.findOne({ _id: req.params.id, isActive: true })
    .select('-email -password')
    .populate({
      path: 'books',
      match: { isActive: true },
      select: 'title author genre publishedYear coverImage createdAt',
      options: { sort: { createdAt: -1 }, limit: 6 }
    })
    .populate({
      path: 'reviews',
      match: { isActive: true },
      select: 'rating reviewText title createdAt',
      populate: {
        path: 'bookId',
        select: 'title author'
      },
      options: { sort: { createdAt: -1 }, limit: 6 }
    });

  if (!user) {
    logger.warn('User profile not found', { userId: req.params.id });
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Get additional stats
  const booksCount = await Book.countDocuments({ 
    addedBy: req.params.id, 
    isActive: true 
  });

  const reviewsCount = await Review.countDocuments({ 
    userId: req.params.id, 
    isActive: true 
  });

  logger.info('User profile fetched', { userId: req.params.id });

  return res.json({
    success: true,
    data: {
      user,
      stats: {
        booksCount,
        reviewsCount
      }
    }
  });
}));

// @route   GET /api/users/leaderboard
// @desc    Get user leaderboard
// @access  Public
router.get('/leaderboard', asyncHandler(async (req: express.Request, res: express.Response) => {
  const { type = 'books', limit = 10 } = req.query as any;

  let leaderboard: any[] = [];

  if (type === 'books') {
    // Most books added
    leaderboard = await Book.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$addedBy',
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      { $match: { 'user.isActive': true } },
      {
        $project: {
          user: {
            _id: '$user._id',
            name: '$user.name',
            avatar: '$user.avatar'
          },
          count: 1
        }
      },
      { $sort: { count: -1 } },
      { $limit: parseInt(limit) }
    ]);
  } else if (type === 'reviews') {
    // Most reviews written
    leaderboard = await Review.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$userId',
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      { $match: { 'user.isActive': true } },
      {
        $project: {
          user: {
            _id: '$user._id',
            name: '$user.name',
            avatar: '$user.avatar'
          },
          count: 1
        }
      },
      { $sort: { count: -1 } },
      { $limit: parseInt(limit) }
    ]);
  }

  logger.info('Leaderboard fetched', { type, count: leaderboard.length });

  res.json({
    success: true,
    data: {
      leaderboard,
      type
    }
  });
}));

// @route   GET /api/users/search
// @desc    Search users
// @access  Public
router.get('/search', asyncHandler(async (req: express.Request, res: express.Response) => {
  const { q, limit = 10 } = req.query as any;

  if (!q || q.trim().length < 2) {
    return res.status(400).json({
      success: false,
      message: 'Search query must be at least 2 characters long'
    });
  }

  const users = await User.find({
    $and: [
      { isActive: true },
      {
        $or: [
          { name: { $regex: q, $options: 'i' } },
          { bio: { $regex: q, $options: 'i' } }
        ]
      }
    ]
  })
  .select('name avatar bio joinedAt')
  .limit(parseInt(limit))
  .sort({ name: 1 });

  logger.info('User search performed', { query: q, results: users.length });

  return res.json({
    success: true,
    data: {
      users
    }
  });
}));

export default router;