import mongoose, { Schema, Document } from 'mongoose';
import { IBook, GENRES } from '../types';

// interface BookDocument extends Document, Omit<IBook, '_id' | 'id' | 'averageRating' | 'reviewCount'> {}
type BookDocument = IBook & Document;

const bookSchema = new Schema<BookDocument>({
  title: {
    type: String,
    required: [true, 'Book title is required'],
    trim: true,
    minlength: [1, 'Title must be at least 1 character long'],
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  author: {
    type: String,
    required: [true, 'Author is required'],
    trim: true,
    minlength: [1, 'Author must be at least 1 character long'],
    maxlength: [100, 'Author cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters long'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  genre: {
    type: String,
    required: [true, 'Genre is required'],
    trim: true,
    enum: {
      values: GENRES,
      message: 'Genre must be a valid category'
    }
  },
  publishedYear: {
    type: Number,
    required: [true, 'Published year is required'],
    min: [1000, 'Published year must be a valid year'],
    max: [new Date().getFullYear(), 'Published year cannot be in the future']
  },
  isbn: {
    type: String,
    trim: true,
    match: [/^(?:ISBN(?:-1[03])?:? )?(?=[0-9X]{10}$|(?=(?:[0-9]+[- ]){3})[- 0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[- ]){4})[- 0-9]{17}$)(?:97[89][- ]?)?[0-9]{1,5}[- ]?[0-9]+[- ]?[0-9]+[- ]?[0-9X]$/, 'Please enter a valid ISBN']
  },
  coverImage: {
    type: String,
    default: ''
  },
  pageCount: {
    type: Number,
    min: [1, 'Page count must be at least 1']
  },
  language: {
    type: String,
    default: 'English',
    trim: true
  },
  publisher: {
    type: String,
    trim: true,
    maxlength: [100, 'Publisher name cannot exceed 100 characters']
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for reviews
bookSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'bookId'
});

// Virtual for id
bookSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

// Virtual for average rating
bookSchema.virtual('averageRating').get(function() {
  if (!this.reviews || this.reviews.length === 0) return 0;
  const sum = this.reviews.reduce((acc: number, review: any) => acc + review.rating, 0);
  return Math.round((sum / this.reviews.length) * 10) / 10;
});

// Virtual for total reviews count
bookSchema.virtual('reviewCount').get(function() {
  return this.reviews ? this.reviews.length : 0;
});

// Indexes for better performance
bookSchema.index({ title: 'text', author: 'text', description: 'text' });
bookSchema.index({ genre: 1 });
bookSchema.index({ publishedYear: 1 });
bookSchema.index({ addedBy: 1 });
bookSchema.index({ createdAt: -1 });

export default mongoose.model<BookDocument>('Book', bookSchema);