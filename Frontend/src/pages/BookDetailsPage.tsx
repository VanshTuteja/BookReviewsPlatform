import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useBookStore } from '../store/bookStore';
import { useReviewStore } from '../store/reviewStore';
import { useAuthStore } from '../store/authStore';
import BookCard from '../components/Books/BookCard';
import ReviewCard from '../components/Reviews/ReviewCard';
import ReviewForm from '../components/Reviews/ReviewForm';
import RatingChart from '../components/Reviews/RatingChart';
import StarRating from '../components/ui/StarRating';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Modal from '../components/ui/Modal';
import {
    CalendarIcon,
    BookOpenIcon,
    UserIcon,
    PencilIcon,
    TrashIcon,
    GlobeAltIcon,
    BuildingOfficeIcon,
    HashtagIcon,
    PlusIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const BookDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user, token } = useAuthStore();
    const {
        currentBook,
        similarBooks,
        isLoading: bookLoading,
        error: bookError,
        fetchBook,
        fetchSimilarBooks,
        deleteBook,
        clearCurrentBook
    } = useBookStore();

    const {
        reviews,
        ratingDistribution,
        averageRating,
        totalReviews,
        isLoading: reviewsLoading,
        fetchBookReviews,
        createReview,
        clearReviews
    } = useReviewStore();

    const [showReviewForm, setShowReviewForm] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (id) {
            fetchBook(id);
            fetchBookReviews(id);
            fetchSimilarBooks(id);
        }

        return () => {
            clearCurrentBook();
            clearReviews();
        };
    }, [id, fetchBook, fetchBookReviews, fetchSimilarBooks, clearCurrentBook, clearReviews]);

    if (bookLoading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (bookError || !currentBook) {
        return (
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center">
                    <div className="text-red-600 dark:text-red-400 text-lg font-semibold mb-4">
                        {bookError || 'Book not found'}
                    </div>
                    <Button onClick={() => navigate('/')} variant="outline">
                        Back to Books
                    </Button>
                </div>
            </div>
        );
    }

    const isOwner = user && typeof currentBook.addedBy === 'object' &&
        currentBook.addedBy._id === user.id;

    const userHasReviewed = user && reviews.some(review =>
        typeof review.userId === 'object' && review.userId._id === user.id
    );

    const addedByUser = typeof currentBook.addedBy === 'object' ? currentBook.addedBy : null;

    const handleAddReview = async (reviewData: any) => {
        if (!user || !token || !id) {
            toast.error('Please log in to add a review');
            return;
        }

        try {
            await createReview({ ...reviewData, bookId: id }, token);
            setShowReviewForm(false);
            toast.success('Review added successfully!');
        } catch (error) {
            toast.error('Failed to add review');
        }
    };

    const handleDeleteBook = async () => {
        if (!token || !id) return;

        setIsDeleting(true);
        try {
            await deleteBook(id, token);
            toast.success('Book deleted successfully');
            navigate('/');
        } catch (error) {
            toast.error('Failed to delete book');
            setIsDeleting(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Breadcrumb */}
            <nav className="mb-8">
                <ol className="flex items-center space-x-2 text-sm">
                    <li>
                        <Link to="/" className="text-blue-600 dark:text-blue-400 hover:underline">
                            Books
                        </Link>
                    </li>
                    <li className="text-gray-500">/</li>
                    <li className="text-gray-900 dark:text-white font-medium truncate">
                        {currentBook.title}
                    </li>
                </ol>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main content */}
                <div className="lg:col-span-2">
                    {/* Book header */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
                        <div className="flex flex-col md:flex-row gap-6">
                            {/* Book cover */}
                            <div className="flex-shrink-0">
                                <div className="w-48 aspect-[3/4] bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-lg overflow-hidden">
                                    {currentBook.coverImage ? (
                                        <img
                                            src={currentBook.coverImage}
                                            alt={currentBook.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <BookOpenIcon className="h-16 w-16 text-gray-400" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Book info */}
                            <div className="flex-1">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                            {currentBook.title}
                                        </h1>
                                        <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
                                            by {currentBook.author}
                                        </p>
                                    </div>

                                    {/* Action buttons */}
                                    {isOwner && (
                                        <div className="flex items-center space-x-2 ml-4">
                                            <Link to={`/books/${currentBook._id}/edit`}>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    leftIcon={<PencilIcon className="h-4 w-4" />}
                                                >
                                                    Edit
                                                </Button>
                                            </Link>


                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => setShowDeleteModal(true)}
                                                leftIcon={<TrashIcon className="h-4 w-4" />}
                                            >
                                                Delete
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                {/* Rating and stats */}
                                <div className="flex items-center space-x-6 mb-4">
                                    <div className="flex items-center space-x-2">
                                        <StarRating rating={averageRating} size="lg" />
                                        <span className="text-lg font-semibold text-gray-900 dark:text-white">
                                            {averageRating.toFixed(1)}
                                        </span>
                                    </div>
                                    <div className="text-gray-600 dark:text-gray-400">
                                        {totalReviews} review{totalReviews !== 1 ? 's' : ''}
                                    </div>
                                </div>

                                {/* Badges and metadata */}
                                <div className="flex flex-wrap gap-3 mb-4">
                                    <Badge variant="default">{currentBook.genre}</Badge>
                                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                        <CalendarIcon className="h-4 w-4 mr-1" />
                                        {currentBook.publishedYear}
                                    </div>
                                    {currentBook.pageCount && (
                                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                            <BookOpenIcon className="h-4 w-4 mr-1" />
                                            {currentBook.pageCount} pages
                                        </div>
                                    )}
                                    {currentBook.language && (
                                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                            <GlobeAltIcon className="h-4 w-4 mr-1" />
                                            {currentBook.language}
                                        </div>
                                    )}
                                </div>

                                {/* Additional info */}
                                {(currentBook.publisher || currentBook.isbn) && (
                                    <div className="space-y-2 mb-4">
                                        {currentBook.publisher && (
                                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                                <BuildingOfficeIcon className="h-4 w-4 mr-2" />
                                                <span>Published by {currentBook.publisher}</span>
                                            </div>
                                        )}
                                        {currentBook.isbn && (
                                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                                <HashtagIcon className="h-4 w-4 mr-2" />
                                                <span>ISBN: {currentBook.isbn}</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Added by */}
                                {addedByUser && (
                                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-4">
                                        <UserIcon className="h-4 w-4 mr-2" />
                                        <span>Added by</span>
                                        <Link
                                            to={`/users/${addedByUser._id}`}
                                            className="ml-1 font-medium text-blue-600 dark:text-blue-400 hover:underline"
                                        >
                                            {addedByUser.name}
                                        </Link>
                                        <span className="mx-2">•</span>
                                        <span>{formatDate(currentBook.createdAt)}</span>
                                    </div>
                                )}

                                {/* Tags */}
                                {currentBook.tags && currentBook.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {currentBook.tags.map((tag: any, index: any) => (
                                            <Badge key={index} variant="outline" className="text-xs">
                                                #{tag}
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                            About This Book
                        </h2>
                        <div className="prose dark:prose-invert max-w-none">
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                                {currentBook.description}
                            </p>
                        </div>
                    </div>

                    {/* Reviews section */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Reviews ({totalReviews})
                            </h2>

                            {user && !userHasReviewed && (
                                <Button
                                    onClick={() => setShowReviewForm(true)}
                                    leftIcon={<PlusIcon className="h-4 w-4" />}
                                >
                                    Write a Review
                                </Button>
                            )}
                        </div>

                        {reviewsLoading ? (
                            <div className="flex justify-center py-8">
                                <LoadingSpinner />
                            </div>
                        ) : reviews.length > 0 ? (
                            <div className="space-y-6">
                                {reviews.map((review) => (
                                    <ReviewCard key={review._id} review={review} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-gray-600 dark:text-gray-400 mb-4">
                                    No reviews yet. Be the first to share your thoughts!
                                </p>
                                {user && (
                                    <Button
                                        onClick={() => setShowReviewForm(true)}
                                        leftIcon={<PlusIcon className="h-4 w-4" />}
                                    >
                                        Write the First Review
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-1">
                    <div className="space-y-6">
                        {/* Rating chart */}
                        {totalReviews > 0 && (
                            <RatingChart
                                ratingDistribution={ratingDistribution}
                                averageRating={averageRating}
                                totalReviews={totalReviews}
                            />
                        )}

                        {/* Similar books */}
                        {similarBooks.length > 0 && (
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                    Similar Books
                                </h3>
                                <div className="space-y-4">
                                    {similarBooks.map((book) => (
                                        <Link
                                            key={book._id}
                                            to={`/books/${book._id}`}
                                            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                        >
                                            <div className="w-12 h-16 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded overflow-hidden flex-shrink-0">
                                                {book.coverImage ? (
                                                    <img
                                                        src={book.coverImage}
                                                        alt={book.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <BookOpenIcon className="h-4 w-4 text-gray-400" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-gray-900 dark:text-white text-sm line-clamp-1">
                                                    {book.title}
                                                </p>
                                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                                    by {book.author}
                                                </p>
                                                <StarRating rating={book.averageRating} size="sm" />
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Review form modal */}
            <Modal
                isOpen={showReviewForm}
                onClose={() => setShowReviewForm(false)}
                title="Write a Review"
                size="lg"
            >
                <div className="p-6">
                    <div className="mb-4">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                            {currentBook.title}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            by {currentBook.author}
                        </p>
                    </div>
                    <ReviewForm
                        bookId={currentBook._id}
                        onSubmit={handleAddReview}
                    />
                </div>
            </Modal>

            {/* Delete confirmation modal */}
            <Modal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title="Delete Book"
                size="md"
            >
                <div className="p-6">
                    <p className="text-gray-700 dark:text-gray-300 mb-6">
                        Are you sure you want to delete "{currentBook.title}"? This action cannot be undone
                        and will also delete all reviews for this book.
                    </p>
                    <div className="flex justify-end space-x-4">
                        <Button
                            variant="outline"
                            onClick={() => setShowDeleteModal(false)}
                            disabled={isDeleting}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteBook}
                            loading={isDeleting}
                        >
                            Delete Book
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default BookDetailsPage;