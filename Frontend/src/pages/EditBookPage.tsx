import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useBookStore } from '../store/bookStore';
import BookForm from '../components/Books/BookForm';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';
import type { BookFormData } from '../types';
import toast from 'react-hot-toast';

const EditBookPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, token } = useAuthStore();
  const { 
    currentBook, 
    isLoading, 
    error,
    fetchBook, 
    updateBook,
    clearCurrentBook 
  } = useBookStore();

  useEffect(() => {
    if (id) {
      fetchBook(id);
    }

    return () => {
      clearCurrentBook();
    };
  }, [id, fetchBook, clearCurrentBook]);

  // Check if user is authenticated and is the book owner
  useEffect(() => {
    if (!user) {
      toast.error('Please log in to edit books');
      navigate('/login');
      return;
    }

    if (currentBook && typeof currentBook.addedBy === 'object' && 
        currentBook.addedBy._id !== user.id) {
      toast.error('You can only edit books you added');
      navigate(`/books/${id}`);
    }
  }, [user, currentBook, navigate, id]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !currentBook) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="text-red-600 dark:text-red-400 text-lg font-semibold mb-4">
            {error || 'Book not found'}
          </div>
          <Button onClick={() => navigate('/')} variant="outline">
            Back to Books
          </Button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (data: BookFormData) => {
    if (!token || !id) {
      toast.error('Please log in to edit books');
      return;
    }

    try {
      await updateBook(id, data, token);
      toast.success('Book updated successfully!');
      navigate(`/books/${id}`);
    } catch (error) {
      toast.error('Failed to update book. Please try again.');
    }
  };

  const initialData: Partial<BookFormData> = {
    title: currentBook.title,
    author: currentBook.author,
    description: currentBook.description,
    genre: currentBook.genre,
    publishedYear: currentBook.publishedYear,
    isbn: currentBook.isbn,
    coverImage: currentBook.coverImage,
    pageCount: currentBook.pageCount,
    language: currentBook.language,
    publisher: currentBook.publisher,
    tags: currentBook.tags,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Edit Book
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl">
          Update the details for "{currentBook.title}". Make sure all information is accurate 
          to help other readers discover this book.
        </p>
      </div>

      {/* Form */}
      <BookForm
        initialData={initialData}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        submitButtonText="Update Book"
      />
    </div>
  );
};

export default EditBookPage;