import type {Metadata, Viewport} from 'next';
import { Vazirmatn } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import './globals.css';

const vazirmatn = Vazirmatn({ subsets: ['arabic', 'latin'], variable: '--font-sans' });

const APP_TITLE = 'علاج‌گر';
const APP_DESCRIPTION = 'برنامه هوشمند ارزیابی درد و سلامت مفاصل و عضلات';

export const metadata: Metadata = {
  manifest: '/manifest.json',
  applicationName: APP_TITLE,
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
    <html lang="fa" dir="rtl">
      {/* An explicit <head> keeps the title and description where crawlers and
          Lighthouse look for them. Without it Next.js streamed them into the
          end of the <body>. */}
      <head>
        <title>{APP_TITLE}</title>
        <meta name="description" content={APP_DESCRIPTION} />
      </head>
      <body className={`${vazirmatn.variable} font-sans antialiased bg-surface text-on-surface`} suppressHydrationWarning>
        {/* A single `main` landmark per page - screen reader users rely on
            it to jump past the navigation. */}
        <main id="main-content">{children}</main>
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
      </body>
    </html>
  );
}
