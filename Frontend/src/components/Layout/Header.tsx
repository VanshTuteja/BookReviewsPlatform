import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  BookOpenIcon, 
  MagnifyingGlassIcon, 
  UserIcon, 
  SunIcon, 
  MoonIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { useState } from 'react';

const Header: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { isDark, toggleTheme } = useThemeStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/books', label: 'Books', exact: true },
    ...(user ? [
      { path: '/add-book', label: 'Add Book' },
      { path: '/profile', label: 'Profile' },
    ] : []),
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            to="/books" 
            className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-all duration-200 hover:scale-105 group"
          >
            <div className="relative">
              <BookOpenIcon className="h-8 w-8 transition-transform duration-200 group-hover:rotate-6" />
              <div className="absolute inset-0 bg-blue-400 dark:bg-blue-500 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-200 rounded-full"></div>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-400 dark:to-blue-300 bg-clip-text text-transparent">
              BookReviews
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map(({ path, label, exact }) => {
              const active = exact ? isActive(path) : location.pathname.startsWith(path);
              return (
                <Link
                  key={path}
                  to={path}
                  className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    active
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100/50 dark:hover:bg-gray-800/50'
                  }`}
                >
                  {label}
                  {active && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-gradient-to-r from-transparent via-blue-600 dark:via-blue-400 to-transparent rounded-full"></span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right side buttons */}
          <div className="flex items-center space-x-2">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
              aria-label="Toggle theme"
            >
              <div className="relative w-5 h-5">
                <SunIcon className={`absolute inset-0 transition-all duration-300 ${isDark ? 'rotate-0 opacity-100' : 'rotate-90 opacity-0'}`} />
                <MoonIcon className={`absolute inset-0 transition-all duration-300 ${isDark ? '-rotate-90 opacity-0' : 'rotate-0 opacity-100'}`} />
              </div>
            </button>

            {/* Auth buttons */}
            {user ? (
              <div className="hidden md:flex items-center space-x-2">
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200 group"
                >
                  {user.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.name}
                      className="h-7 w-7 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-700 group-hover:ring-blue-500 dark:group-hover:ring-blue-400 transition-all duration-200"
                    />
                  ) : (
                    <div className="h-7 w-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 flex items-center justify-center">
                      <UserIcon className="h-4 w-4 text-white" />
                    </div>
                  )}
                  <span className="text-sm font-medium">{user.name}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="relative px-4 py-2 text-sm font-medium text-white rounded-lg overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-500 transition-transform duration-200 group-hover:scale-105 "></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                  <span className="relative">Sign Up</span>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
              aria-label="Toggle menu"
            >
              <div className="relative w-6 h-6">
                <XMarkIcon className={`absolute inset-0 transition-all duration-200 ${isMenuOpen ? 'rotate-0 opacity-100' : 'rotate-90 opacity-0'}`} />
                <Bars3Icon className={`absolute inset-0 transition-all duration-200 ${isMenuOpen ? '-rotate-90 opacity-0' : 'rotate-0 opacity-100'}`} />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="py-4 border-t border-gray-200/50 dark:border-gray-700/50">
            {/* Mobile navigation */}
            <nav className="space-y-1 px-2">
              {navItems.map(({ path, label, exact }) => {
                const active = exact ? isActive(path) : location.pathname.startsWith(path);
                return (
                  <Link
                    key={path}
                    to={path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`block px-4 py-2.5 rounded-lg text-base font-medium transition-all duration-200 ${
                      active
                        ? 'bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 text-blue-700 dark:text-blue-300 shadow-sm'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-98'
                    }`}
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>

            {/* Mobile auth */}
            <div className="mt-4 pt-4 border-t border-gray-200/50 dark:border-gray-700/50 px-2">
              {user ? (
                <div className="space-y-2">
                  <Link
                    to="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center space-x-3 px-4 py-2.5 rounded-lg text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                  >
                    {user.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt={user.name}
                        className="h-8 w-8 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-700"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 flex items-center justify-center">
                        <UserIcon className="h-4 w-4 text-white" />
                      </div>
                    )}
                    <span>{user.name}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2.5 rounded-lg text-base font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-4 py-2.5 rounded-lg text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 text-center"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-4 py-2.5 rounded-lg text-base font-medium bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white transition-all duration-200 text-center shadow-sm"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;