import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import Button from '../components/ui/Button';
import { 
  BookOpenIcon, 
  StarIcon, 
  UsersIcon, 
  EyeIcon, 
  EyeSlashIcon,
  SunIcon,
  MoonIcon
} from '@heroicons/react/24/outline';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import toast from 'react-hot-toast';
import Footer from '@/components/Layout/Footer';
import { BookOpen, CheckCircle, Sparkles } from 'lucide-react';
import FeaturesCarousel from './FeaturesCarousel';

const loginSchema = yup.object().shape({
  email: yup.string().email('Please enter a valid email').required('Email is required'),
  password: yup.string().required('Password is required'),
});

const signupSchema = yup.object().shape({
  name: yup.string().required('Name is required').min(2, 'Name must be at least 2 characters').max(50, 'Name cannot exceed 50 characters'),
  email: yup.string().email('Please enter a valid email').required('Email is required'),
  password: yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
  confirmPassword: yup.string().required('Please confirm your password').oneOf([yup.ref('password')], 'Passwords must match'),
});

interface LoginFormData {
  email: string;
  password: string;
}

interface SignupFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, signup, isLoading, error, clearError } = useAuthStore();
  const { isDark, toggleTheme } = useThemeStore();
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);

  const loginForm = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
  });

  const signupForm = useForm<SignupFormData>({
    resolver: yupResolver(signupSchema),
  });

  React.useEffect(() => {
    clearError();
  }, [clearError]);

  const handleLogin = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
      toast.success('Welcome back!');
      setLoginOpen(false);
      navigate('/books');
    } catch (error) {
      // Error is handled by the store
    }
  };

  const handleSignup = async (data: SignupFormData) => {
    try {
      await signup(data.name, data.email, data.password);
      toast.success('Welcome to BookReviews!');
      setSignupOpen(false);
      navigate('/books');
    } catch (error) {
      // Error is handled by the store
    }
  };

  const features = [
    {
      icon: BookOpenIcon,
      title: 'Discover Books',
      description: 'Explore thousands of books across all genres and find your next great read.'
    },
    {
      icon: StarIcon,
      title: 'Rate & Review',
      description: 'Share your thoughts and help others discover amazing books through your reviews.'
    },
    {
      icon: UsersIcon,
      title: 'Join Community',
      description: 'Connect with fellow book lovers and build your personal reading library.'
    }
  ];

  const stats = [
    { number: '10,000+', label: 'Books' },
    { number: '5,000+', label: 'Reviews' },
    { number: '1,000+', label: 'Readers' },
    { number: '4.8', label: 'Average Rating' }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {/* Header - Light Mode: White bg, Dark Mode: Slate-900 bg */}
      <header className="sticky top-0  z-50 bg-white dark:bg-slate-900 border-b border-gray-200  dark:border-slate-700 shadow-sm dark:shadow-slate-800/50 ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <BookOpenIcon className="h-8 w-8 text-blue-600 dark:text-cyan-400" />
              <span className="text-2xl font-bold text-gray-900 dark:text-white">BookReviews</span>
            </div>

            {/* Navigation */}
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-gray-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-cyan-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Toggle theme"
              >
                {isDark ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
              </button>

              <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" className=''>Login</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <DialogHeader>
                    <DialogTitle className="text-gray-900 dark:text-white">Sign in to your account</DialogTitle>
                    <DialogDescription className="text-gray-600 dark:text-gray-400">
                      Enter your credentials to access your account
                    </DialogDescription>
                  </DialogHeader>

                  {error && (
                    <div className="bg-red-50 dark:bg-red-900 border border-red-300 dark:border-red-600 text-red-700 dark:text-red-300 px-4 py-3 rounded">
                      {error}
                    </div>
                  )}

                  <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Email address
                      </label>
                      <input
                        {...loginForm.register('email')}
                        type="email"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-cyan-400 dark:focus:border-cyan-500"
                        placeholder="Enter your email"
                      />
                      {loginForm.formState.errors.email && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                          {loginForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          {...loginForm.register('password')}
                          type={showLoginPassword ? 'text' : 'password'}
                          className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-cyan-400 dark:focus:border-cyan-500"
                          placeholder="Enter your password"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowLoginPassword(!showLoginPassword)}
                        >
                          {showLoginPassword ? (
                            <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                          ) : (
                            <EyeIcon className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                      {loginForm.formState.errors.password && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                          {loginForm.formState.errors.password.message}
                        </p>
                      )}
                    </div>

                    <Button type="submit" loading={isLoading} className="w-full dark:bg-cyan-400 dark:hover:bg-cyan-500 dark:text-slate-900">
                      Sign in
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>

              <Dialog open={signupOpen} onOpenChange={setSignupOpen}>
                <DialogTrigger asChild>
                  <Button className='dark:bg-cyan-400 dark:hover:bg-cyan-500 dark:text-slate-900'>Sign Up</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <DialogHeader>
                    <DialogTitle className="text-gray-900 dark:text-white">Create your account</DialogTitle>
                    <DialogDescription className="text-gray-600 dark:text-gray-400">
                      Join our community of book lovers
                    </DialogDescription>
                  </DialogHeader>

                  {error && (
                    <div className="bg-red-50 dark:bg-red-900 border border-red-300 dark:border-red-600 text-red-700 dark:text-red-300 px-4 py-3 rounded">
                      {error}
                    </div>
                  )}

                  <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Full Name
                      </label>
                      <input
                        {...signupForm.register('name')}
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-cyan-400 dark:focus:border-cyan-500"
                        placeholder="Enter your full name"
                      />
                      {signupForm.formState.errors.name && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                          {signupForm.formState.errors.name.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Email address
                      </label>
                      <input
                        {...signupForm.register('email')}
                        type="email"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-cyan-400 dark:focus:border-cyan-500"
                        placeholder="Enter your email"
                      />
                      {signupForm.formState.errors.email && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                          {signupForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          {...signupForm.register('password')}
                          type={showSignupPassword ? 'text' : 'password'}
                          className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-cyan-400 dark:focus:border-cyan-500"
                          placeholder="Create a password"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowSignupPassword(!showSignupPassword)}
                        >
                          {showSignupPassword ? (
                            <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                          ) : (
                            <EyeIcon className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                      {signupForm.formState.errors.password && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                          {signupForm.formState.errors.password.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <input
                          {...signupForm.register('confirmPassword')}
                          type={showConfirmPassword ? 'text' : 'password'}
                          className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-cyan-400 dark:focus:border-cyan-500"
                          placeholder="Confirm your password"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? (
                            <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                          ) : (
                            <EyeIcon className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                      {signupForm.formState.errors.confirmPassword && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                          {signupForm.formState.errors.confirmPassword.message}
                        </p>
                      )}
                    </div>

                    <Button type="submit" loading={isLoading} className="w-full dark:bg-cyan-400 dark:hover:bg-cyan-500 dark:text-slate-900">
                      Create account
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Dark in both modes with proper contrast */}
         <section className="relative py-20 lg:py-32 bg-gradient-to-b from-blue-50 via-blue-100 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-300/20 dark:bg-cyan-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-300/20 dark:bg-purple-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            {/* Icon with glow effect */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                {/* Glow layers */}
                <div className="absolute inset-0 rounded-full bg-blue-400 dark:bg-cyan-400 blur-2xl opacity-30 dark:opacity-50 scale-150"></div>
                <div className="absolute inset-0 rounded-full bg-blue-400 dark:bg-cyan-400 blur-xl opacity-40 dark:opacity-60 scale-125"></div>
                
                {/* Icon container */}
                <div className="relative w-32 h-32 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center border-4 border-blue-400 dark:border-cyan-400/50 shadow-xl">
                  <BookOpen className="w-16 h-16 text-blue-600 dark:text-cyan-400" strokeWidth={2} />
                </div>
              </div>
            </div>

            {/* Heading */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="text-gray-900 dark:text-white">Discover Your </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-500 dark:from-cyan-400 dark:via-blue-400 dark:to-cyan-300">
                Next Great Book
              </span>
              <span className="text-gray-900 dark:text-white"> Read</span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl text-gray-700 dark:text-slate-400 mb-12 max-w-3xl mx-auto leading-relaxed">
             Join thousands of book lovers in our community. Discover new books, share reviews, 
              and connect with fellow readers who share your passion for literature.
            </p>

            {/* CTA Buttons */}
            <div className="w-full">
              <button 
                onClick={() => setSignupOpen(true)}
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 dark:bg-cyan-400 dark:hover:bg-cyan-500 text-white dark:text-slate-900 font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg shadow-blue-300/50 dark:shadow-cyan-400/50"
              >
                Get Started Free →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-blue-50 dark:bg-slate-800 border-y border-blue-100 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-600 dark:text-cyan-400 mb-2">
                  {stat.number}
                </div>
                <div className="text-blue-700 dark:text-slate-400 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <FeaturesCarousel/>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Everything You Need for Your Reading Journey
            </h2>
            <p className="text-xl text-gray-600 dark:text-slate-400 max-w-2xl mx-auto">
              Our platform provides all the tools you need to discover, track, and share your reading experience.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={index} 
                  className="text-center p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-slate-800 dark:to-slate-800 border border-blue-100 dark:border-slate-700 hover:shadow-xl hover:shadow-blue-200/50 dark:hover:shadow-cyan-400/10 hover:border-blue-300 dark:hover:border-cyan-400/30 transition-all duration-300 group"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-400 to-cyan-400 dark:from-cyan-400/20 dark:to-blue-500/20 rounded-full mb-6 group-hover:scale-110 transition-all duration-300 shadow-lg shadow-blue-300/50 dark:shadow-none">
                    <Icon className="h-8 w-8 text-white dark:text-cyan-400" strokeWidth={2} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-white rounded-full blur-2xl"></div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full mb-6">
            <Sparkles className="w-8 h-8 text-white" strokeWidth={2} />
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Start Your Reading Adventure?
          </h2>
          
          <p className="text-xl text-blue-50 mb-8 max-w-2xl mx-auto">
            Join our community today and discover your next favorite book with personalized recommendations.
          </p>
          
          <button 
            onClick={() => setSignupOpen(true)}
            className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-blue-900/30"
          >
            Join BookReviews Today →
          </button>
        </div>
      </section>

      {/* Footer */}
      <Footer/>
    </div>
  );
};

export default LandingPage;