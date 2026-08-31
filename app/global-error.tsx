'use client';

import * as Sentry from '@sentry/nextjs';
import Error from './error';
import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="fa" dir="rtl">
      <body>
        <Error error={error} reset={reset} />
      </body>
    </html>
  );
}
