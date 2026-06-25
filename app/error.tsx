'use client'; // Error components must be Client Components

import { useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-surface">
      <div className="bg-error/10 p-4 rounded-full mb-6">
        <AlertCircle className="w-16 h-16 text-error" />
      </div>
      <h2 className="text-2xl font-bold text-on-surface mb-2">مشکلی پیش آمد</h2>
      <p className="text-on-surface/70 mb-8 text-center max-w-sm">
        متأسفانه در بارگذاری این صفحه خطایی رخ داد. لطفاً دوباره تلاش کنید.
      </p>
      <button
        onClick={
          // Attempt to recover by trying to re-render the segment
          () => reset()
        }
        className="bg-primary text-on-primary py-3 px-8 rounded-2xl font-medium hover:opacity-90 transition-opacity"
      >
        تلاش مجدد
      </button>
    </div>
  );
}
