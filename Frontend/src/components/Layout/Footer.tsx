import React from 'react';
import { BookOpen, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-100 dark:bg-slate-900 border-t border-gray-200 dark:border-slate-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4 group">
              <div className="relative">
                <BookOpen className="h-8 w-8 text-blue-600 dark:text-cyan-400 transition-transform duration-200 group-hover:rotate-6" strokeWidth={2} />
                <div className="absolute inset-0 bg-blue-600 dark:bg-cyan-400 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-200 rounded-full"></div>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent">
                BookReviews
              </span>
            </div>
            <p className="text-gray-600 dark:text-slate-400 text-sm max-w-md leading-relaxed">
              Discover, review, and share your favorite books with a community of passionate readers. 
              Build your personal library and connect with fellow book lovers.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-slate-200 uppercase tracking-wider mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <a href="/books" className="text-gray-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-cyan-400 text-sm transition-colors duration-200">
                  Browse Books
                </a>
              </li>
              <li>
                <a href="/add-book" className="text-gray-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-cyan-400 text-sm transition-colors duration-200">
                  Add a Book
                </a>
              </li>
              <li>
                <a href="/profile" className="text-gray-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-cyan-400 text-sm transition-colors duration-200">
                  My Profile
                </a>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-slate-200 uppercase tracking-wider mb-4">
              Community
            </h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-cyan-400 text-sm transition-colors duration-200">
                  Reading Groups
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-cyan-400 text-sm transition-colors duration-200">
                  Book Clubs
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-cyan-400 text-sm transition-colors duration-200">
                  Author Interviews
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-cyan-400 text-sm transition-colors duration-200">
                  Reading Challenges
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-slate-700/50">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 dark:text-slate-400 text-sm">
              © 2025 BookReviews Platform. All rights reserved.
            </p>
            <div className="flex items-center space-x-1 mt-4 md:mt-0">
              <span className="text-gray-600 dark:text-slate-400 text-sm">Made with</span>
              <Heart className="h-4 w-4 text-red-500 fill-red-500" />
              <span className="text-gray-600 dark:text-slate-400 text-sm">for book lovers</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;