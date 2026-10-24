import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'مدیریت محتوا',
  description: 'مدیریت مقالات، حرکات اصلاحی و ویدیوهای آموزشی',
};

export default function ContentLayout({ children }: { children: React.ReactNode }) {
  return children;
}
