'use client';

import { vazirmatnArabic, vazirmatnLatin } from '@/lib/fonts';
import Error from './error';
import './globals.css';

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

  // A global error page replaces the root layout entirely, so `./globals.css`
  // has to be imported explicitly - nothing else pulls it in and the utility
  // classes below would render unstyled. The font variables go on <html>,
  // exactly like the root layout: `--font-sans` is declared in the `:root`
  // theme block and refers to them, and a custom property that refers to a
  // variable the element does not have is invalid - so the font stack would
  // collapse to the browser default. (The old `vazirmatn.variable` class
  // named a variable that no longer exists - the two font loaders each
  // declare their own.)
  return (
    <html
      lang="fa"
      dir="rtl"
      className={`${vazirmatnArabic.variable} ${vazirmatnLatin.variable}`}
    >
      <body className="font-sans antialiased bg-surface text-on-surface">
        <Error error={error} reset={reset} />
      </body>
    </html>
  );
}
