import { body, param, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { GENRES } from '../types';
import logger from '../utils/logger';

const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn('Validation failed', { 
      errors: errors.array(), 
      body: req.body,
      ip: req.ip 
    });
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
    return;
  }
  next();
};

export const validateSignup = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  handleValidationErrors
];

export const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

export const validateBook = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('author')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Author must be between 1 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  body('genre')
    .isIn(GENRES)
    .withMessage('Please select a valid genre'),
  body('publishedYear')
    .isInt({ min: 1000, max: new Date().getFullYear() })
    .withMessage('Please provide a valid published year'),
  handleValidationErrors
];

export const validateReview = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('reviewText')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Review text must be between 10 and 2000 characters'),
  body('title')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Review title cannot exceed 100 characters'),
  handleValidationErrors
];

export const validateObjectId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format'),
  handleValidationErrors
];