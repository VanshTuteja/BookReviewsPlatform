import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { type BookFormData, GENRES } from '../../types';
import Button from '../ui/Button';
import { PhotoIcon } from '@heroicons/react/24/outline';

const schema = yup.object().shape({
  title: yup.string().required('Title is required').min(1).max(200),
  author: yup.string().required('Author is required').min(1).max(100),
  description: yup.string().required('Description is required').min(10).max(2000),
  genre: yup.string().required('Genre is required').oneOf(GENRES),
  publishedYear: yup
    .number()
    .required('Published year is required')
    .min(1000, 'Year must be valid')
    .max(new Date().getFullYear(), 'Year cannot be in the future'),
  isbn: yup.string().optional(),
  coverImage: yup
    .string()
    .optional()
    .test('is-url-or-empty', 'Must be a valid URL', (value) => {
      if (!value || value === '') return true;
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    }),
  pageCount: yup
    .number()
    .transform((value, originalValue) => 
      originalValue === '' ? undefined : value
    )
    .positive('Page count must be positive')
    .optional(),
  language: yup.string().optional(),
  publisher: yup.string().max(100).optional(),
});

interface BookFormProps {
  initialData?: Partial<BookFormData>;
  onSubmit: (data: BookFormData) => Promise<void>;
  isLoading?: boolean;
  submitButtonText?: string;
}

const BookForm: React.FC<BookFormProps> = ({
  initialData,
  onSubmit,
  isLoading = false,
  submitButtonText = 'Save Book',
}) => {
  const [previewImage, setPreviewImage] = useState<string>(initialData?.coverImage || '');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<BookFormData>({
    resolver: yupResolver(schema) as any,
    defaultValues: {
      title: '',
      author: '',
      description: '',
      genre: 'Fiction',
      publishedYear: new Date().getFullYear(),
      isbn: '',
      coverImage: '',
      pageCount: 1,
      language: 'English',
      publisher: '',
      ...initialData,
    },
  });

  const coverImageUrl = watch('coverImage');

  useEffect(() => {
    setPreviewImage(coverImageUrl || '');
  }, [coverImageUrl]);

  const handleFormSubmit = async (data: BookFormData) => {
    try {
      // Clean up data - remove empty strings and undefined values
      const cleanData = Object.entries(data).reduce((acc, [key, value]) => {
        if (value !== '' && value !== undefined && value !== null) {
          acc[key as keyof BookFormData] = value;
        }
        return acc;
      }, {} as Partial<BookFormData>) as BookFormData;

      await onSubmit(cleanData);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic info */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Basic Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  {...register('title')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter book title"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Author *
                </label>
                <input
                  type="text"
                  {...register('author')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter author name"
                />
                {errors.author && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.author.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Genre *
                </label>
                <select
                  {...register('genre')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {GENRES.map((genre) => (
                    <option key={genre} value={genre}>
                      {genre}
                    </option>
                  ))}
                </select>
                {errors.genre && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.genre.message}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description *
              </label>
              <textarea
                {...register('description')}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter book description"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.description.message}
                </p>
              )}
            </div>
          </div>

          {/* Additional details */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Additional Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Published Year *
                </label>
                <input
                  type="number"
                  {...register('publishedYear', { valueAsNumber: true })}
                  min="1000"
                  max={new Date().getFullYear()}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.publishedYear && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.publishedYear.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Page Count
                </label>
                <input
                  type="number"
                  {...register('pageCount', { valueAsNumber: true })}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Number of pages"
                />
                {errors.pageCount && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.pageCount.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  ISBN
                </label>
                <input
                  type="text"
                  {...register('isbn')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="ISBN-10 or ISBN-13"
                />
                {errors.isbn && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.isbn.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Language
                </label>
                <input
                  type="text"
                  {...register('language')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., English, Spanish"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Publisher
                </label>
                <input
                  type="text"
                  {...register('publisher')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Publisher name"
                />
                {errors.publisher && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.publisher.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Cover image */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 sticky top-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Cover Image
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Image URL
              </label>
              <input
                type="url"
                {...register('coverImage')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://example.com/book-cover.jpg"
              />
              {errors.coverImage && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.coverImage.message}
                </p>
              )}
            </div>

            {/* Image preview */}
            <div className="mt-4">
              <div className="aspect-[3/4] bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-600">
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                    onError={() => setPreviewImage('')}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        Cover preview will appear here
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Submit button */}
      <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
        <Button
          type="submit"
          loading={isLoading}
          size="lg"
          className="min-w-[150px]"
        >
          {submitButtonText}
        </Button>
      </div>
    </form>
  );
};

export default BookForm;