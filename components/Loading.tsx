import { BookOpen } from 'lucide-react';

interface LoadingProps {
  fullScreen?: boolean;
}

export default function Loading({ fullScreen = true }: LoadingProps) {
  return (
    <div className={`${fullScreen ? 'min-h-screen' : ''} flex items-center justify-center bg-background`}>
      <div className="w-full max-w-md p-8 text-center">
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto mb-6 bg-background-lighter rounded-full flex items-center justify-center animate-pulse">
            <BookOpen className="w-12 h-12 text-accent-orange opacity-20" />
          </div>
          <h1 className="text-2xl font-bold text-accent-orange mb-4">Loading...</h1>
          <p className="text-gray-400">
            Please wait while we load your content.
          </p>
        </div>

        {/* Loading Animation */}
        <div className="flex justify-center space-x-2">
          <div className="w-3 h-3 bg-accent-orange rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-3 h-3 bg-accent-yellow rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-3 h-3 bg-accent-orange rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
} 