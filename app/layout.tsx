import type {Metadata, Viewport} from 'next';
import { Toaster } from 'react-hot-toast';
import { MotionConfig } from 'motion/react';
import { vazirmatnArabic, vazirmatnLatin } from '@/lib/fonts';
import { ServiceWorkerRegistration } from '@/components/ServiceWorkerRegistration';
import './globals.css';

const APP_TITLE = 'علاج‌گر';
const APP_DESCRIPTION = 'برنامه هوشمند ارزیابی درد و سلامت مفاصل و عضلات';

export const metadata: Metadata = {
  manifest: '/manifest.json',
  applicationName: APP_TITLE,
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  appleWebApp: {
    capable: true,
    title: APP_TITLE,
    statusBarStyle: 'default',
  },
  openGraph: {
    title: APP_TITLE,
    description: APP_DESCRIPTION,
    siteName: APP_TITLE,
    locale: 'fa_IR',
    type: 'website',
  },
};

// Next 15 wants the viewport in its own export rather than inside `metadata`.
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#2563eb',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    // The font variables go on <html>, not <body>. `--font-sans` is declared
    // in the `:root` theme block and refers to them, and a custom property
    // that refers to a variable the element does not have is invalid - so the
    // whole font stack would collapse to the browser default.
    <html
      lang="fa"
      dir="rtl"
      className={`${vazirmatnArabic.variable} ${vazirmatnLatin.variable}`}
    >
      {/* An explicit <head> keeps the title and description where crawlers and
          Lighthouse look for them. Without it Next.js streamed them into the
          end of the <body>. */}
      <head>
        <title>{APP_TITLE}</title>
        <meta name="description" content={APP_DESCRIPTION} />
      </head>
      <body className="font-sans antialiased bg-surface text-on-surface" suppressHydrationWarning>
        {/* `reducedMotion="user"` makes every `motion` animation in the app -
            the wizard's step slides, the dialogs, the health-score count-up -
            respect the operating system's "reduce motion" setting. The global
            CSS rule in `globals.css` cannot do this: Motion drives opacity
            and transform from JavaScript, not from a CSS animation, so the
            `animation-duration: 0.001ms` override never reaches it. */}
        <MotionConfig reducedMotion="user">
          {/* The first Tab press on every page lands here, so a keyboard user
              can jump straight past the navigation to the page content. */}
          <a href="#main-content" className="skip-link">
            پرش به محتوای اصلی
          </a>
          {/* A single `main` landmark per page - screen reader users rely on
              it to jump past the navigation. */}
          <main id="main-content" tabIndex={-1}>{children}</main>
        </MotionConfig>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: '#fff',
              color: '#0f1722',
              borderRadius: '16px',
              border: '1px solid #e2e8f0'
            }
          }}
        />
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
