"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/context/AppProvider";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

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

interface BorrowedBook extends Book {
  borrowed_at: string;
  return_date: string;
}

export default function UserDashboard() {
  const { authToken, user } = useApp();
  const [borrowedBooks, setBorrowedBooks] = useState<BorrowedBook[]>([]);
  const [availableBooks, setAvailableBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalBooks, setTotalBooks] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        // Fetch total books
        const totalResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/books`,
          {
            headers: { Authorization: `Bearer ${authToken}` }
          }
        );
        setTotalBooks(totalResponse.data.data?.length || 0);

        // Fetch borrowed books
        const borrowedResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/user/borrowed`,
          {
            headers: { Authorization: `Bearer ${authToken}` }
          }
        );
        setBorrowedBooks(borrowedResponse.data.data || []);

        // Fetch available books
        const availableResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/user/available`,
          {
            headers: { Authorization: `Bearer ${authToken}` }
          }
        );
        setAvailableBooks(availableResponse.data.data || []);
      } catch (error) {
        console.error('Error fetching books:', error);
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 401) {
            toast.error('Session expired. Please login again.');
            router.replace('/auth');
          } else {
            toast.error(error.response?.data?.message || 'Failed to fetch books');
          }
        } else {
          toast.error('Failed to fetch books');
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (authToken) {
      fetchBooks();
    }
  }, [authToken]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--primary)]"></div>
        <p className="text-[var(--text-muted)]">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Welcome, {user?.name}!</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card bg-gradient-to-br from-purple-500 to-purple-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-100">Total Books</p>
              <h2 className="text-3xl font-bold text-white mt-1">
                {totalBooks}
              </h2>
            </div>
            <div className="p-3 bg-purple-400 bg-opacity-30 rounded-full">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-blue-500 to-blue-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-100">Currently Borrowed</p>
              <h2 className="text-3xl font-bold text-white mt-1">
                {borrowedBooks.length}
              </h2>
            </div>
            <div className="p-3 bg-blue-400 bg-opacity-30 rounded-full">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Borrowed Books Section */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Currently Borrowed Books</h2>
        {borrowedBooks.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border-color)]">
                  <th className="px-4 py-3 text-left text-sm font-medium text-[var(--text-muted)]">Title</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[var(--text-muted)]">Author</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[var(--text-muted)]">Borrowed Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[var(--text-muted)]">Return Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {borrowedBooks.map((book) => (
                  <tr key={book.id} className="hover:bg-[var(--card-bg)]">
                    <td className="px-4 py-3 text-white">{book.title}</td>
                    <td className="px-4 py-3 text-white">{book.author}</td>
                    <td className="px-4 py-3 text-white">
                      {new Date(book.borrowed_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-white">
                      {new Date(book.return_date).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-[var(--text-muted)]">You haven't borrowed any books yet.</p>
        )}
      </div>

      {/* Available Books Preview */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Available Books</h2>
          <a
            href="/user-dashboard/books"
            className="text-[var(--primary)] hover:text-[var(--primary-hover)]"
          >
            View All
          </a>
        </div>
        {availableBooks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableBooks.slice(0, 6).map((book) => (
              <div
                key={book.id}
                className="p-4 bg-[var(--card-bg)] rounded-lg border border-[var(--border-color)] hover:border-[var(--primary)] transition-colors"
              >
                <h3 className="font-medium text-white">{book.title}</h3>
                <p className="text-sm text-[var(--text-muted)] mt-1">{book.author}</p>
                <p className="text-xs text-[var(--text-muted)] mt-2">ISBN: {book.isbn}</p>
                <div className="mt-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Available
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[var(--text-muted)]">No books are currently available.</p>
        )}
      </div>
    </div>
  );
} 