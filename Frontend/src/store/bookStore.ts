import { create } from 'zustand';
import type { Book, BookFilters, Pagination, BookFormData } from '../types';
import { bookAPI } from '../services/api';

interface BookState {
  books: Book[];
  currentBook: Book | null;
  similarBooks: Book[];
  filters: BookFilters;
  pagination: Pagination;
  genres: string[];
  isLoading: boolean;
  error: string | null;
}

interface BookStore extends BookState {
  fetchBooks: (page?: number) => Promise<void>;
  fetchBook: (id: string) => Promise<void>;
  fetchSimilarBooks: (id: string) => Promise<void>;
  createBook: (data: BookFormData, token: string) => Promise<Book>;
  updateBook: (id: string, data: BookFormData, token: string) => Promise<Book>;
  deleteBook: (id: string, token: string) => Promise<void>;
  setFilters: (filters: Partial<BookFilters>) => void;
  clearFilters: () => void;
  clearCurrentBook: () => void;
  clearError: () => void;
}

const initialState: BookState = {
  books: [],
  currentBook: null,
  similarBooks: [],
  filters: {
    search: '',
    genre: '',
    author: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  },
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalBooks: 0,
    hasNextPage: false,
    hasPrevPage: false,
  },
  genres: [],
  isLoading: false,
  error: null,
};

export const useBookStore = create<BookStore>()((set, get) => ({
  ...initialState,

  fetchBooks: async (page = 1) => {
    set({ isLoading: true, error: null });
    try {
      const { filters } = get();
      const response = await bookAPI.getBooks({ ...filters, page });
      
      if (response.success) {
        set({
          books: response.data?.books,
          pagination: response.data?.pagination,
          genres: response.data?.filters.genres,
          isLoading: false,
        });
      }
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to fetch books',
      });
    }
  },

  fetchBook: async (id: string) => {
    set({ isLoading: true, error: null, currentBook: null });
    try {
      const response = await bookAPI.getBook(id);
      
      if (response.success) {
        set({
          currentBook: response.data?.book,
          isLoading: false,
        });
      }
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to fetch book',
      });
    }
  },

  fetchSimilarBooks: async (id: string) => {
    try {
      const response = await bookAPI.getSimilarBooks(id);
      
      if (response.success) {
        set({ similarBooks: response.data?.books });
      }
    } catch (error: any) {
      console.error('Failed to fetch similar books:', error);
    }
  },

  createBook: async (data: BookFormData, token: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await bookAPI.createBook(data, token);
      
      if (response.success) {
        set({ isLoading: false });
        // Refresh books list
        await get().fetchBooks();
        return response.data!.book;
      }
      throw new Error('Failed to create book');
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to create book',
      });
      throw error;
    }
  },

  updateBook: async (id: string, data: BookFormData, token: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await bookAPI.updateBook(id, data, token);
      
      if (response.success) {
        set({ 
          isLoading: false,
          currentBook: response.data!.book,
        });
        return response.data!.book;
      }
      throw new Error('Failed to update book');
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to update book',
      });
      throw error;
    }
  },

  deleteBook: async (id: string, token: string) => {
    set({ isLoading: true, error: null });
    try {
      await bookAPI.deleteBook(id, token);
      set({ isLoading: false });
      
      // Remove from books list if present
      const { books } = get();
      set({ books: books.filter(book => book._id !== id) });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to delete book',
      });
      throw error;
    }
  },

  setFilters: (newFilters: Partial<BookFilters>) => {
    const { filters } = get();
    const updatedFilters = { ...filters, ...newFilters };
    set({ filters: updatedFilters });
    
    // Reset pagination when filters change
    const { pagination } = get();
    if (pagination.currentPage !== 1) {
      set({
        pagination: { ...pagination, currentPage: 1 }
      });
    }
  },

  clearFilters: () => {
    set({
      filters: {
        search: '',
        genre: '',
        author: '',
        sortBy: 'createdAt',
        sortOrder: 'desc',
      },
    });
  },

  clearCurrentBook: () => set({ currentBook: null }),

  clearError: () => set({ error: null }),
}));