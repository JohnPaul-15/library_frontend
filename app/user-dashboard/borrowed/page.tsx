"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/context/AppProvider";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Loading from '@/components/Loading';

interface BorrowedBook {
  id: number;
  title: string;
  author: string;
  isbn: string;
  borrowed_at: string;
  return_date: string;
  returned_at?: string;
}

export default function BorrowedBooks() {
  const { authToken, user } = useApp();
  const [borrowedBooks, setBorrowedBooks] = useState<BorrowedBook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchBorrowedBooks = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/user/borrowed`,
          {
            headers: { 
              Authorization: `Bearer ${authToken}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          }
        );
        setBorrowedBooks(response.data.data || []);
      } catch (error) {
        console.error('Error fetching borrowed books:', error);
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 401) {
            toast.error('Session expired. Please login again.');
            router.replace('/auth');
          } else {
            toast.error(error.response?.data?.message || 'Failed to fetch borrowed books');
          }
        } else {
          toast.error('Failed to fetch borrowed books');
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (authToken) {
      fetchBorrowedBooks();
    }
  }, [authToken, router]);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Borrowed Books</h1>
      </div>

      <div className="card">
        {borrowedBooks.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border-color)]">
                  <th className="px-4 py-3 text-left text-sm font-medium text-[var(--text-muted)]">Title</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[var(--text-muted)]">Author</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[var(--text-muted)]">ISBN</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[var(--text-muted)]">Borrowed Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[var(--text-muted)]">Due Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[var(--text-muted)]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {borrowedBooks.map((book) => (
                  <tr key={book.id} className="hover:bg-[var(--card-bg)]">
                    <td className="px-4 py-3 text-white">{book.title}</td>
                    <td className="px-4 py-3 text-white">{book.author}</td>
                    <td className="px-4 py-3 text-white">{book.isbn}</td>
                    <td className="px-4 py-3 text-white">
                      {new Date(book.borrowed_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-white">
                      {new Date(book.return_date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        book.returned_at 
                          ? 'bg-green-100 text-green-800'
                          : new Date(book.return_date) < new Date()
                          ? 'bg-red-100 text-red-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {book.returned_at 
                          ? 'Returned'
                          : new Date(book.return_date) < new Date()
                          ? 'Overdue'
                          : 'Active'}
                      </span>
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
    </div>
  );
} 