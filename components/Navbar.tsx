"use client";

import Link from 'next/link';
// Update the import to match the actual exported hook name from AppProvider
import { useApp } from '@/context/AppProvider';

  export default function Navbar() {
  const { logout, authToken, isLoading } = useApp();
  /*const { logout, authToken, isLoading } = useAppContext();
  const { logout, authToken, isLoading } = myAppHook();*/

  if (isLoading) {
    return (
      <nav className="bg-blue-600 text-white">
        <div className="container mx-auto px-4 h-16 flex items-center justify-center">
          <div className="text-xl font-bold">Loading...</div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-blue-600 text-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <Link href="/" className="text-xl font-bold">
            Library Management System
          </Link>

          {/* Mobile menu button */}
          <button
            className="md:hidden rounded-md p-2 text-white hover:bg-blue-700 focus:outline-none"
            aria-label="Toggle menu"
          >
            <svg
              className="h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-4">
            {authToken ? (
              <>
                <Link
                  href="/dashboard"
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  Dashboard
                </Link>
                <button 
                  onClick={logout}
                  className="ml-2 px-3 py-2 rounded-md text-sm font-medium bg-red-600 hover:bg-red-700"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/"
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  Home
                </Link>
                <Link
                  href="/auth"
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  Login
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile menu (hidden by default) */}
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {authToken ? (
              <>
                <Link
                  href="/dashboard"
                  className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700"
                >
                  Dashboard
                </Link>
                <button 
                  onClick={logout}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium bg-red-600 hover:bg-red-700"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/"
                  className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700"
                >
                  Home
                </Link>
                <Link
                  href="/auth"
                  className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700"
                >
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}