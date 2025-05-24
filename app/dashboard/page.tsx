"use client";
import { useEffect, useState } from 'react';
import { useApp } from '@/context/AppProvider';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';
import Swal from "sweetalert2";

interface BookType {
  id?: number;
  title: string;
  author: string;
  publisher: string;
  availability: string;
}

interface DashboardStats {
  totalBooks: number;
  totalUsers: number;
  availableBooks: number;
  borrowedBooks: number;
}

export default function Dashboard() {
  const { isLoading, authToken } = useApp();
  const router = useRouter();
  const [books, setBooks] = useState<BookType[]>([]); // State to hold the list of books
  const [isEdit, setIsEdit] = useState(false);
  const [formData, setFormData] = useState<BookType>({
    id: undefined,
    title: "",
    author: "",
    publisher: "",
    availability: "Available", // Set a default value
  });
  const [stats, setStats] = useState<DashboardStats>({
    totalBooks: 0,
    totalUsers: 0,
    availableBooks: 0,
    borrowedBooks: 0,
  });

  //page load when authToken is available 
  useEffect(() => {
    if (!authToken && !isLoading) {
      router.push('/auth');
      return; // Exit early if no auth token
    }

    if (authToken) { // Only fetch if we have a token
      fetchAllBooks();
    }
  }, [authToken, isLoading, router]);

  useEffect(() => {
    // TODO: Replace with actual API call
    // This is mock data for demonstration
    setStats({
      totalBooks: 1250,
      totalUsers: 450,
      availableBooks: 980,
      borrowedBooks: 270,
    });
  }, []);

  //On change form input
  const handleOnChangeEvent = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

 const fetchAllBooks = async () => {
    if (!authToken) {
      setBooks([]);
      return [];
    }

    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/books`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          }
        }
      );
      
      console.log('Raw API response:', response.data); // Debug log
      
      // Handle different possible response formats
      let booksData;
      if (Array.isArray(response.data)) {
        booksData = response.data;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        booksData = response.data.data;
      } else if (response.data.books && Array.isArray(response.data.books)) {
        booksData = response.data.books;
      } else {
        booksData = [];
        console.warn('Unexpected API response format:', response.data);
      }
      
      console.log('Processed books data:', booksData); // Debug log
      setBooks(booksData);
      return booksData;
    } catch (error: any) {
      console.error('Error fetching books:', error);
      if (error.response?.status === 401) {
        router.push('/auth');
      }
      setBooks([]);
      return [];
    }
  };

  // Update the resetForm function to use the same default values
  const resetForm = () => {
    setFormData({
      id: undefined,
      title: "",
      author: "",
      publisher: "",
      availability: "Available", // Use the same default value
    });
  };

  // Update the edit button click handler
  const handleEditClick = (singleBook: BookType) => {
    setFormData({
      id: singleBook.id,
      title: singleBook.title,
      author: singleBook.author,
      publisher: singleBook.publisher,
      availability: singleBook.availability || 'Available',
    });
    setIsEdit(true);
  };

  const handleDeleteBook = async (id: number) => {
    try {
      const result = await Swal.fire({ 
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!"
      });

      if (result.isConfirmed) {
        await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/books/${id}`, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        
        setBooks(books.filter(book => book.id !== id));
        Swal.fire("Deleted!", "Book has been deleted.", "success");
      }
    } catch (error: any) {
      console.error("Delete error:", error);
      Swal.fire("Error!", "Failed to delete book.", "error");
    }
  };

  //form subbimission 
  const handleFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
  
    try {
      const bookData = {
        title: formData.title,
        author: formData.author,
        publisher: formData.publisher,
        availability: formData.availability || "Available",
      };
  
      let response;
      if (formData.id) {
        // UPDATE REQUEST (PUT/PATCH)
        response = await axios.put(
          `${process.env.NEXT_PUBLIC_API_URL}/books/${formData.id}`,
          bookData,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
          }
        );
      } else {
        // CREATE REQUEST (POST)
        response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/books`,
          bookData,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
          }
        );
      }
  
      if (response.data) {
        toast.success(formData.id ? "Book updated!" : "Book added!");
        resetForm();
        await fetchAllBooks(); // Refresh the list
      }
    } catch (error: any) {
      console.error("Error:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Failed to save book.");
    }
  };

  const availabilityPercentage = (stats.availableBooks / stats.totalBooks) * 100;

  return (
    <div className="space-y-8">
      {/* Banner Section */}
      <div className="card bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white">
        <div className="flex items-center justify-between">
          <div className="space-y-4">
            <h1 className="text-3xl font-bold">Welcome to Your Library Dashboard</h1>
            <p className="text-white/80 max-w-2xl">
              Manage your library resources efficiently with our modern dashboard. Track books, users, and borrowing activities all in one place.
            </p>
            <button className="btn-primary bg-white text-[var(--primary)] hover:bg-white/90">
              Learn More
            </button>
          </div>
          <div className="hidden lg:block">
            <svg className="w-48 h-48 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Books Card */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[var(--text-muted)] text-sm font-medium">Total Books</p>
              <h3 className="text-2xl font-bold mt-1">{stats.totalBooks}</h3>
            </div>
            <div className="p-3 rounded-full bg-[var(--primary)]/10">
              <svg className="w-6 h-6 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          </div>
        </div>

        {/* Total Users Card */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[var(--text-muted)] text-sm font-medium">Total Users</p>
              <h3 className="text-2xl font-bold mt-1">{stats.totalUsers}</h3>
            </div>
            <div className="p-3 rounded-full bg-[var(--secondary)]/10">
              <svg className="w-6 h-6 text-[var(--secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Available Books Card */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[var(--text-muted)] text-sm font-medium">Available Books</p>
              <h3 className="text-2xl font-bold mt-1">{stats.availableBooks}</h3>
            </div>
            <div className="p-3 rounded-full bg-green-500/10">
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Borrowed Books Card */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[var(--text-muted)] text-sm font-medium">Borrowed Books</p>
              <h3 className="text-2xl font-bold mt-1">{stats.borrowedBooks}</h3>
            </div>
            <div className="p-3 rounded-full bg-blue-500/10">
              <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Availability Progress */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Book Availability</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-[var(--text-muted)]">Available Books</span>
            <span className="font-medium">{availabilityPercentage.toFixed(1)}%</span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-bar-fill"
              style={{ width: `${availabilityPercentage}%` }}
            />
          </div>
          <p className="text-sm text-[var(--text-muted)] mt-2">
            {stats.availableBooks} out of {stats.totalBooks} books are currently available
          </p>
        </div>
      </div>
    </div>
  );
}