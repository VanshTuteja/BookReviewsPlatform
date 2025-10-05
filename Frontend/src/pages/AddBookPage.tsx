import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useBookStore } from '../store/bookStore';
import BookForm from '../components/Books/BookForm';
import type { BookFormData } from '../types';
import toast from 'react-hot-toast';

const AddBookPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, token } = useAuthStore();
  const { createBook, isLoading } = useBookStore();

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!user) {
      toast.error('Please log in to add a book');
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  const handleSubmit = async (data: BookFormData) => {
    if (!token) {
      toast.error('Please log in to add a book');
      return;
    }

    try {
      const book = await createBook(data, token);
      toast.success('Book added successfully!');
      navigate(`/books/${book._id}`);
    } catch (error) {
      toast.error('Failed to add book. Please try again.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Add a New Book
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl">
          Share a great book with our community. Fill in the details below to add it to our collection.
          Make sure to provide accurate information to help other readers discover this book.
        </p>
      </div>

      {/* Form */}
      <BookForm
        onSubmit={handleSubmit}
        isLoading={isLoading}
        submitButtonText="Add Book"
      />
    </div>
  );
};

export default AddBookPage;