import { BookOpen } from 'lucide-react';
import Loading from '@/components/Loading';

export default function Loader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
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
        <Loading fullScreen={false} />
      </div>
    </div>
  );
}