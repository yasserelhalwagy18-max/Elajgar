import type {Metadata} from 'next';
import { Vazirmatn } from 'next/font/google';
import './globals.css';

const vazirmatn = Vazirmatn({ subsets: ['arabic', 'latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'Elajgar - Premium Health & Body Mapping',
  description: 'AI-powered joint and muscle health assessment, personalized exercises, and advanced tracking.',
  manifest: '/manifest.json', // Placeholder for PWA compliance 
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="fa" dir="rtl">
      <body className={`${vazirmatn.variable} font-sans antialiased bg-surface text-on-surface`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
