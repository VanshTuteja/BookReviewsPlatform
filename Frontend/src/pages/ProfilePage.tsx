import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useBookStore } from '../store/bookStore';
import { useReviewStore } from '../store/reviewStore';
import { userAPI } from '../services/api';
import BookCard from '../components/Books/BookCard';
import ReviewCard from '../components/Reviews/ReviewCard';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Modal from '../components/ui/Modal';
import {
    UserIcon,
    BookOpenIcon,
    StarIcon,
    PencilIcon,
    ChartBarIcon,
    CalendarIcon
} from '@heroicons/react/24/outline';
import type { UserStats } from '../types';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const ProfilePage: React.FC = () => {
    const { user, token, updateProfile } = useAuthStore();
    const { books, fetchBooks } = useBookStore();
    const { userReviews, fetchUserReviews } = useReviewStore();

    const [stats, setStats] = useState<UserStats | null>(null);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'books' | 'reviews' | 'stats'>('overview');
    const [isLoading, setIsLoading] = useState(true);
    const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null);
    const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);

    const { register, handleSubmit, reset, setValue, watch } = useForm({
        defaultValues: {
            name: user?.name || '',
            bio: user?.bio || '',
            favoriteGenres: user?.favoriteGenres || [],
        },
    });

    const favoriteGenresValue = watch('favoriteGenres');

    useEffect(() => {
        if (!user || !token) return;

        const fetchData = async () => {
            setIsLoading(true);
            try {
                // Fetch user stats
               const statsResponse = await userAPI.getStats(token);
                if (statsResponse && statsResponse.success) {
                    const statsData = statsResponse.data;
                    setStats(statsData?.stats!);
                }

                // Fetch user's books and reviews
                await fetchBooks(); // This will include the user's books
                await fetchUserReviews(user.id);
            } catch (error) {
                console.error('Failed to fetch profile data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [user, token, fetchBooks, fetchUserReviews]);

    if (!user) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400">Please log in to view your profile.</p>
            </div>
        );
    }

    const handleUpdateProfile = async (data: any) => {
        try {
            const updateData: any = {
                name: data.name,
                bio: data.bio,
                favoriteGenres: data.favoriteGenres,
            };

            // If a new profile picture was uploaded, add it to the update data
            if (profilePictureFile) {
                // In a real application, you would upload the file to a server
                // and get back a URL. For now, we'll use the preview URL.
                // You'll need to implement the file upload logic based on your API
                const formData = new FormData();
                formData.append('avatar', profilePictureFile);
                // Example: const response = await userAPI.uploadAvatar(formData, token);
                // updateData.avatar = response.data.avatarUrl;
                
                // For demonstration, we'll use the local preview
                updateData.avatar = profilePicturePreview;
            }

            await updateProfile(updateData);
            setIsEditingProfile(false);
            setProfilePicturePreview(null);
            setProfilePictureFile(null);
            toast.success('Profile updated successfully!');
        } catch (error) {
            toast.error('Failed to update profile');
        }
    };

    const userBooks = books.filter(book =>
        typeof book.addedBy === 'object' && book.addedBy._id === user.id
    );

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
        });
    };

    const tabs = [
        { id: 'overview', label: 'Overview', icon: UserIcon },
        { id: 'books', label: `Books (${userBooks.length})`, icon: BookOpenIcon },
        { id: 'reviews', label: `Reviews (${userReviews.length})`, icon: StarIcon },
        { id: 'stats', label: 'Statistics', icon: ChartBarIcon },
    ] as const;

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Profile Header */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                        {user.avatar ? (
                            <img
                                src={user.avatar}
                                alt={user.name}
                                className="h-24 w-24 rounded-full object-cover"
                            />
                        ) : (
                            <div className="h-24 w-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                <UserIcon className="h-12 w-12 text-gray-400" />
                            </div>
                        )}
                    </div>

                    {/* User info */}
                    <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                                    {user.name}
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400 mb-2">
                                    {user.email}
                                </p>
                                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                    <CalendarIcon className="h-4 w-4 mr-1" />
                                    Member since {formatDate(user.joinedAt || user.createdAt)}
                                </div>
                            </div>

                            <Button
                                variant="outline"
                                onClick={() => {
                                    reset({
                                        name: user.name,
                                        bio: user.bio || '',
                                        favoriteGenres: user.favoriteGenres || [],
                                    });
                                    setProfilePicturePreview(null);
                                    setProfilePictureFile(null);
                                    setIsEditingProfile(true);
                                }}
                                leftIcon={<PencilIcon className="h-4 w-4" />}
                            >
                                Edit Profile
                            </Button>
                        </div>

                        {/* Bio */}
                        {user.bio && (
                            <p className="mt-4 text-gray-700 dark:text-gray-300">
                                {user.bio}
                            </p>
                        )}

                        {/* Favorite genres */}
                        {user.favoriteGenres && user.favoriteGenres.length > 0 && (
                            <div className="mt-4">
                                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Favorite Genres:
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {user.favoriteGenres.map((genre) => (
                                        <Badge key={genre} variant="secondary">
                                            {genre}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
                        <BookOpenIcon className="h-8 w-8 mx-auto text-blue-600 dark:text-blue-400 mb-2" />
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.booksAdded}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Books Added</p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
                        <StarIcon className="h-8 w-8 mx-auto text-yellow-500 mb-2" />
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.reviewsWritten}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Reviews Written</p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
                        <div className="h-8 w-8 mx-auto bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-2">
                            <span className="text-green-600 dark:text-green-400 font-bold">↗</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.averageRatingGiven.toFixed(1)}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Avg Rating Given</p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
                        <div className="h-8 w-8 mx-auto bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mb-2">
                            <span className="text-purple-600 dark:text-purple-400 font-bold">↘</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.averageRatingReceived.toFixed(1)}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Avg Rating Received</p>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="mb-8">
                <nav className="flex space-x-8 border-b border-gray-200 dark:border-gray-700">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${activeTab === tab.id
                                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                }`}
                        >
                            <tab.icon className="h-4 w-4" />
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            <div>
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Recent Books */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Recent Books Added
                            </h3>
                            {userBooks.length > 0 ? (
                                <div className="space-y-4">
                                    {userBooks.slice(0, 3).map((book) => (
                                        <div key={book._id} className="flex items-center space-x-3">
                                            <div className="w-12 h-16 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded overflow-hidden flex-shrink-0">
                                                {book.coverImage ? (
                                                    <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <BookOpenIcon className="h-4 w-4 text-gray-400" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900 dark:text-white text-sm">{book.title}</p>
                                                <p className="text-xs text-gray-600 dark:text-gray-400">by {book.author}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-600 dark:text-gray-400 text-sm">No books added yet.</p>
                            )}
                        </div>

                        {/* Recent Reviews */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Recent Reviews
                            </h3>
                            {userReviews.length > 0 ? (
                                <div className="space-y-4">
                                    {userReviews.slice(0, 3).map((review) => (
                                        <ReviewCard key={review._id} review={review} showBookInfo className="shadow-none border-0 bg-gray-50 dark:bg-gray-700" />
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-600 dark:text-gray-400 text-sm">No reviews written yet.</p>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'books' && (
                    <div>
                        {userBooks.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {userBooks.map((book) => (
                                    <BookCard key={book._id} book={book} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <BookOpenIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No books added yet</h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-4">Start building your collection by adding your first book.</p>
                                <Button >Add Your First Book</Button>
                                {/* as={Link} to="/add-book" */}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'reviews' && (
                    <div>
                        {userReviews.length > 0 ? (
                            <div className="space-y-6">
                                {userReviews.map((review) => (
                                    <ReviewCard key={review._id} review={review} showBookInfo />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <StarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No reviews written yet</h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-4">Share your thoughts about books you've read.</p>
                                <Link to="/">
                                    <Button>Browse Books to Review</Button>
                                </Link>

                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'stats' && stats && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Reading Activity */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Reading Activity</h3>
                            {stats.readingActivity.length > 0 ? (
                                <div className="space-y-3">
                                    {stats.readingActivity.slice(-6).map((activity) => (
                                        <div key={`${activity._id.year}-${activity._id.month}`} className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                {new Date(activity._id.year, activity._id.month - 1).toLocaleDateString('en-US', {
                                                    month: 'long',
                                                    year: 'numeric'
                                                })}
                                            </span>
                                            <div className="flex items-center space-x-2">
                                                <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                    <div
                                                        className="bg-blue-600 h-2 rounded-full"
                                                        style={{ width: `${Math.min(activity.count * 10, 100)}%` }}
                                                    />
                                                </div>
                                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {activity.count}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-600 dark:text-gray-400 text-sm">No reading activity yet.</p>
                            )}
                        </div>

                        {/* Favorite Genres by Rating */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Rated Genres</h3>
                            {stats.favoriteGenres.length > 0 ? (
                                <div className="space-y-3">
                                    {stats.favoriteGenres.map((genre) => (
                                        <div key={genre._id} className="flex justify-between items-center">
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                {genre._id}
                                            </span>
                                            <div className="flex items-center space-x-2">
                                                <StarIcon className="h-4 w-4 text-yellow-400" />
                                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                                    {genre.avgRating.toFixed(1)} ({genre.count} books)
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-600 dark:text-gray-400 text-sm">No genre ratings yet.</p>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Edit Profile Modal */}
            <Modal
                isOpen={isEditingProfile}
                onClose={() => {
                    setIsEditingProfile(false);
                    setProfilePicturePreview(null);
                    setProfilePictureFile(null);
                }}
                title="Edit Profile"
                size="md"
            >
                <form onSubmit={handleSubmit(handleUpdateProfile)} className="p-6 space-y-4">
                    {/* Profile Picture */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Profile Picture
                        </label>
                        <div className="flex items-center space-x-4">
                            {/* Current/Preview Avatar */}
                            <div className="flex-shrink-0">
                                {profilePicturePreview || user.avatar ? (
                                    <img
                                        src={profilePicturePreview || user.avatar}
                                        alt="Profile preview"
                                        className="h-20 w-20 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="h-20 w-20 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                        <UserIcon className="h-10 w-10 text-gray-400" />
                                    </div>
                                )}
                            </div>
                            
                            {/* Upload Button */}
                            <div className="flex-1">
                                <input
                                    type="file"
                                    id="profile-picture"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            setProfilePictureFile(file);
                                            const reader = new FileReader();
                                            reader.onloadend = () => {
                                                setProfilePicturePreview(reader.result as string);
                                            };
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                />
                                <label
                                    htmlFor="profile-picture"
                                    className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none"
                                >
                                    Choose File
                                </label>
                                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                    JPG, PNG or GIF (MAX. 5MB)
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Email (Read-only) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            value={user.email}
                            disabled
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                        />
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            Email cannot be changed
                        </p>
                    </div>

                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Name
                        </label>
                        <input
                            {...register('name')}
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    {/* Bio */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Bio
                        </label>
                        <textarea
                            {...register('bio')}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Tell us about yourself..."
                        />
                    </div>

                    {/* Favorite Genres */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Favorite Genres
                        </label>
                        <div className="space-y-2">
                            {['Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Science Fiction', 'Fantasy', 'Biography', 'History', 'Self-Help', 'Thriller'].map((genre) => (
                                <label key={genre} className="flex items-center">
                                    <input
                                        type="checkbox"
                                        value={genre}
                                        checked={favoriteGenresValue?.includes(genre)}
                                        onChange={(e) => {
                                            const currentGenres = favoriteGenresValue || [];
                                            if (e.target.checked) {
                                                setValue('favoriteGenres', [...currentGenres, genre]);
                                            } else {
                                                setValue('favoriteGenres', currentGenres.filter(g => g !== genre));
                                            }
                                        }}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                        {genre}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-4 pt-4">
                        <Button 
                            variant="outline" 
                            onClick={() => {
                                setIsEditingProfile(false);
                                setProfilePicturePreview(null);
                                setProfilePictureFile(null);
                            }}
                            type="button"
                        >
                            Cancel
                        </Button>
                        <Button type="submit">
                            Save Changes
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default ProfilePage;