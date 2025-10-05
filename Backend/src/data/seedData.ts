import User from '../models/User';
import Book from '../models/Book';
import Review from '../models/Review';
import { mockBooks } from './mockBooks';
import logger from '../utils/logger';

export const seedDatabase = async (): Promise<void> => {
    try {
        logger.info('Starting database seeding...');

        // Check if data already exists
        const existingBooks = await Book.countDocuments();
        if (existingBooks > 0) {
            logger.info('Database already seeded, skipping...');
            return;
        }

        // Create a default admin user
        const adminUser = new User({
            name: 'Vansh Tuteja',
            email: 'admin@bookreviews.com',
            password: 'admin123',
            bio: 'Platform administrator and book enthusiast',
            favoriteGenres: ['Fiction', 'Sci-Fi', 'Fantasy']
        });

        await adminUser.save();
        logger.info('Admin user created');

        // Create demo users
        const demoUsers = [
            {
                name: 'Rohan Patel',
                email: 'patel@example.com',
                password: 'patel123',
                bio: 'Avid reader and literature professor',
                favoriteGenres: ['Fiction', 'History', 'Biography']
            },
            {
                name: 'Sourav Chatterjee',
                email: 'sourav@example.com',
                password: 'demo123',
                bio: 'Science fiction enthusiast and tech writer',
                favoriteGenres: ['Sci-Fi', 'Technology', 'Fantasy']
            },
            {
                name: 'Vikas Gupta',
                email: 'vikas@example.com',
                password: 'demo123',
                bio: 'Mystery novel collector and crime story fan',
                favoriteGenres: ['Mystery', 'Thriller', 'Crime']
            }
        ];

        const createdUsers = [];
        for (const userData of demoUsers) {
            const user = new User(userData);
            await user.save();
            createdUsers.push(user);
        }

        logger.info(`Created ${createdUsers.length} demo users`);

        // Create books with the admin user as the creator
        const allUsers = [adminUser, ...createdUsers];
        const createdBooks = [];

        for (let i = 0; i < mockBooks.length; i++) {
            const bookData = mockBooks[i];
            const randomUser = allUsers[Math.floor(Math.random() * allUsers.length)];
            if (!randomUser) {
                throw new Error('No user found');
            }

            const book = new Book({
                ...bookData,
                addedBy: randomUser._id
            });

            await book.save();
            createdBooks.push(book);
        }

        logger.info(`Created ${createdBooks.length} books`);

        // Create sample reviews
        const sampleReviews = [
            {
                rating: 5,
                reviewText: "An absolute masterpiece! This book changed my perspective on life and literature. The character development is phenomenal and the plot keeps you engaged from start to finish.",
                title: "Life-changing read!"
            },
            {
                rating: 4,
                reviewText: "Really enjoyed this book. The writing style is engaging and the story is well-crafted. Would definitely recommend to others who enjoy this genre.",
                title: "Highly recommended"
            },
            {
                rating: 3,
                reviewText: "It was an okay read. Some parts were really interesting while others felt a bit slow. Overall, it's worth reading if you have the time.",
                title: "Decent book"
            },
            {
                rating: 5,
                reviewText: "Couldn't put it down! The author has a way with words that draws you into the story completely. This is definitely going on my favorites list.",
                title: "Absolutely captivating!"
            },
            {
                rating: 4,
                reviewText: "Well-written and thought-provoking. The themes explored in this book are relevant and important. Great character development throughout.",
                title: "Thought-provoking read"
            }
        ];

        let reviewCount = 0;
        for (const book of createdBooks) {
            // Add 1-3 reviews per book
            const numReviews = Math.floor(Math.random() * 3) + 1;

            for (let i = 0; i < numReviews; i++) {
                const randomUser = allUsers[Math.floor(Math.random() * allUsers.length)];
                if (!randomUser) {
                    throw new Error('No user found');
                }

                const randomReview = sampleReviews[Math.floor(Math.random() * sampleReviews.length)];

                // Check if user already reviewed this book
                const existingReview = await Review.findOne({
                    bookId: book._id,
                    userId: randomUser._id
                });

                if (!existingReview) {
                    const review = new Review({
                        bookId: book._id,
                        userId: randomUser._id,
                        ...randomReview,
                        rating: Math.floor(Math.random() * 5) + 1 // Random rating 1-5
                    });

                    await review.save();
                    reviewCount++;
                }
            }
        }

        logger.info(`Created ${reviewCount} reviews`);
        logger.info('Database seeding completed successfully!');

    } catch (error) {
        logger.error('Error seeding database:', error);
        throw error;
    }
};