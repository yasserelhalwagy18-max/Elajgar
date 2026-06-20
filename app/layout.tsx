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
    <html lang="fa" dir="rtl" className={vazirmatn.variable}>
      <body className="font-sans antialiased bg-surface text-on-surface" suppressHydrationWarning>
        <div className="ambient-blob bg-primary-fixed w-96 h-96 top-[-10%] left-[-10%]"></div>
        <div className="ambient-blob bg-secondary-container w-80 h-80 top-[40%] right-[-20%]"></div>
        <div className="ambient-blob bg-primary opacity-20 w-[500px] h-[500px] bottom-[-10%] left-[20%]"></div>
        {children}
      </body>
    </html>
  );
}
