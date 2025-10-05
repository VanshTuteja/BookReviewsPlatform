import React, { useState, useEffect, useCallback } from 'react';
import { MagnifyingGlassIcon, FunnelIcon, XMarkIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';

// Types
interface BookFilters {
  search?: string;
  genre?: string;
  author?: string;
  minYear?: number;
  maxYear?: number;
  minRating?: number;
  sortBy: 'createdAt' | 'title' | 'author' | 'publishedYear' | 'averageRating';
  sortOrder: 'asc' | 'desc';
  page?: number;
}

interface BookFiltersProps {
  filters: BookFilters;
  genres: string[];
  onFiltersChange: (filters: Partial<BookFilters>) => void;
  onClearFilters: () => void;
  isLoading?: boolean;
}

const GENRES = [
  'Fiction', 'Non-Fiction', 'Mystery', 'Thriller', 'Romance', 
  'Science Fiction', 'Fantasy', 'Biography', 'History', 'Self-Help'
];

const BookFilters: React.FC<BookFiltersProps> = ({
  filters,
  genres,
  onFiltersChange,
  onClearFilters,
  isLoading = false,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [searchFocused, setSearchFocused] = useState<boolean>(false);
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.search || '');
    }, 300);
    
    return () => clearTimeout(timer);
  }, [filters.search]);

  const hasActiveFilters = useCallback((): boolean => {
    return !!(
      filters.search || 
      filters.genre || 
      filters.author || 
      filters.minYear || 
      filters.maxYear || 
      filters.minRating ||
      (filters.sortBy !== 'createdAt' || filters.sortOrder !== 'desc')
    );
  }, [filters]);

  const activeFilterCount = useCallback((): number => {
    let count = 0;
    if (filters.search) count++;
    if (filters.genre) count++;
    if (filters.author) count++;
    if (filters.minYear) count++;
    if (filters.maxYear) count++;
    if (filters.minRating) count++;
    if (filters.sortBy !== 'createdAt' || filters.sortOrder !== 'desc') count++;
    return count;
  }, [filters]);

  const handleInputChange = (key: keyof BookFilters, value: string | number | undefined) => {
    onFiltersChange({ [key]: value });
  };

  const handleClearIndividualFilter = (key: keyof BookFilters | 'sort') => {
    if (key === 'sort') {
      onFiltersChange({ sortBy: 'createdAt', sortOrder: 'desc' });
    } else {
      onFiltersChange({ [key]: undefined });
    }
  };

  const availableGenres = genres.length > 0 ? genres : GENRES;

  return (
    <div className="space-y-4">
      {/* Main search and filter bar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 hover:shadow-xl">
        <div className="p-4">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            {/* Enhanced Search Input */}
            <div className="flex-1 relative group">
              <div className={`relative transition-all duration-200 ${searchFocused ? 'scale-[1.01]' : ''}`}>
                <MagnifyingGlassIcon className={`absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 transition-colors duration-200 ${
                  searchFocused ? 'text-blue-500' : 'text-gray-400'
                }`} />
                <input
                  type="text"
                  placeholder="Search books, authors, titles..."
                  value={filters.search || ''}
                  onChange={(e) => handleInputChange('search', e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  disabled={isLoading}
                  className="w-full pl-12 pr-10 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white dark:focus:bg-gray-800 transition-all duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                />
                {filters.search && (
                  <button
                    onClick={() => handleInputChange('search', undefined)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors"
                    disabled={isLoading}
                  >
                    <XMarkIcon className="h-4 w-4 text-gray-500" />
                  </button>
                )}
              </div>
              {/* Search suggestions indicator */}
              {debouncedSearch && isLoading && (
                <div className="absolute left-0 right-0 top-full mt-1 text-xs text-gray-500 dark:text-gray-400 px-4">
                  Searching for "{debouncedSearch}"...
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                disabled={isLoading}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                  isExpanded 
                    ? 'bg-blue-500 text-white shadow-md hover:bg-blue-600' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <AdjustmentsHorizontalIcon className="h-5 w-5" />
                <span className="hidden sm:inline">Filters</span>
                {activeFilterCount() > 0 && (
                  <span className="bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 text-xs font-bold px-2 py-0.5 rounded-full">
                    {activeFilterCount()}
                  </span>
                )}
              </button>
              
              {hasActiveFilters() && (
                <button
                  onClick={onClearFilters}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-3 rounded-lg font-medium text-sm bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <XMarkIcon className="h-5 w-5" />
                  <span className="hidden sm:inline">Clear</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Expanded Filters */}
        <div className={`transition-all duration-300 ease-in-out ${
          isExpanded ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
        } overflow-hidden`}>
          <div className="px-4 pb-4 pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {/* Genre Filter */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Genre
                </label>
                <select
                  value={filters.genre || ''}
                  onChange={(e) => handleInputChange('genre', e.target.value || undefined)}
                  disabled={isLoading}
                  className="w-full px-3 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer hover:border-gray-300 dark:hover:border-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">All Genres</option>
                  {availableGenres.map((genre) => (
                    <option key={genre} value={genre}>
                      {genre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Author Filter */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Author
                </label>
                <input
                  type="text"
                  placeholder="e.g., Stephen King"
                  value={filters.author || ''}
                  onChange={(e) => handleInputChange('author', e.target.value || undefined)}
                  disabled={isLoading}
                  className="w-full px-3 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Year Range */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Published Year
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="From"
                    value={filters.minYear || ''}
                    onChange={(e) => handleInputChange('minYear', e.target.value ? parseInt(e.target.value) : undefined)}
                    disabled={isLoading}
                    className="w-1/2 px-3 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    min={1800}
                    max={2025}
                  />
                  <input
                    type="number"
                    placeholder="To"
                    value={filters.maxYear || ''}
                    onChange={(e) => handleInputChange('maxYear', e.target.value ? parseInt(e.target.value) : undefined)}
                    disabled={isLoading}
                    className="w-1/2 px-3 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    min={1800}
                    max={2025}
                  />
                </div>
              </div>

              {/* Minimum Rating */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Minimum Rating
                </label>
                <select
                  value={filters.minRating || ''}
                  onChange={(e) => handleInputChange('minRating', e.target.value ? parseFloat(e.target.value) : undefined)}
                  disabled={isLoading}
                  className="w-full px-3 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer hover:border-gray-300 dark:hover:border-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">Any Rating</option>
                  <option value="1">⭐ 1+ Stars</option>
                  <option value="2">⭐ 2+ Stars</option>
                  <option value="3">⭐ 3+ Stars</option>
                  <option value="4">⭐ 4+ Stars</option>
                  <option value="5">⭐ 5 Stars</option>
                </select>
              </div>

              {/* Sort Options */}
              <div className="space-y-2 md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Sort By
                </label>
                <select
                  value={`${filters.sortBy}-${filters.sortOrder}`}
                  onChange={(e) => {
                    const [sortBy, sortOrder] = e.target.value.split('-') as [BookFilters['sortBy'], BookFilters['sortOrder']];
                    onFiltersChange({ sortBy, sortOrder });
                  }}
                  disabled={isLoading}
                  className="w-full px-3 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer hover:border-gray-300 dark:hover:border-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="createdAt-desc">📅 Newest First</option>
                  <option value="createdAt-asc">📅 Oldest First</option>
                  <option value="title-asc">🔤 Title A-Z</option>
                  <option value="title-desc">🔤 Title Z-A</option>
                  <option value="author-asc">✍️ Author A-Z</option>
                  <option value="author-desc">✍️ Author Z-A</option>
                  <option value="publishedYear-desc">📚 Newest Books</option>
                  <option value="publishedYear-asc">📚 Oldest Books</option>
                  <option value="averageRating-desc">⭐ Highest Rated</option>
                  <option value="averageRating-asc">⭐ Lowest Rated</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Filters Pills */}
      {hasActiveFilters() && (
        <div className="flex flex-wrap gap-2">
          {filters.search && (
            <FilterPill
              label={`Search: "${filters.search}"`}
              onRemove={() => handleClearIndividualFilter('search')}
              disabled={isLoading}
            />
          )}
          {filters.genre && (
            <FilterPill
              label={`Genre: ${filters.genre}`}
              onRemove={() => handleClearIndividualFilter('genre')}
              disabled={isLoading}
            />
          )}
          {filters.author && (
            <FilterPill
              label={`Author: ${filters.author}`}
              onRemove={() => handleClearIndividualFilter('author')}
              disabled={isLoading}
            />
          )}
          {filters.minYear && (
            <FilterPill
              label={`From: ${filters.minYear}`}
              onRemove={() => handleClearIndividualFilter('minYear')}
              disabled={isLoading}
            />
          )}
          {filters.maxYear && (
            <FilterPill
              label={`To: ${filters.maxYear}`}
              onRemove={() => handleClearIndividualFilter('maxYear')}
              disabled={isLoading}
            />
          )}
          {filters.minRating && (
            <FilterPill
              label={`Min Rating: ${filters.minRating}⭐`}
              onRemove={() => handleClearIndividualFilter('minRating')}
              disabled={isLoading}
            />
          )}
          {(filters.sortBy !== 'createdAt' || filters.sortOrder !== 'desc') && (
            <FilterPill
              label="Sorted"
              onRemove={() => handleClearIndividualFilter('sort')}
              disabled={isLoading}
            />
          )}
        </div>
      )}
    </div>
  );
};

interface FilterPillProps {
  label: string;
  onRemove: () => void;
  disabled?: boolean;
}

const FilterPill: React.FC<FilterPillProps> = ({ label, onRemove, disabled = false }) => (
  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium transition-all hover:bg-blue-200 dark:hover:bg-blue-900/50 group">
    <span>{label}</span>
    <button
      onClick={onRemove}
      disabled={disabled}
      className="p-0.5 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <XMarkIcon className="h-3.5 w-3.5" />
    </button>
  </div>
);

export default BookFilters;