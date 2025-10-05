export interface User {
  _id: string;
  id: string;
  name: string;
  email: string;
  bio?: string;
  avatar?: string;
  favoriteGenres?: string[];
  joinedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface Book {
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
  tags?: string[];
  addedBy: User | string;
  reviews?: Review[];
  averageRating: number;
  reviewCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  _id: string;
  id: string;
  bookId: Book | string;
  userId: User | string;
  rating: number;
  reviewText: string;
  title?: string;
  likes?: string[];
  likeCount: number;
  isActive: boolean;
  editedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface BookFilters {
  search: string;
  genre: string;
  author: string;
  minYear?: number;
  maxYear?: number;
  minRating?: number;
  sortBy: 'title' | 'author' | 'publishedYear' | 'averageRating' | 'createdAt';
  sortOrder: 'asc' | 'desc';
}

export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalBooks: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
  errors?: any[];
}

export interface BookFormData {
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
  tags?: string[];
}

export interface ReviewFormData {
  bookId: string;
  rating: number;
  reviewText: string;
  title?: string;
}

export interface UserStats {
  booksAdded: number;
  reviewsWritten: number;
  averageRatingGiven: number;
  averageRatingReceived: number;
  readingActivity: Array<{
    _id: { year: number; month: number };
    count: number;
  }>;
  favoriteGenres: Array<{
    _id: string;
    avgRating: number;
    count: number;
  }>;
}

export interface RatingDistribution {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
}

export const GENRES = [
  'Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Sci-Fi', 'Fantasy',
  'Thriller', 'Biography', 'History', 'Self-Help', 'Business',
  'Technology', 'Health', 'Travel', 'Cooking', 'Art', 'Religion',
  'Philosophy', 'Poetry', 'Drama', 'Horror', 'Adventure', 'Crime',
  'Young Adult', 'Children', 'Comics', 'Other'
] as const;

export type Genre = typeof GENRES[number];