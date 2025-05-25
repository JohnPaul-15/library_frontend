"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/context/AppProvider";
import axios from "axios";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import Loading from '@/components/Loading';

interface Book {
  id: number;
  title: string;
  author: string;
  isbn: string;
  status: 'available' | 'borrowed';
  borrowed_by?: number;
  borrowed_at?: string;
  return_date?: string;
}

export default function BooksPage() {
  const { authToken, user } = useApp();
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<'all' | 'available' | 'borrowed'>('all');

  useEffect(() => {
    fetchBooks();
  }, [authToken]);

  const fetchBooks = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/books`,
        {
          headers: { Authorization: `Bearer ${authToken}` }
        }
      );
      setBooks(response.data.data || []);
    } catch (error) {
      console.error('Error fetching books:', error);
      toast.error('Failed to fetch books');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBorrow = async (bookId: number) => {
    try {
      const result = await Swal.fire({
        title: 'Confirm Borrow',
        text: 'Are you sure you want to borrow this book?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes, borrow it',
        cancelButtonText: 'No, cancel',
        confirmButtonColor: 'var(--primary)',
        cancelButtonColor: 'var(--danger)',
      });

      if (result.isConfirmed) {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/books/${bookId}/borrow`,
          {},
          {
            headers: { Authorization: `Bearer ${authToken}` }
          }
        );

        if (response.data.success) {
          toast.success('Book borrowed successfully!');
          fetchBooks(); // Refresh the book list
        }
      }
    } catch (error: any) {
      console.error('Error borrowing book:', error);
      toast.error(error.response?.data?.message || 'Failed to borrow book');
    }
  };

  const handleReturn = async (bookId: number) => {
    try {
      const result = await Swal.fire({
        title: 'Confirm Return',
        text: 'Are you sure you want to return this book?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes, return it',
        cancelButtonText: 'No, cancel',
        confirmButtonColor: 'var(--primary)',
        cancelButtonColor: 'var(--danger)',
      });

      if (result.isConfirmed) {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/books/${bookId}/return`,
          {},
          {
            headers: { Authorization: `Bearer ${authToken}` }
          }
        );

        if (response.data.success) {
          toast.success('Book returned successfully!');
          fetchBooks(); // Refresh the book list
        }
      }
    } catch (error: any) {
      console.error('Error returning book:', error);
      toast.error(error.response?.data?.message || 'Failed to return book');
    }
  };

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         book.isbn.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' ||
                         (filterStatus === 'available' && book.status === 'available') ||
                         (filterStatus === 'borrowed' && book.status === 'borrowed');

    return matchesSearch && matchesFilter;
  });

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Books</h1>
      </div>

      {/* Search and Filter */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by title, author, or ISBN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 bg-[var(--input-bg)] border border-[var(--border-color)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-white"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | 'available' | 'borrowed')}
              className="px-4 py-2 bg-[var(--input-bg)] border border-[var(--border-color)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-white"
            >
              <option value="all">All Books</option>
              <option value="available">Available</option>
              <option value="borrowed">Borrowed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Books Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBooks.map((book) => (
          <div
            key={book.id}
            className="card hover:border-[var(--primary)] transition-colors"
          >
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white">{book.title}</h3>
                <p className="text-sm text-[var(--text-muted)] mt-1">{book.author}</p>
                <p className="text-xs text-[var(--text-muted)] mt-2">ISBN: {book.isbn}</p>
              </div>

              <div className="flex items-center justify-between">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    book.status === 'available'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {book.status === 'available' ? 'Available' : 'Borrowed'}
                </span>

                {book.status === 'available' ? (
                  <button
                    onClick={() => handleBorrow(book.id)}
                    className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary-hover)] transition-colors"
                  >
                    Borrow
                  </button>
                ) : book.borrowed_by === user?.id ? (
                  <button
                    onClick={() => handleReturn(book.id)}
                    className="px-4 py-2 bg-[var(--danger)] text-white rounded-lg hover:bg-[var(--danger-hover)] transition-colors"
                  >
                    Return
                  </button>
                ) : (
                  <button
                    disabled
                    className="px-4 py-2 bg-[var(--text-muted)] text-white rounded-lg cursor-not-allowed"
                  >
                    Unavailable
                  </button>
                )}
              </div>

              {book.status === 'borrowed' && book.borrowed_at && (
                <div className="text-sm text-[var(--text-muted)]">
                  <p>Borrowed: {new Date(book.borrowed_at).toLocaleDateString()}</p>
                  {book.return_date && (
                    <p>Return by: {new Date(book.return_date).toLocaleDateString()}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredBooks.length === 0 && (
        <div className="text-center py-8">
          <p className="text-[var(--text-muted)]">No books found matching your criteria.</p>
        </div>
      )}
    </div>
  );
} 