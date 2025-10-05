import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { auth } from '../middleware/auth';
import { validateSignup, validateLogin } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../types';
import logger from '../utils/logger';

const router = express.Router();

// Generate JWT token
const generateToken = (id: string): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: '30d'
  });
};

// @route   POST /api/auth/signup
// @desc    Register user
// @access  Public
router.post(
  '/signup',
  validateSignup,
  asyncHandler(async (req: express.Request, res: express.Response) => {
    const { name, email, password } = req.body;

    logger.info('User signup attempt', { email, name });

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      logger.warn('Signup failed - User already exists', { email });
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      });
    }

    const user = new User({ name, email, password });
    await user.save();

    logger.info('User created successfully', { userId: user._id, email: user.email });

    const token = generateToken(user._id.toString());

      // Set HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      // secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Return here to satisfy TS
    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          _id: user._id,
          id: user._id,
          name: user.name,
          email: user.email,
          joinedAt: user.joinedAt,
        },
        token,
      },
    });
  })
);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post(
  '/login',
  validateLogin,
  asyncHandler(async (req: express.Request, res: express.Response) => {
    const { email, password } = req.body;

    logger.info('User login attempt', { email });

    const user = await User.findOne({ email, isActive: true }).select('+password');
    if (!user) {
      logger.warn('Login failed - Invalid credentials', { email });
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      logger.warn('Login failed - Invalid password', { email });
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    logger.info('User logged in successfully', { userId: user._id, email: user.email });

    const token = generateToken(user._id.toString());

      // Set HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      // secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Add return here
    return res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          _id: user._id,
          id: user._id,
          name: user.name,
          email: user.email,
          bio: user.bio,
          avatar: user.avatar,
          favoriteGenres: user.favoriteGenres,
          joinedAt: user.joinedAt,
        },
        token,
      },
    });
  })
);


// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
  const user = await User.findById(req.user!._id)
    .populate({
      path: 'books',
      select: 'title author genre publishedYear averageRating reviewCount'
    })
    .populate({
      path: 'reviews',
      select: 'rating reviewText title createdAt',
      populate: {
        path: 'bookId',
        select: 'title author'
      }
    });

  logger.info('User profile accessed', { userId: req.user!._id });

  res.json({
    success: true,
    data: {
      user
    }
  });
}));

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
  const { name, bio, favoriteGenres, avatar } = req.body;

  const user = await User.findById(req.user!._id);

  if (name) user!.name = name;
  if (bio !== undefined) user!.bio = bio;
  if (favoriteGenres) user!.favoriteGenres = favoriteGenres;
  if (avatar !== undefined) user!.avatar = avatar;

  await user!.save();

  logger.info('User profile updated', { userId: req.user!._id, changes: { name, bio, favoriteGenres, avatar } });

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user
    }
  });
}));

// @route   POST /api/auth/refresh
// @desc    Refresh token
// @access  Private
router.post('/refresh', auth, asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
  const token = generateToken(req.user!._id);

  logger.info('Token refreshed', { userId: req.user!._id });

  res.json({
    success: true,
    data: {
      token
    }
  });
}));

export default router;