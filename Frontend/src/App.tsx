import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useThemeStore } from './store/themeStore';
import { useAuthStore } from './store/authStore';

// Layout
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';

// Pages
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import BookDetailsPage from './pages/BookDetailsPage';
import AddBookPage from './pages/AddBookPage';
import EditBookPage from './pages/EditBookPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ProfilePage from './pages/ProfilePage';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuthStore();
  return user ? <>{children}</> : <Navigate to="/" />;
};

const App: React.FC = () => {
  const { isDark } = useThemeStore();
  const { user, token } = useAuthStore();

  // Apply theme on mount
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Auto-refresh token periodically
  useEffect(() => {
    if (user && token) {
      const refreshInterval = setInterval(async () => {
        // Refresh token every 25 minutes (tokens expire in 30 minutes)
        try {
          await useAuthStore.getState().refreshToken();
        } catch (error) {
          console.error('Token refresh failed:', error);
        }
      }, 25 * 60 * 1000);

      return () => clearInterval(refreshInterval);
    }
  }, [user, token]);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
        {/* Conditional Header - only show on authenticated routes */}
        {user && <Header />}
        
        {/* Main Content */}
        <main className="flex-1">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={user ? <Navigate to="/books" /> : <LandingPage />} />
            <Route path="/books" element={<HomePage />} />
            <Route path="/books/:id" element={<BookDetailsPage />} />
            <Route path="/login" element={user ? <Navigate to="/books" /> : <LoginPage />} />
            <Route path="/signup" element={user ? <Navigate to="/books" /> : <SignupPage />} />
            
            {/* Protected Routes */}
            <Route 
              path="/add-book" 
              element={
                <ProtectedRoute>
                  <AddBookPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/books/:id/edit" 
              element={
                <ProtectedRoute>
                  <EditBookPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } 
            />
            
            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to={user ? "/books" : "/"} replace />} />
          </Routes>
        </main>
        
        {/* Conditional Footer - only show on authenticated routes */}
        {user && <Footer />}
        
        {/* Toast notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: isDark ? '#374151' : '#ffffff',
              color: isDark ? '#f3f4f6' : '#111827',
              border: isDark ? '1px solid #4b5563' : '1px solid #e5e7eb',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: isDark ? '#374151' : '#ffffff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: isDark ? '#374151' : '#ffffff',
              },
            },
          }}
        />
      </div>
    </Router>
  );
};

export default App;