"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/context/AppProvider";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

interface BorrowedBook {
  id: number;
  title: string;
  author: string;
  isbn: string;
  borrowed_at: string;
  return_date: string;
  status: 'borrowed';
}

export default function BorrowedBooksPage() {
  const { authToken, isLoading, user } = useApp();
  const router = useRouter();
  const [borrowedBooks, setBorrowedBooks] = useState<BorrowedBook[]>([]);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const initializePage = async () => {
      if (isLoading) {
        return;
      }

      if (!authToken) {
        console.log('No auth token, redirecting to login');
        router.replace('/auth');
        return;
      }

      if (!user) {
        console.log('No user data, redirecting to login');
        router.replace('/auth');
        return;
      }

      setIsPageLoading(false);
      await fetchBorrowedBooks();
    };

    initializePage();
  }, [authToken, isLoading, user, router]);

  const fetchBorrowedBooks = async () => {
    console.log('Fetching borrowed books...', {
      hasToken: !!authToken,
      tokenLength: authToken?.length,
      tokenPreview: authToken ? `${authToken.substring(0, 20)}...` : null,
      apiUrl: `${process.env.NEXT_PUBLIC_API_URL}/books/borrowed`
    });

    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/books/borrowed`,
        {
          headers: { 
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      console.log('Borrowed books response:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data,
        headers: response.headers
      });

      if (response.data.success && Array.isArray(response.data.data)) {
        setBorrowedBooks(response.data.data);
      } else if (response.data.message === "Record not found.") {
        setBorrowedBooks([]);
      } else {
        console.warn('Unexpected response format:', response.data);
        setBorrowedBooks([]);
      }
    } catch (error) {
      console.error('Error fetching borrowed books:', {
        error,
        isAxiosError: axios.isAxiosError(error),
        status: axios.isAxiosError(error) ? error.response?.status : 'N/A',
        statusText: axios.isAxiosError(error) ? error.response?.statusText : 'N/A',
        responseData: axios.isAxiosError(error) ? error.response?.data : 'N/A',
        headers: axios.isAxiosError(error) ? error.response?.headers : 'N/A'
      });
      
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          console.log('Unauthorized access, redirecting to login');
          router.replace('/auth');
          return;
        }
        
        if (error.response?.status === 404) {
          console.log('No borrowed books found');
          setBorrowedBooks([]);
          return;
        }
        
        toast.error(error.response?.data?.message || 'Failed to fetch borrowed books');
      } else {
        toast.error('An unexpected error occurred');
      }
      
      setBorrowedBooks([]);
    } finally {
      setIsPageLoading(false);
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
          fetchBorrowedBooks(); // Refresh the borrowed books list
        }
      }
    } catch (error: any) {
      console.error('Error returning book:', error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          router.replace('/auth');
        } else {
          toast.error(error.response?.data?.message || 'Failed to return book');
        }
      } else {
        toast.error('Failed to return book');
      }
    }
  };

  const filteredBooks = borrowedBooks.filter(book =>
    book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.isbn.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading || isPageLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--primary)]"></div>
        <p className="text-[var(--text-muted)]">
          {isLoading ? 'Loading application...' : 'Fetching your borrowed books...'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">My Borrowed Books</h1>
      </div>

      {/* Search */}
      <div className="card">
        <input
          type="text"
          placeholder="Search by title, author, or ISBN..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 bg-[var(--input-bg)] border border-[var(--border-color)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-white"
        />
      </div>

      {/* Borrowed Books List */}
      <div className="card">
        {filteredBooks.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border-color)]">
                  <th className="px-4 py-3 text-left text-sm font-medium text-[var(--text-muted)]">Title</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[var(--text-muted)]">Author</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[var(--text-muted)]">ISBN</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[var(--text-muted)]">Borrowed Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[var(--text-muted)]">Return Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[var(--text-muted)]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {filteredBooks.map((book) => {
                  const returnDate = new Date(book.return_date);
                  const isOverdue = returnDate < new Date();
                  
                  return (
                    <tr key={book.id} className="hover:bg-[var(--card-bg)]">
                      <td className="px-4 py-3 text-white">{book.title}</td>
                      <td className="px-4 py-3 text-white">{book.author}</td>
                      <td className="px-4 py-3 text-white">{book.isbn}</td>
                      <td className="px-4 py-3 text-white">
                        {new Date(book.borrowed_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            isOverdue
                              ? 'bg-red-100 text-red-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {returnDate.toLocaleDateString()}
                          {isOverdue && ' (Overdue)'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleReturn(book.id)}
                          className="px-4 py-2 bg-[var(--danger)] text-white rounded-lg hover:bg-[var(--danger-hover)] transition-colors"
                        >
                          Return
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-[var(--text-muted)]">
              {searchQuery 
                ? 'No books match your search criteria'
                : 'You have no borrowed books at the moment'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 