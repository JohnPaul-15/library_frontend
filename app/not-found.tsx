import { BookOpen } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-8 text-center">
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto mb-6 bg-background-lighter rounded-full flex items-center justify-center">
            <BookOpen className="w-12 h-12 text-accent-orange opacity-20" />
          </div>
          <h1 className="text-6xl font-bold text-accent-orange mb-4">404</h1>
          <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
          <p className="text-gray-400 mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/dashboard"
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            <BookOpen className="w-5 h-5" />
            Go to Dashboard
          </Link>
          <Link
            href="/"
            className="text-accent-orange hover:text-accent-yellow transition-colors"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
} 
import Link from 'next/link';
 