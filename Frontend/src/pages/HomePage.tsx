import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useBookStore } from '../store/bookStore';
import { useReviewStore } from '../store/reviewStore';
import BookCard from '../components/Books/BookCard';
import BookFilters from '../components/Books/BookFilters';
import Pagination from '../components/ui/Pagination';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ReviewCard from '../components/Reviews/ReviewCard';
import { BookOpenIcon, StarIcon, UsersIcon, SparklesIcon } from '@heroicons/react/24/outline';
import type { BookFilters as FilterType } from '../types';

interface Stats {
  totalBooks: number;
  totalReviews: number;
  averageRating: number;
}

const HomePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { 
    books, 
    filters, 
    pagination, 
    genres, 
    isLoading, 
    error,
    fetchBooks,
    setFilters,
    clearFilters 
  } = useBookStore();
  
  const { 
    recentReviews, 
    fetchRecentReviews 
  } = useReviewStore();

  const [stats, setStats] = useState<Stats>({
    totalBooks: 0,
    totalReviews: 0,
    averageRating: 0,
  });

  // Initialize filters from URL params on mount
  useEffect(() => {
    const search = searchParams.get('search');
    const genre = searchParams.get('genre');
    const author = searchParams.get('author');
    const minYear = searchParams.get('minYear');
    const maxYear = searchParams.get('maxYear');
    const minRating = searchParams.get('minRating');
    const sortBy = searchParams.get('sortBy');
    const sortOrder = searchParams.get('sortOrder');

    const hasParams = search || genre || author || minYear || maxYear || minRating || sortBy || sortOrder;

    if (hasParams) {
      const newFilters: Partial<FilterType> = {};
      
      if (search) newFilters.search = search;
      if (genre) newFilters.genre = genre;
      if (author) newFilters.author = author;
      if (minYear) newFilters.minYear = parseInt(minYear);
      if (maxYear) newFilters.maxYear = parseInt(maxYear);
      if (minRating) newFilters.minRating = parseFloat(minRating);
      if (sortBy) newFilters.sortBy = sortBy as FilterType['sortBy'];
      if (sortOrder) newFilters.sortOrder = sortOrder as FilterType['sortOrder'];

      setFilters(newFilters);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  // Debounced fetch for search to avoid repeated loads
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBooks();
    }, 500); // 500ms delay for search debouncing
    
    return () => clearTimeout(timer);
  }, [filters, fetchBooks]);

  // Fetch recent reviews on mount
  useEffect(() => {
    fetchRecentReviews(5);
  }, [fetchRecentReviews]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (filters.search) params.set('search', filters.search);
    if (filters.genre) params.set('genre', filters.genre);
    if (filters.author) params.set('author', filters.author);
    if (filters.minYear) params.set('minYear', filters.minYear.toString());
    if (filters.maxYear) params.set('maxYear', filters.maxYear.toString());
    if (filters.minRating) params.set('minRating', filters.minRating.toString());
    if (filters.sortBy && filters.sortBy !== 'createdAt') params.set('sortBy', filters.sortBy);
    if (filters.sortOrder && filters.sortOrder !== 'desc') params.set('sortOrder', filters.sortOrder);

    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams]);

  // Calculate stats
  useEffect(() => {
    if (books.length > 0) {
      const totalReviews = books.reduce((sum, book) => sum + book.reviewCount, 0);
      const totalRating = books.reduce((sum, book) => sum + (book.averageRating * book.reviewCount), 0);
      const averageRating = totalReviews > 0 ? totalRating / totalReviews : 0;

      setStats({
        totalBooks: pagination.totalBooks,
        totalReviews,
        averageRating,
      });
    } else if (!isLoading) {
      setStats({
        totalBooks: 0,
        totalReviews: 0,
        averageRating: 0,
      });
    }
  }, [books, pagination.totalBooks, isLoading]);

  const handleFiltersChange = (newFilters: Partial<FilterType>) => {
    setFilters(newFilters);
  };

  const handlePageChange = (page: number) => {
    fetchBooks(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearFilters = () => {
    clearFilters();
    setSearchParams({}, { replace: true });
  };

  if (error) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-6 mb-4">
            <div className="text-red-600 dark:text-red-400 text-lg font-semibold mb-2">
              Oops! Something went wrong
            </div>
            <p className="text-red-500 dark:text-red-300 text-sm">
              {error}
            </p>
          </div>
          <button
            onClick={() => fetchBooks()}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-md hover:shadow-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <SparklesIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <h1 className="pb-2 text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              Discover Amazing Books
            </h1>
          </div>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400 max-w-3xl leading-relaxed">
            Explore our collection of books, read reviews from fellow readers, and share your own thoughts.
            Join our community of book lovers and discover your next great read.
          </p>
        </div>

        {/* Enhanced Stats Cards */}
   <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
  {/* Total Books */}
  <div className="bg-gradient-to-br from-indigo-400 to-indigo-600 dark:from-indigo-500 dark:to-indigo-700 rounded-xl p-6 shadow-md dark:shadow-lg hover:shadow-lg dark:hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-3xl font-bold text-white mb-1">
          {stats.totalBooks.toLocaleString()}
        </p>
        <p className="text-indigo-100 dark:text-indigo-200 text-sm font-medium">Total Books</p>
      </div>
      <div className="bg-white/20 p-3 rounded-lg">
        <BookOpenIcon className="h-8 w-8 text-white" />
      </div>
    </div>
  </div>

  {/* Average Rating */}
  <div className="bg-gradient-to-br from-amber-400 to-amber-500 dark:from-amber-500 dark:to-amber-600 rounded-xl p-6 shadow-md dark:shadow-lg hover:shadow-lg dark:hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-3xl font-bold text-white mb-1">
          {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '0.0'}
        </p>
        <p className="text-amber-100 dark:text-amber-200 text-sm font-medium">Average Rating</p>
      </div>
      <div className="bg-white/20 p-3 rounded-lg">
        <StarIcon className="h-8 w-8 text-white" />
      </div>
    </div>
  </div>

  {/* Total Reviews */}
  <div className="bg-gradient-to-br from-emerald-400 to-teal-500 dark:from-emerald-500 dark:to-teal-600 rounded-xl p-6 shadow-md dark:shadow-lg hover:shadow-lg dark:hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-3xl font-bold text-white mb-1">
          {stats.totalReviews.toLocaleString()}
        </p>
        <p className="text-emerald-100 dark:text-emerald-200 text-sm font-medium">Total Reviews</p>
      </div>
      <div className="bg-white/20 p-3 rounded-lg">
        <UsersIcon className="h-8 w-8 text-white" />
      </div>
    </div>
  </div>
</div>


        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main content */}
          <div className="lg:col-span-4 space-y-6">
            {/* Filters */}
            <BookFilters
              filters={filters}
              genres={genres}
              onFiltersChange={handleFiltersChange}
              onClearFilters={handleClearFilters}
              isLoading={isLoading}
            />

            {/* Books grid */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <LoadingSpinner size="lg" />
                <p className="mt-4 text-gray-600 dark:text-gray-400 text-sm">
                  Loading amazing books for you...
                </p>
              </div>
            ) : books.length > 0 ? (
              <>
                <div className="mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Showing <span className="font-semibold text-gray-900 dark:text-white">{books.length}</span> of{' '}
                    <span className="font-semibold text-gray-900 dark:text-white">{pagination.totalBooks}</span> books
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {books.map((book) => (
                    <BookCard key={book._id} book={book} />
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="mt-8">
                    <Pagination
                      currentPage={pagination.currentPage}
                      totalPages={pagination.totalPages}
                      onPageChange={handlePageChange}
                      showInfo
                      totalItems={pagination.totalBooks}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
                <BookOpenIcon className="h-20 w-20 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No books found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                  {Object.values(filters).some(v => v !== undefined && v !== '' && v !== 'createdAt' && v !== 'desc')
                    ? 'We couldn\'t find any books matching your filters. Try adjusting your search criteria.'
                    : 'Be the first to add a book to our collection!'
                  }
                </p>
                {Object.values(filters).some(v => v !== undefined && v !== '' && v !== 'createdAt' && v !== 'desc') && (
                  <button
                    onClick={handleClearFilters}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-md hover:shadow-lg"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Enhanced Sidebar */}
          <div className="lg:col-span-4">
            <div className="space-y-6 lg:sticky lg:top-8">
              {/* Recent Reviews */}
              {recentReviews.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-4">
                    <StarIcon className="h-5 w-5 text-yellow-500" />
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      Recent Reviews
                    </h3>
                  </div>
                  <div className="space-y-4">
                    {recentReviews.map((review) => (
                      <ReviewCard
                        key={review._id}
                        review={review}
                        showBookInfo
                        className="shadow-none border-0 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Popular Genres */}
              {genres.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-4">
                    <BookOpenIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      Popular Genres
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {genres.slice(0, 12).map((genre) => (
                      <button
                        key={genre}
                        onClick={() => handleFiltersChange({ genre })}
                        disabled={isLoading}
                        className={`px-3 py-1.5 text-sm font-medium rounded-full transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                          filters.genre === genre
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-900/50'
                        }`}
                      >
                        {genre}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;