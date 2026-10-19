'use client';

import Error from './error';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Note: `./error` already reports the exception to Sentry, and Sentry's own
  // error-boundary integration captures it as well. Capturing it a third time
  // here produced duplicate events.

  return (
    <html lang="fa" dir="rtl">
      {/* The app's font and background classes live on the root layout's
          <body>; reproduce them here so the error page does not fall back to
          the browser defaults. */}
      <body className="vazirmatn.variable font-sans antialiased bg-surface text-on-surface">
        <Error error={error} reset={reset} />
      </body>
    </html>
  );
}
