"use client";

import { useApp } from "@/context/AppProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Loading from '@/components/Loading';

export default function UserDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAdmin, isLoading, logout } = useApp();
  const router = useRouter();
  const [isPageLoading, setIsPageLoading] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.replace("/auth");
      } else if (isAdmin) {
        router.replace("/dashboard");
      } else {
        setIsPageLoading(false);
      }
    }
  }, [isLoading, user, isAdmin, router]);

  const handleLogout = () => {
    logout();
    router.replace('/auth');
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="flex h-screen bg-[var(--background)]">
      {/* Sidebar */}
      <div className="w-64 bg-[var(--card-bg)] border-r border-[var(--border-color)] flex flex-col">
        <div className="p-4 border-b border-[var(--border-color)]">
          <h1 className="text-xl font-bold text-white">Library Portal</h1>
          <p className="text-sm text-[var(--text-muted)]">User Dashboard</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <Link
            href="/user-dashboard"
            className="flex items-center px-4 py-2 text-[var(--text-muted)] hover:bg-[var(--primary)] hover:text-white rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Dashboard
          </Link>

          <Link
            href="/user-dashboard/books"
            className="flex items-center px-4 py-2 text-[var(--text-muted)] hover:bg-[var(--primary)] hover:text-white rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Browse Books
          </Link>

          <Link
            href="/user-dashboard/borrowed"
            className="flex items-center px-4 py-2 text-[var(--text-muted)] hover:bg-[var(--primary)] hover:text-white rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            My Borrowed Books
          </Link>
        </nav>

        <div className="p-4 border-t border-[var(--border-color)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-[var(--text-muted)] truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm text-red-500 hover:text-red-600 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
} 