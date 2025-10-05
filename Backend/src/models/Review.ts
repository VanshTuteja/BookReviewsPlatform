import mongoose, { Schema, Document } from 'mongoose';
import { IReview } from '../types';

interface ReviewDocument extends Document, Omit<IReview, '_id' | 'id' | 'likeCount'> {}

const reviewSchema = new Schema<ReviewDocument>({
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: [true, 'Book ID is required']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5'],
    validate: {
      validator: Number.isInteger,
      message: 'Rating must be a whole number'
    }
  },
  reviewText: {
    type: String,
    required: [true, 'Review text is required'],
    trim: true,
    minlength: [10, 'Review must be at least 10 characters long'],
    maxlength: [2000, 'Review cannot exceed 2000 characters']
  },
  title: {
    type: String,
    trim: true,
    maxlength: [100, 'Review title cannot exceed 100 characters']
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  editedAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for id
reviewSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

// Virtual for like count
reviewSchema.virtual('likeCount').get(function() {
  return this.likes ? this.likes.length : 0;
});

// Ensure one review per user per book
reviewSchema.index({ bookId: 1, userId: 1 }, { unique: true });

// Indexes for better performance
reviewSchema.index({ bookId: 1 });
reviewSchema.index({ userId: 1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ createdAt: -1 });

// Pre-save middleware to update editedAt
reviewSchema.pre('save', function(next) {
  if (this.isModified('reviewText') || this.isModified('rating')) {
    this.editedAt = new Date();
  }
  next();
});

export default mongoose.model<ReviewDocument>('Review', reviewSchema);