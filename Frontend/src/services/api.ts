import axios from 'axios';
import type {
    ApiResponse,
    User,
    Book,
    Review,
    BookFormData,
    ReviewFormData,
    BookFilters,
    UserStats
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth-storage');
    if (token) {
      try {
        const parsedToken = JSON.parse(token);
        if (parsedToken?.state?.token) {
          config.headers.Authorization = `Bearer ${parsedToken.state.token}`;
        }
      } catch (error) {
        console.error('Error parsing token:', error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth data and redirect to login
      localStorage.removeItem('auth-storage');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  signup: (name: string, email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> =>
    api.post('/auth/signup', { name, email, password }).then(res => res.data),

  login: (email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> =>
    api.post('/auth/login', { email, password }).then(res => res.data),

  getMe: (token: string): Promise<ApiResponse<{ user: User }>> =>
    api.get('/auth/me', { headers: { Authorization: `Bearer ${token}` } }).then(res => res.data),

  updateProfile: (data: Partial<User>, token: string): Promise<ApiResponse<{ user: User }>> =>
    api.put('/auth/profile', data, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.data),

  refreshToken: (token: string): Promise<ApiResponse<{ token: string }>> =>
    api.post('/auth/refresh', {}, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.data),
};

// Book API
export const bookAPI = {
  getBooks: (params?: BookFilters & { page?: number; limit?: number }): Promise<ApiResponse<{
    books: Book[];
    pagination: any;
    filters: any;
  }>> =>
    api.get('/books', { params }).then(res => res.data),

  getBook: (id: string): Promise<ApiResponse<{ book: Book; ratingDistribution: any; userReview?: Review }>> =>
    api.get(`/books/${id}`).then(res => res.data),

  getSimilarBooks: (id: string): Promise<ApiResponse<{ books: Book[] }>> =>
    api.get(`/books/${id}/similar`).then(res => res.data),

  createBook: (data: BookFormData, token: string): Promise<ApiResponse<{ book: Book }>> =>
    api.post('/books', data, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.data),

  updateBook: (id: string, data: BookFormData, token: string): Promise<ApiResponse<{ book: Book }>> =>
    api.put(`/books/${id}`, data, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.data),

  deleteBook: (id: string, token: string): Promise<ApiResponse> =>
    api.delete(`/books/${id}`, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.data),
};

// Review API
export const reviewAPI = {
  getBookReviews: (bookId: string, page = 1): Promise<ApiResponse<{
    reviews: Review[];
    pagination: any;
    statistics: any;
  }>> =>
    api.get(`/reviews/book/${bookId}`, { params: { page } }).then(res => res.data),

  getUserReviews: (userId: string, page = 1): Promise<ApiResponse<{
    reviews: Review[];
    pagination: any;
  }>> =>
    api.get(`/reviews/user/${userId}`, { params: { page } }).then(res => res.data),

  getRecentReviews: (limit = 10): Promise<ApiResponse<{ reviews: Review[] }>> =>
    api.get('/reviews/recent', { params: { limit } }).then(res => res.data),

  createReview: (data: ReviewFormData, token: string): Promise<ApiResponse<{ review: Review }>> =>
    api.post('/reviews', data, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.data),

  updateReview: (id: string, data: Partial<ReviewFormData>, token: string): Promise<ApiResponse<{ review: Review }>> =>
    api.put(`/reviews/${id}`, data, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.data),

  deleteReview: (id: string, token: string): Promise<ApiResponse> =>
    api.delete(`/reviews/${id}`, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.data),

  likeReview: (id: string, token: string): Promise<ApiResponse<{ likes: number; isLiked: boolean }>> =>
    api.post(`/reviews/${id}/like`, {}, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.data),
};

// User API
export const userAPI = {
  getStats: (token: string): Promise<ApiResponse<{ stats: UserStats }>> =>
    api.get('/users/stats', { headers: { Authorization: `Bearer ${token}` } }).then(res => res.data),

  getProfile: (id: string): Promise<ApiResponse<{ user: User; stats: any }>> =>
    api.get(`/users/${id}/profile`).then(res => res.data),

  getLeaderboard: (type: 'books' | 'reviews', limit = 10): Promise<ApiResponse<{ leaderboard: any[]; type: string }>> =>
    api.get('/users/leaderboard', { params: { type, limit } }).then(res => res.data),

  searchUsers: (q: string, limit = 10): Promise<ApiResponse<{ users: User[] }>> =>
    api.get('/users/search', { params: { q, limit } }).then(res => res.data),
};