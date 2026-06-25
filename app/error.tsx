'use client';

import { useEffect } from 'react';
import { AlertCircle, RefreshCcw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service securely
    console.error('Application Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-panel p-10 rounded-3xl max-w-md w-full text-center flex flex-col items-center">
        <div className="bg-error/10 p-6 rounded-full mb-6">
          <AlertCircle className="w-16 h-16 text-error" />
        </div>

        <h2 className="text-3xl font-bold text-on-surface mb-4">مشکلی پیش آمد!</h2>
        <p className="text-on-surface-variant mb-8 text-lg">
          متاسفانه در بارگذاری این بخش خطایی رخ داده است. لطفا دوباره تلاش کنید.
        </p>

        <button
          onClick={() => reset()}
          className="btn-primary-glass w-full py-3 px-6 rounded-xl flex items-center justify-center gap-2"
        >
          <RefreshCcw className="w-5 h-5" />
          <span>تلاش مجدد</span>
        </button>
      </div>
    </div>
  );
}
