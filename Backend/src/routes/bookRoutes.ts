import express from 'express';
import Book from '../models/Book';
import Review from '../models/Review';
import { auth } from '../middleware/auth';
import { validateBook } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthenticatedRequest, BookFilters } from '../types';
import logger from '../utils/logger';

const router = express.Router();

// @route   GET /api/books
// @desc    Get all books with filtering, sorting, and pagination
// @access  Public
router.get('/', auth, asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
  const {
    page = 1,
    limit = 12,
    search,
    genre,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    minYear,
    maxYear,
    minRating,
    author
  } = req.query as any;

  logger.info('Books fetch request', { 
    page, limit, search, genre, sortBy, sortOrder, 
    userId: req.user?._id 
  });

  // Build query
  let query: any = { isActive: true };

  // Search functionality
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { author: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  // Filter by genre
  if (genre && genre !== 'all') {
    query.genre = genre;
  }

  // Filter by author
  if (author) {
    query.author = { $regex: author, $options: 'i' };
  }

  // Filter by year range
  if (minYear || maxYear) {
    query.publishedYear = {};
    if (minYear) query.publishedYear.$gte = parseInt(minYear);
    if (maxYear) query.publishedYear.$lte = parseInt(maxYear);
  }

  // Calculate skip value for pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Build sort object
  let sort: any = {};
  if (sortBy === 'averageRating') {
    sort = { createdAt: -1 };
  } else {
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
  }

  // Execute query with population
  const books = await Book.find(query)
    .populate('addedBy', 'name email')
    .populate({
      path: 'reviews',
      populate: {
        path: 'userId',
        select: 'name'
      }
    })
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));

  // Filter by rating if specified
  let filteredBooks = books;
  if (minRating) {
    filteredBooks = books.filter(book => book.averageRating >= parseFloat(minRating));
  }

  // Sort by average rating if requested
  if (sortBy === 'averageRating') {
    filteredBooks.sort((a, b) => {
      const order = sortOrder === 'desc' ? -1 : 1;
      return (b.averageRating - a.averageRating) * order;
    });
  }

  // Get total count for pagination
  const totalBooks = await Book.countDocuments(query);
  const totalPages = Math.ceil(totalBooks / parseInt(limit));

  // Get genres for filtering
  const allGenres = await Book.distinct('genre', { isActive: true });

  logger.info('Books fetched successfully', { 
    count: filteredBooks.length, 
    totalBooks, 
    page: parseInt(page) 
  });

  res.json({
    success: true,
    data: {
      books: filteredBooks,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalBooks,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      },
      filters: {
        genres: allGenres.sort(),
        currentFilters: {
          search,
          genre,
          sortBy,
          sortOrder,
          minYear,
          maxYear,
          minRating,
          author
        }
      }
    }
  });
}));

// @route   GET /api/books/:id
// @desc    Get single book
// @access  Public
router.get('/:id', auth, asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
  const book = await Book.findOne({ _id: req.params.id, isActive: true })
    .populate('addedBy', 'name email joinedAt')
    .populate({
      path: 'reviews',
      populate: {
        path: 'userId',
        select: 'name avatar'
      },
      options: { sort: { createdAt: -1 } }
    });

  if (!book) {
    logger.warn('Book not found', { bookId: req.params.id });
    return res.status(404).json({
      success: false,
      message: 'Book not found'
    });
  }

  // Calculate rating distribution
  const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  if (book.reviews) {
    book.reviews.forEach((review: any) => {
      ratingDistribution[review.rating as keyof typeof ratingDistribution]++;
    });
  }

  logger.info('Book fetched successfully', { 
    bookId: book._id, 
    title: book.title,
    userId: req.user?._id 
  });

  return res.json({
    success: true,
    data: {
      book,
      ratingDistribution,
      userReview: req.user ? book.reviews?.find((r: any) => r.userId._id.toString() === req.user!._id) : null
    }
  });
}));

// @route   POST /api/books
// @desc    Create new book
// @access  Private
router.post('/', auth, validateBook, asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
  const bookData = {
    ...req.body,
    addedBy: req.user!._id
  };

  const book = new Book(bookData);
  await book.save();
  await book.populate('addedBy', 'name email');

  logger.info('Book created successfully', { 
    bookId: book._id, 
    title: book.title,
    userId: req.user!._id 
  });

  res.status(201).json({
    success: true,
    message: 'Book created successfully',
    data: {
      book
    }
  });
}));

// @route   PUT /api/books/:id
// @desc    Update book
// @access  Private (only book creator)
router.put('/:id', auth, validateBook, asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
  let book = await Book.findOne({ _id: req.params.id, isActive: true });

  if (!book) {
    logger.warn('Book not found for update', { bookId: req.params.id, userId: req.user!._id });
    return res.status(404).json({
      success: false,
      message: 'Book not found'
    });
  }

  // Check if user is the book creator
  if (book.addedBy.toString() !== req.user!._id.toString()) {
    logger.warn('Unauthorized book update attempt', { 
      bookId: req.params.id, 
      userId: req.user!._id,
      bookOwnerId: book.addedBy 
    });
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this book'
    });
  }

  book = await Book.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate('addedBy', 'name email');

  logger.info('Book updated successfully', { 
    bookId: book!._id, 
    title: book!.title,
    userId: req.user!._id 
  });

  return res.json({
    success: true,
    message: 'Book updated successfully',
    data: {
      book
    }
  });
}));

// @route   DELETE /api/books/:id
// @desc    Delete book
// @access  Private (only book creator)
router.delete('/:id', auth, asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
  const book = await Book.findOne({ _id: req.params.id, isActive: true });

  if (!book) {
    logger.warn('Book not found for deletion', { bookId: req.params.id, userId: req.user!._id });
    return res.status(404).json({
      success: false,
      message: 'Book not found'
    });
  }

  // Check if user is the book creator
  if (book.addedBy.toString() !== req.user!._id.toString()) {
    logger.warn('Unauthorized book deletion attempt', { 
      bookId: req.params.id, 
      userId: req.user!._id,
      bookOwnerId: book.addedBy 
    });
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this book'
    });
  }

  // Soft delete - mark as inactive
  book.isActive = false;
  await book.save();

  // Also soft delete all reviews for this book
  await Review.updateMany(
    { bookId: req.params.id },
    { isActive: false }
  );

  logger.info('Book deleted successfully', { 
    bookId: book._id, 
    title: book.title,
    userId: req.user!._id 
  });

  return res.json({
    success: true,
    message: 'Book deleted successfully'
  });
}));

// @route   GET /api/books/:id/similar
// @desc    Get similar books
// @access  Public
router.get('/:id/similar', asyncHandler(async (req: express.Request, res: express.Response) => {
  const book = await Book.findById(req.params.id);
  
  if (!book) {
    return res.status(404).json({
      success: false,
      message: 'Book not found'
    });
  }

  const similarBooks = await Book.find({
    _id: { $ne: req.params.id },
    isActive: true,
    $or: [
      { genre: book.genre },
      { author: book.author },
      { tags: { $in: book.tags } }
    ]
  })
  .populate('addedBy', 'name')
  .populate('reviews')
  .limit(6)
  .sort({ createdAt: -1 });

  logger.info('Similar books fetched', { 
    bookId: req.params.id, 
    similarCount: similarBooks.length 
  });

  return res.json({
    success: true,
    data: {
      books: similarBooks
    }
  });
}));

export default router;