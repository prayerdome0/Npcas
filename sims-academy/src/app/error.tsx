'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { AlertCircle, Home, RefreshCw } from 'lucide-react';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="h-10 w-10 text-red-600" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Error</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Something Went Wrong</h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          {error.message || 'An unexpected error occurred. Please try again.'}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={() => reset()} size="lg">
            <RefreshCw className="h-5 w-5 mr-2" />
            Try Again
          </Button>
          <Link href="/">
            <Button variant="outline" size="lg">
              <Home className="h-5 w-5 mr-2" />
              Go Home
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
