'use client';

import { useEffect } from 'react';
import { AlertCircle, RefreshCcw } from 'lucide-react';
import * as Sentry from '@sentry/nextjs';

/*
 * The mailto the landing footer and the profile page use, so every failure
 * path funnels into the same support inbox.
 */
const SUPPORT_HREF_BASE =
  'mailto:support@elajgar.com?subject=%D8%B3%D8%B1%D8%A7%D8%B3%D8%AA%20%D9%BE%D8%B4%D8%AA%D8%A8%D8%B4%D8%A7%D9%86%DB%8C%20%D8%B9%D9%84%D8%A7%D8%AC%DA%AF%D8%B1';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to Sentry
    Sentry.captureException(error);
    // Log the error to console securely
    console.error('Application Error:', error);
  }, [error]);

  // The digest lets support find the exact Sentry event - only included
  // when the runtime produced one.
  const supportHref = error.digest
    ? `${SUPPORT_HREF_BASE}&body=${encodeURIComponent(`کد خطا: ${error.digest}`)}`
    : SUPPORT_HREF_BASE;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card p-10 rounded-3xl max-w-md w-full text-center flex flex-col items-center">
        <div className="bg-error/10 p-6 rounded-full mb-6">
          <AlertCircle className="w-16 h-16 text-error" aria-hidden="true" />
        </div>

        <h2 className="text-3xl font-bold text-on-surface mb-4">مشکلی پیش آمد!</h2>
        <p className="text-on-surface-variant mb-8 text-lg">
          متاسفانه در بارگذاری این بخش خطایی رخ داده است. لطفا دوباره تلاش کنید.
        </p>

        <button
          type="button"
          onClick={() => reset()}
          className="btn btn-primary w-full py-3 px-6"
        >
          <RefreshCcw className="w-5 h-5" />
          <span>تلاش مجدد</span>
        </button>

        {/* When the retry loops, a human must be reachable from here - the
            mailto carries the error digest so support can match it. */}
        <a
          href={supportHref}
          className="btn btn-secondary w-full py-3 px-6 mt-3"
        >
          رابطه با پشتیبانی
        </a>
      </div>
    </div>
  );
}
