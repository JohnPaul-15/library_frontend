"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/context/AppProvider";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import Loading from '@/components/Loading';

interface BorrowedBook {
  id: number;
  title: string;
  author: string;
  isbn: string;
  borrowed_at: string;
  return_date: string;
  status: 'borrowed';
  borrowed_by: string;
  borrower_email: string;
}

export default function BorrowedBooksPage() {
  const { authToken, isLoading, user } = useApp();
  const router = useRouter();
  const [borrowedBooks, setBorrowedBooks] = useState<BorrowedBook[]>([]);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const initializePage = async () => {
      console.log('Initializing borrowed books page:', {
        isLoading,
        hasAuthToken: !!authToken,
        tokenLength: authToken?.length,
        hasUser: !!user,
        userRole: user?.role,
        isAdmin: user?.role === 'admin'
      });

      if (isLoading) {
        console.log('Still loading app state, waiting...');
        return;
      }

      if (!authToken) {
        console.log('No auth token found, redirecting to login');
        router.replace('/auth');
        return;
      }

      if (!user) {
        console.log('No user data found, redirecting to login');
        router.replace('/auth');
        return;
      }

      if (user.role !== 'admin') {
        console.log('User is not an admin, redirecting to dashboard');
        toast.error('Access denied. Admin privileges required.');
        router.replace('/dashboard');
        return;
      }

      setIsPageLoading(false);
      await fetchBorrowedBooks();
    };

    initializePage();
  }, [authToken, isLoading, user, router]);

  const fetchBorrowedBooks = async () => {
    // Define dummy data for testing
    const dummyBorrowedBooks: BorrowedBook[] = [
      {
        id: 101,
        title: "The Hitchhiker's Guide to the Galaxy",
        author: "Douglas Adams",
        isbn: "978-0345391803",
        borrowed_at: "2023-10-01T10:00:00Z",
        return_date: "2023-11-01T10:00:00Z", // Overdue
        status: 'borrowed',
        borrowed_by: "Arthur Dent",
        borrower_email: "arthur.dent@example.com",
      },
      {
        id: 102,
        title: "Pride and Prejudice",
        author: "Jane Austen",
        isbn: "978-0141439518",
        borrowed_at: "2024-05-10T14:30:00Z",
        return_date: "2024-06-10T14:30:00Z", // Due soon
        status: 'borrowed',
        borrowed_by: "Elizabeth Bennet",
        borrower_email: "elizabeth.b@example.com",
      },
      {
        id: 103,
        title: "1984",
        author: "George Orwell",
        isbn: "978-0451524935",
        borrowed_at: "2024-04-20T09:00:00Z",
        return_date: "2024-05-20T09:00:00Z", // Overdue
        status: 'borrowed',
        borrowed_by: "Winston Smith",
        borrower_email: "winston.s@example.com",
      },
      {
        id: 104,
        title: "To Kill a Mockingbird",
        author: "Harper Lee",
        isbn: "978-0061120084",
        borrowed_at: "2024-06-01T11:15:00Z",
        return_date: "2024-07-01T11:15:00Z", // Not due yet
        status: 'borrowed',
        borrowed_by: "Scout Finch",
        borrower_email: "scout.f@example.com",
      },
      {
        id: 105,
        title: "The Great Gatsby",
        author: "F. Scott Fitzgerald",
        isbn: "978-0743273565",
        borrowed_at: "2024-05-25T16:00:00Z",
        return_date: "2024-06-25T16:00:00Z", // Due soon
        status: 'borrowed',
        borrowed_by: "Jay Gatsby",
        borrower_email: "jay.g@example.com",
      },
    ];

    console.log('Using dummy borrowed books data.');
    setBorrowedBooks(dummyBorrowedBooks);

    // Keep the original API call commented out below for easy switching back:
    // try {
    //   const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/books/all-borrowed`;
    //   console.log('Fetching from:', apiUrl);

    //   const response = await axios.get(apiUrl, {
    //     headers: { 
    //       Authorization: `Bearer ${authToken}`,
    //       'Accept': 'application/json'
    //     },
    //     validateStatus: (status) => status < 500
    //   });

    //   console.log('API Response:', {
    //     status: response.status,
    //     data: response.data
    //   });

    //   if (response.status === 200 && response.data.success) {
    //     const transformedData = response.data.data.map((book: any) => ({
    //       id: book.id,
    //       title: book.title,
    //       author: book.author,
    //       isbn: book.isbn,
    //       status: 'borrowed',
    //       borrowed_at: book.borrowed_at,
    //       return_date: book.return_date,
    //       borrowed_by: book.borrowed_by,
    //       borrower_email: book.borrower_email
    //     }));
        
    //     setBorrowedBooks(transformedData);
    //   } else if (response.status === 401) {
    //     router.replace('/auth');
    //   } else if (response.status === 403) {
    //     toast.error('Admin access required');
    //     router.replace('/dashboard');
    //   } else {
    //     toast.error(response.data?.message || 'Failed to fetch books');
    //   }
    // } catch (error: any) {
    //   console.error('Full error:', error);
    //   if (error.response) {
    //     toast.error(error.response.data?.message || 'API request failed');
    //   } else if (error.request) {
    //     toast.error('No response from server');
    //   } else {
    //     toast.error('Request failed: ' + error.message);
    //   }
    // }
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

  if (isLoading) {
    return <Loading />;
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
                  <th className="px-4 py-3 text-left text-sm font-medium text-[var(--text-muted)]">Borrowed By</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[var(--text-muted)]">Borrower Email</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[var(--text-muted)]">Borrowed Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[var(--text-muted)]">Return Date</th>
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
                      <td className="px-4 py-3 text-white">{book.borrowed_by}</td>
                      <td className="px-4 py-3 text-white">{book.borrower_email}</td>
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
                ? "No borrowed books found matching your search."
                : "No books are currently borrowed."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 