import type {Metadata, Viewport} from 'next';
import { Toaster } from 'react-hot-toast';
import { vazirmatnArabic, vazirmatnLatin } from '@/lib/fonts';
import { ServiceWorkerRegistration } from '@/components/ServiceWorkerRegistration';
import './globals.css';

const APP_TITLE = 'علاجگر';
const APP_DESCRIPTION = 'برنامه هوشمند ارزیابی درد و سلامت مفاصل و عضلات';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://elajgar.ir'),
  manifest: '/manifest.json',
  applicationName: APP_TITLE,
  title: {
    default: APP_TITLE,
    template: `%s | ${APP_TITLE}`,
  },
  description: APP_DESCRIPTION,
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  appleWebApp: {
    capable: true,
    title: APP_TITLE,
    statusBarStyle: 'default',
  },
  openGraph: {
    title: {
      default: APP_TITLE,
      template: `%s | ${APP_TITLE}`,
    },
    description: APP_DESCRIPTION,
    siteName: APP_TITLE,
    locale: 'fa_IR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: {
      default: APP_TITLE,
      template: `%s | ${APP_TITLE}`,
    },
    description: APP_DESCRIPTION,
  },
};

// Next 15 wants the viewport in its own export rather than inside `metadata`.
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#2563eb' },
    { media: '(prefers-color-scheme: dark)', color: '#0b1120' },
  ],
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
      <body className="font-sans antialiased bg-surface text-on-surface" suppressHydrationWarning>
        {/* A single `main` landmark per page - screen reader users rely on
            it to jump past the navigation. */}
        <main id="main-content">{children}</main>
        <Toaster
          position="bottom-center"
          containerStyle={{
            bottom: 'calc(5.5rem + env(safe-area-inset-bottom, 0px))',
          }}
          toastOptions={{
            className: 'font-sans card',
            style: {
              fontFamily: 'var(--font-sans)',
              direction: 'rtl',
              background: 'var(--color-surface-container)',
              color: 'var(--color-on-surface)',
              borderRadius: 'var(--radius-3xl)',
              border: '1px solid var(--color-outline-variant)',
              boxShadow: 'var(--shadow-floating)',
              padding: '12px 18px',
              fontSize: 'var(--text-body)',
              fontWeight: 500,
            },
            success: {
              iconTheme: {
                primary: 'var(--color-success, #15803d)',
                secondary: 'var(--color-on-success, #ffffff)',
              },
            },
            error: {
              iconTheme: {
                primary: 'var(--color-error, #dc2626)',
                secondary: 'var(--color-on-error, #ffffff)',
              },
            },
            loading: {
              iconTheme: {
                primary: 'var(--color-primary, #1d4ed8)',
                secondary: 'var(--color-primary-container, #eff3ff)',
              },
            },
            blank: {
              iconTheme: {
                primary: 'var(--color-warning, #c2410c)',
                secondary: 'var(--color-on-warning, #ffffff)',
              },
            },
          }}
        />
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
