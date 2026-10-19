import type {Metadata, Viewport} from 'next';
import { Vazirmatn } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import './globals.css';

const vazirmatn = Vazirmatn({ subsets: ['arabic', 'latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'علاجگر',
  description: 'علاجگر.برای سلامت شما',
  manifest: '/manifest.json',
  openGraph: {
    title: 'علاجگر',
    description: 'علاجگر.برای سلامت شما',
    siteName: 'علاجگر',
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
      <body className={`${vazirmatn.variable} font-sans antialiased bg-surface text-on-surface`} suppressHydrationWarning>
        {children}
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
