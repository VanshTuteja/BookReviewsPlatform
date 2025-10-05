import React from 'react';
import { Link } from 'react-router-dom';
import type { Book } from '../../types';
import StarRating from '../ui/StarRating';
import Badge from '../ui/Badge';
import { UserIcon, CalendarIcon } from '@heroicons/react/24/outline';

interface BookCardProps {
  book: Book;
  className?: string;
}

const BookCard: React.FC<BookCardProps> = ({ book, className = '' }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
    });
  };

  return (
    <div className={`group relative bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800 ${className}`}>
      <Link to={`/books/${book._id}`} className="block">
        {/* Book cover with overlay gradient */}
        <div className="relative aspect-[3/4] bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-950 dark:to-purple-950 overflow-hidden">
          {book.coverImage ? (
            <>
              <img
                src={book.coverImage}
                alt={book.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-100/50 via-purple-100/50 to-pink-100/50 dark:from-blue-900/30 dark:via-purple-900/30 dark:to-pink-900/30" />
              <div className="text-center p-6 relative z-10">
                <div className="text-6xl mb-3 transform group-hover:scale-110 transition-transform duration-500">
                  📚
                </div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 line-clamp-3 leading-relaxed">
                  {book.title}
                </p>
              </div>
            </div>
          )}
          
          {/* Floating genre badge */}
          <div className="absolute top-3 right-3 z-10">
            <Badge variant="secondary" className="text-xs backdrop-blur-sm bg-white/90 dark:bg-gray-800/90 shadow-lg border border-gray-200 dark:border-gray-600">
              {book.genre}
            </Badge>
          </div>
        </div>

        {/* Book info with refined spacing */}
        <div className="p-5">
          {/* Title and author */}
          <div className="mb-4">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-2 mb-1.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 leading-tight">
              {book.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
              by {book.author}
            </p>
          </div>

          {/* Rating section with better visual weight */}
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <StarRating rating={book.averageRating} size="sm" />
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {book.averageRating.toFixed(1)}
              </span>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              {book.reviewCount} review{book.reviewCount !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Description with fade effect */}
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-4 leading-relaxed">
            {book.description}
          </p>

          {/* Footer metadata */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center text-gray-500 dark:text-gray-400">
              <CalendarIcon className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
              <span className="font-medium">{book.publishedYear}</span>
            </div>
            
            <div className="flex items-center text-gray-500 dark:text-gray-400 gap-1">
              <UserIcon className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="font-medium truncate max-w-[100px]">
                {typeof book.addedBy === 'object' ? book.addedBy.name : 'Unknown'}
              </span>
            </div>
          </div>
        </div>

        {/* Subtle hover indicator */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
      </Link>
    </div>
  );
};

export default BookCard;