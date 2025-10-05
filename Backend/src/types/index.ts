import { Request } from 'express';

export interface IUser {
  _id: string;
  // id: string;
  name: string;
  email: string;
  password: string;
  bio?: string | undefined;
  avatar?: string | undefined;
  favoriteGenres?: string[] | undefined;
  isActive: boolean;
  joinedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  toJSON(): Omit<IUser, 'password'>;
}

export interface IBook {
  _id: string;
  id: string;
  title: string;
  author: string;
  description: string;
  genre: string;
  publishedYear: number;
  isbn?: string;
  coverImage?: string;
  pageCount?: number;
  language?: string;
  publisher?: string;
  addedBy: string | IUser;
  tags?: string[];
  isActive: boolean;
  reviews?: IReview[];
  averageRating: number;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IReview {
  _id: string;
  id: string;
  bookId: string | IBook;
  userId: string | IUser;
  rating: number;
  reviewText: string;
  title?: string;
  likes: string[];
  likeCount: number;
  isActive: boolean;
  editedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthenticatedRequest extends Request {
  user?: IUser;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
  errors?: any[];
}

export interface BookFilters {
  search?: string;
  genre?: string;
  author?: string;
  minYear?: number;
  maxYear?: number;
  minRating?: number;
  sortBy?: 'title' | 'author' | 'publishedYear' | 'averageRating' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalBooks: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export const GENRES = [
  'Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Sci-Fi', 'Fantasy',
  'Thriller', 'Biography', 'History', 'Self-Help', 'Business',
  'Technology', 'Health', 'Travel', 'Cooking', 'Art', 'Religion',
  'Philosophy', 'Poetry', 'Drama', 'Horror', 'Adventure', 'Crime',
  'Young Adult', 'Children', 'Comics', 'Other'
] as const;

export type Genre = typeof GENRES[number];