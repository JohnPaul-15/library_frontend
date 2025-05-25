"use client";

import { useEffect, useState } from 'react';
import { useApp } from '@/context/AppProvider';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

interface Book {
  id?: number;
  title: string;
  author: string;
  publisher: string;
  total_copies: number;
  available_copies: number;
  status: 'Available' | 'Borrowed' | 'Not Available';
}

export default function BooksManagement() {
  const { authToken, isLoading } = useApp();
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Book>({
    title: '',
    author: '',
    publisher: '',
    total_copies: 1,
    available_copies: 1,
    status: 'Available',
  });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!authToken && !isLoading) {
      router.push('/auth');
      return;
    }
    if (authToken) {
      fetchBooks();
    }
  }, [authToken, isLoading, router]);

  const fetchBooks = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/books`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      const booksData = Array.isArray(response.data) ? response.data : 
                       response.data.data || response.data.books || [];
      
      // Ensure all books have total_copies
      const normalizedBooks = booksData.map((book: any) => ({
        ...book,
        total_copies: book.total_copies || 1,
        available_copies: book.available_copies || book.total_copies || 1
      }));
      
      setBooks(normalizedBooks);
    } catch (error) {
      console.error('Error fetching books:', error);
      toast.error('Failed to fetch books');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    console.log('Input change:', { name, value, type: typeof value }); // Debug log
    
    let processedValue = value;
    
    if (name === 'total_copies') {
      const numValue = parseInt(value) || 1;
      processedValue = Math.max(1, numValue).toString();
      console.log('Processed total_copies:', { original: value, processed: processedValue }); // Debug log
    }

    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: processedValue,
      };
      console.log('New form data:', newData); // Debug log
      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form data before submission:', formData); // Debug log
    
    try {
      const payload = {
        title: formData.title,
        author: formData.author,
        publisher: formData.publisher,
        total_copies: Number(formData.total_copies),
        available_copies: Number(formData.total_copies),
      };

      console.log('Submitting with payload:', payload); // Debug log

      if (isEditing && formData.id) {
        const response = await axios.put(
          `${process.env.NEXT_PUBLIC_API_URL}/books/${formData.id}`,
          payload,
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
        console.log('Update response:', response.data); // Debug log
        toast.success('Book updated successfully');
      } else {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/books`,
          payload,
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
        console.log('Create response:', response.data); // Debug log
        toast.success('Book added successfully');
      }
      
      resetForm();
      await fetchBooks(); // Wait for fetch to complete
      console.log('Books after fetch:', books); // Debug log
    } catch (error) {
      console.error('Error saving book:', error);
      toast.error('Failed to save book');
    }
  };

  const handleEdit = (book: Book) => {
    setIsEditing(true);
    setFormData({
      title: book.title,
      author: book.author,
      publisher: book.publisher,
      total_copies: book.total_copies || 1,
      available_copies: book.available_copies || book.total_copies || 1,
      status: book.status || 'Available',
      id: book.id
    });
  };

  const handleDelete = async (id: number) => {
    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: 'var(--primary)',
        cancelButtonColor: 'var(--border-color)',
        confirmButtonText: 'Yes, delete it!'
      });

      if (result.isConfirmed) {
        await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/books/${id}`, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        setBooks(books.filter(book => book.id !== id));
        Swal.fire('Deleted!', 'Book has been deleted.', 'success');
      }
    } catch (error) {
      console.error('Error deleting book:', error);
      toast.error('Failed to delete book');
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setFormData({
      title: '',
      author: '',
      publisher: '',
      total_copies: 1,
      available_copies: 1,
      status: 'Available',
    });
  };

  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.publisher.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Manage Books</h1>
        <button
          onClick={resetForm}
          className="btn-primary"
        >
          Add New Book
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search books..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border-color)] rounded-lg text-white placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
        />
        <svg
          className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      {/* Form */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">
          {isEditing ? 'Edit Book' : 'Add New Book'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border-color)] rounded-lg text-white placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">
              Author
            </label>
            <input
              type="text"
              name="author"
              value={formData.author}
              onChange={handleInputChange}
              className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border-color)] rounded-lg text-white placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">
              Publisher
            </label>
            <input
              type="text"
              name="publisher"
              value={formData.publisher}
              onChange={handleInputChange}
              className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border-color)] rounded-lg text-white placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">
              Total Copies
            </label>
            <input
              type="number"
              name="total_copies"
              min="1"
              value={formData.total_copies}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 1;
                setFormData({
                  ...formData,
                  total_copies: value > 0 ? value : 1
                });
              }}
              className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border-color)] rounded-lg text-white placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border-color)] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
            >
              <option value="Available">Available</option>
              <option value="Borrowed">Borrowed</option>
              <option value="Not Available">Not Available</option>
            </select>
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 btn-primary"
            >
              {isEditing ? 'Update Book' : 'Add Book'}
            </button>
            {isEditing && (
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-[var(--border-color)] rounded-lg text-[var(--text-muted)] hover:bg-[var(--card-bg)] hover:text-white transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Books Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border-color)]">
                <th className="px-4 py-3 text-left text-sm font-medium text-[var(--text-muted)]">Title</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-[var(--text-muted)]">Author</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-[var(--text-muted)]">Publisher</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-[var(--text-muted)]">Total Copies</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-[var(--text-muted)]">Available</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-[var(--text-muted)]">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-[var(--text-muted)]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {filteredBooks.map((book) => {
                const availablePercentage = (book.available_copies / book.total_copies) * 100;
                const isAvailable = book.available_copies > 0;
                
                return (
                  <tr key={book.id} className="hover:bg-[var(--card-bg)]">
                    <td className="px-4 py-3 text-white">{book.title}</td>
                    <td className="px-4 py-3 text-white">{book.author}</td>
                    <td className="px-4 py-3 text-white">{book.publisher}</td>
                    <td className="px-4 py-3 text-white">{book.total_copies}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        availablePercentage >= 50 
                          ? 'bg-green-100 text-green-800'
                          : availablePercentage >= 25
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {book.available_copies} ({Math.min(100, availablePercentage).toFixed(0)}%)
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        book.status === 'Available'
                          ? 'bg-green-100 text-green-800'
                          : book.status === 'Borrowed'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {book.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(book)}
                          className="p-1 text-[var(--primary)] hover:text-[var(--primary-hover)]"
                          title="Edit book"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => book.id && handleDelete(book.id)}
                          className="p-1 text-red-500 hover:text-red-600"
                          title="Delete book"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 